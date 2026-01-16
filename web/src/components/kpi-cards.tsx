import { Coffee } from '@/utils/data';
import { TrendingUp, DollarSign, Star, Coffee as CoffeeIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string;
  subtext: string;
  icon: React.ReactNode;
}

const MetricCard = ({ label, value, subtext, icon }: MetricCardProps) => (
  <div className="bg-white p-6 rounded-lg border border-[#e5e5e5] shadow-sm flex items-start justify-between hover:shadow-md transition-shadow">
    <div>
      <p className="text-xs font-bold tracking-widest uppercase text-[#1F1815]/60">{label}</p>
      <h3 className="text-3xl font-serif font-bold text-[#1F1815] mt-2">{value}</h3>
      <p className="text-sm text-[#1F1815]/70 mt-1">{subtext}</p>
    </div>
    <div className="p-3 bg-[#F6F5F3] rounded-full text-[#1F1815]">
        {icon}
    </div>
  </div>
);

export function KPICards({ data }: { data: Coffee[] }) {
  const totalBeans = data.length;
  const avgRating = (data.reduce((acc, curr) => acc + curr.rating, 0) / totalBeans).toFixed(1);
  const avgPrice = (data.reduce((acc, curr) => acc + curr['100g_USD'], 0) / totalBeans).toFixed(2);
  
  // Find top rated
  const topRated = [...data].sort((a, b) => b.rating - a.rating)[0];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <MetricCard 
        label="Total Beans Evaluated" 
        value={totalBeans.toString()} 
        subtext="Across 50+ origins"
        icon={<CoffeeIcon size={20} />}
      />
      <MetricCard 
        label="Average Rating" 
        value={avgRating} 
        subtext="Global quality score"
        icon={<Star size={20} />}
      />
      <MetricCard 
        label="Average Price (100g)" 
        value={`$${avgPrice}`} 
        subtext="USD Market Average"
        icon={<DollarSign size={20} />}
      />
      <MetricCard 
        label="Top Rated Bean" 
        value={topRated ? `${topRated.rating}/100` : 'N/A'} 
        subtext={topRated?.name || 'N/A'}
        icon={<TrendingUp size={20} />}
      />
    </div>
  );
}
