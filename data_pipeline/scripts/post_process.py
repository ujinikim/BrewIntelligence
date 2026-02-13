"""
Post-Process Pipeline (Phase 1)
Runs after scrape_and_embed.py + migrate_clean.py
Computes aggregates and stores them in roasters, countries, insights_cache tables.
"""

import os
import json
from collections import defaultdict
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_KEY")
)


# ─── Helpers ──────────────────────────────────────────────────────────────────

def avg(nums):
    return sum(nums) / len(nums) if nums else 0

def rnd(n, d=1):
    return round(n, d)

def fetch_all_reviews():
    """Fetch all reviews, paginating past Supabase's 1000-row limit."""
    all_reviews = []
    page = 0
    chunk = 1000

    while True:
        result = supabase.table('reviews').select(
            'id, title, roaster, roaster_location, rating, price, '
            'price_per_oz_usd, country, review_year, roast_category, '
            'aroma, acidity, body, flavor, aftertaste, roast_level, origin, created_at'
        ).range(page * chunk, (page + 1) * chunk - 1).execute()

        if not result.data:
            break
        all_reviews.extend(result.data)
        if len(result.data) < chunk:
            break
        page += 1

    print(f"📦 Fetched {len(all_reviews)} reviews")
    return all_reviews


# ─── Roasters Table ──────────────────────────────────────────────────────────

def compute_roasters(reviews):
    """Aggregate roaster stats and upsert into roasters table."""
    roaster_map = defaultdict(lambda: {
        'ratings': [], 'prices': [], 'location': None, 'top_score': 0
    })

    for r in reviews:
        name = r.get('roaster')
        if not name or not r.get('rating'):
            continue
        entry = roaster_map[name]
        entry['ratings'].append(r['rating'])
        if r.get('roaster_location'):
            entry['location'] = r['roaster_location']
        if r['rating'] > entry['top_score']:
            entry['top_score'] = r['rating']
        if r.get('price_per_oz_usd') and r['price_per_oz_usd'] > 0:
            entry['prices'].append(r['price_per_oz_usd'])

    rows = []
    for name, data in roaster_map.items():
        rows.append({
            'name': name,
            'location': data['location'],
            'review_count': len(data['ratings']),
            'avg_rating': rnd(avg(data['ratings'])),
            'top_score': data['top_score'],
            'avg_price_per_oz': rnd(avg(data['prices']), 2) if data['prices'] else None,
        })

    # Batch upsert
    for i in range(0, len(rows), 500):
        batch = rows[i:i+500]
        supabase.table('roasters').upsert(batch, on_conflict='name').execute()

    print(f"  ✅ Upserted {len(rows)} roasters")
    return rows


# ─── Countries Table ─────────────────────────────────────────────────────────

def compute_countries(reviews):
    """Aggregate country stats and upsert into countries table."""
    country_map = defaultdict(lambda: {
        'ratings': [], 'prices': [], 'roasts': [], 'top_score': 0
    })

    for r in reviews:
        country = r.get('country')
        if not country or not r.get('rating'):
            continue
        entry = country_map[country]
        entry['ratings'].append(r['rating'])
        if r.get('price_per_oz_usd') and r['price_per_oz_usd'] > 0:
            entry['prices'].append(r['price_per_oz_usd'])
        if r.get('roast_category'):
            entry['roasts'].append(r['roast_category'])
        if r['rating'] > entry['top_score']:
            entry['top_score'] = r['rating']

    rows = []
    for name, data in country_map.items():
        if len(data['ratings']) < 3:
            continue
        # Find dominant roast
        roast_counts = defaultdict(int)
        for rc in data['roasts']:
            roast_counts[rc] += 1
        dominant = max(roast_counts, key=roast_counts.get) if roast_counts else None

        rows.append({
            'name': name,
            'review_count': len(data['ratings']),
            'avg_rating': rnd(avg(data['ratings'])),
            'avg_price_per_oz': rnd(avg(data['prices']), 2) if data['prices'] else None,
            'top_score': data['top_score'],
            'dominant_roast': dominant,
        })

    for i in range(0, len(rows), 500):
        batch = rows[i:i+500]
        supabase.table('countries').upsert(batch, on_conflict='name').execute()

    print(f"  ✅ Upserted {len(rows)} countries")
    return rows


