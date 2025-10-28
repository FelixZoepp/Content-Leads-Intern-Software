import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";

interface KPIEntryFormProps {
  onEntryAdded: () => void;
}

export const KPIEntryForm = ({ onEntryAdded }: KPIEntryFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    week_start_date: new Date().toISOString().split("T")[0],
    leads_generated: 0,
    qualified_leads: 0,
    appointments_scheduled: 0,
    sales_closed: 0,
    revenue: 0,
    posts_count: 0,
    impressions: 0,
    engagement_rate: 0,
    new_followers: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    const { error } = await supabase.from("kpi_entries").upsert({
      user_id: user.id,
      ...formData,
    });

    setLoading(false);

    if (error) {
      toast({
        title: "Fehler",
        description: "KPI-Eintrag konnte nicht gespeichert werden",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Erfolg",
        description: "KPI-Eintrag wurde gespeichert",
      });
      onEntryAdded();
      setFormData({
        week_start_date: new Date().toISOString().split("T")[0],
        leads_generated: 0,
        qualified_leads: 0,
        appointments_scheduled: 0,
        sales_closed: 0,
        revenue: 0,
        posts_count: 0,
        impressions: 0,
        engagement_rate: 0,
        new_followers: 0,
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Neue KPI-Daten eintragen
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="week_start_date">Wochenbeginn</Label>
              <Input
                id="week_start_date"
                type="date"
                value={formData.week_start_date}
                onChange={(e) => setFormData({ ...formData, week_start_date: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="leads_generated">Leads generiert</Label>
              <Input
                id="leads_generated"
                type="number"
                min="0"
                value={formData.leads_generated}
                onChange={(e) => setFormData({ ...formData, leads_generated: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="qualified_leads">Qualifizierte Leads</Label>
              <Input
                id="qualified_leads"
                type="number"
                min="0"
                value={formData.qualified_leads}
                onChange={(e) => setFormData({ ...formData, qualified_leads: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="appointments_scheduled">Termine vereinbart</Label>
              <Input
                id="appointments_scheduled"
                type="number"
                min="0"
                value={formData.appointments_scheduled}
                onChange={(e) => setFormData({ ...formData, appointments_scheduled: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sales_closed">Abgeschlossene Verkäufe</Label>
              <Input
                id="sales_closed"
                type="number"
                min="0"
                value={formData.sales_closed}
                onChange={(e) => setFormData({ ...formData, sales_closed: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="revenue">Umsatz (€)</Label>
              <Input
                id="revenue"
                type="number"
                min="0"
                step="0.01"
                value={formData.revenue}
                onChange={(e) => setFormData({ ...formData, revenue: parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="posts_count">Anzahl Posts</Label>
              <Input
                id="posts_count"
                type="number"
                min="0"
                value={formData.posts_count}
                onChange={(e) => setFormData({ ...formData, posts_count: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="impressions">Impressionen</Label>
              <Input
                id="impressions"
                type="number"
                min="0"
                value={formData.impressions}
                onChange={(e) => setFormData({ ...formData, impressions: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="engagement_rate">Engagement-Rate (%)</Label>
              <Input
                id="engagement_rate"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={formData.engagement_rate}
                onChange={(e) => setFormData({ ...formData, engagement_rate: parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new_followers">Neue Follower</Label>
              <Input
                id="new_followers"
                type="number"
                min="0"
                value={formData.new_followers}
                onChange={(e) => setFormData({ ...formData, new_followers: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Wird gespeichert..." : "KPI-Daten speichern"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
