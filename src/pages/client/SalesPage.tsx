import { useState } from "react";
import { useDashboardData } from "@/hooks/useDashboardData";
import { SalesCharts } from "@/components/client/SalesCharts";
import { TimeRangeSelector } from "@/components/dashboard/TimeRangeSelector";
import { KPIEntryForm } from "@/components/dashboard/KPIEntryForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart3, PlusCircle, TrendingUp } from "lucide-react";

function SalesKPICards({ metrics }: { metrics: any[] }) {
  const latest = metrics?.[0];
  if (!latest) return null;
  const cards = [
    { label: "Anwahlen", value: latest.calls_made ?? "–" },
    { label: "Erreichungsquote", value: latest.interest_rate != null ? `${Number(latest.interest_rate).toFixed(1)}%` : "–" },
    { label: "Setting Show-Rate", value: latest.setting_show_rate != null ? `${Number(latest.setting_show_rate).toFixed(1)}%` : "–" },
    { label: "Closing Show-Rate", value: latest.closing_show_rate != null ? `${Number(latest.closing_show_rate).toFixed(1)}%` : "–" },
    { label: "Closing-Rate", value: latest.closing_rate != null ? `${Number(latest.closing_rate).toFixed(1)}%` : "–" },
    { label: "Deals", value: latest.deals ?? "–" },
    { label: "Cash Collected", value: latest.cash_collected != null ? `${Number(latest.cash_collected).toLocaleString("de-DE")}€` : "–" },
    { label: "Umsatz / Lead", value: latest.revenue_per_lead != null ? `${Number(latest.revenue_per_lead).toFixed(2)}€` : "–" },
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
      {cards.map(c => (
        <Card key={c.label} className="glass-card">
          <CardContent className="p-3 text-center">
            <div className="text-xs text-muted-foreground truncate">{c.label}</div>
            <div className="text-base font-bold text-primary mt-0.5">{String(c.value)}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function SalesPage() {
  const { metrics, timeRange, setTimeRange, reload, tenantId } = useDashboardData();

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Sales</h2>
        <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
      </div>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="rounded-xl">
          <TabsTrigger value="dashboard" className="rounded-xl gap-2">
            <BarChart3 className="h-4 w-4" />
            Live-Dashboard
          </TabsTrigger>
          <TabsTrigger value="entry" className="rounded-xl gap-2">
            <PlusCircle className="h-4 w-4" />
            KPIs erfassen
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-4 space-y-6">
          <SalesKPICards metrics={metrics} />
          <SalesCharts metrics={metrics} timeRange={timeRange} />
        </TabsContent>

        <TabsContent value="entry" className="mt-4">
          <KPIEntryForm tenantId={tenantId} onEntryAdded={reload} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
