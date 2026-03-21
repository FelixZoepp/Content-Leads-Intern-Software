import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertsPanel } from "@/components/admin/AlertsPanel";
import { AdminAISummary } from "@/components/admin/AdminAISummary";
import { AdminCSATOverview } from "@/components/admin/AdminCSATOverview";
import { AdminPortfolioTabs } from "@/components/admin/AdminPortfolioTabs";
import { CustomerStatusList } from "@/components/admin/CustomerStatusList";
import { CustomerAnalysisTable } from "@/components/admin/CustomerAnalysisTable";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { InviteCustomerDialog } from "@/components/admin/InviteCustomerDialog";
import { AdvisorReport } from "@/components/admin/AdvisorReport";
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

function AdminAdvisorReportPage() {
  return (
    <div className="space-y-6 max-w-6xl">
      <h2 className="text-xl font-semibold text-foreground">Berater-Report</h2>
      <p className="text-sm text-muted-foreground">Monatlicher CSAT/NPS-Vergleich pro Kundenberater</p>
      <AdvisorReport />
    </div>
  );
}

function AdminPortfolioPage({ tenants, onReload }: { tenants: any[]; onReload: () => void }) {
  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div />
        <InviteCustomerDialog onSuccess={onReload} />
      </div>
      <CustomerStatusList />
      <AdminPortfolioTabs tenants={tenants} />
      <CustomerAnalysisTable />
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
        <Route index element={<AdminPortfolioPage tenants={tenants} onReload={loadAdminData} />} />
        <Route path="alerts" element={<AdminAlertsPage alerts={alerts} loadAdminData={loadAdminData} />} />
        <Route path="csat" element={<AdminCSATPage tenants={tenants} />} />
        <Route path="advisor-report" element={<AdminAdvisorReportPage />} />
        <Route path="ai-summary" element={<AdminAISummaryPage />} />
      </Routes>
    </DashboardLayout>
  );
}
