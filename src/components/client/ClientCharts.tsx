import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from "recharts";

interface Props {
  metrics: any[];
}

export function ClientCharts({ metrics }: Props) {
  if (!metrics || metrics.length === 0) return null;

  // Prepare data for charts (last 30 days)
  const chartData = metrics.slice(0, 30).reverse().map(m => ({
    date: new Date(m.period_date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' }),
    Leads: m.leads_total || 0,
    Termine: m.appointments || 0,
    Deals: m.deals || 0,
    Umsatz: parseFloat(m.revenue || 0),
    Posts: m.posts || 0,
    Follower: m.new_followers || 0,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Funnel: Leads → Termine → Deals</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="Leads" stroke="hsl(var(--primary))" strokeWidth={2} />
              <Line type="monotone" dataKey="Termine" stroke="hsl(var(--chart-2))" strokeWidth={2} />
              <Line type="monotone" dataKey="Deals" stroke="hsl(var(--chart-3))" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Umsatzentwicklung</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Umsatz" fill="hsl(var(--chart-4))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Content-Aktivität</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Posts" fill="hsl(var(--chart-1))" />
              <Bar dataKey="Follower" fill="hsl(var(--chart-5))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
