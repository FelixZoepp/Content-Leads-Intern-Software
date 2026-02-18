import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { tenantId, scope } = await req.json();

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get recent metrics
    const { data: metrics, error: metricsError } = await supabaseClient
      .from("metrics_snapshot")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("period_date", { ascending: false })
      .limit(28);

    if (metricsError) throw metricsError;

    // Get benchmarks
    const { data: benchmarks } = await supabaseClient
      .from("benchmarks")
      .select("*")
      .eq("tenant_id", tenantId);

    // Get latest health score
    const { data: healthScore } = await supabaseClient
      .from("health_scores")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    // Get recent CSAT
    const { data: feedback } = await supabaseClient
      .from("csat_responses")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false })
      .limit(5);

    // Calculate averages
    const len = metrics?.length || 1;
    const sum = (field: string) => metrics?.reduce((acc: number, m: any) => acc + (parseFloat(m[field]) || 0), 0) || 0;
    const avg = (field: string) => sum(field) / len;

    const latestMetrics = metrics?.[0];
    const previousMetrics = metrics?.[7];

    // Build benchmark classification
    const benchmarkMap: Record<string, any> = {};
    benchmarks?.forEach((b: any) => {
      benchmarkMap[b.metric_key] = {
        label: b.metric_label,
        tier1_max: Number(b.tier1_max),
        tier2_max: Number(b.tier2_max),
        unit: b.unit,
      };
    });

    const classify = (key: string, value: number) => {
      const b = benchmarkMap[key];
      if (!b) return { tier: "unbekannt", label: b?.label || key, value };
      if (value <= b.tier1_max) return { tier: "rot", label: b.label, value, benchmark: `≤${b.tier1_max}` };
      if (value <= b.tier2_max) return { tier: "gelb", label: b.label, value, benchmark: `${b.tier1_max+1}-${b.tier2_max}` };
      return { tier: "grün", label: b.label, value, benchmark: `>${b.tier2_max}` };
    };

    // Classify current metrics
    const classifications: any[] = [];
    const metricKeys: Record<string, string> = {
      impressions: "impressions",
      leads_total: "leads_total",
      leads_qualified: "leads_qualified",
      calls_made: "calls_made",
      calls_reached: "calls_reached",
      appointments: "appointments",
      deals: "deals",
      cash_collected: "cash_collected",
    };

    // Use weekly sums (last 7 days)
    const last7 = metrics?.slice(0, 7) || [];
    const weekSum = (field: string) => last7.reduce((acc: number, m: any) => acc + (parseFloat(m[field]) || 0), 0);

    for (const [key, field] of Object.entries(metricKeys)) {
      const val = weekSum(field);
      if (benchmarkMap[key]) {
        classifications.push(classify(key, val));
      }
    }

    // Rate-based metrics from latest day
    const rateMetrics: Record<string, number> = {};
    if (latestMetrics) {
      const lt = parseFloat(latestMetrics.leads_total) || 0;
      const lq = parseFloat(latestMetrics.leads_qualified) || 0;
      rateMetrics.lead_quality_rate = lt > 0 ? (lq / lt) * 100 : 0;

      const sp = parseFloat(latestMetrics.settings_planned) || 0;
      const sh = parseFloat(latestMetrics.settings_held) || 0;
      rateMetrics.setting_show_rate = sp > 0 ? (sh / sp) * 100 : 0;

      const cp = parseFloat(latestMetrics.closings_planned) || 0;
      const ch = parseFloat(latestMetrics.closings_held) || 0;
      rateMetrics.closing_show_rate = cp > 0 ? (ch / cp) * 100 : 0;

      const d = parseFloat(latestMetrics.deals) || 0;
      rateMetrics.closing_rate = ch > 0 ? (d / ch) * 100 : 0;
    }

    for (const [key, val] of Object.entries(rateMetrics)) {
      if (benchmarkMap[key]) {
        classifications.push(classify(key, Math.round(val * 10) / 10));
      }
    }

    const hasBenchmarks = benchmarks && benchmarks.length > 0;

    const benchmarkSection = hasBenchmarks
      ? `\n\nBENCHMARK-KLASSIFIZIERUNG (Pflicht: beziehe dich auf jede Stufe!):\n${classifications
          .map(c => `- ${c.label}: ${c.value} → Stufe ${c.tier === "rot" ? "1 (ROT - unter Benchmark)" : c.tier === "gelb" ? "2 (GELB - im Rahmen)" : "3 (GRÜN - über Benchmark)"}`)
          .join("\n")}`
      : "";

    const systemPrompt = scope === "admin_portfolio"
      ? "Du bist ein Customer Success Manager. Analysiere die Portfolio-Daten und gib konkrete, handlungsorientierte Empfehlungen auf Deutsch."
      : `Du bist ein Performance-Analyst für eine LinkedIn-Agentur. Du analysierst KPIs und gibst dem Kunden konkrete, umsetzbare Empfehlungen auf Deutsch.

WICHTIG: Deine Analyse MUSS folgendes Format haben:

## 📊 Stufen-Einordnung
Ordne JEDE Kennzahl einer der 3 Stufen zu:
- 🔴 Stufe 1 (Unter Benchmark): Sofortiger Handlungsbedarf
- 🟡 Stufe 2 (Im Rahmen): Optimierungspotenzial  
- 🟢 Stufe 3 (Über Benchmark): Weiter ausbauen

## 🎯 3-Schritte-Anleitung

### Schritt 1: Sofort umsetzen (diese Woche)
[Konkrete Maßnahme für die kritischste 🔴 Kennzahl]

### Schritt 2: Diese Woche optimieren
[Konkrete Maßnahme für 🟡 Kennzahlen]

### Schritt 3: Langfristig skalieren
[Strategie um 🟢 Kennzahlen weiter auszubauen]

Sei faktenbasiert, nutze NUR die gegebenen Daten. Kein Smalltalk.`;

    const userPrompt = `Analysiere folgende Performance-Daten der letzten Woche:

WOCHENWERTE (letzte 7 Tage):
- Impressionen: ${weekSum("impressions")}
- Kommentare: ${weekSum("comments")}
- DMs gesendet: ${weekSum("dms_sent")}
- Leads gesamt: ${weekSum("leads_total")}
- MQL: ${weekSum("leads_qualified")}
- Anwahlen: ${weekSum("calls_made")}
- Erreicht: ${weekSum("calls_reached")}
- Termine: ${weekSum("appointments")}
- Deals: ${weekSum("deals")}
- Cash Collected: ${weekSum("cash_collected")}€

QUOTEN (letzter Tag):
- MQL-Quote: ${(rateMetrics.lead_quality_rate || 0).toFixed(1)}%
- Setting Show-Rate: ${(rateMetrics.setting_show_rate || 0).toFixed(1)}%
- Closing Show-Rate: ${(rateMetrics.closing_show_rate || 0).toFixed(1)}%
- Closing-Rate: ${(rateMetrics.closing_rate || 0).toFixed(1)}%

VORWOCHE zum Vergleich:
- Leads: ${previousMetrics?.leads_total || 0}
- Deals: ${previousMetrics?.deals || 0}
- Umsatz: ${previousMetrics?.revenue || 0}€

4-WOCHEN-DURCHSCHNITT:
- Leads/Tag: ${avg("leads_total").toFixed(1)}
- Deals/Tag: ${avg("deals").toFixed(1)}
- Umsatz/Tag: ${avg("revenue").toFixed(2)}€

Health Score: ${healthScore?.score || "N/A"}/100 (${healthScore?.color || "unbekannt"})
${benchmarkSection}

Erstelle die Analyse im vorgegebenen Format mit Stufen-Einordnung und 3-Schritte-Anleitung. Max 250 Wörter.`;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (aiResponse.status === 429) {
      return new Response(JSON.stringify({ error: "Rate limit erreicht. Bitte später erneut versuchen." }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (aiResponse.status === 402) {
      return new Response(JSON.stringify({ error: "AI-Credits aufgebraucht. Bitte Credits aufladen." }), {
        status: 402,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI Gateway Error:", aiResponse.status, errorText);
      throw new Error("AI Gateway Error");
    }

    const aiData = await aiResponse.json();
    const summaryText = aiData.choices[0].message.content;

    // Save summary
    const { data: summary, error: summaryError } = await supabaseClient
      .from("ai_summaries")
      .insert({
        tenant_id: tenantId,
        scope: scope,
        summary_text: summaryText,
      })
      .select()
      .single();

    if (summaryError) throw summaryError;

    return new Response(JSON.stringify({ summary, classifications }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error generating summary:", error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
