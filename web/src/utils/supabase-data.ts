import { supabase } from '@/lib/supabase';

export interface CoffeeReview {
  id: number;
  title: string;
  roaster: string;
  rating: number; // The main score (e.g. 94)
  review: string; // The text description
  price?: string;
  url?: string;
  origin?: string;
  country?: string; // Normalized country from migration
  price_numeric?: number; // Parsed price value
  currency?: string; // USD, NTD, EUR, etc.
  weight_oz?: number; // Weight in ounces
  weight_unit?: string; // Original unit (oz, g, lb, kg)
  price_per_oz_usd?: number; // Normalized price per ounce in USD
  review_year?: number; // Extracted year
  roast_category?: string; // Light, Medium, Dark
  roast_level?: string;
  roaster_location?: string;
  aroma?: number;
  acidity?: number;
  body?: number;
  flavor?: number;
  aftertaste?: number;
  blind_assessment?: string;
  created_at?: string;
}

export interface ReviewsFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  minRating?: number;
  country?: string;
  roast?: string;
  year?: number;
}

export async function getReviews({ 
  page = 1, 
  limit = 12, 
  search, 
  minRating, 
  country, 
  roast,
  year 
}: ReviewsFilterParams) {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from('reviews')
    .select('*', { count: 'exact' });

  // Apply filters
  if (search) {
    query = query.or(`title.ilike.%${search}%,roaster.ilike.%${search}%`);
  }
  
  if (minRating) {
    query = query.gte('rating', minRating);
  }

  if (country && country !== 'All') {
    query = query.eq('country', country);
  }

  if (roast && roast !== 'All') {
    query = query.eq('roast_category', roast);
  }

  if (year) {
    query = query.eq('review_year', year);
  }

  const { data, count, error } = await query
    .order('id', { ascending: false })
    .range(from, to);

  if (error) {
    console.error("Error fetching reviews:", error);
    return { data: [], count: 0 };
  }

  return { data: data as CoffeeReview[], count: count || 0 };
}

export async function getDashboardData(limit = 100) {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .order('id', { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching dashboard data:", error);
    return [];
  }
  return data as CoffeeReview[];
}

export async function getTotalReviewCount() {
  const { count, error } = await supabase
    .from('reviews')
    .select('*', { count: 'exact', head: true });

  if (error) {
    return 0;
  }
  return count || 0;
}

// Helper to fetch all unique values for a column bypassing 1000 row limit
async function getAllUniqueValues<T>(column: string): Promise<T[]> {
  let allValues: any[] = [];
  let page = 0;
  const chunkSize = 1000;

  while (true) {
    const { data, error } = await supabase
      .from('reviews')
      .select(column)
      .not(column, 'is', null)
      .range(page * chunkSize, (page + 1) * chunkSize - 1);

    if (error) {
      console.error(`Error fetching ${column}:`, error);
      break;
    }
    
    if (!data || data.length === 0) break;

    allValues.push(...data.map((item: any) => item[column]));
    
    if (data.length < chunkSize) break;
    page++;
  }

  return Array.from(new Set(allValues)).sort((a, b) => {
    if (typeof a === 'number' && typeof b === 'number') return b - a; // Descending for numbers (years)
    return String(a).localeCompare(String(b)); // Ascending for strings
  });
}

// ─── Filter Helpers ──────────────────────────────────────────────────────────

export async function getFilterMeta() {
  const [countries, years] = await Promise.all([
    getAllUniqueValues<string>('country'),
    getAllUniqueValues<number>('review_year')
  ]);

  return {
    countries,
    years
  };
}

// ─── Cache Helpers ──────────────────────────────────────────────────────────

export interface DashboardStats {
  total_reviews: number;
  recent_count_30d: number;
  recent_avg_rating: number;
  recent_top_origin: string;
  recent_top_rated: {
    title: string;
    rating: number;
    roaster: string;
  } | null;
  last_updated: string | null;
}

export async function getCachedDashboardData() {
  const { data, error } = await supabase
    .from('insights_cache')
    .select('key, data')
    .in('key', ['dashboard_stats', 'recent_reviews']);

  if (error) {
    console.error('Error fetching dashboard cache:', error);
    return { stats: null, recentReviews: [] };
  }

  const cache: Record<string, any> = {};
  for (const row of data || []) {
    cache[row.key] = typeof row.data === 'string' ? JSON.parse(row.data) : row.data;
  }

  return {
    stats: (cache.dashboard_stats as DashboardStats) || null,
    recentReviews: (cache.recent_reviews as CoffeeReview[]) || []
  };
}

export async function getCachedFilterMeta() {
  const { data, error } = await supabase
    .from('insights_cache')
    .select('data')
    .eq('key', 'filter_options')
    .single();

  if (error || !data) {
    // Fallback if cache missing
    return getFilterMeta();
  }

  const parsed = typeof data.data === 'string' ? JSON.parse(data.data) : data.data;
  return parsed || { countries: [], years: [] };
}
