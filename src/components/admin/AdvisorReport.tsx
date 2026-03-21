import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, Users, TrendingUp, Download, FileText } from "lucide-react";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { de } from "date-fns/locale";

interface AdvisorData {
  user_id: string;
  full_name: string | null;
  tenants: { id: string; company_name: string }[];
  csatAvg: number;
  npsAvg: number;
  csatCount: number;
}

export function AdvisorReport() {
  const [loading, setLoading] = useState(true);
  const [advisorData, setAdvisorData] = useState<AdvisorData[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(() => format(new Date(), "yyyy-MM"));

  const monthOptions = useMemo(() => {
    const options = [];
    for (let i = 0; i < 12; i++) {
      const d = subMonths(new Date(), i);
      options.push({ value: format(d, "yyyy-MM"), label: format(d, "MMMM yyyy", { locale: de }) });
    }
    return options;
  }, []);

  useEffect(() => {
    loadReport();
  }, [selectedMonth]);

  const loadReport = async () => {
    setLoading(true);

    // Get advisors
    const { data: roles } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "advisor");

    if (!roles?.length) {
      setAdvisorData([]);
      setLoading(false);
      return;
    }

    const userIds = roles.map(r => r.user_id);

    // Get profiles
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, full_name")
      .in("user_id", userIds);

    // Get tenants with advisor assignment
    const { data: tenants } = await supabase
      .from("tenants")
      .select("id, company_name, advisor_id")
      .in("advisor_id", userIds);

    // Get CSAT for the selected month
    const monthStart = startOfMonth(new Date(selectedMonth + "-01"));
    const monthEnd = endOfMonth(monthStart);

    const { data: csatData } = await supabase
      .from("csat_responses")
      .select("tenant_id, csat_1_5, nps_0_10")
      .gte("created_at", monthStart.toISOString())
      .lte("created_at", monthEnd.toISOString());

    // Map advisor data
    const result: AdvisorData[] = (profiles || []).map(profile => {
      const advisorTenants = (tenants || []).filter(t => t.advisor_id === profile.user_id);
      const tenantIds = advisorTenants.map(t => t.id);
      const advisorCsat = (csatData || []).filter(c => tenantIds.includes(c.tenant_id));

      const csatScores = advisorCsat.filter(c => c.csat_1_5 != null).map(c => c.csat_1_5!);
      const npsScores = advisorCsat.filter(c => c.nps_0_10 != null).map(c => c.nps_0_10!);

      return {
        user_id: profile.user_id,
        full_name: profile.full_name,
        tenants: advisorTenants.map(t => ({ id: t.id, company_name: t.company_name })),
        csatAvg: csatScores.length ? csatScores.reduce((a, b) => a + b, 0) / csatScores.length : 0,
        npsAvg: npsScores.length ? npsScores.reduce((a, b) => a + b, 0) / npsScores.length : 0,
        csatCount: advisorCsat.length,
      };
    });

    // Sort by CSAT avg descending
    result.sort((a, b) => b.csatAvg - a.csatAvg);
    setAdvisorData(result);
    setLoading(false);
  };

  const exportPDF = () => {
    // Generate simple text-based report for print/PDF
    const monthLabel = monthOptions.find(m => m.value === selectedMonth)?.label || selectedMonth;
    let content = `CSAT-Bericht pro Berater — ${monthLabel}\n${"=".repeat(50)}\n\n`;

    advisorData.forEach((a, i) => {
      content += `${i + 1}. ${a.full_name || "Unbekannt"}\n`;
      content += `   CSAT Ø: ${a.csatAvg ? a.csatAvg.toFixed(1) : "–"} / 5\n`;
      content += `   NPS Ø: ${a.npsAvg ? a.npsAvg.toFixed(0) : "–"}\n`;
      content += `   Bewertungen: ${a.csatCount}\n`;
      content += `   Kunden (${a.tenants.length}): ${a.tenants.map(t => t.company_name).join(", ") || "–"}\n\n`;
    });

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `berater-report-${selectedMonth}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getCsatColor = (score: number) => {
    if (score >= 4) return "text-green-400";
    if (score >= 3) return "text-yellow-400";
    if (score > 0) return "text-red-400";
    return "text-muted-foreground";
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="glass-card">
            <CardContent className="p-6"><Skeleton className="h-20 w-full" /></CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {monthOptions.map(m => (
                <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" size="sm" onClick={exportPDF} className="gap-1.5">
          <Download className="h-3.5 w-3.5" />
          Report exportieren
        </Button>
      </div>

      {advisorData.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="p-8 text-center text-muted-foreground">
            <Users className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p>Noch keine Berater angelegt.</p>
            <p className="text-sm mt-1">Lade Berater ein und weise ihnen Kunden zu.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {advisorData.map((advisor, idx) => (
            <Card key={advisor.user_id} className="glass-card hover:border-primary/20 transition-colors">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary font-bold text-lg">
                      {idx + 1}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {advisor.full_name || "Unbenannt"}
                      </h3>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <Badge variant="secondary" className="text-xs gap-1">
                          <Users className="h-3 w-3" />
                          {advisor.tenants.length} Kunden
                        </Badge>
                        <Badge variant="outline" className="text-xs gap-1">
                          <FileText className="h-3 w-3" />
                          {advisor.csatCount} Bewertungen
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-right">
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">CSAT Ø</p>
                      <p className={`text-2xl font-bold ${getCsatColor(advisor.csatAvg)}`}>
                        {advisor.csatAvg ? advisor.csatAvg.toFixed(1) : "–"}
                        <span className="text-sm text-muted-foreground font-normal"> / 5</span>
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">NPS Ø</p>
                      <p className={`text-2xl font-bold ${advisor.npsAvg >= 7 ? "text-green-400" : advisor.npsAvg >= 5 ? "text-yellow-400" : advisor.npsAvg > 0 ? "text-red-400" : "text-muted-foreground"}`}>
                        {advisor.npsAvg ? advisor.npsAvg.toFixed(0) : "–"}
                      </p>
                    </div>
                  </div>
                </div>

                {advisor.tenants.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-border/30">
                    <p className="text-xs text-muted-foreground mb-1.5">Zugewiesene Kunden:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {advisor.tenants.map(t => (
                        <Badge key={t.id} variant="outline" className="text-xs">
                          {t.company_name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
