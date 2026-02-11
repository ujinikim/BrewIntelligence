import { CoffeeReview } from '@/utils/supabase-data';
import { calculateAnalytics } from '@/utils/analytics';
import { TrendingUp, DollarSign, Star, Coffee as CoffeeIcon, Globe, BarChart3 } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string;
  subtext: string;
  secondaryText?: string;
  icon: React.ReactNode;
  variant?: 'dark' | 'light';
}

const MetricCard = ({ label, value, subtext, secondaryText, icon, variant = 'light' }: MetricCardProps) => (
  <div className={`group p-6 rounded-[2rem] border transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl ${
    variant === 'dark' 
      ? 'bg-stone-900 border-white/5 text-white shadow-xl' 
      : 'bg-white border-stone-200/50 text-stone-900 shadow-sm'
  }`}>
    <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl transition-transform duration-500 group-hover:rotate-6 ${
            variant === 'dark' ? 'bg-white/10 text-amber-500' : 'bg-primary/10 text-primary'
        }`}>
            {icon}
        </div>
        <div className={`w-2 h-2 rounded-full animate-pulse ${
            variant === 'dark' ? 'bg-amber-500' : 'bg-primary'
        }`} />
    </div>
    <div>
      <p className={`text-[10px] font-bold tracking-[0.2em] uppercase mb-1 ${
        variant === 'dark' ? 'text-stone-500' : 'text-stone-400'
      }`}>{label}</p>
      <h3 className="text-3xl font-serif font-bold tracking-tight mb-1">{value}</h3>
      <p className={`text-xs font-medium uppercase tracking-widest ${
        variant === 'dark' ? 'text-stone-400' : 'text-stone-500'
      }`}>{subtext}</p>
      {secondaryText && (
        <p className={`text-[10px] mt-2 font-mono ${
          variant === 'dark' ? 'text-stone-500' : 'text-stone-400'
        }`}>{secondaryText}</p>
      )}
    </div>
  </div>
);

export function KPICards({ data, totalCount }: { data: CoffeeReview[], totalCount: number }) {
  const stats = calculateAnalytics(data);
  
  // Calculate roast percentages
  const totalWithRoast = stats.roastDistribution.Light + stats.roastDistribution.Medium + stats.roastDistribution.Dark;
  const roastPercents = totalWithRoast > 0 ? {
    light: Math.round((stats.roastDistribution.Light / totalWithRoast) * 100),
    medium: Math.round((stats.roastDistribution.Medium / totalWithRoast) * 100),
    dark: Math.round((stats.roastDistribution.Dark / totalWithRoast) * 100),
  } : { light: 0, medium: 0, dark: 0 };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      <MetricCard 
        label="Total Reviews" 
        value={totalCount.toLocaleString()} 
        subtext="Expert Ratings"
        icon={<CoffeeIcon size={20} />}
        variant="dark"
      />
      <MetricCard 
        label="Avg Rating" 
        value={stats.avgRating} 
        subtext={`Std Dev: ${stats.ratingStdDev}`}
        secondaryText={`Range: ${stats.minRating} to ${stats.maxRating}`}
        icon={<Star size={20} />}
      />
      <MetricCard 
        label="Price/oz" 
        value={stats.avgPrice === "N/A" ? "N/A" : `$${stats.avgPrice}`} 
        subtext={stats.avgPrice !== "N/A" ? `Median $${stats.medianPrice.toFixed(2)}` : "No data"}
        secondaryText={stats.priceDataPoints > 0 ? `Std Dev: $${stats.priceStdDev} | n=${stats.priceDataPoints}` : undefined}
        icon={<DollarSign size={20} />}
      />
      <MetricCard 
        label="Origins" 
        value={stats.countryCount.toString()} 
        subtext="Countries"
        icon={<Globe size={20} />}
      />
      <MetricCard 
        label="Roast Split" 
        value={`${roastPercents.medium}%`} 
        subtext="Medium Roast"
        secondaryText={`L ${roastPercents.light}% | D ${roastPercents.dark}%`}
        icon={<BarChart3 size={20} />}
      />
      <MetricCard 
        label="Top Score" 
        value={stats.topRated?.rating ? stats.topRated.rating.toString() : "N/A"} 
        subtext={stats.topRated?.title ? stats.topRated.title.slice(0, 20) + (stats.topRated.title.length > 20 ? '...' : '') : "Evaluating..."}
        icon={<TrendingUp size={20} />}
      />
    </div>
  );
}

