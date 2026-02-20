import { KPIMetricConfig } from "@/components/client/KPIMetricTracker";

export const salesKPIConfigs: KPIMetricConfig[] = [
  {
    key: "closing_rate",
    label: "Closing-Rate",
    icon: "🎯",
    unit: "%",
    target: 80,
    higherIsBetter: true,
    criticalThreshold: 0.5,
    getValue: (metrics) => {
      const total = metrics.reduce((a, m) => ({
        closings: a.closings + (Number(m.closings) || 0),
        deals: a.deals + (Number(m.deals) || 0),
      }), { closings: 0, deals: 0 });
      if (!total.closings) return null;
      return (total.deals / total.closings) * 100;
    },
    getImpact: (current, target) => {
      const gap = target - current;
      if (gap <= 0) return "Du bist über deinem Closing-Ziel – halte das Momentum.";
      return `+${gap.toFixed(0)}% mehr Closes = deutlich mehr Deals ohne zusätzliche Leads.`;
    },
    actions: [
      "Überprüfe dein Closing-Skript – nutze die 'Feel, Felt, Found'-Methode zur Einwandbehandlung",
      "Stelle sicher, dass Interessenten vorqualifiziert sind, bevor du in den Call gehst",
      "Sende 24h vorher ein Value-Briefing, das den ROI deines Angebots klar zeigt",
      "Analysiere deine letzten 5 verlorenen Closings: Welches Einwand-Muster wiederholt sich?",
    ],
  },
  {
    key: "show_rate",
    label: "Setting Show-Rate",
    icon: "📅",
    unit: "%",
    target: 80,
    higherIsBetter: true,
    criticalThreshold: 0.6,
    getValue: (metrics) => {
      const total = metrics.reduce((a, m) => ({
        planned: a.planned + (Number(m.settings_planned) || 0),
        held: a.held + (Number(m.settings_held) || 0),
      }), { planned: 0, held: 0 });
      if (!total.planned) return null;
      return (total.held / total.planned) * 100;
    },
    getImpact: (current, target) => {
      const gap = target - current;
      if (gap <= 0) return "Exzellente Show-Rate – deine Termine erscheinen zuverlässig.";
      return `${gap.toFixed(0)}% weniger No-Shows = signifikant mehr Closings pro Monat.`;
    },
    actions: [
      "Sende 48h und 2h vor dem Termin eine WhatsApp-Erinnerung mit Agenda",
      "Nutze Calendly mit automatischen E-Mail-Reminders direkt nach Buchung",
      "Erhalte eine kleine Commitment-Geste: 'Kannst du kurz bestätigen, dass du morgen dabei bist?'",
      "Reduziere den Zeitraum zwischen Setting und Closing auf max. 48-72h",
    ],
  },
  {
    key: "lead_to_appt",
    label: "Lead → Termin Rate",
    icon: "🔁",
    unit: "%",
    target: 20,
    higherIsBetter: true,
    criticalThreshold: 0.5,
    getValue: (metrics) => {
      const total = metrics.reduce((a, m) => ({
        leads: a.leads + (Number(m.leads_total) || 0),
        appts: a.appts + (Number(m.appointments) || 0),
      }), { leads: 0, appts: 0 });
      if (!total.leads) return null;
      return (total.appts / total.leads) * 100;
    },
    getImpact: (current, target) => {
      const gap = target - current;
      if (gap <= 0) return "Starke Lead-zu-Termin-Rate – dein Outreach konvertiert.";
      return `Verdopple deine Termine ohne mehr Leads: Optimierung von ${current.toFixed(0)}% → ${target}%.`;
    },
    actions: [
      "Antworte innerhalb von 5 Minuten auf neue Leads – Kontaktrate sinkt danach dramatisch",
      "Nutze ein klares 2-Schritt-DM-Skript: Interesse wecken, dann Termin anbieten",
      "Qualifiziere mit 3 Fragen bevor du einen Termin anbietest (Budget, Problem, Dringlichkeit)",
      "Follow-up nach 24h, 48h und 5 Tagen wenn keine Antwort kommt",
    ],
  },
  {
    key: "calls_interest_rate",
    label: "Call-Interessenten-Rate",
    icon: "📞",
    unit: "%",
    target: 15,
    higherIsBetter: true,
    criticalThreshold: 0.5,
    getValue: (metrics) => {
      const total = metrics.reduce((a, m) => ({
        reached: a.reached + (Number(m.calls_reached) || 0),
        interested: a.interested + (Number(m.calls_interested) || 0),
      }), { reached: 0, interested: 0 });
      if (!total.reached) return null;
      return (total.interested / total.reached) * 100;
    },
    getImpact: (current, target) => {
      const gap = target - current;
      if (gap <= 0) return "Dein Cold-Call-Skript funktioniert – gute Interessenten-Rate.";
      return `+${gap.toFixed(0)}% mehr Interessenten = mehr Settings ohne mehr Anrufe.`;
    },
    actions: [
      "Überarbeite deinen Cold-Call-Opener: Die ersten 10 Sekunden entscheiden alles",
      "Rufe zwischen 9-11 Uhr und 14-16 Uhr an – höchste Erreichbarkeit",
      "Personalisiere deinen Opener mit einem konkreten Bezug zum Unternehmen des Prospects",
      "Arbeite mit einem Einwand-Dokument: Notiere häufige Einwände und trainiere Antworten",
    ],
  },
];

