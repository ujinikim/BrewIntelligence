'use client';

import { useState } from 'react';
import { CoffeeReview } from '@/utils/supabase-data';
import { parsePrice, getValueScore } from '@/utils/analytics';
import { Receipt, Star, Search, Sparkles } from 'lucide-react';
import { cn } from '@/utils/cn';

export function HiddenGems({ data }: { data: CoffeeReview[] }) {
  const [activeTab, setActiveTab] = useState<'budget' | 'specialist' | 'luxury'>('budget');

  const getGems = (minPrice: number, maxPrice: number) => {
    return data
      .map(d => ({ ...d, _price: parsePrice(d.price), _score: getValueScore(d) }))
      .filter(d => d._price >= minPrice && d._price < maxPrice && d._price > 0)
      .sort((a, b) => b._score - a._score)
      .slice(0, 3);
  };

  const gems = {
    budget: getGems(0, 15),
    specialist: getGems(15, 25),
    luxury: getGems(25, 1000),
  };

  const currentGems = gems[activeTab];

  return (
    <div className="space-y-8">
      <div className="flex bg-stone-100/80 p-1 rounded-2xl">
        {[
          { id: 'budget', label: 'Budget', icon: Receipt },
          { id: 'specialist', label: 'Specialist', icon: Search },
          { id: 'luxury', label: 'Luxury', icon: Star },
        ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={cn(
                        "flex-1 flex flex-col items-center justify-center gap-1 py-3 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all",
                        isActive
                            ? "bg-white text-stone-900 shadow-sm"
                            : "text-stone-400 hover:text-stone-600"
                    )}
                >
                   <Icon size={14} className={isActive ? "text-primary" : "text-stone-300"} />
                   {tab.label}
                </button>
            );
        })}
      </div>

      <div className="space-y-4">
        {currentGems.length > 0 ? (
            currentGems.map((gem, idx) => (
            <div key={gem.id} className="group flex items-center gap-5 p-4 rounded-2xl hover:bg-white transition-all card-hover cursor-pointer border border-transparent">
                <div className="relative">
                    <div className="w-12 h-12 rounded-2xl bg-stone-900 text-white flex items-center justify-center font-serif font-bold text-lg shrink-0 shadow-lg group-hover:rotate-6 transition-transform">
                        {gem.rating}
                    </div>
                    {idx === 0 && (
                        <div className="absolute -top-2 -right-2 bg-amber-500 text-white p-1 rounded-full shadow-sm">
                            <Sparkles size={10} />
                        </div>
                    )}
                </div>
                <div className="min-w-0 flex-grow">
                    <h5 className="text-sm font-bold text-stone-900 truncate group-hover:text-primary transition-colors tracking-tight">
                        {gem.title}
                    </h5>
                    <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mt-0.5">
                        {gem.roaster} • <span className="text-primary">{gem.price && gem.price !== 'N/A' ? gem.price : 'Specialty Pricing'}</span>
                    </p>
                </div>
            </div>
            ))
        ) : (
          /* Fallback: Top beans from the whole dataset if category is empty */
          data.slice(0, 3).map((gem, idx) => (
            <div key={gem.id} className="group flex items-center gap-5 p-4 rounded-2xl hover:bg-white transition-all card-hover cursor-pointer border border-transparent">
                <div className="relative">
                    <div className="w-12 h-12 rounded-2xl bg-stone-900 text-white flex items-center justify-center font-serif font-bold text-lg shrink-0 shadow-lg group-hover:rotate-6 transition-transform">
                        {gem.rating}
                    </div>
                </div>
                <div className="min-w-0 flex-grow">
                    <h5 className="text-sm font-bold text-stone-900 truncate group-hover:text-primary transition-colors tracking-tight">
                        {gem.title}
                    </h5>
                    <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mt-0.5">
                        {gem.roaster} • <span className="text-stone-300 italic">Unlisted Price</span>
                    </p>
                </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
