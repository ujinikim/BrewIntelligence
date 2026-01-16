
import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
import os

def calculate_value_score():
    # Define paths
    input_path = os.path.join(os.getcwd(), 'web/src/data/coffee_data.csv')
    output_path = os.path.join(os.getcwd(), 'web/src/data/coffee_data_scored.csv')

    print(f"Reading data from: {input_path}")
    
    try:
        df = pd.read_csv(input_path)
    except FileNotFoundError:
        print(f"Error: Could not find input file at {input_path}")
        return

    # Basic cleaning check
    print(f"Initial rows: {len(df)}")
    
    # Ensure relevant columns are numeric
    df['100g_USD'] = pd.to_numeric(df['100g_USD'], errors='coerce')
    df['rating'] = pd.to_numeric(df['rating'], errors='coerce')
    
    # Drop rows with missing price or rating for the regression training
    # (We can keep them in the final output, but they won't have a score)
    train_data = df.dropna(subset=['100g_USD', 'rating'])
    print(f"Rows for training: {len(train_data)}")

    # Prepare features (X) and target (y)
    X = train_data[['100g_USD']].values  # Reshape for sklearn
    y = train_data['rating'].values

    # Train Linear Regression Model
    model = LinearRegression()
    model.fit(X, y)

    # Print model parameters for debug
    slope = model.coef_[0]
    intercept = model.intercept_
    r_squared = model.score(X, y)
    
    print("-" * 30)
    print(f"Model Trained: Rating = {slope:.4f} * Price + {intercept:.4f}")
    print(f"R-Squared (Correlation Strength): {r_squared:.4f}")
    print("-" * 30)

    # Calculate Predicted Rating for ALL rows (even if arguably price is extreme, the logic holds)
    # We use the original DF to keep all data, but only calculate where price exists
    df['predicted_rating'] = np.nan # Initialize
    mask = df['100g_USD'].notna()
    
    # Predict
    df.loc[mask, 'predicted_rating'] = model.predict(df.loc[mask, ['100g_USD']].values)

    # Calculate Value Score (Residual)
    # Residual = Actual - Predicted
    # Positive Score = Better than expected (Good Value)
    # Negative Score = Worse than expected (Bad Value)
    df['value_score'] = df['rating'] - df['predicted_rating']

    # Round for display
    df['value_score'] = df['value_score'].round(2)
    df['predicted_rating'] = df['predicted_rating'].round(2)

    # Show top 5 "Hidden Gems" (Highest Value Score)
    print("\nTop 5 'Hidden Gems' (Under-valued):")
    print(df.nlargest(5, 'value_score')[['name', '100g_USD', 'rating', 'value_score']])

    # Show bottom 5 "Overpriced" (Lowest Value Score)
    print("\nTop 5 'Overpriced' (Over-valued):")
    print(df.nsmallest(5, 'value_score')[['name', '100g_USD', 'rating', 'value_score']])

    # Create 'is_hidden_gem' flag for easy UI logic
    # Arbitrary threshold: let's say score > 2.0 (2 points higher than average market curve)
    df['is_hidden_gem'] = df['value_score'] > 2.0

    # Save to new CSV
    df.to_csv(output_path, index=False)
    print(f"\nSuccess! Scored data saved to: {output_path}")

if __name__ == "__main__":
    calculate_value_score()
