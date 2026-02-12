'use client';

import { PriceTier } from '@/utils/insights-data';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

const TIER_COLORS: Record<string, string> = {
  Budget: '#86efac',
  'Mid-Range': '#fbbf24',
  Premium: '#f97316',
  Luxury: '#a855f7',
};

const TIER_ICONS: Record<string, string> = {
  Budget: '💰',
  'Mid-Range': '☕',
  Premium: '✨',
  Luxury: '👑',
};

export function PriceTiers({ data }: { data: PriceTier[] }) {
  const totalWithPrice = data.reduce((a, b) => a + b.count, 0);

  return (
    <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-stone-200/50 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-green-500/30 via-yellow-500/20 via-orange-500/20 to-purple-500/30" />

      <div className="mb-8">
        <h3 className="text-2xl font-serif font-bold text-stone-900 tracking-tight">
          Price Tier Analysis
        </h3>
        <p className="text-stone-400 text-xs font-bold uppercase tracking-widest mt-1">
          Does paying more actually get you better coffee?
        </p>
      </div>

      {/* Tier Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {data.map((tier) => (
          <div
            key={tier.tier}
            className="rounded-2xl border border-stone-200/50 p-5 text-center relative overflow-hidden"
          >
            <div
              className="absolute inset-0 opacity-[0.04]"
              style={{ backgroundColor: TIER_COLORS[tier.tier] }}
            />
            <span className="text-2xl">{TIER_ICONS[tier.tier]}</span>
            <h4 className="text-sm font-bold text-stone-700 mt-2">{tier.tier}</h4>
            <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">{tier.range}</p>
            <div className="mt-3 space-y-1">
              <p className="text-2xl font-bold" style={{ color: TIER_COLORS[tier.tier] }}>
                {tier.avgRating || '—'}
              </p>
              <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Avg Score</p>
              <p className="text-xs text-stone-500">
                {tier.count.toLocaleString()} beans ({totalWithPrice > 0 ? ((tier.count / totalWithPrice) * 100).toFixed(0) : 0}%)
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Bar Chart */}
      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
            <XAxis
              dataKey="tier"
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
                  const d = payload[0].payload as PriceTier;
                  return (
                    <div className="bg-stone-900 text-white p-4 rounded-xl shadow-2xl border border-white/10">
                      <p className="font-serif font-bold text-lg">{TIER_ICONS[d.tier]} {d.tier}</p>
                      <p className="text-xs text-stone-400">{d.range}</p>
                      <div className="flex gap-6 mt-2">
                        <div>
                          <span className="text-[10px] uppercase text-stone-400 block">Avg Score</span>
                          <span className="text-amber-400 font-bold text-xl">{d.avgRating}</span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase text-stone-400 block">Count</span>
                          <span className="font-bold text-xl">{d.count.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase text-stone-400 block">Range</span>
                          <span className="font-bold text-xl">{d.minRating}–{d.maxRating}</span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="avgRating" radius={[8, 8, 0, 0]} barSize={56}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={TIER_COLORS[entry.tier] || '#d6d3d1'}
                  className="cursor-pointer transition-opacity hover:opacity-80"
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 pt-4 border-t border-stone-100">
        <p className="text-sm text-stone-500">
          Higher-priced coffees do tend to achieve better scores, but the{' '}
          <span className="font-bold text-amber-600">Mid-Range ($1.50–$3/oz)</span> tier offers the
          best value proposition with strong ratings at accessible prices.
        </p>
      </div>
    </div>
  );
}
