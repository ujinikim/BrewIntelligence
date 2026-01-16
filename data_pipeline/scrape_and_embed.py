import re
import os
import time
import requests
import csv
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

def clean_text(text):
    if not text: return ""
    # Standard labels to strip
    junk_patterns = [
        r'Roaster Location:.*', r'Coffee Origin:.*', r'Roast Level:.*', 
        r'Agtron:.*', r'Review Date:.*', r'Aroma:.*', r'Acidity:.*', 
        r'Body:.*', r'Flavor:.*', r'Aftertaste:.*', r'Blind Assessment:?',
        r'Notes:?', r'Who Should Drink It:?', r'Explore Similar.*'
    ]
    cleaned = text
    for p in junk_patterns:
        cleaned = re.sub(p, '', cleaned, flags=re.IGNORECASE)
    
    # Remove leading ratings/junk like "94RoasterName"
    cleaned = re.sub(r'^\d{2}[A-Z][a-z]+.*?(?=[A-Z])', '', cleaned)
    return cleaned.strip()

def scrape_review(url):
    print(f"Scraping {url}...")
    headers = {'User-Agent': 'Mozilla/5.0 (compatible; BrewIntelligence/1.8)'}
    try:
        res = requests.get(url, headers=headers)
        if res.status_code != 200: return None
        soup = BeautifulSoup(res.content, 'html.parser')
        
        # 1. Metadata from Table
        meta = {}
        table = soup.select_one('.review-template-table')
        if table:
            for row in table.find_all('tr'):
                tds = row.find_all('td')
                if len(tds) >= 2:
                    k = tds[0].get_text(strip=True).lower().replace(':', '')
                    v = tds[1].get_text(strip=True)
                    # Clean "Review Date" label from value if it leaked in
                    v = re.sub(r'Review Date.*', '', v, flags=re.I).strip()
                    meta[k] = v

        # 2. Rating (High Precision)
        rating = 0
        rating_el = soup.select_one('.review-template-rating')
        if rating_el:
            rating = int(re.search(r'(\d+)', rating_el.get_text()).group(1))
        
        if rating == 0:
            # Fallback: Look for the big number at the start of content
            content_txt = soup.get_text()
            m = re.search(r'(\d{2})\s*\n+\s*[A-Z]', content_txt)
            if m: rating = int(m.group(1))

        # 3. Roaster Parsing
        title_full = soup.title.string if soup.title else ""
        roaster = meta.get('roaster', 'Unknown')
        if roaster == "Unknown" and " by " in title_full:
            roaster = title_full.split(" by ")[1].split(" Review")[0].strip()

        # 4. Price Parsing (Clean)
        price = meta.get('price', 'N/A')
        if price == "N/A" or not price or "Review Date" in price:
            p_match = re.search(r'\$\d+\.\d+(?:\s*/\s*[\w\s]+)?', soup.get_text())
            if p_match: price = p_match.group(0).strip()
        
        # Final price cleanup
        price = re.sub(r'Review Date.*', '', price, flags=re.I).strip()

        data = {
            "title": soup.select_one('h1').get_text(strip=True) if soup.select_one('h1') else "Unknown",
            "roaster": roaster,
            "roaster_location": meta.get('roaster location', 'Unknown'),
            "roast_level": meta.get('roast level', 'Unknown'),
            "origin": meta.get('coffee origin', 'Unknown'),
            "price": price,
            "review_date": meta.get('review date', 'Unknown'),
            "rating": rating,
            "url": url,
            "blind_assessment": "",
            "notes": ""
        }

        # 5. Content Sections (Improved)
        def extract_section(header_text):
            h = soup.find(['h2', 'strong', 'p'], string=re.compile(header_text, re.I))
            if not h: return ""
            content = []
            curr = h.find_next()
            while curr and curr.name not in ['h1', 'h2', 'table']:
                # Stop if we hit another main header or a table
                if curr.name == 'p':
                    txt = curr.get_text(strip=True)
                    # Don't cross into other sections
                    if any(x in txt for x in ["Notes", "Who Should Drink", "Explore Similar"]): break
                    content.append(txt)
                curr = curr.find_next()
            return ' '.join(content)

        data["blind_assessment"] = clean_text(extract_section("Blind Assessment"))
        data["notes"] = clean_text(extract_section("Notes"))

        # Score Fallbacks (Aroma, Acidity, etc)
        def get_score(label):
            el = soup.find(string=re.compile(f"{label}:", re.I))
            if el:
                m = re.search(r'(\d+)', el.parent.get_text())
                if m: return int(m.group(1))
            return 0

        data["aroma"] = get_score("Aroma")
        data["acidity"] = get_score("Acidity")
        data["body"] = get_score("Body")
        data["flavor"] = get_score("Flavor")
        data["aftertaste"] = get_score("Aftertaste")

        return data
    except Exception as e:
        print(f"Error scraping {url}: {e}")
        return None

def process_batch(urls):
    for url in urls:
        data = scrape_review(url)
        if data:
            txt = f"{data['title']} {data['blind_assessment']}"
            data['embedding'] = model.encode(txt).tolist()
            try:
                supabase.table('reviews').upsert(data, on_conflict='url').execute()
                print(f"  Synced: {data['title']} | Score: {data['rating']} | Price: {data['price']}")
            except Exception as e:
                print(f"  DB Error: {e}")
        time.sleep(0.5)

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--limit', type=int, default=10)
    args = parser.parse_args()
    with open('data_pipeline/urls.txt', 'r') as f:
        urls = [l.strip() for l in f if l.strip()]
    urls.reverse()
    process_batch(urls[:args.limit])

if __name__ == "__main__":
    main()
