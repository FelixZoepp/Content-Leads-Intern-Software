import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Loader2, Mail, Building2, Linkedin, BarChart3, Target, ChevronRight, ChevronLeft,
  Sparkles, DollarSign, ShoppingBag, HelpCircle, Users, TrendingUp, Phone, CalendarDays,
  ArrowLeft, CheckCircle2, UserSearch, Plus, Trash2
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import ICPAnalysisStep, { ICPClient, emptyICPClient } from "@/components/admin/ICPAnalysisStep";

const STEPS = [
  { icon: Mail, label: "Account" },
  { icon: Building2, label: "Firma" },
  { icon: Linkedin, label: "LinkedIn" },
  { icon: ShoppingBag, label: "Angebot" },
  { icon: DollarSign, label: "Finanzen" },
  { icon: Users, label: "Kunden" },
  { icon: TrendingUp, label: "Vertrieb" },
  { icon: BarChart3, label: "KPIs" },
  { icon: Target, label: "Ziele" },
  { icon: UserSearch, label: "ICP-Analyse" },
  { icon: CalendarDays, label: "3-Monats-Historie" },
];

const INDUSTRIES = [
  "SaaS / Software", "Agentur / Beratung", "E-Commerce", "Finanzdienstleistung",
  "Immobilien", "Coaching / Training", "Gesundheit / Medizin", "Handwerk / Industrie", "Sonstige",
];
const DURATIONS = ["Einmalig / Projekt", "1 Monat", "3 Monate", "6 Monate", "12 Monate", "24 Monate"];

