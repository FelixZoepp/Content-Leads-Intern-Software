import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `Du bist die KI-Engine der "90-Tage Cashflow Offensive" — einem Premium-Coaching-Programm für Agenturinhaber und Dienstleister.

DEINE AUFGABE: Generiere vollständig personalisierte, sofort einsetzbare Business-Assets.

=== LINKEDIN PROFIL FORMEL ===
Headline: "Ich helfe [ICP-Rolle] in [Branche], [konkretes Ergebnis] — ohne [größter Einwand]"
About: Hook → Story → Methode → Ergebnis (mit Zahlen) → CTA

=== DM-SEQUENZ (5 Steps) ===
DM1 (Connect): Persönlich, kein Pitch, max 2 Sätze
DM2 (Erst-DM): Wert-first, 1 Frage die ihr Problem berührt, kein CTA
DM3 (Tag 3): Kurzer Mehrwert + Frage ob relevant
DM4 (Tag 7): "Ist [Problem X] gerade ein Thema für dich?"
DM5 (Tag 14): Breakup-DM, ehrlich, knapp

=== COLD MAIL (3 Mails) ===
Mail1: Problem → Lösung → Beweis → Eine Frage (4 Sätze)
Mail2 (Tag 3): Konkreter Tipp + sanfter CTA
Mail3 (Tag 7): "Letzte Mail — falls Timing schlecht, gerne Bescheid."

=== CLOSING EINWÄNDE ===
"Zu teuer" → "Im Vergleich wozu? Was kostet dich das Problem jeden Monat?"
"Muss nachdenken" → "Was genau musst du noch bedenken?"
"Schick Infos" → "Was genau möchtest du in den Infos sehen?"
"Keine Zeit" → "Wann hast du Zeit für [gewünschtes Ergebnis]?"
"Kein Budget" → "Wenn Budget kein Thema wäre — würdest du starten?"

=== KPI BENCHMARKS ===
LinkedIn DM: 20-30% Antwortrate = gut
Cold Mail: 40-60% Öffnungsrate, 5-15% Antwortrate normal
Termine → Proposal: 70%+ = gutes Qualifying
Proposal → Abschluss: 30%+ = Ziel

REGELN: Schreibe in "du"-Form. Alles sofort copy-paste-fähig. Konkret und spezifisch basierend auf den ICP-Daten. Kein Marketing-Sprech.`;

