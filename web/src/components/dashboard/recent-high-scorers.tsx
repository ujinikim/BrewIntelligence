'use client';

import { CoffeeReview } from '@/utils/supabase-data';
import { Star } from 'lucide-react';

export function RecentHighScorers({ data }: { data: CoffeeReview[] }) {
  // Get recent high scorers (94+)
  const highScorers = data
    .filter(d => d.rating && d.rating >= 94)
    .slice(0, 4);

  if (highScorers.length === 0) {
    // Fallback: show top 4 by rating
    const topRated = [...data]
      .filter(d => d.rating)
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 4);
    
    return <HighScorersDisplay items={topRated} label="Top Rated" />;
  }

  return <HighScorersDisplay items={highScorers} label="Recent 94+ Scores" />;
}

function HighScorersDisplay({ items, label }: { items: CoffeeReview[], label: string }) {
  return (
    <div className="glass p-6 rounded-2xl border border-stone-200/50">
      <div className="flex items-center gap-2 mb-1">
        <Star size={14} className="text-amber-500" />
        <h3 className="text-xs font-bold text-stone-400 uppercase tracking-[0.2em]">
          {label}
        </h3>
      </div>
      <p className="text-[9px] text-stone-300 mb-4">From the latest 500 reviews</p>
      
      <div className="space-y-3">
        {items.map((item, idx) => (
          <div 
            key={item.id} 
            className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/50 transition-colors cursor-pointer group"
          >
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 ${
              idx === 0 
                ? 'bg-amber-500 text-white' 
                : 'bg-stone-100 text-stone-700'
            }`}>
              {item.rating}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-stone-900 truncate group-hover:text-amber-700 transition-colors">
                {item.title}
              </p>
              <p className="text-[10px] text-stone-400 font-medium truncate">
                {item.roaster} {item.country && `• ${item.country}`}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
