import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Flame, Target, TrendingUp, Users, MessageSquare, Star } from "lucide-react";
import { useDashboardData } from "@/hooks/useDashboardData";

const TODAY_KEY = `checklist_${new Date().toISOString().slice(0, 10)}`;

type ChecklistItem = { id: string; label: string; done: boolean };
type Section = { title: string; emoji: string; color: string; items: ChecklistItem[] };

const defaultSections: Section[] = [
  {
    title: "Marketing",
    emoji: "📣",
    color: "hsl(174 72% 50%)",
    items: [
      { id: "m1", label: "LinkedIn Post erstellt & veröffentlicht", done: false },
      { id: "m2", label: "Story / Reel gepostet", done: false },
      { id: "m3", label: "Kommentare beantwortet", done: false },
      { id: "m4", label: "Impressionen & Reichweite gecheckt", done: false },
    ],
  },
  {
    title: "Sales",
    emoji: "🎯",
    color: "hsl(211 100% 60%)",
    items: [
      { id: "s1", label: "Leads qualifiziert & follow-up", done: false },
      { id: "s2", label: "Termine für heute vorbereitet", done: false },
      { id: "s3", label: "Closing Calls durchgeführt", done: false },
      { id: "s4", label: "Pipeline aktualisiert", done: false },
    ],
  },
  {
    title: "Cold Calling",
    emoji: "📞",
    color: "hsl(280 70% 65%)",
    items: [
      { id: "c1", label: "Call-Liste vorbereitet", done: false },
      { id: "c2", label: "Mindest-Calls erreicht (Ziel: 20)", done: false },
      { id: "c3", label: "Gespräche dokumentiert", done: false },
      { id: "c4", label: "DMs versendet", done: false },
    ],
  },
  {
    title: "Tagesabschluss",
    emoji: "✅",
    color: "hsl(142 71% 55%)",
    items: [
      { id: "d1", label: "KPIs in Dashboard eingetragen", done: false },
      { id: "d2", label: "Morgen vorbereitet & Priorities gesetzt", done: false },
      { id: "d3", label: "Team-Updates erledigt", done: false },
    ],
  },
];

