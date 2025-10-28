import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, Loader2, ArrowLeft } from "lucide-react";

interface SheetConnectProps {
  tenantId: string;
  onComplete: (headers: string[]) => void;
  onBack: () => void;
}

export default function SheetConnect({ tenantId, onComplete, onBack }: SheetConnectProps) {
  const [sheetUrl, setSheetUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Extract sheet ID from URL
      const sheetIdMatch = sheetUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
      if (!sheetIdMatch) {
        throw new Error("Ungültige Google Sheets URL");
      }
      const sheetId = sheetIdMatch[1];
      const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;

      // Try to fetch the sheet
      const response = await fetch(csvUrl);
      if (!response.ok) {
        throw new Error("Zugriff auf Sheet fehlgeschlagen. Bitte stelle sicher, dass das Sheet mit 'Jeder mit dem Link - Betrachter' freigegeben ist.");
      }

      const csvText = await response.text();
      const rows = csvText.split('\n');
      if (rows.length < 1) {
        throw new Error("Sheet ist leer");
      }

      const headers = rows[0].split(',').map(h => h.trim().replace(/"/g, ''));

      // Save sheet URL to tenant
      const { error } = await supabase
        .from("tenants")
        .update({ sheet_url: sheetUrl })
        .eq("id", tenantId);

      if (error) throw error;

      toast({
        title: "Sheet verbunden",
        description: `${headers.length} Spalten gefunden`,
      });

      onComplete(headers);
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
    <form onSubmit={handleConnect} className="space-y-4">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>So verbindest du dein Tracking-Sheet:</strong>
          <ol className="list-decimal ml-4 mt-2 space-y-1 text-sm">
            <li>Öffne dein Google-Sheet → <strong>Freigeben</strong></li>
            <li>Wähle <strong>"Jeder mit dem Link - Betrachter"</strong></li>
            <li>Kopiere den Link und füge ihn hier ein</li>
          </ol>
        </AlertDescription>
      </Alert>

      <div className="space-y-2">
        <Label htmlFor="sheetUrl">Google Sheet Link *</Label>
        <Input
          id="sheetUrl"
          type="url"
          value={sheetUrl}
          onChange={(e) => setSheetUrl(e.target.value)}
          required
          placeholder="https://docs.google.com/spreadsheets/d/..."
        />
      </div>

      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Zurück
        </Button>
        <Button type="submit" disabled={loading} className="flex-1">
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Verbinden & Weiter
        </Button>
      </div>
    </form>
  );
}
