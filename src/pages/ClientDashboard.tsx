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

export default function ClientDashboard() {
  const navigate = useNavigate();
  const { user, tenantId } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [tenant, setTenant] = useState<any>(null);
  const [metrics, setMetrics] = useState<any[]>([]);
  const [healthScore, setHealthScore] = useState<any>(null);
  const [showEntryForm, setShowEntryForm] = useState(false);

  useEffect(() => {
    if (user && !tenantId) {
      // No tenant assigned, check if one exists
      checkTenant();
    } else if (tenantId) {
      loadDashboardData();
    }
  }, [tenantId, user]);

  const checkTenant = async () => {
    try {
      const { data } = await supabase
        .from("tenants")
        .select("id")
        .eq("user_id", user!.id)
        .maybeSingle();

      if (!data) {
        // No tenant exists, redirect to onboarding
        navigate("/onboarding");
      }
    } catch (error) {
      console.error("Error checking tenant:", error);
    }
  };

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load tenant
      const { data: tenantData } = await supabase
        .from("tenants")
        .select("*")
        .eq("id", tenantId)
        .single();
      setTenant(tenantData);

      // Load recent KPI entries from the new table
      const { data: kpiData } = await supabase
        .from("kpi_entries" as any)
        .select("*")
        .eq("tenant_id", tenantId)
        .order("entry_date", { ascending: false })
        .limit(30);
      
      // Transform kpi_entries to match metrics_snapshot format for compatibility
      const transformedMetrics = (kpiData || []).map((entry: any) => ({
        ...entry,
        period_date: entry.entry_date,
        new_followers: entry.followers,
      }));
      
      setMetrics(transformedMetrics);

      // Load latest health score
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
      toast({
        title: "Fehler",
        description: "Dashboard konnte nicht geladen werden",
        variant: "destructive",
      });
    }
    setLoading(false);
  };


  if (loading) {
    return <DashboardSkeleton />;
  }

  if (!tenant) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Kein Tenant gefunden</CardTitle>
            <CardDescription>
              Bitte schließe das Onboarding ab
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/onboarding")}>
              Zum Onboarding
            </Button>
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
            <h1 className="text-2xl font-bold text-foreground">ContentLeads Dashboard</h1>
            <p className="text-sm text-muted-foreground">{tenant.company_name}</p>
          </div>
          <div className="flex items-center gap-4">
            <Button onClick={() => setShowEntryForm(!showEntryForm)}>
              <Plus className="h-4 w-4 mr-2" />
              {showEntryForm ? "Formular schließen" : "Heute eintragen"}
            </Button>
            <Button variant="outline" onClick={() => supabase.auth.signOut()}>
              Abmelden
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {showEntryForm && (
          <KPIEntryForm 
            tenantId={tenantId!} 
            onEntryAdded={() => {
              loadDashboardData();
              setShowEntryForm(false);
            }} 
          />
        )}

        {metrics.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Willkommen bei ContentLeads!</CardTitle>
              <CardDescription>
                Trage deine ersten KPI-Daten ein, um dein Dashboard zu aktivieren.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Klicke auf "Heute eintragen", um deine täglichen Kennzahlen zu erfassen.
              </p>
              <Button onClick={() => setShowEntryForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Erste Daten eintragen
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {healthScore && (
              <Card className={`border-2 ${
                healthScore.color === 'green' ? 'border-green-500' : 
                healthScore.color === 'amber' ? 'border-yellow-500' : 
                'border-red-500'
              }`}>
                <CardHeader>
                  <CardTitle>Health Score: {healthScore.score}/100</CardTitle>
                  <CardDescription>{healthScore.rationale_text}</CardDescription>
                </CardHeader>
              </Card>
            )}

            <ClientMetricsCards metrics={metrics} />
            <ClientCharts metrics={metrics} />
            <AIBriefing tenantId={tenantId!} />
            <CSATSurvey tenantId={tenantId!} />
          </>
        )}
      </main>
    </div>
  );
}
