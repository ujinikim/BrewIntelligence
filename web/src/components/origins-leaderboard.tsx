'use client';

import { CoffeeReview } from '@/utils/supabase-data';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

interface OriginStats {
  origin: string;
  avgRating: number;
  count: number;
}

export function OriginsLeaderboard({ data }: { data: CoffeeReview[] }) {
  // Aggregate ratings by country (using cleaned country column from migration)
  const countryMap = new Map<string, { total: number; count: number }>();

  data.forEach(d => {
    const country = d.country; // Use the cleaned country column
    if (!country || !d.rating) return;
    
    const existing = countryMap.get(country) || { total: 0, count: 0 };
    countryMap.set(country, {
      total: existing.total + d.rating,
      count: existing.count + 1
    });
  });

  // Convert to array and calculate averages
  const chartData: OriginStats[] = Array.from(countryMap.entries())
    .map(([origin, stats]) => ({
      origin: origin.length > 20 ? origin.slice(0, 18) + '...' : origin,
      fullOrigin: origin,
      avgRating: Math.round((stats.total / stats.count) * 10) / 10,
      count: stats.count
    }))
    .filter(d => d.count >= 2) // Only show origins with 2+ reviews
    .sort((a, b) => b.avgRating - a.avgRating)
    .slice(0, 10); // Top 10 origins

  const maxRating = Math.max(...chartData.map(d => d.avgRating));
  const minRating = Math.min(...chartData.map(d => d.avgRating));

  return (
    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-stone-200/50 relative overflow-hidden h-full flex flex-col">
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-500/20 via-transparent to-amber-500/20" />
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
        <div>
          <h3 className="text-2xl font-serif font-bold text-[#1F1815] tracking-tight">
            🏆 Top Coffee Origins
          </h3>
          <p className="text-stone-400 text-xs font-bold uppercase tracking-widest mt-1">
            Average expert ratings by country of origin
          </p>
        </div>
        <div className="flex gap-4 text-[10px] font-bold uppercase tracking-widest text-stone-400">
          <span className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            Top Performer
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-stone-300" />
            Standard
          </span>
        </div>
      </div>
      
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={chartData} 
            layout="vertical"
            margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
          >
            <XAxis 
              type="number" 
              domain={[Math.floor(minRating) - 1, Math.ceil(maxRating)]}
              tick={{ fontSize: 11, fill: '#a8a29e', fontWeight: 'bold' }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              type="category" 
              dataKey="origin"
              tick={{ fontSize: 12, fill: '#1F1815', fontWeight: '600' }}
              tickLine={false}
              axisLine={false}
              width={75}
            />
            <Tooltip 
              cursor={{ fill: 'rgba(0,0,0,0.02)' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload;
                  return (
                    <div className="bg-stone-900 text-white p-4 rounded-xl shadow-2xl border border-white/10">
                      <p className="font-serif font-bold text-lg">{d.fullOrigin || d.origin}</p>
                      <div className="flex gap-6 mt-2">
                        <div>
                          <span className="text-[10px] uppercase text-stone-400 block">Avg Score</span>
                          <span className="text-amber-400 font-bold text-xl">{d.avgRating}</span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase text-stone-400 block">Reviews</span>
                          <span className="font-bold text-xl">{d.count}</span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar 
              dataKey="avgRating" 
              radius={[0, 8, 8, 0]}
              barSize={24}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={index === 0 ? '#d97706' : index < 3 ? '#f59e0b' : '#d6d3d1'}
                  className="cursor-pointer transition-opacity hover:opacity-80"
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      {/* Quick insight */}
      <div className="mt-4 pt-4 border-t border-stone-100">
        <p className="text-sm text-stone-500">
          <span className="font-bold text-amber-600">{chartData[0]?.origin}</span> leads with an average score of{' '}
          <span className="font-bold">{chartData[0]?.avgRating}</span> across {chartData[0]?.count} reviews.
        </p>
      </div>
    </div>
  );
}
