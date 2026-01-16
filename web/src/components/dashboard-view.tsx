'use client';

import { useState } from 'react';
import { Coffee } from '@/utils/data';
import { KPICards } from '@/components/kpi-cards';
import { PriceChart } from '@/components/price-chart';
import { HiddenGems } from '@/components/hidden-gems';

import { CoffeeMap } from '@/components/coffee-map';
import { LayoutGrid, Map as MapIcon, Search } from 'lucide-react';

export function DashboardView({ data }: { data: Coffee[] }) {
  const [activeTab, setActiveTab] = useState<'analysis' | 'map'>('analysis');

  return (
    <>
      <div className="flex items-center gap-4 mb-8">
        <div className="flex bg-[#F6F5F3] p-1 rounded-lg">
            <button
                onClick={() => setActiveTab('analysis')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all ${
                    activeTab === 'analysis'
                        ? 'bg-white text-[#1F1815] shadow-sm'
                        : 'text-[#1F1815]/50 hover:text-[#1F1815]/70'
                }`}
            >
                <LayoutGrid size={16} />
                Market Analysis
            </button>
            <button
                onClick={() => setActiveTab('map')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all ${
                    activeTab === 'map'
                        ? 'bg-white text-[#1F1815] shadow-sm'
                        : 'text-[#1F1815]/50 hover:text-[#1F1815]/70'
                }`}
            >
                <MapIcon size={16} />
                Origin Map
            </button>
        </div>
      </div>

      {activeTab === 'analysis' ? (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Hero / CTA for Explorer */}
            <div className="bg-[#1F1815] text-[#FDFBF7] p-8 rounded-lg mb-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
                <div>
                    <h2 className="text-2xl font-serif font-bold mb-2">Find your perfect coffee.</h2>
                    <p className="text-[#FDFBF7]/80 max-w-md">
                        Use our AI-powered Semantic Search to find beans by flavor, vibe, or roast level.
                    </p>
                </div>
                <a 
                    href="/explorer" 
                    className="bg-[#D4A373] text-white px-6 py-3 rounded-md font-bold hover:bg-[#C39363] transition-colors flex items-center gap-2 shrink-0"
                >
                    <Search size={20} />
                    Open Flavor Explorer
                </a>
            </div>

            <KPICards data={data} />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-10">
                <div className="lg:col-span-2">
                    <PriceChart data={data} />
                </div>
                <div className="bg-white p-8 rounded-lg border border-[#e5e5e5] shadow-sm h-fit">
                    <h3 className="text-xl font-serif font-bold text-[#1F1815] mb-6 border-b border-[#f0f0f0] pb-4">Quick Insights</h3>
                    <ul className="space-y-6">
                        <li className="flex flex-col gap-1 text-sm text-[#1F1815]/80">
                            <span className="font-bold text-[#1F1815] uppercase tracking-wider text-xs">Price Correlation</span>
                            <span>Weak positive (~0.26). Higher price doesn't guarantee higher quality.</span>
                        </li>
                        <li className="flex flex-col gap-1 text-sm text-[#1F1815]/80">
                            <span className="font-bold text-[#1F1815] uppercase tracking-wider text-xs">Value Picks</span>
                            <span>Look for beans in the bottom-right of the chart (Low Price, High Rating).</span>
                        </li>
                    </ul>

                    <HiddenGems data={data} />
                </div>
            </div>
        </div>
      ) : (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <CoffeeMap data={data} />
        </div>
      )}
    </>
  );
}
