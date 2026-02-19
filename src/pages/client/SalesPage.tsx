import { useDashboardData } from "@/hooks/useDashboardData";
import { SalesCharts } from "@/components/client/SalesCharts";
import { TimeRangeSelector } from "@/components/dashboard/TimeRangeSelector";

export default function SalesPage() {
  const { metrics, timeRange, setTimeRange } = useDashboardData();

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Sales</h2>
        <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
      </div>
      <SalesCharts metrics={metrics} timeRange={timeRange} />
    </div>
  );
}
