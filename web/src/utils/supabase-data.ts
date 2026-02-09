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

export async function getReviews(page = 1, limit = 12) {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, count, error } = await supabase
    .from('reviews')
    .select('*', { count: 'exact' })
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
    console.error("Error fetching total review count:", error);
    return 0;
  }
  return count || 0;
}
