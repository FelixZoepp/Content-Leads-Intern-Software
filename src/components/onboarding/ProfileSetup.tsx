import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  Loader2, Building2, Linkedin, BarChart3, Target, ChevronRight, ChevronLeft,
  Sparkles, DollarSign, ShoppingBag, HelpCircle, Users, TrendingUp, UserSearch
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import ICPAnalysisStep, { emptyICPClient, type ICPClient } from "@/components/admin/ICPAnalysisStep";

interface ProfileSetupProps {
  onComplete: () => void;
}

const STEPS = [
  { icon: Building2, label: "Firma" },
  { icon: Linkedin, label: "LinkedIn" },
  { icon: ShoppingBag, label: "Angebot" },
  { icon: DollarSign, label: "Finanzen" },
  { icon: Users, label: "Kunden" },
  { icon: UserSearch, label: "ICP" },
  { icon: TrendingUp, label: "Vertrieb" },
  { icon: BarChart3, label: "KPIs" },
  { icon: Target, label: "Ziele" },
];

export default function ProfileSetup({ onComplete }: ProfileSetupProps) {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [generatingAnalysis, setGeneratingAnalysis] = useState(false);
  const [unknowns, setUnknowns] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState({
    // Step 0: Firma
    companyName: "",
    contactName: "",
    industry: "",
    teamSize: "",
    targetAudience: "",
    websiteUrl: "",
    // Step 1: LinkedIn
    linkedinUrl: "",
    linkedinFollowersCurrent: "",
    postingFrequency: "",
    linkedinExperience: "",
    // Step 2: Angebot
    currentOffer: "",
    offerPrice: "",
    contractDuration: "",
    closingRate: "",
    // Step 3: Finanzen (alle Netto)
    revenueRecurring: "",      // MRR Netto
    revenueOnetime: "",        // Einmalzahlungen Netto
    adsSpendMonthly: "",
    toolsCostsMonthly: "",
    personnelCostsMonthly: "",
    deliveryCostsMonthly: "",
    otherCostsMonthly: "",
    // Step 4: Kunden
    totalCustomers: "",
    existingCustomers: "",
    newCustomersMonthly: "",
    aovNewCustomer: "",         // AOV Neukunde → newCustomerVolume wird auto-berechnet
    aovExistingCustomer: "",    // AOV Bestandskunde → existingCustomerVolume wird auto-berechnet
    paymentDefaultRate: "",
    // LTV wird auto-berechnet: AOV × Laufzeit-Monate
    contractDurationMonths: "",  // für LTV-Berechnung
    // Step 5: Vertrieb & Kosten
    commissionRateActual: "",
    commissionRateTarget: "",
    salesGrossSalary: "",
    salesSideCosts: "",
    fulfillmentGrossSalary: "",
    fulfillmentToolCosts: "",
    // CAC wird auto-berechnet: Gesamtkosten / Neukunden
    cacTarget: "",
    costPerCustomerFulfillment: "",
    // Step 6: KPIs
    currentLeadsPerMonth: "",
    currentConversionRate: "",
    monthlyBudget: "",
    costPerLead: "",
    costPerAppointment: "",
    // Step 7: Ziele
    goalLeadsMonthly: "",
    goalRevenueMonthly: "",
    goalTimeframe: "",
    primaryGoal: "",
  });
  const { toast } = useToast();
  const { refreshTenant } = useAuth();

  const update = (key: string, value: string) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  const toggleUnknown = (key: string) => {
    setUnknowns((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
        setFormData((p) => ({ ...p, [key]: "" }));
      }
      return next;
    });
  };

  // ── Auto-berechnete Werte ──────────────────────────────────────────────────

  const totalRevenue = useMemo(() => {
    const rec = parseFloat(formData.revenueRecurring) || 0;
    const one = parseFloat(formData.revenueOnetime) || 0;
    return rec + one;
  }, [formData.revenueRecurring, formData.revenueOnetime]);

  const totalCosts = useMemo(() => {
    const ads = parseFloat(formData.adsSpendMonthly) || 0;
    const tools = parseFloat(formData.toolsCostsMonthly) || 0;
    const personnel = parseFloat(formData.personnelCostsMonthly) || 0;
    const delivery = parseFloat(formData.deliveryCostsMonthly) || 0;
    const other = parseFloat(formData.otherCostsMonthly) || 0;
    return ads + tools + personnel + delivery + other;
  }, [formData.adsSpendMonthly, formData.toolsCostsMonthly, formData.personnelCostsMonthly, formData.deliveryCostsMonthly, formData.otherCostsMonthly]);

  const profit = totalRevenue - totalCosts;
  const marginPercent = totalRevenue > 0 ? ((profit / totalRevenue) * 100) : 0;

  // AOV Neukunde: auto aus Angebotspreis (Step 2), überschreibbar
  const aovNewAuto = useMemo(() => {
    const manual = parseFloat(formData.aovNewCustomer);
    if (!isNaN(manual) && formData.aovNewCustomer !== "") return manual;
    return parseFloat(formData.offerPrice) || 0;
  }, [formData.aovNewCustomer, formData.offerPrice]);

  // AOV Bestandskunde: auto aus MRR ÷ Bestandskunden, überschreibbar
  const aovExistingAuto = useMemo(() => {
    const manual = parseFloat(formData.aovExistingCustomer);
    if (!isNaN(manual) && formData.aovExistingCustomer !== "") return manual;
    const mrr = parseFloat(formData.revenueRecurring) || 0;
    const existing = parseFloat(formData.existingCustomers) || 0;
    return mrr > 0 && existing > 0 ? Math.round(mrr / existing) : 0;
  }, [formData.aovExistingCustomer, formData.revenueRecurring, formData.existingCustomers]);

  // Auftragsvolumen = AOV × Kundenanzahl
  const newCustomerVolume = useMemo(() => {
    const count = parseFloat(formData.newCustomersMonthly) || 0;
    return aovNewAuto > 0 && count > 0 ? aovNewAuto * count : 0;
  }, [aovNewAuto, formData.newCustomersMonthly]);

  const existingCustomerVolume = useMemo(() => {
    const count = parseFloat(formData.existingCustomers) || 0;
    return aovExistingAuto > 0 && count > 0 ? aovExistingAuto * count : 0;
  }, [aovExistingAuto, formData.existingCustomers]);

  const totalOrderVolume = newCustomerVolume + existingCustomerVolume;

  // LTV = AOV Neukunde (auto) × Laufzeit in Monaten
  const ltvCalculated = useMemo(() => {
    const months = parseFloat(formData.contractDurationMonths) || 0;
    return aovNewAuto > 0 && months > 0 ? aovNewAuto * months : 0;
  }, [aovNewAuto, formData.contractDurationMonths]);

  // CAC = Gesamtkosten / Neukunden pro Monat
  const cacCalculated = useMemo(() => {
    const costs = totalCosts;
    const sales = parseFloat(formData.salesGrossSalary) || 0;
    const salesSide = parseFloat(formData.salesSideCosts) || 0;
    const fulfillment = parseFloat(formData.fulfillmentGrossSalary) || 0;
    const fulfTools = parseFloat(formData.fulfillmentToolCosts) || 0;
    const allCosts = costs + sales + salesSide + fulfillment + fulfTools;
    const newCusts = parseFloat(formData.newCustomersMonthly) || 0;
    return allCosts > 0 && newCusts > 0 ? Math.round(allCosts / newCusts) : 0;
  }, [totalCosts, formData.salesGrossSalary, formData.salesSideCosts, formData.fulfillmentGrossSalary, formData.fulfillmentToolCosts, formData.newCustomersMonthly]);

  const canNext = () => {
    if (step === 0) return formData.companyName.trim().length > 0;
    return true;
  };

  const val = (key: string) => unknowns.has(key) ? null : (parseFloat((formData as any)[key]) || 0);
  const valInt = (key: string) => unknowns.has(key) ? null : (parseInt((formData as any)[key]) || 0);
  const valNullable = (key: string) => {
    if (unknowns.has(key)) return null;
    const v = parseFloat((formData as any)[key]);
    return isNaN(v) ? null : v;
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) throw new Error("Nicht authentifiziert – bitte neu einloggen");

      const { data: existingTenants } = await supabase
        .from("tenants")
        .select("id")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1);

      const existingTenant = existingTenants?.[0] ?? null;

      const tenantPayload = {
        company_name: formData.companyName,
        contact_name: formData.contactName || null,
        industry: formData.industry || null,
        team_size: formData.teamSize || null,
        target_audience: formData.targetAudience || null,
        website_url: formData.websiteUrl || null,
        monthly_budget: val("monthlyBudget"),
        linkedin_url: formData.linkedinUrl || null,
        linkedin_followers_current: valInt("linkedinFollowersCurrent"),
        posting_frequency: formData.postingFrequency || null,
        linkedin_experience: formData.linkedinExperience || null,
        current_offer: formData.currentOffer || null,
        offer_price: val("offerPrice"),
        contract_duration: formData.contractDuration || null,
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
        goal_timeframe: formData.goalTimeframe || null,
        primary_goal: formData.primaryGoal || null,
        onboarding_completed: true,
      } as any;

      let data: any;

      if (existingTenant) {
        // UPDATE – alle Felder mit den neuen Formulardaten überschreiben
        const { data: updated, error } = await supabase
          .from("tenants")
          .update(tenantPayload)
          .eq("id", existingTenant.id)
          .select()
          .single();
        if (error) throw error;
        data = updated;
      } else {
        // INSERT neuer Tenant
        const { data: inserted, error } = await supabase
          .from("tenants")
          .insert({ user_id: user.id, ...tenantPayload })
          .select()
          .single();
        if (error) throw error;
        data = inserted;
      }

      await refreshTenant();

      setGeneratingAnalysis(true);
      try {
        await supabase.functions.invoke("generate-summary", {
          body: { tenantId: data.id, scope: "onboarding_initial" },
        });
      } catch { /* non-blocking */ }
      setGeneratingAnalysis(false);

      toast({ title: "Profil gespeichert ✓", description: "Deine Basisdaten wurden gespeichert." });
      setTimeout(() => onComplete(), 500);
    } catch (error: any) {
      toast({ title: "Fehler", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
      setGeneratingAnalysis(false);
    }
  };

  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="space-y-6">
      {/* Step indicator */}
      <div className="space-y-3">
        <div className="flex justify-between flex-wrap gap-1">
          {STEPS.map((s, i) => (
            <button
              key={i}
              onClick={() => i < step && setStep(i)}
              className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
                i === step ? "text-primary" : i < step ? "text-primary/60 cursor-pointer hover:text-primary" : "text-muted-foreground"
              }`}
            >
              <div className={`flex items-center justify-center h-6 w-6 rounded-full text-[10px] font-bold ${
                i <= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}>{i + 1}</div>
              <span className="hidden sm:inline">{s.label}</span>
            </button>
          ))}
        </div>
        <Progress value={progress} className="h-1.5" />
      </div>

      {/* Step 0: Firma */}
      {step === 0 && (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Firmenprofil</h3>
          <div className="space-y-1.5">
            <Label className="text-sm">Firmenname *</Label>
            <Input value={formData.companyName} onChange={(e) => update("companyName", e.target.value)} placeholder="ContentLeads GmbH" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm">Ansprechpartner</Label>
            <Input value={formData.contactName} onChange={(e) => update("contactName", e.target.value)} placeholder="Max Mustermann" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm">Branche</Label>
            <Select value={formData.industry} onValueChange={(v) => update("industry", v)}>
              <SelectTrigger><SelectValue placeholder="Branche wählen" /></SelectTrigger>
              <SelectContent>
                {["SaaS / Software", "Agentur / Beratung", "E-Commerce", "Finanzdienstleistung", "Immobilien", "Coaching / Training", "Gesundheit / Medizin", "Handwerk / Industrie", "Sonstige"].map((b) => (
                  <SelectItem key={b} value={b}>{b}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm">Teamgröße</Label>
              <Select value={formData.teamSize} onValueChange={(v) => update("teamSize", v)}>
                <SelectTrigger><SelectValue placeholder="Wählen" /></SelectTrigger>
                <SelectContent>
                  {["1-5", "6-20", "21-50", "51-200", "200+"].map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Website</Label>
              <Input type="url" value={formData.websiteUrl} onChange={(e) => update("websiteUrl", e.target.value)} placeholder="https://..." />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm">Zielgruppe</Label>
            <Textarea value={formData.targetAudience} onChange={(e) => update("targetAudience", e.target.value)} placeholder="z.B. B2B-Entscheider, CEOs/CMOs von KMUs in DACH..." rows={2} />
          </div>
        </div>
      )}

      {/* Step 1: LinkedIn */}
      {step === 1 && (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">LinkedIn-Status</h3>
          <div className="space-y-1.5">
            <Label className="text-sm">LinkedIn-Profil-URL</Label>
            <Input type="url" value={formData.linkedinUrl} onChange={(e) => update("linkedinUrl", e.target.value)} placeholder="https://linkedin.com/in/..." />
          </div>
          <NumField label="Aktuelle Follower" fieldKey="linkedinFollowersCurrent" placeholder="500" formData={formData} unknowns={unknowns} update={update} toggleUnknown={toggleUnknown} />
          <div className="space-y-1.5">
            <Label className="text-sm">Posting-Frequenz</Label>
            <Select value={formData.postingFrequency} onValueChange={(v) => update("postingFrequency", v)}>
              <SelectTrigger><SelectValue placeholder="Wie oft?" /></SelectTrigger>
              <SelectContent>
                {["Noch nie", "Sporadisch (< 1x/Woche)", "1-2x pro Woche", "3-5x pro Woche", "Täglich"].map((f) => (
                  <SelectItem key={f} value={f}>{f}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm">LinkedIn-Erfahrung</Label>
            <Select value={formData.linkedinExperience} onValueChange={(v) => update("linkedinExperience", v)}>
              <SelectTrigger><SelectValue placeholder="Erfahrungslevel" /></SelectTrigger>
              <SelectContent>
                {["Keine Erfahrung", "Grundkenntnisse", "Fortgeschritten", "Profi – nutze LinkedIn aktiv für Sales"].map((e) => (
                  <SelectItem key={e} value={e}>{e}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Step 2: Angebot */}
      {step === 2 && (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Aktuelles Angebot</h3>
          <div className="space-y-1.5">
            <Label className="text-sm">Was verkaufst du? (Offer)</Label>
            <Textarea value={formData.currentOffer} onChange={(e) => update("currentOffer", e.target.value)} placeholder="z.B. LinkedIn-Marketing-Paket inkl. Content, Lead-Gen, Ads..." rows={3} />
          </div>
          <NumField label="Angebotspreis (Netto)" fieldKey="offerPrice" placeholder="3000" unit="€ netto" formData={formData} unknowns={unknowns} update={update} toggleUnknown={toggleUnknown} />
          <div className="space-y-1.5">
            <Label className="text-sm">Vertragslaufzeit</Label>
            <Select value={formData.contractDuration} onValueChange={(v) => update("contractDuration", v)}>
              <SelectTrigger><SelectValue placeholder="Laufzeit wählen" /></SelectTrigger>
              <SelectContent>
                {["Einmalig / Projekt", "1 Monat", "3 Monate", "6 Monate", "12 Monate", "24 Monate"].map((d) => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <NumField label="Closing-Rate" fieldKey="closingRate" placeholder="25" unit="%" formData={formData} unknowns={unknowns} update={update} toggleUnknown={toggleUnknown} />
        </div>
      )}

      {/* Step 3: Finanzen – nur Netto */}
      {step === 3 && (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Monatliche Finanzen <span className="text-primary font-normal normal-case">(alle Angaben Netto)</span></h3>

          <div className="p-3 rounded-lg border border-border/60 bg-muted/30 space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">💰 Einnahmen (Netto)</p>
            <div className="grid grid-cols-2 gap-3">
              <NumField label="Wiederkehrend (MRR)" fieldKey="revenueRecurring" placeholder="10000" unit="€ netto/Mo." formData={formData} unknowns={unknowns} update={update} toggleUnknown={toggleUnknown} />
              <NumField label="Einmalig (Projekte)" fieldKey="revenueOnetime" placeholder="5000" unit="€ netto/Mo." formData={formData} unknowns={unknowns} update={update} toggleUnknown={toggleUnknown} />
            </div>
            {totalRevenue > 0 && (
              <div className="flex justify-between text-sm font-medium pt-1 border-t border-border/40">
                <span>Gesamt-Einnahmen (Netto)</span>
                <span className="text-primary">{totalRevenue.toLocaleString("de-DE")} €</span>
              </div>
            )}
          </div>

          <div className="p-3 rounded-lg border border-border/60 bg-muted/30 space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">📤 Ausgaben (Netto)</p>
            <div className="grid grid-cols-2 gap-3">
              <NumField label="Ads / Werbung" fieldKey="adsSpendMonthly" placeholder="2000" unit="€" formData={formData} unknowns={unknowns} update={update} toggleUnknown={toggleUnknown} />
              <NumField label="Tools & Software" fieldKey="toolsCostsMonthly" placeholder="500" unit="€" formData={formData} unknowns={unknowns} update={update} toggleUnknown={toggleUnknown} />
              <NumField label="Personal (gesamt)" fieldKey="personnelCostsMonthly" placeholder="3000" unit="€" formData={formData} unknowns={unknowns} update={update} toggleUnknown={toggleUnknown} />
              <NumField label="Delivery / Fulfillment" fieldKey="deliveryCostsMonthly" placeholder="1000" unit="€" formData={formData} unknowns={unknowns} update={update} toggleUnknown={toggleUnknown} />
              <NumField label="Sonstige Kosten" fieldKey="otherCostsMonthly" placeholder="500" unit="€" formData={formData} unknowns={unknowns} update={update} toggleUnknown={toggleUnknown} />
            </div>
            {totalCosts > 0 && (
              <div className="flex justify-between text-sm font-medium pt-1 border-t border-border/40">
                <span>Gesamt-Ausgaben</span>
                <span className="text-destructive">{totalCosts.toLocaleString("de-DE")} €</span>
              </div>
            )}
          </div>

          {totalRevenue > 0 && (
            <div className="p-3 rounded-lg border-2 border-primary/20 bg-primary/5 space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">📊 Automatisch berechnet</p>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xs text-muted-foreground">Gewinn / Verlust</p>
                  <p className={`text-lg font-bold ${profit >= 0 ? "text-green-600 dark:text-green-400" : "text-destructive"}`}>
                    {profit >= 0 ? "+" : ""}{profit.toLocaleString("de-DE")} €
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Netto-Marge</p>
                  <p className={`text-lg font-bold ${marginPercent >= 30 ? "text-green-600 dark:text-green-400" : marginPercent >= 10 ? "text-yellow-600 dark:text-yellow-400" : "text-destructive"}`}>
                    {marginPercent.toFixed(1)}%
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Kostenquote</p>
                  <p className="text-lg font-bold text-foreground">
                    {totalRevenue > 0 ? ((totalCosts / totalRevenue) * 100).toFixed(1) : "0"}%
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 4: Kunden – AOV-basiert, LTV auto-berechnet */}
      {step === 4 && (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Kundenstamm & Volumen</h3>
          <p className="text-sm text-muted-foreground">Auftragsvolumen und LTV werden automatisch berechnet.</p>

          <div className="p-3 rounded-lg border border-border/60 bg-muted/30 space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">👥 Kundenanzahl</p>
            <div className="grid grid-cols-3 gap-3">
              <NumField label="Gesamtkunden" fieldKey="totalCustomers" placeholder="6" formData={formData} unknowns={unknowns} update={update} toggleUnknown={toggleUnknown} />
              <NumField label="Bestandskunden" fieldKey="existingCustomers" placeholder="4" formData={formData} unknowns={unknowns} update={update} toggleUnknown={toggleUnknown} />
              <NumField label="Neukunden / Monat" fieldKey="newCustomersMonthly" placeholder="2" formData={formData} unknowns={unknowns} update={update} toggleUnknown={toggleUnknown} />
            </div>
          </div>

          <div className="p-3 rounded-lg border border-border/60 bg-muted/30 space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">💶 Ø-Auftragswert (AOV, Netto)</p>
            <p className="text-xs text-muted-foreground">Wird automatisch aus Angebotspreis & MRR berechnet – optional überschreibbar.</p>

            {/* AOV Neukunde: auto aus offerPrice */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">
                  AOV Neukunde <span className="text-muted-foreground font-normal text-xs">(€ netto)</span>
                </label>
                {!formData.aovNewCustomer && aovNewAuto > 0 && (
                  <span className="text-[11px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                    Auto: {aovNewAuto.toLocaleString("de-DE")} € (= Angebotspreis)
                  </span>
                )}
              </div>
              <input
                type="number"
                step="any"
                value={formData.aovNewCustomer}
                onChange={e => update("aovNewCustomer", e.target.value)}
                placeholder={aovNewAuto > 0 ? String(aovNewAuto) : "3000"}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
              {!formData.aovNewCustomer && aovNewAuto > 0 && (
                <p className="text-[10px] text-muted-foreground">Aus Schritt 2 (Angebotspreis). Hier überschreiben falls abweichend.</p>
              )}
            </div>

            {/* AOV Bestandskunde: auto aus MRR ÷ Bestandskunden */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">
                  AOV Bestandskunde / Mo. <span className="text-muted-foreground font-normal text-xs">(€ netto)</span>
                </label>
                {!formData.aovExistingCustomer && aovExistingAuto > 0 && (
                  <span className="text-[11px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                    Auto: {aovExistingAuto.toLocaleString("de-DE")} € (MRR ÷ Kunden)
                  </span>
                )}
              </div>
              <input
                type="number"
                step="any"
                value={formData.aovExistingCustomer}
                onChange={e => update("aovExistingCustomer", e.target.value)}
                placeholder={aovExistingAuto > 0 ? String(aovExistingAuto) : "833"}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
              {!formData.aovExistingCustomer && aovExistingAuto > 0 && (
                <p className="text-[10px] text-muted-foreground">Aus MRR ({formData.revenueRecurring}€) ÷ Bestandskunden ({formData.existingCustomers}). Hier überschreiben falls abweichend.</p>
              )}
            </div>

            {(newCustomerVolume > 0 || existingCustomerVolume > 0) && (
              <div className="pt-1 border-t border-border/40 space-y-1">
                {newCustomerVolume > 0 && (
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Neukundenvolumen ({formData.newCustomersMonthly || "?"} × {aovNewAuto}€)</span>
                    <span className="font-medium text-foreground">{newCustomerVolume.toLocaleString("de-DE")} €</span>
                  </div>
                )}
                {existingCustomerVolume > 0 && (
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Bestandskundenvolumen ({formData.existingCustomers || "?"} × {aovExistingAuto}€)</span>
                    <span className="font-medium text-foreground">{existingCustomerVolume.toLocaleString("de-DE")} €</span>
                  </div>
                )}
                {totalOrderVolume > 0 && (
                  <div className="flex justify-between text-sm font-semibold pt-1 border-t border-border/40">
                    <span>Auftragsvolumen gesamt</span>
                    <span className="text-primary">{totalOrderVolume.toLocaleString("de-DE")} €</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="p-3 rounded-lg border border-border/60 bg-muted/30 space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">📈 LTV-Berechnung</p>
            <p className="text-xs text-muted-foreground">LTV = AOV Neukunde × Ø Vertragslaufzeit in Monaten</p>
            <NumField label="Ø Vertragslaufzeit" fieldKey="contractDurationMonths" placeholder="3" unit="Monate" formData={formData} unknowns={unknowns} update={update} toggleUnknown={toggleUnknown} />
            {ltvCalculated > 0 && (
              <div className="flex justify-between text-sm font-semibold pt-1 border-t border-border/40">
                <span>LTV (automatisch)</span>
                <span className="text-primary">{ltvCalculated.toLocaleString("de-DE")} € / Kunde</span>
              </div>
            )}
          </div>

          <NumField label="Zahlungsausfallquote" fieldKey="paymentDefaultRate" placeholder="10" unit="%" formData={formData} unknowns={unknowns} update={update} toggleUnknown={toggleUnknown} />
        </div>
      )}

      {/* Step 5: Vertrieb & Kosten – CAC auto-berechnet */}
      {step === 5 && (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Vertrieb & Personalkosten</h3>

          <div className="p-3 rounded-lg border border-border/60 bg-muted/30 space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">💰 Provisionen</p>
            <div className="grid grid-cols-2 gap-3">
              <NumField label="Provisionssatz IST" fieldKey="commissionRateActual" placeholder="0" unit="%" formData={formData} unknowns={unknowns} update={update} toggleUnknown={toggleUnknown} />
              <NumField label="Provisionssatz SOLL" fieldKey="commissionRateTarget" placeholder="17.5" unit="%" formData={formData} unknowns={unknowns} update={update} toggleUnknown={toggleUnknown} />
            </div>
          </div>

          <div className="p-3 rounded-lg border border-border/60 bg-muted/30 space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">🏢 Personalkosten (Brutto, Netto für dich als Arbeitgeber)</p>
            <div className="grid grid-cols-2 gap-3">
              <NumField label="Bruttogehalt Vertrieb" fieldKey="salesGrossSalary" placeholder="1175" unit="€" formData={formData} unknowns={unknowns} update={update} toggleUnknown={toggleUnknown} />
              <NumField label="Nebenkosten Vertrieb" fieldKey="salesSideCosts" placeholder="130" unit="€" formData={formData} unknowns={unknowns} update={update} toggleUnknown={toggleUnknown} />
              <NumField label="Bruttogehalt Fulfillment" fieldKey="fulfillmentGrossSalary" placeholder="1175" unit="€" formData={formData} unknowns={unknowns} update={update} toggleUnknown={toggleUnknown} />
              <NumField label="Tools Fulfillment" fieldKey="fulfillmentToolCosts" placeholder="1537" unit="€" formData={formData} unknowns={unknowns} update={update} toggleUnknown={toggleUnknown} />
            </div>
          </div>

          <div className="p-3 rounded-lg border-2 border-primary/20 bg-primary/5 space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">🎯 Customer Acquisition Cost (CAC)</p>
            <p className="text-xs text-muted-foreground">CAC wird automatisch berechnet: Gesamtkosten ÷ Neukunden / Monat</p>
            {cacCalculated > 0 && (
              <div className="flex justify-between text-sm font-semibold">
                <span>CAC IST (automatisch)</span>
                <span className="text-primary">{cacCalculated.toLocaleString("de-DE")} € / Neukunde</span>
              </div>
            )}
            <NumField label="CAC SOLL (Zielwert)" fieldKey="cacTarget" placeholder="1680" unit="€" formData={formData} unknowns={unknowns} update={update} toggleUnknown={toggleUnknown} />
            <NumField label="Kosten / Kunde (Fulfillment)" fieldKey="costPerCustomerFulfillment" placeholder="550" unit="€" formData={formData} unknowns={unknowns} update={update} toggleUnknown={toggleUnknown} />
          </div>
        </div>
      )}

      {/* Step 6: KPIs */}
      {step === 6 && (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Aktuelle Kennzahlen</h3>
          <p className="text-sm text-muted-foreground">Schätzwerte reichen – oder klicke „Weiß ich nicht".</p>

          <div className="p-3 rounded-lg border border-border/60 bg-muted/30 space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">📈 Performance</p>
            <div className="grid grid-cols-2 gap-3">
              <NumField label="Leads / Monat" fieldKey="currentLeadsPerMonth" placeholder="20" formData={formData} unknowns={unknowns} update={update} toggleUnknown={toggleUnknown} />
              <NumField label="Conversion-Rate (Lead→Kunde)" fieldKey="currentConversionRate" placeholder="2.5" unit="%" formData={formData} unknowns={unknowns} update={update} toggleUnknown={toggleUnknown} />
              <NumField label="Marketingbudget / Monat" fieldKey="monthlyBudget" placeholder="5000" unit="€" formData={formData} unknowns={unknowns} update={update} toggleUnknown={toggleUnknown} />
            </div>
          </div>

          <div className="p-3 rounded-lg border border-border/60 bg-muted/30 space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">💲 Stückkosten</p>
            <div className="grid grid-cols-2 gap-3">
              <NumField label="Kosten / Lead" fieldKey="costPerLead" placeholder="50" unit="€" formData={formData} unknowns={unknowns} update={update} toggleUnknown={toggleUnknown} />
              <NumField label="Kosten / Termin" fieldKey="costPerAppointment" placeholder="150" unit="€" formData={formData} unknowns={unknowns} update={update} toggleUnknown={toggleUnknown} />
            </div>
          </div>
        </div>
      )}

      {/* Step 7: Ziele */}
      {step === 7 && (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Ziele & Erwartungen</h3>
          <div className="space-y-1.5">
            <Label className="text-sm">Hauptziel</Label>
            <Select value={formData.primaryGoal} onValueChange={(v) => update("primaryGoal", v)}>
              <SelectTrigger><SelectValue placeholder="Was ist dein Hauptziel?" /></SelectTrigger>
              <SelectContent>
                {["Mehr qualifizierte Leads", "Umsatz steigern", "Marge verbessern", "Markenbekanntheit aufbauen", "Recruiting / Employer Branding", "Thought Leadership", "Kosten senken"].map((g) => (
                  <SelectItem key={g} value={g}>{g}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <NumField label="Ziel-Leads / Monat" fieldKey="goalLeadsMonthly" placeholder="50" formData={formData} unknowns={unknowns} update={update} toggleUnknown={toggleUnknown} />
            <NumField label="Ziel-Umsatz / Monat (Netto)" fieldKey="goalRevenueMonthly" placeholder="25000" unit="€ netto" formData={formData} unknowns={unknowns} update={update} toggleUnknown={toggleUnknown} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm">Zeitrahmen</Label>
            <Select value={formData.goalTimeframe} onValueChange={(v) => update("goalTimeframe", v)}>
              <SelectTrigger><SelectValue placeholder="In welchem Zeitraum?" /></SelectTrigger>
              <SelectContent>
                {["1 Monat", "3 Monate", "6 Monate", "12 Monate"].map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-2">
        <Button type="button" variant="outline" onClick={() => setStep((s) => s - 1)} disabled={step === 0 || loading}>
          <ChevronLeft className="mr-1 h-4 w-4" /> Zurück
        </Button>
        {step < STEPS.length - 1 ? (
          <Button type="button" onClick={() => setStep((s) => s + 1)} disabled={!canNext()}>
            Weiter <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={loading || !canNext()}>
            {loading && !generatingAnalysis && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {generatingAnalysis && <Sparkles className="mr-2 h-4 w-4 animate-pulse" />}
            {generatingAnalysis ? "Erstanalyse läuft..." : "Profil erstellen & Analyse starten"}
          </Button>
        )}
      </div>
    </div>
  );
}

// Standalone NumField to prevent focus loss on re-render
function NumField({
  label, fieldKey, placeholder, unit, formData, unknowns, update, toggleUnknown
}: {
  label: string;
  fieldKey: string;
  placeholder: string;
  unit?: string;
  formData: Record<string, string>;
  unknowns: Set<string>;
  update: (key: string, value: string) => void;
  toggleUnknown: (key: string) => void;
}) {
  const isUnknown = unknowns.has(fieldKey);
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label className="text-sm">
          {label}
          {unit && <span className="text-muted-foreground ml-1 font-normal text-xs">({unit})</span>}
        </Label>
        <button
          type="button"
          onClick={() => toggleUnknown(fieldKey)}
          className={`flex items-center gap-1 text-[11px] rounded-full px-2 py-0.5 transition-colors ${
            isUnknown
              ? "bg-primary/10 text-primary font-medium"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          <HelpCircle className="h-3 w-3" />
          Weiß ich nicht
        </button>
      </div>
      <Input
        type="number"
        step="any"
        value={isUnknown ? "" : formData[fieldKey]}
        onChange={(e) => update(fieldKey, e.target.value)}
        placeholder={isUnknown ? "– wird übersprungen –" : placeholder}
        disabled={isUnknown}
        className={isUnknown ? "bg-muted/50 text-muted-foreground" : ""}
      />
    </div>
  );
}
