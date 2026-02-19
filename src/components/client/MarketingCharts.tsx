import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, AreaChart, Area } from "recharts";

interface Props {
  metrics: any[];
  timeRange?: string;
}

export function MarketingCharts({ metrics, timeRange = "daily" }: Props) {
  if (!metrics || metrics.length === 0) return null;

  const dateKey = timeRange === "daily" ? "period_date" : "period_start";

  const chartData = [...metrics].reverse().map(m => ({
    date: new Date(m[dateKey]).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" }),
    Impressionen: parseFloat(m.impressions) || 0,
    Likes: parseFloat(m.likes) || 0,
    Kommentare: parseFloat(m.comments) || 0,
    "Link Clicks": parseFloat(m.link_clicks) || 0,
    "Neue Follower": parseFloat(m.new_followers) || 0,
    "Follower gesamt": parseFloat(m.followers_current) || 0,
    "DMs gesendet": parseFloat(m.dms_sent) || 0,
    Leads: parseFloat(m.leads_total) || 0,
    MQL: parseFloat(m.leads_qualified) || 0,
    "MQL-Quote %": parseFloat(m.lead_quality_rate) || 0,
    "Reach-Rate %": parseFloat(m.reach_rate) || 0,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Reichweite & Engagement</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Area type="monotone" dataKey="Impressionen" fill="hsl(var(--chart-1))" stroke="hsl(var(--chart-1))" fillOpacity={0.2} />
              <Area type="monotone" dataKey="Likes" fill="hsl(var(--chart-2))" stroke="hsl(var(--chart-2))" fillOpacity={0.2} />
              <Area type="monotone" dataKey="Kommentare" fill="hsl(var(--chart-3))" stroke="hsl(var(--chart-3))" fillOpacity={0.2} />
              <Area type="monotone" dataKey="Link Clicks" fill="hsl(var(--chart-4))" stroke="hsl(var(--chart-4))" fillOpacity={0.2} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Follower-Entwicklung</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="Neue Follower" fill="hsl(var(--chart-2))" />
              <Bar dataKey="DMs gesendet" fill="hsl(var(--chart-4))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Leads & MQL</CardTitle>
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
              <Bar dataKey="MQL" fill="hsl(var(--chart-3))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Quoten</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="MQL-Quote %" stroke="hsl(var(--chart-1))" strokeWidth={2} />
              <Line type="monotone" dataKey="Reach-Rate %" stroke="hsl(var(--chart-4))" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
