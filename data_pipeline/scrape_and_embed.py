import re
import os
import time
import requests
import argparse
from bs4 import BeautifulSoup
from sentence_transformers import SentenceTransformer
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
model = SentenceTransformer('all-MiniLM-L6-v2')

def normalize_key(k):
    """Normalize metadata keys: 'Review Date:' -> 'review_date'"""
    return k.lower().replace(':', '').replace(' ', '_').strip()

def clean_text(text):
    """Remove junk patterns from extracted text"""
    if not text: return ""
    junk_patterns = [
        r'Roaster Location:.*', r'Coffee Origin:.*', r'Roast Level:.*', 
        r'Agtron:.*', r'Review Date:.*', r'Aroma:.*', r'Acidity:.*', 
        r'Body:.*', r'Flavor:.*', r'Aftertaste:.*', r'Blind Assessment:?',
        r'Notes:?', r'Who Should Drink It:?', r'Explore Similar.*', r'Bottom Line:?'
    ]
    cleaned = text
    for p in junk_patterns:
        cleaned = re.sub(p, '', cleaned, flags=re.IGNORECASE)
    return cleaned.strip()

def scrape_review(url):
    print(f"Scraping {url}...")
    headers = {'User-Agent': 'Mozilla/5.0 (compatible; BrewIntelligence/2.0)'}
    try:
        res = requests.get(url, headers=headers)
        if res.status_code != 200: return None
        soup = BeautifulSoup(res.content, 'html.parser')
        
        # === 1. METADATA FROM TABLES (there are multiple tables) ===
        meta = {}
        tables = soup.select('.review-template-table')  # Get ALL tables, not just first
        for table in tables:
            for row in table.find_all('tr'):
                tds = row.find_all('td')
                if len(tds) >= 2:
                    raw_key = tds[0].get_text(strip=True)
                    raw_val = tds[1].get_text(strip=True)
                    # Normalize key
                    key = normalize_key(raw_key)
                    # Clean value (remove leaked labels)
                    val = re.sub(r'Review Date.*', '', raw_val, flags=re.I).strip()
                    meta[key] = val

        # === 2. RATING (High Precision) ===
        rating = 0
        rating_el = soup.select_one('.review-template-rating')
        if rating_el:
            m = re.search(r'(\d+)', rating_el.get_text())
            if m: rating = int(m.group(1))
        
        if rating == 0:
            # Fallback: Look for big number at start
            content_txt = soup.get_text()
            m = re.search(r'(\d{2})\s*\n+\s*[A-Z]', content_txt)
            if m: rating = int(m.group(1))

        # === 3. ROASTER PARSING ===
        title_full = soup.title.string if soup.title else ""
        roaster = meta.get('roaster', 'Unknown')
        if roaster == "Unknown" and " by " in title_full:
            roaster = title_full.split(" by ")[1].split(" Review")[0].strip()

        # === 4. PRICE PARSING (handles multiple label formats) ===
        price = meta.get('price') or meta.get('est._price') or meta.get('est_price') or 'N/A'
        if price == "N/A" or not price or "Review Date" in price:
            p_match = re.search(r'\$\d+\.\d+(?:\s*/\s*[\w\s]+)?', soup.get_text())
            if p_match: price = p_match.group(0).strip()
        price = re.sub(r'Review Date.*', '', price, flags=re.I).strip()

        # === 5. EXTRACT TEXT SECTIONS ===
        def extract_section(header_text):
            h = soup.find(['h2', 'strong', 'p'], string=re.compile(header_text, re.I))
            if not h: return ""
            content = []
            curr = h.find_next()
            while curr and curr.name not in ['h1', 'h2', 'table']:
                if curr.name == 'p':
                    txt = curr.get_text(strip=True)
                    if any(x in txt for x in ["Notes", "Who Should Drink", "Explore Similar", "Bottom Line"]): 
                        break
                    content.append(txt)
                curr = curr.find_next()
            return ' '.join(content)

        blind_assessment = clean_text(extract_section("Blind Assessment"))
        notes = clean_text(extract_section("Notes"))
        bottom_line = clean_text(extract_section("Bottom Line"))
        with_milk = clean_text(extract_section("With Milk"))  # For espresso reviews

        # === 6. METRIC SCORES (from metadata) ===
        def get_int(key):
            val = meta.get(key, '0')
            m = re.search(r'(\d+)', str(val))
            return int(m.group(1)) if m else 0

        # === BUILD DATA DICT ===
        data = {
            "title": soup.select_one('h1').get_text(strip=True) if soup.select_one('h1') else "Unknown",
            "roaster": roaster,
            "roaster_location": meta.get('roaster_location', meta.get('roaster', 'Unknown')),
            "roast_level": meta.get('roast_level', 'Unknown'),
            "agtron": meta.get('agtron', 'N/A'),
            "origin": meta.get('coffee_origin', meta.get('origin', 'Unknown')),
            "price": price if price else 'N/A',
            "review_date": meta.get('review_date', 'Unknown'),
            "rating": rating,
            "blind_assessment": blind_assessment,
            "notes": notes,
            "bottom_line": bottom_line,
            "with_milk": with_milk if with_milk else None,
            "url": url,
        }
        
        # Store trimmed HTML for future re-parsing
        entry_content = soup.select_one('.entry-content')
        data["raw_content"] = str(entry_content) if entry_content else None
        
        data["aroma"] = get_int('aroma')
        data["acidity"] = get_int('acidity/structure') or get_int('acidity')  # Handle both labels
        data["body"] = get_int('body')
        data["flavor"] = get_int('flavor')
        data["aftertaste"] = get_int('aftertaste')

        return data
    except Exception as e:
        print(f"Error scraping {url}: {e}")
        return None

