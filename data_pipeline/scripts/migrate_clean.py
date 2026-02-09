"""
Data Cleaning Migration Script
Populates normalized columns: country, price_numeric, review_year, roast_category
"""

import os
import re
import time
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_KEY")
)

# Coffee-producing countries (comprehensive list)
COFFEE_COUNTRIES = [
    'Ethiopia', 'Kenya', 'Colombia', 'Guatemala', 'Brazil', 'Costa Rica',
    'Panama', 'Honduras', 'Peru', 'Rwanda', 'Indonesia', 'Yemen', 'Mexico',
    'El Salvador', 'Nicaragua', 'Burundi', 'Tanzania', 'Uganda', 'Jamaica',
    'Hawaii', 'Papua New Guinea', 'Bolivia', 'Ecuador', 'India', 'Vietnam',
    'Thailand', 'Myanmar', 'Laos', 'China', 'Philippines', 'Taiwan',
    'Democratic Republic of Congo', 'Congo', 'Malawi', 'Zambia', 'Zimbabwe',
    'Cameroon', 'Ivory Coast', 'Ghana', 'Togo', 'Sierra Leone', 'Liberia',
    'Guinea', 'Central African Republic', 'Gabon', 'Angola', 'Madagascar',
    'Reunion', 'Mauritius', 'Comoros', 'Sao Tome', 'Cape Verde',
    'Dominican Republic', 'Haiti', 'Puerto Rico', 'Cuba', 'Venezuela',
    'Sumatra', 'Java', 'Sulawesi', 'Bali', 'Flores', 'Timor'
]

# Roast level normalization
ROAST_MAP = {
    'light': 'Light',
    'light-medium': 'Light',
    'medium-light': 'Medium',
    'medium': 'Medium',
    'medium-dark': 'Dark',
    'dark-medium': 'Dark',
    'dark': 'Dark',
    'very dark': 'Dark',
    'espresso': 'Dark'
}

# Approximate exchange rates to USD (as of Feb 2024)
EXCHANGE_RATES = {
    'USD': 1.0,
    'NTD': 0.031,    # ~32 NTD = $1 USD
    'EUR': 1.08,     # 1 EUR = $1.08 USD
    'GBP': 1.27,     # 1 GBP = $1.27 USD
    'AUD': 0.65,     # 1 AUD = $0.65 USD
    'CAD': 0.74,     # 1 CAD = $0.74 USD
    'JPY': 0.0067,   # ~150 JPY = $1 USD
    'MYR': 0.21,     # ~4.7 MYR = $1 USD (Malaysian Ringgit)
    'CNY': 0.14,     # ~7.1 CNY = $1 USD (Chinese Yuan)
    'THB': 0.028,    # ~36 THB = $1 USD (Thai Baht)
    'KRW': 0.00075,  # ~1,330 KRW = $1 USD (Korean Won)
    'GTQ': 0.13,     # ~7.8 GTQ = $1 USD (Guatemalan Quetzal)
    'MXN': 0.058,    # ~17 MXN = $1 USD (Mexican Peso)
}


def extract_country(origin: str) -> str | None:
    """Extract country from origin text."""
    if not origin:
        return None
    origin_lower = origin.lower()
    for country in COFFEE_COUNTRIES:
        if country.lower() in origin_lower:
            return country
    return None


