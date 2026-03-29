import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { InviteAdvisorDialog } from "@/components/admin/InviteAdvisorDialog";
import {
  LayoutDashboard,
  BarChart3,
  Phone,
  DollarSign,
  Brain,
  MessageSquare,
  FileText,
  LogOut,
  Bell,
  TrendingUp,
  Users,
  Sun,
  Webhook,
  Linkedin,
  Mail,
  Send,
  Megaphone,
  BookOpen,
  FileCheck,
  Mic,
  Handshake,
  CalendarDays,
  Settings,
  Map,
  Target,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";

const clientNavOverview = [
  { title: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { title: "Mein Fahrplan", icon: Map, path: "/dashboard/assets/fahrplan" },
];

const clientNavAssets = [
  { title: "Positionierung", icon: Target, path: "/dashboard/assets/positionierung" },
  { title: "LinkedIn Profil", icon: Linkedin, path: "/dashboard/assets/linkedin-profil" },
  { title: "Outreach DMs", icon: Send, path: "/dashboard/assets/outreach-dms" },
  { title: "Cold Mails", icon: Mail, path: "/dashboard/assets/cold-mails" },
  { title: "Mail-Sequenz", icon: Mail, path: "/dashboard/assets/mail-sequenz" },
  { title: "Funnel & Texte", icon: Megaphone, path: "/dashboard/assets/funnel" },
  { title: "LM 1 (ToFu)", icon: BookOpen, path: "/dashboard/assets/leadmagnet-1" },
  { title: "LM 2 (MoFu)", icon: FileCheck, path: "/dashboard/assets/leadmagnet-2" },
  { title: "LM 3 (BoFu)", icon: FileText, path: "/dashboard/assets/leadmagnet-3" },
  { title: "Opening-Skript", icon: Mic, path: "/dashboard/assets/opening-skript" },
  { title: "Setting-Skript", icon: Phone, path: "/dashboard/assets/setting-skript" },
  { title: "Closing-Skript", icon: Handshake, path: "/dashboard/assets/closing-skript" },
  { title: "LinkedIn Captions", icon: FileText, path: "/dashboard/assets/linkedin-captions" },
];

const clientNavTracking = [
  { title: "KPIs & Zahlen", icon: BarChart3, path: "/dashboard/kpis" },
  { title: "Content-Kalender", icon: CalendarDays, path: "/dashboard/calendar" },
];

const clientNavLegacy = [
  { title: "Übersicht", icon: TrendingUp, path: "/dashboard/overview" },
  { title: "Marketing", icon: BarChart3, path: "/dashboard/marketing" },
  { title: "Sales", icon: Phone, path: "/dashboard/sales" },
  { title: "Finanzen", icon: DollarSign, path: "/dashboard/finance" },
  { title: "KI-Briefing", icon: Brain, path: "/dashboard/ai" },
  { title: "Feedback", icon: MessageSquare, path: "/dashboard/csat" },
  { title: "Reports", icon: FileText, path: "/dashboard/reports" },
];

const adminNav = [
  { title: "Portfolio", icon: LayoutDashboard, path: "/dashboard" },
  
  { title: "Alerts", icon: Bell, path: "/dashboard/alerts" },
  { title: "CSAT/NPS", icon: MessageSquare, path: "/dashboard/csat" },
  { title: "Berater-Report", icon: Users, path: "/dashboard/advisor-report" },
  { title: "KI-Summary", icon: Brain, path: "/dashboard/ai-summary" },
  { title: "Webhooks", icon: Webhook, path: "/dashboard/webhooks" },
];

const advisorNav = [
  { title: "Meine Kunden", icon: LayoutDashboard, path: "/dashboard" },
  { title: "CSAT/NPS", icon: MessageSquare, path: "/dashboard/csat" },
];

function NavGroup({ label, items, isActive, navigate, collapsed }: {
  label: string;
  items: typeof adminNav;
  isActive: (path: string) => boolean;
  navigate: (path: string) => void;
  collapsed: boolean;
}) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-muted-foreground/60 px-4">
        {label}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.path}>
              <SidebarMenuButton
                isActive={isActive(item.path)}
                onClick={() => navigate(item.path)}
                tooltip={item.title}
                className={`mx-2 rounded-xl transition-all duration-300 ease-out ${
                  isActive(item.path)
                    ? "bg-[#534AB7]/15 text-[#534AB7] shadow-[inset_0_1px_0_0_hsl(0_0%_100%/0.08),0_0_12px_-3px_rgba(83,74,183,0.3)] scale-[1.02]"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50 hover:scale-[1.01]"
                }`}
              >
                <item.icon className={`h-[18px] w-[18px] transition-transform duration-300 ${
                  isActive(item.path) ? "scale-110" : ""
                }`} />
                <span className="text-[13px]">{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export function AppSidebar() {
  const { userRole } = useAuth();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => {
    if (path === "/dashboard") return location.pathname === "/dashboard";
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  const isAdminOrAdvisor = userRole === "admin" || userRole === "advisor";

  return (
    <Sidebar className="glass-sidebar border-r-0">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#534AB7]/15">
            <TrendingUp className="h-5 w-5 text-[#534AB7]" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-foreground tracking-tight">
                Cashflow OS
              </span>
              <span className="text-[11px] text-muted-foreground">
                {userRole === "admin" ? "Admin" : userRole === "advisor" ? "Berater" : "Dashboard"}
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarSeparator className="opacity-30" />

      <SidebarContent>
        {isAdminOrAdvisor ? (
          <NavGroup
            label="Navigation"
            items={userRole === "admin" ? adminNav : advisorNav}
            isActive={isActive}
            navigate={navigate}
            collapsed={collapsed}
          />
        ) : (
          <>
            <NavGroup label="Übersicht" items={clientNavOverview} isActive={isActive} navigate={navigate} collapsed={collapsed} />
            <NavGroup label="Assets" items={clientNavAssets} isActive={isActive} navigate={navigate} collapsed={collapsed} />
            <NavGroup label="Tracking" items={clientNavTracking} isActive={isActive} navigate={navigate} collapsed={collapsed} />
            <NavGroup label="Analytics" items={clientNavLegacy} isActive={isActive} navigate={navigate} collapsed={collapsed} />
          </>
        )}
      </SidebarContent>

      <SidebarSeparator className="opacity-30" />

      <SidebarFooter className="p-3 space-y-1">
        {userRole === "admin" && !collapsed && (
          <div className="mx-2">
            <InviteAdvisorDialog />
          </div>
        )}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => supabase.auth.signOut()}
              tooltip="Abmelden"
              className="mx-2 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut className="h-[18px] w-[18px]" />
              <span className="text-[13px]">Abmelden</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
