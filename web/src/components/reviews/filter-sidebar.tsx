'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { Search, Filter, X } from 'lucide-react';

interface FilterSidebarProps {
  countries: string[];
  years: number[];
}

export function FilterSidebar({ countries, years }: FilterSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Initialize state from URL
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [country, setCountry] = useState(searchParams.get('country') || 'All');
  const [roast, setRoast] = useState(searchParams.get('roast') || 'All');
  const [minRating, setMinRating] = useState(searchParams.get('minRating') || '');
  const [year, setYear] = useState(searchParams.get('year') || '');

  // Debounce search update
  useEffect(() => {
    const timer = setTimeout(() => {
      if (search !== (searchParams.get('search') || '')) {
        updateFilter('search', search);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Update URL helper
  const updateFilter = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== 'All') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    
    // Reset to page 1 on filter change
    params.set('page', '1');
    
    router.push(`${pathname}?${params.toString()}`);
  }, [searchParams, router, pathname]);

  const clearFilters = () => {
    setSearch('');
    setCountry('All');
    setRoast('All');
    setMinRating('');
    setYear('');
    router.push(pathname);
  };

  return (
    <div className="w-full lg:w-64 flex-shrink-0 space-y-8">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-widest text-stone-500 flex items-center gap-2">
          <Filter size={14} /> Filters
        </h3>
        {(search || country !== 'All' || roast !== 'All' || minRating || year) && (
          <button 
            onClick={clearFilters}
            className="text-xs text-stone-400 hover:text-primary flex items-center gap-1 transition-colors"
          >
            <X size={12} /> Clear
          </button>
        )}
      </div>

      {/* Search */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-stone-900">Search</label>
        <div className="relative">
          <input
            type="text"
            placeholder="Bean or Roaster..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 pl-9 bg-white border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
          />
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
        </div>
      </div>

      {/* Roast Level */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-stone-900">Roast Level</label>
        <select
          value={roast}
          onChange={(e) => {
            setRoast(e.target.value);
            updateFilter('roast', e.target.value);
          }}
          className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 cursor-pointer"
        >
          <option value="All">All Roasts</option>
          <option value="Light">Light</option>
          <option value="Medium">Medium</option>
          <option value="Dark">Dark</option>
        </select>
      </div>

      {/* Min Rating */}
      <div className="space-y-2">
        <div className="flex justify-between">
          <label className="text-xs font-bold text-stone-900">Min Rating</label>
          <span className="text-xs text-stone-500">{minRating ? `${minRating}+` : 'Any'}</span>
        </div>
        <input
          type="range"
          min="80"
          max="100"
          step="1"
          value={minRating || 80}
          onChange={(e) => {
            setMinRating(e.target.value);
            updateFilter('minRating', e.target.value);
          }}
          className="w-full accent-primary h-1 bg-stone-200 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-stone-400 font-mono">
          <span>80</span>
          <span>90</span>
          <span>100</span>
        </div>
      </div>

      {/* Origin */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-stone-900">Origin</label>
        <select
          value={country}
          onChange={(e) => {
            setCountry(e.target.value);
            updateFilter('country', e.target.value);
          }}
          className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 cursor-pointer"
        >
          <option value="All">All Countries</option>
          {countries.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Year */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-stone-900">Year</label>
        <select
          value={year}
          onChange={(e) => {
            setYear(e.target.value);
            updateFilter('year', e.target.value);
          }}
          className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 cursor-pointer"
        >
          <option value="">All Years</option>
          {years.map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
