import { useState, useEffect, useMemo } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import {
  BarChart3, Phone, Package, DollarSign, TrendingUp, TrendingDown,
  Calendar, Users, Target, Activity, ArrowUpRight, ArrowDownRight,
  AlertTriangle, CheckCircle2, XCircle, UserSearch, Trophy,
} from "lucide-react";
import {
  outboundKPIConfigs, marketingKPIConfigs, salesKPIConfigs, financeKPIConfigs,
} from "@/lib/kpiTrackerConfigs";

type TimeRange = "daily" | "weekly" | "monthly";

interface Props {
  tenant: any | null;
  open: boolean;
  onClose: () => void;
}

// ═══════════════════════════════════════════
// KPI WEAKNESS ANALYSIS
// ═══════════════════════════════════════════

interface KPIStatus {
  label: string;
  icon: string;
  current: number | null;
  target: number;
  unit: string;
  status: "on-track" | "off-track" | "critical";
  percentOfTarget: number;
  impact: string;
  actions: string[];
  category: string;
}

function analyzeKPIs(metrics: any[], category: string, configs: typeof outboundKPIConfigs): KPIStatus[] {
  if (!metrics.length) return [];

  return configs.map((config) => {
    const current = config.getValue(metrics);
    if (current === null) return null;

    const ratio = config.higherIsBetter
      ? current / config.target
      : config.target / current;

    let status: KPIStatus["status"] = "on-track";
    if (ratio < (config.criticalThreshold || 0.5)) status = "critical";
    else if (ratio < 1) status = "off-track";

    // For inverse KPIs (lower is better), flip logic
    if (!config.higherIsBetter) {
      if (current > config.target * 2) status = "critical";
      else if (current > config.target) status = "off-track";
      else status = "on-track";
    }

    return {
      label: config.label,
      icon: config.icon,
      current,
      target: config.target,
      unit: config.unit,
      status,
      percentOfTarget: Math.round(ratio * 100),
      impact: config.getImpact(current, config.target),
      actions: config.actions,
      category,
    } as KPIStatus;
  }).filter(Boolean) as KPIStatus[];
}

function formatKPIValue(value: number, unit: string): string {
  if (unit === "€") return `${value.toLocaleString("de-DE")}€`;
  if (unit === "%") return `${value.toFixed(1)}%`;
  return value.toLocaleString("de-DE");
}

// ═══════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════

