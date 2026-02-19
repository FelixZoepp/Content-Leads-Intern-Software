import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, TrendingUp, Star, Search, ArrowUpDown, Info } from "lucide-react";

// ──────────────────────────────────────────────────────────────────────────────
// RAW DATA from CSV (all 30 customers – left + right columns)
// ──────────────────────────────────────────────────────────────────────────────
const RAW_CUSTOMERS = [
  // Left column (earlier cohort)
  { name: "Florea Design GmbH", industry: "Handwerk", size: 20, age: 20, duration: "1 Monat", source: "CC", salesCycleDays: 180, cltv: 3000, pages: 1, cohort: "früh" },
  { name: "Sanierungsgesellschaft Riedel mbH", industry: "Handwerk", size: 7, age: 20, duration: "1 Monat", source: "CC", salesCycleDays: 90, cltv: 3000, pages: 1, cohort: "früh" },
  { name: "Tim Hofmann", industry: "Handwerk", size: 1, age: 5, duration: "1 Monat", source: "Ads", salesCycleDays: 7, cltv: 3000, pages: 1, cohort: "früh" },
  { name: "Türenwerk Westner GmbH", industry: "Handwerk", size: 10, age: 50, duration: "1 Monat", source: "CC", salesCycleDays: 30, cltv: 5350, pages: 4, cohort: "früh" },
  { name: "Little Home e.V.", industry: "Verein", size: 3, age: 5, duration: "1 Monat", source: "Ads", salesCycleDays: 7, cltv: 3000, pages: 1, cohort: "früh" },
  { name: "Alu Factory Ostingersleben UG", industry: "Handwerk", size: 3, age: 150, duration: "1 Monat", source: "CC", salesCycleDays: 14, cltv: 3000, pages: 1, cohort: "früh" },
  { name: "LIFESTYLE WATCHES", industry: "Uhrenhändler", size: 2, age: 10, duration: "12 Monate", source: "Ads", salesCycleDays: 4, cltv: 9600, pages: 4, cohort: "früh" },
  { name: "Rekrutierungshelfer GmbH", industry: "Recruiting", size: 15, age: 10, duration: "1 Monat", source: "Ads", salesCycleDays: 7, cltv: 3000, pages: 1, cohort: "früh" },
  { name: "Clean Team 35", industry: "Reinigung", size: 10, age: 5, duration: "4 Monate", source: "Ads", salesCycleDays: 2, cltv: 6000, pages: 7, cohort: "früh" },
  { name: "HITUG UG", industry: "Handwerk", size: 1, age: 10, duration: "1 Monat", source: "CC", salesCycleDays: 4, cltv: 5000, pages: 5, cohort: "früh" },
  { name: "Daniel Marienfeld", industry: "Fotograf", size: 1, age: 5, duration: "1 Monat", source: "Ads", salesCycleDays: 90, cltv: 3000, pages: 1, cohort: "früh" },
  { name: "Schmöllner Heimbetriebsgesellschaft mbH", industry: "Heim", size: 40, age: 30, duration: "3 Monate", source: "Empfehlung", salesCycleDays: 7, cltv: 3500, pages: 1, cohort: "früh" },
  { name: "R.R. Meisterraum GmbH", industry: "Handwerk", size: 5, age: 20, duration: "12 Monate", source: "CC", salesCycleDays: 3, cltv: 4200, pages: 1, cohort: "früh" },
  { name: "Johanna Lappe (Hundeschule)", industry: "Sonstige", size: 1, age: 1, duration: "1 Monat", source: "Empfehlung", salesCycleDays: 21, cltv: 3000, pages: 1, cohort: "früh" },
  { name: "Steffen Hahn Sachverständiger", industry: "Beratung", size: 1, age: 5, duration: "1 Monat", source: "CC", salesCycleDays: 7, cltv: 3000, pages: 1, cohort: "früh" },
  // Right column (recent cohort)
  { name: "Patrick Eich", industry: "Sonstige", size: 1, age: 25, duration: "4 Monate", source: "Andere", salesCycleDays: 7, cltv: 8800, pages: 6, cohort: "aktuell" },
  { name: "Lotto Brandenburg", industry: "Lotto", size: 100, age: 0, duration: "4 Monate", source: "Empfehlung", salesCycleDays: 14, cltv: 8330, pages: 1, cohort: "aktuell" },
  { name: "Metallbau Eisele GmbH", industry: "Handwerk", size: 5, age: 25, duration: "12 Monate", source: "CC", salesCycleDays: 3, cltv: 8200, pages: 9, cohort: "aktuell" },
  { name: "Sonnilux GmbH", industry: "Handwerk", size: 5, age: 30, duration: "16 Monate", source: "CC", salesCycleDays: 7, cltv: 8100, pages: 8, cohort: "aktuell" },
  { name: "Lifestyle Watches", industry: "Uhrenhändler", size: 2, age: 10, duration: "12 Monate", source: "Ads", salesCycleDays: 3, cltv: 7800, pages: 4, cohort: "aktuell" },
  { name: "Dietrich Dienstleistungen GmbH", industry: "Reinigung", size: 10, age: 25, duration: "2 Monate", source: "Ads", salesCycleDays: 4, cltv: 7700, pages: 10, cohort: "aktuell" },
  { name: "Böhme GmbH", industry: "Beratung", size: 5, age: 35, duration: "6 Monate", source: "CC", salesCycleDays: 3, cltv: 7200, pages: 15, cohort: "aktuell" },
  { name: "Lex Event GmbH", industry: "Sonstige", size: 3, age: 7, duration: "3 Monate", source: "Ads", salesCycleDays: 30, cltv: 7140, pages: 5, cohort: "aktuell" },
  { name: "Clean Team 35 (neu)", industry: "Reinigung", size: 10, age: 5, duration: "3 Monate", source: "Ads", salesCycleDays: 3, cltv: 7140, pages: 7, cohort: "aktuell" },
  { name: "Mawu Fliesen GmbH", industry: "Handwerk", size: 2, age: 25, duration: "6 Monate", source: "CC", salesCycleDays: 4, cltv: 6800, pages: 5, cohort: "aktuell" },
  { name: "First Medical Service", industry: "Medizin", size: 6, age: 5, duration: "6 Monate", source: "Ads", salesCycleDays: 2, cltv: 6600, pages: 4, cohort: "aktuell" },
  { name: "Zimmerwerk KG", industry: "Handwerk", size: 5, age: 20, duration: "6 Monate", source: "CC", salesCycleDays: 4, cltv: 6600, pages: 1, cohort: "aktuell" },
  { name: "Türenwerk Westner", industry: "Handwerk", size: 10, age: 50, duration: "2 Monate", source: "CC", salesCycleDays: 30, cltv: 6300, pages: 4, cohort: "aktuell" },
  { name: "Thomas Poss", industry: "Beratung", size: 1, age: 1, duration: "12 Monate", source: "Andere", salesCycleDays: 4, cltv: 6000, pages: 1, cohort: "aktuell" },
  { name: "MBH Elektrotechnik", industry: "Handwerk", size: 3, age: 2, duration: "1 Monat", source: "Ads", salesCycleDays: 7, cltv: 6000, pages: 4, cohort: "aktuell" },
];

