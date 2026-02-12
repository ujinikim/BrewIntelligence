import { getInsightsData } from '@/utils/insights-data';
import { InsightsView } from '@/components/insights/insights-view';
import { DashboardShell } from '@/components/shared/dashboard-shell';

export const dynamic = 'force-dynamic';

export default async function InsightsPage() {
  const data = await getInsightsData();

  return (
    <DashboardShell>
      <InsightsView data={data} />
    </DashboardShell>
  );
}
