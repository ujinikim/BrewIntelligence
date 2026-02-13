'use client';

import { Search, ArrowRight, Command } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function GlobalSearch() {
    const router = useRouter();
    const [query, setQuery] = useState('');
    const [isFocused, setIsFocused] = useState(false);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            router.push(`/reviews?search=${encodeURIComponent(query)}`);
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto mb-10 relative z-10">
            <form onSubmit={handleSearch} className="relative group">
                <div className={`
            absolute -inset-1 rounded-[1.5rem] bg-gradient-to-r from-stone-200 via-stone-400 to-stone-200 opacity-20 blur-lg transition duration-500
            ${isFocused ? 'opacity-50 blur-xl' : 'group-hover:opacity-30'}
        `} />

                <div className={`
            relative flex items-center bg-white border rounded-[1.2rem] p-2 transition-all duration-300 shadow-sm
            ${isFocused
                        ? 'border-stone-400 ring-4 ring-stone-100 shadow-xl scale-[1.01]'
                        : 'border-stone-200/50 hover:border-stone-300 hover:shadow-md'
                    }
        `}>
                    <div className="pl-4 pr-3 text-stone-400">
                        <Search size={24} />
                    </div>

                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        placeholder="Find your perfect coffee..."
                        className="flex-1 h-12 bg-transparent border-none outline-none text-lg text-stone-900 placeholder:text-stone-400 font-medium"
                    />

                    <div className="flex items-center gap-2 pr-2">
                        {/* Command+K indicator removed per user request */}

                        <button
                            type="submit"
                            disabled={!query.trim()}
                            className={`
                    w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300
                    ${query.trim()
                                    ? 'bg-stone-900 text-white shadow-lg hover:bg-black hover:scale-105 active:scale-95'
                                    : 'bg-stone-100 text-stone-300 cursor-not-allowed'
                                }
                `}
                        >
                            <ArrowRight size={18} />
                        </button>
                    </div>
                </div>
            </form>

            {/* Search Hints - Restored */}
            <div className={`
        absolute top-full left-0 w-full mt-4 flex items-center justify-center gap-6 text-xs text-stone-400 font-medium transition-all duration-500
        ${isFocused ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}
      `}>
                <span className="flex items-center gap-1.5 hover:text-stone-600 cursor-pointer transition-colors" role="button" onClick={() => router.push('/reviews?country=Ethiopia')}>
                    Ethiopia
                </span>
                <span className="w-1 h-1 bg-stone-300 rounded-full" />
                <span className="flex items-center gap-1.5 hover:text-stone-600 cursor-pointer transition-colors" role="button" onClick={() => router.push('/reviews?roast=Light')}>
                    Light Roast
                </span>
                <span className="w-1 h-1 bg-stone-300 rounded-full" />
                <span className="flex items-center gap-1.5 hover:text-stone-600 cursor-pointer transition-colors" role="button" onClick={() => router.push('/reviews?minRating=95')}>
                    95+ Points
                </span>
            </div>
        </div>
    );
}
