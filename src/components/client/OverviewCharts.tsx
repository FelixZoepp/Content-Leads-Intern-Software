import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from "recharts";

interface Props {
  metrics: any[];
  timeRange?: string;
}

export function OverviewCharts({ metrics, timeRange = "daily" }: Props) {
  if (!metrics || metrics.length === 0) return null;

  const dateKey = timeRange === "daily" ? "period_date" : "period_start";

  const chartData = [...metrics].reverse().map(m => ({
    date: new Date(m[dateKey]).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" }),
    Leads: parseFloat(m.leads_total) || 0,
    Termine: parseFloat(m.appointments) || 0,
    Deals: parseFloat(m.deals) || 0,
    "Cash Collected": parseFloat(m.cash_collected) || parseFloat(m.revenue) || 0,
    Impressionen: parseFloat(m.impressions) || 0,
    "Closing %": parseFloat(m.closing_rate) || 0,
    "Sett. Show %": parseFloat(m.setting_show_rate) || 0,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Pipeline: Leads → Deals</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="Leads" fill="hsl(var(--chart-1))" />
              <Bar dataKey="Termine" fill="hsl(var(--chart-2))" />
              <Bar dataKey="Deals" fill="hsl(var(--chart-3))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Umsatz-Entwicklung</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => `${v.toLocaleString("de-DE")}€`} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="Cash Collected" fill="hsl(var(--chart-4))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
