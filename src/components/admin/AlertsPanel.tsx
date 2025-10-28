import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Props {
  alerts: any[];
  onResolve: () => void;
}

export function AlertsPanel({ alerts, onResolve }: Props) {
  const { toast } = useToast();

  const resolveAlert = async (alertId: number) => {
    try {
      const { error } = await supabase
        .from("alerts")
        .update({ resolved_at: new Date().toISOString() })
        .eq("id", alertId);

      if (error) throw error;

      toast({
        title: "Alert gelöst",
        description: "Der Alert wurde als gelöst markiert",
      });

      onResolve();
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (alerts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Keine offenen Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Alle Kunden performen im Zielbereich. Keine Handlung erforderlich.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          Offene Alerts ({alerts.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.map(alert => (
          <div
            key={alert.id}
            className="flex items-start justify-between p-3 border rounded-lg"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant={alert.severity === 'high' ? 'destructive' : 'secondary'}>
                  {alert.severity}
                </Badge>
                <span className="font-medium">{alert.tenants.company_name}</span>
              </div>
              <p className="text-sm text-muted-foreground">{alert.message}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {new Date(alert.created_at).toLocaleString('de-DE')}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => resolveAlert(alert.id)}
            >
              Erledigt
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
