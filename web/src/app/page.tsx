import { getCachedDashboardData, getDashboardData, getTotalReviewCount } from '@/utils/supabase-data';
import { DashboardShell } from '@/components/shared/dashboard-shell';
import { DashboardView } from '@/components/dashboard/dashboard-view';

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
      <div className="mb-8 pt-4">
        <h1 className="text-4xl font-serif font-bold text-[#1F1815]">Daily Briefing</h1>
        <p className="text-stone-500 mt-2">Latest operational intelligence.</p>
      </div>

      <DashboardView data={data} stats={stats} />
    </DashboardShell>
  );
}
