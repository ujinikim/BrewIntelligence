"""
Data Cleaning Migration Script
Populates normalized columns: country, price_numeric, review_year, roast_category
"""

import os
import re
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
    'NTD': 0.031,   # ~32 NTD = $1 USD
    'EUR': 1.08,    # 1 EUR = $1.08 USD
    'GBP': 1.27,    # 1 GBP = $1.27 USD
    'AUD': 0.65,    # 1 AUD = $0.65 USD
    'CAD': 0.74,    # 1 CAD = $0.74 USD
    'JPY': 0.0067,  # ~150 JPY = $1 USD
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
    
    # Detect currency from price string
    price_upper = price.upper()
    
    # Check for specific currency patterns
    if 'NT' in price_upper or 'TWD' in price_upper or 'NTD' in price_upper:
        currency = 'NTD'
    elif '€' in price or 'EUR' in price_upper:
        currency = 'EUR'
    elif '£' in price or 'GBP' in price_upper:
        currency = 'GBP'
    elif '¥' in price or 'JPY' in price_upper or 'YEN' in price_upper:
        currency = 'JPY'
    elif '$' in price:
        # $ could be USD, AUD, CAD, etc. - assume USD if just $
        if 'AUD' in price_upper or 'A$' in price_upper:
            currency = 'AUD'
        elif 'CAD' in price_upper or 'C$' in price_upper:
            currency = 'CAD'
        else:
            currency = 'USD'
    else:
        currency = None  # Unknown currency
    
    # Find first number pattern like 18.00 or just 18
    match = re.search(r'(\d+(?:\.\d{1,2})?)', price)
    if match:
        return float(match.group(1)), currency
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
    stats = {'country': 0, 'price': 0, 'price_usd': 0, 'year': 0, 'roast': 0, 'currency': 0}
    
    for review in reviews:
        updates = {}
        
        # Extract country
        country = extract_country(review.get('origin'))
        if country:
            updates['country'] = country
            stats['country'] += 1
        
        # Extract price and currency
        price, currency = extract_price(review.get('price'))
        if price is not None:
            updates['price_numeric'] = price
            stats['price'] += 1
            
            # Convert to USD using exchange rate
            if currency and currency in EXCHANGE_RATES:
                price_usd = round(price * EXCHANGE_RATES[currency], 2)
                updates['price_usd'] = price_usd
                stats['price_usd'] += 1
        
        if currency:
            updates['currency'] = currency
            stats['currency'] += 1
        
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
        
        # Update if we have any changes
        if updates:
            supabase.table('reviews').update(updates).eq('id', review['id']).execute()
    
    return stats


def main():
    print("🧹 Starting data cleaning migration...")
    
    # Only count rows that haven't been migrated yet (price_usd is NULL)
    count_result = supabase.table('reviews').select('id', count='exact').is_('price_usd', 'null').execute()
    total = count_result.count
    
    if total == 0:
        print("✅ No new rows to migrate - all rows already have normalized data!")
        return
    
    print(f"📊 Found {total} unmigrated reviews to process")
    
    batch_size = 500
    offset = 0
    total_stats = {'country': 0, 'price': 0, 'price_usd': 0, 'year': 0, 'roast': 0, 'currency': 0}
    
    while offset < total:
        # Fetch batch of unmigrated rows only
        result = supabase.table('reviews').select(
            'id, origin, price, review_date, roast_level'
        ).is_('price_usd', 'null').range(offset, offset + batch_size - 1).execute()
        
        if not result.data:
            break
        
        batch_num = offset // batch_size + 1
        print(f"  Processing batch {batch_num} ({offset}-{offset + len(result.data)})...")
        
        stats = migrate_batch(result.data, batch_num)
        
        for key in total_stats:
            total_stats[key] += stats[key]
        
        offset += batch_size
    
    print("\n✅ Migration complete!")
    print(f"   Countries extracted: {total_stats['country']}")
    print(f"   Prices normalized:   {total_stats['price']}")
    print(f"   Prices in USD:       {total_stats['price_usd']}")
    print(f"   Currencies detected: {total_stats['currency']}")
    print(f"   Years extracted:     {total_stats['year']}")
    print(f"   Roasts categorized:  {total_stats['roast']}")


if __name__ == "__main__":
    main()
