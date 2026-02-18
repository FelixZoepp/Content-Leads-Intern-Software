import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Save, Edit2, TrendingUp, TrendingDown, ArrowRight, ArrowLeft } from "lucide-react";

interface Props {
  tenantId: string;
}

const monthLabel = (d: string) => new Date(d).toLocaleDateString("de-DE", { month: "long", year: "numeric" });

export function FinancialTracker({ tenantId }: Props) {
  const { toast } = useToast();
  const [data, setData] = useState<any>(null);
  const [prevData, setPrevData] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(
    new Date().toISOString().slice(0, 7) + "-01"
  );

  const [form, setForm] = useState({
    cash_collected: 0,
    revenue_recurring: 0,
    revenue_onetime: 0,
    costs_ads: 0,
    costs_tools: 0,
    costs_personnel: 0,
    costs_other: 0,
    invoices_open_count: 0,
    invoices_open_amount: 0,
    invoices_overdue_count: 0,
    invoices_overdue_amount: 0,
    avg_days_to_payment: 0,
    notes: "",
  });

  useEffect(() => { loadData(); }, [tenantId, currentMonth]);

  const loadData = async () => {
    setLoading(true);
    const { data: row } = await supabase
      .from("financial_tracking")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("period_month", currentMonth)
      .maybeSingle();

    // Previous month for comparison
    const prevMonth = new Date(currentMonth);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    const prevStr = prevMonth.toISOString().slice(0, 10);
    const { data: prev } = await supabase
      .from("financial_tracking")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("period_month", prevStr)
      .maybeSingle();
    setPrevData(prev);

    if (row) {
      setData(row);
      setForm({
        cash_collected: parseFloat(String(row.cash_collected)) || 0,
        revenue_recurring: parseFloat(String(row.revenue_recurring)) || 0,
        revenue_onetime: parseFloat(String(row.revenue_onetime)) || 0,
        costs_ads: parseFloat(String(row.costs_ads)) || 0,
        costs_tools: parseFloat(String(row.costs_tools)) || 0,
        costs_personnel: parseFloat(String(row.costs_personnel)) || 0,
        costs_other: parseFloat(String(row.costs_other)) || 0,
        invoices_open_count: row.invoices_open_count || 0,
        invoices_open_amount: parseFloat(String(row.invoices_open_amount)) || 0,
        invoices_overdue_count: row.invoices_overdue_count || 0,
        invoices_overdue_amount: parseFloat(String(row.invoices_overdue_amount)) || 0,
        avg_days_to_payment: row.avg_days_to_payment || 0,
        notes: row.notes || "",
      });
    } else {
      setData(null);
      setForm({
        cash_collected: 0, revenue_recurring: 0, revenue_onetime: 0,
        costs_ads: 0, costs_tools: 0, costs_personnel: 0, costs_other: 0,
        invoices_open_count: 0, invoices_open_amount: 0,
        invoices_overdue_count: 0, invoices_overdue_amount: 0,
        avg_days_to_payment: 0, notes: "",
      });
    }
    setLoading(false);
  };

  const set = (field: string, value: any) => setForm(prev => ({ ...prev, [field]: value }));
  const setNum = (field: string, raw: string, decimal = false) =>
    set(field, decimal ? (parseFloat(raw) || 0) : (parseInt(raw) || 0));

  const totalRevenue = form.cash_collected;
  const totalCosts = form.costs_ads + form.costs_tools + form.costs_personnel + form.costs_other;
  const cashflow = totalRevenue - totalCosts;
  const margin = totalRevenue > 0 ? ((cashflow / totalRevenue) * 100).toFixed(1) : "–";

  const prevCashflow = prevData
    ? (parseFloat(prevData.cash_collected) || 0) - 
      ((parseFloat(prevData.costs_ads) || 0) + (parseFloat(prevData.costs_tools) || 0) + 
       (parseFloat(prevData.costs_personnel) || 0) + (parseFloat(prevData.costs_other) || 0))
    : null;

  const navigateMonth = (dir: number) => {
    const d = new Date(currentMonth);
    d.setMonth(d.getMonth() + dir);
    setCurrentMonth(d.toISOString().slice(0, 10));
  };

  const handleSave = async () => {
    setSaving(true);
    const payload: any = {
      tenant_id: tenantId,
      period_month: currentMonth,
      ...form,
    };

    const { error } = data
      ? await supabase.from("financial_tracking").update(payload).eq("id", data.id)
      : await supabase.from("financial_tracking").insert(payload);

    setSaving(false);
    if (error) {
      toast({ title: "Fehler", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Gespeichert ✓", description: `Finanzen für ${monthLabel(currentMonth)} gespeichert` });
      setEditing(false);
      loadData();
    }
  };

  const NumField = ({ id, label, value, onChange, decimal, prefix }: {
    id: string; label: string; value: number; onChange: (v: string) => void;
    decimal?: boolean; prefix?: string;
  }) => (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs font-medium">{label}</Label>
      <div className="relative">
        {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">{prefix}</span>}
        <Input id={id} type="number" min="0" step={decimal ? "0.01" : "1"}
          inputMode={decimal ? "decimal" : "numeric"}
          className={prefix ? "pl-7" : ""}
          value={value} onChange={(e) => onChange(e.target.value)} />
      </div>
    </div>
  );

  if (loading) return null;

  // Summary view
  if (!editing && data) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">💰 Finanzen</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => navigateMonth(-1)}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium min-w-[120px] text-center">{monthLabel(currentMonth)}</span>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => navigateMonth(1)}>
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                <Edit2 className="h-3.5 w-3.5 mr-1" /> Bearbeiten
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            <KPICard label="Cash Collected" value={`${totalRevenue.toLocaleString("de-DE")}€`} />
            <KPICard label="Wiederkehrend" value={`${form.revenue_recurring.toLocaleString("de-DE")}€`} />
            <KPICard label="Einmalig" value={`${form.revenue_onetime.toLocaleString("de-DE")}€`} />
            <KPICard label="Gesamtkosten" value={`${totalCosts.toLocaleString("de-DE")}€`} />
            <KPICard label="Cashflow" value={`${cashflow.toLocaleString("de-DE")}€`}
              trend={cashflow >= 0 ? "up" : "down"} />
            <KPICard label="Marge" value={margin === "–" ? "–" : `${margin}%`}
              trend={parseFloat(margin as string) >= 0 ? "up" : "down"} />
          </div>

          {/* Cost breakdown */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <KPICard label="Ads" value={`${form.costs_ads.toLocaleString("de-DE")}€`} small />
            <KPICard label="Tools" value={`${form.costs_tools.toLocaleString("de-DE")}€`} small />
            <KPICard label="Personal" value={`${form.costs_personnel.toLocaleString("de-DE")}€`} small />
            <KPICard label="Sonstige" value={`${form.costs_other.toLocaleString("de-DE")}€`} small />
          </div>

          {/* Invoices */}
          <div className="flex flex-wrap gap-3">
            {form.invoices_open_count > 0 && (
              <Badge variant="outline">
                {form.invoices_open_count} offene Rechnungen ({form.invoices_open_amount.toLocaleString("de-DE")}€)
              </Badge>
            )}
            {form.invoices_overdue_count > 0 && (
              <Badge variant="outline" className="border-destructive/50 text-destructive">
                {form.invoices_overdue_count} überfällig ({form.invoices_overdue_amount.toLocaleString("de-DE")}€)
              </Badge>
            )}
            {form.avg_days_to_payment > 0 && (
              <Badge variant="outline">
                ⌀ {form.avg_days_to_payment} Tage bis Zahlung
              </Badge>
            )}
          </div>

          {/* Vormonatsvergleich */}
          {prevCashflow !== null && (
            <div className="text-xs text-muted-foreground bg-muted/30 rounded px-3 py-2">
              Vormonat Cashflow: <strong className="text-foreground">{prevCashflow.toLocaleString("de-DE")}€</strong>
              {" → "}
              <span className={cashflow > prevCashflow ? "text-green-600" : cashflow < prevCashflow ? "text-destructive" : ""}>
                {cashflow > prevCashflow ? "↑" : cashflow < prevCashflow ? "↓" : "="} {Math.abs(cashflow - prevCashflow).toLocaleString("de-DE")}€
              </span>
            </div>
          )}

          {form.notes && (
            <p className="text-sm text-muted-foreground bg-muted/30 rounded p-3">{form.notes}</p>
          )}
        </CardContent>
      </Card>
    );
  }

  // Edit/Create form
  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">💰 Finanzen – {monthLabel(currentMonth)}</CardTitle>
            <CardDescription>Einnahmen, Kosten, Rechnungen und Cashflow</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => navigateMonth(-1)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => navigateMonth(1)}>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Revenue */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-primary">📥 Einnahmen</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <NumField id="cash_collected" label="Cash Collected (gesamt)" value={form.cash_collected}
                onChange={(v) => setNum("cash_collected", v, true)} decimal prefix="€" />
              <NumField id="revenue_recurring" label="Wiederkehrend (MRR)" value={form.revenue_recurring}
                onChange={(v) => setNum("revenue_recurring", v, true)} decimal prefix="€" />
              <NumField id="revenue_onetime" label="Einmalig" value={form.revenue_onetime}
                onChange={(v) => setNum("revenue_onetime", v, true)} decimal prefix="€" />
            </div>
          </div>

          {/* Costs */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-primary">📤 Kosten</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <NumField id="costs_ads" label="Werbung / Ads" value={form.costs_ads}
                onChange={(v) => setNum("costs_ads", v, true)} decimal prefix="€" />
              <NumField id="costs_tools" label="Tools / Software" value={form.costs_tools}
                onChange={(v) => setNum("costs_tools", v, true)} decimal prefix="€" />
              <NumField id="costs_personnel" label="Personal" value={form.costs_personnel}
                onChange={(v) => setNum("costs_personnel", v, true)} decimal prefix="€" />
              <NumField id="costs_other" label="Sonstiges" value={form.costs_other}
                onChange={(v) => setNum("costs_other", v, true)} decimal prefix="€" />
            </div>
          </div>

          {/* Invoices */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-primary">🧾 Rechnungen</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <NumField id="invoices_open_count" label="Offene Rechnungen" value={form.invoices_open_count}
                onChange={(v) => setNum("invoices_open_count", v)} />
              <NumField id="invoices_open_amount" label="Offener Betrag" value={form.invoices_open_amount}
                onChange={(v) => setNum("invoices_open_amount", v, true)} decimal prefix="€" />
              <NumField id="invoices_overdue_count" label="Überfällige Rechnungen" value={form.invoices_overdue_count}
                onChange={(v) => setNum("invoices_overdue_count", v)} />
              <NumField id="invoices_overdue_amount" label="Überfälliger Betrag" value={form.invoices_overdue_amount}
                onChange={(v) => setNum("invoices_overdue_amount", v, true)} decimal prefix="€" />
              <NumField id="avg_days_to_payment" label="⌀ Tage bis Zahlung" value={form.avg_days_to_payment}
                onChange={(v) => setNum("avg_days_to_payment", v)} />
            </div>
          </div>

          {/* Live Cashflow */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              {cashflow >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              Berechnete Kennzahlen (live)
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-background rounded-md p-3 text-center">
                <div className="text-xs text-muted-foreground">Gesamtkosten</div>
                <div className="text-lg font-bold text-primary">{totalCosts.toLocaleString("de-DE")}€</div>
              </div>
              <div className="bg-background rounded-md p-3 text-center">
                <div className="text-xs text-muted-foreground">Cashflow</div>
                <div className={`text-lg font-bold ${cashflow >= 0 ? "text-green-600" : "text-destructive"}`}>
                  {cashflow.toLocaleString("de-DE")}€
                </div>
              </div>
              <div className="bg-background rounded-md p-3 text-center">
                <div className="text-xs text-muted-foreground">Marge</div>
                <div className={`text-lg font-bold ${parseFloat(margin as string) >= 0 ? "text-green-600" : "text-destructive"}`}>
                  {margin === "–" ? "–" : `${margin}%`}
                </div>
              </div>
              <div className="bg-background rounded-md p-3 text-center">
                <div className="text-xs text-muted-foreground">Offene Beträge</div>
                <div className="text-lg font-bold text-primary">
                  {form.invoices_open_amount.toLocaleString("de-DE")}€
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Notizen</Label>
            <Textarea value={form.notes} onChange={(e) => set("notes", e.target.value)}
              placeholder="Besonderheiten, ausstehende Zahlungen..." rows={2} />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={saving} className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Wird gespeichert..." : "Finanzen speichern"}
            </Button>
            {data && (
              <Button variant="outline" onClick={() => setEditing(false)}>Abbrechen</Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function KPICard({ label, value, trend, small }: { label: string; value: string; trend?: "up" | "down"; small?: boolean }) {
  return (
    <div className={`bg-muted/50 rounded-lg ${small ? "p-2" : "p-3"} text-center`}>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`font-bold ${small ? "text-sm" : "text-lg"} ${
        trend === "up" ? "text-green-600" : trend === "down" ? "text-destructive" : "text-primary"
      }`}>
        {value}
      </div>
    </div>
  );
}