# ─── Insights Cache ──────────────────────────────────────────────────────────

def compute_and_cache_insights(reviews):
    """Compute all 7 insight aggregations + highlights and store in insights_cache."""

    cache_entries = {}

    # 0. Total reviews
    cache_entries['total_reviews'] = len(reviews)

    # 1. Rating Distribution
    buckets = [
        {'range': '80-82', 'count': 0, 'min': 80, 'max': 82},
        {'range': '83-85', 'count': 0, 'min': 83, 'max': 85},
        {'range': '86-88', 'count': 0, 'min': 86, 'max': 88},
        {'range': '89-91', 'count': 0, 'min': 89, 'max': 91},
        {'range': '92-94', 'count': 0, 'min': 92, 'max': 94},
        {'range': '95-97', 'count': 0, 'min': 95, 'max': 97},
        {'range': '98+', 'count': 0, 'min': 98, 'max': 100},
    ]
    for r in reviews:
        rating = r.get('rating')
        if not rating:
            continue
        for b in buckets:
            if b['min'] <= rating <= b['max']:
                b['count'] += 1
                break
    cache_entries['rating_distribution'] = buckets

    # 2. Yearly Trends
    year_map = defaultdict(lambda: {'ratings': [], 'prices': []})
    for r in reviews:
        if not r.get('review_year') or not r.get('rating'):
            continue
        entry = year_map[r['review_year']]
        entry['ratings'].append(r['rating'])
        if r.get('price_per_oz_usd') and r['price_per_oz_usd'] > 0:
            entry['prices'].append(r['price_per_oz_usd'])

    yearly = sorted([
        {
            'year': year,
            'avgRating': rnd(avg(data['ratings'])),
            'count': len(data['ratings']),
            'avgPrice': rnd(avg(data['prices']), 2) if data['prices'] else None,
        }
        for year, data in year_map.items()
    ], key=lambda x: x['year'])
    cache_entries['yearly_trends'] = yearly

    # 3. Top Roasters (min 5 reviews, top 15 by avg rating)
    roaster_map = defaultdict(lambda: {'ratings': [], 'top_score': 0})
    for r in reviews:
        if not r.get('roaster') or not r.get('rating'):
            continue
        entry = roaster_map[r['roaster']]
        entry['ratings'].append(r['rating'])
        if r['rating'] > entry['top_score']:
            entry['top_score'] = r['rating']

    top_roasters = sorted([
        {
            'roaster': name[:30] + '…' if len(name) > 30 else name,
            'avgRating': rnd(avg(data['ratings'])),
            'count': len(data['ratings']),
            'topScore': data['top_score'],
        }
        for name, data in roaster_map.items()
        if len(data['ratings']) >= 5
    ], key=lambda x: -x['avgRating'])[:15]
    cache_entries['top_roasters'] = top_roasters

    # 4. Flavor Profiles (overall + per roast)
    def flavor_profile(subset, label):
        with_scores = [r for r in subset if all(r.get(k) for k in ['aroma', 'acidity', 'body', 'flavor', 'aftertaste'])]
        if not with_scores:
            return {'label': label, 'aroma': 0, 'acidity': 0, 'body': 0, 'flavor': 0, 'aftertaste': 0}
        return {
            'label': label,
            'aroma': rnd(avg([r['aroma'] for r in with_scores])),
            'acidity': rnd(avg([r['acidity'] for r in with_scores])),
            'body': rnd(avg([r['body'] for r in with_scores])),
            'flavor': rnd(avg([r['flavor'] for r in with_scores])),
            'aftertaste': rnd(avg([r['aftertaste'] for r in with_scores])),
        }

    profiles = [flavor_profile(reviews, 'Overall')]
    for roast in ['Light', 'Medium', 'Dark']:
        subset = [r for r in reviews if r.get('roast_category') == roast]
        profiles.append(flavor_profile(subset, roast))
    cache_entries['flavor_profiles'] = profiles

    # 5. Roast Comparison
    roast_comparison = []
    for roast in ['Light', 'Medium', 'Dark']:
        subset = [r for r in reviews if r.get('roast_category') == roast]
        with_rating = [r for r in subset if r.get('rating')]
        with_price = [r for r in subset if r.get('price_per_oz_usd') and r['price_per_oz_usd'] > 0]
        with_scores = [r for r in subset if all(r.get(k) for k in ['aroma', 'acidity', 'body', 'flavor', 'aftertaste'])]

        roast_comparison.append({
            'roast': roast,
            'count': len(subset),
            'avgRating': rnd(avg([r['rating'] for r in with_rating])),
            'avgPrice': rnd(avg([r['price_per_oz_usd'] for r in with_price]), 2) if with_price else None,
            'avgAroma': rnd(avg([r['aroma'] for r in with_scores])) if with_scores else 0,
            'avgAcidity': rnd(avg([r['acidity'] for r in with_scores])) if with_scores else 0,
            'avgBody': rnd(avg([r['body'] for r in with_scores])) if with_scores else 0,
            'avgFlavor': rnd(avg([r['flavor'] for r in with_scores])) if with_scores else 0,
            'avgAftertaste': rnd(avg([r['aftertaste'] for r in with_scores])) if with_scores else 0,
        })
    cache_entries['roast_comparison'] = roast_comparison

    # 6. Country Stats
    c_map = defaultdict(lambda: {'ratings': [], 'prices': [], 'roasts': [], 'top_score': 0})
    for r in reviews:
        country = r.get('country')
        if not country or not r.get('rating'):
            continue
        entry = c_map[country]
        entry['ratings'].append(r['rating'])
        if r.get('price_per_oz_usd') and r['price_per_oz_usd'] > 0:
            entry['prices'].append(r['price_per_oz_usd'])
        if r.get('roast_category'):
            entry['roasts'].append(r['roast_category'])
        if r['rating'] > entry['top_score']:
            entry['top_score'] = r['rating']

    country_stats = []
    for name, data in c_map.items():
        if len(data['ratings']) < 3:
            continue
        roast_counts = defaultdict(int)
        for rc in data['roasts']:
            roast_counts[rc] += 1
        top_roast = max(roast_counts, key=roast_counts.get) if roast_counts else 'N/A'
        country_stats.append({
            'country': name,
            'count': len(data['ratings']),
            'avgRating': rnd(avg(data['ratings'])),
            'avgPrice': rnd(avg(data['prices']), 2) if data['prices'] else None,
            'topRoast': top_roast,
            'topScore': data['top_score'],
        })
    country_stats.sort(key=lambda x: -x['count'])
    cache_entries['country_stats'] = country_stats

    # 7. Price Tiers
    tiers_def = [
        {'tier': 'Budget', 'range': '<$1.50/oz', 'min': 0, 'max': 1.5},
        {'tier': 'Mid-Range', 'range': '$1.50-$3/oz', 'min': 1.5, 'max': 3},
        {'tier': 'Premium', 'range': '$3-$5/oz', 'min': 3, 'max': 5},
        {'tier': 'Luxury', 'range': '$5+/oz', 'min': 5, 'max': float('inf')},
    ]
    price_tiers = []
    for t in tiers_def:
        in_tier = [r for r in reviews
                   if r.get('price_per_oz_usd') and r['price_per_oz_usd'] > t['min']
                   and r['price_per_oz_usd'] <= t['max'] and r.get('rating')]
        ratings = [r['rating'] for r in in_tier]
        price_tiers.append({
            'tier': t['tier'],
            'range': t['range'],
            'count': len(in_tier),
            'avgRating': rnd(avg(ratings)),
            'minRating': min(ratings) if ratings else 0,
            'maxRating': max(ratings) if ratings else 0,
        })
    cache_entries['price_tiers'] = price_tiers

    # 8. Highlights
    sorted_by_rating = sorted(
        [r for r in reviews if r.get('rating')],
        key=lambda x: -x['rating']
    )
    highest = sorted_by_rating[0] if sorted_by_rating else None

    country_counts = defaultdict(int)
    for r in reviews:
        if r.get('country'):
            country_counts[r['country']] += 1
    top_country = max(country_counts.items(), key=lambda x: x[1]) if country_counts else None

    country_prices = defaultdict(list)
    for r in reviews:
        if r.get('country') and r.get('price_per_oz_usd') and r['price_per_oz_usd'] > 0:
            country_prices[r['country']].append(r['price_per_oz_usd'])
    exp_country = max(
        [(c, rnd(avg(p), 2)) for c, p in country_prices.items() if len(p) >= 10],
        key=lambda x: x[1], default=None
    )

    hq_cheap = sorted(
        [r for r in reviews if r.get('rating') and r['rating'] >= 90
         and r.get('price_per_oz_usd') and r['price_per_oz_usd'] > 0],
        key=lambda x: x['price_per_oz_usd']
    )
    cheapest = hq_cheap[0] if hq_cheap else None

    highlights = {
        'highestRatedBean': {
            'title': highest['title'], 'rating': highest['rating'], 'roaster': highest['roaster']
        } if highest else None,
        'mostReviewedCountry': {
            'country': top_country[0], 'count': top_country[1]
        } if top_country else None,
        'mostExpensiveAvgCountry': {
            'country': exp_country[0], 'avgPrice': exp_country[1]
        } if exp_country else None,
        'cheapestHighQuality': {
            'title': cheapest['title'], 'rating': cheapest['rating'],
            'price': f"${cheapest['price_per_oz_usd']:.2f}/oz"
        } if cheapest else None,
    }
    cache_entries['highlights'] = highlights

    # 9. Dashboard Stats (Recent / Monthly Pulse)
    # Calculate stats for the last 30 days
    now = datetime.now(timezone.utc)
    cutoff = now - timedelta(days=30)
    
    recent_subset = []
    for r in reviews:
        if r.get('created_at'):
            try:
                # Handle ISO format with or without microseconds/Z
                ts = r['created_at'].replace('Z', '+00:00')
                dt = datetime.fromisoformat(ts)
                if dt > cutoff:
                    recent_subset.append(r)
            except Exception as e:
                pass
    
    # Recent Stats
    recent_count = len(recent_subset)
    recent_ratings = [r['rating'] for r in recent_subset if r.get('rating')]
    recent_avg_rating = rnd(avg(recent_ratings)) if recent_ratings else 0
    
    # Top Origin (Recent)
    recent_origins = defaultdict(int)
    for r in recent_subset:
        if r.get('country'):
            recent_origins[r['country']] += 1
    top_recent_origin = max(recent_origins.items(), key=lambda x: x[1])[0] if recent_origins else "N/A"
    
    # Top Rated (Recent)
    sorted_recent = sorted([r for r in recent_subset if r.get('rating')], key=lambda x: -x['rating'])
    top_recent_bean = sorted_recent[0] if sorted_recent else None
    
    dashboard_stats = {
        'total_reviews': len(reviews),
        'recent_count_30d': recent_count,
        'recent_avg_rating': recent_avg_rating,
        'recent_top_origin': top_recent_origin,
        'recent_top_rated': top_recent_bean,
        'last_updated': max([r['created_at'] for r in reviews if r.get('created_at')], default=None)
    }
    cache_entries['dashboard_stats'] = dashboard_stats

    # 10. Recent Reviews (Top 12 by ID, assuming ID is chronological)
    sorted_by_id = sorted(reviews, key=lambda x: -x['id'])
    cache_entries['recent_reviews'] = sorted_by_id[:12]

    # 11. Filter Metadata (for Reviews page)
    unique_countries = sorted(list(set([r['country'] for r in reviews if r.get('country')])))
    unique_years = sorted(list(set([r['review_year'] for r in reviews if r.get('review_year')])), reverse=True)
    cache_entries['filter_options'] = {'countries': unique_countries, 'years': unique_years}

    # ─── Write all entries to insights_cache ─────────────────────────────────
    rows = [{'key': k, 'data': json.dumps(v, default=str)} for k, v in cache_entries.items()]
    supabase.table('insights_cache').upsert(rows, on_conflict='key').execute()

    print(f"  ✅ Cached {len(rows)} insight keys")


# ─── Main ────────────────────────────────────────────────────────────────────

def main():
    print("🔄 Starting post-processing pipeline...")

    reviews = fetch_all_reviews()
    if not reviews:
        print("⚠️  No reviews found. Exiting.")
        return

    print("\n📊 Computing roaster aggregates...")
    compute_roasters(reviews)

    print("🌍 Computing country aggregates...")
    compute_countries(reviews)

    print("📈 Computing insights cache...")
    compute_and_cache_insights(reviews)

    print("\n✨ Post-processing complete!")


if __name__ == "__main__":
    main()
