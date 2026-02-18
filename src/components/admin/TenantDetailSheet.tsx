import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import {
  BarChart3, Phone, Package, DollarSign, TrendingUp, TrendingDown,
  Calendar, Users, Target, Activity, ArrowUpRight, ArrowDownRight,
} from "lucide-react";

interface Props {
  tenant: any | null;
  open: boolean;
  onClose: () => void;
}

export function TenantDetailSheet({ tenant, open, onClose }: Props) {
  const [metrics, setMetrics] = useState<any>(null);
  const [weeklyMetrics, setWeeklyMetrics] = useState<any[]>([]);
  const [fulfillment, setFulfillment] = useState<any>(null);
  const [financial, setFinancial] = useState<any>(null);
  const [healthScores, setHealthScores] = useState<any[]>([]);

  useEffect(() => {
    if (tenant && open) loadDetail();
  }, [tenant, open]);

  const loadDetail = async () => {
    if (!tenant) return;
    const currentMonth = new Date().toISOString().slice(0, 7) + "-01";

    const [mRes, wRes, fRes, finRes, hRes] = await Promise.all([
      supabase.from("v_metrics_monthly" as any).select("*").eq("tenant_id", tenant.id)
        .gte("period_start", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0]).limit(1),
      supabase.from("v_metrics_weekly" as any).select("*").eq("tenant_id", tenant.id)
        .order("period_start", { ascending: false }).limit(8),
      supabase.from("fulfillment_tracking").select("*").eq("tenant_id", tenant.id).maybeSingle(),
      supabase.from("financial_tracking").select("*").eq("tenant_id", tenant.id).eq("period_month", currentMonth).maybeSingle(),
      supabase.from("health_scores").select("*").eq("tenant_id", tenant.id).order("created_at", { ascending: false }).limit(5),
    ]);

    setMetrics((mRes.data as any)?.[0] || null);
    setWeeklyMetrics((wRes.data as any) || []);
    setFulfillment(fRes.data);
    setFinancial(finRes.data);
    setHealthScores(hRes.data || []);
  };

  const n = (v: any) => parseFloat(String(v)) || 0;

  if (!tenant) return null;

  const health = healthScores[0];
  const f = fulfillment;
  const fin = financial;
  const m = metrics;

  const cash = n(fin?.cash_collected);
  const costs = n(fin?.costs_ads) + n(fin?.costs_tools) + n(fin?.costs_personnel) + n(fin?.costs_other);
  const cashflow = cash - costs;
  const margin = cash > 0 ? ((cashflow / cash) * 100).toFixed(1) : "–";

  const onbDays = f?.onboarding_started_at
    ? Math.round((new Date(f.onboarding_completed_at || new Date()).getTime() - new Date(f.onboarding_started_at).getTime()) / 86400000)
    : null;
  const progress = f?.milestones_total > 0 ? Math.round((f.milestones_completed / f.milestones_total) * 100) : 0;

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto glass-sidebar border-l border-border/50 p-0">
        <SheetHeader className="p-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <SheetTitle className="text-lg">{tenant.company_name}</SheetTitle>
              <p className="text-xs text-muted-foreground">{tenant.contact_name || "Kein Kontakt hinterlegt"}</p>
            </div>
            {health && (
              <Badge variant="outline" className={`ml-auto ${
                health.color === "green" ? "border-success/50 text-success bg-success/10"
                : health.color === "amber" ? "border-warning/50 text-warning bg-warning/10"
                : "border-destructive/50 text-destructive bg-destructive/10"
              }`}>
                Health: {health.score}/100
              </Badge>
            )}
          </div>
        </SheetHeader>

        <Separator className="opacity-30" />

        <div className="p-6 space-y-6">
          <Tabs defaultValue="marketing" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-secondary/50">
              <TabsTrigger value="marketing" className="text-xs">📈 Marketing</TabsTrigger>
              <TabsTrigger value="sales" className="text-xs">📞 Sales</TabsTrigger>
              <TabsTrigger value="fulfillment" className="text-xs">📦 Fulfillm.</TabsTrigger>
              <TabsTrigger value="finance" className="text-xs">💰 Finanzen</TabsTrigger>
            </TabsList>

            {/* Marketing */}
            <TabsContent value="marketing" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-3">
                <KpiCard label="Impressionen" value={n(m?.impressions).toLocaleString("de-DE")} icon={BarChart3} />
                <KpiCard label="Kommentare" value={n(m?.comments)} icon={Activity} />
                <KpiCard label="DMs gesendet" value={n(m?.dms_sent)} icon={Target} />
                <KpiCard label="Leads gesamt" value={n(m?.leads_total)} icon={Target} />
                <KpiCard label="MQL" value={n(m?.leads_qualified)} icon={Target} accent />
                <KpiCard label="MQL-Quote" value={n(m?.lead_quality_rate) > 0 ? `${n(m?.lead_quality_rate)}%` : "–"} icon={TrendingUp} />
                <KpiCard label="Follower" value={n(m?.followers_current).toLocaleString("de-DE")} icon={Users} />
                <KpiCard label="Link-Klicks" value={n(m?.link_clicks)} icon={ArrowUpRight} />
              </div>

              {weeklyMetrics.length > 0 && (
                <Card className="glass-card">
                  <CardHeader className="py-3"><CardTitle className="text-xs text-muted-foreground">Letzte Wochen – Leads</CardTitle></CardHeader>
                  <CardContent className="pb-3">
                    <div className="flex items-end gap-1 h-16">
                      {weeklyMetrics.slice().reverse().map((w: any, i: number) => {
                        const max = Math.max(...weeklyMetrics.map((ww: any) => n(ww.leads_total)), 1);
                        const h = (n(w.leads_total) / max) * 100;
                        return (
                          <div key={i} className="flex-1 flex flex-col items-center gap-1">
                            <div className="w-full rounded-t bg-primary/60" style={{ height: `${Math.max(h, 4)}%` }} />
                            <span className="text-[9px] text-muted-foreground">{n(w.leads_total)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Sales */}
            <TabsContent value="sales" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-3">
                <KpiCard label="Anwahlen" value={n(m?.calls_made)} icon={Phone} />
                <KpiCard label="Erreicht" value={n(m?.calls_reached)} icon={Phone} />
                <KpiCard label="Erreichungsquote" value={n(m?.reach_rate) > 0 ? `${n(m?.reach_rate)}%` : "–"} icon={TrendingUp} />
                <KpiCard label="Termine" value={n(m?.appointments)} icon={Calendar} />
                <KpiCard label="Setting Show" value={n(m?.setting_show_rate) > 0 ? `${n(m?.setting_show_rate)}%` : "–"} icon={TrendingUp}
                  good={n(m?.setting_show_rate) >= 70} bad={n(m?.setting_show_rate) > 0 && n(m?.setting_show_rate) < 70} />
                <KpiCard label="Closing Show" value={n(m?.closing_show_rate) > 0 ? `${n(m?.closing_show_rate)}%` : "–"} icon={TrendingUp}
                  good={n(m?.closing_show_rate) >= 70} bad={n(m?.closing_show_rate) > 0 && n(m?.closing_show_rate) < 70} />
                <KpiCard label="Deals" value={n(m?.deals)} icon={Target} accent />
                <KpiCard label="Closing-Rate" value={n(m?.closing_rate) > 0 ? `${n(m?.closing_rate)}%` : "–"} icon={TrendingUp}
                  good={n(m?.closing_rate) >= 20} bad={n(m?.closing_rate) > 0 && n(m?.closing_rate) < 20} />
                <KpiCard label="Cash Collected" value={`${n(m?.cash_collected).toLocaleString("de-DE")}€`} icon={DollarSign} accent />
                <KpiCard label="Deal Volume" value={`${n(m?.deal_volume).toLocaleString("de-DE")}€`} icon={DollarSign} />
              </div>
            </TabsContent>

            {/* Fulfillment */}
            <TabsContent value="fulfillment" className="space-y-4 mt-4">
              {f ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <KpiCard label="Status" value={
                      f.project_status === "active" ? "Aktiv" :
                      f.project_status === "onboarding" ? "Onboarding" :
                      f.project_status === "paused" ? "Pausiert" :
                      f.project_status === "completed" ? "Fertig" : f.project_status
                    } icon={Package}
                      good={f.project_status === "active"} />
                    <KpiCard label="Onboarding" value={onbDays !== null ? `${onbDays} Tage` : "–"} icon={Calendar} />
                    <KpiCard label="CSAT" value={f.csat_score ? `${n(f.csat_score)}/5` : "–"} icon={Activity}
                      good={n(f.csat_score) >= 4} bad={n(f.csat_score) > 0 && n(f.csat_score) < 3} />
                    <KpiCard label="NPS" value={f.nps_score != null ? f.nps_score : "–"} icon={TrendingUp}
                      good={n(f.nps_score) >= 8} bad={n(f.nps_score) > 0 && n(f.nps_score) < 6} />
                  </div>

                  {f.milestones_total > 0 && (
                    <Card className="glass-card">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-muted-foreground">Meilensteine</span>
                          <span className="text-sm font-medium">{f.milestones_completed}/{f.milestones_total}</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </CardContent>
                    </Card>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <KpiCard label="Vertrag bis" value={f.contract_end ? new Date(f.contract_end).toLocaleDateString("de-DE") : "–"} icon={Calendar} />
                    <KpiCard label="Verlängert" value={f.contract_renewed ? "✓ Ja" : "Nein"} icon={Activity}
                      good={f.contract_renewed} />
                  </div>

                  {f.notes && (
                    <Card className="glass-card">
                      <CardContent className="p-4">
                        <p className="text-xs text-muted-foreground mb-1">Notizen</p>
                        <p className="text-sm">{f.notes}</p>
                      </CardContent>
                    </Card>
                  )}
                </>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">Keine Fulfillment-Daten vorhanden</p>
              )}
            </TabsContent>

            {/* Finance */}
            <TabsContent value="finance" className="space-y-4 mt-4">
              {fin ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <KpiCard label="Cash Collected" value={`${cash.toLocaleString("de-DE")}€`} icon={DollarSign} accent />
                    <KpiCard label="MRR" value={`${n(fin.revenue_recurring).toLocaleString("de-DE")}€`} icon={TrendingUp} />
                    <KpiCard label="Einmalig" value={`${n(fin.revenue_onetime).toLocaleString("de-DE")}€`} icon={DollarSign} />
                    <KpiCard label="Kosten gesamt" value={`${costs.toLocaleString("de-DE")}€`} icon={ArrowDownRight} />
                  </div>

                  <Card className="glass-card">
                    <CardContent className="p-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Cashflow</span>
                        <span className={`font-bold ${cashflow >= 0 ? "text-success" : "text-destructive"}`}>
                          {cashflow.toLocaleString("de-DE")}€
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Marge</span>
                        <span className="font-medium">{margin === "–" ? "–" : `${margin}%`}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <p className="text-xs text-muted-foreground font-medium mt-2">Kostenaufschlüsselung</p>
                  <div className="grid grid-cols-2 gap-3">
                    <KpiCard label="Ads" value={`${n(fin.costs_ads).toLocaleString("de-DE")}€`} icon={ArrowDownRight} />
                    <KpiCard label="Tools" value={`${n(fin.costs_tools).toLocaleString("de-DE")}€`} icon={ArrowDownRight} />
                    <KpiCard label="Personal" value={`${n(fin.costs_personnel).toLocaleString("de-DE")}€`} icon={ArrowDownRight} />
                    <KpiCard label="Sonstige" value={`${n(fin.costs_other).toLocaleString("de-DE")}€`} icon={ArrowDownRight} />
                  </div>

                  <p className="text-xs text-muted-foreground font-medium mt-2">Rechnungen</p>
                  <div className="grid grid-cols-2 gap-3">
                    <KpiCard label="Offen" value={fin.invoices_open_count > 0 ? `${fin.invoices_open_count} (${n(fin.invoices_open_amount).toLocaleString("de-DE")}€)` : "–"} icon={Calendar} />
                    <KpiCard label="Überfällig" value={fin.invoices_overdue_count > 0 ? `${fin.invoices_overdue_count} (${n(fin.invoices_overdue_amount).toLocaleString("de-DE")}€)` : "–"} icon={Calendar}
                      bad={fin.invoices_overdue_count > 0} />
                    <KpiCard label="⌀ Zahlungsziel" value={fin.avg_days_to_payment > 0 ? `${fin.avg_days_to_payment} Tage` : "–"} icon={Calendar} />
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">Keine Finanzdaten für diesen Monat</p>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function KpiCard({ label, value, icon: Icon, accent, good, bad }: {
  label: string; value: string | number; icon: any; accent?: boolean; good?: boolean; bad?: boolean;
}) {
  return (
    <Card className="glass-card">
      <CardContent className="p-3 flex items-center gap-3">
        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
          accent ? "bg-primary/15" : "bg-secondary/60"
        }`}>
          <Icon className={`h-4 w-4 ${accent ? "text-primary" : "text-muted-foreground"}`} />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] text-muted-foreground truncate">{label}</p>
          <p className={`text-sm font-semibold truncate ${
            good ? "text-success" : bad ? "text-destructive" : "text-foreground"
          }`}>{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
