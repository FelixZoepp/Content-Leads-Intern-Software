import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { TenantDetailSheet } from "./TenantDetailSheet";

interface Props {
  alerts: any[];
  tenants?: any[];
  onResolve: () => void;
}

export function AlertsPanel({ alerts, tenants = [], onResolve }: Props) {
  const { toast } = useToast();
  const [selectedTenant, setSelectedTenant] = useState<any | null>(null);

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

  const openTenant = (tenantId: string) => {
    const tenant = tenants.find(t => t.id === tenantId);
    if (tenant) {
      setSelectedTenant(tenant);
    }
  };

  if (alerts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-success" />
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
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Offene Alerts ({alerts.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {alerts.map(alert => (
            <div
              key={alert.id}
              className="flex items-start justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={alert.severity === 'high' ? 'destructive' : 'secondary'}>
                    {alert.severity}
                  </Badge>
                  <button
                    onClick={() => openTenant(alert.tenant_id)}
                    className="font-medium text-primary hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    {alert.tenants?.company_name || "Unbekannt"}
                    <ExternalLink className="h-3 w-3" />
                  </button>
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

      <TenantDetailSheet
        tenant={selectedTenant}
        open={!!selectedTenant}
        onClose={() => setSelectedTenant(null)}
      />
    </>
  );
}