def process_batch(urls):
    for url in urls:
        data = scrape_review(url)
        if data:
            # Generate embedding from title + blind assessment + notes
            embed_text = f"{data['title']} {data['blind_assessment']} {data.get('notes', '')}"
            data['embedding'] = model.encode(embed_text).tolist()
            try:
                # DEBUG: Print full data dict
                print(f"  --- DEBUG DATA ---")
                for k, v in data.items():
                    if k != 'embedding':
                        display = v[:80] + '...' if isinstance(v, str) and len(v) > 80 else v
                        print(f"    {k}: {display}")
                print(f"  --- END DEBUG ---")
                
                supabase.table('reviews').upsert(data, on_conflict='url').execute()
                print(f"  ✅ Synced: {data['title']} | Score: {data['rating']} | Price: {data['price']}")
            except Exception as e:
                print(f"  ❌ DB Error: {e}")
        time.sleep(1)  # 1 second delay between requests

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--limit', type=int, default=10, help='Number of URLs to process')
    parser.add_argument('--offset', type=int, default=0, help='Skip first N URLs (for resuming)')
    parser.add_argument('--skip-existing', action='store_true', help='Skip URLs already in database')
    args = parser.parse_args()
    
    with open('data_pipeline/urls.txt', 'r') as f:
        urls = [l.strip() for l in f if l.strip()]
    urls.reverse()  # Start from newest
    
    # Apply offset
    if args.offset > 0:
        print(f"⏭️  Skipping first {args.offset} URLs...")
        urls = urls[args.offset:]
    
    # Apply limit
    urls = urls[:args.limit]
    
    # Skip existing URLs if flag is set
    if args.skip_existing:
        print("🔍 Checking database for existing URLs...")
        try:
            existing = supabase.table('reviews').select('url').execute()
            existing_urls = {r['url'] for r in existing.data}
            before = len(urls)
            urls = [u for u in urls if u not in existing_urls]
            print(f"   Filtered: {before} → {len(urls)} (skipping {before - len(urls)} existing)")
        except Exception as e:
            print(f"   ⚠️  Could not check existing: {e}")
    
    print(f"\n📦 Processing {len(urls)} URLs...\n")
    process_batch(urls)
    print(f"\n✨ Done! Processed {len(urls)} reviews.")

if __name__ == "__main__":
    main()
