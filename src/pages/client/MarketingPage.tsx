import { useDashboardData } from "@/hooks/useDashboardData";
import { ClientMetricsCards } from "@/components/client/ClientMetricsCards";
import { KPIInsights } from "@/components/dashboard/KPIInsights";
import { TimeRangeSelector } from "@/components/dashboard/TimeRangeSelector";
import { ClientCharts } from "@/components/client/ClientCharts";

export default function MarketingPage() {
  const { metrics, timeRange, setTimeRange } = useDashboardData();

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Marketing & LinkedIn</h2>
        <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
      </div>
      <ClientMetricsCards metrics={metrics} timeRange={timeRange} />
      <KPIInsights metrics={metrics} />
      <ClientCharts metrics={metrics} timeRange={timeRange} />
    </div>
  );
}
