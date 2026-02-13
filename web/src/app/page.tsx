import { getCachedDashboardData, getDashboardData, getTotalReviewCount } from '@/utils/supabase-data';
import { DashboardShell } from '@/components/shared/dashboard-shell';
import { DashboardView } from '@/components/dashboard/dashboard-view';
import { Gauge } from 'lucide-react';

// Force dynamic because we are fetching live DB data
export const dynamic = 'force-dynamic';

export default async function Home() {
  const cached = await getCachedDashboardData();

  // Cache is primary source now
  const data = cached.recentReviews || [];
  const stats = cached.stats;

  if (!data || data.length === 0) {
    // Basic fallback if cache is empty (just to show something)
    const [liveData] = await Promise.all([
      getDashboardData(12)
    ]);
    return (
      <DashboardShell>
        <DashboardView data={liveData} stats={null} />
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div className="relative mb-12 pt-12">
        <div className="absolute top-0 left-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full" />
        <div className="max-w-2xl">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-stone-900 rounded-2xl flex items-center justify-center text-white shadow-xl">
              <Gauge size={24} />
            </div>
            <h1 className="text-5xl font-serif font-bold text-[#1F1815] tracking-tight">Daily Briefing</h1>
          </div>
          <p className="text-stone-500 text-lg font-light leading-relaxed">Latest operational intelligence across the BrewIntelligence ecosystem.</p>
        </div>
      </div>

      <DashboardView data={data} stats={stats} />
    </DashboardShell>
  );
}
