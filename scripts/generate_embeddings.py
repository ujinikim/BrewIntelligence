import pandas as pd
import json
import os
from sentence_transformers import SentenceTransformer

# Paths
INPUT_CSV = 'web/src/app/coffee_data_scored.csv' # Using the scored data if available, or fallback
# Note: In previous steps we might have saved it to src/data or src/app. checking...
# Let's check where the data actually resides.
# Based on previous context, user moved data to app directory.
# Let me double check file existence in valid paths first, or I will use a safe relative path logic.

def generate_embeddings():
    # 1. Load Data
    # Try different potential locations for the CSV
    possible_paths = [
        'web/src/app/coffee_data.csv',
        'web/src/data/coffee_data.csv',
        'web/src/utils/coffee_data.csv'
    ]
    
    df = None
    for path in possible_paths:
        if os.path.exists(path):
            print(f"Found data at: {path}")
            df = pd.read_csv(path)
            break
            
    if df is None:
        print("Error: Could not find coffee_data.csv")
        return

    # 2. Load Model
    # We use all-MiniLM-L6-v2 because it's small and compatible with transformers.js
    print("Loading Model (all-MiniLM-L6-v2)...")
    model = SentenceTransformer('all-MiniLM-L6-v2')

    # 3. Prepare Text
    # We want to embed the most descriptive parts.
    # Format: "Name: [Name]. Description: [Desc]. Roast: [Roast]"
    print("Preparing text...")
    df['embed_text'] = df.apply(lambda x: f"Coffee: {x['name']}. Flavor Notes: {x['review']}. Roast: {x['roast']}", axis=1)
    
    # 4. Generate Embeddings
    print("Generating Embeddings (this may take a minute)...")
    embeddings = model.encode(df['embed_text'].tolist(), show_progress_bar=True)

    # 5. Create Output Dictionary
    # Map: { "Bean_Name_Slug": [0.1, 0.2, ...], ... }
    # Using row index or slug as key. Let's use name for now or index if names aren't unique.
    # Ideally we'd have a stable ID. Let's use the unique index.
    
    embedding_map = []
    
    for idx, row in df.iterrows():
        embedding_map.append({
            "id": idx, # Simple numeric ID matching the CSV row order
            "name": row['name'],
            "vector": embeddings[idx].tolist()
        })

    # 6. Save to JSON
    output_path = 'web/src/app/api/search/embeddings.json' # Save directly next to the API route
    
    # Ensure directory exists
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    with open(output_path, 'w') as f:
        json.dump(embedding_map, f)
        
    print(f"Success! Saved {len(embedding_map)} embeddings to {output_path}")

if __name__ == "__main__":
    generate_embeddings()
