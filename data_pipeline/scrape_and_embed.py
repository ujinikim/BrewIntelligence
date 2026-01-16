import re
import os
import time
import requests
from bs4 import BeautifulSoup
from sentence_transformers import SentenceTransformer
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("Error: SUPABASE_URL and SUPABASE_KEY must be set in .env")
    exit(1)

# Initialize Supabase
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Initialize Embedding Model (all-MiniLM-L6-v2 is fast and efficient)
print("Loading Embedding Model...")
model = SentenceTransformer('all-MiniLM-L6-v2')

def extract_metric(text, pattern, type_func=str):
    """Helper to extract data using regex"""
    match = re.search(pattern, text, re.IGNORECASE)
    if match:
        try:
            return type_func(match.group(1).strip())
        except:
            return None
    return None

def scrape_review(url):
    print(f"Scraping {url}...")
    headers = {'User-Agent': 'Mozilla/5.0 (compatible; BrewIntelligence/1.0)'}
    
    try:
        response = requests.get(url, headers=headers)
        if response.status_code == 404: return None
        
        soup = BeautifulSoup(response.content, 'html.parser')
        full_text = soup.get_text() # Get raw text for regex fallback

        # 1. Base Info
        title_el = soup.select_one('h1.entry-title, h1.review-title')
        title = title_el.get_text(strip=True) if title_el else "Unknown Coffee"
        
        # 2. Extract specific fields using Selectors (More reliable than text)
        roaster = "Unknown"
        rating = 0
        price = "N/A"
        origin = "Unknown"
        roast_level = "Unknown"
        agtron = "N/A"
        review_date = "Unknown"
        roaster_location = "Unknown"
        
        if rating == 0:
             # Try standard selector if regex didn't fire yet (rare but possible)
             pass

        # 3. Detailed Scores & Metadata (REGEX PRIMARY)
        # We prioritize Regex for flexible text parsing over rigid HTML structure
        
        # Rating / Title / Roaster
        legacy_matches = re.finditer(
            r'(?P<rating>\d{2})\s*\n+\s*(?P<roaster>[^\n]+)\s*\n+\s*(?P<title>[^\n]+)', 
            full_text
        )
        
        cleaned_soup_title = title.lower().replace('review', '').strip()
        
        for m in legacy_matches:
            cand_title = m.group('title').strip()
            cand_rating = int(m.group('rating'))
            
            # Fuzzy match validation
            if (cleaned_soup_title in cand_title.lower()) or (cand_title.lower() in cleaned_soup_title):
                rating = cand_rating
                if roaster == "Unknown": roaster = m.group('roaster').strip()
                # break matching loop if we found the review in text
                break 

        # Metric Patterns
        aroma = extract_metric(full_text, r'Aroma:\s*(\d+)', int) or 0
        acidity = extract_metric(full_text, r'Acidity:\s*(\d+)', int) or 0
        body = extract_metric(full_text, r'Body:\s*(\d+)', int) or 0
        flavor = extract_metric(full_text, r'Flavor:\s*(\d+)', int) or 0
        aftertaste = extract_metric(full_text, r'Aftertaste:\s*(\d+)', int) or 0
        
        # Metadata Patterns (Overwrite HTML table if needed or found in text)
        price_match = re.search(r'Price:\s*(.+)', full_text, re.IGNORECASE)
        if price_match: price = price_match.group(1).strip()
        elif not price_match and price == "N/A":
             curr_match = re.search(r'\$\d+\.\d+', full_text)
             if curr_match: price = curr_match.group(0)

        date_match = re.search(r'Review Date:\s*(.+)', full_text, re.IGNORECASE)
        if date_match: review_date = date_match.group(1).strip()

        agtron_match = re.search(r'Agtron:\s*(.+)', full_text, re.IGNORECASE)
        if agtron_match: agtron = agtron_match.group(1).strip()
        
        roast_match = re.search(r'Roast Level:\s*(.+)', full_text, re.IGNORECASE)
        if roast_match: roast_level = roast_match.group(1).strip()

        origin_match = re.search(r'Origin:\s*(.+)', full_text, re.IGNORECASE)
        if origin_match: origin = origin_match.group(1).strip()

        loc_match = re.search(r'Roaster Location:\s*(.+)', full_text, re.IGNORECASE)
        if loc_match: roaster_location = loc_match.group(1).strip()

        # 4. Blind Assessment (The "Vibe")
        blind_assessment = ""
        assessment_el = soup.find(string=re.compile("Blind Assessment"))
        if assessment_el:
            parent = assessment_el.parent
            # Text might be in the parent's next sibling or same block, logic varies
            blind_assessment = parent.find_next_sibling(text=True) or parent.get_text()
            blind_assessment = blind_assessment.replace("Blind Assessment:", "").strip()
        
        if not blind_assessment or len(blind_assessment) < 10:
             # Fallback to description meta tag or content div
             content_div = soup.select_one('.entry-content, .review-content')
             if content_div:
                 blind_assessment = content_div.get_text(strip=True)[:1000]

        return {
            "title": title,
            "roaster": roaster,
            "roaster_location": roaster_location,
            "roast_level": roast_level,
            "origin": origin,
            "agtron": agtron,
            "price": price,
            "review_date": review_date,
            "rating": rating,
            "aroma": aroma,
            "acidity": acidity,
            "body": body,
            "flavor": flavor,
            "aftertaste": aftertaste,
            "blind_assessment": blind_assessment,
            "url": url
        }

    except Exception as e:
        print(f"Failed to scrape {url}: {e}")
        return None

def process_batch(urls):
    for url in urls:
        data = scrape_review(url)
        if data and data['blind_assessment']:
            # Richer Embedding Context
            text_to_embed = (
                f"{data['title']} by {data['roaster']}. "
                f"Roast: {data['roast_level']}. "
                f"Flavor Profile: {data['blind_assessment']} "
                f"Notes: Aroma {data['aroma']}, Acidity {data['acidity']}, Body {data['body']}."
            )
            embedding = model.encode(text_to_embed).tolist()
            data['embedding'] = embedding
            
            try:
                # Upsert to Supabase
                supabase.table('reviews').upsert(data, on_conflict='url').execute()
                print(f"Saved: {data['title']} (Score: {data['rating']})")
            except Exception as e:
                print(f"DB Error: {e}")
        
        time.sleep(2)

def main():
    file_path = os.path.join('data_pipeline', 'urls.txt')
    if not os.path.exists(file_path):
        print(f"{file_path} not found. Run fetch_sitemap.py first.")
        return

    with open(file_path, 'r') as f:
        urls = [line.strip() for line in f if line.strip()]

    # --- TESTING MODE ---
    # By default, run only 5 to verify the pipeline. 
    # Set to 0 or remove limit for full run.
    TEST_LIMIT = 5 
    print(f"🧪 TEST MODE: Processing first {TEST_LIMIT} URLs only. Change TEST_LIMIT in script to run full batch.")
    
    if TEST_LIMIT > 0:
        urls = urls[:TEST_LIMIT]

    process_batch(urls)

if __name__ == "__main__":
    main()
