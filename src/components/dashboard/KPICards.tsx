import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Users, Calendar, DollarSign, FileText, Eye, Heart, UserPlus } from "lucide-react";
import { KPIEntry } from "@/pages/Dashboard";

interface KPICardsProps {
  entries: KPIEntry[];
}

export const KPICards = ({ entries }: KPICardsProps) => {
  const latestEntry = entries[0];

  if (!latestEntry) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Noch keine KPI-Daten vorhanden</p>
      </div>
    );
  }

  const kpiData = [
    {
      title: "Leads generiert",
      value: latestEntry.leads_generated,
      icon: Users,
      color: "text-primary",
    },
    {
      title: "Qualifizierte Leads",
      value: latestEntry.qualified_leads,
      icon: TrendingUp,
      color: "text-success",
    },
    {
      title: "Termine",
      value: latestEntry.appointments_scheduled,
      icon: Calendar,
      color: "text-warning",
    },
    {
      title: "Abschlüsse",
      value: latestEntry.sales_closed,
      icon: DollarSign,
      color: "text-success",
    },
    {
      title: "Umsatz",
      value: `€${latestEntry.revenue.toLocaleString()}`,
      icon: DollarSign,
      color: "text-success",
    },
    {
      title: "LinkedIn Posts",
      value: latestEntry.posts_count,
      icon: FileText,
      color: "text-primary",
    },
    {
      title: "Impressionen",
      value: latestEntry.impressions.toLocaleString(),
      icon: Eye,
      color: "text-muted-foreground",
    },
    {
      title: "Engagement-Rate",
      value: `${latestEntry.engagement_rate}%`,
      icon: Heart,
      color: "text-destructive",
    },
    {
      title: "Neue Follower",
      value: latestEntry.new_followers,
      icon: UserPlus,
      color: "text-primary",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {kpiData.map((kpi, index) => {
        const Icon = kpi.icon;
        return (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {kpi.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${kpi.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
