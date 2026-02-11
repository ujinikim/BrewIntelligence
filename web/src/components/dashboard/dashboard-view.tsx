'use client';

import { CoffeeReview } from '@/utils/supabase-data';
import { KPICards } from './kpi-cards';
import { OriginsLeaderboard } from './origins-leaderboard';
import { QuickStats } from './quick-stats';
import { RecentHighScorers } from './recent-high-scorers';
import { CoffeeGrid } from './coffee-grid';
import { DashboardHero } from './dashboard-hero';
import { BarChart3, Clock } from 'lucide-react';

export function DashboardView({ data, totalCount }: { data: CoffeeReview[], totalCount: number }) {
  return (
    <div className="space-y-16">
        <DashboardHero />

        <section>
            <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                    <BarChart3 size={20} />
                </div>
                <div>
                    <h2 className="text-3xl font-serif font-bold tracking-tight">Market Analytics</h2>
                    <p className="text-stone-500 text-sm font-medium uppercase tracking-widest">Real-time data from {totalCount} reviews</p>
                </div>
            </div>
            <KPICards data={data} totalCount={totalCount} />
            
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_286px] gap-6 mt-12 items-stretch">
                <OriginsLeaderboard data={data} />
                <div className="flex flex-col gap-4">
                    <QuickStats data={data} totalCount={totalCount} />
                    <RecentHighScorers data={data} />
                </div>
            </div>
        </section>

        <section className="pt-16 border-t border-stone-200/50">
            <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-stone-900 flex items-center justify-center text-white">
                        <Clock size={20} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-serif font-bold tracking-tight">Recent Additions</h2>
                        <p className="text-stone-500 text-sm font-medium uppercase tracking-widest">The latest expert cuppings</p>
                    </div>
                </div>
                <a href="/reviews" className="text-sm font-bold text-primary hover:text-primary-dark transition-colors uppercase tracking-widest flex items-center gap-2">
                    View full archive
                    <div className="w-6 h-px bg-primary" />
                </a>
            </div>
            <CoffeeGrid data={data.slice(0, 6)} /> 
        </section>
    </div>
  );
}
