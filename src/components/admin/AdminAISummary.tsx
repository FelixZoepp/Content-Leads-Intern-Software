import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function AdminAISummary() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);

  const generatePortfolioSummary = async () => {
    setLoading(true);
    toast({
      title: "In Entwicklung",
      description: "Portfolio-KI-Briefing wird im nächsten Update verfügbar sein",
    });
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          KI-Portfolio-Briefing
        </CardTitle>
        <CardDescription>
          Lass die KI alle Kundenperformances analysieren und Prioritäten setzen
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={generatePortfolioSummary} disabled={loading}>
          {loading ? "Wird erstellt..." : "Portfolio-Briefing erstellen"}
        </Button>

        {summary && (
          <div className="prose prose-sm max-w-none bg-muted/50 p-4 rounded-lg whitespace-pre-wrap">
            {summary}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
