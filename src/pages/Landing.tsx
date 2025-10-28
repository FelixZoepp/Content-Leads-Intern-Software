import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight, BarChart3, TrendingUp, Users } from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background">
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-block px-4 py-2 bg-primary/10 rounded-full text-sm font-medium text-primary mb-4">
            Interne App für ContentLeads-Kunden
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
            Dein LinkedIn-Cockpit
          </h1>
          
          <p className="text-2xl md:text-3xl font-semibold">
            Zahlen. Daten. Fakten. In Echtzeit.
          </p>

          <p className="text-xl text-muted-foreground">
            Ohne doppelte Pflege – nutzt dein bestehendes Google-Tracking-Sheet
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Button 
              size="lg" 
              onClick={() => navigate("/auth")}
              className="text-lg"
            >
              Zum Dashboard
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-6 pt-16">
            <div className="p-6 rounded-lg bg-card border">
              <BarChart3 className="h-10 w-10 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Alle KPIs in einem Bild</h3>
              <p className="text-muted-foreground">
                Leads → Termine → Abschlüsse → Umsatz visuell aufbereitet
              </p>
            </div>
            
            <div className="p-6 rounded-lg bg-card border">
              <TrendingUp className="h-10 w-10 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">KI-Briefings</h3>
              <p className="text-muted-foreground">
                Automatische Performance-Analysen und konkrete Handlungsempfehlungen
              </p>
            </div>
            
            <div className="p-6 rounded-lg bg-card border">
              <Users className="h-10 w-10 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Admin-Overview</h3>
              <p className="text-muted-foreground">
                Wer performt, wer Hilfe braucht – auf einen Blick
              </p>
            </div>
          </div>

          <div className="pt-12 border-t">
            <p className="text-sm text-muted-foreground">
              <strong>Zugang nur mit Invite</strong> • Nutzt dein bestehendes Tracking-Sheet (Read-only) • 
              CSAT/NPS-Reports integriert
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
