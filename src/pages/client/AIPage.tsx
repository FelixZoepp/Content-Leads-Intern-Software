import { useDashboardData } from "@/hooks/useDashboardData";
import { AIBriefing } from "@/components/client/AIBriefing";

export default function AIPage() {
  const { tenantId } = useDashboardData();

  return (
    <div className="space-y-6 max-w-6xl">
      <h2 className="text-xl font-semibold text-foreground">KI-Briefing</h2>
      <AIBriefing tenantId={tenantId} />
    </div>
  );
}
