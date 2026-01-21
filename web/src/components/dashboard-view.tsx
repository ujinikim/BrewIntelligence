'use client';

import { CoffeeReview } from '@/utils/supabase-data';
import { KPICards } from '@/components/kpi-cards';
import { PriceChart } from '@/components/price-chart';
import { HiddenGems } from '@/components/hidden-gems';
import { TrendCard } from '@/components/trend-card';
import { CoffeeGrid } from '@/components/coffee-grid';
import { DashboardHero } from '@/components/dashboard-hero';
import { Sparkles, BarChart3, Clock } from 'lucide-react';

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
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mt-12">
                <div className="lg:col-span-2 glass rounded-[2.5rem] p-1 shadow-sm border border-stone-200/50">
                    <PriceChart data={data} />
                </div>
                <div className="flex flex-col gap-8">
                    <TrendCard />
                    <div className="glass p-10 rounded-[2.5rem] shadow-sm border border-stone-200/50 h-fit relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
                        <div className="flex items-center gap-2 mb-8">
                            <Sparkles size={16} className="text-amber-500" />
                            <h3 className="text-xs font-bold text-stone-400 uppercase tracking-[0.2em]">Quick Insights</h3>
                        </div>
                        <HiddenGems data={data} />
                    </div>
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
