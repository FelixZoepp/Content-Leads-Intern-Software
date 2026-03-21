import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Flame, Target, TrendingUp, Users, MessageSquare, Star, BarChart3, Phone, LayoutDashboard } from "lucide-react";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useNavigate } from "react-router-dom";
import { SectionCards } from "@/components/today/SectionCards";
import { DailyChecklist } from "@/components/today/DailyChecklist";
import { ProgressRing } from "@/components/today/ProgressRing";
import { SurveyEngine } from "@/components/client/SurveyEngine";
import { supabase } from "@/integrations/supabase/client";

const TODAY_KEY = `checklist_${new Date().toISOString().slice(0, 10)}`;

export type ChecklistItem = { id: string; label: string; done: boolean };
export type Section = {
  title: string;
  emoji: string;
  color: string;
  path: string;
  pathLabel: string;
  icon: React.ElementType;
  items: ChecklistItem[];
};

const defaultSections: Section[] = [
  {
    title: "Marketing",
    emoji: "📣",
    color: "hsl(25 90% 55%)",
    path: "/dashboard/marketing",
    pathLabel: "Marketing eintragen",
    icon: BarChart3,
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
    color: "hsl(0 85% 55%)",
    path: "/dashboard/sales",
    pathLabel: "Sales eintragen",
    icon: Phone,
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
    color: "hsl(15 80% 50%)",
    path: "/dashboard/sales",
    pathLabel: "Calls eintragen",
    icon: Phone,
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
    color: "hsl(38 92% 55%)",
    path: "/dashboard/overview",
    pathLabel: "KPIs eintragen",
    icon: LayoutDashboard,
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
    if (saved) {
      const parsed = JSON.parse(saved);
      return defaultSections.map((section) => {
        const savedSection = parsed.find((s: any) => s.title === section.title);
        if (!savedSection) return section;
        return {
          ...section,
          items: section.items.map((item) => {
            const savedItem = savedSection.items?.find((i: any) => i.id === item.id);
            return savedItem ? { ...item, done: savedItem.done } : item;
          }),
        };
      });
    }
  } catch {}
  return defaultSections;
}

export default function TodayPage() {
  const [sections, setSections] = useState<Section[]>(loadSections);
  const { metrics } = useDashboardData();
  const navigate = useNavigate();

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

  // Latest metrics for KPI strip
  const latest = metrics?.[metrics.length - 1];
  const kpis = [
    { label: "Leads", value: latest?.leads_total ?? "–", icon: Users, color: "hsl(0 85% 55%)" },
    { label: "Termine", value: latest?.appointments ?? "–", icon: Target, color: "hsl(25 90% 55%)" },
    { label: "Deals", value: latest?.deals ?? "–", icon: Star, color: "hsl(15 80% 50%)" },
    { label: "Revenue", value: latest?.revenue ? `€${Number(latest.revenue).toLocaleString("de-DE")}` : "–", icon: TrendingUp, color: "hsl(38 92% 55%)" },
    { label: "Impressionen", value: latest?.impressions ? `${(Number(latest.impressions) / 1000).toFixed(1)}k` : "–", icon: Flame, color: "hsl(0 70% 50%)" },
    { label: "Follower", value: latest?.followers_current ?? "–", icon: MessageSquare, color: "hsl(10 75% 52%)" },
  ];

  return (
    <div className="min-h-screen relative overflow-auto">
      {/* Animated background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, hsl(0 85% 45%) 0%, transparent 70%)", filter: "blur(80px)" }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, hsl(25 90% 50%) 0%, transparent 70%)", filter: "blur(80px)" }} />
        <div className="absolute top-[40%] right-[20%] w-[300px] h-[300px] rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, hsl(0 70% 50%) 0%, transparent 70%)", filter: "blur(60px)" }} />
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-10">
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
          <div className="relative flex items-center justify-center">
            <ProgressRing percent={percent} />
            <div className="absolute flex flex-col items-center" style={{ transform: "rotate(90deg)" }}>
              <span className="text-2xl font-bold text-foreground" style={{ writingMode: "horizontal-tb" }}>{percent}%</span>
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
          {kpis.map((kpi) => (
            <motion.div
              key={kpi.label}
              className="rounded-2xl glass-card p-3 flex flex-col items-center gap-1 cursor-default"
              whileHover={{ scale: 1.04, y: -2 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <kpi.icon className="h-4 w-4" style={{ color: kpi.color }} />
              <span className="text-lg font-bold text-foreground">{kpi.value}</span>
              <span className="text-[10px] text-muted-foreground">{kpi.label}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Section Navigation Cards */}
        <div>
          <motion.h2
            className="text-xl font-bold text-foreground mb-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Deine Bereiche
          </motion.h2>
          <SectionCards />
        </div>

        {/* Daily Checklist */}
        <div>
          <motion.h2
            className="text-xl font-bold text-foreground mb-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Tages-Checklist ✓
          </motion.h2>
          <DailyChecklist sections={sections} onToggle={toggle} navigate={navigate} />
        </div>
      </div>
    </div>
  );
}
