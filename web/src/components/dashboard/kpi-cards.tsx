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
  <div className={`group p-6 rounded-[2rem] border transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl ${variant === 'dark'
      ? 'bg-stone-900 border-white/5 text-white shadow-xl'
      : 'bg-white border-stone-200/50 text-stone-900 shadow-sm'
    }`}>
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl transition-transform duration-500 group-hover:rotate-6 ${variant === 'dark' ? 'bg-white/10 text-amber-500' : 'bg-primary/10 text-primary'
        }`}>
        {icon}
      </div>
      <div className={`w-2 h-2 rounded-full animate-pulse ${variant === 'dark' ? 'bg-amber-500' : 'bg-primary'
        }`} />
    </div>
    <div>
      <p className={`text-[10px] font-bold tracking-[0.2em] uppercase mb-1 ${variant === 'dark' ? 'text-stone-500' : 'text-stone-400'
        }`}>{label}</p>
      <h3 className="text-3xl font-serif font-bold tracking-tight mb-1">{value}</h3>
      <p className={`text-xs font-medium uppercase tracking-widest ${variant === 'dark' ? 'text-stone-400' : 'text-stone-500'
        }`}>{subtext}</p>
      {secondaryText && (
        <p className={`text-[10px] mt-2 font-mono ${variant === 'dark' ? 'text-stone-500' : 'text-stone-400'
          }`}>{secondaryText}</p>
      )}
    </div>
  </div>
);

export function KPICards({ data, totalCount }: { data: CoffeeReview[], totalCount: number }) {
  const stats = calculateAnalytics(data);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Count - The most important operational metric */}
      <MetricCard
        label="Total Reviews"
        value={totalCount.toLocaleString()}
        subtext="Database Size"
        icon={<CoffeeIcon size={20} />}
        variant="dark"
      />

      {/* 2. Avg Price - High level market pulse */}
      <MetricCard
        label="Avg Price/oz"
        value={stats.avgPrice === "N/A" ? "N/A" : `$${stats.avgPrice}`}
        subtext="Market Average"
        icon={<DollarSign size={20} />}
      />

      {/* 3. Global Quality - High level quality pulse */}
      <MetricCard
        label="Avg Rating"
        value={stats.avgRating}
        subtext="Global Quality"
        icon={<Star size={20} />}
      />

      {/* 4. Top Score - The current champion */}
      <MetricCard
        label="Highest Rated"
        value={stats.topRated?.rating ? stats.topRated.rating.toString() : "N/A"}
        subtext={stats.topRated?.title ? stats.topRated.title.slice(0, 20) + '...' : "N/A"}
        icon={<TrendingUp size={20} />}
      />
    </div>
  );
}

