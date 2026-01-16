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

  let totalRating = 0;
  let totalPrice = 0;
  let validPriceCount = 0;
  
  // Find top rated
  const sortedByRating = [...data].sort((a, b) => (b.rating || 0) - (a.rating || 0));
  const topRated = sortedByRating[0];

  data.forEach(bean => {
    totalRating += (bean.rating || 0);
    const p = parsePrice(bean.price);
    if (p > 0) {
      totalPrice += p;
      validPriceCount++;
    }
  });

  const avgRating = (totalRating / totalBeans).toFixed(1);
  const avgPrice = validPriceCount > 0 ? (totalPrice / validPriceCount).toFixed(2) : "N/A";

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
