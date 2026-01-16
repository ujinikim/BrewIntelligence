import { CoffeeReview } from '@/utils/supabase-data';
import { calculateAnalytics } from '@/utils/analytics';
import { TrendingUp, DollarSign, Star, Coffee as CoffeeIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string;
  subtext: string;
  icon: React.ReactNode;
  variant?: 'dark' | 'light';
}

const MetricCard = ({ label, value, subtext, icon, variant = 'light' }: MetricCardProps) => (
  <div className={`group p-8 rounded-[2rem] border transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl ${
    variant === 'dark' 
      ? 'bg-stone-900 border-white/5 text-white shadow-xl' 
      : 'bg-white border-stone-200/50 text-stone-900 shadow-sm'
  }`}>
    <div className="flex justify-between items-start mb-6">
        <div className={`p-4 rounded-2xl transition-transform duration-500 group-hover:rotate-6 ${
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
      <h3 className="text-4xl font-serif font-bold tracking-tight mb-2">{value}</h3>
      <p className={`text-xs font-medium uppercase tracking-widest ${
        variant === 'dark' ? 'text-stone-400' : 'text-stone-500'
      }`}>{subtext}</p>
    </div>
  </div>
);

export function KPICards({ data, totalCount }: { data: CoffeeReview[], totalCount: number }) {
  const stats = calculateAnalytics(data);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <MetricCard 
        label="Global Library" 
        value={totalCount.toString()} 
        subtext="Expert Reviews"
        icon={<CoffeeIcon size={24} />}
        variant="dark"
      />
      <MetricCard 
        label="Quality Rating" 
        value={stats.avgRating} 
        subtext="Aggregated Score"
        icon={<Star size={24} />}
      />
      <MetricCard 
        label="Market Price" 
        value={stats.avgPrice === "N/A" ? "N/A" : `$${stats.avgPrice}`} 
        subtext="Avg per bag"
        icon={<DollarSign size={24} />}
      />
      <MetricCard 
        label="Highest Honored" 
        value={stats.topRated?.rating ? stats.topRated.rating.toString() : "N/A"} 
        subtext={stats.topRated?.title || "Evaluating..."} 
        icon={<TrendingUp size={24} />}
      />
    </div>
  );
}
