import { useDashboardData } from "@/hooks/useDashboardData";
import { FulfillmentTracker } from "@/components/dashboard/FulfillmentTracker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart3, PlusCircle, Package, Clock, Target, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

const STATUS_COLORS: Record<string, string> = {
  onboarding: "bg-blue-500/10 text-blue-700 border-blue-200",
  active: "bg-success/10 text-success border-success/20",
  paused: "bg-warning/10 text-warning border-warning/20",
  completed: "bg-primary/10 text-primary border-primary/20",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
};
const STATUS_LABELS: Record<string, string> = {
  onboarding: "Onboarding",
  active: "Aktiv",
  paused: "Pausiert",
  completed: "Abgeschlossen",
  cancelled: "Abgebrochen",
};

function FulfillmentDashboard({ tenantId }: { tenantId: string }) {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (!tenantId) return;
    supabase.from("fulfillment_tracking").select("*").eq("tenant_id", tenantId).maybeSingle()
      .then(({ data }) => setData(data));
  }, [tenantId]);

  if (!data) return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-12 gap-3 text-center">
        <Package className="h-8 w-8 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">Noch keine Fulfillment-Daten. Trage sie im Tab "Daten erfassen" ein.</p>
      </CardContent>
    </Card>
  );

  const milestone = data.milestones_total > 0
    ? Math.round((data.milestones_completed / data.milestones_total) * 100) : 0;
  const contractDaysLeft = data.contract_end
    ? Math.round((new Date(data.contract_end).getTime() - Date.now()) / 86400000) : null;
  const onboardingDays = data.onboarding_started_at
    ? Math.round((new Date(data.onboarding_completed_at || new Date()).getTime() - new Date(data.onboarding_started_at).getTime()) / 86400000)
    : null;

  const kpis = [
    { label: "Projektstatus", value: STATUS_LABELS[data.project_status] || data.project_status },
    { label: "CSAT", value: data.csat_score ? `${data.csat_score}/5` : "–" },
    { label: "NPS", value: data.nps_score != null ? String(data.nps_score) : "–" },
    { label: "Onboarding", value: onboardingDays != null ? `${onboardingDays}d` : "–" },
    { label: "Meilensteine", value: data.milestones_total > 0 ? `${data.milestones_completed}/${data.milestones_total}` : "–" },
    { label: "Vertragsende", value: contractDaysLeft != null ? `${contractDaysLeft}d` : "–" },
    { label: "Verlängert", value: data.contract_renewed ? "Ja ✓" : "Nein" },
  ];

  return (
    <div className="space-y-6">
      {/* Status Badge */}
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline" className={STATUS_COLORS[data.project_status] || ""}>
          {STATUS_LABELS[data.project_status] || data.project_status}
        </Badge>
        {contractDaysLeft !== null && (
          <Badge variant="outline" className={contractDaysLeft < 30 ? "border-destructive/50 text-destructive" : ""}>
            {contractDaysLeft > 0 ? `${contractDaysLeft} Tage bis Vertragsende` : "Vertrag abgelaufen"}
          </Badge>
        )}
        {data.contract_renewed && (
          <Badge variant="outline" className="border-success/50 text-success">Verlängert ✓</Badge>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {kpis.map(c => (
          <Card key={c.label} className="glass-card">
            <CardContent className="p-3 text-center">
              <div className="text-xs text-muted-foreground truncate">{c.label}</div>
              <div className="text-base font-bold text-primary mt-0.5">{c.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Milestone Progress */}
      {data.milestones_total > 0 && (
        <Card className="glass-card">
          <CardContent className="p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Meilenstein-Fortschritt</span>
              <span className="text-muted-foreground">{data.milestones_completed} / {data.milestones_total} ({milestone}%)</span>
            </div>
            <Progress value={milestone} className="h-2.5" />
          </CardContent>
        </Card>
      )}

      {data.notes && (
        <Card className="glass-card">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">{data.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function FulfillmentPage() {
  const { tenantId } = useDashboardData();

  return (
    <div className="space-y-6 max-w-6xl">
      <h2 className="text-xl font-semibold text-foreground">Fulfillment</h2>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="rounded-xl">
          <TabsTrigger value="dashboard" className="rounded-xl gap-2">
            <BarChart3 className="h-4 w-4" />
            Live-Dashboard
          </TabsTrigger>
          <TabsTrigger value="entry" className="rounded-xl gap-2">
            <PlusCircle className="h-4 w-4" />
            Daten erfassen
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-4">
          <FulfillmentDashboard tenantId={tenantId} />
        </TabsContent>

        <TabsContent value="entry" className="mt-4">
          <FulfillmentTracker tenantId={tenantId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
