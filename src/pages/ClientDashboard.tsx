import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw, TrendingUp, TrendingDown, Target, Users, DollarSign, FileText } from "lucide-react";
import { ClientMetricsCards } from "@/components/client/ClientMetricsCards";
import { ClientCharts } from "@/components/client/ClientCharts";
import { AIBriefing } from "@/components/client/AIBriefing";
import { CSATSurvey } from "@/components/client/CSATSurvey";

export default function ClientDashboard() {
  const { user, tenantId } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [tenant, setTenant] = useState<any>(null);
  const [metrics, setMetrics] = useState<any[]>([]);
  const [healthScore, setHealthScore] = useState<any>(null);

  useEffect(() => {
    if (tenantId) {
      loadDashboardData();
    }
  }, [tenantId]);

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

      // Load recent metrics
      const { data: metricsData } = await supabase
        .from("metrics_snapshot")
        .select("*")
        .eq("tenant_id", tenantId)
        .order("period_date", { ascending: false })
        .limit(30);
      setMetrics(metricsData || []);

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

  const handleSync = async () => {
    if (!tenant?.sheet_url) {
      toast({
        title: "Kein Sheet verbunden",
        description: "Bitte verbinde erst dein Google Sheet",
        variant: "destructive",
      });
      return;
    }

    setSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke("sync-sheet", {
        body: { tenantId },
      });

      if (error) throw error;

      toast({
        title: "Sync erfolgreich",
        description: `${data.rowsProcessed} Zeilen aktualisiert`,
      });

      loadDashboardData();
    } catch (error: any) {
      toast({
        title: "Sync fehlgeschlagen",
        description: error.message,
        variant: "destructive",
      });
    }
    setSyncing(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="min-h-screen bg-background p-8">
        <Card>
          <CardHeader>
            <CardTitle>Willkommen bei ContentLeads</CardTitle>
            <CardDescription>
              Bitte vervollständige dein Profil und verbinde dein Tracking-Sheet
            </CardDescription>
          </CardHeader>
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
            {tenant.last_sync_at && (
              <p className="text-sm text-muted-foreground">
                Letzter Sync: {new Date(tenant.last_sync_at).toLocaleString('de-DE')}
              </p>
            )}
            <Button onClick={handleSync} disabled={syncing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
              Aktualisieren
            </Button>
            <Button variant="outline" onClick={() => supabase.auth.signOut()}>
              Abmelden
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
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
      </main>
    </div>
  );
}
