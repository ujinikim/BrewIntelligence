'use client';

import { YearlyTrend } from '@/utils/insights-data';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Area, ComposedChart, Bar
} from 'recharts';

export function RatingsTimeline({ data }: { data: YearlyTrend[] }) {
  const minRating = Math.min(...data.map(d => d.avgRating));
  const maxRating = Math.max(...data.map(d => d.avgRating));

  // Calculate trend direction
  const firstHalf = data.slice(0, Math.floor(data.length / 2));
  const secondHalf = data.slice(Math.floor(data.length / 2));
  const firstAvg = firstHalf.reduce((a, b) => a + b.avgRating, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((a, b) => a + b.avgRating, 0) / secondHalf.length;
  const trendUp = secondAvg > firstAvg;

  return (
    <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-stone-200/50 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-500/30 via-transparent to-emerald-500/30" />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h3 className="text-2xl font-serif font-bold text-stone-900 tracking-tight">
            Ratings Over Time
          </h3>
          <p className="text-stone-400 text-xs font-bold uppercase tracking-widest mt-1">
            Average expert score by review year
          </p>
        </div>
        <div className="flex gap-4 text-[10px] font-bold uppercase tracking-widest text-stone-400">
          <span className="flex items-center gap-2">
            <span className="w-8 h-0.5 bg-stone-900 rounded-full" />
            Avg Rating
          </span>
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-stone-200" />
            Review Count
          </span>
        </div>
      </div>

      <div className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="4 4" stroke="#f5f5f4" vertical={false} />
            <XAxis
              dataKey="year"
              tick={{ fontSize: 12, fill: '#78716c', fontWeight: '600' }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              yAxisId="rating"
              domain={[Math.floor(minRating) - 1, Math.ceil(maxRating) + 1]}
              tick={{ fontSize: 11, fill: '#a8a29e', fontWeight: 'bold' }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              yAxisId="count"
              orientation="right"
              tick={{ fontSize: 11, fill: '#d6d3d1' }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload as YearlyTrend;
                  return (
                    <div className="bg-stone-900 text-white p-4 rounded-xl shadow-2xl border border-white/10">
                      <p className="font-serif font-bold text-lg">{d.year}</p>
                      <div className="flex gap-6 mt-2">
                        <div>
                          <span className="text-[10px] uppercase text-stone-400 block">Avg Score</span>
                          <span className="text-amber-400 font-bold text-xl">{d.avgRating}</span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase text-stone-400 block">Reviews</span>
                          <span className="font-bold text-xl">{d.count.toLocaleString()}</span>
                        </div>
                        {d.avgPrice && (
                          <div>
                            <span className="text-[10px] uppercase text-stone-400 block">Avg $/oz</span>
                            <span className="font-bold text-xl">${d.avgPrice}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar
              yAxisId="count"
              dataKey="count"
              fill="#e7e5e4"
              radius={[4, 4, 0, 0]}
              barSize={24}
            />
            <Line
              yAxisId="rating"
              type="monotone"
              dataKey="avgRating"
              stroke="#1c1917"
              strokeWidth={3}
              dot={{ r: 4, fill: '#1c1917', strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 6, fill: '#d97706', strokeWidth: 2, stroke: '#fff' }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 pt-4 border-t border-stone-100">
        <p className="text-sm text-stone-500">
          Average ratings have{' '}
          <span className={`font-bold ${trendUp ? 'text-emerald-600' : 'text-red-500'}`}>
            {trendUp ? 'trended upward' : 'slightly declined'}
          </span>{' '}
          over time, with {data[data.length - 1]?.year} averaging{' '}
          <span className="font-bold">{data[data.length - 1]?.avgRating}</span> across{' '}
          {data[data.length - 1]?.count.toLocaleString()} reviews.
        </p>
      </div>
    </div>
  );
}
