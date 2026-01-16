import json
import numpy as np
import sys
from sentence_transformers import SentenceTransformer
import pandas as pd

# Load the embeddings (Simulating the API's Knowledge Base)
EMBEDDINGS_PATH = 'web/src/app/api/search/embeddings.json'
DATA_PATH = 'web/src/data/coffee_data.csv'

# Test Queries to evaluate
QUERIES = [
    "warm and cozy",
    "bright and fruity morning",
    "dark roast for espresso",
    "weird and funky",
    "chocolate bomb",
    "smooth and nutty",
    "floral tea like"
]

def cosine_similarity(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

def run_benchmark():
    print(f"--- Loading embeddings from {EMBEDDINGS_PATH} ---")
    with open(EMBEDDINGS_PATH, 'r') as f:
        embedding_map = json.load(f)
    
    # We need the original text to see WHY it matched
    # We can rely on the 'name' in embedding_map, but let's load CSV for full review text if needed
    # actually embedding_map has 'id', we can create a lookup
    df = pd.read_csv(DATA_PATH)
    
    print("--- Loading Model for Query Encoding ---")
    # Note: We use the Python version here, API uses JS version. 
    # They are mathematically identical for the same model weights.
    model = SentenceTransformer('all-MiniLM-L6-v2')
    
    print("\n--- STARTING BENCHMARK ---\n")
    
    for query in QUERIES:
        print(f"🔎 QUERY: '{query}'")
        query_vec = model.encode(query)
        
        # Calculate scores
        results = []
        for item in embedding_map:
            score = cosine_similarity(query_vec, item['vector'])
            results.append({
                'score': score,
                'name': item['name'],
                'id': item['id']
            })
            
        # Sort and Top 3
        results.sort(key=lambda x: x['score'], reverse=True)
        top_3 = results[:3]
        
        for i, res in enumerate(top_3):
            # Get full details from DF
            bean = df.iloc[res['id']]
            # snippets of review
            review = str(bean['review'])
            snippet = review[:100] + "..." if len(review) > 100 else review
            
            print(f"   {i+1}. [{res['score']:.4f}] {res['name']}")
            print(f"      Context: {bean['roast']} | {snippet}")
        print("-" * 60)

if __name__ == "__main__":
    run_benchmark()
