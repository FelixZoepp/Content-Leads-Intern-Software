import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, Building2, Linkedin, BarChart3, Target, ChevronRight, ChevronLeft, Sparkles, DollarSign, ShoppingBag, HelpCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface ProfileSetupProps {
  onComplete: () => void;
}

const STEPS = [
  { icon: Building2, label: "Firma" },
  { icon: Linkedin, label: "LinkedIn" },
  { icon: ShoppingBag, label: "Angebot" },
  { icon: DollarSign, label: "Finanzen" },
  { icon: BarChart3, label: "KPIs" },
  { icon: Target, label: "Ziele" },
];

export default function ProfileSetup({ onComplete }: ProfileSetupProps) {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [generatingAnalysis, setGeneratingAnalysis] = useState(false);
  const [unknowns, setUnknowns] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState({
    companyName: "",
    contactName: "",
    industry: "",
    teamSize: "",
    targetAudience: "",
    websiteUrl: "",
    linkedinUrl: "",
    linkedinFollowersCurrent: "",
    postingFrequency: "",
    linkedinExperience: "",
    currentOffer: "",
    offerPrice: "",
    contractDuration: "",
    closingRate: "",
    revenueRecurring: "",
    revenueOnetime: "",
    currentRevenueMonthly: "",
    adsSpendMonthly: "",
    toolsCostsMonthly: "",
    personnelCostsMonthly: "",
    deliveryCostsMonthly: "",
    otherCostsMonthly: "",
    costPerLead: "",
    costPerAppointment: "",
    costPerCustomer: "",
    currentLeadsPerMonth: "",
    currentConversionRate: "",
    goalLeadsMonthly: "",
    goalRevenueMonthly: "",
    goalTimeframe: "",
    primaryGoal: "",
    monthlyBudget: "",
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

  // Auto-calculated values
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

  const canNext = () => {
    if (step === 0) return formData.companyName.trim().length > 0;
    return true;
  };

  const val = (key: string) => unknowns.has(key) ? null : (parseFloat((formData as any)[key]) || 0);
  const valInt = (key: string) => unknowns.has(key) ? null : (parseInt((formData as any)[key]) || 0);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) throw new Error("Nicht authentifiziert – bitte neu einloggen");

      const { data: existingTenant } = await supabase
        .from("tenants")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (existingTenant) {
        await refreshTenant();
        onComplete();
        return;
      }

      const { data, error } = await supabase
        .from("tenants")
        .insert({
          user_id: user.id,
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
          current_revenue_monthly: val("currentRevenueMonthly"),
          ads_spend_monthly: val("adsSpendMonthly"),
          tools_costs_monthly: val("toolsCostsMonthly"),
          personnel_costs_monthly: val("personnelCostsMonthly"),
          delivery_costs_monthly: val("deliveryCostsMonthly"),
          other_costs_monthly: val("otherCostsMonthly"),
          cost_per_lead: val("costPerLead"),
          cost_per_appointment: val("costPerAppointment"),
          cost_per_customer: val("costPerCustomer"),
          margin_percent: totalRevenue > 0 ? Math.round(marginPercent * 10) / 10 : null,
          current_leads_per_month: valInt("currentLeadsPerMonth"),
          current_conversion_rate: val("currentConversionRate"),
          goal_leads_monthly: valInt("goalLeadsMonthly"),
          goal_revenue_monthly: val("goalRevenueMonthly"),
          goal_timeframe: formData.goalTimeframe || null,
          primary_goal: formData.primaryGoal || null,
          onboarding_completed: true,
        })
        .select()
        .single();

      if (error) throw error;
      await refreshTenant();

      setGeneratingAnalysis(true);
      try {
        await supabase.functions.invoke("generate-summary", {
          body: { tenantId: data.id, scope: "onboarding_initial" },
        });
      } catch { /* non-blocking */ }
      setGeneratingAnalysis(false);

      toast({ title: "Profil erstellt", description: "Deine Erstanalyse wird geladen..." });
      setTimeout(() => onComplete(), 500);
    } catch (error: any) {
      toast({ title: "Fehler", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
      setGeneratingAnalysis(false);
    }
  };

  const progress = ((step + 1) / STEPS.length) * 100;

  /** Number input with optional "Weiß ich nicht" checkbox */
  const numField = (label: string, key: string, placeholder: string, unit = "") => {
    const isUnknown = unknowns.has(key);
    return (
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label className="text-sm">
            {label}
            {unit && <span className="text-muted-foreground ml-1 font-normal">({unit})</span>}
          </Label>
          <button
            type="button"
            onClick={() => toggleUnknown(key)}
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
          value={isUnknown ? "" : (formData as any)[key]}
          onChange={(e) => update(key, e.target.value)}
          placeholder={isUnknown ? "– wird übersprungen –" : placeholder}
          disabled={isUnknown}
          className={isUnknown ? "bg-muted/50 text-muted-foreground" : ""}
        />
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Step indicator */}
      <div className="space-y-3">
        <div className="flex justify-between">
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
          {numField("Aktuelle Follower", "linkedinFollowersCurrent", "500")}
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
          {numField("Angebotspreis", "offerPrice", "3000", "€")}
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
          {numField("Closing-Rate", "closingRate", "25", "%")}
        </div>
      )}

      {/* Step 3: Finanzen */}
      {step === 3 && (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Monatliche Finanzen</h3>

          {/* Einnahmen */}
          <div className="p-3 rounded-lg border border-border/60 bg-muted/30 space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">💰 Einnahmen</p>
            <div className="grid grid-cols-2 gap-3">
              {numField("Wiederkehrend", "revenueRecurring", "10000", "€/Monat")}
              {numField("Einmalig", "revenueOnetime", "5000", "€/Monat")}
            </div>
            <div className="flex justify-between text-sm font-medium pt-1 border-t border-border/40">
              <span>Gesamt-Einnahmen</span>
              <span className="text-primary">{totalRevenue.toLocaleString("de-DE")} €</span>
            </div>
          </div>

          {/* Ausgaben */}
          <div className="p-3 rounded-lg border border-border/60 bg-muted/30 space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">📤 Ausgaben</p>
            <div className="grid grid-cols-2 gap-3">
              {numField("Ads / Werbung", "adsSpendMonthly", "2000", "€")}
              {numField("Tools & Software", "toolsCostsMonthly", "500", "€")}
              {numField("Personal", "personnelCostsMonthly", "3000", "€")}
              {numField("Delivery / Fulfillment", "deliveryCostsMonthly", "1000", "€")}
              {numField("Sonstige Kosten", "otherCostsMonthly", "500", "€")}
            </div>
            <div className="flex justify-between text-sm font-medium pt-1 border-t border-border/40">
              <span>Gesamt-Ausgaben</span>
              <span className="text-destructive">{totalCosts.toLocaleString("de-DE")} €</span>
            </div>
          </div>

          {/* Auto-berechnete Werte */}
          <div className="p-3 rounded-lg border-2 border-primary/20 bg-primary/5 space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">📊 Automatisch berechnet</p>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-muted-foreground">Gewinn/Verlust</p>
                <p className={`text-lg font-bold ${profit >= 0 ? "text-green-600 dark:text-green-400" : "text-destructive"}`}>
                  {profit >= 0 ? "+" : ""}{profit.toLocaleString("de-DE")} €
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Marge</p>
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
        </div>
      )}

      {/* Step 4: KPIs */}
      {step === 4 && (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Aktuelle Kennzahlen</h3>
          <p className="text-sm text-muted-foreground">Schätzwerte reichen – oder klicke „Weiß ich nicht".</p>

          <div className="p-3 rounded-lg border border-border/60 bg-muted/30 space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">📈 Performance</p>
            <div className="grid grid-cols-2 gap-3">
              {numField("Leads / Monat", "currentLeadsPerMonth", "20")}
              {numField("Gesamtumsatz / Monat", "currentRevenueMonthly", "15000", "€")}
              {numField("Conversion-Rate", "currentConversionRate", "2.5", "%")}
              {numField("Marketingbudget", "monthlyBudget", "5000", "€")}
            </div>
          </div>

          <div className="p-3 rounded-lg border border-border/60 bg-muted/30 space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">💲 Stückkosten</p>
            <div className="grid grid-cols-3 gap-3">
              {numField("Kosten / Lead", "costPerLead", "50", "€")}
              {numField("Kosten / Termin", "costPerAppointment", "150", "€")}
              {numField("Kosten / Kunde", "costPerCustomer", "500", "€")}
            </div>
          </div>
        </div>
      )}

      {/* Step 5: Ziele */}
      {step === 5 && (
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
            {numField("Ziel-Leads / Monat", "goalLeadsMonthly", "50")}
            {numField("Ziel-Umsatz / Monat", "goalRevenueMonthly", "25000", "€")}
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
