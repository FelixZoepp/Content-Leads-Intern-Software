import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

interface ProfileSetupProps {
  onComplete: () => void;
}

export default function ProfileSetup({ onComplete }: ProfileSetupProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "",
    contactName: "",
    linkedinUrl: "",
  });
  const { toast } = useToast();
  const { refreshTenant } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Nicht authentifiziert");

      // Check if tenant already exists
      const { data: existingTenant } = await supabase
        .from("tenants")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (existingTenant) {
        // Tenant exists, just refresh and navigate
        await refreshTenant();
        toast({
          title: "Profil geladen",
          description: "Dein Dashboard wird geöffnet...",
        });
        onComplete();
        return;
      }

      // Create new tenant
      const { data, error } = await supabase
        .from("tenants")
        .insert({
          user_id: user.id,
          company_name: formData.companyName,
          contact_name: formData.contactName,
          linkedin_url: formData.linkedinUrl,
        })
        .select()
        .single();

      if (error) throw error;

      // Refresh tenant data in auth context
      await refreshTenant();

      toast({
        title: "Profil erstellt",
        description: "Dein Dashboard wird geladen...",
      });

      // Small delay to ensure tenant is set
      setTimeout(() => {
        onComplete();
      }, 500);
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="companyName">Firmenname *</Label>
        <Input
          id="companyName"
          value={formData.companyName}
          onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
          required
          placeholder="ContentLeads GmbH"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="contactName">Ansprechpartner</Label>
        <Input
          id="contactName"
          value={formData.contactName}
          onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
          placeholder="Max Mustermann"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="linkedinUrl">LinkedIn-Profil-URL (optional)</Label>
        <Input
          id="linkedinUrl"
          type="url"
          value={formData.linkedinUrl}
          onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
          placeholder="https://linkedin.com/in/..."
        />
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Weiter
      </Button>
    </form>
  );
}
