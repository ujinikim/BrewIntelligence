import { CoffeeReview } from '@/utils/supabase-data';

export const parsePrice = (priceStr?: string): number => {
  if (!priceStr || priceStr === 'N/A') return 0;
  
  const clean = priceStr.split('/')[0]; 
  const numbers = clean.replace(/[^0-9.]/g, '');
  const val = parseFloat(numbers);
  return isNaN(val) ? 0 : val;
};

export const calculateAnalytics = (data: CoffeeReview[]) => {
  const totalBeans = data.length;
  if (totalBeans === 0) {
    return {
      totalBeans: 0,
      avgRating: "0.0",
      avgPrice: "0.00",
      topRated: null
    };
  }

  // Calculate average rating (only specialty coffees 80+)
  const specialtyBeans = data.filter(b => b.rating && b.rating >= 80);
  const avgRating = specialtyBeans.length > 0
    ? (specialtyBeans.reduce((sum, b) => sum + (b.rating || 0), 0) / specialtyBeans.length).toFixed(1)
    : "0.0";

  // Calculate average price using price_usd (all currencies converted to USD)
  const pricesUSD = data
    .filter(b => b.price_usd && b.price_usd > 0)
    .map(b => b.price_usd!);
  
  const avgPrice = pricesUSD.length > 0
    ? (pricesUSD.reduce((a, b) => a + b, 0) / pricesUSD.length).toFixed(2)
    : "N/A";

  // Find top rated
  const sortedByRating = [...data].sort((a, b) => (b.rating || 0) - (a.rating || 0));
  const topRated = sortedByRating[0];

  return {
    totalBeans,
    avgRating,
    avgPrice,
    topRated
  };
};

export const getValueScore = (bean: CoffeeReview): number => {
  const p = parsePrice(bean.price);
  if (p === 0) return 0;
  // Simple heuristic: Rating points per dollar
  return (bean.rating || 0) / p;
};
