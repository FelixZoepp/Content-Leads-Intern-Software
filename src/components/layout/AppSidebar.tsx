import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  LayoutDashboard,
  BarChart3,
  Phone,
  Package,
  DollarSign,
  Brain,
  MessageSquare,
  FileText,
  Settings,
  LogOut,
  Users,
  Bell,
  TrendingUp,
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

const clientNav = [
  { title: "Übersicht", icon: LayoutDashboard, id: "overview" },
  { title: "Marketing", icon: BarChart3, id: "marketing" },
  { title: "Sales", icon: Phone, id: "sales" },
  { title: "Fulfillment", icon: Package, id: "fulfillment" },
  { title: "Finanzen", icon: DollarSign, id: "finance" },
  { title: "KI-Briefing", icon: Brain, id: "ai" },
  { title: "CSAT/NPS", icon: MessageSquare, id: "csat" },
  { title: "Reports", icon: FileText, id: "reports" },
];

const adminNav = [
  { title: "Portfolio", icon: LayoutDashboard, id: "portfolio" },
  { title: "Marketing", icon: BarChart3, id: "marketing" },
  { title: "Sales", icon: Phone, id: "sales" },
  { title: "Fulfillment", icon: Package, id: "fulfillment" },
  { title: "Finanzen", icon: DollarSign, id: "finance" },
  { title: "Alerts", icon: Bell, id: "alerts" },
  { title: "KI-Summary", icon: Brain, id: "ai-summary" },
  { title: "CSAT/NPS", icon: MessageSquare, id: "csat" },
];

interface Props {
  activeSection?: string;
  onNavigate?: (section: string) => void;
}

export function AppSidebar({ activeSection, onNavigate }: Props) {
  const { userRole, user } = useAuth();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const nav = userRole === "admin" ? adminNav : clientNav;

  return (
    <Sidebar className="glass-sidebar border-r-0">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 glow-primary">
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-foreground tracking-tight">
                ContentLeads
              </span>
              <span className="text-[11px] text-muted-foreground">
                {userRole === "admin" ? "Admin" : "Dashboard"}
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarSeparator className="opacity-30" />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-muted-foreground/60 px-4">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {nav.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    isActive={activeSection === item.id}
                    onClick={() => onNavigate?.(item.id)}
                    tooltip={item.title}
                    className={`mx-2 rounded-xl transition-all duration-300 ease-out ${
                      activeSection === item.id
                        ? "bg-primary/15 text-primary shadow-[inset_0_1px_0_0_hsl(0_0%_100%/0.08),0_0_12px_-3px_hsl(211_100%_55%/0.3)] scale-[1.02]"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/50 hover:scale-[1.01]"
                    }`}
                  >
                    <item.icon className={`h-[18px] w-[18px] transition-transform duration-300 ${
                      activeSection === item.id ? "scale-110" : ""
                    }`} />
                    <span className="text-[13px]">{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarSeparator className="opacity-30" />

      <SidebarFooter className="p-3">
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
