import { useDashboardData } from "@/hooks/useDashboardData";
import { CSATSurvey } from "@/components/client/CSATSurvey";

export default function CSATPage() {
  const { tenantId } = useDashboardData();

  return (
    <div className="space-y-6 max-w-6xl">
      <h2 className="text-xl font-semibold text-foreground">CSAT / NPS</h2>
      <CSATSurvey tenantId={tenantId} />
    </div>
  );
}
