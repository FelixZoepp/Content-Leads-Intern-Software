import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertsPanel } from "@/components/admin/AlertsPanel";
import { AdminAISummary } from "@/components/admin/AdminAISummary";
import { AdminPortfolioTabs } from "@/components/admin/AdminPortfolioTabs";
import { AdminCSATOverview } from "@/components/admin/AdminCSATOverview";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Routes, Route } from "react-router-dom";

function AdminAlertsPage({ alerts, loadAdminData }: { alerts: any[]; loadAdminData: () => void }) {
  return (
    <div className="space-y-6 max-w-6xl">
      <h2 className="text-xl font-semibold text-foreground">Alerts</h2>
      <AlertsPanel alerts={alerts} onResolve={loadAdminData} />
    </div>
  );
}

function AdminCSATPage({ tenants }: { tenants: any[] }) {
  return (
    <div className="space-y-6 max-w-6xl">
      <h2 className="text-xl font-semibold text-foreground">CSAT / NPS Übersicht</h2>
      <AdminCSATOverview tenants={tenants} />
    </div>
  );
}

function AdminAISummaryPage() {
  return (
    <div className="space-y-6 max-w-6xl">
      <h2 className="text-xl font-semibold text-foreground">KI-Summary</h2>
      <AdminAISummary />
    </div>
  );
}

function AdminOverviewPage({ tenants, alerts, loadAdminData }: { tenants: any[]; alerts: any[]; loadAdminData: () => void }) {
  return (
    <div className="space-y-6 max-w-6xl">
      <AlertsPanel alerts={alerts} onResolve={loadAdminData} />
      <AdminPortfolioTabs tenants={tenants} />
      <AdminAISummary />
    </div>
  );
}

export default function AdminDashboard() {
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
        .select(`*, health_scores!health_scores_tenant_id_fkey(score, color, created_at)`)
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
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Admin Dashboard"
      subtitle={`Portfolio-Gesamtübersicht · ${tenants.length} aktive Kunden`}
    >
      <Routes>
        <Route index element={<AdminOverviewPage tenants={tenants} alerts={alerts} loadAdminData={loadAdminData} />} />
        <Route path="alerts" element={<AdminAlertsPage alerts={alerts} loadAdminData={loadAdminData} />} />
        <Route path="csat" element={<AdminCSATPage tenants={tenants} />} />
        <Route path="ai-summary" element={<AdminAISummaryPage />} />
      </Routes>
    </DashboardLayout>
  );
}
