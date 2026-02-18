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
import { MonthlyReportTable } from "@/components/dashboard/MonthlyReportTable";
import { FulfillmentTracker } from "@/components/dashboard/FulfillmentTracker";
import { FinancialTracker } from "@/components/dashboard/FinancialTracker";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

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
        <Card className="max-w-md glass-card">
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

  const sectionIds = ["overview", "marketing", "sales", "reports", "finance", "fulfillment", "ai", "csat"];

  return (
    <DashboardLayout
      sectionIds={sectionIds}
      title="KPI Dashboard"
      subtitle={tenant.company_name}
    >
      <div className="space-y-6 max-w-6xl">
        {/* Entry form toggle */}
        <div className="flex items-center justify-between">
          <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
          <Button onClick={() => setShowEntryForm(!showEntryForm)} size="sm" className="rounded-xl">
            <Plus className="h-4 w-4 mr-1" />
            {showEntryForm ? "Schließen" : "Heute eintragen"}
          </Button>
        </div>

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
          <Card className="glass-card">
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
            <div data-section="overview">
              {healthScore && (
                <Card className={`glass-card border-2 ${
                  healthScore.color === "green" ? "border-success/40" :
                  healthScore.color === "amber" ? "border-warning/40" : "border-destructive/40"
                }`}>
                  <CardHeader className="py-3">
                    <CardTitle className="text-base">Health Score: {healthScore.score}/100</CardTitle>
                    <CardDescription>{healthScore.rationale_text}</CardDescription>
                  </CardHeader>
                </Card>
              )}
            </div>

            <div data-section="marketing" className="space-y-6">
              <ClientMetricsCards metrics={metrics} timeRange={timeRange} />
              <KPIInsights metrics={metrics} />
            </div>

            <div data-section="sales">
              <ClientCharts metrics={metrics} timeRange={timeRange} />
            </div>

            <div data-section="reports">
              <MonthlyReportTable tenantId={tenantId!} companyName={tenant.company_name} />
            </div>

            <div data-section="finance">
              <FinancialTracker tenantId={tenantId!} />
            </div>

            <div data-section="fulfillment">
              <FulfillmentTracker tenantId={tenantId!} />
            </div>

            <div data-section="ai">
              <AIBriefing tenantId={tenantId!} />
            </div>

            <div data-section="csat">
              <CSATSurvey tenantId={tenantId!} />
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
