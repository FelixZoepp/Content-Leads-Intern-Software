import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, Building2, Linkedin, BarChart3, Target, ChevronRight, ChevronLeft, Sparkles, DollarSign, ShoppingBag } from "lucide-react";
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
    marginPercent: "",
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

  const canNext = () => {
    if (step === 0) return formData.companyName.trim().length > 0;
    return true;
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Nicht authentifiziert");

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
          contact_name: formData.contactName,
          industry: formData.industry,
          team_size: formData.teamSize,
          target_audience: formData.targetAudience,
          website_url: formData.websiteUrl || null,
          monthly_budget: parseFloat(formData.monthlyBudget) || 0,
          linkedin_url: formData.linkedinUrl || null,
          linkedin_followers_current: parseInt(formData.linkedinFollowersCurrent) || 0,
          posting_frequency: formData.postingFrequency,
          linkedin_experience: formData.linkedinExperience,
          current_offer: formData.currentOffer,
          offer_price: parseFloat(formData.offerPrice) || 0,
          contract_duration: formData.contractDuration,
          closing_rate: parseFloat(formData.closingRate) || 0,
          revenue_recurring: parseFloat(formData.revenueRecurring) || 0,
          revenue_onetime: parseFloat(formData.revenueOnetime) || 0,
          current_revenue_monthly: parseFloat(formData.currentRevenueMonthly) || 0,
          ads_spend_monthly: parseFloat(formData.adsSpendMonthly) || 0,
          tools_costs_monthly: parseFloat(formData.toolsCostsMonthly) || 0,
          personnel_costs_monthly: parseFloat(formData.personnelCostsMonthly) || 0,
          delivery_costs_monthly: parseFloat(formData.deliveryCostsMonthly) || 0,
          other_costs_monthly: parseFloat(formData.otherCostsMonthly) || 0,
          cost_per_lead: parseFloat(formData.costPerLead) || 0,
          cost_per_appointment: parseFloat(formData.costPerAppointment) || 0,
          cost_per_customer: parseFloat(formData.costPerCustomer) || 0,
          margin_percent: parseFloat(formData.marginPercent) || 0,
          current_leads_per_month: parseInt(formData.currentLeadsPerMonth) || 0,
          current_conversion_rate: parseFloat(formData.currentConversionRate) || 0,
          goal_leads_monthly: parseInt(formData.goalLeadsMonthly) || 0,
          goal_revenue_monthly: parseFloat(formData.goalRevenueMonthly) || 0,
          goal_timeframe: formData.goalTimeframe,
          primary_goal: formData.primaryGoal,
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

  const fieldGroup = (label: string, key: string, placeholder: string, type = "text", suffix = "") => (
    <div className="space-y-1.5">
      <Label className="text-sm">{label}{suffix && <span className="text-muted-foreground ml-1">({suffix})</span>}</Label>
      <Input type={type} value={(formData as any)[key]} onChange={(e) => update(key, e.target.value)} placeholder={placeholder} />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Step indicator */}
      <div className="space-y-3">
        <div className="flex justify-between">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
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
            );
          })}
        </div>
        <Progress value={progress} className="h-1.5" />
      </div>

      {/* Step 0: Firmenprofil */}
      {step === 0 && (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Firmenprofil</h3>
          {fieldGroup("Firmenname *", "companyName", "ContentLeads GmbH")}
          {fieldGroup("Ansprechpartner", "contactName", "Max Mustermann")}
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
            {fieldGroup("Website", "websiteUrl", "https://www.example.com", "url")}
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm">Zielgruppe</Label>
            <Textarea value={formData.targetAudience} onChange={(e) => update("targetAudience", e.target.value)} placeholder="z.B. B2B-Entscheider in der DACH-Region, CEOs/CMOs von KMUs..." rows={2} />
          </div>
        </div>
      )}

      {/* Step 1: LinkedIn */}
      {step === 1 && (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">LinkedIn-Status</h3>
          {fieldGroup("LinkedIn-Profil-URL", "linkedinUrl", "https://linkedin.com/in/...", "url")}
          {fieldGroup("Aktuelle Follower", "linkedinFollowersCurrent", "500", "number")}
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
            <Label className="text-sm">Was verkaufst du? (Offer-Beschreibung)</Label>
            <Textarea value={formData.currentOffer} onChange={(e) => update("currentOffer", e.target.value)} placeholder="z.B. LinkedIn-Marketing-Paket für B2B-Unternehmen inkl. Content-Erstellung, Lead-Generierung und Ads-Management..." rows={3} />
          </div>
          {fieldGroup("Angebotspreis", "offerPrice", "3000", "number", "€")}
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
          {fieldGroup("Closing-Rate", "closingRate", "25", "number", "%")}
        </div>
      )}

      {/* Step 3: Finanzen */}
      {step === 3 && (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Monatliche Finanzen</h3>
          <div className="p-3 rounded-lg bg-muted/50 space-y-3">
            <p className="text-xs font-medium text-muted-foreground uppercase">Einnahmen</p>
            <div className="grid grid-cols-2 gap-3">
              {fieldGroup("Wiederkehrend", "revenueRecurring", "10000", "number", "€/Monat")}
              {fieldGroup("Einmalig", "revenueOnetime", "5000", "number", "€/Monat")}
            </div>
          </div>
          <div className="p-3 rounded-lg bg-muted/50 space-y-3">
            <p className="text-xs font-medium text-muted-foreground uppercase">Ausgaben</p>
            <div className="grid grid-cols-2 gap-3">
              {fieldGroup("Ads / Werbung", "adsSpendMonthly", "2000", "number", "€/Monat")}
              {fieldGroup("Tools & Software", "toolsCostsMonthly", "500", "number", "€/Monat")}
              {fieldGroup("Personal", "personnelCostsMonthly", "3000", "number", "€/Monat")}
              {fieldGroup("Delivery / Fulfillment", "deliveryCostsMonthly", "1000", "number", "€/Monat")}
              {fieldGroup("Sonstige Kosten", "otherCostsMonthly", "500", "number", "€/Monat")}
            </div>
          </div>
          {fieldGroup("Marge", "marginPercent", "40", "number", "%")}
        </div>
      )}

      {/* Step 4: KPIs */}
      {step === 4 && (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Aktuelle Kennzahlen</h3>
          <p className="text-sm text-muted-foreground">Diese Daten bilden deine Ausgangslage – Schätzwerte reichen.</p>
          <div className="grid grid-cols-2 gap-4">
            {fieldGroup("Leads / Monat", "currentLeadsPerMonth", "20", "number")}
            {fieldGroup("Gesamtumsatz / Monat", "currentRevenueMonthly", "15000", "number", "€")}
          </div>
          <div className="grid grid-cols-2 gap-4">
            {fieldGroup("Conversion-Rate", "currentConversionRate", "2.5", "number", "%")}
            {fieldGroup("Monatsbudget Marketing", "monthlyBudget", "5000", "number", "€")}
          </div>
          <div className="grid grid-cols-3 gap-3">
            {fieldGroup("Kosten / Lead", "costPerLead", "50", "number", "€")}
            {fieldGroup("Kosten / Termin", "costPerAppointment", "150", "number", "€")}
            {fieldGroup("Kosten / Kunde", "costPerCustomer", "500", "number", "€")}
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
            {fieldGroup("Ziel-Leads / Monat", "goalLeadsMonthly", "50", "number")}
            {fieldGroup("Ziel-Umsatz / Monat", "goalRevenueMonthly", "25000", "number", "€")}
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
