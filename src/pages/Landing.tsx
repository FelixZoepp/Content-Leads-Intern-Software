import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, BarChart3, Target, Users, Calendar, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Landing = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: BarChart3,
      title: "Performance Tracking",
      description: "Tracken Sie alle wichtigen LinkedIn-Metriken an einem Ort",
    },
    {
      icon: Target,
      title: "Zielverfolgung",
      description: "Setzen und verfolgen Sie Ihre Leads-, Termin- und Umsatzziele",
    },
    {
      icon: Users,
      title: "Lead Management",
      description: "Behalten Sie den Überblick über generierte und qualifizierte Leads",
    },
    {
      icon: Calendar,
      title: "Wochenübersicht",
      description: "Analysieren Sie Ihre Performance in Wochen- und Monatsübersichten",
    },
    {
      icon: TrendingUp,
      title: "Wachstumsanalyse",
      description: "Visualisieren Sie Ihr Wachstum mit detaillierten Charts und Grafiken",
    },
    {
      icon: DollarSign,
      title: "Umsatz-Tracking",
      description: "Berechnen Sie Konversionsraten und verfolgen Sie Ihren ROI",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-light via-background to-background">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="flex flex-col items-center text-center space-y-8">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-12 w-12 text-primary" />
            <TrendingUp className="h-12 w-12 text-success" />
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground max-w-4xl">
            Steigern Sie Ihren LinkedIn-Erfolg mit{" "}
            <span className="bg-gradient-to-r from-primary to-success bg-clip-text text-transparent">
              Performance Tracking
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
            Tracken Sie Ihre LinkedIn-Performance, analysieren Sie Ihre Leads und steigern Sie 
            Ihren Umsatz mit unserem professionellen Dashboard.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" onClick={() => navigate("/auth")} className="text-lg px-8">
              Jetzt starten
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/auth")} className="text-lg px-8">
              Mehr erfahren
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Alles, was Sie brauchen
          </h2>
          <p className="text-lg text-muted-foreground">
            Professionelles Tracking für maximalen LinkedIn-Erfolg
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <Icon className="h-10 w-10 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <Card className="bg-gradient-to-r from-primary to-primary-hover text-primary-foreground">
          <CardContent className="p-8 md:p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Bereit, Ihre LinkedIn-Performance zu maximieren?
            </h2>
            <p className="text-lg mb-8 opacity-90">
              Starten Sie jetzt kostenlos und tracken Sie Ihren Erfolg
            </p>
            <Button 
              size="lg" 
              variant="secondary" 
              onClick={() => navigate("/auth")}
              className="text-lg px-8"
            >
              Kostenlos registrieren
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t mt-16">
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
          <p>© 2025 LinkedIn Performance Dashboard. Alle Rechte vorbehalten.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
