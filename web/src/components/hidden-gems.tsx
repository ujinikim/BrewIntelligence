'use client';

import { useState } from 'react';
import { Coffee } from '@/utils/data';
import { Receipt, Star, Search } from 'lucide-react';

export function HiddenGems({ data }: { data: Coffee[] }) {
  const [activeTab, setActiveTab] = useState<'budget' | 'specialist' | 'luxury'>('specialist');

  // Filter and sort function
  const getGems = (minPrice: number, maxPrice: number) => {
    return data
      .filter(d => d['100g_USD'] >= minPrice && d['100g_USD'] < maxPrice && d.value_score > 0)
      .sort((a, b) => b.value_score - a.value_score)
      .slice(0, 3);
  };

  const gems = {
    budget: getGems(0, 6),
    specialist: getGems(6, 15),
    luxury: getGems(15, 1000),
  };

  return (
    <div className="mt-8 pt-6 border-t border-[#f0f0f0]">
      <h4 className="text-lg font-serif font-bold text-[#1F1815] mb-4 flex items-center gap-2">
        💎 Hidden Gems
      </h4>
      <p className="text-xs text-[#1F1815]/60 mb-4">
        Top value picks by price category.
      </p>

      {/* Tabs */}
      <div className="flex bg-[#F6F5F3] p-1 rounded-lg mb-4">
        {[
          { id: 'budget', label: 'Budget', icon: Receipt },
          { id: 'specialist', label: 'Specialist', icon: Search },
          { id: 'luxury', label: 'Luxury', icon: Star },
        ].map((tab) => {
            const Icon = tab.icon;
            return (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold rounded-md transition-all ${
                    activeTab === tab.id
                        ? 'bg-white text-[#1F1815] shadow-sm'
                        : 'text-[#1F1815]/50 hover:text-[#1F1815]/70'
                    }`}
                >
                    {activeTab === tab.id && <Icon size={12} />}
                    {tab.label}
                </button>
            )
        })}
      </div>

      {/* List */}
      <ul className="space-y-3 min-h-[220px]">
        {gems[activeTab].map((bean, idx) => (
          <li key={idx} className="bg-white p-3 rounded-md border border-[#e5e5e5] shadow-sm hover:border-[#1F1815]/20 transition-colors group cursor-default">
            <div className="flex justify-between items-start">
              <span className="font-bold text-sm text-[#1F1815] line-clamp-1 group-hover:text-[#d97706] transition-colors">{bean.name}</span>
              <span className="text-[10px] font-bold bg-[#1F1815] text-white px-1.5 py-0.5 rounded-full">
                +{bean.value_score.toFixed(1)}
              </span>
            </div>
            <div className="flex justify-between items-center mt-1 text-xs text-[#1F1815]/70">
              <span className="font-medium">${bean['100g_USD'].toFixed(2)}</span>
              <span className="flex items-center gap-1">
                {bean.rating} <span className="opacity-50">/ 100</span>
              </span>
            </div>
          </li>
        ))}
        {gems[activeTab].length === 0 && (
            <li className="text-center text-xs text-[#1F1815]/40 py-8 italic">
                No hidden gems found in this range.
            </li>
        )}
      </ul>
    </div>
  );
}
