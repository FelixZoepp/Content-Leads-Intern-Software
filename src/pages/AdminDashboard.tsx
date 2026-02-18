import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertsPanel } from "@/components/admin/AlertsPanel";
import { AdminAISummary } from "@/components/admin/AdminAISummary";
import { AdminPortfolioTabs } from "@/components/admin/AdminPortfolioTabs";

export default function AdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [tenants, setTenants] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => { loadAdminData(); }, []);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const { data: tenantsData } = await supabase
        .from("tenants")
        .select(`
          *,
          health_scores!health_scores_tenant_id_fkey(score, color, created_at)
        `)
        .eq("is_active", true)
        .order("company_name");

      const processedTenants = tenantsData?.map(tenant => {
        const sortedHealth = tenant.health_scores?.sort((a: any, b: any) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        return { ...tenant, latestHealth: sortedHealth?.[0] };
      }) || [];

      setTenants(processedTenants);

      const { data: alertsData } = await supabase
        .from("alerts")
        .select("*, tenants(company_name)")
        .is("resolved_at", null)
        .order("created_at", { ascending: false });

      setAlerts(alertsData || []);
    } catch (error) {
      console.error("Error loading admin data:", error);
      toast({ title: "Fehler", description: "Admin-Daten konnten nicht geladen werden", variant: "destructive" });
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
        <main className="container mx-auto px-4 py-8 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i}><CardContent className="p-4"><Skeleton className="h-16 w-full" /></CardContent></Card>
            ))}
          </div>
          <Card><CardContent className="p-6"><Skeleton className="h-64 w-full" /></CardContent></Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Portfolio-Gesamtübersicht · {tenants.length} aktive Kunden
            </p>
          </div>
          <Button variant="outline" onClick={() => supabase.auth.signOut()}>Abmelden</Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        <AlertsPanel alerts={alerts} onResolve={loadAdminData} />
        <AdminPortfolioTabs tenants={tenants} />
        <AdminAISummary />
      </main>
    </div>
  );
}