def extract_price(price: str) -> tuple[float | None, str | None]:
    """Extract numeric price and currency from price text."""
    if not price:
        return None, None
    
    # Skip N/A values
    if 'N/A' in price.upper() or price.strip().upper() == 'NA':
        return None, None
    
    # Detect currency from price string
    price_upper = price.upper()
    
    # Check for specific currency patterns (order matters - more specific first)
    if 'NT' in price_upper or 'NTD' in price_upper or 'TWD' in price_upper or 'NT$' in price_upper:
        currency = 'NTD'
    elif 'THB' in price_upper:
        currency = 'THB'  # Thai Baht
    elif 'KRW' in price_upper:
        currency = 'KRW'  # Korean Won
    elif 'GTQ' in price_upper:
        currency = 'GTQ'  # Guatemalan Quetzal
    elif 'PESOS' in price_upper:
        currency = 'MXN'  # Assume Mexican Peso
    elif 'RMB' in price_upper or 'CNY' in price_upper:
        currency = 'CNY'  # Chinese Yuan
    elif '¥' in price:
        currency = 'CNY'  # Assume Chinese Yuan for ¥
    elif 'RM' in price_upper and 'RMB' not in price_upper:
        currency = 'MYR'  # Malaysian Ringgit
    elif '€' in price or 'EUR' in price_upper or 'EUROS' in price_upper:
        currency = 'EUR'
    elif re.match(r'^E\s*\d', price):  # "E 50.00" pattern
        currency = 'EUR'
    elif '£' in price or 'GBP' in price_upper:
        currency = 'GBP'
    elif 'JPY' in price_upper or 'YEN' in price_upper:
        currency = 'JPY'
    elif '$' in price or '#' in price:  # '#' is typo for '$'
        if 'AUD' in price_upper or 'A$' in price_upper:
            currency = 'AUD'
        elif 'CAD' in price_upper or 'C$' in price_upper:
            currency = 'CAD'
        else:
            currency = 'USD'
    elif re.match(r'^\d+\.\d{2}/', price):  # "18.00/12 ounces" without $
        currency = 'USD'  # Assume USD if no currency symbol
    else:
        currency = None  # Unknown currency
    
    # Find first number pattern like 18.00 or just 18 (handle commas in numbers like 40,000)
    match = re.search(r'(\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?|\d+(?:\.\d{1,2})?)', price)
    if match:
        num_str = match.group(1).replace(',', '')
        return float(num_str), currency
    return None, None


def extract_weight(price: str) -> tuple[float | None, str | None]:
    """Extract weight/quantity and unit from price text. Returns (weight_oz, unit)."""
    if not price:
        return None, None
    
    price_lower = price.lower()
    
    # Try to match ounces (12 ounces, 8 oz, ouncues typo, etc.)
    oz_match = re.search(r'(\d+(?:\.\d+)?)\s*[-/]?\s*(ounces?|oz\.?|ounc[eu]+s?)\b', price_lower)
    if oz_match:
        return float(oz_match.group(1)), 'oz'
    
    # Try to match grams (250 grams, 200g, etc.)
    gram_match = re.search(r'(\d+(?:\.\d+)?)\s*(grams?|g)\b', price_lower)
    if gram_match:
        grams = float(gram_match.group(1))
        # Convert to ounces (1 oz = 28.35 grams)
        return round(grams / 28.35, 2), 'g'
    
    # Try to match pounds (1 pound, 5 pounds)
    pound_match = re.search(r'(\d+(?:\.\d+)?)\s*(pounds?|lb)\b', price_lower)
    if pound_match:
        pounds = float(pound_match.group(1))
        # Convert to ounces (1 pound = 16 oz)
        return round(pounds * 16, 2), 'lb'
    
    # Try to match kilograms (1 kg, 1 kilogram)
    kg_match = re.search(r'(\d+(?:\.\d+)?)\s*(kilograms?|kg\.?)\b', price_lower)
    if kg_match:
        kg = float(kg_match.group(1))
        # Convert to ounces (1 kg = 35.27 oz)
        return round(kg * 35.27, 2), 'kg'
    
    return None, None


def extract_year(review_date: str) -> int | None:
    """Extract year from review date text."""
    if not review_date:
        return None
    # Find 4-digit year
    match = re.search(r'(20\d{2}|19\d{2})', review_date)
    if match:
        return int(match.group(1))
    return None


def normalize_roast(roast_level: str) -> str | None:
    """Normalize roast level to Light/Medium/Dark."""
    if not roast_level:
        return None
    roast_lower = roast_level.lower().strip()
    for key, category in ROAST_MAP.items():
        if key in roast_lower:
            return category
    return None


