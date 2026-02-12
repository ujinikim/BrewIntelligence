import { supabase } from '@/lib/supabase';

// ─── Types ──────────────────────────────────────────────────────────────────
// These types are kept identical to what the UI components expect.
// Data is now pre-computed by the pipeline (post_process.py) and stored in insights_cache.

export interface RatingBucket {
  range: string;
  count: number;
  min: number;
  max: number;
}

export interface YearlyTrend {
  year: number;
  avgRating: number;
  count: number;
  avgPrice: number | null;
}

export interface RoasterStat {
  roaster: string;
  avgRating: number;
  count: number;
  topScore: number;
}

export interface FlavorProfile {
  label: string;
  aroma: number;
  acidity: number;
  body: number;
  flavor: number;
  aftertaste: number;
}

export interface RoastStats {
  roast: string;
  count: number;
  avgRating: number;
  avgPrice: number | null;
  avgAroma: number;
  avgAcidity: number;
  avgBody: number;
  avgFlavor: number;
  avgAftertaste: number;
}

export interface CountryStat {
  country: string;
  count: number;
  avgRating: number;
  avgPrice: number | null;
  topRoast: string;
  topScore: number;
}

export interface PriceTier {
  tier: string;
  range: string;
  count: number;
  avgRating: number;
  minRating: number;
  maxRating: number;
}

export interface InsightsData {
  totalReviews: number;
  ratingDistribution: RatingBucket[];
  yearlyTrends: YearlyTrend[];
  topRoasters: RoasterStat[];
  flavorProfiles: FlavorProfile[];
  roastComparison: RoastStats[];
  countryStats: CountryStat[];
  priceTiers: PriceTier[];
  highlights: {
    highestRatedBean: { title: string; rating: number; roaster: string } | null;
    mostReviewedCountry: { country: string; count: number } | null;
    mostExpensiveAvgCountry: { country: string; avgPrice: number } | null;
    cheapestHighQuality: { title: string; rating: number; price: string } | null;
  };
}

// ─── Thin Data Fetcher ──────────────────────────────────────────────────────
// All aggregation logic has moved to data_pipeline/scripts/post_process.py.
// This function just reads the pre-computed cache from Supabase.

export async function getInsightsData(): Promise<InsightsData> {
  const { data, error } = await supabase
    .from('insights_cache')
    .select('key, data');

  if (error) {
    console.error('Error fetching insights cache:', error);
    throw new Error('Failed to fetch insights data');
  }

  // Build a lookup map: key -> parsed JSON data
  const cache: Record<string, unknown> = {};
  for (const row of data || []) {
    cache[row.key] = typeof row.data === 'string' ? JSON.parse(row.data) : row.data;
  }

  return {
    totalReviews: (cache.total_reviews as number) || 0,
    ratingDistribution: (cache.rating_distribution as RatingBucket[]) || [],
    yearlyTrends: (cache.yearly_trends as YearlyTrend[]) || [],
    topRoasters: (cache.top_roasters as RoasterStat[]) || [],
    flavorProfiles: (cache.flavor_profiles as FlavorProfile[]) || [],
    roastComparison: (cache.roast_comparison as RoastStats[]) || [],
    countryStats: (cache.country_stats as CountryStat[]) || [],
    priceTiers: (cache.price_tiers as PriceTier[]) || [],
    highlights: (cache.highlights as InsightsData['highlights']) || {
      highestRatedBean: null,
      mostReviewedCountry: null,
      mostExpensiveAvgCountry: null,
      cheapestHighQuality: null,
    },
  };
}
