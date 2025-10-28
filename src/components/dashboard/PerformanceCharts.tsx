import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { KPIEntry } from "@/pages/Dashboard";

interface PerformanceChartsProps {
  entries: KPIEntry[];
}

export const PerformanceCharts = ({ entries }: PerformanceChartsProps) => {
  if (entries.length === 0) {
    return null;
  }

  const chartData = [...entries]
    .reverse()
    .slice(-8)
    .map((entry) => ({
      date: new Date(entry.week_start_date).toLocaleDateString("de-DE", {
        day: "2-digit",
        month: "2-digit",
      }),
      leads: entry.leads_generated,
      qualifiedLeads: entry.qualified_leads,
      appointments: entry.appointments_scheduled,
      sales: entry.sales_closed,
      revenue: entry.revenue,
      posts: entry.posts_count,
      followers: entry.new_followers,
      impressions: entry.impressions,
      engagement: entry.engagement_rate,
    }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Lead-Entwicklung</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="leads" stroke="hsl(var(--primary))" name="Leads" strokeWidth={2} />
              <Line type="monotone" dataKey="qualifiedLeads" stroke="hsl(var(--success))" name="Qualifiziert" strokeWidth={2} />
              <Line type="monotone" dataKey="appointments" stroke="hsl(var(--warning))" name="Termine" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Abschlüsse & Umsatz</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="sales" fill="hsl(var(--success))" name="Abschlüsse" />
              <Bar yAxisId="right" dataKey="revenue" fill="hsl(var(--primary))" name="Umsatz (€)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>LinkedIn Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="posts" stroke="hsl(var(--primary))" name="Posts" strokeWidth={2} />
              <Line type="monotone" dataKey="followers" stroke="hsl(var(--success))" name="Neue Follower" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Reichweite & Engagement</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="impressions" fill="hsl(var(--chart-1))" name="Impressionen" />
              <Bar yAxisId="right" dataKey="engagement" fill="hsl(var(--chart-2))" name="Engagement %" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
