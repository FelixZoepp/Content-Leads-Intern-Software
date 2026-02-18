import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, Building2, Linkedin, BarChart3, Target, ChevronRight, ChevronLeft, Sparkles } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface ProfileSetupProps {
  onComplete: () => void;
}

const STEPS = [
  { icon: Building2, label: "Firmenprofil" },
  { icon: Linkedin, label: "LinkedIn-Status" },
  { icon: BarChart3, label: "Aktuelle KPIs" },
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
    monthlyBudget: "",
    linkedinUrl: "",
    linkedinFollowersCurrent: "",
    postingFrequency: "",
    linkedinExperience: "",
    currentLeadsPerMonth: "",
    currentRevenueMonthly: "",
    currentConversionRate: "",
    goalLeadsMonthly: "",
    goalRevenueMonthly: "",
    goalTimeframe: "",
    primaryGoal: "",
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
          current_leads_per_month: parseInt(formData.currentLeadsPerMonth) || 0,
          current_revenue_monthly: parseFloat(formData.currentRevenueMonthly) || 0,
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

      // Trigger initial AI assessment
      setGeneratingAnalysis(true);
      try {
        await supabase.functions.invoke("generate-summary", {
          body: { tenantId: data.id, scope: "onboarding_initial" },
        });
      } catch {
        // Non-blocking — analysis can be retried later
      }
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

  return (
    <div className="space-y-6">
      {/* Step indicator */}
      <div className="space-y-3">
        <div className="flex justify-between">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <div
                key={i}
                className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
                  i <= step ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{s.label}</span>
              </div>
            );
          })}
        </div>
        <Progress value={progress} className="h-1.5" />
      </div>

      {/* Step 0: Firmenprofil */}
      {step === 0 && (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="space-y-2">
            <Label>Firmenname *</Label>
            <Input value={formData.companyName} onChange={(e) => update("companyName", e.target.value)} placeholder="ContentLeads GmbH" required />
          </div>
          <div className="space-y-2">
            <Label>Ansprechpartner</Label>
            <Input value={formData.contactName} onChange={(e) => update("contactName", e.target.value)} placeholder="Max Mustermann" />
          </div>
          <div className="space-y-2">
            <Label>Branche</Label>
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
            <div className="space-y-2">
              <Label>Teamgröße</Label>
              <Select value={formData.teamSize} onValueChange={(v) => update("teamSize", v)}>
                <SelectTrigger><SelectValue placeholder="Wählen" /></SelectTrigger>
                <SelectContent>
                  {["1-5", "6-20", "21-50", "51-200", "200+"].map((s) => (
                    <SelectItem key={s} value={s}>{s} Mitarbeiter</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Monatsbudget (€)</Label>
              <Input type="number" value={formData.monthlyBudget} onChange={(e) => update("monthlyBudget", e.target.value)} placeholder="5000" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Zielgruppe</Label>
            <Textarea value={formData.targetAudience} onChange={(e) => update("targetAudience", e.target.value)} placeholder="z.B. B2B-Entscheider in der DACH-Region, CEOs/CMOs von KMUs..." rows={2} />
          </div>
          <div className="space-y-2">
            <Label>Website (optional)</Label>
            <Input type="url" value={formData.websiteUrl} onChange={(e) => update("websiteUrl", e.target.value)} placeholder="https://www.example.com" />
          </div>
        </div>
      )}

      {/* Step 1: LinkedIn-Status */}
      {step === 1 && (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="space-y-2">
            <Label>LinkedIn-Profil-URL</Label>
            <Input type="url" value={formData.linkedinUrl} onChange={(e) => update("linkedinUrl", e.target.value)} placeholder="https://linkedin.com/in/..." />
          </div>
          <div className="space-y-2">
            <Label>Aktuelle Follower</Label>
            <Input type="number" value={formData.linkedinFollowersCurrent} onChange={(e) => update("linkedinFollowersCurrent", e.target.value)} placeholder="500" />
          </div>
          <div className="space-y-2">
            <Label>Posting-Frequenz</Label>
            <Select value={formData.postingFrequency} onValueChange={(v) => update("postingFrequency", v)}>
              <SelectTrigger><SelectValue placeholder="Wie oft postest du?" /></SelectTrigger>
              <SelectContent>
                {["Noch nie", "Sporadisch (< 1x/Woche)", "1-2x pro Woche", "3-5x pro Woche", "Täglich"].map((f) => (
                  <SelectItem key={f} value={f}>{f}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Bisherige LinkedIn-Erfahrung</Label>
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

      {/* Step 2: Aktuelle KPIs */}
      {step === 2 && (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
          <p className="text-sm text-muted-foreground">Diese Daten bilden deine Ausgangslage – sie müssen nicht perfekt sein.</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Leads / Monat</Label>
              <Input type="number" value={formData.currentLeadsPerMonth} onChange={(e) => update("currentLeadsPerMonth", e.target.value)} placeholder="0" />
            </div>
            <div className="space-y-2">
              <Label>Monatsumsatz (€)</Label>
              <Input type="number" value={formData.currentRevenueMonthly} onChange={(e) => update("currentRevenueMonthly", e.target.value)} placeholder="0" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Conversion-Rate (%)</Label>
            <Input type="number" step="0.1" value={formData.currentConversionRate} onChange={(e) => update("currentConversionRate", e.target.value)} placeholder="z.B. 2.5" />
          </div>
        </div>
      )}

      {/* Step 3: Ziele */}
      {step === 3 && (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="space-y-2">
            <Label>Hauptziel</Label>
            <Select value={formData.primaryGoal} onValueChange={(v) => update("primaryGoal", v)}>
              <SelectTrigger><SelectValue placeholder="Was ist dein Hauptziel?" /></SelectTrigger>
              <SelectContent>
                {["Mehr qualifizierte Leads", "Umsatz steigern", "Markenbekanntheit aufbauen", "Recruiting / Employer Branding", "Thought Leadership"].map((g) => (
                  <SelectItem key={g} value={g}>{g}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Ziel-Leads / Monat</Label>
              <Input type="number" value={formData.goalLeadsMonthly} onChange={(e) => update("goalLeadsMonthly", e.target.value)} placeholder="50" />
            </div>
            <div className="space-y-2">
              <Label>Ziel-Umsatz / Monat (€)</Label>
              <Input type="number" value={formData.goalRevenueMonthly} onChange={(e) => update("goalRevenueMonthly", e.target.value)} placeholder="25000" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Zeitrahmen</Label>
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
        <Button
          type="button"
          variant="outline"
          onClick={() => setStep((s) => s - 1)}
          disabled={step === 0 || loading}
        >
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
            {generatingAnalysis ? "Erstanalyse wird generiert..." : "Profil erstellen & Analyse starten"}
          </Button>
        )}
      </div>
    </div>
  );
}
