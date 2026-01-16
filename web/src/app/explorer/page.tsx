'use client';

import { useState, useEffect } from 'react';
import { useDebounce } from '@/hooks/use-debounce';
import { Coffee } from '@/utils/data';
import Link from 'next/link';
import { ArrowLeft, Loader2, Coffee as CoffeeIcon, DollarSign, Star, Search, X } from 'lucide-react';
import { DashboardShell } from '@/components/dashboard-shell';

const FLAVOR_TAGS = [
  { id: 'fruity', label: 'Fruity & Bright' },
  { id: 'nutty', label: 'Nutty & Chocolaty' },
  { id: 'floral', label: 'Floral & Complex' },
  { id: 'sweet', label: 'Sweet & Syrupy' },
  { id: 'spicy', label: 'Spicy & Bold' },
];

export default function ExplorerPage() {
  const [results, setResults] = useState<Coffee[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [query, setQuery] = useState('');
  const [selectedFlavors, setSelectedFlavors] = useState<string[]>([]);

  // Debounce the combined search state
  const searchState = { query, selectedFlavors };
  const debouncedSearch = useDebounce(searchState, 500);

  const toggleFlavor = (id: string) => {
    setSelectedFlavors(prev => 
      prev.includes(id) 
        ? prev.filter(f => f !== id)
        : [...prev, id]
    );
  };

  const handleReset = () => {
    setQuery('');
    setSelectedFlavors([]);
  };

  useEffect(() => {
    // Only search if there's input
    if (!debouncedSearch.query && debouncedSearch.selectedFlavors.length === 0) {
      setResults([]);
      return;
    }

    async function fetchData() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (debouncedSearch.query) params.append('q', debouncedSearch.query);
        if (debouncedSearch.selectedFlavors.length > 0) params.append('flavors', debouncedSearch.selectedFlavors.join(','));

        const res = await fetch(`/api/search?${params.toString()}`);
        const data = await res.json();
        if (data.results) {
          setResults(data.results);
        }
      } catch (error) {
        console.error("Search failed", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [debouncedSearch]);

  return (
    <DashboardShell>
      <div className="max-w-4xl mx-auto py-8 px-4">
        
        {/* Search Console */}
        <div className="bg-white p-8 rounded-xl border border-[#E5E5E5] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] mb-12 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#D4A373] via-[#1F1815] to-[#D4A373] opacity-20" />

            <div className="flex flex-col items-center gap-6 max-w-2xl mx-auto text-center">
                <h2 className="text-3xl font-serif font-bold text-[#1F1815]">Find Your Perfect Bean</h2>
                
                {/* Search Input */}
                <div className="relative w-full">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                        <Search className="text-[#1F1815]/30" size={20} />
                    </div>
                    <input 
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Describe your dream cup (e.g., 'light roast with blueberry notes')..."
                        className="w-full pl-12 pr-4 py-4 bg-[#F9F8F6] border border-[#E5E5E5] rounded-full text-lg text-[#1F1815] placeholder:text-[#1F1815]/30 focus:outline-none focus:ring-2 focus:ring-[#D4A373]/50 transition-all font-medium"
                    />
                    {query && (
                        <button 
                            onClick={() => setQuery('')}
                            className="absolute inset-y-0 right-4 flex items-center text-[#1F1815]/30 hover:text-[#1F1815] transition-colors"
                        >
                            <X size={18} />
                        </button>
                    )}
                </div>

                {/* Flavor Tags */}
                <div className="flex flex-wrap justify-center gap-2">
                    {FLAVOR_TAGS.map(tag => {
                        const isSelected = selectedFlavors.includes(tag.id);
                        return (
                            <button
                                key={tag.id}
                                onClick={() => toggleFlavor(tag.id)}
                                className={`px-4 py-2 rounded-full text-sm font-bold tracking-wide transition-all border ${
                                    isSelected 
                                    ? 'bg-[#1F1815] text-white border-[#1F1815]' 
                                    : 'bg-white text-[#1F1815]/60 border-[#E5E5E5] hover:border-[#D4A373] hover:text-[#1F1815]'
                                }`}
                            >
                                {tag.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {loading && (
                <div className="absolute top-4 right-4">
                    <Loader2 className="animate-spin text-[#D4A373]" size={20} />
                </div>
            )}
        </div>

        {/* Results List */}
        <div className="space-y-4">
            {/* Empty State / Prompt */}
            {results.length === 0 && !loading && !query && selectedFlavors.length === 0 && (
                <div className="text-center py-20 opacity-50">
                    <CoffeeIcon className="mx-auto mb-4 text-[#D4A373]" size={48} />
                    <p className="text-lg font-serif">Start typing or select a flavor to explore.</p>
                </div>
            )}

             {/* No Results State */}
             {results.length === 0 && !loading && (query || selectedFlavors.length > 0) && (
                <div className="text-center py-20 opacity-50">
                    <p className="text-lg">No beans found matching your criteria.</p>
                    <button onClick={handleReset} className="text-[#D4A373] hover:underline font-bold mt-2">Clear Search</button>
                </div>
            )}

            {results.map((bean, i) => (
                <div key={i} className="bg-white p-6 rounded-xl border border-[#e5e5e5] hover:border-[#D4A373]/50 hover:shadow-md transition-all group animate-in fade-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: `${i * 50}ms` }}>
                    <div className="flex flex-col md:flex-row gap-6">
                        {/* Left: Key Info */}
                        <div className="md:w-1/4 flex flex-col gap-2 shrink-0">
                             <div className="flex items-start justify-between">
                                <span className={`text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider ${
                                    bean.roast === 'Dark' ? 'bg-amber-950 text-amber-100' :
                                    bean.roast === 'Medium-Dark' ? 'bg-amber-900 text-amber-100' :
                                    bean.roast === 'Medium' ? 'bg-amber-700 text-amber-100' :
                                    'bg-amber-100 text-amber-900'
                                }`}>
                                    {bean.roast}
                                </span>
                                {(bean as any).similarity && (
                                     <span className="text-xs font-mono text-green-600 bg-green-50 px-2 py-1 rounded-full" title="AI Confidence Score">
                                        {((bean as any).similarity * 100).toFixed(0)}% Match
                                     </span>
                                )}
                             </div>
                             <h3 className="font-serif font-bold text-xl leading-tight group-hover:text-[#D4A373] transition-colors">{bean.name}</h3>
                             <p className="text-sm font-medium text-[#1F1815]/60">{bean.roaster}</p>
                             <div className="flex items-center gap-4 mt-auto pt-4">
                                <div className="flex items-center gap-1 font-bold text-[#1F1815]">
                                    <Star size={16} className="fill-yellow-400 text-yellow-400" />
                                    {bean.rating}
                                </div>
                                <div className="flex items-center gap-1 font-medium text-[#1F1815]/60">
                                    <DollarSign size={14} />
                                    {bean['100g_USD'].toFixed(2)}/100g
                                </div>
                             </div>
                        </div>

                        {/* Right: Description */}
                        <div className="md:w-3/4 border-l border-[#f0f0f0] md:pl-6 pt-4 md:pt-0">
                                "{bean.review}"
                             
                             <div className="mt-4 flex flex-wrap gap-2">
                                <span className="text-xs font-bold text-[#1F1815]/40 uppercase tracking-widest mr-2 py-1">Origin:</span>
                                {bean.origin.split(',').map((o, idx) => (
                                    <span key={idx} className="text-xs bg-[#F6F5F3] px-2 py-1 rounded-md text-[#1F1815]/70">
                                        {o.trim()}
                                    </span>
                                ))}
                             </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>

      </div>
    </DashboardShell>
  );
}
