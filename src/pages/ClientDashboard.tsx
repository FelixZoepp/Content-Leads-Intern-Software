import { useEffect } from "react";
import { useNavigate, Routes, Route } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { DashboardDataProvider, useDashboardData } from "@/hooks/useDashboardData";

import TodayPage from "./client/TodayPage";
import OverviewPage from "./client/OverviewPage";
import MarketingPage from "./client/MarketingPage";
import SalesPage from "./client/SalesPage";
import FulfillmentPage from "./client/FulfillmentPage";
import FinancePage from "./client/FinancePage";
import AIPage from "./client/AIPage";
import CSATPage from "./client/CSATPage";
import ReportsPage from "./client/ReportsPage";

function ClientDashboardInner() {
  const navigate = useNavigate();
  const { user, tenantId } = useAuth();
  const { tenant, loading } = useDashboardData();

  useEffect(() => {
    if (user && !tenantId) {
      navigate("/onboarding");
    }
  }, [user, tenantId]);

  if (loading) return <DashboardSkeleton />;

  return (
    <DashboardLayout title="KPI Dashboard" subtitle={tenant?.company_name}>
      <Routes>
        <Route index element={<TodayPage />} />
        <Route path="overview" element={<OverviewPage />} />
        <Route path="marketing" element={<MarketingPage />} />
        <Route path="sales" element={<SalesPage />} />
        <Route path="fulfillment" element={<FulfillmentPage />} />
        <Route path="finance" element={<FinancePage />} />
        <Route path="ai" element={<AIPage />} />
        <Route path="csat" element={<CSATPage />} />
        <Route path="reports" element={<ReportsPage />} />
      </Routes>
    </DashboardLayout>
  );
}

export default function ClientDashboard() {
  return (
    <DashboardDataProvider>
      <ClientDashboardInner />
    </DashboardDataProvider>
  );
}
