import { DashboardStats } from '@/utils/supabase-data';
import { TrendingUp, MapPin, Star, Coffee } from 'lucide-react';

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

export function KPICards({ stats }: { stats: DashboardStats | null }) {
  if (!stats) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Skeleton/Loading state */}
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-32 bg-stone-100 rounded-[2rem] animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Velocity - How much data is coming in? */}
      <MetricCard
        label="New Reviews"
        value={stats.recent_count_30d.toString()}
        subtext="Last 30 Days"
        icon={<TrendingUp size={20} />}
        variant="dark"
      />

      {/* 2. Hot Spot - Where are beans coming from recently? */}
      <MetricCard
        label="Trending Origin"
        value={stats.recent_top_origin}
        subtext="Most Active Region"
        icon={<MapPin size={20} />}
      />

      {/* 3. Recent Quality - Is the latest batch good? */}
      <MetricCard
        label="Recent Quality"
        value={stats.recent_avg_rating.toString()}
        subtext="Avg Rating (30d)"
        icon={<Star size={20} />}
      />

      {/* 4. Top Pick - The best of the recent bunch */}
      <MetricCard
        label="Month's Best"
        value={stats.recent_top_rated?.rating ? stats.recent_top_rated.rating.toString() : "-"}
        subtext={stats.recent_top_rated?.title ? stats.recent_top_rated.title.slice(0, 15) + '...' : "No Data"}
        icon={<Coffee size={20} />}
      />
    </div>
  );
}
