import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from "recharts";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  tenantId: string;
}

export function FinanceCharts({ tenantId }: Props) {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data: rows } = await supabase
        .from("financial_tracking")
        .select("*")
        .eq("tenant_id", tenantId)
        .order("period_month", { ascending: true })
        .limit(12);
      setData(rows || []);
    };
    if (tenantId) load();
  }, [tenantId]);

  if (data.length === 0) return null;

  const chartData = data.map(r => {
    const revenue = parseFloat(r.cash_collected) || 0;
    const costs = (parseFloat(r.costs_ads) || 0) + (parseFloat(r.costs_tools) || 0) +
      (parseFloat(r.costs_personnel) || 0) + (parseFloat(r.costs_other) || 0);
    const cashflow = revenue - costs;
    const margin = revenue > 0 ? Math.round((cashflow / revenue) * 100) : 0;
    return {
      date: new Date(r.period_month).toLocaleDateString("de-DE", { month: "short", year: "2-digit" }),
      Einnahmen: revenue,
      Kosten: costs,
      Cashflow: cashflow,
      "Marge %": margin,
      Ads: parseFloat(r.costs_ads) || 0,
      Tools: parseFloat(r.costs_tools) || 0,
      Personal: parseFloat(r.costs_personnel) || 0,
      Sonstiges: parseFloat(r.costs_other) || 0,
      "Wiederkehrend": parseFloat(r.revenue_recurring) || 0,
      "Einmalig": parseFloat(r.revenue_onetime) || 0,
      "Offene RE": parseFloat(r.invoices_open_amount) || 0,
      "Überfällig": parseFloat(r.invoices_overdue_amount) || 0,
    };
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Einnahmen vs. Kosten</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => `${v.toLocaleString("de-DE")}€`} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="Einnahmen" fill="hsl(var(--chart-2))" />
              <Bar dataKey="Kosten" fill="hsl(var(--chart-1))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Cashflow & Marge</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} domain={[-100, 100]} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line yAxisId="left" type="monotone" dataKey="Cashflow" stroke="hsl(var(--chart-3))" strokeWidth={2} />
              <Line yAxisId="right" type="monotone" dataKey="Marge %" stroke="hsl(var(--chart-4))" strokeWidth={2} strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Kostenaufteilung</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => `${v.toLocaleString("de-DE")}€`} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Area type="monotone" dataKey="Ads" stackId="1" fill="hsl(var(--chart-1))" stroke="hsl(var(--chart-1))" />
              <Area type="monotone" dataKey="Tools" stackId="1" fill="hsl(var(--chart-2))" stroke="hsl(var(--chart-2))" />
              <Area type="monotone" dataKey="Personal" stackId="1" fill="hsl(var(--chart-3))" stroke="hsl(var(--chart-3))" />
              <Area type="monotone" dataKey="Sonstiges" stackId="1" fill="hsl(var(--chart-4))" stroke="hsl(var(--chart-4))" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Offene & überfällige Rechnungen</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => `${v.toLocaleString("de-DE")}€`} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="Offene RE" fill="hsl(var(--chart-2))" />
              <Bar dataKey="Überfällig" fill="hsl(var(--chart-1))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
