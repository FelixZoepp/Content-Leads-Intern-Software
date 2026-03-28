import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Save, Loader2, Sparkles, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useKpiEntries } from "@/hooks/useCashflowData";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { format, subDays } from "date-fns";
import { de } from "date-fns/locale";

const fields = [
  { key: "dms_sent", label: "DMs gesendet", group: "DMs" },
  { key: "dm_replies", label: "DM-Antworten", group: "DMs" },
  { key: "mails_sent", label: "Mails gesendet", group: "Mails" },
  { key: "mail_opens", label: "Mail-Öffnungen", group: "Mails" },
  { key: "mail_replies", label: "Mail-Antworten", group: "Mails" },
  { key: "posts_published", label: "Posts veröffentlicht", group: "Content" },
  { key: "termine", label: "Termine", group: "Pipeline" },
  { key: "proposals", label: "Proposals", group: "Pipeline" },
  { key: "abschluesse", label: "Abschlüsse", group: "Pipeline" },
] as const;

type FieldKey = (typeof fields)[number]["key"];

export default function KPITrackingPage() {
  const { user, tenantId } = useAuth();
  const { toast } = useToast();
  const { entries, loading: entriesLoading, reload } = useKpiEntries(30);
  const [saving, setSaving] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [form, setForm] = useState<Record<FieldKey, number>>(
    Object.fromEntries(fields.map((f) => [f.key, 0])) as Record<FieldKey, number>
  );

  const todayStr = format(new Date(), "yyyy-MM-dd");

  // Pre-fill from today's entry if exists
  useEffect(() => {
    if (!user) return;
    (supabase as any)
      .from("kpi_entries")
      .select("*")
      .eq("user_id", user.id)
      .eq("date", todayStr)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          const newForm = { ...form };
          for (const f of fields) {
            if (data[f.key] != null) newForm[f.key] = data[f.key];
          }
          setForm(newForm);
        }
      });
  }, [user, todayStr]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      // Check if today's entry exists
      const { data: existing } = await supabase
        .from("kpi_entries")
        .select("id")
        .eq("user_id", user.id)
        .eq("date", todayStr)
        .maybeSingle();

      if (existing) {
        await supabase
          .from("kpi_entries")
          .update({ ...form })
          .eq("id", existing.id);
      } else {
        await supabase.from("kpi_entries").insert({
          user_id: user.id,
          date: todayStr,
          week_start_date: todayStr,
          ...form,
        });
      }

      toast({ title: "Gespeichert", description: "Deine KPIs für heute wurden erfasst." });
      reload();
    } catch {
      toast({ title: "Fehler", description: "Speichern fehlgeschlagen.", variant: "destructive" });
    }
    setSaving(false);
  };

  const handleAnalyze = async () => {
    if (!user) return;
    setAnalyzing(true);
    try {
      let userProfile: any = {};
      if (tenantId) {
        const { data } = await supabase.from("tenants").select("*").eq("id", tenantId).single();
        userProfile = data || {};
      }

      const kpiSummary = entries.slice(0, 14).map((e) => ({
        date: e.date,
        dms_sent: e.dms_sent,
        dm_replies: e.dm_replies,
        mails_sent: e.mails_sent,
        mail_replies: e.mail_replies,
        termine: e.termine,
        proposals: e.proposals,
        abschluesse: e.abschluesse,
      }));

      const { data, error } = await supabase.functions.invoke("generate-asset", {
        body: {
          assetType: "linkedin_caption",
          userProfile,
          customPrompt: `Analysiere diese KPI-Daten der letzten 14 Tage und gib konkrete Optimierungsempfehlungen:

${JSON.stringify(kpiSummary, null, 2)}

Gib:
1. Zusammenfassung der Performance
2. Stärken (was gut läuft)
3. Schwächen (wo Verbesserung nötig ist)
4. 3-5 konkrete Action Items für die nächste Woche
5. Vergleich mit den Benchmarks (DM Antwortrate 20-30%, Mail Antwortrate 5-15%, Termine→Proposal 70%+, Proposal→Abschluss 30%+)`,
        },
      });

      if (error) throw error;
      setAnalysis(data.content);
    } catch {
      toast({ title: "Fehler", description: "Analyse fehlgeschlagen.", variant: "destructive" });
    }
    setAnalyzing(false);
  };

  // Chart data
  const last7 = entries.slice(0, 7).reverse();
  const lineData = last7.map((e) => ({
    date: format(new Date(e.date), "dd.MM", { locale: de }),
    dms: e.dms_sent || 0,
    antwortrate: e.dms_sent > 0 ? Math.round(((e.dm_replies || 0) / e.dms_sent) * 100) : 0,
  }));

  // Weekly aggregation for bar chart
  const weeklyData = [];
  for (let i = 0; i < Math.min(4, Math.ceil(entries.length / 7)); i++) {
    const weekEntries = entries.slice(i * 7, (i + 1) * 7);
    weeklyData.unshift({
      week: `KW ${format(subDays(new Date(), i * 7), "w")}`,
      termine: weekEntries.reduce((s, e) => s + (e.termine || 0), 0),
      abschluesse: weekEntries.reduce((s, e) => s + (e.abschluesse || 0), 0),
    });
  }

  const groups = [...new Set(fields.map((f) => f.group))];

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground">KPIs & Zahlen</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Tägliche KPI-Erfassung und Analyse</p>
      </motion.div>

      {/* Daily Input Form */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="rounded-xl border border-border/50 bg-card p-5"
      >
        <h2 className="text-sm font-semibold text-foreground mb-4">
          Tages-Eingabe — {format(new Date(), "d. MMMM yyyy", { locale: de })}
        </h2>
        <div className="space-y-4">
          {groups.map((group) => (
            <div key={group}>
              <p className="text-xs text-muted-foreground font-medium mb-2">{group}</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {fields
                  .filter((f) => f.group === group)
                  .map((field) => (
                    <div key={field.key}>
                      <Label className="text-xs text-muted-foreground">{field.label}</Label>
                      <Input
                        type="number"
                        min={0}
                        value={form[field.key]}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, [field.key]: parseInt(e.target.value) || 0 }))
                        }
                        className="mt-1"
                      />
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
        <Button onClick={handleSave} disabled={saving} className="mt-4 bg-[#534AB7] hover:bg-[#4339a0]">
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          Heute speichern
        </Button>
      </motion.div>

      {/* Weekly Overview Table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-xl border border-border/50 bg-card p-5 overflow-x-auto"
      >
        <h2 className="text-sm font-semibold text-foreground mb-3">Letzte 7 Tage</h2>
        {entriesLoading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left py-2 text-muted-foreground font-medium">Datum</th>
                {fields.map((f) => (
                  <th key={f.key} className="text-right py-2 text-muted-foreground font-medium px-2">
                    {f.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {last7.map((entry) => (
                <tr key={entry.id} className="border-b border-border/30">
                  <td className="py-2 text-foreground">
                    {format(new Date(entry.date), "dd.MM", { locale: de })}
                  </td>
                  {fields.map((f) => (
                    <td key={f.key} className="text-right py-2 text-foreground px-2">
                      {entry[f.key] ?? 0}
                    </td>
                  ))}
                </tr>
              ))}
              {last7.length === 0 && (
                <tr>
                  <td colSpan={fields.length + 1} className="py-6 text-center text-muted-foreground">
                    Noch keine Einträge vorhanden.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </motion.div>

      {/* Charts */}
      {last7.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-xl border border-border/50 bg-card p-5"
          >
            <h2 className="text-sm font-semibold text-foreground mb-3">DMs & Antwortrate</h2>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis yAxisId="left" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="dms" name="DMs" stroke="#534AB7" strokeWidth={2} />
                <Line yAxisId="right" type="monotone" dataKey="antwortrate" name="Antwortrate %" stroke="#1D9E75" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl border border-border/50 bg-card p-5"
          >
            <h2 className="text-sm font-semibold text-foreground mb-3">Termine & Abschlüsse pro Woche</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="week" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip />
                <Legend />
                <Bar dataKey="termine" name="Termine" fill="#534AB7" radius={[4, 4, 0, 0]} />
                <Bar dataKey="abschluesse" name="Abschlüsse" fill="#1D9E75" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      )}

      {/* AI Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="rounded-xl border border-border/50 bg-card p-5"
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-foreground">KI-Analyse</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={handleAnalyze}
            disabled={analyzing || entries.length === 0}
          >
            {analyzing ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
            ) : (
              <Sparkles className="h-3.5 w-3.5 mr-1.5" />
            )}
            Analysiere meine Zahlen
          </Button>
        </div>
        {analysis ? (
          <div className="prose prose-sm prose-invert max-w-none text-sm text-foreground whitespace-pre-wrap">
            {analysis}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            {entries.length === 0
              ? "Trage zuerst KPIs ein, um eine Analyse zu erhalten."
              : "Klicke auf 'Analysiere meine Zahlen' für eine KI-gestützte Auswertung."}
          </p>
        )}
      </motion.div>
    </div>
  );
}
