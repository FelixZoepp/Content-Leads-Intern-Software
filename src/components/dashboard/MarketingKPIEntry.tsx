import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Save, TrendingUp, BarChart3, Users } from "lucide-react";

interface Props {
  tenantId: string;
  onEntryAdded: () => void;
}

const defaultMarketing = {
  entry_date: new Date().toISOString().split("T")[0],
  post_url: "",
  post_type: "content" as "lead" | "content",
  impressions: 0,
  likes: 0,
  comments: 0,
  link_clicks: 0,
  followers_current: 0,
  dms_sent: 0,
  leads_total: 0,
  leads_qualified: 0,
};

export function MarketingKPIEntry({ tenantId, onEntryAdded }: Props) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(defaultMarketing);
  const [existingId, setExistingId] = useState<number | null>(null);
  const [lastFollowers, setLastFollowers] = useState<number>(0);

  useEffect(() => { loadExisting(form.entry_date); }, [tenantId]);

  const loadExisting = async (date: string) => {
    // Current day data
    const { data } = await supabase
      .from("metrics_snapshot")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("period_date", date)
      .maybeSingle();

    // Previous entry for follower delta
    const { data: prev } = await supabase
      .from("metrics_snapshot")
      .select("followers_current, period_date")
      .eq("tenant_id", tenantId)
      .lt("period_date", date)
      .order("period_date", { ascending: false })
      .limit(1)
      .maybeSingle();

    setLastFollowers(prev?.followers_current || 0);

    if (data) {
      setExistingId(data.id);
      setForm(prev => ({
        ...prev,
        post_url: data.post_url || "",
        post_type: (data.post_type as "lead" | "content") || "content",
        impressions: data.impressions || 0,
        likes: data.likes || 0,
        comments: data.comments || 0,
        link_clicks: data.link_clicks || 0,
        followers_current: data.followers_current || 0,
        dms_sent: data.dms_sent || 0,
        leads_total: data.leads_total || 0,
        leads_qualified: data.leads_qualified || 0,
      }));
    } else {
      setExistingId(null);
      setForm(prev => ({ ...defaultMarketing, entry_date: prev.entry_date }));
    }
  };

  const set = (field: string, value: any) => setForm(p => ({ ...p, [field]: value }));
  const n = (field: string, raw: string) => set(field, parseInt(raw) || 0);

  // Live calculations
  const newFollowers = form.followers_current - lastFollowers;
  const mqRate = form.leads_total > 0 ? ((form.leads_qualified / form.leads_total) * 100).toFixed(1) : "–";
  const engagementRate = form.impressions > 0
    ? (((form.likes + form.comments + form.link_clicks) / form.impressions) * 100).toFixed(2) : "–";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const marketingPayload = {
      post_url: form.post_url || null,
      post_type: form.post_type,
      posts: form.post_url ? "1" : "0",
      impressions: form.impressions,
      likes: form.likes,
      comments: form.comments,
      link_clicks: form.link_clicks,
      followers_current: form.followers_current,
      new_followers: Math.max(0, newFollowers),
      dms_sent: form.dms_sent,
      leads_total: form.leads_total,
      leads_qualified: form.leads_qualified,
    };

    let error;
    if (existingId) {
      // Merge: only update marketing fields, keep sales fields intact
      ({ error } = await supabase
        .from("metrics_snapshot")
        .update(marketingPayload)
        .eq("id", existingId));
    } else {
      ({ error } = await supabase
        .from("metrics_snapshot")
        .insert({
          tenant_id: tenantId,
          period_date: form.entry_date,
          period_type: "daily",
          ...marketingPayload,
        }));
    }

    setLoading(false);
    if (error) {
      toast({ title: "Fehler", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Gespeichert ✓", description: `Marketing-KPIs für ${new Date(form.entry_date).toLocaleDateString("de-DE")} gespeichert` });
      onEntryAdded();
    }
  };

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          Tägliche Marketing-KPIs
        </CardTitle>
        <CardDescription>Erfasse deinen heutigen LinkedIn-Content, Reichweite und Lead-Generierung.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Datum */}
          <div className="space-y-1.5 max-w-[200px]">
            <Label className="text-xs font-medium">Datum</Label>
            <Input type="date" max={new Date().toISOString().split("T")[0]}
              value={form.entry_date}
              onChange={e => { set("entry_date", e.target.value); loadExisting(e.target.value); }} />
          </div>

          {/* LinkedIn Content */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-primary flex items-center gap-2">
              🔗 LinkedIn Content
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Post-URL (optional)</Label>
                <Input type="url" placeholder="https://linkedin.com/posts/..."
                  value={form.post_url} onChange={e => set("post_url", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Posttyp</Label>
                <Select value={form.post_type} onValueChange={v => set("post_type", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lead">🎯 Lead-Post</SelectItem>
                    <SelectItem value="content">📝 Content-Post</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Field id="impressions" label="Impressionen" value={form.impressions} onChange={v => n("impressions", v)} />
              <Field id="likes" label="Likes" value={form.likes} onChange={v => n("likes", v)} />
              <Field id="comments" label="Kommentare" value={form.comments} onChange={v => n("comments", v)} />
              <Field id="link_clicks" label="Link-Klicks" value={form.link_clicks} onChange={v => n("link_clicks", v)} />
            </div>
            {form.impressions > 0 && (
              <div className="flex flex-wrap gap-4 text-xs bg-muted/40 rounded-lg px-3 py-2 text-muted-foreground">
                <span>Engagement-Rate: <strong className="text-foreground">{engagementRate}%</strong></span>
              </div>
            )}
          </section>

          {/* Follower & DMs */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-primary flex items-center gap-2">
              <Users className="h-4 w-4" /> Reichweite & Outreach
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">
                  Follower (aktuell)
                  {lastFollowers > 0 && <span className="ml-1 text-muted-foreground font-normal">gestern: {lastFollowers}</span>}
                </Label>
                <Input type="number" min="0" value={form.followers_current}
                  onChange={e => n("followers_current", e.target.value)} />
                {form.followers_current > 0 && lastFollowers > 0 && (
                  <p className="text-xs text-muted-foreground">
                    +{Math.max(0, newFollowers)} neue Follower heute
                  </p>
                )}
              </div>
              <Field id="dms_sent" label="DMs rausgesendet" value={form.dms_sent} onChange={v => n("dms_sent", v)} />
            </div>
          </section>

          {/* Lead Generation */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-primary flex items-center gap-2">
              🎯 Lead-Generierung
            </h3>
            <div className="grid grid-cols-2 gap-3 max-w-md">
              <Field id="leads_total" label="Leads generiert" value={form.leads_total} onChange={v => n("leads_total", v)} />
              <div className="space-y-1.5">
                <Label htmlFor="leads_qualified" className="text-xs font-medium">
                  MQL (Qualifiziert)
                </Label>
                <Input id="leads_qualified" type="number" min="0" max={form.leads_total}
                  value={form.leads_qualified}
                  onChange={e => set("leads_qualified", Math.min(parseInt(e.target.value)||0, form.leads_total))} />
              </div>
            </div>
            {form.leads_total > 0 && (
              <div className="flex flex-wrap gap-4 text-xs bg-muted/40 rounded-lg px-3 py-2 text-muted-foreground">
                <span>MQL-Rate: <strong className="text-foreground">{mqRate}%</strong></span>
              </div>
            )}
          </section>

          {/* Live Calc */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <p className="text-xs font-semibold flex items-center gap-2 text-muted-foreground">
              <TrendingUp className="h-3.5 w-3.5" /> Berechnete Kennzahlen (live)
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { label: "Engagement-Rate", value: engagementRate, suffix: "%" },
                { label: "Neue Follower", value: form.followers_current > 0 ? String(Math.max(0, newFollowers)) : "–", suffix: "" },
                { label: "MQL-Rate", value: mqRate, suffix: mqRate !== "–" ? "%" : "" },
              ].map(k => (
                <div key={k.label} className="bg-background rounded-md p-3 text-center">
                  <div className="text-xs text-muted-foreground">{k.label}</div>
                  <div className="text-lg font-bold text-primary">{k.value === "–" ? "–" : `${k.value}${k.suffix}`}</div>
                </div>
              ))}
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? "Wird gespeichert..." : existingId ? "Marketing-KPIs aktualisieren" : "Marketing-KPIs speichern"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function Field({ id, label, value, onChange }: {
  id: string; label: string; value: number; onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs font-medium">{label}</Label>
      <Input id={id} type="number" min="0" inputMode="numeric"
        value={value} onChange={e => onChange(e.target.value)} />
    </div>
  );
}
