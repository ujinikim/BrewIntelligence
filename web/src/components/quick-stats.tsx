'use client';

import { CoffeeReview } from '@/utils/supabase-data';
import { TrendingUp, MapPin, Calendar } from 'lucide-react';

export function QuickStats({ data, totalCount }: { data: CoffeeReview[], totalCount: number }) {
  // Calculate average rating
  const ratings = data.filter(d => d.rating).map(d => d.rating);
  const avgRating = ratings.length > 0 
    ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
    : '0';

  // Find most common country
  const countryCount = new Map<string, number>();
  data.forEach(d => {
    if (d.country) {
      countryCount.set(d.country, (countryCount.get(d.country) || 0) + 1);
    }
  });
  const topCountry = Array.from(countryCount.entries())
    .sort((a, b) => b[1] - a[1])[0];

  // Count this year's reviews
  const currentYear = new Date().getFullYear();
  const thisYearCount = data.filter(d => d.review_year === currentYear).length;

  return (
    <div className="glass p-6 rounded-2xl border border-stone-200/50">
      <h3 className="text-xs font-bold text-stone-400 uppercase tracking-[0.2em] mb-5">
        Quick Stats {thisYearCount > 0 ? `• ${currentYear}` : ''}
      </h3>
      
      <div className="space-y-4">
        {/* Average Rating */}
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
            <TrendingUp size={18} className="text-amber-600" />
          </div>
          <div>
            <p className="text-2xl font-bold font-serif text-stone-900">{avgRating}</p>
            <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">Avg Rating</p>
          </div>
        </div>

        {/* Top Country */}
        {topCountry && (
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <MapPin size={18} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-lg font-bold text-stone-900">{topCountry[0]}</p>
              <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">{topCountry[1].toLocaleString()} reviews</p>
            </div>
          </div>
        )}

        {/* This Year */}
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
            <Calendar size={18} className="text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold font-serif text-stone-900">{thisYearCount > 0 ? thisYearCount : totalCount.toLocaleString()}</p>
            <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">
              {thisYearCount > 0 ? `Beans in ${currentYear}` : 'Total Beans'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
