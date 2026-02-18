import { useDashboardData } from "@/hooks/useDashboardData";
import { MonthlyReportTable } from "@/components/dashboard/MonthlyReportTable";

export default function ReportsPage() {
  const { tenantId, tenant } = useDashboardData();

  return (
    <div className="space-y-6 max-w-6xl">
      <h2 className="text-xl font-semibold text-foreground">Reports</h2>
      <MonthlyReportTable tenantId={tenantId} companyName={tenant?.company_name || ""} />
    </div>
  );
}