def migrate_batch(reviews: list, batch_num: int) -> dict:
    """Process and update a batch of reviews."""
    stats = {'country': 0, 'price': 0, 'weight': 0, 'price_per_oz': 0, 'year': 0, 'roast': 0, 'currency': 0}
    
    for review in reviews:
        updates = {}
        price_str = review.get('price')
        
        # Extract country
        country = extract_country(review.get('origin'))
        if country:
            updates['country'] = country
            stats['country'] += 1
        
        # Extract price and currency
        price, currency = extract_price(price_str)
        price_usd = None  # Used for price_per_oz calculation
        
        if price is not None:
            updates['price_numeric'] = price
            stats['price'] += 1
            
            # Convert to USD using exchange rate (for price_per_oz calculation)
            if currency and currency in EXCHANGE_RATES:
                price_usd = round(price * EXCHANGE_RATES[currency], 2)
        
        if currency:
            updates['currency'] = currency
            stats['currency'] += 1
        
        # Extract weight (in ounces)
        weight_oz, weight_unit = extract_weight(price_str)
        if weight_oz is not None and weight_oz > 0:
            updates['weight_oz'] = weight_oz
            updates['weight_unit'] = weight_unit
            stats['weight'] += 1
            
            # Calculate price per ounce in USD
            if price_usd is not None:
                price_per_oz = round(price_usd / weight_oz, 2)
                updates['price_per_oz_usd'] = price_per_oz
                stats['price_per_oz'] += 1
            else:
                updates['price_per_oz_usd'] = 0  # Mark as processed
        else:
            updates['price_per_oz_usd'] = 0  # Mark as processed (no weight available)
        
        # Extract year
        year = extract_year(review.get('review_date'))
        if year:
            updates['review_year'] = year
            stats['year'] += 1
        
        # Normalize roast
        roast = normalize_roast(review.get('roast_level'))
        if roast:
            updates['roast_category'] = roast
            stats['roast'] += 1
        
        # Always update to mark as processed (with retry logic)
        for attempt in range(3):
            try:
                supabase.table('reviews').update(updates).eq('id', review['id']).execute()
                break
            except Exception as e:
                if attempt < 2:
                    time.sleep(1 * (attempt + 1))  # Exponential backoff
                else:
                    print(f"    Failed to update {review['id']}: {e}")
    
    return stats


def main():
    print("🧹 Starting data cleaning migration...")
    
    # TEST MODE: Only process IDs 1637-1737
    # Remove .gte() and .lte() filters to process all rows
    
    # Only count rows that haven't been migrated yet (price_per_oz_usd is NULL)
    count_result = supabase.table('reviews').select('id', count='exact').is_('price_per_oz_usd', 'null').execute()
    total = count_result.count
    
    if total == 0:
        print("✅ No new rows to migrate - all rows already have normalized data!")
        return
    
    print(f"📊 Found {total} unmigrated reviews to process")
    
    batch_size = 500
    processed = 0
    total_stats = {'country': 0, 'price': 0, 'weight': 0, 'price_per_oz': 0, 'year': 0, 'roast': 0, 'currency': 0}
    
    while True:
        # Always fetch from start - updated rows drop out of NULL filter
        result = supabase.table('reviews').select(
            'id, origin, price, review_date, roast_level'
        ).is_('price_per_oz_usd', 'null').limit(batch_size).execute()
        
        if not result.data:
            break
        
        batch_num = processed // batch_size + 1
        print(f"  Processing batch {batch_num} ({processed}-{processed + len(result.data)})...")
        
        stats = migrate_batch(result.data, batch_num)
        
        for key in total_stats:
            total_stats[key] += stats[key]
        
        processed += len(result.data)
        
        # Small delay between batches to prevent API throttling
        time.sleep(0.5)
    
    print("\n✅ Migration complete!")
    print(f"   Countries extracted: {total_stats['country']}")
    print(f"   Prices normalized:   {total_stats['price']}")
    print(f"   Weights extracted:   {total_stats['weight']}")
    print(f"   Price/oz calculated: {total_stats['price_per_oz']}")
    print(f"   Currencies detected: {total_stats['currency']}")
    print(f"   Years extracted:     {total_stats['year']}")
    print(f"   Roasts categorized:  {total_stats['roast']}")


if __name__ == "__main__":
    main()
