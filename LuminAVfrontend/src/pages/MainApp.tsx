// src/pages/MainApp.tsx
import React, { useMemo, useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

type TabKey =
  | "dashboard"
  | "devices"
  | "readings"
  | "recommendations"
  | "tariffs"
  | "export";

function pathToTab(pathname: string): TabKey {
  const seg = pathname.replace(/^\/+/, "").split("/")[0] || "dashboard";
  const known: TabKey[] = ["dashboard", "devices", "readings", "recommendations", "tariffs", "export"];
  return (known.includes(seg as TabKey) ? (seg as TabKey) : "dashboard");
}

export const MainApp: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const activeTab = useMemo<TabKey>(() => pathToTab(location.pathname), [location.pathname]);

  const handleTabChange = (tab: string) => {
    navigate(`/${(tab || "dashboard") as TabKey}`);
    if (isMobile) setSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile Sidebar Overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 w-64 transition-transform duration-300 ease-in-out lg:translate-x-0",
          isMobile ? (sidebarOpen ? "translate-x-0" : "-translate-x-full") : ""
        )}
      >
        <Sidebar activeTab={activeTab} onTabChange={handleTabChange} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        {isMobile && (
          <div className="lg:hidden flex items-center justify-between p-4 border-b border-border bg-card">
            <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <h1 className="text-lg font-semibold">LuminAV</h1>
            <div className="w-9" />
          </div>
        )}

        {/* Content Area */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            {/* Aquí se renderizan las páginas hijas según la ruta */}
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
export default MainApp; 