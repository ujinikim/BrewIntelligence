
import os
import json
import time
from supabase import create_client
from openai import OpenAI

# ─── 1. Env Setup (Manual) ────────────────────────────────────────────────────
# Load keys manually to avoid dependency hell
env_path = os.path.join(os.path.dirname(__file__), '../.env')
if os.path.exists(env_path):
    with open(env_path, 'r') as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith('#') or '=' not in line: continue
            k, v = line.split('=', 1)
            os.environ[k.strip()] = v.strip().strip("'").strip('"')

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

if not SUPABASE_URL or not SUPABASE_KEY or not OPENAI_API_KEY:
    print("❌ Error: Missing keys in data_pipeline/.env")
    exit(1)

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
client = OpenAI(api_key=OPENAI_API_KEY)


# ─── 2. Configuration ─────────────────────────────────────────────────────────
BATCH_SIZE = 5
MODEL = "gpt-4o-mini"

# Based on SCAA Flavor Wheel & Common Descriptors
FLAVOR_TAXONOMY = [
    # Fruity
    "Berry", "Blueberry", "Strawberry", "Raspberry", "Cherry", 
    "Citrus", "Lemon", "Lime", "Orange", "Grapefruit",
    "Stone Fruit", "Peach", "Apricot", "Nectarine",
    "Tropical", "Mango", "Pineapple", "Papaya", "Passion Fruit",
    "Grape", "Apple", "Pear", "Melon", "Dried Fruit", "Raisin", "Fig", "Prune",
    
    # Sweet / Sugary
    "Chocolate", "Dark Chocolate", "Milk Chocolate", "Cocoa",
    "Caramel", "Toffee", "Molasses", "Brown Sugar", "Honey", "Maple Syrup",
    "Vanilla", "Marshmallow", "Creamy", "Butter",
    
    # Nutty
    "Nutty", "Almond", "Hazelnut", "Peanut", "Walnut", "Pecan",
    
    # Floral
    "Floral", "Jasmine", "Rose", "Chamomile", "Lavender", "Hibiscus", "Elderflower",
    
    # Spice / Savory
    "Spice", "Cinnamon", "Clove", "Nutmeg", "Ginger", "Cardamom", "Pepper",
    "Herbal", "Tea-like", "Black Tea", "Green Tea", "Bergamot",
    "Savory", "Tomato", "Olive", "Mushroom",
    
    # Roast / Other
    "Roasted", "Smoky", "Tobacco", "Leather", "Earth", "Woody", "Grain", "Cereal",
    "Fermented", "Winey", "Whiskey", "Boozy"
]

SYSTEM_PROMPT = f"""
You are a Coffee Sensory Expert (Q Grader).
Your task is to classify the coffee reviews into structured data using a STRICT PREDEFINED TAXONOMY.
Extract structured metadata in JSON format.

1. **Flavor Mapping**:
   - You must ONLY use tags from the provided `FLAVOR_TAXONOMY` list below.
   - **fuzzy match** specific descriptors to the general tags in the list.
   - Example: "Black Cherry" -> Map to "Cherry".
   - Example: "Candied Lemon Zest" -> Map to "Lemon" and "Sweet".
   - Example: "Wild Maine Blueberries" -> Map to "Blueberry".
   - Select 3-6 tags that best describe the coffee.

2. **Vibes (Inferred)**:
   - You may still generate "Vibe" tags freely (e.g., "Cozy", "Complex", "Summer") as these represent feelings, not flavors.
   - Limit Vibes to 1-2 tags maximum.

3. **Constraints**:
   - ⛔️ NEVER invent new flavor tags.
   - ⛔️ NEVER tag varietals (Java, Gesha) or Origins (Ethiopia).

**FLAVOR_TAXONOMY**:
{json.dumps(FLAVOR_TAXONOMY)}

Output Schema:
{{
  "tags": [
    {{ "name": "Blueberry", "category": "Fruity", "confidence": 1.0, "source": "wild maine blueberries" }},
    {{ "name": "Cozy", "category": "Vibe", "confidence": 0.8, "source": "perfect for a rainy day" }}
  ]
}}
"""

# ─── 3. Functions ─────────────────────────────────────────────────────────────

def fetch_untagged_reviews(limit=5):
    # Find reviews that do NOT have an entry in review_tags
    # This is a bit tricky with simple Supabase queries, so we'll fetch reviews
    # and check if they have tags locally, or use a "not.in" if possible.
    # For now, let's just fetch recent reviews and process them (upsert handles duplicates).
    
    # Actually, let's fetch reviews and check.
    # To be smarter, let's just grab the latest 10 reviews for testing.
    response = supabase.table('reviews').select("id, title, roaster, body, flavor, acidity, aftertaste").order("created_at", desc=True).limit(limit).execute()
    return response.data

def analyze_review(review):
    text = f"""
    Title: {review['title']}
    Roaster: {review['roaster']}
    Flavor Notes: {review.get('flavor') or 'N/A'}
    Body: {review.get('body') or ''}
    Acidity: {review.get('acidity') or ''}
    Review Text:
    {review['body']}
    """
    
    try:
        completion = client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": text}
            ],
            response_format={"type": "json_object"}
        )
        content = completion.choices[0].message.content
        return json.loads(content)
    except Exception as e:
        print(f"  ❌ LLM Error: {e}")
        return None

def save_tags(review_id, data):
    if not data or 'tags' not in data:
        return

    for item in data['tags']:
        # 1. Ensure Tag Exists
        # We need to upsert the tag first to get its ID
        # Supabase upsert returns the row
        tag_payload = {
            "name": item['name'], 
            "category": item['category']
        }
        res = supabase.table('tags').upsert(tag_payload, on_conflict="name").execute()
        
        if not res.data:
            continue
            
        tag_id = res.data[0]['id']
        
        # 2. Link Review to Tag
        link_payload = {
            "review_id": review_id,
            "tag_id": tag_id,
            "confidence": item.get('confidence', 0.5),
            "is_inferred": item.get('is_inferred', False),
            "source_snippet": item.get('source', '')
        }
        supabase.table('review_tags').upsert(link_payload, on_conflict="review_id, tag_id").execute()

# ─── 4. Main Loop ─────────────────────────────────────────────────────────────

def main():
    print(f"🤖 Starting LLM Tagger ({MODEL})...")
    reviews = fetch_untagged_reviews(BATCH_SIZE)
    print(f"📥 Fetched {len(reviews)} reviews for processing.")
    
    total_cost = 0
    
    for i, r in enumerate(reviews):
        print(f"\nProcessing [{i+1}/{len(reviews)}]: {r['title']}...", end="", flush=True)
        
        start = time.time()
        analysis = analyze_review(r)
        
        if analysis:
            save_tags(r['id'], analysis)
            duration = time.time() - start
            tags_str = ", ".join([t['name'] for t in analysis['tags'][:3]])
            print(f" ✅ Done ({duration:.1f}s)")
            print(f"    -> Found: {tags_str}")
        else:
            print(" ⚠️ Failed")
            
    print("\n✨ Batch complete.")

if __name__ == "__main__":
    main()
