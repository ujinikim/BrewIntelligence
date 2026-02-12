'use client';

import { PriceTier } from '@/utils/insights-data';

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
    <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-stone-200/50 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-green-500/30 via-yellow-500/20 via-orange-500/20 to-purple-500/30" />

      <div className="mb-5">
        <h3 className="text-2xl font-serif font-bold text-stone-900 tracking-tight">
          Price Tier Analysis
        </h3>
        <p className="text-stone-400 text-xs font-bold uppercase tracking-widest mt-1">
          Does paying more actually get you better coffee?
        </p>
      </div>

      {/* Tier Cards — compact horizontal layout */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {data.map((tier) => (
          <div
            key={tier.tier}
            className="rounded-xl border border-stone-200/50 px-4 py-3 relative overflow-hidden"
          >
            <div
              className="absolute inset-0 opacity-[0.04]"
              style={{ backgroundColor: TIER_COLORS[tier.tier] }}
            />
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{TIER_ICONS[tier.tier]}</span>
              <div>
                <h4 className="text-sm font-bold text-stone-700 leading-tight">{tier.tier}</h4>
                <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">{tier.range}</p>
              </div>
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-bold" style={{ color: TIER_COLORS[tier.tier] }}>
                {tier.avgRating || '—'}
              </span>
              <span className="text-[10px] text-stone-400 font-bold uppercase">avg</span>
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-[11px] text-stone-500">
                {tier.count.toLocaleString()} beans ({totalWithPrice > 0 ? ((tier.count / totalWithPrice) * 100).toFixed(0) : 0}%)
              </span>
              <span className="text-[11px] text-stone-400">
                {tier.minRating}–{tier.maxRating}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-4 border-t border-stone-100">
        <p className="text-sm text-stone-500">
          Higher-priced coffees do tend to achieve better scores, but the{' '}
          <span className="font-bold text-amber-600">Mid-Range ($1.50–$3/oz)</span> tier offers the
          best value proposition with strong ratings at accessible prices.
        </p>
      </div>
    </div>
  );
}
