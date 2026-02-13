'use client';

import { CoffeeReview } from '@/utils/supabase-data';
import { KPICards } from './kpi-cards';
import { CoffeeGrid } from './coffee-grid';
import { DashboardHero } from './dashboard-hero';
import { Clock, Activity } from 'lucide-react';

function SystemStatus({ lastUpdated }: { lastUpdated?: string }) {
    // Format the date if it exists
    const dateStr = lastUpdated ? new Date(lastUpdated).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
    }) : 'Unknown';

    return (
        <div className="flex items-center gap-4 bg-white/50 border border-stone-200/50 px-4 py-2 rounded-full shadow-sm backdrop-blur-sm">
            <div className="flex items-center gap-2">
                <div className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </div>
                <span className="text-xs font-bold text-stone-600 uppercase tracking-wider">Pipeline Online</span>
            </div>
            <div className="w-px h-4 bg-stone-200" />
            <div className="flex items-center gap-1.5 text-stone-500">
                <Activity size={12} />
                <span className="text-[10px] font-mono">LAST RUN: {dateStr}</span>
            </div>
        </div>
    );
}

export function DashboardView({ data, totalCount }: { data: CoffeeReview[], totalCount: number }) {
    const lastUpdated = data.length > 0 ? data[0].created_at : undefined;

    return (
        <div className="space-y-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="text-4xl font-serif font-bold text-[#1F1815]">Command Center</h1>
                <SystemStatus lastUpdated={lastUpdated} />
            </div>

            <DashboardHero />

            {/* Operational Overview - Simplified to just key numbers */}
            <section>
                <KPICards data={data} totalCount={totalCount} />
            </section>

            {/* Recent Activity Feed - The Main Focus */}
            <section className="pt-8 border-t border-stone-200/50">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-stone-900 flex items-center justify-center text-white">
                            <Clock size={20} />
                        </div>
                        <div>
                            <h2 className="text-3xl font-serif font-bold tracking-tight">Recent Additions</h2>
                            <p className="text-stone-500 text-sm font-medium uppercase tracking-widest">Live feed from the scraper</p>
                        </div>
                    </div>
                    <a href="/reviews" className="text-sm font-bold text-primary hover:text-primary-dark transition-colors uppercase tracking-widest flex items-center gap-2">
                        View full archive
                        <div className="w-6 h-px bg-primary" />
                    </a>
                </div>

                {/* Show more cards here since it's the main focus now */}
                <CoffeeGrid data={data.slice(0, 12)} />
            </section>
        </div>
    );
}
