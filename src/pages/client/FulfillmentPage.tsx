import { useDashboardData } from "@/hooks/useDashboardData";
import { FulfillmentTracker } from "@/components/dashboard/FulfillmentTracker";

export default function FulfillmentPage() {
  const { tenantId } = useDashboardData();

  return (
    <div className="space-y-6 max-w-6xl">
      <h2 className="text-xl font-semibold text-foreground">Fulfillment</h2>
      <FulfillmentTracker tenantId={tenantId} />
    </div>
  );
}
