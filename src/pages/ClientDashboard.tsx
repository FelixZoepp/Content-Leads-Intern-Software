import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { EmptyDashboard } from "@/components/dashboard/EmptyDashboard";

export default function ClientDashboard() {
  const navigate = useNavigate();
  const { user, tenantId } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [tenant, setTenant] = useState<any>(null);
  const [metrics, setMetrics] = useState<any[]>([]);
  const [healthScore, setHealthScore] = useState<any>(null);

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

  const handleSync = async (isDryRun = false) => {
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
        body: { tenantId, dryRun: isDryRun },
      });

      if (error) throw error;

      if (data.error) {
        // Structured error from edge function
        toast({
          title: data.error,
          description: data.userAction || data.message,
          variant: "destructive",
        });
        
        // Log detailed error info
        console.error("Sync error details:", data);
        return;
      }

      if (isDryRun) {
        toast({
          title: "Vorschau erfolgreich",
          description: data.message,
        });
        console.log("Dry run preview:", data.preview);
      } else {
        toast({
          title: "Sync erfolgreich",
          description: data.message || `${data.rowsProcessed} Zeilen aktualisiert`,
        });
        loadDashboardData();
      }
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
    return <DashboardSkeleton />;
  }

  if (!tenant) {
    return <EmptyDashboard onRefresh={() => navigate("/onboarding")} hasSheet={false} />;
  }

  if (metrics.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">ContentLeads Dashboard</h1>
              <p className="text-sm text-muted-foreground">{tenant.company_name}</p>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => handleSync(true)} disabled={syncing}>
                Vorschau
              </Button>
              <Button onClick={() => handleSync(false)} disabled={syncing}>
                <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
                Aktualisieren
              </Button>
              <Button variant="outline" onClick={() => supabase.auth.signOut()}>
                Abmelden
              </Button>
            </div>
          </div>
        </header>
        <EmptyDashboard onRefresh={handleSync} hasSheet={!!tenant.sheet_url} />
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
            <Button variant="outline" onClick={() => handleSync(true)} disabled={syncing}>
              Vorschau
            </Button>
            <Button onClick={() => handleSync(false)} disabled={syncing}>
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
