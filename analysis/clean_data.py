import pandas as pd
import os

def clean_data():
    input_path = 'archive/coffee_analysis.csv'
    output_path = 'cleaned_coffee.csv'  # Will move to src/data later
    
    print(f"Reading {input_path}...")
    df = pd.read_csv(input_path)
    
    # 1. Merge Description Columns
    print("Merging description columns...")
    df['desc_1'] = df['desc_1'].fillna('')
    df['desc_2'] = df['desc_2'].fillna('')
    df['desc_3'] = df['desc_3'].fillna('')
    df['review'] = (df['desc_1'] + " " + df['desc_2'] + " " + df['desc_3']).str.strip()
    
    # 2. Merge Origin Columns
    print("Merging origin columns...")
    df['origin_1'] = df['origin_1'].fillna('')
    df['origin_2'] = df['origin_2'].fillna('')
    df['origin'] = df.apply(
        lambda row: f"{row['origin_1']}, {row['origin_2']}" if row['origin_2'] else row['origin_1'], 
        axis=1
    )
    
    # 3. Handle Roast
    # Fill missing roasts with "Unknown"
    df['roast'] = df['roast'].fillna('Unknown')
    
    # 4. Filter Columns
    cols_to_keep = ['name', 'roaster', 'roast', 'loc_country', 'origin', '100g_USD', 'rating', 'review_date', 'review']
    df_clean = df[cols_to_keep].copy()
    
    # 5. Drop rows with missing essential info (name, price, rating)
    # Based on earlier analysis, these were 0, but good to be safe
    df_clean = df_clean.dropna(subset=['name', '100g_USD', 'rating'])
    
    print(f"Cleaned dataset shape: {df_clean.shape}")
    
    df_clean.to_csv(output_path, index=False)
    print(f"Saved cleaned data to {output_path}")

if __name__ == "__main__":
    clean_data()
