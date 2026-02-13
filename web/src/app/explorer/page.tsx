'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useDebounce } from '@/hooks/use-debounce';
import { CoffeeReview } from '@/utils/supabase-data';
import Link from 'next/link';
import { Loader2, Coffee as CoffeeIcon, MapPin, Star, Search, X, Flame, Sparkles } from 'lucide-react';
import { DashboardShell } from '@/components/shared/dashboard-shell';
import { cn } from '@/utils/cn';

const FLAVOR_TAGS = [
    { id: 'fruity', label: 'Fruity & Bright' },
    { id: 'nutty', label: 'Nutty & Chocolaty' },
    { id: 'floral', label: 'Floral & Complex' },
    { id: 'sweet', label: 'Sweet & Syrupy' },
    { id: 'spicy', label: 'Spicy & Bold' },
];

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

function ExplorerContent() {
    const searchParams = useSearchParams();
    const initialQuery = searchParams.get('q') || '';

    const [results, setResults] = useState<CoffeeReview[]>([]);
    const [loading, setLoading] = useState(false);

    const [query, setQuery] = useState(initialQuery);
    const [selectedFlavors, setSelectedFlavors] = useState<string[]>([]);

    const debouncedQuery = useDebounce(query, 500);
    const debouncedFlavors = useDebounce(selectedFlavors.join(','), 500);

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
        if (!debouncedQuery && !debouncedFlavors) {
            setResults([]);
            return;
        }

        async function fetchData() {
            setLoading(true);
            try {
                const params = new URLSearchParams();
                if (debouncedQuery) params.append('q', debouncedQuery);
                if (debouncedFlavors) params.append('flavors', debouncedFlavors);

                const res = await fetch(`/api/search?${params.toString()}`);
                const data = await res.json();
                setResults(data.results || []);
            } catch (error) {
                console.error("Search failed", error);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [debouncedQuery, debouncedFlavors]);

    return (
        <div className="max-w-5xl mx-auto py-12 px-6">

            {/* Search Console */}
            <div className="glass p-12 rounded-[3rem] shadow-2xl border border-stone-200/50 mb-16 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/5 rounded-full blur-[80px] pointer-events-none" />

                <div className="flex flex-col items-center gap-8 max-w-2xl mx-auto text-center relative z-10">
                    <div className="w-16 h-16 bg-stone-900 rounded-[1.5rem] flex items-center justify-center text-white mb-2 rotate-3 hover:rotate-0 transition-transform shadow-xl">
                        <Search size={32} />
                    </div>
                    <h2 className="text-5xl font-serif font-bold text-stone-900 tracking-tight">AI Flavor Explorer</h2>
                    <p className="text-stone-500 font-light text-xl leading-relaxed">Describe the profile you desire, and our neural engine will match it against thousands of expert cuppings.</p>

                    <div className="relative w-full group mt-4">
                        <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                            <Sparkles className="text-primary/40 group-focus-within:text-primary transition-colors" size={24} />
                        </div>
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="e.g., 'vibrant ethiopian with jasmine and lemon'..."
                            className="w-full pl-16 pr-16 py-6 bg-white border border-stone-200 rounded-[2rem] text-xl text-stone-900 placeholder:text-stone-300 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/30 transition-all font-medium shadow-sm"
                        />
                        {query && (
                            <button
                                onClick={() => setQuery('')}
                                className="absolute inset-y-0 right-6 flex items-center text-stone-300 hover:text-stone-900 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        )}
                    </div>

                    <div className="flex flex-wrap justify-center gap-3 mt-2">
                        {FLAVOR_TAGS.map(tag => {
                            const isSelected = selectedFlavors.includes(tag.id);
                            return (
                                <button
                                    key={tag.id}
                                    onClick={() => toggleFlavor(tag.id)}
                                    className={cn(
                                        "px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all border shadow-sm",
                                        isSelected
                                            ? "bg-stone-900 text-white border-stone-900 shadow-xl"
                                            : "bg-white text-stone-500 border-stone-200 hover:border-primary hover:text-primary hover:shadow-md"
                                    )}
                                >
                                    {tag.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {loading && (
                    <div className="absolute top-8 right-8">
                        <Loader2 className="animate-spin text-primary" size={28} />
                    </div>
                )}
            </div>

            {/* Results List */}
            <div className="space-y-8">
                {results.length === 0 && !loading && !query && selectedFlavors.length === 0 && (
                    <div className="text-center py-32 opacity-20 group">
                        <div className="relative inline-block">
                            <CoffeeIcon className="mx-auto mb-8 text-stone-900 group-hover:scale-110 transition-transform duration-700" size={100} />
                            <Sparkles className="absolute -top-4 -right-4 text-primary" size={32} />
                        </div>
                        <p className="text-3xl font-serif italic text-stone-900">Your discovery starts here.</p>
                    </div>
                )}

                {results.length === 0 && !loading && (query || selectedFlavors.length > 0) && (
                    <div className="text-center py-24 glass rounded-[3rem] border-2 border-dashed border-stone-200 shadow-inner">
                        <p className="text-2xl text-stone-400 font-serif mb-6">No beans matched that specific signature.</p>
                        <button onClick={handleReset} className="bg-stone-900 text-white px-10 py-4 rounded-2xl font-bold uppercase tracking-widest hover:bg-stone-800 transition-all shadow-xl">Reset Explorer</button>
                    </div>
                )}

                {results.map((bean, i) => (
                    <div key={bean.id} className="group glass bg-white p-10 rounded-[3rem] hover:shadow-[0_30px_60px_rgba(0,0,0,0.08)] transition-all flex flex-col md:flex-row gap-10 animate-in fade-in slide-in-from-bottom-8 duration-700" style={{ animationDelay: `${i * 100}ms` }}>
                        {/* Visual Side */}
                        <div className="md:w-1/4 flex flex-col gap-6">
                            <div className="flex items-center justify-between">
                                <div className="bg-stone-900 text-white font-serif font-bold w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-2xl shadow-2xl group-hover:rotate-6 transition-transform">
                                    {bean.rating}
                                </div>
                                {(bean as any).similarity && (
                                    <div className="flex flex-col items-end">
                                        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Match</span>
                                        <div className="px-3 py-1 bg-amber-500/10 rounded-full border border-amber-500/20">
                                            <span className="text-sm font-mono font-bold text-amber-600">
                                                {((bean as any).similarity * 100).toFixed(0)}%
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div>
                                <h3 className="font-serif font-bold text-3xl leading-tight group-hover:text-primary transition-colors mb-2 tracking-tight">{bean.title}</h3>
                                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em]">{bean.roaster}</p>
                            </div>

                            <div className="space-y-3 pt-6 border-t border-stone-100">
                                <div className="flex items-center gap-3 text-xs font-bold text-stone-700 bg-stone-50 px-3 py-2 rounded-xl border border-stone-100">
                                    <Flame size={14} className="text-amber-500" />
                                    {bean.roast_level || 'Medium'}
                                </div>
                                <div className="flex items-center gap-3 text-xs font-bold text-stone-700 bg-stone-50 px-3 py-2 rounded-xl border border-stone-100">
                                    <MapPin size={14} className="text-primary" />
                                    <span className="truncate">{bean.origin || bean.roaster_location || 'Unknown Origin'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Stats Center */}
                        <div className="md:w-1/4 flex flex-col gap-5 justify-center border-x border-stone-100 px-10">
                            <StatBar label="Aroma" value={bean.aroma} />
                            <StatBar label="Acidity" value={bean.acidity} />
                            <StatBar label="Body" value={bean.body} />
                            <StatBar label="Flavor" value={bean.flavor} />
                        </div>

                        {/* Content Area */}
                        <div className="md:w-2/4 flex flex-col justify-between">
                            <div className="relative">
                                <div className="absolute -top-4 -left-4 opacity-5">
                                    <CoffeeIcon size={64} />
                                </div>
                                <p className="text-stone-600 italic leading-relaxed text-xl mb-8 font-serif relative z-10">
                                    "{bean.review || bean.blind_assessment}"
                                </p>
                            </div>

                            <div className="flex items-center justify-between mt-auto pt-8 border-t border-stone-50">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Market Price</span>
                                    <span className="text-2xl font-bold text-stone-900 tracking-tight">{bean.price || 'Price N/A'}</span>
                                </div>
                                <a
                                    href={bean.url}
                                    target="_blank"
                                    className="px-8 py-4 bg-stone-50 text-stone-900 rounded-[1.2rem] text-sm font-bold uppercase tracking-widest hover:bg-stone-900 hover:text-white transition-all border border-stone-200 shadow-sm"
                                >
                                    Full Review
                                </a>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

        </div>
    );
}

export default function ExplorerPage() {
    return (
        <DashboardShell>
            <Suspense fallback={<div className="p-32 text-center flex flex-col items-center gap-6"><Loader2 className="animate-spin text-primary" size={64} /><p className="font-serif text-2xl italic text-stone-400 animate-pulse">Initializing Neural Engine...</p></div>}>
                <ExplorerContent />
            </Suspense>
        </DashboardShell>
    );
}
