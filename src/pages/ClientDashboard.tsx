import { lazy, Suspense, useEffect } from "react";
import { useNavigate, Routes, Route } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { DashboardDataProvider, useDashboardData } from "@/hooks/useDashboardData";

const TodayPage = lazy(() => import("./client/TodayPage"));
const OverviewPage = lazy(() => import("./client/OverviewPage"));
const MarketingPage = lazy(() => import("./client/MarketingPage"));
const SalesPage = lazy(() => import("./client/SalesPage"));
const FinancePage = lazy(() => import("./client/FinancePage"));
const AIPage = lazy(() => import("./client/AIPage"));
const CSATPage = lazy(() => import("./client/CSATPage"));
const ReportsPage = lazy(() => import("./client/ReportsPage"));

const SubPageLoader = () => (
  <div className="flex items-center justify-center py-20">
    <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
  </div>
);

function ClientDashboardInner() {
  const navigate = useNavigate();
  const { user, tenantId, loading: authLoading } = useAuth();
  const { tenant, loading } = useDashboardData();

  useEffect(() => {
    if (!authLoading && user && tenantId === null) {
      navigate("/onboarding");
    }
  }, [user, tenantId, authLoading]);

  useEffect(() => {
    if (!loading && tenant && !tenant.onboarding_completed) {
      navigate("/onboarding");
    }
  }, [loading, tenant]);

  if (loading) return <DashboardSkeleton />;

  return (
    <DashboardLayout title="KPI Dashboard" subtitle={tenant?.company_name}>
      <Suspense fallback={<SubPageLoader />}>
        <Routes>
          <Route index element={<TodayPage />} />
          <Route path="overview" element={<OverviewPage />} />
          <Route path="marketing" element={<MarketingPage />} />
          <Route path="sales" element={<SalesPage />} />
          <Route path="finance" element={<FinancePage />} />
          <Route path="ai" element={<AIPage />} />
          <Route path="csat" element={<CSATPage />} />
          <Route path="reports" element={<ReportsPage />} />
        </Routes>
      </Suspense>
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
