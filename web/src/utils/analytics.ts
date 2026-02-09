import { CoffeeReview } from '@/utils/supabase-data';

export const parsePrice = (priceStr?: string): number => {
  if (!priceStr || priceStr === 'N/A') return 0;
  
  const clean = priceStr.split('/')[0]; 
  const numbers = clean.replace(/[^0-9.]/g, '');
  const val = parseFloat(numbers);
  return isNaN(val) ? 0 : val;
};

// Statistical helper functions
const calculateStdDev = (values: number[], mean: number): number => {
  if (values.length < 2) return 0;
  const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
  return Math.sqrt(squaredDiffs.reduce((a, b) => a + b, 0) / values.length);
};

const calculateMedian = (values: number[]): number => {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

export const calculateAnalytics = (data: CoffeeReview[]) => {
  const totalBeans = data.length;
  if (totalBeans === 0) {
    return {
      totalBeans: 0,
      avgRating: "0.0",
      ratingStdDev: "0.0",
      medianRating: 0,
      minRating: 0,
      maxRating: 0,
      avgPrice: "0.00",
      priceStdDev: "0.00",
      medianPrice: 0,
      minPrice: 0,
      maxPrice: 0,
      topRated: null,
      roastDistribution: { Light: 0, Medium: 0, Dark: 0 },
      countryCount: 0,
      priceDataPoints: 0,
    };
  }

  // Rating statistics (specialty coffees 80+)
  const ratings = data.filter(b => b.rating && b.rating >= 80).map(b => b.rating!);
  const avgRatingNum = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
  const avgRating = avgRatingNum.toFixed(1);
  const ratingStdDev = calculateStdDev(ratings, avgRatingNum).toFixed(1);
  const medianRating = calculateMedian(ratings);
  const minRating = ratings.length > 0 ? Math.min(...ratings) : 0;
  const maxRating = ratings.length > 0 ? Math.max(...ratings) : 0;

  // Price per oz statistics (normalized to USD, excluding 0s)
  const prices = data
    .filter(b => b.price_per_oz_usd && b.price_per_oz_usd > 0)
    .map(b => b.price_per_oz_usd!);
  
  const avgPriceNum = prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0;
  const avgPrice = prices.length > 0 ? avgPriceNum.toFixed(2) : "N/A";
  const priceStdDev = calculateStdDev(prices, avgPriceNum).toFixed(2);
  const medianPrice = calculateMedian(prices);
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

  // Roast distribution
  const roastDistribution = { Light: 0, Medium: 0, Dark: 0 };
  data.forEach(b => {
    if (b.roast_category === 'Light') roastDistribution.Light++;
    else if (b.roast_category === 'Medium') roastDistribution.Medium++;
    else if (b.roast_category === 'Dark') roastDistribution.Dark++;
  });

  // Unique countries
  const countries = new Set(data.filter(b => b.country).map(b => b.country!));

  // Find top rated
  const sortedByRating = [...data].sort((a, b) => (b.rating || 0) - (a.rating || 0));
  const topRated = sortedByRating[0];

  return {
    totalBeans,
    avgRating,
    ratingStdDev,
    medianRating,
    minRating,
    maxRating,
    avgPrice,
    priceStdDev,
    medianPrice,
    minPrice,
    maxPrice,
    topRated,
    roastDistribution,
    countryCount: countries.size,
    priceDataPoints: prices.length,
  };
};

export const getValueScore = (bean: CoffeeReview): number => {
  const p = parsePrice(bean.price);
  if (p === 0) return 0;
  // Simple heuristic: Rating points per dollar
  return (bean.rating || 0) / p;
};
