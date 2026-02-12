'use client';

import { RoasterStat } from '@/utils/insights-data';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

export function TopRoasters({ data }: { data: RoasterStat[] }) {
  const maxRating = Math.max(...data.map(d => d.avgRating));
  const minRating = Math.min(...data.map(d => d.avgRating));

  return (
    <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-stone-200/50 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-violet-500/30 via-transparent to-violet-500/30" />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h3 className="text-2xl font-serif font-bold text-stone-900 tracking-tight">
            🏅 Top Roasters
          </h3>
          <p className="text-stone-400 text-xs font-bold uppercase tracking-widest mt-1">
            Highest average rating (min. 5 reviews)
          </p>
        </div>
        <div className="flex gap-4 text-[10px] font-bold uppercase tracking-widest text-stone-400">
          <span className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            Top 3
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-stone-300" />
            Others
          </span>
        </div>
      </div>

      <div className="h-[500px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data.slice(0, 15)}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
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
              dataKey="roaster"
              tick={{ fontSize: 11, fill: '#1F1815', fontWeight: '600' }}
              tickLine={false}
              axisLine={false}
              width={160}
            />
            <Tooltip
              cursor={{ fill: 'rgba(0,0,0,0.02)' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload as RoasterStat;
                  return (
                    <div className="bg-stone-900 text-white p-4 rounded-xl shadow-2xl border border-white/10">
                      <p className="font-serif font-bold text-lg">{d.roaster}</p>
                      <div className="flex gap-6 mt-2">
                        <div>
                          <span className="text-[10px] uppercase text-stone-400 block">Avg Score</span>
                          <span className="text-amber-400 font-bold text-xl">{d.avgRating}</span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase text-stone-400 block">Reviews</span>
                          <span className="font-bold text-xl">{d.count}</span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase text-stone-400 block">Top Score</span>
                          <span className="font-bold text-xl">{d.topScore}</span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="avgRating" radius={[0, 8, 8, 0]} barSize={20}>
              {data.slice(0, 15).map((entry, index) => (
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

      <div className="mt-6 pt-4 border-t border-stone-100">
        <p className="text-sm text-stone-500">
          <span className="font-bold text-amber-600">{data[0]?.roaster}</span> leads with an average
          score of <span className="font-bold">{data[0]?.avgRating}</span> across{' '}
          {data[0]?.count} reviews, with a top individual score of {data[0]?.topScore}.
        </p>
      </div>
    </div>
  );
}
