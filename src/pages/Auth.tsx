import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { TrendingUp } from "lucide-react";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      toast({ title: "Login fehlgeschlagen", description: error.message, variant: "destructive" });
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signUp(email, password);
    setLoading(false);
    if (error) {
      toast({ title: "Registrierung fehlgeschlagen", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Erfolgreich registriert", description: "Willkommen! Richten Sie jetzt Ihr Profil ein." });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background relative overflow-hidden p-4">
      {/* Ambient glow */}
      <div className="absolute top-[-30%] left-[20%] w-[50%] h-[50%] rounded-full bg-primary/8 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[100px] pointer-events-none" />

      <Card className="relative w-full max-w-md glass-card rounded-2xl border-border/50">
        <CardHeader className="space-y-1 text-center pb-2">
          <div className="flex items-center justify-center mb-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 glow-primary">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">ContentLeads</CardTitle>
          <CardDescription className="text-muted-foreground">
            LinkedIn Performance Dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-secondary/50 rounded-xl">
              <TabsTrigger value="signin" className="rounded-lg text-sm">Anmelden</TabsTrigger>
              <TabsTrigger value="signup" className="rounded-lg text-sm">Registrieren</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="signin-email" className="text-sm text-foreground/80">E-Mail</Label>
                  <Input id="signin-email" type="email" placeholder="ihre@email.de" value={email} onChange={(e) => setEmail(e.target.value)} required className="bg-secondary/40 border-border/50 rounded-xl h-11" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password" className="text-sm text-foreground/80">Passwort</Label>
                  <Input id="signin-password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required className="bg-secondary/40 border-border/50 rounded-xl h-11" />
                </div>
                <Button type="submit" className="w-full h-11 rounded-xl glow-primary" disabled={loading}>
                  {loading ? "Wird angemeldet..." : "Anmelden"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="text-sm text-foreground/80">E-Mail</Label>
                  <Input id="signup-email" type="email" placeholder="ihre@email.de" value={email} onChange={(e) => setEmail(e.target.value)} required className="bg-secondary/40 border-border/50 rounded-xl h-11" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="text-sm text-foreground/80">Passwort</Label>
                  <Input id="signup-password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="bg-secondary/40 border-border/50 rounded-xl h-11" />
                </div>
                <Button type="submit" className="w-full h-11 rounded-xl glow-primary" disabled={loading}>
                  {loading ? "Wird registriert..." : "Registrieren"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
