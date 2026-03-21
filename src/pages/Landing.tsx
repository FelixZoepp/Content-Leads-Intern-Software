import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight, BarChart3, TrendingUp, Users } from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();

  // Detect Supabase auth tokens in URL hash and redirect to set-password
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && (hash.includes("type=recovery") || hash.includes("type=invite") || hash.includes("type=signup"))) {
      navigate(`/set-password${hash}`, { replace: true });
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Ambient glow backgrounds */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-primary/8 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[100px] pointer-events-none" />

      <div className="relative container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-block px-4 py-1.5 glass rounded-full text-xs font-medium text-primary tracking-wide uppercase">
            Interne App für ContentLeads-Kunden
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-foreground tracking-tight leading-[1.1]">
            Dein LinkedIn-
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
              Cockpit
            </span>
          </h1>

          <p className="text-xl md:text-2xl font-medium text-foreground/80">
            Zahlen. Daten. Fakten. In Echtzeit.
          </p>

          <p className="text-base text-muted-foreground max-w-xl mx-auto">
            Ohne doppelte Pflege – nutzt dein bestehendes Google-Tracking-Sheet
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <Button
              size="lg"
              onClick={() => navigate("/auth")}
              className="text-base px-8 h-12 rounded-xl glow-primary"
            >
              Zum Dashboard
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-5 pt-20">
            {[
              {
                icon: BarChart3,
                title: "Alle KPIs in einem Bild",
                desc: "Leads → Termine → Abschlüsse → Umsatz visuell aufbereitet",
              },
              {
                icon: TrendingUp,
                title: "KI-Briefings",
                desc: "Automatische Performance-Analysen und konkrete Handlungsempfehlungen",
              },
              {
                icon: Users,
                title: "Admin-Overview",
                desc: "Wer performt, wer Hilfe braucht – auf einen Blick",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="glass-card rounded-2xl p-6 text-center transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mx-auto mb-4">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="pt-14 border-t border-border/40">
            <p className="text-xs text-muted-foreground">
              <strong className="text-foreground/70">Zugang nur mit Invite</strong> • Nutzt dein bestehendes Tracking-Sheet (Read-only) •
              CSAT/NPS-Reports integriert
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
