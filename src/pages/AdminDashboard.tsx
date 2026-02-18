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
import { AdminCSATOverview } from "@/components/admin/AdminCSATOverview";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

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
      <DashboardLayout title="Admin Dashboard" subtitle="Laden...">
        <div className="space-y-6 max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="glass-card"><CardContent className="p-4"><Skeleton className="h-16 w-full" /></CardContent></Card>
            ))}
          </div>
          <Card className="glass-card"><CardContent className="p-6"><Skeleton className="h-64 w-full" /></CardContent></Card>
        </div>
      </DashboardLayout>
    );
  }

  const sectionIds = ["portfolio", "marketing", "sales", "fulfillment", "finance", "alerts", "ai-summary", "csat"];

  return (
    <DashboardLayout
      sectionIds={sectionIds}
      title="Admin Dashboard"
      subtitle={`Portfolio-Gesamtübersicht · ${tenants.length} aktive Kunden`}
    >
      <div className="space-y-6 max-w-6xl">
        <div data-section="alerts">
          <AlertsPanel alerts={alerts} onResolve={loadAdminData} />
        </div>

        <div data-section="portfolio">
          <AdminPortfolioTabs tenants={tenants} />
        </div>

        <div data-section="ai-summary">
          <AdminAISummary />
        </div>

        <div data-section="csat">
          <AdminCSATOverview tenants={tenants} />
        </div>
      </div>
    </DashboardLayout>
  );
}
