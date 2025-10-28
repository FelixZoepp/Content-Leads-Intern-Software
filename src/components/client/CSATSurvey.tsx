import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Props {
  tenantId: string;
}

export function CSATSurvey({ tenantId }: Props) {
  const { toast } = useToast();
  const [csat, setCSAT] = useState<number | null>(null);
  const [nps, setNPS] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!csat || nps === null) {
      toast({
        title: "Fehlende Angaben",
        description: "Bitte bewerte sowohl CSAT als auch NPS",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from("csat_responses").insert({
        tenant_id: tenantId,
        csat_1_5: csat,
        nps_0_10: nps,
        comment: comment || null,
      });

      if (error) throw error;

      toast({
        title: "Feedback gespeichert",
        description: "Vielen Dank für deine Rückmeldung!",
      });

      setCSAT(null);
      setNPS(null);
      setComment("");
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message,
        variant: "destructive",
      });
    }
    setSubmitting(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Feedback & Zufriedenheit</CardTitle>
        <CardDescription>
          Hilf uns, deine ContentLeads-Experience zu verbessern
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>CSAT: Wie zufrieden bist du mit ContentLeads? (1-5)</Label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map(value => (
              <Button
                key={value}
                variant={csat === value ? "default" : "outline"}
                onClick={() => setCSAT(value)}
                className="w-12"
              >
                {value}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>NPS: Würdest du ContentLeads weiterempfehlen? (0-10)</Label>
          <div className="flex gap-2 flex-wrap">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(value => (
              <Button
                key={value}
                variant={nps === value ? "default" : "outline"}
                onClick={() => setNPS(value)}
                className="w-10"
                size="sm"
              >
                {value}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Kommentar (optional)</Label>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Was läuft gut? Was können wir verbessern?"
            rows={3}
          />
        </div>

        <Button onClick={handleSubmit} disabled={submitting}>
          Feedback absenden
        </Button>
      </CardContent>
    </Card>
  );
}
