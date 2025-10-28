import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { LogOut, User, TrendingUp } from "lucide-react";
import { Profile } from "@/pages/Dashboard";

interface DashboardHeaderProps {
  profile: Profile | null;
  onProfileUpdate: () => void;
}

export const DashboardHeader = ({ profile, onProfileUpdate }: DashboardHeaderProps) => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [companyName, setCompanyName] = useState(profile?.company_name || "");
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [linkedinUrl, setLinkedinUrl] = useState(profile?.linkedin_url || "");
  const [loading, setLoading] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    const profileData = {
      user_id: user.id,
      company_name: companyName,
      full_name: fullName,
      linkedin_url: linkedinUrl,
    };

    const { error } = profile
      ? await supabase.from("profiles").update(profileData).eq("user_id", user.id)
      : await supabase.from("profiles").insert(profileData);

    setLoading(false);

    if (error) {
      toast({
        title: "Fehler",
        description: "Profil konnte nicht gespeichert werden",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Erfolg",
        description: "Profil wurde gespeichert",
      });
      setOpen(false);
      onProfileUpdate();
    }
  };

  return (
    <header className="border-b bg-card shadow-sm">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-3">
          <TrendingUp className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">LinkedIn Performance</h1>
            {profile && (
              <p className="text-sm text-muted-foreground">
                {profile.full_name} {profile.company_name && `• ${profile.company_name}`}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <User className="mr-2 h-4 w-4" />
                Profil
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Profil bearbeiten</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Vollständiger Name</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Max Mustermann"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyName">Firma</Label>
                  <Input
                    id="companyName"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Meine Firma GmbH"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="linkedinUrl">LinkedIn Profil-URL</Label>
                  <Input
                    id="linkedinUrl"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    placeholder="https://linkedin.com/in/maxmustermann"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Wird gespeichert..." : "Speichern"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          <Button variant="outline" size="sm" onClick={signOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Abmelden
          </Button>
        </div>
      </div>
    </header>
  );
};
