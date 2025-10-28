import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import ProfileSetup from "@/components/onboarding/ProfileSetup";
import SheetConnect from "@/components/onboarding/SheetConnect";
import SheetMappingWizard from "@/components/onboarding/SheetMappingWizard";

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [sheetHeaders, setSheetHeaders] = useState<string[]>([]);
  const navigate = useNavigate();

  const totalSteps = 3;
  const progress = (step / totalSteps) * 100;

  const handleProfileComplete = (id: string) => {
    setTenantId(id);
    setStep(2);
  };

  const handleSheetConnected = (headers: string[]) => {
    setSheetHeaders(headers);
    setStep(3);
  };

  const handleMappingComplete = () => {
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Willkommen bei ContentLeads</CardTitle>
          <CardDescription>
            Schritt {step} von {totalSteps}: Dein Dashboard in wenigen Minuten einrichten
          </CardDescription>
          <Progress value={progress} className="mt-4" />
        </CardHeader>
        <CardContent>
          {step === 1 && <ProfileSetup onComplete={handleProfileComplete} />}
          {step === 2 && tenantId && (
            <SheetConnect 
              tenantId={tenantId} 
              onComplete={handleSheetConnected}
              onBack={() => setStep(1)}
            />
          )}
          {step === 3 && tenantId && (
            <SheetMappingWizard
              tenantId={tenantId}
              headers={sheetHeaders}
              onComplete={handleMappingComplete}
              onBack={() => setStep(2)}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