function loadSections(): Section[] {
  try {
    const saved = localStorage.getItem(TODAY_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return defaultSections;
}

function GlowCard({
  children,
  glowColor = "hsl(174 72% 50%)",
  className = "",
}: {
  children: React.ReactNode;
  glowColor?: string;
  className?: string;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div
      className={`relative group rounded-2xl overflow-hidden ${className}`}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileHover={{ scale: 1.01, y: -2 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {/* Glass background */}
      <div className="absolute inset-0 rounded-2xl bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08]" />
      {/* Glow */}
      <motion.div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        animate={{
          opacity: hovered ? 1 : 0,
          boxShadow: hovered
            ? `0 0 40px -8px ${glowColor}55, inset 0 0 30px -15px ${glowColor}22`
            : "none",
        }}
        transition={{ duration: 0.3 }}
      />
      {/* Top border shimmer */}
      <div
        className="absolute top-0 left-0 right-0 h-px rounded-t-2xl opacity-40"
        style={{ background: `linear-gradient(90deg, transparent, ${glowColor}88, transparent)` }}
      />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}

function ProgressRing({ percent }: { percent: number }) {
  const r = 54;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percent / 100) * circ;
  return (
    <svg width="140" height="140" className="rotate-[-90deg]">
      <circle cx="70" cy="70" r={r} fill="none" stroke="hsl(174 72% 50% / 0.12)" strokeWidth="10" />
      <motion.circle
        cx="70"
        cy="70"
        r={r}
        fill="none"
        stroke="url(#tealGrad)"
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        style={{ filter: "drop-shadow(0 0 8px hsl(174 72% 50% / 0.8))" }}
      />
      <defs>
        <linearGradient id="tealGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="hsl(174 72% 50%)" />
          <stop offset="100%" stopColor="hsl(211 100% 60%)" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function TodayPage() {
  const [sections, setSections] = useState<Section[]>(loadSections);
  const { metrics } = useDashboardData();

  useEffect(() => {
    localStorage.setItem(TODAY_KEY, JSON.stringify(sections));
  }, [sections]);

  const totalItems = sections.reduce((a, s) => a + s.items.length, 0);
  const doneItems = sections.reduce((a, s) => a + s.items.filter((i) => i.done).length, 0);
  const percent = totalItems > 0 ? Math.round((doneItems / totalItems) * 100) : 0;

  const today = new Date().toLocaleDateString("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const toggle = (sectionIdx: number, itemId: string) => {
    setSections((prev) =>
      prev.map((s, si) =>
        si === sectionIdx
          ? { ...s, items: s.items.map((it) => (it.id === itemId ? { ...it, done: !it.done } : it)) }
          : s
      )
    );
  };

  // Latest metrics
  const latest = metrics?.[metrics.length - 1];
  const kpis = [
    { label: "Leads", value: latest?.leads_total ?? "–", icon: Users, color: "hsl(174 72% 50%)" },
    { label: "Termine", value: latest?.appointments ?? "–", icon: Target, color: "hsl(211 100% 60%)" },
    { label: "Deals", value: latest?.deals ?? "–", icon: Star, color: "hsl(280 70% 65%)" },
    { label: "Revenue", value: latest?.revenue ? `€${Number(latest.revenue).toLocaleString("de-DE")}` : "–", icon: TrendingUp, color: "hsl(142 71% 55%)" },
    { label: "Impressionen", value: latest?.impressions ? `${(Number(latest.impressions) / 1000).toFixed(1)}k` : "–", icon: Flame, color: "hsl(38 92% 60%)" },
    { label: "Follower", value: latest?.followers_current ?? "–", icon: MessageSquare, color: "hsl(174 72% 50%)" },
  ];

  return (
    <div className="min-h-screen relative overflow-auto">
      {/* Animated background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, hsl(174 72% 50%) 0%, transparent 70%)", filter: "blur(80px)" }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, hsl(211 100% 60%) 0%, transparent 70%)", filter: "blur(80px)" }} />
        <div className="absolute top-[40%] right-[20%] w-[300px] h-[300px] rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, hsl(280 70% 65%) 0%, transparent 70%)", filter: "blur(60px)" }} />
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <motion.div
          className="flex items-center justify-between"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <p className="text-muted-foreground text-sm font-medium tracking-wide uppercase">{today}</p>
            <h1 className="text-3xl font-bold text-foreground mt-1">
              Guten Morgen 👋
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {doneItems} von {totalItems} Aufgaben erledigt
            </p>
          </div>
          {/* Progress ring */}
          <div className="relative flex items-center justify-center">
            <ProgressRing percent={percent} />
            <div className="absolute flex flex-col items-center" style={{ transform: "rotate(90deg) translateX(0)" }}>
              <span className="text-2xl font-bold text-foreground" style={{ writingMode: "horizontal-tb" }}>
                {percent}%
              </span>
              <span className="text-[10px] text-muted-foreground" style={{ writingMode: "horizontal-tb" }}>Heute</span>
            </div>
          </div>
        </motion.div>

        {/* KPI Strip */}
        <motion.div
          className="grid grid-cols-3 md:grid-cols-6 gap-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {kpis.map((kpi, i) => (
            <GlowCard key={kpi.label} glowColor={kpi.color}>
              <div className="p-3 flex flex-col items-center gap-1">
                <kpi.icon className="h-4 w-4" style={{ color: kpi.color }} />
                <span className="text-lg font-bold text-foreground">{kpi.value}</span>
                <span className="text-[10px] text-muted-foreground">{kpi.label}</span>
              </div>
            </GlowCard>
          ))}
        </motion.div>

        {/* Checklist sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {sections.map((section, si) => {
            const sectionDone = section.items.filter((i) => i.done).length;
            const sectionTotal = section.items.length;
            const allDone = sectionDone === sectionTotal;

            return (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 + si * 0.08 }}
              >
                <GlowCard glowColor={section.color}>
                  <div className="p-5 space-y-4">
                    {/* Section header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{section.emoji}</span>
                        <span className="font-semibold text-foreground text-sm">{section.title}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {allDone && (
                          <motion.span
                            className="text-xs px-2 py-0.5 rounded-full font-medium"
                            style={{ background: `${section.color}22`, color: section.color }}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring" }}
                          >
                            ✓ Fertig!
                          </motion.span>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {sectionDone}/{sectionTotal}
                        </span>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: section.color, boxShadow: `0 0 8px ${section.color}88` }}
                        initial={{ width: 0 }}
                        animate={{ width: `${(sectionDone / sectionTotal) * 100}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>

                    {/* Items */}
                    <div className="space-y-2">
                      {section.items.map((item) => (
                        <motion.button
                          key={item.id}
                          onClick={() => toggle(si, item.id)}
                          className="w-full flex items-center gap-3 text-left group/item"
                          whileTap={{ scale: 0.98 }}
                        >
                          {/* Checkbox */}
                          <div
                            className="flex-shrink-0 w-5 h-5 rounded-md border flex items-center justify-center transition-all duration-200"
                            style={{
                              background: item.done ? section.color : "transparent",
                              borderColor: item.done ? section.color : "hsl(var(--border))",
                              boxShadow: item.done ? `0 0 10px ${section.color}66` : "none",
                            }}
                          >
                            <AnimatePresence>
                              {item.done && (
                                <motion.div
                                  initial={{ scale: 0, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  exit={{ scale: 0, opacity: 0 }}
                                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                                >
                                  <Check className="h-3 w-3 text-black" strokeWidth={3} />
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                          <span
                            className="text-sm transition-all duration-200"
                            style={{
                              color: item.done ? "hsl(var(--muted-foreground))" : "hsl(var(--foreground))",
                              textDecoration: item.done ? "line-through" : "none",
                              opacity: item.done ? 0.5 : 1,
                            }}
                          >
                            {item.label}
                          </span>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </GlowCard>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
