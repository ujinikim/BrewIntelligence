
'use client';

import { CoffeeReview, DashboardStats } from '@/utils/supabase-data';
import { KPICards } from './kpi-cards';
import { CoffeeGrid } from './coffee-grid';
import { GlobalSearch } from './global-search';
import { Clock } from 'lucide-react';

export function DashboardView({ data, stats }: { data: CoffeeReview[], stats: DashboardStats | null }) {

    return (
        <div className="space-y-10">

            <GlobalSearch />

            <section>
                <KPICards stats={stats} />
            </section>

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

                <CoffeeGrid data={data.slice(0, 12)} />
            </section>
        </div>
    );
}

