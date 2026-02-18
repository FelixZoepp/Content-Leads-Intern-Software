import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { ClientMetricsCards } from "@/components/client/ClientMetricsCards";
import { ClientCharts } from "@/components/client/ClientCharts";
import { AIBriefing } from "@/components/client/AIBriefing";
import { CSATSurvey } from "@/components/client/CSATSurvey";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { KPIEntryForm } from "@/components/dashboard/KPIEntryForm";
import { TimeRangeSelector, type TimeRange } from "@/components/dashboard/TimeRangeSelector";
import { KPIInsights } from "@/components/dashboard/KPIInsights";

export default function ClientDashboard() {
  const navigate = useNavigate();
  const { user, tenantId } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [tenant, setTenant] = useState<any>(null);
  const [metrics, setMetrics] = useState<any[]>([]);
  const [healthScore, setHealthScore] = useState<any>(null);
  const [showEntryForm, setShowEntryForm] = useState(false);
  const [timeRange, setTimeRange] = useState<TimeRange>("daily");

  useEffect(() => {
    if (user) {
      if (tenantId) {
        loadDashboardData();
      } else {
        checkTenant();
      }
    }
  }, [tenantId, user, timeRange]);

  const checkTenant = async () => {
    try {
      const { data } = await supabase
        .from("tenants")
        .select("id")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (!data) navigate("/onboarding");
    } catch (error) {
      console.error("Error checking tenant:", error);
    }
  };

  const viewMap: Record<TimeRange, string> = {
    daily: "v_metrics_daily",
    weekly: "v_metrics_weekly",
    monthly: "v_metrics_monthly",
    yearly: "v_metrics_yearly",
  };

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const { data: tenantData } = await supabase
        .from("tenants")
        .select("*")
        .eq("id", tenantId)
        .single();
      setTenant(tenantData);

      const viewName = viewMap[timeRange];
      const dateCol = timeRange === "daily" ? "period_date" : "period_start";

      const { data: metricsData } = await supabase
        .from(viewName as any)
        .select("*")
        .eq("tenant_id", tenantId)
        .order(dateCol, { ascending: false })
        .limit(timeRange === "daily" ? 30 : timeRange === "weekly" ? 12 : timeRange === "monthly" ? 12 : 5);

      setMetrics(metricsData || []);

      const { data: healthData } = await supabase
        .from("health_scores")
        .select("*")
        .eq("tenant_id", tenantId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      setHealthScore(healthData);
    } catch (error) {
      console.error("Error loading dashboard:", error);
      toast({ title: "Fehler", description: "Dashboard konnte nicht geladen werden", variant: "destructive" });
    }
    setLoading(false);
  };

  if (loading) return <DashboardSkeleton />;

  if (!tenant) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Kein Tenant gefunden</CardTitle>
            <CardDescription>Bitte schließe das Onboarding ab</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/onboarding")}>Zum Onboarding</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">KPI Dashboard</h1>
            <p className="text-sm text-muted-foreground">{tenant.company_name}</p>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={() => setShowEntryForm(!showEntryForm)} size="sm">
              <Plus className="h-4 w-4 mr-1" />
              {showEntryForm ? "Schließen" : "Heute eintragen"}
            </Button>
            <Button variant="outline" size="sm" onClick={() => supabase.auth.signOut()}>
              Abmelden
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {showEntryForm && (
          <KPIEntryForm
            tenantId={tenantId!}
            onEntryAdded={() => {
              loadDashboardData();
              setShowEntryForm(false);
            }}
          />
        )}

        {metrics.length === 0 && !showEntryForm ? (
          <Card>
            <CardHeader>
              <CardTitle>Willkommen! 👋</CardTitle>
              <CardDescription>Trage deine ersten KPIs ein, um dein Dashboard zu aktivieren.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setShowEntryForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Erste Daten eintragen
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
            </div>

            {healthScore && (
              <Card className={`border-2 ${
                healthScore.color === "green" ? "border-green-500" :
                healthScore.color === "amber" ? "border-yellow-500" : "border-red-500"
              }`}>
                <CardHeader className="py-3">
                  <CardTitle className="text-base">Health Score: {healthScore.score}/100</CardTitle>
                  <CardDescription>{healthScore.rationale_text}</CardDescription>
                </CardHeader>
              </Card>
            )}

            <ClientMetricsCards metrics={metrics} timeRange={timeRange} />
            <KPIInsights metrics={metrics} />
            <ClientCharts metrics={metrics} timeRange={timeRange} />
            <AIBriefing tenantId={tenantId!} />
            <CSATSurvey tenantId={tenantId!} />
          </>
        )}
      </main>
    </div>
  );
}