// Duration in months mapping for scoring
function durationMonths(d: string): number {
  const m = d.match(/(\d+)/);
  if (!m) return 1;
  const n = parseInt(m[1]);
  if (d.includes("Monat")) return n;
  return n;
}

// Score each customer: higher = more valuable/focus-worthy
function computeScore(c: typeof RAW_CUSTOMERS[0]) {
  let score = 0;
  // CLTV (max weight)
  score += Math.min(c.cltv / 1000 * 10, 100); // up to 100pts
  // Pages booked (more pages = deeper engagement)
  score += Math.min(c.pages * 5, 50);
  // Long duration = higher LTV potential
  score += Math.min(durationMonths(c.duration) * 3, 30);
  // Fast sales cycle = efficient
  if (c.salesCycleDays <= 7) score += 20;
  else if (c.salesCycleDays <= 14) score += 10;
  else if (c.salesCycleDays <= 30) score += 5;
  // Recent cohort
  if (c.cohort === "aktuell") score += 15;
  return Math.round(score);
}

// Detect problems per customer
function detectProblems(c: typeof RAW_CUSTOMERS[0]): string[] {
  const problems: string[] = [];
  if (c.cltv < 4000) problems.push("Niedriger CLTV");
  if (durationMonths(c.duration) <= 1) problems.push("Kurze Laufzeit");
  if (c.salesCycleDays > 60) problems.push("Langer Sales-Cycle");
  if (c.pages <= 1) problems.push("Wenig Seiten gebucht");
  if (c.size <= 1) problems.push("Sehr kleiner Betrieb");
  if (c.source === "Andere") problems.push("Unklare Leadquelle");
  return problems;
}

