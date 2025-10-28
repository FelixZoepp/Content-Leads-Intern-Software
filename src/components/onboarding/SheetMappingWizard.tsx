import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, Loader2, ArrowLeft } from "lucide-react";

interface SheetMappingWizardProps {
  tenantId: string;
  headers: string[];
  onComplete: () => void;
  onBack: () => void;
}

const REQUIRED_FIELDS = [
  { key: "date", label: "Datum", suggestions: ["datum", "date", "tag"] },
  { key: "posts", label: "Posts", suggestions: ["posts", "beiträge", "anzahl_posts"] },
  { key: "impressions", label: "Impressions", suggestions: ["impressions", "reichweite", "views"] },
  { key: "likes", label: "Likes", suggestions: ["likes", "gefällt_mir"] },
  { key: "comments", label: "Kommentare", suggestions: ["comments", "kommentare"] },
  { key: "new_followers", label: "Neue Follower", suggestions: ["neue_follower", "new_followers", "follower"] },
  { key: "leads_total", label: "Leads Total", suggestions: ["leads_total", "leads", "leads_gesamt"] },
  { key: "leads_qualified", label: "Qualifizierte Leads", suggestions: ["leads_qualified", "leads_qualifiziert", "qualifizierte_leads"] },
  { key: "appointments", label: "Termine", suggestions: ["appointments", "termine"] },
  { key: "deals", label: "Deals", suggestions: ["deals", "abschlüsse", "verkäufe"] },
  { key: "revenue", label: "Umsatz", suggestions: ["revenue", "umsatz", "erlös"] },
];

export default function SheetMappingWizard({ tenantId, headers, onComplete, onBack }: SheetMappingWizardProps) {
  const [mapping, setMapping] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    REQUIRED_FIELDS.forEach(field => {
      const matchIndex = headers.findIndex(h => 
        field.suggestions.some(s => h.toLowerCase().includes(s))
      );
      if (matchIndex !== -1) {
        initial[field.key] = matchIndex;
      }
    });
    return initial;
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    setLoading(true);

    try {
      // Verify date field is mapped
      if (mapping.date === undefined) {
        throw new Error("Bitte ordne mindestens das Datum-Feld zu");
      }

      const { error } = await supabase
        .from("tenants")
        .update({ sheet_mapping: mapping })
        .eq("id", tenantId);

      if (error) throw error;

      // Trigger initial sync
      const { error: syncError } = await supabase.functions.invoke("sync-sheet", {
        body: { tenantId },
      });

      if (syncError) {
        console.error("Sync error:", syncError);
        toast({
          title: "Warnung",
          description: "Mapping gespeichert, aber erster Sync fehlgeschlagen. Versuche es im Dashboard nochmal.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Setup abgeschlossen!",
          description: "Dein Dashboard ist jetzt bereit.",
        });
      }

      onComplete();
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Ordne die Spalten aus deinem Sheet den entsprechenden Feldern zu. 
          Wir haben bereits passende Zuordnungen vorgeschlagen.
        </AlertDescription>
      </Alert>

      <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
        {REQUIRED_FIELDS.map(field => (
          <div key={field.key} className="space-y-1">
            <Label>{field.label}</Label>
            <Select
              value={mapping[field.key]?.toString()}
              onValueChange={(value) => setMapping({ ...mapping, [field.key]: parseInt(value) })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Spalte wählen..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="-1">Nicht zuordnen</SelectItem>
                {headers.map((header, index) => (
                  <SelectItem key={index} value={index.toString()}>
                    {header}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Zurück
        </Button>
        <Button onClick={handleSave} disabled={loading} className="flex-1">
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Speichern & Dashboard öffnen
        </Button>
      </div>
    </div>
  );
}
