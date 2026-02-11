'use client';

import { CoffeeReview } from '@/utils/supabase-data';
import { ArrowUpRight, MapPin, Sparkles, Coffee } from 'lucide-react';

function StatBar({ label, value }: { label: string; value?: number }) {
  if (value === undefined || value === null) return null;
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-[8px] uppercase font-bold tracking-widest text-stone-400">
        <span>{label}</span>
        <span className="text-stone-900">{value}</span>
      </div>
      <div className="h-1 w-full bg-stone-100 rounded-full overflow-hidden">
        <div 
            className="h-full bg-primary rounded-full transition-all duration-1000 ease-out" 
            style={{ width: `${(value / 10) * 100}%` }}
        />
      </div>
    </div>
  );
}

export function ReviewsGrid({ data }: { data: CoffeeReview[] }) {
  const cleanDescription = (text?: string) => {
    if (!text) return 'No review notes available for this selection.';
    let cleaned = text.replace(/^\d{2}[^.]*?(Roaster Location:|Review Date:|Aroma:)/i, '$1');
    cleaned = cleaned.replace(/^(Roaster Location:|Roast Level:|Agtron:|Review Date:|Aroma:|Acidity:|Body:|Flavor:|Blind Assessment|Notes|Who Should Drink It).*?\n/gi, '');
    cleaned = cleaned.replace(/^(Roaster Location:|Roast Level:|Agtron:|Review Date:|Aroma:|Acidity:|Body:|Flavor:|Blind Assessment|Notes|Who Should Drink It)/gi, '');
    
    return cleaned.trim() || text.trim();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {data.map((bean, idx) => (
        <div 
          key={bean.id} 
          className="group relative bg-white rounded-[2rem] border border-stone-200/60 p-8 hover:shadow-[0_20px_50px_rgba(0,0,0,0.04)] hover:-translate-y-1 transition-all duration-500 flex flex-col animate-in fade-in slide-in-from-bottom-8 duration-700 overflow-hidden"
          style={{ animationDelay: `${idx * 50}ms`, minHeight: '480px' }}
        >
          {/* Rating Badge */}
          <div className="absolute top-8 left-8 w-12 h-12 bg-stone-900 rounded-2xl flex items-center justify-center font-serif font-bold text-lg text-white shadow-xl z-10 group-hover:rotate-3 transition-transform">
             {bean.rating || '—'}
          </div>

          {/* Roast Category Badge */}
          {bean.roast_category && (
            <div className="absolute top-[2.75rem] left-24 px-3 py-1 bg-amber-50 border border-amber-200 rounded-full text-[10px] font-bold text-amber-700 uppercase tracking-wider">
              {bean.roast_category}
            </div>
          )}

          <div className="flex justify-end items-start mb-10">
            {bean.url && (
              <a 
                href={bean.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-stone-50 border border-stone-200/50 flex items-center justify-center text-stone-300 hover:text-primary hover:bg-white hover:border-primary/30 transition-all shadow-sm"
              >
                <ArrowUpRight size={18} />
              </a>
            )}
          </div>

          {/* Title & Roaster */}
          <div className="mb-6 flex-shrink-0">
            <h4 className="font-serif font-bold text-2xl text-[#1F1815] mb-2 line-clamp-2 leading-tight tracking-tight group-hover:text-primary transition-colors">
              {bean.title}
            </h4>
            <p className="text-[10px] text-stone-400 font-bold uppercase tracking-[0.2em]">
              {bean.roaster}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-4 mb-6 bg-stone-50/50 p-5 rounded-2xl border border-stone-100 flex-shrink-0">
             <StatBar label="Aroma" value={bean.aroma} />
             <StatBar label="Acidity" value={bean.acidity} />
             <StatBar label="Body" value={bean.body} />
             <StatBar label="Flavor" value={bean.flavor} />
          </div>

          {/* Review Text - Fixed height with proper overflow */}
          <div className="flex-grow min-h-0 mb-6 overflow-hidden">
            <p className="text-stone-500 italic text-sm line-clamp-4 leading-relaxed font-serif">
              "{cleanDescription(bean.review || bean.blind_assessment)}"
            </p>
          </div>

          {/* Footer - Price & Origin */}
          <div className="flex flex-wrap items-center justify-between gap-3 mt-auto pt-5 border-t border-stone-100/50 flex-shrink-0">
            <div className="flex items-center gap-2 text-stone-900 font-bold text-sm bg-stone-100 px-3 py-1.5 rounded-xl">
               <Sparkles size={14} className="text-amber-500" />
               {bean.price_per_oz_usd && bean.price_per_oz_usd > 0 
                 ? `$${bean.price_per_oz_usd.toFixed(2)}/oz` 
                 : (bean.price && bean.price !== 'N/A' ? bean.price : 'Price N/A')}
            </div>
            
            <div className="flex items-center gap-2 text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                <MapPin size={12} className="text-primary flex-shrink-0" />
                <span className="max-w-[100px] truncate">
                  {bean.country || (bean.origin && bean.origin !== 'Unknown' ? bean.origin : 'Global')}
                </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

