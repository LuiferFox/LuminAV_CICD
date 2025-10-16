// src/App.tsx
import React from "react";
import { Routes, Route, Navigate, useLocation, BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AuthPage } from "@/pages/AuthPage";
import { MainApp } from "@/pages/MainApp";
import NotFound from "@/pages/NotFound";

import { Dashboard } from "@/components/dashboard/Dashboard";
import { DeviceManager } from "@/components/devices/DeviceManager";
import { ReadingsManager } from "@/components/readings/ReadingsManager";
import { RecommendationsManager } from "@/components/recommendations/RecommendationsManager";
import { TariffManager } from "@/components/tariffs/TariffManager";
import { ExportManager } from "@/components/export/ExportManager";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) return <Navigate to="/auth" state={{ from: location }} replace />;
  return children;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />

          <BrowserRouter>
            <Routes>
              {/* PÚBLICA */}
              <Route path="/auth" element={<AuthPage />} />

              {/* PRIVADAS */}
              <Route
                element={
                  <ProtectedRoute>
                    <MainApp />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="devices" element={<DeviceManager />} />
                <Route path="readings" element={<ReadingsManager />} />
                <Route path="recommendations" element={<RecommendationsManager />} />
                <Route path="tariffs" element={<TariffManager />} />
                <Route path="export" element={<ExportManager />} />
              </Route>

              {/* CATCH-ALL */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
