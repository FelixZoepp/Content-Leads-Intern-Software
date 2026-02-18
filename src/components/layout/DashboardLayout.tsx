import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Menu } from "lucide-react";

interface Props {
  children: ReactNode;
  activeSection?: string;
  onNavigate?: (section: string) => void;
  title?: string;
  subtitle?: string;
}

export function DashboardLayout({ children, activeSection, onNavigate, title, subtitle }: Props) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar activeSection={activeSection} onNavigate={onNavigate} />
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top bar */}
          <header className="sticky top-0 z-20 glass border-b border-border/50 px-6 py-3 flex items-center gap-4">
            <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
            {title && (
              <div className="flex flex-col">
                <h1 className="text-lg font-semibold text-foreground tracking-tight">{title}</h1>
                {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
              </div>
            )}
          </header>
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
