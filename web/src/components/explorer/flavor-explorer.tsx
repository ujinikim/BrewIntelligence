'use client';

import { useState, useMemo } from 'react';
import { Coffee } from '@/utils/data';
import { Search, Sparkles, X, Tag } from 'lucide-react';

// SCAA Standard Flavor Taxonomy
const FLAVOR_TAXONOMY = [
  "Fruity", "Floral", "Chocolate", "Nutty", "Spice", 
  "Sweet", "Berry", "Citrus", "Caramel", "Vanilla", 
  "Herbal", "Roast", "Savory", "Cocoa", "Jasmine"
];

export function FlavorExplorer({ data }: { data: Coffee[] }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Coffee[]>([]);

  // Calculate Tag Frequency
  const flavorTags = useMemo(() => {
    const counts: Record<string, number> = {};
    
    // Initialize counts
    FLAVOR_TAXONOMY.forEach(tag => counts[tag] = 0);

    // Count occurrences in reviews
    data.forEach(bean => {
      const text = (bean.review || '').toLowerCase();
      FLAVOR_TAXONOMY.forEach(tag => {
        if (text.includes(tag.toLowerCase())) {
          counts[tag]++;
        }
      });
    });

    // Convert to array and sort by frequency
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .filter(([, count]) => count > 0) // Only show found tags
      .slice(0, 15); // Top 15
  }, [data]);

  const handleSearch = async (term: string) => {
    setQuery(term);
    
    if (term.length < 2) {
      setResults([]);
      return;
    }

    try {
      // Fetch from Serverless API
      const res = await fetch(`/api/search?q=${encodeURIComponent(term)}`);
      const data = await res.json();
      
      if (data.results) {
        setResults(data.results);
      }
    } catch (error) {
      console.error("Search failed", error);
    }
  };

  return (
    <div className="mb-8">
      {/* Search Input */}
      <div className="relative group z-20">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Sparkles size={18} className="text-[#d97706]" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Filter by flavor... (e.g. 'Jasmine' or click below)"
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
        {results.length > 0 && query.length >= 2 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg border border-[#e5e5e5] shadow-xl overflow-hidden">
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

      {/* Flavor Cloud Tags */}
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="flex items-center gap-1 text-xs font-bold text-[#1F1815]/40 uppercase tracking-wider mr-2">
            <Tag size={12} />
            Trending Notes:
        </span>
        {flavorTags.map(([tag, count]) => (
            <button
                key={tag}
                onClick={() => handleSearch(tag)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                    query.toLowerCase() === tag.toLowerCase()
                        ? 'bg-[#1F1815] text-white shadow-md'
                        : 'bg-[#F6F5F3] text-[#1F1815]/70 hover:bg-[#e5e5e5] hover:text-[#1F1815]'
                }`}
            >
                {tag} <span className="opacity-50 text-xs ml-1">({count})</span>
            </button>
        ))}
      </div>
    </div>
  );
}
