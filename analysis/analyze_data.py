import pandas as pd
import os

def analyze_csv(file_path):
    print(f"--- Analyzing {os.path.basename(file_path)} ---")
    try:
        df = pd.read_csv(file_path)
        print(f"Rows: {df.shape[0]}, Columns: {df.shape[1]}")
        print("\nColumn Info:")
        print(df.info())
        print("\nMissing Values:")
        print(df.isnull().sum())
        print("\nDuplicates:", df.duplicated().sum())
        
        print("\nSummary Statistics (Numeric):")
        print(df.describe())
        
        # Check for non-numeric prices if '100g_USD' exists
        if '100g_USD' in df.columns:
             # Try to force numeric to find errors
             non_numeric = df[pd.to_numeric(df['100g_USD'], errors='coerce').isna()]
             if not non_numeric.empty:
                 print("\nNon-numeric values in '100g_USD':")
                 print(non_numeric['100g_USD'].unique())

        print("\nFirst 3 rows:")
        print(df.head(3))
        print("-" * 30 + "\n")
        
    except Exception as e:
        print(f"Error analyzing {file_path}: {e}")

if __name__ == "__main__":
    base_dir = "archive"
    files = ["coffee_analysis.csv", "simplified_coffee.csv"]
    
    for f in files:
        path = os.path.join(base_dir, f)
        if os.path.exists(path):
            analyze_csv(path)
        else:
            print(f"File not found: {path}")
