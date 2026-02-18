import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, AlertCircle, AlertTriangle, CheckCircle2, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";

interface Props {
  tenantId: string;
}

interface Classification {
  tier: "rot" | "gelb" | "grün" | "unbekannt";
  label: string;
  value: number;
  benchmark?: string;
}

const tierConfig = {
  rot: { icon: AlertCircle, color: "text-destructive", bg: "bg-destructive/10 border-destructive/20", label: "Unter Benchmark" },
  gelb: { icon: AlertTriangle, color: "text-warning", bg: "bg-warning/10 border-warning/20", label: "Im Rahmen" },
  grün: { icon: CheckCircle2, color: "text-success", bg: "bg-success/10 border-success/20", label: "Über Benchmark" },
  unbekannt: { icon: AlertCircle, color: "text-muted-foreground", bg: "bg-muted/30 border-border", label: "Kein Benchmark" },
};

export function AIBriefing({ tenantId }: Props) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [classifications, setClassifications] = useState<Classification[]>([]);
  const [lastSummary, setLastSummary] = useState<any>(null);

  useEffect(() => { loadLastSummary(); }, [tenantId]);

  const loadLastSummary = async () => {
    const { data } = await supabase
      .from("ai_summaries")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("scope", "client_weekly")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (data) {
      setLastSummary(data);
      setSummary(data.summary_text);
    }
  };

  const generateBriefing = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-summary", {
        body: { tenantId, scope: "client_weekly" },
      });

      if (error) throw error;
      if (data.error) {
        toast({ title: "Fehler", description: data.error, variant: "destructive" });
        return;
      }

      setSummary(data.summary.summary_text);
      setClassifications(data.classifications || []);
      toast({ title: "KI-Briefing erstellt", description: "Analyse mit Stufen-Einordnung ist fertig" });
    } catch (error: any) {
      toast({ title: "Fehler", description: error.message || "KI-Briefing konnte nicht erstellt werden", variant: "destructive" });
    }
    setLoading(false);
  };

  const grouped = {
    rot: classifications.filter(c => c.tier === "rot"),
    gelb: classifications.filter(c => c.tier === "gelb"),
    grün: classifications.filter(c => c.tier === "grün"),
  };

  return (
    <div className="space-y-6">
      {/* Generate Button */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            KI-Performance-Analyse
          </CardTitle>
          <CardDescription>
            Die KI analysiert alle deine KPIs, ordnet sie in 3 Stufen ein und gibt dir eine konkrete 3-Schritte-Anleitung.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={generateBriefing} disabled={loading} className="rounded-xl glow-primary">
            <Sparkles className="h-4 w-4 mr-2" />
            {loading ? "Analyse läuft..." : "Neue KI-Analyse starten"}
          </Button>
          {lastSummary && !loading && (
            <p className="text-xs text-muted-foreground mt-2">
              Letzte Analyse: {new Date(lastSummary.created_at).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Tier Classification Cards */}
      {classifications.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(["rot", "gelb", "grün"] as const).map((tier, i) => {
            const config = tierConfig[tier];
            const Icon = config.icon;
            const items = grouped[tier];
            return (
              <motion.div
                key={tier}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              >
                <Card className={`border ${config.bg}`}>
                  <CardHeader className="pb-2 pt-4 px-4">
                    <CardTitle className={`text-sm flex items-center gap-2 ${config.color}`}>
                      <Icon className="h-4 w-4" />
                      Stufe {i + 1}: {config.label}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-4">
                    {items.length === 0 ? (
                      <p className="text-xs text-muted-foreground">Keine Kennzahlen</p>
                    ) : (
                      <ul className="space-y-1.5">
                        {items.map((item, j) => (
                          <li key={j} className="text-sm flex items-center justify-between">
                            <span className="text-foreground/80">{item.label}</span>
                            <span className="font-semibold text-foreground">{item.value}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* AI Analysis */}
      {summary && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <ArrowRight className="h-4 w-4 text-primary" />
                KI-Empfehlung & 3-Schritte-Anleitung
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm prose-invert max-w-none [&_h2]:text-base [&_h2]:font-semibold [&_h2]:mt-4 [&_h2]:mb-2 [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:mt-3 [&_h3]:mb-1 [&_ul]:space-y-1 [&_li]:text-foreground/80 [&_p]:text-foreground/80 [&_strong]:text-foreground">
                <ReactMarkdown>{summary}</ReactMarkdown>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
