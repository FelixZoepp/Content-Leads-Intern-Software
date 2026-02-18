import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Save, Clock, Target, CheckCircle2, AlertCircle, Pause, XCircle, Edit2 } from "lucide-react";

interface Props {
  tenantId: string;
}

const STATUS_MAP: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  onboarding: { label: "Onboarding", color: "bg-blue-500/10 text-blue-700 border-blue-200", icon: Clock },
  active: { label: "Aktiv", color: "bg-green-500/10 text-green-700 border-green-200", icon: CheckCircle2 },
  paused: { label: "Pausiert", color: "bg-yellow-500/10 text-yellow-700 border-yellow-200", icon: Pause },
  completed: { label: "Abgeschlossen", color: "bg-primary/10 text-primary border-primary/20", icon: Target },
  cancelled: { label: "Abgebrochen", color: "bg-red-500/10 text-red-700 border-red-200", icon: XCircle },
};

export function FulfillmentTracker({ tenantId }: Props) {
  const { toast } = useToast();
  const [data, setData] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    deal_closed_at: "",
    onboarding_started_at: "",
    onboarding_completed_at: "",
    project_start_date: "",
    project_planned_end: "",
    project_actual_end: "",
    project_status: "onboarding",
    milestones_total: 0,
    milestones_completed: 0,
    csat_score: "",
    nps_score: "",
    contract_start: "",
    contract_end: "",
    contract_renewed: false,
    churn_reason: "",
    notes: "",
  });

  useEffect(() => { loadData(); }, [tenantId]);

  const loadData = async () => {
    setLoading(true);
    const { data: row } = await supabase
      .from("fulfillment_tracking")
      .select("*")
      .eq("tenant_id", tenantId)
      .maybeSingle();

    if (row) {
      setData(row);
      setForm({
        deal_closed_at: row.deal_closed_at || "",
        onboarding_started_at: row.onboarding_started_at || "",
        onboarding_completed_at: row.onboarding_completed_at || "",
        project_start_date: row.project_start_date || "",
        project_planned_end: row.project_planned_end || "",
        project_actual_end: row.project_actual_end || "",
        project_status: row.project_status || "onboarding",
        milestones_total: row.milestones_total || 0,
        milestones_completed: row.milestones_completed || 0,
        csat_score: row.csat_score?.toString() || "",
        nps_score: row.nps_score?.toString() || "",
        contract_start: row.contract_start || "",
        contract_end: row.contract_end || "",
        contract_renewed: row.contract_renewed || false,
        churn_reason: row.churn_reason || "",
        notes: row.notes || "",
      });
    }
    setLoading(false);
  };

  const set = (field: string, value: any) => setForm(prev => ({ ...prev, [field]: value }));

  const daysBetween = (a: string, b: string) => {
    if (!a || !b) return null;
    return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000);
  };

  const onboardingDays = daysBetween(form.onboarding_started_at, form.onboarding_completed_at || new Date().toISOString().split("T")[0]);
  const projectDays = daysBetween(form.project_start_date, form.project_actual_end || new Date().toISOString().split("T")[0]);
  const plannedDays = daysBetween(form.project_start_date, form.project_planned_end);
  const contractDaysLeft = daysBetween(new Date().toISOString().split("T")[0], form.contract_end);
  const milestoneProgress = form.milestones_total > 0 ? Math.round((form.milestones_completed / form.milestones_total) * 100) : 0;

  const handleSave = async () => {
    setSaving(true);
    const payload: any = {
      tenant_id: tenantId,
      deal_closed_at: form.deal_closed_at || null,
      onboarding_started_at: form.onboarding_started_at || null,
      onboarding_completed_at: form.onboarding_completed_at || null,
      project_start_date: form.project_start_date || null,
      project_planned_end: form.project_planned_end || null,
      project_actual_end: form.project_actual_end || null,
      project_status: form.project_status,
      milestones_total: form.milestones_total,
      milestones_completed: Math.min(form.milestones_completed, form.milestones_total),
      csat_score: form.csat_score ? parseFloat(form.csat_score) : null,
      nps_score: form.nps_score ? parseInt(form.nps_score) : null,
      contract_start: form.contract_start || null,
      contract_end: form.contract_end || null,
      contract_renewed: form.contract_renewed,
      churn_reason: form.churn_reason || null,
      notes: form.notes || null,
    };

    const { error } = data
      ? await supabase.from("fulfillment_tracking").update(payload).eq("id", data.id)
      : await supabase.from("fulfillment_tracking").insert(payload);

    setSaving(false);
    if (error) {
      toast({ title: "Fehler", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Gespeichert ✓", description: "Fulfillment-Daten aktualisiert" });
      setEditing(false);
      loadData();
    }
  };

  if (loading) return null;

  const statusInfo = STATUS_MAP[form.project_status] || STATUS_MAP.onboarding;
  const StatusIcon = statusInfo.icon;

  // Summary view
  if (!editing && data) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">📦 Fulfillment</CardTitle>
            <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
              <Edit2 className="h-3.5 w-3.5 mr-1" /> Bearbeiten
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status & Progress */}
          <div className="flex flex-wrap gap-3">
            <Badge variant="outline" className={statusInfo.color}>
              <StatusIcon className="h-3.5 w-3.5 mr-1" /> {statusInfo.label}
            </Badge>
            {onboardingDays !== null && form.onboarding_started_at && (
              <Badge variant="outline">
                Onboarding: {onboardingDays} Tage {form.onboarding_completed_at ? "✓" : "(läuft)"}
              </Badge>
            )}
            {projectDays !== null && form.project_start_date && (
              <Badge variant="outline">
                Projektlaufzeit: {projectDays} Tage
                {plannedDays ? ` / ${plannedDays} geplant` : ""}
              </Badge>
            )}
            {contractDaysLeft !== null && form.contract_end && (
              <Badge variant="outline" className={contractDaysLeft < 30 ? "border-red-300 text-red-700" : ""}>
                {contractDaysLeft > 0 ? `${contractDaysLeft} Tage bis Vertragsende` : "Vertrag abgelaufen"}
              </Badge>
            )}
            {form.contract_renewed && <Badge variant="outline" className="border-green-300 text-green-700">Verlängert ✓</Badge>}
          </div>

          {/* Milestones */}
          {form.milestones_total > 0 && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Meilensteine: {form.milestones_completed} / {form.milestones_total}</span>
                <span>{milestoneProgress}%</span>
              </div>
              <Progress value={milestoneProgress} className="h-2" />
            </div>
          )}

          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {form.csat_score && (
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <div className="text-xs text-muted-foreground">CSAT</div>
                <div className="text-lg font-bold text-primary">{form.csat_score}/5</div>
              </div>
            )}
            {form.nps_score && (
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <div className="text-xs text-muted-foreground">NPS</div>
                <div className="text-lg font-bold text-primary">{form.nps_score}</div>
              </div>
            )}
            {onboardingDays !== null && form.onboarding_completed_at && (
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <div className="text-xs text-muted-foreground">Onboarding</div>
                <div className="text-lg font-bold text-primary">{onboardingDays}d</div>
              </div>
            )}
            {projectDays !== null && form.project_start_date && (
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <div className="text-xs text-muted-foreground">Laufzeit</div>
                <div className={`text-lg font-bold ${plannedDays && projectDays > plannedDays ? "text-red-600" : "text-primary"}`}>
                  {projectDays}d
                </div>
              </div>
            )}
          </div>

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
        <CardTitle className="text-lg">📦 Fulfillment-Tracking</CardTitle>
        <CardDescription>Projektstatus, Meilensteine und Kundenzufriedenheit</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Status */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Projektstatus</Label>
            <Select value={form.project_status} onValueChange={(v) => set("project_status", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(STATUS_MAP).map(([key, { label }]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Onboarding */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-primary">🚀 Onboarding</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Deal abgeschlossen am</Label>
                <Input type="date" value={form.deal_closed_at} onChange={(e) => set("deal_closed_at", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Onboarding gestartet</Label>
                <Input type="date" value={form.onboarding_started_at} onChange={(e) => set("onboarding_started_at", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Onboarding abgeschlossen</Label>
                <Input type="date" value={form.onboarding_completed_at} onChange={(e) => set("onboarding_completed_at", e.target.value)} />
              </div>
            </div>
            {onboardingDays !== null && form.onboarding_started_at && (
              <div className="text-xs text-muted-foreground bg-muted/30 rounded px-3 py-2">
                Onboarding-Dauer: <strong className="text-foreground">{onboardingDays} Tage</strong>
                {!form.onboarding_completed_at && " (läuft noch)"}
              </div>
            )}
          </div>

          {/* Project Timeline */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-primary">📅 Projektlaufzeit</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Projektstart</Label>
                <Input type="date" value={form.project_start_date} onChange={(e) => set("project_start_date", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Geplantes Ende</Label>
                <Input type="date" value={form.project_planned_end} onChange={(e) => set("project_planned_end", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Tatsächliches Ende</Label>
                <Input type="date" value={form.project_actual_end} onChange={(e) => set("project_actual_end", e.target.value)} />
              </div>
            </div>
            {form.project_start_date && (
              <div className="flex gap-4 text-xs text-muted-foreground bg-muted/30 rounded px-3 py-2">
                {projectDays !== null && <span>Laufzeit: <strong className="text-foreground">{projectDays} Tage</strong></span>}
                {plannedDays !== null && <span>Geplant: <strong className="text-foreground">{plannedDays} Tage</strong></span>}
                {plannedDays && projectDays && projectDays > plannedDays && (
                  <span className="text-red-600 font-medium flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {projectDays - plannedDays} Tage Verzug
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Milestones */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-primary">🎯 Meilensteine</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Geplante Meilensteine</Label>
                <Input type="number" min="0" value={form.milestones_total}
                  onChange={(e) => set("milestones_total", parseInt(e.target.value) || 0)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Erledigte Meilensteine</Label>
                <Input type="number" min="0" max={form.milestones_total} value={form.milestones_completed}
                  onChange={(e) => set("milestones_completed", Math.min(parseInt(e.target.value) || 0, form.milestones_total))} />
              </div>
            </div>
            {form.milestones_total > 0 && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Fortschritt</span>
                  <span>{milestoneProgress}%</span>
                </div>
                <Progress value={milestoneProgress} className="h-2" />
              </div>
            )}
          </div>

          {/* Satisfaction */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-primary">⭐ Zufriedenheit & Retention</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">CSAT (1-5)</Label>
                <Input type="number" min="1" max="5" step="0.1" value={form.csat_score}
                  onChange={(e) => set("csat_score", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">NPS (0-10)</Label>
                <Input type="number" min="0" max="10" value={form.nps_score}
                  onChange={(e) => set("nps_score", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Vertragsstart</Label>
                <Input type="date" value={form.contract_start} onChange={(e) => set("contract_start", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Vertragsende</Label>
                <Input type="date" value={form.contract_end} onChange={(e) => set("contract_end", e.target.value)} />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-xs cursor-pointer">
                <input type="checkbox" checked={form.contract_renewed}
                  onChange={(e) => set("contract_renewed", e.target.checked)}
                  className="rounded border-input" />
                Vertrag verlängert
              </label>
              {contractDaysLeft !== null && form.contract_end && (
                <span className={`text-xs ${contractDaysLeft < 30 ? "text-red-600 font-medium" : "text-muted-foreground"}`}>
                  {contractDaysLeft > 0 ? `${contractDaysLeft} Tage bis Vertragsende` : "Vertrag abgelaufen!"}
                </span>
              )}
            </div>
            {form.project_status === "cancelled" && (
              <div className="space-y-1.5">
                <Label className="text-xs">Churn-Grund</Label>
                <Input value={form.churn_reason} onChange={(e) => set("churn_reason", e.target.value)}
                  placeholder="Warum wurde abgebrochen?" />
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Notizen</Label>
            <Textarea value={form.notes} onChange={(e) => set("notes", e.target.value)}
              placeholder="Anmerkungen zum Projekt..." rows={3} />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={saving} className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Wird gespeichert..." : "Fulfillment speichern"}
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
