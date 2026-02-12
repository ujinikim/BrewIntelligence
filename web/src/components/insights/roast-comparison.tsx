'use client';

import { RoastStats } from '@/utils/insights-data';

const ROAST_CONFIG: Record<string, { dot: string; badge: string; label: string }> = {
  Light: { dot: 'bg-amber-400', badge: 'bg-amber-50 text-amber-700', label: 'Bright & Fruity' },
  Medium: { dot: 'bg-orange-400', badge: 'bg-orange-50 text-orange-700', label: 'Balanced & Sweet' },
  Dark: { dot: 'bg-stone-700', badge: 'bg-stone-100 text-stone-700', label: 'Bold & Rich' },
};

const FLAVOR_KEYS = [
  { key: 'avgAroma', label: 'Aroma' },
  { key: 'avgAcidity', label: 'Acidity' },
  { key: 'avgBody', label: 'Body' },
  { key: 'avgFlavor', label: 'Flavor' },
  { key: 'avgAftertaste', label: 'Aftertaste' },
] as const;

export function RoastComparison({ data }: { data: RoastStats[] }) {
  return (
    <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-stone-200/50 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-orange-500/30 via-amber-500/20 to-stone-500/30" />

      <div className="mb-8">
        <h3 className="text-2xl font-serif font-bold text-stone-900 tracking-tight">
          Roast Level Comparison
        </h3>
        <p className="text-stone-400 text-xs font-bold uppercase tracking-widest mt-1">
          Light vs. Medium vs. Dark — side by side
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {data.map((roast) => {
          const config = ROAST_CONFIG[roast.roast] || ROAST_CONFIG.Medium;
          return (
            <div
              key={roast.roast}
              className="rounded-2xl border border-stone-200/60 p-6 flex flex-col"
            >
              {/* Name + badge */}
              <div className="flex items-center gap-2.5 mb-1">
                <div className={`w-3 h-3 rounded-full ${config.dot} shrink-0`} />
                <h4 className="text-lg font-bold text-stone-900">{roast.roast}</h4>
              </div>
              <p className="text-[11px] text-stone-400 font-medium tracking-wide uppercase mb-5">
                {config.label} · {roast.count.toLocaleString()} beans
              </p>

              {/* Hero stat */}
              <div className="text-center py-4 mb-5 rounded-xl bg-stone-50/80">
                <span className="text-4xl font-bold text-stone-900 tracking-tight">
                  {roast.avgRating}
                </span>
                <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mt-1">
                  avg rating
                </p>
              </div>

              {/* Price */}
              <div className="flex justify-between items-center text-sm mb-4 pb-4 border-b border-stone-100">
                <span className="text-stone-400 font-medium">Avg $/oz</span>
                <span className="font-bold text-stone-700">
                  {roast.avgPrice ? `$${roast.avgPrice.toFixed(2)}` : 'N/A'}
                </span>
              </div>

              {/* Flavor scores */}
              <div className="space-y-2">
                {FLAVOR_KEYS.map(({ key, label }) => {
                  const value = roast[key as keyof RoastStats] as number;
                  return (
                    <div key={key} className="flex justify-between items-baseline">
                      <span className="text-xs text-stone-400">{label}</span>
                      <span className="flex-1 border-b border-dotted border-stone-200 mx-2 mb-1" />
                      <span className="text-sm font-bold text-stone-700 tabular-nums">
                        {value}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-stone-100">
        <p className="text-sm text-stone-500">
          <span className="font-bold text-amber-600">Light roasts</span> tend to score higher in
          acidity and aroma, while <span className="font-bold text-stone-700">dark roasts</span> excel
          in body — reflecting the fundamental chemistry of the roasting process.
        </p>
      </div>
    </div>
  );
}
