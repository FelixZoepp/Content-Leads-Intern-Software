import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from "recharts";

interface Props {
  metrics: any[];
  timeRange?: string;
}

export function ClientCharts({ metrics, timeRange = "daily" }: Props) {
  if (!metrics || metrics.length === 0) return null;

  const dateKey = timeRange === "daily" ? "period_date" : "period_start";

  const chartData = [...metrics].reverse().map(m => ({
    date: new Date(m[dateKey]).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" }),
    Leads: parseFloat(m.leads_total) || 0,
    Termine: parseFloat(m.appointments) || 0,
    Deals: parseFloat(m.deals) || 0,
    "Cash Collected": parseFloat(m.cash_collected) || parseFloat(m.revenue) || 0,
    Anwahlen: parseFloat(m.calls_made) || 0,
    Erreicht: parseFloat(m.calls_reached) || 0,
    Interessiert: parseFloat(m.calls_interested) || 0,
    "Sett. geplant": parseFloat(m.settings_planned) || 0,
    "Sett. gehalten": parseFloat(m.settings_held) || 0,
    "Clos. geplant": parseFloat(m.closings_planned) || 0,
    "Clos. gehalten": parseFloat(m.closings_held) || 0,
    "Sett. Show %": parseFloat(m.setting_show_rate) || 0,
    "Clos. Show %": parseFloat(m.closing_show_rate) || 0,
    "Closing %": parseFloat(m.closing_rate) || 0,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Anwahlen → Termine</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="Anwahlen" fill="hsl(var(--chart-1))" />
              <Bar dataKey="Erreicht" fill="hsl(var(--chart-2))" />
              <Bar dataKey="Interessiert" fill="hsl(var(--chart-3))" />
              <Bar dataKey="Termine" fill="hsl(var(--chart-4))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Settings & Closings</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="Sett. geplant" fill="hsl(var(--chart-1))" />
              <Bar dataKey="Sett. gehalten" fill="hsl(var(--chart-2))" />
              <Bar dataKey="Clos. geplant" fill="hsl(var(--chart-4))" />
              <Bar dataKey="Clos. gehalten" fill="hsl(var(--chart-5))" />
              <Bar dataKey="Deals" fill="hsl(var(--chart-3))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Umsatz</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="Cash Collected" fill="hsl(var(--chart-4))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Show-Rates & Closing-Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="Sett. Show %" stroke="hsl(var(--chart-1))" strokeWidth={2} />
              <Line type="monotone" dataKey="Clos. Show %" stroke="hsl(var(--chart-4))" strokeWidth={2} />
              <Line type="monotone" dataKey="Closing %" stroke="hsl(var(--chart-3))" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