function NumField({ label, fieldKey, placeholder, unit, formData, unknowns, update, toggleUnknown }: {
  label: string; fieldKey: string; placeholder: string; unit?: string;
  formData: Record<string, string>; unknowns: Set<string>;
  update: (k: string, v: string) => void; toggleUnknown: (k: string) => void;
}) {
  const isUnknown = unknowns.has(fieldKey);
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label className="text-sm">
          {label}
          {unit && <span className="text-muted-foreground ml-1 font-normal text-xs">({unit})</span>}
        </Label>
        <button type="button" onClick={() => toggleUnknown(fieldKey)}
          className={`flex items-center gap-1 text-[11px] rounded-full px-2 py-0.5 transition-colors ${
            isUnknown ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}>
          <HelpCircle className="h-3 w-3" /> Unbekannt
        </button>
      </div>
      <Input type="number" step="any" value={isUnknown ? "" : formData[fieldKey]}
        onChange={(e) => update(fieldKey, e.target.value)}
        placeholder={isUnknown ? "– übersprungen –" : placeholder}
        disabled={isUnknown} className={isUnknown ? "bg-muted/50 text-muted-foreground" : ""} />
    </div>
  );
}

export default function AdminOnboarding() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [unknowns, setUnknowns] = useState<Set<string>>(new Set());

  const [form, setForm] = useState({
    // Account
    email: "", companyName: "", contactName: "", industry: "",
    // Firma
    teamSize: "", targetAudience: "", websiteUrl: "",
    // LinkedIn
    linkedinUrl: "", linkedinFollowersCurrent: "", postingFrequency: "", linkedinExperience: "",
    // Angebot
    currentOffer: "", closingRate: "",
    // Finanzen
    revenueRecurring: "", revenueOnetime: "", adsSpendMonthly: "", toolsCostsMonthly: "",
    personnelCostsMonthly: "", deliveryCostsMonthly: "", otherCostsMonthly: "",
    // Kunden
    totalCustomers: "", existingCustomers: "", newCustomersMonthly: "",
    aovNewCustomer: "", aovExistingCustomer: "", paymentDefaultRate: "", contractDurationMonths: "",
    // Vertrieb
    commissionRateActual: "", commissionRateTarget: "", salesGrossSalary: "", salesSideCosts: "",
    fulfillmentGrossSalary: "", fulfillmentToolCosts: "", cacTarget: "", costPerCustomerFulfillment: "",
    // KPIs
    currentLeadsPerMonth: "", currentConversionRate: "", monthlyBudget: "", costPerLead: "", costPerAppointment: "",
    // Ziele
    goalLeadsMonthly: "", goalRevenueMonthly: "", goalTimeframe: "", primaryGoal: "",
  });

  // 3-month history: each month has marketing + sales + finance KPIs
  const [history, setHistory] = useState([
    { label: "Vor 3 Monaten", impressions: "", likes: "", comments: "", newFollowers: "", leadsTotal: "", leadsQualified: "", callsMade: "", callsReached: "", callsInterested: "", appointments: "", settingsPlanned: "", settingsHeld: "", closingsPlanned: "", closingsHeld: "", closings: "", deals: "", revenue: "", dealVolume: "" },
    { label: "Vor 2 Monaten", impressions: "", likes: "", comments: "", newFollowers: "", leadsTotal: "", leadsQualified: "", callsMade: "", callsReached: "", callsInterested: "", appointments: "", settingsPlanned: "", settingsHeld: "", closingsPlanned: "", closingsHeld: "", closings: "", deals: "", revenue: "", dealVolume: "" },
    { label: "Letzter Monat", impressions: "", likes: "", comments: "", newFollowers: "", leadsTotal: "", leadsQualified: "", callsMade: "", callsReached: "", callsInterested: "", appointments: "", settingsPlanned: "", settingsHeld: "", closingsPlanned: "", closingsHeld: "", closings: "", deals: "", revenue: "", dealVolume: "" },
  ]);

  // ICP customers
  // ICP customers - detailed analysis
  const [icpClients, setIcpClients] = useState<ICPClient[]>(Array.from({ length: 10 }, emptyICPClient));
  const [icpShowResults, setIcpShowResults] = useState(false);

  const update = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));
  const toggleUnknown = (k: string) => {
    setUnknowns(prev => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k); else { next.add(k); update(k, ""); }
      return next;
    });
  };
  const updateHistory = (idx: number, key: string, val: string) =>
    setHistory(prev => prev.map((m, i) => i === idx ? { ...m, [key]: val } : m));

  const val = (k: string) => unknowns.has(k) ? null : (parseFloat(form[k as keyof typeof form]) || 0);
  const valInt = (k: string) => unknowns.has(k) ? null : (parseInt(form[k as keyof typeof form]) || 0);
  const valNullable = (k: string) => { if (unknowns.has(k)) return null; const v = parseFloat(form[k as keyof typeof form]); return isNaN(v) ? null : v; };

  // Computed
  const totalRevenue = useMemo(() => (parseFloat(form.revenueRecurring) || 0) + (parseFloat(form.revenueOnetime) || 0), [form.revenueRecurring, form.revenueOnetime]);
  const totalCosts = useMemo(() => [form.adsSpendMonthly, form.toolsCostsMonthly, form.personnelCostsMonthly, form.deliveryCostsMonthly, form.otherCostsMonthly].reduce((s, v) => s + (parseFloat(v) || 0), 0), [form.adsSpendMonthly, form.toolsCostsMonthly, form.personnelCostsMonthly, form.deliveryCostsMonthly, form.otherCostsMonthly]);
  const profit = totalRevenue - totalCosts;
  const marginPercent = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;
  const avgProductPrice = useMemo(() => { const prices = products.filter(p => p.price).map(p => parseFloat(p.price)); return prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0; }, [products]);
  const aovNewAuto = useMemo(() => { const m = parseFloat(form.aovNewCustomer); if (!isNaN(m) && form.aovNewCustomer) return m; return avgProductPrice; }, [form.aovNewCustomer, avgProductPrice]);
  const aovExistingAuto = useMemo(() => { const m = parseFloat(form.aovExistingCustomer); if (!isNaN(m) && form.aovExistingCustomer) return m; const mrr = parseFloat(form.revenueRecurring) || 0; const ex = parseFloat(form.existingCustomers) || 0; return mrr > 0 && ex > 0 ? Math.round(mrr / ex) : 0; }, [form.aovExistingCustomer, form.revenueRecurring, form.existingCustomers]);
  const newCustomerVolume = useMemo(() => { const c = parseFloat(form.newCustomersMonthly) || 0; return aovNewAuto > 0 && c > 0 ? aovNewAuto * c : 0; }, [aovNewAuto, form.newCustomersMonthly]);
  const existingCustomerVolume = useMemo(() => { const c = parseFloat(form.existingCustomers) || 0; return aovExistingAuto > 0 && c > 0 ? aovExistingAuto * c : 0; }, [aovExistingAuto, form.existingCustomers]);
  const totalOrderVolume = newCustomerVolume + existingCustomerVolume;
  const ltvCalculated = useMemo(() => { const months = parseFloat(form.contractDurationMonths) || 0; return aovNewAuto > 0 && months > 0 ? aovNewAuto * months : 0; }, [aovNewAuto, form.contractDurationMonths]);
  const cacCalculated = useMemo(() => { const all = totalCosts + [form.salesGrossSalary, form.salesSideCosts, form.fulfillmentGrossSalary, form.fulfillmentToolCosts].reduce((s, v) => s + (parseFloat(v) || 0), 0); const n = parseFloat(form.newCustomersMonthly) || 0; return all > 0 && n > 0 ? Math.round(all / n) : 0; }, [totalCosts, form.salesGrossSalary, form.salesSideCosts, form.fulfillmentGrossSalary, form.fulfillmentToolCosts, form.newCustomersMonthly]);

  const progress = ((step + 1) / STEPS.length) * 100;

  const canNext = () => {
    if (step === 0) return form.email.trim().length > 0 && form.companyName.trim().length > 0;
    return true;
  };

  // Step 0: Create account
  const handleCreateAccount = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("invite-customer", {
        body: {
          email: form.email.trim(),
          company_name: form.companyName.trim(),
          contact_name: form.contactName.trim() || null,
          industry: form.industry || null,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setTenantId(data.tenant_id);
      toast({ title: "Account erstellt ✓", description: data.invited ? `Einladung an ${form.email} gesendet` : "Bestehendem Benutzer zugewiesen" });
      setStep(1);
    } catch (err: any) {
      toast({ title: "Fehler", description: err.message, variant: "destructive" });
    }
    setLoading(false);
  };

  // Final submit: update tenant + insert history
  const handleFinish = async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      // Update tenant with all KPI data
      const tenantPayload: Record<string, any> = {
        team_size: form.teamSize || null,
        target_audience: form.targetAudience || null,
        website_url: form.websiteUrl || null,
        linkedin_url: form.linkedinUrl || null,
        linkedin_followers_current: valInt("linkedinFollowersCurrent"),
        posting_frequency: form.postingFrequency || null,
        linkedin_experience: form.linkedinExperience || null,
        current_offer: form.currentOffer || null,
        offer_price: avgProductPrice > 0 ? avgProductPrice : null,
        product_palette: products.filter(p => p.name.trim()).length > 0 ? products.filter(p => p.name.trim()) : null,
        closing_rate: val("closingRate"),
        revenue_recurring: val("revenueRecurring"),
        revenue_onetime: val("revenueOnetime"),
        current_revenue_monthly: totalRevenue > 0 ? totalRevenue : null,
        ads_spend_monthly: val("adsSpendMonthly"),
        tools_costs_monthly: val("toolsCostsMonthly"),
        personnel_costs_monthly: val("personnelCostsMonthly"),
        delivery_costs_monthly: val("deliveryCostsMonthly"),
        other_costs_monthly: val("otherCostsMonthly"),
        margin_percent: totalRevenue > 0 ? Math.round(marginPercent * 10) / 10 : null,
        monthly_budget: val("monthlyBudget"),
        cost_per_lead: val("costPerLead"),
        cost_per_appointment: val("costPerAppointment"),
        current_leads_per_month: valInt("currentLeadsPerMonth"),
        current_conversion_rate: val("currentConversionRate"),
        total_customers: valNullable("totalCustomers"),
        existing_customers: valNullable("existingCustomers"),
        new_customers_monthly: valNullable("newCustomersMonthly"),
        aov_new_customer: aovNewAuto > 0 ? aovNewAuto : null,
        aov_existing_customer: aovExistingAuto > 0 ? aovExistingAuto : null,
        new_customer_volume: newCustomerVolume > 0 ? newCustomerVolume : null,
        existing_customer_volume: existingCustomerVolume > 0 ? existingCustomerVolume : null,
        order_volume_monthly: totalOrderVolume > 0 ? totalOrderVolume : null,
        payment_default_rate: valNullable("paymentDefaultRate"),
        ltv_avg_customer: ltvCalculated > 0 ? ltvCalculated : null,
        commission_rate_actual: valNullable("commissionRateActual"),
        commission_rate_target: valNullable("commissionRateTarget"),
        sales_gross_salary: valNullable("salesGrossSalary"),
        sales_side_costs: valNullable("salesSideCosts"),
        fulfillment_gross_salary: valNullable("fulfillmentGrossSalary"),
        fulfillment_tool_costs: valNullable("fulfillmentToolCosts"),
        cac_actual: cacCalculated > 0 ? cacCalculated : null,
        cac_target: valNullable("cacTarget"),
        cost_per_customer_fulfillment: valNullable("costPerCustomerFulfillment"),
        goal_leads_monthly: valInt("goalLeadsMonthly"),
        goal_revenue_monthly: val("goalRevenueMonthly"),
        goal_timeframe: form.goalTimeframe || null,
        primary_goal: form.primaryGoal || null,
        onboarding_completed: true,
      };

      const { error: updateErr } = await supabase
        .from("tenants").update(tenantPayload).eq("id", tenantId);
      if (updateErr) throw updateErr;

      // Insert 3-month history as metrics_snapshot
      const now = new Date();
      const monthOffsets = [3, 2, 1];
      const snapshots = history.map((m, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - monthOffsets[i], 1);
        const periodDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
        return {
          tenant_id: tenantId,
          period_date: periodDate,
          period_type: "monthly",
          impressions: parseInt(m.impressions) || 0,
          likes: parseInt(m.likes) || 0,
          comments: parseInt(m.comments) || 0,
          new_followers: parseInt(m.newFollowers) || 0,
          calls_made: parseInt(m.callsMade) || 0,
          calls_reached: parseInt(m.callsReached) || 0,
          calls_interested: parseInt(m.callsInterested) || 0,
          leads_total: parseInt(m.leadsTotal) || 0,
          leads_qualified: parseInt(m.leadsQualified) || 0,
          appointments: parseInt(m.appointments) || 0,
          settings_planned: parseInt(m.settingsPlanned) || 0,
          settings_held: parseInt(m.settingsHeld) || 0,
          closings_planned: parseInt(m.closingsPlanned) || 0,
          closings_held: parseInt(m.closingsHeld) || 0,
          closings: parseInt(m.closings) || 0,
          deals: parseInt(m.deals) || 0,
          revenue: parseFloat(m.revenue) || 0,
          deal_volume: parseFloat(m.dealVolume) || 0,
        };
      }).filter(s => Object.entries(s).some(([k, v]) => !["tenant_id", "period_date", "period_type"].includes(k) && v !== 0));

      if (snapshots.length > 0) {
        const { error: snapErr } = await supabase.from("metrics_snapshot").insert(snapshots);
        if (snapErr) throw snapErr;
      }

      // Insert ICP customers from detailed analysis
      const icpToInsert = icpClients
        .filter(c => c.firma.trim() && c.branche)
        .map((c, i) => ({
          tenant_id: tenantId,
          customer_name: c.firma.trim(),
          contact_name: c.name || null,
          industry: c.branche || null,
          employee_count: c.mitarbeiter || null,
          annual_revenue: c.jahresumsatz || null,
          lead_source: c.leadQuelle || null,
          close_duration: c.closeDauer || null,
          deal_value: c.dealValue ? parseFloat(c.dealValue) : null,
          payment_status: c.gezahlt || null,
          payment_speed: c.zahlungsSpeed || null,
          collaboration_score: c.zusammenarbeit || 0,
          result_score: c.ergebnis || 0,
          problem_awareness: c.problemBewusstsein || null,
          has_paid: c.gezahlt === "Ja, komplett",
          notes: c.notizen || null,
          sort_order: i,
        }));
      if (icpToInsert.length > 0) {
        const { error: icpErr } = await supabase.from("icp_customers").insert(icpToInsert);
        if (icpErr) throw icpErr;
      }

      toast({ title: "Onboarding abgeschlossen ✓", description: `${form.companyName} wurde vollständig eingerichtet.` });
      navigate("/dashboard");
    } catch (err: any) {
      toast({ title: "Fehler", description: err.message, variant: "destructive" });
    }
    setLoading(false);
  };

  const handleNext = () => {
    if (step === 0 && !tenantId) {
      handleCreateAccount();
      return;
    }
    if (step === STEPS.length - 1) {
      handleFinish();
      return;
    }
    setStep(s => s + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")} className="gap-1.5 text-muted-foreground">
          <ArrowLeft className="h-4 w-4" /> Zurück zum Dashboard
        </Button>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Neuen Kunden onboarden
            </CardTitle>
            <CardDescription>
              Erstelle den Account und erfasse alle Basisdaten in einem Durchgang.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step indicator */}
            <div className="space-y-3">
              <div className="flex justify-between flex-wrap gap-1">
                {STEPS.map((s, i) => (
                  <button key={i} onClick={() => i < step && (i > 0 || tenantId) && setStep(i)}
                    className={`flex items-center gap-1 text-xs font-medium transition-colors ${
                      i === step ? "text-primary" : i < step ? "text-primary/60 cursor-pointer hover:text-primary" : "text-muted-foreground"
                    }`}>
                    <div className={`flex items-center justify-center h-6 w-6 rounded-full text-[10px] font-bold ${
                      i < step ? "bg-primary text-primary-foreground" : i === step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}>
                      {i < step ? <CheckCircle2 className="h-3.5 w-3.5" /> : i + 1}
                    </div>
                    <span className="hidden md:inline">{s.label}</span>
                  </button>
                ))}
              </div>
              <Progress value={progress} className="h-1.5" />
            </div>

            {/* Step 0: Account */}
            {step === 0 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Account anlegen</h3>
                {tenantId && (
                  <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-700 dark:text-green-400 text-sm flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" /> Account wurde bereits erstellt
                  </div>
                )}
                <div className="space-y-1.5">
                  <Label>E-Mail-Adresse *</Label>
                  <Input type="email" value={form.email} onChange={e => update("email", e.target.value)} placeholder="kunde@firma.de" disabled={!!tenantId} />
                </div>
                <div className="space-y-1.5">
                  <Label>Firmenname *</Label>
                  <Input value={form.companyName} onChange={e => update("companyName", e.target.value)} placeholder="Mustermann GmbH" disabled={!!tenantId} />
                </div>
                <div className="space-y-1.5">
                  <Label>Ansprechpartner</Label>
                  <Input value={form.contactName} onChange={e => update("contactName", e.target.value)} placeholder="Max Mustermann" disabled={!!tenantId} />
                </div>
                <div className="space-y-1.5">
                    <Label>Branche</Label>
                    <Select value={form.industry} onValueChange={v => update("industry", v)} disabled={!!tenantId}>
                      <SelectTrigger><SelectValue placeholder="Wählen" /></SelectTrigger>
                      <SelectContent>{INDUSTRIES.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
              </div>
            )}

            {/* Step 1: Firma */}
            {step === 1 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Firmenprofil</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Teamgröße</Label>
                    <Select value={form.teamSize} onValueChange={v => update("teamSize", v)}>
                      <SelectTrigger><SelectValue placeholder="Wählen" /></SelectTrigger>
                      <SelectContent>{["1-5", "6-20", "21-50", "51-200", "200+"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Website</Label>
                    <Input type="url" value={form.websiteUrl} onChange={e => update("websiteUrl", e.target.value)} placeholder="https://..." />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Zielgruppe</Label>
                  <Textarea value={form.targetAudience} onChange={e => update("targetAudience", e.target.value)} placeholder="z.B. B2B-Entscheider, CEOs/CMOs..." rows={2} />
                </div>
              </div>
            )}

            {/* Step 2: LinkedIn */}
            {step === 2 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">LinkedIn-Status</h3>
                <div className="space-y-1.5">
                  <Label>LinkedIn-Profil-URL</Label>
                  <Input type="url" value={form.linkedinUrl} onChange={e => update("linkedinUrl", e.target.value)} placeholder="https://linkedin.com/in/..." />
                </div>
                <NumField label="Aktuelle Follower" fieldKey="linkedinFollowersCurrent" placeholder="500" formData={form} unknowns={unknowns} update={update} toggleUnknown={toggleUnknown} />
                <div className="space-y-1.5">
                  <Label>Posting-Frequenz</Label>
                  <Select value={form.postingFrequency} onValueChange={v => update("postingFrequency", v)}>
                    <SelectTrigger><SelectValue placeholder="Wie oft?" /></SelectTrigger>
                    <SelectContent>{["Noch nie", "Sporadisch (< 1x/Woche)", "1-2x pro Woche", "3-5x pro Woche", "Täglich"].map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>LinkedIn-Erfahrung</Label>
                  <Select value={form.linkedinExperience} onValueChange={v => update("linkedinExperience", v)}>
                    <SelectTrigger><SelectValue placeholder="Erfahrungslevel" /></SelectTrigger>
                    <SelectContent>{["Keine Erfahrung", "Grundkenntnisse", "Fortgeschritten", "Profi"].map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Step 3: Angebot */}
            {step === 3 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Aktuelles Angebot</h3>
                <div className="space-y-1.5">
                  <Label>Was verkauft der Kunde? (Offer)</Label>
                  <Textarea value={form.currentOffer} onChange={e => update("currentOffer", e.target.value)} placeholder="z.B. LinkedIn-Marketing-Paket..." rows={3} />
                </div>
                <NumField label="Closing-Rate" fieldKey="closingRate" placeholder="25" unit="%" formData={form} unknowns={unknowns} update={update} toggleUnknown={toggleUnknown} />
              </div>
            )}

            {/* Step 4: Finanzen */}
            {step === 4 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Monatliche Finanzen <span className="text-primary font-normal normal-case">(Netto)</span></h3>
                <div className="p-3 rounded-lg border border-border/60 bg-muted/30 space-y-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">💰 Einnahmen</p>
                  <div className="grid grid-cols-2 gap-3">
                    <NumField label="Wiederkehrend (MRR)" fieldKey="revenueRecurring" placeholder="10000" unit="€" formData={form} unknowns={unknowns} update={update} toggleUnknown={toggleUnknown} />
                    <NumField label="Einmalig" fieldKey="revenueOnetime" placeholder="5000" unit="€" formData={form} unknowns={unknowns} update={update} toggleUnknown={toggleUnknown} />
                  </div>
                  {totalRevenue > 0 && <div className="flex justify-between text-sm font-medium pt-1 border-t border-border/40"><span>Gesamt</span><span className="text-primary">{totalRevenue.toLocaleString("de-DE")} €</span></div>}
                </div>
                <div className="p-3 rounded-lg border border-border/60 bg-muted/30 space-y-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">📤 Ausgaben</p>
                  <div className="grid grid-cols-2 gap-3">
                    <NumField label="Ads" fieldKey="adsSpendMonthly" placeholder="2000" unit="€" formData={form} unknowns={unknowns} update={update} toggleUnknown={toggleUnknown} />
                    <NumField label="Tools" fieldKey="toolsCostsMonthly" placeholder="500" unit="€" formData={form} unknowns={unknowns} update={update} toggleUnknown={toggleUnknown} />
                    <NumField label="Personal" fieldKey="personnelCostsMonthly" placeholder="3000" unit="€" formData={form} unknowns={unknowns} update={update} toggleUnknown={toggleUnknown} />
                    <NumField label="Delivery" fieldKey="deliveryCostsMonthly" placeholder="1000" unit="€" formData={form} unknowns={unknowns} update={update} toggleUnknown={toggleUnknown} />
                    <NumField label="Sonstige" fieldKey="otherCostsMonthly" placeholder="500" unit="€" formData={form} unknowns={unknowns} update={update} toggleUnknown={toggleUnknown} />
                  </div>
                </div>
                {totalRevenue > 0 && (
                  <div className="p-3 rounded-lg border-2 border-primary/20 bg-primary/5 grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-xs text-muted-foreground">Gewinn</p>
                      <p className={`text-lg font-bold ${profit >= 0 ? "text-green-600 dark:text-green-400" : "text-destructive"}`}>{profit >= 0 ? "+" : ""}{profit.toLocaleString("de-DE")} €</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Marge</p>
                      <p className={`text-lg font-bold ${marginPercent >= 30 ? "text-green-600 dark:text-green-400" : marginPercent >= 10 ? "text-yellow-600" : "text-destructive"}`}>{marginPercent.toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Kostenquote</p>
                      <p className="text-lg font-bold text-foreground">{totalRevenue > 0 ? ((totalCosts / totalRevenue) * 100).toFixed(1) : "0"}%</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 5: Kunden */}
            {step === 5 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Kundenstamm & Volumen</h3>
                <div className="p-3 rounded-lg border border-border/60 bg-muted/30 space-y-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">👥 Kundenanzahl</p>
                  <div className="grid grid-cols-3 gap-3">
                    <NumField label="Gesamt" fieldKey="totalCustomers" placeholder="6" formData={form} unknowns={unknowns} update={update} toggleUnknown={toggleUnknown} />
                    <NumField label="Bestand" fieldKey="existingCustomers" placeholder="4" formData={form} unknowns={unknowns} update={update} toggleUnknown={toggleUnknown} />
                    <NumField label="Neu / Monat" fieldKey="newCustomersMonthly" placeholder="2" formData={form} unknowns={unknowns} update={update} toggleUnknown={toggleUnknown} />
                  </div>
                </div>
                <div className="p-3 rounded-lg border border-border/60 bg-muted/30 space-y-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">💶 AOV & LTV</p>
                  <NumField label="AOV Neukunde" fieldKey="aovNewCustomer" placeholder={aovNewAuto > 0 ? String(aovNewAuto) : "3000"} unit="€" formData={form} unknowns={unknowns} update={update} toggleUnknown={toggleUnknown} />
                  {!form.aovNewCustomer && aovNewAuto > 0 && <p className="text-[10px] text-muted-foreground">Auto aus Angebotspreis: {aovNewAuto.toLocaleString("de-DE")} €</p>}
                  <NumField label="AOV Bestandskunde / Mo" fieldKey="aovExistingCustomer" placeholder={aovExistingAuto > 0 ? String(aovExistingAuto) : "833"} unit="€" formData={form} unknowns={unknowns} update={update} toggleUnknown={toggleUnknown} />
                  <NumField label="Ø Vertragslaufzeit" fieldKey="contractDurationMonths" placeholder="3" unit="Monate" formData={form} unknowns={unknowns} update={update} toggleUnknown={toggleUnknown} />
                  {ltvCalculated > 0 && <div className="flex justify-between text-sm font-semibold pt-1 border-t border-border/40"><span>LTV</span><span className="text-primary">{ltvCalculated.toLocaleString("de-DE")} €</span></div>}
                </div>
                <NumField label="Zahlungsausfallquote" fieldKey="paymentDefaultRate" placeholder="10" unit="%" formData={form} unknowns={unknowns} update={update} toggleUnknown={toggleUnknown} />
              </div>
            )}

            {/* Step 6: Vertrieb */}
            {step === 6 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Vertrieb & Personalkosten</h3>
                <div className="p-3 rounded-lg border border-border/60 bg-muted/30 space-y-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">💰 Provisionen</p>
                  <div className="grid grid-cols-2 gap-3">
                    <NumField label="Provision IST" fieldKey="commissionRateActual" placeholder="0" unit="%" formData={form} unknowns={unknowns} update={update} toggleUnknown={toggleUnknown} />
                    <NumField label="Provision SOLL" fieldKey="commissionRateTarget" placeholder="17.5" unit="%" formData={form} unknowns={unknowns} update={update} toggleUnknown={toggleUnknown} />
                  </div>
                </div>
                <div className="p-3 rounded-lg border border-border/60 bg-muted/30 space-y-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">🏢 Personal</p>
                  <div className="grid grid-cols-2 gap-3">
                    <NumField label="Brutto Vertrieb" fieldKey="salesGrossSalary" placeholder="1175" unit="€" formData={form} unknowns={unknowns} update={update} toggleUnknown={toggleUnknown} />
                    <NumField label="Nebenkosten Vertrieb" fieldKey="salesSideCosts" placeholder="130" unit="€" formData={form} unknowns={unknowns} update={update} toggleUnknown={toggleUnknown} />
                    <NumField label="Brutto Fulfillment" fieldKey="fulfillmentGrossSalary" placeholder="1175" unit="€" formData={form} unknowns={unknowns} update={update} toggleUnknown={toggleUnknown} />
                    <NumField label="Tools Fulfillment" fieldKey="fulfillmentToolCosts" placeholder="1537" unit="€" formData={form} unknowns={unknowns} update={update} toggleUnknown={toggleUnknown} />
                  </div>
                </div>
                <div className="p-3 rounded-lg border-2 border-primary/20 bg-primary/5 space-y-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">🎯 CAC</p>
                  {cacCalculated > 0 && <div className="flex justify-between text-sm font-semibold"><span>CAC IST (auto)</span><span className="text-primary">{cacCalculated.toLocaleString("de-DE")} €</span></div>}
                  <NumField label="CAC SOLL" fieldKey="cacTarget" placeholder="1680" unit="€" formData={form} unknowns={unknowns} update={update} toggleUnknown={toggleUnknown} />
                  <NumField label="Kosten / Kunde Fulfillment" fieldKey="costPerCustomerFulfillment" placeholder="550" unit="€" formData={form} unknowns={unknowns} update={update} toggleUnknown={toggleUnknown} />
                </div>
              </div>
            )}

            {/* Step 7: KPIs */}
            {step === 7 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Aktuelle Kennzahlen</h3>
                <div className="p-3 rounded-lg border border-border/60 bg-muted/30 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <NumField label="Leads / Monat" fieldKey="currentLeadsPerMonth" placeholder="20" formData={form} unknowns={unknowns} update={update} toggleUnknown={toggleUnknown} />
                    <NumField label="Conversion-Rate" fieldKey="currentConversionRate" placeholder="2.5" unit="%" formData={form} unknowns={unknowns} update={update} toggleUnknown={toggleUnknown} />
                    <NumField label="Marketingbudget" fieldKey="monthlyBudget" placeholder="5000" unit="€" formData={form} unknowns={unknowns} update={update} toggleUnknown={toggleUnknown} />
                    <NumField label="Kosten / Lead" fieldKey="costPerLead" placeholder="50" unit="€" formData={form} unknowns={unknowns} update={update} toggleUnknown={toggleUnknown} />
                    <NumField label="Kosten / Termin" fieldKey="costPerAppointment" placeholder="150" unit="€" formData={form} unknowns={unknowns} update={update} toggleUnknown={toggleUnknown} />
                  </div>
                </div>
              </div>
            )}

            {/* Step 8: Ziele */}
            {step === 8 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Ziele & Erwartungen</h3>
                <div className="space-y-1.5">
                  <Label>Hauptziel</Label>
                  <Select value={form.primaryGoal} onValueChange={v => update("primaryGoal", v)}>
                    <SelectTrigger><SelectValue placeholder="Was ist das Hauptziel?" /></SelectTrigger>
                    <SelectContent>{["Mehr qualifizierte Leads", "Umsatz steigern", "Marge verbessern", "Markenbekanntheit aufbauen", "Recruiting / Employer Branding", "Thought Leadership", "Kosten senken"].map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <NumField label="Ziel-Leads / Monat" fieldKey="goalLeadsMonthly" placeholder="50" formData={form} unknowns={unknowns} update={update} toggleUnknown={toggleUnknown} />
                  <NumField label="Ziel-Umsatz / Monat" fieldKey="goalRevenueMonthly" placeholder="25000" unit="€" formData={form} unknowns={unknowns} update={update} toggleUnknown={toggleUnknown} />
                </div>
                <div className="space-y-1.5">
                  <Label>Zeitrahmen</Label>
                  <Select value={form.goalTimeframe} onValueChange={v => update("goalTimeframe", v)}>
                    <SelectTrigger><SelectValue placeholder="In welchem Zeitraum?" /></SelectTrigger>
                    <SelectContent>{["1 Monat", "3 Monate", "6 Monate", "12 Monate"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Step 9: ICP-Analyse */}
            {step === 9 && (
              <ICPAnalysisStep
                clients={icpClients}
                setClients={setIcpClients}
                showResults={icpShowResults}
                setShowResults={setIcpShowResults}
              />
            )}

            {/* Step 10: 3-Monats-Historie */}
            {step === 10 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">3-Monats-Historie</h3>
                <p className="text-sm text-muted-foreground">Trage die Werte der letzten 3 Monate ein – so können wir Trends berechnen. Leere Felder = 0.</p>

                {history.map((month, idx) => (
                  <div key={idx} className="p-4 rounded-lg border border-border/60 bg-muted/20 space-y-3">
                    <p className="text-sm font-semibold text-primary">{month.label}</p>

                    <p className="text-xs font-semibold text-muted-foreground uppercase">Leads</p>
                    <div className="grid grid-cols-2 gap-2">
                      {([["Leads gesamt", "leadsTotal"], ["Qualifizierte Leads", "leadsQualified"]] as const).map(([l, k]) => (
                        <div key={k} className="space-y-1">
                          <Label className="text-[11px]">{l}</Label>
                          <Input type="number" value={(month as any)[k]} onChange={e => updateHistory(idx, k, e.target.value)} placeholder="0" className="h-8 text-sm" />
                        </div>
                      ))}
                    </div>

                    <p className="text-xs font-semibold text-muted-foreground uppercase">Marketing</p>
                    <div className="grid grid-cols-4 gap-2">
                      {([["Impressions", "impressions"], ["Likes", "likes"], ["Kommentare", "comments"], ["Neue Follower", "newFollowers"]] as const).map(([l, k]) => (
                        <div key={k} className="space-y-1">
                          <Label className="text-[11px]">{l}</Label>
                          <Input type="number" value={(month as any)[k]} onChange={e => updateHistory(idx, k, e.target.value)} placeholder="0" className="h-8 text-sm" />
                        </div>
                      ))}
                    </div>

                    <p className="text-xs font-semibold text-muted-foreground uppercase">Sales & Outbound</p>
                    <div className="grid grid-cols-4 gap-2">
                      {([["Anwahlen", "callsMade"], ["Erreicht", "callsReached"], ["Interesse", "callsInterested"],
                        ["Termine", "appointments"], ["Settings gepl.", "settingsPlanned"], ["Settings gehalten", "settingsHeld"],
                        ["Closings gepl.", "closingsPlanned"], ["Closings gehalten", "closingsHeld"], ["Abschlüsse", "closings"], ["Deals", "deals"]] as const).map(([l, k]) => (
                        <div key={k} className="space-y-1">
                          <Label className="text-[11px]">{l}</Label>
                          <Input type="number" value={(month as any)[k]} onChange={e => updateHistory(idx, k, e.target.value)} placeholder="0" className="h-8 text-sm" />
                        </div>
                      ))}
                    </div>

                    <p className="text-xs font-semibold text-muted-foreground uppercase">Finanzen</p>
                    <div className="grid grid-cols-2 gap-2">
                      {([["Umsatz (€)", "revenue"], ["Deal-Volumen (€)", "dealVolume"]] as const).map(([l, k]) => (
                        <div key={k} className="space-y-1">
                          <Label className="text-[11px]">{l}</Label>
                          <Input type="number" value={(month as any)[k]} onChange={e => updateHistory(idx, k, e.target.value)} placeholder="0" className="h-8 text-sm" />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between pt-2">
              <Button variant="outline" onClick={() => setStep(s => s - 1)} disabled={step === 0 || loading}>
                <ChevronLeft className="mr-1 h-4 w-4" /> Zurück
              </Button>
              <Button onClick={handleNext} disabled={loading || !canNext()}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {step === 0 && !tenantId ? (
                  <><Mail className="mr-1 h-4 w-4" /> Account anlegen & Einladung senden</>
                ) : step === STEPS.length - 1 ? (
                  <><Sparkles className="mr-1 h-4 w-4" /> Onboarding abschließen</>
                ) : (
                  <>Weiter <ChevronRight className="ml-1 h-4 w-4" /></>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
