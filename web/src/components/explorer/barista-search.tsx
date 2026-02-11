'use client';

import { useState } from 'react';
import { Coffee } from '@/utils/data';
import { Search, Sparkles, X } from 'lucide-react';

export function BaristaSearch({ data }: { data: Coffee[] }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Coffee[]>([]);

  const handleSearch = (term: string) => {
    setQuery(term);
    
    if (term.length < 2) {
      setResults([]);
      return;
    }

    const lowerTerm = term.toLowerCase();
    
    // Simple keyword matching for now
    const matches = data.filter(d => {
        const desc = (d.review || '').toLowerCase();
        const name = (d.name || '').toLowerCase();
        return desc.includes(lowerTerm) || name.includes(lowerTerm);
    });

    // Sort by Value Score (Best Value first)
    const sorted = matches.sort((a, b) => b.value_score - a.value_score).slice(0, 5);
    setResults(sorted);
  };

  return (
    <div className="relative mb-8 group">
      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
        <Sparkles size={18} className="text-[#d97706]" />
      </div>
      <input
        type="text"
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Ask the Barista... (e.g., 'fruity', 'chocolate', 'ethiopia')"
        className="w-full pl-12 pr-4 py-4 bg-white border border-[#e5e5e5] rounded-xl shadow-sm text-lg font-serif placeholder:font-sans placeholder:text-[#1F1815]/40 focus:outline-none focus:ring-2 focus:ring-[#1F1815]/10 transition-all"
      />
      {query && (
        <button 
            onClick={() => handleSearch('')}
            className="absolute inset-y-0 right-4 flex items-center text-[#1F1815]/30 hover:text-[#1F1815]/60"
        >
            <X size={18} />
        </button>
      )}

      {/* Results Dropdown */}
      {results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg border border-[#e5e5e5] shadow-xl z-50 overflow-hidden">
            <div className="px-4 py-2 bg-[#F6F5F3] border-b border-[#e5e5e5] text-xs font-bold text-[#1F1815]/60 uppercase tracking-wider flex justify-between">
                <span>Top Recommendations</span>
                <span>Sorted by Value</span>
            </div>
            <ul>
                {results.map((bean, idx) => (
                    <li key={idx} className="p-4 border-b border-[#f0f0f0] last:border-0 hover:bg-[#F6F5F3]/50 transition-colors cursor-default">
                        <div className="flex justify-between items-start mb-1">
                            <span className="font-bold text-[#1F1815]">{bean.name}</span>
                            <span className="font-bold text-[#d97706] text-sm">+{bean.value_score.toFixed(1)} Value</span>
                        </div>
                        <p className="text-sm text-[#1F1815]/70 mb-2 line-clamp-2">{bean.review}</p>
                        <div className="flex items-center gap-4 text-xs font-medium text-[#1F1815]/50">
                            <span>{bean.origin}</span>
                            <span>${bean['100g_USD'].toFixed(2)} / 100g</span>
                            <span>{bean.rating} pts</span>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
      )}
    </div>
  );
}
