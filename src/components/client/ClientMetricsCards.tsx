import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Target, Users, DollarSign, FileText, BarChart3, Percent, Phone, PhoneCall } from "lucide-react";

interface Props {
  metrics: any[];
  timeRange?: string;
}

export function ClientMetricsCards({ metrics, timeRange = "daily" }: Props) {
  if (!metrics || metrics.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Noch keine Daten für diesen Zeitraum.</p>
      </div>
    );
  }

  const sum = (field: string) => metrics.reduce((s, m) => s + (parseFloat(m[field]) || 0), 0);
  const avg = (field: string) => {
    const vals = metrics.filter(m => m[field] != null && parseFloat(m[field]) > 0);
    if (vals.length === 0) return 0;
    return vals.reduce((s, m) => s + parseFloat(m[field]), 0) / vals.length;
  };

  const cards = [
    { title: "Leads", value: sum("leads_total"), icon: Target, format: "number" },
    { title: "Qual. Leads", value: sum("leads_qualified"), icon: Target, format: "number" },
    { title: "Anwahlen", value: sum("calls_made"), icon: Phone, format: "number" },
    { title: "Erreicht", value: sum("calls_reached"), icon: PhoneCall, format: "number" },
    { title: "Termine", value: sum("appointments"), icon: Users, format: "number" },
    { title: "Setting Show-Rate", value: avg("setting_show_rate"), icon: Percent, format: "percent" },
    { title: "Closing Show-Rate", value: avg("closing_show_rate"), icon: Percent, format: "percent" },
    { title: "Closing-Rate", value: avg("closing_rate"), icon: BarChart3, format: "percent" },
    { title: "Deals", value: sum("deals"), icon: TrendingUp, format: "number" },
    { title: "Cash Collected", value: sum("cash_collected") || sum("revenue"), icon: DollarSign, format: "currency" },
    { title: "Umsatz/Lead", value: avg("revenue_per_lead"), icon: DollarSign, format: "currency" },
    { title: "Kosten/Lead", value: avg("cost_per_lead"), icon: DollarSign, format: "currency" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
      {cards.map((card) => (
        <Card key={card.title} className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
            <CardTitle className="text-xs font-medium text-muted-foreground">{card.title}</CardTitle>
            <card.icon className="h-3.5 w-3.5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="text-xl font-bold">
              {card.format === "currency" ? `${card.value.toFixed(0)}€` :
               card.format === "percent" ? (card.value > 0 ? `${card.value.toFixed(1)}%` : "–") :
               card.value}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