export const marketingKPIConfigs: KPIMetricConfig[] = [
  {
    key: "reach_rate",
    label: "Reach Rate (Impressionen/Follower)",
    icon: "📊",
    unit: "%",
    target: 30,
    higherIsBetter: true,
    getValue: (metrics) => {
      const latest = metrics[0];
      if (!latest?.impressions || !latest?.followers_current) return null;
      return (Number(latest.impressions) / Number(latest.followers_current)) * 100;
    },
    getImpact: (current, target) => {
      const gap = target - current;
      if (gap <= 0) return "Dein Content erreicht einen starken Anteil deiner Follower.";
      return `Bessere Reach = mehr organische Sichtbarkeit ohne zusätzliches Budget.`;
    },
    actions: [
      "Poste zu Spitzenstunden: Di-Do zwischen 8-10 Uhr und 17-19 Uhr auf LinkedIn",
      "Nutze Karussell-Posts und Dokumente – LinkedIn boosted diese organisch mehr",
      "Kommentiere täglich 5-10 Posts in deiner Nische (erhöht Profil-Sichtbarkeit)",
      "Vermeide externe Links im Post – schreibe den Link in den ersten Kommentar",
    ],
  },
  {
    key: "lead_quality",
    label: "Lead-Qualitätsrate",
    icon: "⭐",
    unit: "%",
    target: 60,
    higherIsBetter: true,
    criticalThreshold: 0.5,
    getValue: (metrics) => {
      const total = metrics.reduce((a, m) => ({
        leads: a.leads + (Number(m.leads_total) || 0),
        qualified: a.qualified + (Number(m.leads_qualified) || 0),
      }), { leads: 0, qualified: 0 });
      if (!total.leads) return null;
      return (total.qualified / total.leads) * 100;
    },
    getImpact: (current, target) => {
      const gap = target - current;
      if (gap <= 0) return "Starke Lead-Qualität – dein Targeting trifft die richtige Zielgruppe.";
      return `Höhere Lead-Qualität = weniger Zeitverlust im Sales-Prozess.`;
    },
    actions: [
      "Verfasse Content, der bewusst deine Zielgruppe anspricht und andere ausschließt",
      "Ergänze CTAs mit Qualifizierungsfragen (z.B. 'Für Unternehmen ab 6-stelligem Umsatz')",
      "Tracke, welche Post-Formate die qualifiziertesten Leads generieren",
      "Optimiere deinen DM-Qualifizierungsfilter nach Budget, Problem, Timing",
    ],
  },
  {
    key: "new_followers",
    label: "Neue Follower (gesamt)",
    icon: "👥",
    unit: "number",
    target: 100,
    higherIsBetter: true,
    getValue: (metrics) => {
      return metrics.reduce((a, m) => a + (Number(m.new_followers) || 0), 0) || null;
    },
    getImpact: (current, target) => {
      if (current >= target) return "Gutes Followerwachstum – deine Sichtbarkeit steigt.";
      return `${target - current} weitere Follower bis zum Ziel – mehr Follower = mehr organische Reichweite.`;
    },
    actions: [
      "Sende täglich 5-10 personalisierte Vernetzungsanfragen an Entscheidungsträger",
      "Kommentiere Beiträge von Influencern in deiner Nische (sichtbares Engagement)",
      "Teile Mehrwert-Content, den andere gerne speichern und teilen wollen",
      "Cross-promote auf anderen Kanälen (Newsletter, Podcast, E-Mail-Signatur)",
    ],
  },
  {
    key: "engagement_rate",
    label: "Engagement Rate",
    icon: "💬",
    unit: "%",
    target: 3,
    higherIsBetter: true,
    criticalThreshold: 0.5,
    getValue: (metrics) => {
      const total = metrics.reduce((a, m) => ({
        impressions: a.impressions + (Number(m.impressions) || 0),
        likes: a.likes + (Number(m.likes) || 0),
        comments: a.comments + (Number(m.comments) || 0),
      }), { impressions: 0, likes: 0, comments: 0 });
      if (!total.impressions) return null;
      return ((total.likes + total.comments) / total.impressions) * 100;
    },
    getImpact: (current, target) => {
      if (current >= target) return "Starkes Engagement – dein Content resoniert mit deiner Zielgruppe.";
      return `Höheres Engagement signalisiert LinkedIn Qualität – das boosted organische Reichweite massiv.`;
    },
    actions: [
      "Stelle am Ende jedes Posts eine klare Frage – erzeugt Kommentare",
      "Antworte auf JEDEN Kommentar in den ersten 60 Minuten nach dem Post",
      "Starte 'Engagement-Pods': Kollegengruppen, die sich gegenseitig kommentieren",
      "Nutze Storytelling und persönliche Erfahrungen – diese performen am stärksten",
    ],
  },
];
