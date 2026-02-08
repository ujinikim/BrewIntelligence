import { getDashboardData, getTotalReviewCount } from '@/utils/supabase-data';
import { DashboardShell } from '@/components/dashboard-shell';
import { DashboardView } from '@/components/dashboard-view';

// Force dynamic because we are fetching live DB data
export const dynamic = 'force-dynamic';

export default async function Home() {
  const [data, totalCount] = await Promise.all([
    getDashboardData(500),
    getTotalReviewCount()
  ]);

  return (
    <DashboardShell>
      <div className="mb-8 pt-4">
        <h1 className="text-5xl font-serif font-bold text-[#1F1815] mb-3">Market Overview</h1>
        <p className="text-lg text-[#1F1815]/70 max-w-2xl font-light">
          Analyzing {totalCount} specialty coffee beans from across the globe to find the perfect brew.
        </p>
      </div>

      <DashboardView data={data} totalCount={totalCount} />
    </DashboardShell>
  );
}
