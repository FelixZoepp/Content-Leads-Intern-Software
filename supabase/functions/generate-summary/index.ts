import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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

    // Get recent metrics for the tenant
    const { data: metrics, error: metricsError } = await supabaseClient
      .from("metrics_snapshot")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("period_date", { ascending: false })
      .limit(28); // Last 4 weeks

    if (metricsError) throw metricsError;

    // Get latest health score
    const { data: healthScore } = await supabaseClient
      .from("health_scores")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    // Get recent CSAT/NPS
    const { data: feedback } = await supabaseClient
      .from("csat_responses")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false })
      .limit(5);

    // Prepare context for AI
    const avgLeads = metrics?.reduce((acc, m) => acc + (m.leads_total || 0), 0) / (metrics?.length || 1);
    const avgDeals = metrics?.reduce((acc, m) => acc + (m.deals || 0), 0) / (metrics?.length || 1);
    const avgRevenue = metrics?.reduce((acc, m) => acc + parseFloat(m.revenue || 0), 0) / (metrics?.length || 1);
    const latestMetrics = metrics?.[0];
    const previousMetrics = metrics?.[7]; // Week ago

    const systemPrompt = scope === 'admin_portfolio' 
      ? "Du bist ein Customer Success Manager. Analysiere die Portfolio-Daten und gib konkrete, handlungsorientierte Empfehlungen."
      : "Du bist ein Performance-Analyst. Analysiere die KPIs und gib dem Kunden konkrete, handlungsorientierte Empfehlungen.";

    const userPrompt = `
Analysiere folgende Performance-Daten:

Letzte Woche:
- Leads: ${latestMetrics?.leads_total || 0}
- Qualifizierte Leads: ${latestMetrics?.leads_qualified || 0}
- Termine: ${latestMetrics?.appointments || 0}
- Deals: ${latestMetrics?.deals || 0}
- Umsatz: ${latestMetrics?.revenue || 0}€
- Posts: ${latestMetrics?.posts || 0}
- Neue Follower: ${latestMetrics?.new_followers || 0}

Vorwoche zum Vergleich:
- Leads: ${previousMetrics?.leads_total || 0}
- Deals: ${previousMetrics?.deals || 0}
- Umsatz: ${previousMetrics?.revenue || 0}€

4-Wochen-Durchschnitt:
- Leads: ${avgLeads.toFixed(1)}
- Deals: ${avgDeals.toFixed(1)}
- Umsatz: ${avgRevenue.toFixed(2)}€

Health Score: ${healthScore?.score || 'N/A'}/100 (${healthScore?.color || 'unbekannt'})

Erstelle ein kurzes Briefing (max. 150 Wörter) mit:
1. **Gut gelaufen** (3 Bullets)
2. **Risiken/Blockaden** (3 Bullets)
3. **Konkrete Next Steps** (3 Bullets, imperativ formuliert)

Bleib faktisch, nutze nur die gegebenen Daten, keine Spekulationen.
`;

    // Call Lovable AI
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
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

    // Save summary to database
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

    return new Response(JSON.stringify({ summary }), {
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
