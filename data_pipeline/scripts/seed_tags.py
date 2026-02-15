
import os
from supabase import create_client

# Define the SCAA Taxonomy (same as in llm_tagger.py)
FLAVOR_TAXONOMY = {
    "Fruity": [
        "Berry", "Blueberry", "Strawberry", "Raspberry", "Cherry", 
        "Citrus", "Lemon", "Lime", "Orange", "Grapefruit",
        "Stone Fruit", "Peach", "Apricot", "Nectarine",
        "Tropical", "Mango", "Pineapple", "Papaya", "Passion Fruit",
        "Grape", "Apple", "Pear", "Melon", "Dried Fruit", "Raisin", "Fig", "Prune"
    ],
    "Sweet": [
        "Chocolate", "Dark Chocolate", "Milk Chocolate", "Cocoa",
        "Caramel", "Toffee", "Molasses", "Brown Sugar", "Honey", "Maple Syrup",
        "Vanilla", "Marshmallow", "Creamy", "Butter"
    ],
    "Nutty": [
        "Nutty", "Almond", "Hazelnut", "Peanut", "Walnut", "Pecan"
    ],
    "Floral": [
        "Floral", "Jasmine", "Rose", "Chamomile", "Lavender", "Hibiscus", "Elderflower"
    ],
    "Spice": [
        "Spice", "Cinnamon", "Clove", "Nutmeg", "Ginger", "Cardamom", "Pepper",
        "Herbal", "Tea-like", "Black Tea", "Green Tea", "Bergamot",
        "Savory", "Tomato", "Olive", "Mushroom"
    ],
    "Roasted": [
        "Roasted", "Smoky", "Tobacco", "Leather", "Earth", "Woody", "Grain", "Cereal",
        "Fermented", "Winey", "Whiskey", "Boozy"
    ]
}

# Load env manually
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

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ Error: Missing keys")
    exit(1)

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def seed_tags():
    print("🧹 Wiping existing tags...")
    try:
        # Delete all tags. Cascade will handle review_tags.
        supabase.table('tags').delete().neq('name', 'PLACEHOLDER_FOR_ALL').execute()
    except Exception as e:
        print(f"⚠️ Error wiping tags (might be empty): {e}")

    print("🌱 Seeding tags table with SCAA Taxonomy...")
    
    count = 0
    for category, tags in FLAVOR_TAXONOMY.items():
        print(f"  Processing category: {category}...")
        for tag_name in tags:
            payload = {
                "name": tag_name,
                "category": category
            }
            try:
                # Upsert to avoid duplicates
                supabase.table('tags').upsert(payload, on_conflict="name").execute()
                count += 1
            except Exception as e:
                print(f"    ⚠️ Error upserting {tag_name}: {e}")
                
    print(f"✅ Successfully seeded {count} tags.")

if __name__ == "__main__":
    seed_tags()
