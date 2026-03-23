import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  TrendingUp,
  Users,
  Target,
  Zap,
  Shield,
  CheckCircle2,
  LineChart,
  Brain,
  UserCheck,
  Star,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const Landing = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash;
    const search = window.location.search;
    const combinedParams = `${search}${hash}`;

    if (
      combinedParams.includes("type=recovery") ||
      combinedParams.includes("type=invite") ||
      combinedParams.includes("type=signup") ||
      combinedParams.includes("access_token=")
    ) {
      navigate(`/set-password${hash || search}`, { replace: true });
    }
  }, [navigate]);

  const features = [
    {
      icon: BarChart3,
      title: "Echtzeit-KPI-Dashboard",
      desc: "Alle LinkedIn-Metriken auf einen Blick – Leads, Termine, Abschlüsse und Umsatz live verfolgen.",
    },
    {
      icon: Brain,
      title: "KI-gestützte Analysen",
      desc: "Automatische Performance-Briefings mit konkreten Handlungsempfehlungen für dein Wachstum.",
    },
    {
      icon: UserCheck,
      title: "Persönlicher Kundenberater",
      desc: "Dein dedizierter Berater sieht deine Zahlen in Echtzeit und unterstützt dich 1:1 bei der Optimierung.",
    },
    {
      icon: Target,
      title: "ICP-Analyse & Zielgruppe",
      desc: "Verstehe deine idealen Kunden – analysiert aus deinen letzten Deals für messbar bessere Ergebnisse.",
    },
    {
      icon: LineChart,
      title: "Sales & Marketing Tracking",
      desc: "Von der Impression bis zum Closing – jeder Schritt deiner Pipeline wird transparent erfasst.",
    },
    {
      icon: Shield,
      title: "Google-Sheet Integration",
      desc: "Keine doppelte Pflege. Dein bestehendes Tracking-Sheet wird automatisch synchronisiert.",
    },
  ];

  const stats = [
    { value: "100%", label: "Transparenz über alle KPIs" },
    { value: "1:1", label: "Persönliche Betreuung" },
    { value: "24/7", label: "Echtzeit-Datenzugriff" },
    { value: "KI", label: "Automatisierte Insights" },
  ];

  const steps = [
    { num: "01", title: "Onboarding", desc: "Produkte, Zielgruppe & aktuelle Zahlen erfassen – in unter 10 Minuten." },
    { num: "02", title: "Tracking starten", desc: "Dein Google-Sheet wird verknüpft, KPIs fließen automatisch ins Dashboard." },
    { num: "03", title: "Berater zuweisen", desc: "Dein persönlicher Berater erhält Zugriff und startet die 1:1 Betreuung." },
    { num: "04", title: "Wachsen", desc: "KI-Briefings, Alerts und Optimierungsvorschläge treiben deine Performance." },
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Ambient backgrounds */}
      <div className="absolute top-[-30%] left-[-15%] w-[70%] h-[70%] rounded-full bg-primary/6 blur-[160px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-primary/4 blur-[120px] pointer-events-none" />
      <div className="absolute top-[40%] right-[-5%] w-[30%] h-[30%] rounded-full bg-chart-2/5 blur-[100px] pointer-events-none" />

      {/* Navigation */}
      <nav className="relative z-10 border-b border-border/40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Zap className="h-4 w-4 text-primary" />
            </div>
            <span className="text-lg font-bold text-foreground tracking-tight">ContentLeads</span>
          </div>
          <Button onClick={() => navigate("/auth")} variant="outline" className="rounded-xl">
            Login
            <ArrowRight className="ml-1.5 h-4 w-4" />
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-20 pb-24 md:pt-32 md:pb-36">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial="hidden"
              animate="visible"
              custom={0}
              variants={fadeUp}
              className="inline-flex items-center gap-2 px-4 py-1.5 glass rounded-full text-xs font-medium text-primary tracking-wide uppercase mb-8"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              Exklusiv für ContentLeads-Kunden
            </motion.div>

            <motion.h1
              initial="hidden"
              animate="visible"
              custom={1}
              variants={fadeUp}
              className="text-4xl sm:text-5xl md:text-7xl font-bold text-foreground tracking-tight leading-[1.08] mb-6"
            >
              Dein persönliches
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-chart-2 to-primary/70">
                Performance-Cockpit
              </span>
            </motion.h1>

            <motion.p
              initial="hidden"
              animate="visible"
              custom={2}
              variants={fadeUp}
              className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-4"
            >
              Alle LinkedIn-KPIs in Echtzeit. KI-gestützte Analysen.
              Persönliche 1:1 Betreuung durch deinen Kundenberater.
            </motion.p>

            <motion.p
              initial="hidden"
              animate="visible"
              custom={3}
              variants={fadeUp}
              className="text-sm text-muted-foreground/70 mb-10"
            >
              Ohne doppelte Pflege – nutzt dein bestehendes Google-Tracking-Sheet
            </motion.p>

            <motion.div
              initial="hidden"
              animate="visible"
              custom={4}
              variants={fadeUp}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button
                size="lg"
                onClick={() => navigate("/auth")}
                className="text-base px-10 h-13 rounded-xl glow-primary text-primary-foreground"
              >
                Zum Dashboard
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="relative border-y border-border/40 bg-card/30 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
                variants={fadeUp}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold text-primary mb-1">{s.value}</div>
                <div className="text-sm text-muted-foreground">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="relative py-24 md:py-32">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={0}
            variants={fadeUp}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Alles was du brauchst,
              <br className="hidden sm:block" />
              <span className="text-primary"> an einem Ort</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Vom ersten Kontakt bis zum Abschluss – jede Kennzahl wird erfasst,
              analysiert und in Wachstum verwandelt.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
                variants={fadeUp}
                className="glass-card rounded-2xl p-6 group"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 mb-4 group-hover:bg-primary/15 transition-colors">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="relative py-24 md:py-32 border-t border-border/40">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={0}
            variants={fadeUp}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              In 4 Schritten <span className="text-primary">startklar</span>
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Vom Onboarding bis zur ersten KI-Analyse in unter 15 Minuten.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
                variants={fadeUp}
                className="relative"
              >
                <div className="glass-card rounded-2xl p-6 h-full">
                  <span className="text-4xl font-black text-primary/15 absolute top-4 right-5">{step.num}</span>
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <span className="text-sm font-bold text-primary">{step.num}</span>
                  </div>
                  <h3 className="text-base font-semibold text-foreground mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits / checklist */}
      <section className="relative py-24 md:py-32 border-t border-border/40">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={0}
              variants={fadeUp}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Warum Kunden <span className="text-primary">schneller wachsen</span>
              </h2>
              <p className="text-muted-foreground mb-8">
                Transparenz schafft Klarheit. Klarheit schafft Ergebnisse.
                Mit deinem persönlichen Berater und KI-gestützten Insights
                erkennst du Engpässe bevor sie entstehen.
              </p>
              <Button
                size="lg"
                onClick={() => navigate("/auth")}
                className="rounded-xl glow-primary text-primary-foreground"
              >
                Jetzt starten
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={1}
              variants={fadeUp}
              className="space-y-4"
            >
              {[
                "Alle KPIs in Echtzeit – kein manuelles Reporting",
                "Persönlicher 1:1 Kundenberater mit Dashboard-Zugriff",
                "KI-Briefings mit konkreten Handlungsempfehlungen",
                "Automatische Alerts bei Performance-Einbrüchen",
                "ICP-Analyse für bessere Zielgruppenansprache",
                "Google-Sheet Sync – keine doppelte Datenpflege",
                "CSAT & NPS Umfragen direkt integriert",
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 glass-card rounded-xl p-4">
                  <CheckCircle2 className="h-5 w-5 text-success mt-0.5 shrink-0" />
                  <span className="text-sm text-foreground/90 font-medium">{item}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonial / Social proof */}
      <section className="relative py-24 md:py-32 border-t border-border/40">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={0}
            variants={fadeUp}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="flex justify-center gap-1 mb-6">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 text-chart-3 fill-chart-3" />
              ))}
            </div>
            <blockquote className="text-xl md:text-2xl font-medium text-foreground/90 leading-relaxed mb-6">
              „Endlich sehe ich auf einen Blick, wo wir stehen – und mein Berater kann sofort reagieren.
              Das spart uns locker 5 Stunden pro Woche an Abstimmung."
            </blockquote>
            <div className="text-muted-foreground text-sm">
              <span className="text-foreground font-medium">— ContentLeads Kunde</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-24 md:py-32 border-t border-border/40">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={0}
            variants={fadeUp}
            className="max-w-2xl mx-auto text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Bereit für volle <span className="text-primary">Transparenz</span>?
            </h2>
            <p className="text-muted-foreground mb-8">
              Zugang nur mit Einladung. Melde dich an und starte mit deinem persönlichen Dashboard.
            </p>
            <Button
              size="lg"
              onClick={() => navigate("/auth")}
              className="text-base px-10 h-13 rounded-xl glow-primary text-primary-foreground"
            >
              Zum Dashboard
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-md bg-primary/10 flex items-center justify-center">
                <Zap className="h-3 w-3 text-primary" />
              </div>
              <span className="font-medium text-foreground/70">ContentLeads</span>
            </div>
            <p>
              Zugang nur mit Invite • Read-only Sheet-Sync • CSAT/NPS integriert
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
