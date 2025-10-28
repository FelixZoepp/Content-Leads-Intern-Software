import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Save } from "lucide-react";

interface KPIEntryFormProps {
  tenantId: string;
  onEntryAdded: () => void;
}

export const KPIEntryForm = ({ tenantId, onEntryAdded }: KPIEntryFormProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    entry_date: new Date().toISOString().split("T")[0],
    posts: 0,
    impressions: 0,
    likes: 0,
    comments: 0,
    link_clicks: 0,
    followers: 0,
    words_spoken: 0,
    leads_total: 0,
    leads_qualified: 0,
    appointments: 0,
    settings: 0,
    closings: 0,
    show_upgrades: 0,
    deals: 0,
    open_deals: 0,
    revenue: 0,
    avg_revenue_per_customer: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    const { error } = await supabase.from("kpi_entries").upsert(
      {
        tenant_id: tenantId,
        ...formData,
      } as any,
      {
        onConflict: 'tenant_id,entry_date'
      }
    );

    setLoading(false);

    if (error) {
      console.error("KPI entry error:", error);
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
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          KPI-Daten für {new Date(formData.entry_date).toLocaleDateString('de-DE')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="entry_date">Datum *</Label>
            <Input
              id="entry_date"
              type="date"
              max={new Date().toISOString().split("T")[0]}
              value={formData.entry_date}
              onChange={(e) => setFormData({ ...formData, entry_date: e.target.value })}
              required
            />
          </div>

          {/* LinkedIn Metriken */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">LinkedIn Metriken</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="posts">Posts</Label>
                <Input
                  id="posts"
                  type="number"
                  min="0"
                  inputMode="numeric"
                  value={formData.posts}
                  onChange={(e) => setFormData({ ...formData, posts: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="impressions">Impressionen</Label>
                <Input
                  id="impressions"
                  type="number"
                  min="0"
                  inputMode="numeric"
                  value={formData.impressions}
                  onChange={(e) => setFormData({ ...formData, impressions: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="likes">Likes</Label>
                <Input
                  id="likes"
                  type="number"
                  min="0"
                  inputMode="numeric"
                  value={formData.likes}
                  onChange={(e) => setFormData({ ...formData, likes: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="comments">Kommentare</Label>
                <Input
                  id="comments"
                  type="number"
                  min="0"
                  inputMode="numeric"
                  value={formData.comments}
                  onChange={(e) => setFormData({ ...formData, comments: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="link_clicks">Link-Klicks</Label>
                <Input
                  id="link_clicks"
                  type="number"
                  min="0"
                  inputMode="numeric"
                  value={formData.link_clicks}
                  onChange={(e) => setFormData({ ...formData, link_clicks: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="followers">Follower (aktuell)</Label>
                <Input
                  id="followers"
                  type="number"
                  min="0"
                  inputMode="numeric"
                  value={formData.followers}
                  onChange={(e) => setFormData({ ...formData, followers: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
          </div>

          {/* Lead & Sales Funnel */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Lead & Sales Funnel</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="leads_total">Leads Total</Label>
                <Input
                  id="leads_total"
                  type="number"
                  min="0"
                  inputMode="numeric"
                  value={formData.leads_total}
                  onChange={(e) => setFormData({ ...formData, leads_total: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="leads_qualified">Qualifizierte Leads</Label>
                <Input
                  id="leads_qualified"
                  type="number"
                  min="0"
                  inputMode="numeric"
                  value={formData.leads_qualified}
                  onChange={(e) => setFormData({ ...formData, leads_qualified: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="appointments">Termine</Label>
                <Input
                  id="appointments"
                  type="number"
                  min="0"
                  inputMode="numeric"
                  value={formData.appointments}
                  onChange={(e) => setFormData({ ...formData, appointments: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="settings">Settings</Label>
                <Input
                  id="settings"
                  type="number"
                  min="0"
                  inputMode="numeric"
                  value={formData.settings}
                  onChange={(e) => setFormData({ ...formData, settings: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="closings">Closings</Label>
                <Input
                  id="closings"
                  type="number"
                  min="0"
                  inputMode="numeric"
                  value={formData.closings}
                  onChange={(e) => setFormData({ ...formData, closings: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="show_upgrades">Show Upgrades</Label>
                <Input
                  id="show_upgrades"
                  type="number"
                  min="0"
                  inputMode="numeric"
                  value={formData.show_upgrades}
                  onChange={(e) => setFormData({ ...formData, show_upgrades: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="deals">Abgeschlossene Deals</Label>
                <Input
                  id="deals"
                  type="number"
                  min="0"
                  inputMode="numeric"
                  value={formData.deals}
                  onChange={(e) => setFormData({ ...formData, deals: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="open_deals">Offene Deals</Label>
                <Input
                  id="open_deals"
                  type="number"
                  min="0"
                  inputMode="numeric"
                  value={formData.open_deals}
                  onChange={(e) => setFormData({ ...formData, open_deals: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
          </div>

          {/* Umsatz & Aktivität */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Umsatz & Aktivität</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="revenue">Umsatz (€)</Label>
                <Input
                  id="revenue"
                  type="number"
                  min="0"
                  step="0.01"
                  inputMode="decimal"
                  value={formData.revenue}
                  onChange={(e) => setFormData({ ...formData, revenue: parseFloat(e.target.value) || 0 })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="avg_revenue_per_customer">Ø Umsatz pro Kunde (€)</Label>
                <Input
                  id="avg_revenue_per_customer"
                  type="number"
                  min="0"
                  step="0.01"
                  inputMode="decimal"
                  value={formData.avg_revenue_per_customer}
                  onChange={(e) => setFormData({ ...formData, avg_revenue_per_customer: parseFloat(e.target.value) || 0 })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="words_spoken">Geführte Worte</Label>
                <Input
                  id="words_spoken"
                  type="number"
                  min="0"
                  inputMode="numeric"
                  value={formData.words_spoken}
                  onChange={(e) => setFormData({ ...formData, words_spoken: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? "Wird gespeichert..." : "KPI-Daten speichern"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
