'use client';

import { RatingBucket } from '@/utils/insights-data';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

export function RatingDistribution({ data }: { data: RatingBucket[] }) {
  const maxCount = Math.max(...data.map(d => d.count));

  return (
    <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-stone-200/50 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-amber-500/30 via-primary/20 to-amber-500/30" />

      <div className="mb-8">
        <h3 className="text-2xl font-serif font-bold text-stone-900 tracking-tight">
          Rating Distribution
        </h3>
        <p className="text-stone-400 text-xs font-bold uppercase tracking-widest mt-1">
          How specialty coffees score across the scale
        </p>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
            <XAxis
              dataKey="range"
              tick={{ fontSize: 12, fill: '#78716c', fontWeight: '600' }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#a8a29e', fontWeight: 'bold' }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              cursor={{ fill: 'rgba(0,0,0,0.02)' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload as RatingBucket;
                  const pct = data.reduce((a, b) => a + b.count, 0);
                  return (
                    <div className="bg-stone-900 text-white p-4 rounded-xl shadow-2xl border border-white/10">
                      <p className="font-serif font-bold text-lg">{d.range} points</p>
                      <div className="flex gap-6 mt-2">
                        <div>
                          <span className="text-[10px] uppercase text-stone-400 block">Count</span>
                          <span className="text-amber-400 font-bold text-xl">{d.count.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase text-stone-400 block">Share</span>
                          <span className="font-bold text-xl">{((d.count / pct) * 100).toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="count" radius={[8, 8, 0, 0]} barSize={48}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.count === maxCount ? '#d97706' : index >= data.length - 2 ? '#f59e0b' : '#e7e5e4'}
                  className="cursor-pointer transition-opacity hover:opacity-80"
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Insight callout */}
      <div className="mt-6 pt-4 border-t border-stone-100">
        <p className="text-sm text-stone-500">
          The majority of specialty coffees score in the{' '}
          <span className="font-bold text-amber-600">
            {data.sort((a, b) => b.count - a.count)[0]?.range}
          </span>{' '}
          range, forming a right-skewed distribution typical of expert-curated review databases.
        </p>
      </div>
    </div>
  );
}
