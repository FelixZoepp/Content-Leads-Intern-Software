import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PortfolioOverview } from "@/components/admin/PortfolioOverview";
import { AlertsPanel } from "@/components/admin/AlertsPanel";
import { AdminAISummary } from "@/components/admin/AdminAISummary";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [tenants, setTenants] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      // Load all tenants with their latest metrics and health scores
      const { data: tenantsData } = await supabase
        .from("tenants")
        .select(`
          *,
          metrics_snapshot!metrics_snapshot_tenant_id_fkey(
            leads_total,
            appointments,
            deals,
            revenue,
            period_date
          ),
          health_scores!health_scores_tenant_id_fkey(
            score,
            color,
            created_at
          )
        `)
        .eq("is_active", true)
        .order("company_name");

      // Process tenants to get latest metrics and health score
      const processedTenants = tenantsData?.map(tenant => {
        const sortedMetrics = tenant.metrics_snapshot?.sort((a: any, b: any) => 
          new Date(b.period_date).getTime() - new Date(a.period_date).getTime()
        );
        const latestMetrics = sortedMetrics?.[0];
        
        const sortedHealth = tenant.health_scores?.sort((a: any, b: any) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        const latestHealth = sortedHealth?.[0];

        return {
          ...tenant,
          latestMetrics,
          latestHealth,
        };
      }) || [];

      setTenants(processedTenants);

      // Load unresolved alerts
      const { data: alertsData } = await supabase
        .from("alerts")
        .select("*, tenants(company_name)")
        .is("resolved_at", null)
        .order("created_at", { ascending: false });

      setAlerts(alertsData || []);
    } catch (error) {
      console.error("Error loading admin data:", error);
      toast({
        title: "Fehler",
        description: "Admin-Daten konnten nicht geladen werden",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card">
          <div className="container mx-auto px-4 py-4">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48 mt-2" />
          </div>
        </header>
        <main className="container mx-auto px-4 py-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-5 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-10 w-24" />
                </CardContent>
              </Card>
            ))}
          </div>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">ContentLeads Admin</h1>
            <p className="text-sm text-muted-foreground">Portfolio-Übersicht & CSM-Console</p>
          </div>
          <Button variant="outline" onClick={() => supabase.auth.signOut()}>
            Abmelden
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Aktive Kunden</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{tenants.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Gesamt Umsatz (Monat)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {tenants.reduce((sum, t) => sum + parseFloat(t.latestMetrics?.revenue || 0), 0).toFixed(0)}€
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Offene Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-red-500">{alerts.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Grüne Health Scores</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-500">
                {tenants.filter(t => t.latestHealth?.color === 'green').length}
              </p>
            </CardContent>
          </Card>
        </div>

        <AdminAISummary />
        <AlertsPanel alerts={alerts} onResolve={loadAdminData} />
        <PortfolioOverview tenants={tenants} />
      </main>
    </div>
  );
}
