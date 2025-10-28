import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ProfileSetup from "@/components/onboarding/ProfileSetup";

export default function Onboarding() {
  const navigate = useNavigate();

  const handleProfileComplete = () => {
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Willkommen bei ContentLeads</CardTitle>
          <CardDescription>
            Erstelle dein Firmenprofil und starte mit deinem Dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileSetup onComplete={handleProfileComplete} />
        </CardContent>
      </Card>
    </div>
  );
}
