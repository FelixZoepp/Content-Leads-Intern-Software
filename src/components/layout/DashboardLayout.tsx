import { ReactNode, useCallback } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { useScrollSpy } from "@/hooks/useScrollSpy";

interface Props {
  children: ReactNode;
  sectionIds?: string[];
  activeSection?: string;
  onNavigate?: (section: string) => void;
  title?: string;
  subtitle?: string;
}

export function DashboardLayout({ children, sectionIds = [], activeSection, onNavigate, title, subtitle }: Props) {
  const { activeId, setActiveId, containerRef } = useScrollSpy(sectionIds);

  const currentActive = sectionIds.length > 0 ? activeId : activeSection;

  const handleNavigate = useCallback((section: string) => {
    // If parent handles navigation, call it
    onNavigate?.(section);

    // Also do the scroll ourselves for scroll-spy mode
    const container = document.getElementById("dashboard-scroll-area");
    const target = container?.querySelector(`[data-section="${section}"]`) as HTMLElement;
    if (target && container) {
      const offset = target.offsetTop - container.offsetTop;
      container.scrollTo({ top: offset, behavior: "smooth" });
      setActiveId(section);
    }
  }, [onNavigate, setActiveId]);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar activeSection={currentActive} onNavigate={handleNavigate} />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="sticky top-0 z-20 glass border-b border-border/50 px-6 py-3 flex items-center gap-4">
            <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
            {title && (
              <div className="flex flex-col">
                <h1 className="text-lg font-semibold text-foreground tracking-tight">{title}</h1>
                {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
              </div>
            )}
          </header>
          <main
            id="dashboard-scroll-area"
            ref={containerRef}
            className="flex-1 overflow-y-auto p-6 scroll-smooth"
          >
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