const assetPrompts: Record<string, (profile: any) => string> = {
  fahrplan: (p) =>
    `Erstelle einen 90-Tage Wochenplan für ${p.company_name || "eine Agentur"} in der Branche "${p.industry || "Dienstleistung"}".
Zielgruppe: ${p.target_audience || "Geschäftsführer"}.
Angebot: ${p.current_offer || "Beratung"} für ${p.offer_price_monthly || "k.A."}€/Monat.
Ziel: ${p.goal_revenue_monthly || "10000"}€ monatlicher Umsatz in ${p.goal_timeframe || "90 Tagen"}.

Strukturiere den Plan in Woche 1-12, mit täglich 3 konkreten Aufgaben.
Antworte im JSON-Format:
{
  "weeks": [
    {
      "week": 1,
      "theme": "Setup & Fundament",
      "days": [
        { "day": 1, "tasks": [
          { "text": "Aufgabe 1", "category": "setup" },
          { "text": "Aufgabe 2", "category": "content" },
          { "text": "Aufgabe 3", "category": "outreach" }
        ]}
      ]
    }
  ]
}
Kategorien: setup, content, outreach, closing, optimierung.`,

  linkedin_profil: (p) =>
    `Erstelle ein optimiertes LinkedIn-Profil für ${p.company_name || "eine Agentur"}.
Branche: ${p.industry || "Dienstleistung"}
Zielgruppe (ICP): ${p.target_audience || "Geschäftsführer"}
Angebot: ${p.current_offer || "Beratung"}
Preis: ${p.offer_price_monthly || "k.A."}€/Monat

Liefere:
1. **Headline** — 3 Varianten nach der Formel
2. **About-Section** — Vollständig ausgeschrieben (Hook → Story → Methode → Ergebnis → CTA)
3. **Featured-Texte** — 3 Texte für Featured-Beiträge
4. **Profilbild-Tipps** — 3 konkrete Empfehlungen
5. **Banner-Text** — Vorschlag für den Headerbereich`,

  outreach_dms: (p) =>
    `Erstelle eine vollständige 5-DM-Sequenz für ${p.company_name || "eine Agentur"}.
Zielgruppe (ICP): ${p.target_audience || "Geschäftsführer"}
Branche: ${p.industry || "Dienstleistung"}
Angebot: ${p.current_offer || "Beratung"}
Ergebnis: ${p.goal_revenue_monthly || "10000"}€/Monat Umsatzsteigerung

Schreibe alle 5 DMs vollständig aus mit:
- Exaktem Timing (Tag 0, 1, 3, 7, 14)
- Betreff/Kontext
- Vollständiger Text (copy-paste-fertig)
- Erklärung warum diese DM so formuliert ist`,

  cold_mails: (p) =>
    `Erstelle 3 Cold Mails für ${p.company_name || "eine Agentur"}.
Zielgruppe: ${p.target_audience || "Geschäftsführer"} in "${p.industry || "Dienstleistung"}"
Angebot: ${p.current_offer || "Beratung"} für ${p.offer_price_monthly || "k.A."}€/Monat

Liefere für jede Mail:
- 3 Betreffzeilen-Varianten
- Vollständiger Mail-Text
- Timing (Tag 1, 3, 7)
- Erklärung der Strategie`,

  funnel: (p) =>
    `Erstelle Funnel-Texte für ${p.company_name || "eine Agentur"}.
Zielgruppe: ${p.target_audience || "Geschäftsführer"}
Angebot: ${p.current_offer || "Beratung"}
Preis: ${p.offer_price_monthly || "k.A."}€/Monat

Liefere:
1. **Headline** — 3 Varianten (Problem-fokussiert)
2. **Subheadline** — Ergebnis + Zeitrahmen
3. **5 Bullet Points** — Transformations-Bullets
4. **Social Proof Section** — Testimonial-Vorlagen + Zahlen
5. **CTA** — 3 Varianten
6. **Dankeseite** — Headline + nächste Schritte + Erwartungsmanagement`,

  leadmagnet_1: (p) =>
    `Erstelle einen ToFu-Leadmagnet (Checkliste) für ${p.company_name || "eine Agentur"}.
Zielgruppe: ${p.target_audience || "Geschäftsführer"} in "${p.industry || "Dienstleistung"}"
Angebot: ${p.current_offer || "Beratung"}

Liefere:
1. **Titel** — Konkret, Ergebnis-orientiert
2. **15-20 Checklisten-Punkte** — Sofort umsetzbar, Problem-lösend
3. **LinkedIn Caption** — zum Bewerben der Checkliste (mit Hooks + CTA)`,

  leadmagnet_2: (p) =>
    `Erstelle einen MoFu-Leadmagnet (Framework-Guide) für ${p.company_name || "eine Agentur"}.
Zielgruppe: ${p.target_audience || "Geschäftsführer"} in "${p.industry || "Dienstleistung"}"
Angebot: ${p.current_offer || "Beratung"}

Liefere:
1. **Titel** — Expert-Level, Framework-Name
2. **3-5 Schritte** — Jeweils ausführlich erklärt (je 200-300 Wörter)
3. **LinkedIn Caption** — zum Bewerben des Guides`,

  leadmagnet_3: (p) =>
    `Erstelle einen BoFu-Leadmagnet (Case Study) für ${p.company_name || "eine Agentur"}.
Zielgruppe: ${p.target_audience || "Geschäftsführer"} in "${p.industry || "Dienstleistung"}"
Angebot: ${p.current_offer || "Beratung"}
Preis: ${p.offer_price_monthly || "k.A."}€/Monat

Liefere:
1. **Titel** — Ergebnis-fokussiert mit konkreten Zahlen
2. **Situation** — Ausgangslage des Kunden (fiktiv aber realistisch)
3. **Lösung** — Was wurde implementiert
4. **Ergebnis** — Konkrete Zahlen und Zeitrahmen
5. **CTA** — Handlungsaufforderung
6. **LinkedIn Caption** — zum Bewerben der Case Study`,

  opening_skript: (p) =>
    `Erstelle ein vollständiges Opening-Gesprächsskript für ${p.company_name || "eine Agentur"}.
Zielgruppe: ${p.target_audience || "Geschäftsführer"} in "${p.industry || "Dienstleistung"}"
Angebot: ${p.current_offer || "Beratung"} für ${p.offer_price_monthly || "k.A."}€/Monat

Liefere ein Skript mit exakten Formulierungen für:
1. **Begrüßung** (erste 30 Sekunden)
2. **Rapport aufbauen** (2-3 Fragen)
3. **Situation erfragen** (Ist-Zustand)
4. **Problem vertiefen** (Schmerz verstärken)
5. **Ziel erfragen** (Soll-Zustand)
6. **Überleitung zum Angebot**
7. **Qualifizierungsfragen** (Budget, Timing, Entscheider)`,

  closing_skript: (p) =>
    `Erstelle ein vollständiges Closing-Gesprächsskript für ${p.company_name || "eine Agentur"}.
Angebot: ${p.current_offer || "Beratung"} für ${p.offer_price_monthly || "k.A."}€/Monat
Closing-Rate aktuell: ${p.historical_closing_rate || "k.A."}%

Liefere:
1. **Recap** — Zusammenfassung des Erstgesprächs (Template)
2. **Präsentation** — Angebots-Vorstellung Schritt für Schritt
3. **Preisnennung** — Exakte Formulierung mit Anker-Technik
4. **7 Einwandbehandlungen** — mit exakten Antworten:
   - "Zu teuer"
   - "Muss nachdenken"
   - "Schick mir Infos"
   - "Keine Zeit"
   - "Kein Budget"
   - "Muss mit Partner besprechen"
   - "Ich melde mich"
5. **Abschluss-Frage** — 3 Varianten`,

  linkedin_caption: (p) =>
    `Erstelle eine LinkedIn Caption für ${p.company_name || "eine Agentur"}.
Zielgruppe: ${p.target_audience || "Geschäftsführer"} in "${p.industry || "Dienstleistung"}"

Das Thema wird vom User angegeben. Erstelle eine LinkedIn Caption mit:
- Hook (erste 2 Zeilen, die zum Weiterlesen animieren)
- Hauptteil (Mehrwert, Story oder Framework)
- CTA (Engagement-Frage oder Handlungsaufforderung)
- 3-5 relevante Hashtags`,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { assetType, userProfile, customPrompt } = await req.json();

    if (!assetType) {
      throw new Error("assetType is required");
    }

    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    if (!ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY not configured");
    }

    // Build the user prompt
    let userPrompt: string;
    if (customPrompt) {
      // For linkedin_caption with custom topic
      const basePrompt = assetPrompts[assetType];
      userPrompt = basePrompt
        ? basePrompt(userProfile || {}) + `\n\nThema: ${customPrompt}`
        : customPrompt;
    } else {
      const promptFn = assetPrompts[assetType];
      if (!promptFn) {
        throw new Error(`Unknown asset type: ${assetType}`);
      }
      userPrompt = promptFn(userProfile || {});
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6-20250514",
        max_tokens: 4000,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Anthropic API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const content = data.content?.[0]?.text || "";

    return new Response(JSON.stringify({ content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("generate-asset error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