export function TenantDetailSheet({ tenant, open, onClose }: Props) {
  const [timeRange, setTimeRange] = useState<TimeRange>("weekly");
  const [metrics, setMetrics] = useState<any[]>([]);
  const [fulfillment, setFulfillment] = useState<any>(null);
  const [financial, setFinancial] = useState<any>(null);
  const [healthScores, setHealthScores] = useState<any[]>([]);
  const [icpCustomers, setIcpCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (tenant && open) loadDetail();
  }, [tenant, open, timeRange]);

  const loadDetail = async () => {
    if (!tenant) return;
    setLoading(true);

    const viewMap: Record<TimeRange, string> = {
      daily: "v_metrics_daily",
      weekly: "v_metrics_weekly",
      monthly: "v_metrics_monthly",
    };
    const dateCol = timeRange === "daily" ? "period_date" : "period_start";
    const limit = timeRange === "daily" ? 30 : timeRange === "weekly" ? 12 : 6;

    const currentMonth = new Date().toISOString().slice(0, 7) + "-01";

    const [mRes, fRes, finRes, hRes, icpRes] = await Promise.all([
      supabase.from(viewMap[timeRange] as any).select("*").eq("tenant_id", tenant.id)
        .order(dateCol, { ascending: false }).limit(limit),
      supabase.from("fulfillment_tracking").select("*").eq("tenant_id", tenant.id).maybeSingle(),
      supabase.from("financial_tracking").select("*").eq("tenant_id", tenant.id).eq("period_month", currentMonth).maybeSingle(),
      supabase.from("health_scores").select("*").eq("tenant_id", tenant.id).order("created_at", { ascending: false }).limit(5),
      supabase.from("icp_customers").select("*").eq("tenant_id", tenant.id).order("sort_order"),
    ]);

    setMetrics((mRes.data as any) || []);
    setFulfillment(fRes.data);
    setFinancial(finRes.data);
    setHealthScores(hRes.data || []);
    setIcpCustomers(icpRes.data || []);
    setLoading(false);
  };

  // KPI Analysis from knowledge base
  const kpiAnalysis = useMemo(() => {
    if (!metrics.length) return [];
    const all = [
      ...analyzeKPIs(metrics, "Outbound", outboundKPIConfigs),
      ...analyzeKPIs(metrics, "Marketing", marketingKPIConfigs),
      ...analyzeKPIs(metrics, "Sales", salesKPIConfigs),
      ...analyzeKPIs(metrics, "Finanzen", financeKPIConfigs),
    ];
    // Sort: critical first, then off-track, then on-track
    return all.sort((a, b) => {
      const order = { critical: 0, "off-track": 1, "on-track": 2 };
      return order[a.status] - order[b.status];
    });
  }, [metrics]);

  const weakKPIs = kpiAnalysis.filter(k => k.status !== "on-track");
  const strongKPIs = kpiAnalysis.filter(k => k.status === "on-track");

  const n = (v: any) => parseFloat(String(v)) || 0;

  if (!tenant) return null;

  const health = healthScores[0];
  const f = fulfillment;
  const fin = financial;
  const m = metrics[0]; // latest period

  const cash = n(fin?.cash_collected);
  const costs = n(fin?.costs_ads) + n(fin?.costs_tools) + n(fin?.costs_personnel) + n(fin?.costs_other);
  const cashflow = cash - costs;
  const margin = cash > 0 ? ((cashflow / cash) * 100).toFixed(1) : "–";

  const onbDays = f?.onboarding_started_at
    ? Math.round((new Date(f.onboarding_completed_at || new Date()).getTime() - new Date(f.onboarding_started_at).getTime()) / 86400000)
    : null;
  const progress = f?.milestones_total > 0 ? Math.round((f.milestones_completed / f.milestones_total) * 100) : 0;

  const rangeLabel: Record<TimeRange, string> = { daily: "Tage", weekly: "Wochen", monthly: "Monate" };

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

        {/* Time Range Selector */}
        <div className="px-6 pt-4 pb-2">
          <div className="flex items-center gap-1 bg-secondary/50 rounded-xl p-1">
            {(["daily", "weekly", "monthly"] as const).map((r) => (
              <Button
                key={r}
                variant={timeRange === r ? "default" : "ghost"}
                size="sm"
                className={`flex-1 text-xs rounded-lg h-8 ${timeRange === r ? "" : "text-muted-foreground"}`}
                onClick={() => setTimeRange(r)}
              >
                {r === "daily" ? "📅 Täglich" : r === "weekly" ? "📊 Wöchentlich" : "📈 Monatlich"}
              </Button>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground mt-1.5 text-center">
            {metrics.length} {rangeLabel[timeRange]} geladen
          </p>
        </div>

        <div className="p-6 pt-2 space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          ) : (
            <Tabs defaultValue="summary" className="w-full">
              <TabsList className="grid w-full grid-cols-6 bg-secondary/50">
                <TabsTrigger value="summary" className="text-[10px]">🎯 Analyse</TabsTrigger>
                <TabsTrigger value="marketing" className="text-[10px]">📈 Mktg</TabsTrigger>
                <TabsTrigger value="sales" className="text-[10px]">📞 Sales</TabsTrigger>
                <TabsTrigger value="fulfillment" className="text-[10px]">📦 Fulfm.</TabsTrigger>
                <TabsTrigger value="finance" className="text-[10px]">💰 Fin.</TabsTrigger>
                <TabsTrigger value="icp" className="text-[10px]">👤 ICP</TabsTrigger>
              </TabsList>

              {/* ═══ KPI SUMMARY / WEAKNESS TAB ═══ */}
              <TabsContent value="summary" className="space-y-4 mt-4">
                {kpiAnalysis.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">Keine KPI-Daten für diesen Zeitraum vorhanden</p>
                ) : (
                  <>
                    {/* Overview cards */}
                    <div className="grid grid-cols-3 gap-2">
                      <Card className="glass-card border-destructive/20">
                        <CardContent className="p-3 text-center">
                          <XCircle className="h-4 w-4 text-destructive mx-auto mb-1" />
                          <p className="text-lg font-bold text-destructive">{kpiAnalysis.filter(k => k.status === "critical").length}</p>
                          <p className="text-[9px] text-muted-foreground">Kritisch</p>
                        </CardContent>
                      </Card>
                      <Card className="glass-card border-warning/20">
                        <CardContent className="p-3 text-center">
                          <AlertTriangle className="h-4 w-4 text-warning mx-auto mb-1" />
                          <p className="text-lg font-bold text-warning">{kpiAnalysis.filter(k => k.status === "off-track").length}</p>
                          <p className="text-[9px] text-muted-foreground">Off-Track</p>
                        </CardContent>
                      </Card>
                      <Card className="glass-card border-success/20">
                        <CardContent className="p-3 text-center">
                          <CheckCircle2 className="h-4 w-4 text-success mx-auto mb-1" />
                          <p className="text-lg font-bold text-success">{strongKPIs.length}</p>
                          <p className="text-[9px] text-muted-foreground">On-Track</p>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Weak KPIs */}
                    {weakKPIs.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-destructive flex items-center gap-1.5">
                          <AlertTriangle className="h-3.5 w-3.5" /> Schwachstellen ({weakKPIs.length})
                        </p>
                        {weakKPIs.map((kpi, i) => (
                          <KPIWeaknessCard key={i} kpi={kpi} />
                        ))}
                      </div>
                    )}

                    {/* Strong KPIs */}
                    {strongKPIs.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-success flex items-center gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Stärken ({strongKPIs.length})
                        </p>
                        {strongKPIs.map((kpi, i) => (
                          <Card key={i} className="glass-card border-success/10">
                            <CardContent className="p-3 flex items-center gap-3">
                              <span className="text-base">{kpi.icon}</span>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <p className="text-xs font-medium truncate">{kpi.label}</p>
                                  <Badge variant="outline" className="text-[9px] bg-success/10 text-success border-success/30 shrink-0 ml-2">
                                    {kpi.category}
                                  </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {formatKPIValue(kpi.current!, kpi.unit)} / Ziel: {formatKPIValue(kpi.target, kpi.unit)}
                                </p>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </TabsContent>

              {/* ═══ MARKETING TAB ═══ */}
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

                {/* Trend mini chart */}
                {metrics.length > 1 && (
                  <Card className="glass-card">
                    <CardHeader className="py-3"><CardTitle className="text-xs text-muted-foreground">Trend – Leads ({rangeLabel[timeRange]})</CardTitle></CardHeader>
                    <CardContent className="pb-3">
                      <MiniBarChart data={metrics} field="leads_total" />
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* ═══ SALES TAB ═══ */}
              <TabsContent value="sales" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-3">
                  <KpiCard label="Anwahlen" value={n(m?.calls_made)} icon={Phone} />
                  <KpiCard label="Erreicht" value={n(m?.calls_reached)} icon={Phone} />
                  <KpiCard label="Erreichungsquote" value={n(m?.reach_rate) > 0 ? `${n(m?.reach_rate).toFixed(1)}%` : "–"} icon={TrendingUp} />
                  <KpiCard label="Settings geplant" value={n(m?.settings_planned)} icon={Calendar} />
                  <KpiCard label="Settings gehalten" value={n(m?.settings_held)} icon={Calendar} />
                  <KpiCard label="Setting Show" value={n(m?.setting_show_rate) > 0 ? `${n(m?.setting_show_rate).toFixed(1)}%` : "–"} icon={TrendingUp}
                    good={n(m?.setting_show_rate) >= 70} bad={n(m?.setting_show_rate) > 0 && n(m?.setting_show_rate) < 70} />
                  <KpiCard label="Closings geplant" value={n(m?.closings_planned)} icon={Target} />
                  <KpiCard label="Closings gehalten" value={n(m?.closings_held)} icon={Target} />
                  <KpiCard label="Closing Show" value={n(m?.closing_show_rate) > 0 ? `${n(m?.closing_show_rate).toFixed(1)}%` : "–"} icon={TrendingUp}
                    good={n(m?.closing_show_rate) >= 70} bad={n(m?.closing_show_rate) > 0 && n(m?.closing_show_rate) < 70} />
                  <KpiCard label="Deals" value={n(m?.deals)} icon={Target} accent />
                  <KpiCard label="Closing-Rate" value={n(m?.closing_rate) > 0 ? `${n(m?.closing_rate).toFixed(1)}%` : "–"} icon={TrendingUp}
                    good={n(m?.closing_rate) >= 20} bad={n(m?.closing_rate) > 0 && n(m?.closing_rate) < 20} />
                  <KpiCard label="Deal Volume" value={`${n(m?.deal_volume).toLocaleString("de-DE")}€`} icon={DollarSign} accent />
                </div>

                {metrics.length > 1 && (
                  <Card className="glass-card">
                    <CardHeader className="py-3"><CardTitle className="text-xs text-muted-foreground">Trend – Deals ({rangeLabel[timeRange]})</CardTitle></CardHeader>
                    <CardContent className="pb-3">
                      <MiniBarChart data={metrics} field="deals" />
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* ═══ FULFILLMENT TAB ═══ */}
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

              {/* ═══ FINANCE TAB ═══ */}
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
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ═══════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════

function KPIWeaknessCard({ kpi }: { kpi: KPIStatus }) {
  const [expanded, setExpanded] = useState(false);
  const isCritical = kpi.status === "critical";

  return (
    <Card className={`glass-card cursor-pointer transition-all ${isCritical ? "border-destructive/30" : "border-warning/30"}`}
      onClick={() => setExpanded(!expanded)}>
      <CardContent className="p-3">
        <div className="flex items-center gap-3">
          <span className="text-base">{kpi.icon}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-xs font-medium truncate">{kpi.label}</p>
              <Badge variant="outline" className={`text-[9px] shrink-0 ${
                isCritical ? "bg-destructive/10 text-destructive border-destructive/30" : "bg-warning/10 text-warning border-warning/30"
              }`}>
                {isCritical ? "Kritisch" : "Off-Track"} · {kpi.category}
              </Badge>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`text-sm font-bold ${isCritical ? "text-destructive" : "text-warning"}`}>
                {formatKPIValue(kpi.current!, kpi.unit)}
              </span>
              <span className="text-[10px] text-muted-foreground">/ Ziel: {formatKPIValue(kpi.target, kpi.unit)}</span>
              <span className={`text-[10px] font-medium ${isCritical ? "text-destructive" : "text-warning"}`}>
                ({kpi.percentOfTarget}%)
              </span>
            </div>
          </div>
        </div>

        {expanded && (
          <div className="mt-3 pt-3 border-t border-border/30 space-y-2">
            <p className="text-xs text-muted-foreground italic">{kpi.impact}</p>
            <p className="text-[10px] font-semibold text-foreground">Empfohlene Maßnahmen:</p>
            <ul className="space-y-1">
              {kpi.actions.slice(0, 3).map((a, i) => (
                <li key={i} className="text-[10px] text-muted-foreground flex items-start gap-1.5">
                  <span className="text-primary mt-0.5">→</span>
                  {a}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function MiniBarChart({ data, field }: { data: any[]; field: string }) {
  const n = (v: any) => parseFloat(String(v)) || 0;
  const reversed = [...data].reverse();
  const max = Math.max(...reversed.map(d => n(d[field])), 1);

  return (
    <div className="flex items-end gap-1 h-16">
      {reversed.map((d: any, i: number) => {
        const val = n(d[field]);
        const h = (val / max) * 100;
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full rounded-t bg-primary/60" style={{ height: `${Math.max(h, 4)}%` }} />
            <span className="text-[9px] text-muted-foreground">{val}</span>
          </div>
        );
      })}
    </div>
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
