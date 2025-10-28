import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Target, Users, DollarSign, FileText } from "lucide-react";

interface Props {
  metrics: any[];
}

export function ClientMetricsCards({ metrics }: Props) {
  if (!metrics || metrics.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          Noch keine Daten verfügbar. Bitte synchronisiere dein Sheet.
        </p>
      </div>
    );
  }

  const thisWeek = metrics.slice(0, 7);
  const lastWeek = metrics.slice(7, 14);

  const sumWeek = (week: any[], field: string) =>
    week.reduce((sum, m) => sum + (parseFloat(m[field]) || 0), 0);

  const leadsThisWeek = sumWeek(thisWeek, "leads_total");
  const leadsLastWeek = sumWeek(lastWeek, "leads_total");
  const appointmentsThisWeek = sumWeek(thisWeek, "appointments");
  const appointmentsLastWeek = sumWeek(lastWeek, "appointments");
  const dealsThisWeek = sumWeek(thisWeek, "deals");
  const dealsLastWeek = sumWeek(lastWeek, "deals");
  const revenueThisWeek = sumWeek(thisWeek, "revenue");
  const revenueLastWeek = sumWeek(lastWeek, "revenue");
  const followersThisWeek = sumWeek(thisWeek, "new_followers");
  const postsThisWeek = sumWeek(thisWeek, "posts");

  const convLeadsToAppts = leadsThisWeek > 0 ? (appointmentsThisWeek / leadsThisWeek) * 100 : 0;
  const convApptsToDeals = appointmentsThisWeek > 0 ? (dealsThisWeek / appointmentsThisWeek) * 100 : 0;

  const MetricCard = ({ title, value, change, icon: Icon, format = "number" }: any) => {
    const changePercent = change !== undefined && change !== 0 
      ? ((value - change) / change) * 100 
      : 0;
    const isPositive = changePercent >= 0;

    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {format === "currency" ? `${value.toFixed(0)}€` : 
             format === "percent" ? `${value.toFixed(1)}%` : 
             value}
          </div>
          {change !== undefined && (
            <p className={`text-xs flex items-center gap-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {Math.abs(changePercent).toFixed(1)}% vs. Vorwoche
            </p>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
        title="Leads (Woche)"
        value={leadsThisWeek}
        change={leadsLastWeek}
        icon={Target}
      />
      <MetricCard
        title="Termine (Woche)"
        value={appointmentsThisWeek}
        change={appointmentsLastWeek}
        icon={Users}
      />
      <MetricCard
        title="Deals (Woche)"
        value={dealsThisWeek}
        change={dealsLastWeek}
        icon={TrendingUp}
      />
      <MetricCard
        title="Umsatz (Woche)"
        value={revenueThisWeek}
        change={revenueLastWeek}
        icon={DollarSign}
        format="currency"
      />
      <MetricCard
        title="Lead → Termin Conv."
        value={convLeadsToAppts}
        icon={Target}
        format="percent"
      />
      <MetricCard
        title="Termin → Deal Conv."
        value={convApptsToDeals}
        icon={Target}
        format="percent"
      />
      <MetricCard
        title="Neue Follower"
        value={followersThisWeek}
        icon={Users}
      />
      <MetricCard
        title="Posts (Woche)"
        value={postsThisWeek}
        icon={FileText}
      />
    </div>
  );
}
