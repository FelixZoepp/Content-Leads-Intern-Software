import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Props {
  tenantId: string;
}

export function AIBriefing({ tenantId }: Props) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);

  const generateBriefing = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-summary", {
        body: { tenantId, scope: "client_weekly" },
      });

      if (error) throw error;

      if (data.error) {
        toast({
          title: "Fehler",
          description: data.error,
          variant: "destructive",
        });
        return;
      }

      setSummary(data.summary.summary_text);
      toast({
        title: "KI-Briefing erstellt",
        description: "Deine Performance-Analyse ist fertig",
      });
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message || "KI-Briefing konnte nicht erstellt werden",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          KI-Performance-Briefing
        </CardTitle>
        <CardDescription>
          Lass die KI deine Performance analysieren und konkrete Empfehlungen geben
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={generateBriefing} disabled={loading}>
          {loading ? "Wird erstellt..." : "KI-Update erstellen"}
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
