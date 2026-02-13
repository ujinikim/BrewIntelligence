'use client';

import { CoffeeReview } from '@/utils/supabase-data';
import { ArrowUpRight, MapPin, Sparkles } from 'lucide-react';
import { cleanDescription } from '@/utils/formatters';

interface ReviewCardProps {
    bean: CoffeeReview;
    idx?: number;
    priority?: boolean;
}

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

export function ReviewCard({ bean, idx = 0, priority = false }: ReviewCardProps) {
    const description = cleanDescription(bean.review || bean.blind_assessment);

    return (
        <div
            className="group relative bg-white/90 backdrop-blur-xl rounded-[2rem] border border-stone-200/50 p-6 shadow-sm hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)] hover:bg-white hover:border-stone-300/50 hover:-translate-y-1 transition-all duration-500 flex flex-col h-full animate-in fade-in slide-in-from-bottom-8 duration-700 overflow-hidden"
            style={{ animationDelay: `${idx * 50}ms`, minHeight: '380px' }}
        >
            {/* Rating Badge */}
            <div className="absolute top-6 left-6 w-12 h-12 bg-stone-900 rounded-2xl flex items-center justify-center font-serif font-bold text-lg text-white shadow-xl z-10 group-hover:rotate-3 transition-transform">
                {bean.rating || '—'}
            </div>

            {/* Header: Link (Top Right) */}
            <div className="flex justify-end items-start mb-4 min-h-12 relative z-10">
                {bean.url && (
                    <a
                        href={bean.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-xl bg-white/50 border border-stone-200/50 flex items-center justify-center text-stone-300 hover:text-primary hover:bg-white hover:border-primary/30 transition-all shadow-sm backdrop-blur-sm"
                    >
                        <ArrowUpRight size={18} />
                    </a>
                )}
            </div>

            {/* Title & Metadata */}
            <div className="mb-4 flex-shrink-0 relative z-10">
                <div className="flex items-center gap-2 mb-2">
                    {bean.roast_category && (
                        <span className="px-2 py-0.5 bg-amber-100/50 border border-amber-200/50 rounded-md text-[9px] font-bold text-amber-700 uppercase tracking-wider backdrop-blur-sm">
                            {bean.roast_category}
                        </span>
                    )}
                    <span className="text-[10px] text-stone-400 font-bold uppercase tracking-[0.2em]">
                        {bean.roaster}
                    </span>
                </div>
                <h4 className="font-serif font-bold text-xl text-[#1F1815] line-clamp-2 leading-tight tracking-tight group-hover:text-primary transition-colors">
                    {bean.title}
                </h4>
            </div>

            {/* Stats Grid - Glassmorphic */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-4 bg-stone-100/30 backdrop-blur-md p-4 rounded-2xl border border-stone-200/40 shadow-[inset_0_1px_4px_rgba(0,0,0,0.01)] flex-shrink-0 relative z-10">
                <StatBar label="Aroma" value={bean.aroma} />
                <StatBar label="Acidity" value={bean.acidity} />
                <StatBar label="Body" value={bean.body} />
                <StatBar label="Flavor" value={bean.flavor} />
            </div>

            {/* Review Text - Fixed height with proper overflow */}
            {description && (
                <div className="flex-grow min-h-0 mb-4 overflow-hidden">
                    <p className="text-stone-500 italic text-sm line-clamp-3 leading-relaxed font-serif">
                        "{description}"
                    </p>
                </div>
            )}

            {/* Footer - Price & Origin */}
            <div className="flex flex-wrap items-center justify-between gap-3 mt-auto pt-4 border-t border-stone-100/50 flex-shrink-0">
                <div className="flex items-center gap-2 text-stone-900 font-bold text-xs bg-stone-100 px-2.5 py-1 rounded-lg">
                    <Sparkles size={12} className="text-amber-500" />
                    {bean.price_per_oz_usd && bean.price_per_oz_usd > 0
                        ? `$${bean.price_per_oz_usd.toFixed(2)}/oz`
                        : (bean.price && bean.price !== 'N/A' ? bean.price : 'Price N/A')}
                </div>

                <div className="flex items-center gap-1.5 text-[9px] font-bold text-stone-400 uppercase tracking-widest">
                    <MapPin size={10} className="text-primary flex-shrink-0" />
                    <span className="max-w-[80px] truncate">
                        {bean.country || (bean.origin && bean.origin !== 'Unknown' ? bean.origin : 'Global')}
                    </span>
                </div>
            </div>
        </div>
    );
}
