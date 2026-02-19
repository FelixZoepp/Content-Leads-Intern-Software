import { useDashboardData } from "@/hooks/useDashboardData";
import { FinancialTracker } from "@/components/dashboard/FinancialTracker";
import { FinanceCharts } from "@/components/client/FinanceCharts";

export default function FinancePage() {
  const { tenantId } = useDashboardData();

  return (
    <div className="space-y-6 max-w-6xl">
      <h2 className="text-xl font-semibold text-foreground">Finanzen</h2>
      <FinanceCharts tenantId={tenantId} />
      <FinancialTracker tenantId={tenantId} />
    </div>
  );
}
