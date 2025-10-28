import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { KPICards } from "@/components/dashboard/KPICards";
import { PerformanceCharts } from "@/components/dashboard/PerformanceCharts";
import { KPIEntryForm } from "@/components/dashboard/KPIEntryForm";
import { useToast } from "@/hooks/use-toast";

export interface Profile {
  id: string;
  user_id: string;
  company_name: string | null;
  full_name: string | null;
  linkedin_url: string | null;
  profile_image_url: string | null;
}

export interface KPIEntry {
  id: string;
  user_id: string;
  week_start_date: string;
  leads_generated: number;
  qualified_leads: number;
  appointments_scheduled: number;
  sales_closed: number;
  revenue: number;
  posts_count: number;
  impressions: number;
  engagement_rate: number;
  new_followers: number;
}

const Dashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [kpiEntries, setKpiEntries] = useState<KPIEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadProfile();
      loadKPIEntries();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.error("Error loading profile:", error);
      toast({
        title: "Fehler",
        description: "Profil konnte nicht geladen werden",
        variant: "destructive",
      });
    } else {
      setProfile(data);
    }
    setLoading(false);
  };

  const loadKPIEntries = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("kpi_entries")
      .select("*")
      .eq("user_id", user.id)
      .order("week_start_date", { ascending: false });

    if (error) {
      console.error("Error loading KPI entries:", error);
    } else {
      setKpiEntries(data || []);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader profile={profile} onProfileUpdate={loadProfile} />
      
      <main className="container mx-auto px-4 py-8 space-y-8">
        {!profile ? (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground mb-4">
              Bitte vervollständigen Sie zuerst Ihr Profil
            </p>
          </div>
        ) : (
          <>
            <KPICards entries={kpiEntries} />
            <PerformanceCharts entries={kpiEntries} />
            <KPIEntryForm onEntryAdded={loadKPIEntries} />
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