// Detect strengths
function detectStrengths(c: typeof RAW_CUSTOMERS[0]): string[] {
  const strengths: string[] = [];
  if (c.cltv >= 8000) strengths.push("Top CLTV");
  if (c.salesCycleDays <= 4) strengths.push("Blitz-Close");
  if (c.pages >= 8) strengths.push("High Upsell");
  if (durationMonths(c.duration) >= 12) strengths.push("Langläufer");
  if (c.source === "Empfehlung") strengths.push("Empfehlung");
  return strengths;
}

type SortKey = "score" | "cltv" | "pages" | "salesCycleDays" | "name";

const FOCUS_COLORS: Record<string, string> = {
  "Top": "bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/30",
  "Gut": "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30",
  "Mittel": "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border-yellow-500/30",
  "Schwach": "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30",
};

function focusLabel(score: number): "Top" | "Gut" | "Mittel" | "Schwach" {
  if (score >= 140) return "Top";
  if (score >= 100) return "Gut";
  if (score >= 60) return "Mittel";
  return "Schwach";
}

export function CustomerAnalysisTable() {
  const [search, setSearch] = useState("");
  const [cohortFilter, setCohortFilter] = useState<string>("alle");
  const [industryFilter, setIndustryFilter] = useState<string>("alle");
  const [sourceFilter, setSourceFilter] = useState<string>("alle");
  const [sortKey, setSortKey] = useState<SortKey>("score");
  const [sortAsc, setSortAsc] = useState(false);

  const enriched = useMemo(() =>
    RAW_CUSTOMERS.map(c => ({
      ...c,
      score: computeScore(c),
      problems: detectProblems(c),
      strengths: detectStrengths(c),
    })), []);

  const industries = useMemo(() => Array.from(new Set(enriched.map(c => c.industry))).sort(), [enriched]);
  const sources = useMemo(() => Array.from(new Set(enriched.map(c => c.source))).sort(), [enriched]);

  const filtered = useMemo(() => {
    let data = enriched;
    if (cohortFilter !== "alle") data = data.filter(c => c.cohort === cohortFilter);
    if (industryFilter !== "alle") data = data.filter(c => c.industry === industryFilter);
    if (sourceFilter !== "alle") data = data.filter(c => c.source === sourceFilter);
    if (search.trim()) data = data.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.industry.toLowerCase().includes(search.toLowerCase()));
    return [...data].sort((a, b) => {
      const av = a[sortKey] as any;
      const bv = b[sortKey] as any;
      return sortAsc ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });
  }, [enriched, search, cohortFilter, industryFilter, sourceFilter, sortKey, sortAsc]);

  // Insights / Muster
  const avgCltvCC = useMemo(() => {
    const cc = enriched.filter(c => c.source === "CC");
    return cc.reduce((s, c) => s + c.cltv, 0) / cc.length;
  }, [enriched]);
  const avgCltvAds = useMemo(() => {
    const ads = enriched.filter(c => c.source === "Ads");
    return ads.reduce((s, c) => s + c.cltv, 0) / ads.length;
  }, [enriched]);
  const avgCltvEmpf = useMemo(() => {
    const e = enriched.filter(c => c.source === "Empfehlung");
    return e.reduce((s, c) => s + c.cltv, 0) / e.length;
  }, [enriched]);
  const topByPages = useMemo(() => [...enriched].sort((a, b) => b.pages - a.pages).slice(0, 3), [enriched]);
  const highCycleSlow = useMemo(() => enriched.filter(c => c.salesCycleDays > 60), [enriched]);
  const avgCltvRecent = useMemo(() => {
    const r = enriched.filter(c => c.cohort === "aktuell");
    return r.reduce((s, c) => s + c.cltv, 0) / r.length;
  }, [enriched]);
  const avgCltvOld = useMemo(() => {
    const r = enriched.filter(c => c.cohort === "früh");
    return r.reduce((s, c) => s + c.cltv, 0) / r.length;
  }, [enriched]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(p => !p);
    else { setSortKey(key); setSortAsc(false); }
  };

  const Th = ({ label, k }: { label: string; k: SortKey }) => (
    <th
      className="p-2 text-right cursor-pointer select-none hover:text-primary transition-colors whitespace-nowrap"
      onClick={() => toggleSort(k)}
    >
      <span className="inline-flex items-center gap-1 justify-end">
        {label}
        <ArrowUpDown className="h-3 w-3 opacity-50" />
      </span>
    </th>
  );

  return (
    <div className="space-y-5">
      {/* ── Insights Banner ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <InsightCard
          icon={<TrendingUp className="h-4 w-4 text-primary" />}
          label="Ø CLTV – Aktuell vs. Früher"
          value={`${Math.round(avgCltvRecent).toLocaleString("de-DE")} € vs. ${Math.round(avgCltvOld).toLocaleString("de-DE")} €`}
          sub={avgCltvRecent > avgCltvOld ? `+${Math.round(((avgCltvRecent - avgCltvOld) / avgCltvOld) * 100)}% Verbesserung` : "Rückgang"}
          positive={avgCltvRecent >= avgCltvOld}
        />
        <InsightCard
          icon={<Star className="h-4 w-4 text-yellow-500" />}
          label="Beste Leadquelle (CLTV)"
          value={avgCltvCC >= avgCltvAds && avgCltvCC >= avgCltvEmpf ? "Cold Call" : avgCltvEmpf >= avgCltvAds ? "Empfehlung" : "Ads"}
          sub={`CC ${Math.round(avgCltvCC).toLocaleString("de-DE")}€ · Ads ${Math.round(avgCltvAds).toLocaleString("de-DE")}€ · Empf. ${Math.round(avgCltvEmpf).toLocaleString("de-DE")}€`}
          positive
        />
        <InsightCard
          icon={<AlertTriangle className="h-4 w-4 text-destructive" />}
          label="Lange Sales-Cycles"
          value={`${highCycleSlow.length} Kunden > 60 Tage`}
          sub={highCycleSlow.map(c => c.name.split(" ")[0]).join(", ")}
          positive={highCycleSlow.length === 0}
        />
        <InsightCard
          icon={<Info className="h-4 w-4 text-blue-500" />}
          label="Top Upsell (Seiten)"
          value={topByPages[0]?.name.split(" ").slice(0, 2).join(" ") || "–"}
          sub={topByPages.map(c => `${c.name.split(" ")[0]}: ${c.pages} S.`).join(" · ")}
          positive
        />
      </div>

      {/* ── Filters ── */}
      <Card className="glass-card">
        <CardHeader className="pb-3 pt-4">
          <CardTitle className="text-sm flex items-center gap-2">
            🔍 Kundenanalyse
            <Badge variant="secondary">{filtered.length} / {enriched.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          <div className="flex flex-wrap gap-2">
            <div className="relative flex-1 min-w-40">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Kunde suchen..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-8 h-8 text-sm"
              />
            </div>
            <Select value={cohortFilter} onValueChange={setCohortFilter}>
              <SelectTrigger className="h-8 text-sm w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="alle">Alle Kohorten</SelectItem>
                <SelectItem value="früh">Frühere</SelectItem>
                <SelectItem value="aktuell">Aktuelle</SelectItem>
              </SelectContent>
            </Select>
            <Select value={industryFilter} onValueChange={setIndustryFilter}>
              <SelectTrigger className="h-8 text-sm w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="alle">Alle Branchen</SelectItem>
                {industries.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="h-8 text-sm w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="alle">Alle Quellen</SelectItem>
                {sources.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* ── Table ── */}
          <div className="overflow-x-auto rounded-lg border border-border/40">
            <table className="w-full text-xs">
              <thead className="bg-muted/40 border-b border-border/40">
                <tr>
                  <th className="p-2 text-left font-semibold sticky left-0 bg-muted/40 cursor-pointer" onClick={() => toggleSort("name")}>
                    <span className="inline-flex items-center gap-1">Kunde <ArrowUpDown className="h-3 w-3 opacity-50" /></span>
                  </th>
                  <th className="p-2 text-left font-semibold">Branche</th>
                  <th className="p-2 text-center font-semibold">Größe</th>
                  <th className="p-2 text-center font-semibold">Laufzeit</th>
                  <th className="p-2 text-center font-semibold">Quelle</th>
                  <Th label="Sales-Cycle" k="salesCycleDays" />
                  <Th label="CLTV" k="cltv" />
                  <Th label="Seiten" k="pages" />
                  <th className="p-2 text-center font-semibold">Kohort</th>
                  <Th label="Score" k="score" />
                  <th className="p-2 text-center font-semibold">Fokus</th>
                  <th className="p-2 text-left font-semibold min-w-48">Stärken / Probleme</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, i) => {
                  const label = focusLabel(c.score);
                  const focusCls = FOCUS_COLORS[label];
                  const rowBg = label === "Top" ? "bg-green-500/5" : label === "Schwach" ? "bg-red-500/5" : "";
                  return (
                    <tr key={i} className={`border-b border-border/30 hover:bg-muted/40 transition-colors ${rowBg}`}>
                      <td className="p-2 font-medium sticky left-0 bg-background/80 backdrop-blur-sm max-w-48 truncate" title={c.name}>
                        {c.name}
                      </td>
                      <td className="p-2 text-muted-foreground whitespace-nowrap">{c.industry}</td>
                      <td className="p-2 text-center text-muted-foreground">{c.size}</td>
                      <td className="p-2 text-center whitespace-nowrap">
                        <span className={durationMonths(c.duration) >= 12 ? "text-green-600 dark:text-green-400 font-medium" : durationMonths(c.duration) >= 4 ? "text-foreground" : "text-muted-foreground"}>
                          {c.duration}
                        </span>
                      </td>
                      <td className="p-2 text-center">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                          c.source === "CC" ? "bg-blue-500/10 text-blue-600 dark:text-blue-400" :
                          c.source === "Ads" ? "bg-orange-500/10 text-orange-600 dark:text-orange-400" :
                          c.source === "Empfehlung" ? "bg-green-500/10 text-green-600 dark:text-green-400" :
                          "bg-muted text-muted-foreground"
                        }`}>{c.source}</span>
                      </td>
                      <td className="p-2 text-right">
                        <span className={c.salesCycleDays > 60 ? "text-destructive font-medium" : c.salesCycleDays <= 7 ? "text-green-600 dark:text-green-400" : "text-foreground"}>
                          {c.salesCycleDays <= 1 ? "1 Tag" : c.salesCycleDays <= 7 ? `${c.salesCycleDays}d` :
                           c.salesCycleDays <= 14 ? "2 Wo." : c.salesCycleDays <= 30 ? "1 Mon." :
                           c.salesCycleDays <= 90 ? "3 Mon." : "6 Mon."}
                        </span>
                      </td>
                      <td className="p-2 text-right font-semibold">
                        <span className={c.cltv >= 8000 ? "text-green-600 dark:text-green-400" : c.cltv < 4000 ? "text-muted-foreground" : "text-foreground"}>
                          {c.cltv.toLocaleString("de-DE")} €
                        </span>
                      </td>
                      <td className="p-2 text-right">
                        <span className={c.pages >= 8 ? "text-primary font-bold" : c.pages <= 1 ? "text-muted-foreground" : "text-foreground"}>
                          {c.pages}
                        </span>
                      </td>
                      <td className="p-2 text-center">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                          c.cohort === "aktuell" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                        }`}>{c.cohort}</span>
                      </td>
                      <td className="p-2 text-right font-bold">{c.score}</td>
                      <td className="p-2 text-center">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${focusCls}`}>
                          {label}
                        </span>
                      </td>
                      <td className="p-2">
                        <div className="flex flex-wrap gap-1">
                          {c.strengths.map(s => (
                            <span key={s} className="text-[10px] bg-green-500/10 text-green-700 dark:text-green-400 px-1.5 py-0.5 rounded-full">
                              ✓ {s}
                            </span>
                          ))}
                          {c.problems.map(p => (
                            <span key={p} className="text-[10px] bg-destructive/10 text-destructive px-1.5 py-0.5 rounded-full">
                              ⚠ {p}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* ── Korrelations-Insights ── */}
          <div className="mt-4 p-3 rounded-lg bg-muted/30 border border-border/40 space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">🔗 Muster & Erkenntnisse</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
              <span>📊 Kunden mit <strong>mehr Seiten (&ge;8)</strong> erzielen durchschnittlich höheren CLTV (Böhme 15 S. → 7.200€, Sonnilux 8 S. → 8.100€)</span>
              <span>⚡ <strong>CC-Leadquelle</strong> = schnellster Close bei Handwerk (oft 3–4 Tage); ideal für Skalierung</span>
              <span>📈 Aktuellere Kunden ({Math.round(avgCltvRecent).toLocaleString("de-DE")}€ Ø CLTV) deutlich besser als frühe Kohorte ({Math.round(avgCltvOld).toLocaleString("de-DE")}€)</span>
              <span>⚠️ <strong>1-Monats-Verträge mit 1 Seite</strong>: hohe Absprunggefahr, niedriger CLTV – Fokus auf Upsell oder Qualifizierung</span>
              <span>🎯 <strong>Handwerksbetriebe ab 5 MA</strong> mit Unternehmensalter &ge;20 Jahren = stabilste Kunden (R.R. Meisterraum, Metallbau Eisele)</span>
              <span>🔄 <strong>Ads-Kunden</strong> mit 1 Seite und &le;1 Monat Laufzeit = höchstes Churnrisiko → Re-Qualifizierung empfohlen</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function InsightCard({ icon, label, value, sub, positive }: {
  icon: React.ReactNode; label: string; value: string; sub?: string; positive: boolean;
}) {
  return (
    <div className={`rounded-xl p-3 border ${positive ? "bg-muted/30 border-border/40" : "bg-destructive/5 border-destructive/20"}`}>
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <p className="text-[11px] text-muted-foreground font-medium">{label}</p>
      </div>
      <p className="text-sm font-bold text-foreground leading-tight">{value}</p>
      {sub && <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  );
}
