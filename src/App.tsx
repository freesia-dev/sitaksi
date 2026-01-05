import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { TaksasiProvider } from "@/context/TaksasiContext";
import { AppLayout } from "@/components/layout/AppLayout";

import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import TaksasiTanah from "@/pages/forms/TaksasiTanah";
import TaksasiTanahBangunan from "@/pages/forms/TaksasiTanahBangunan";
import TaksasiKendaraan from "@/pages/forms/TaksasiKendaraan";
import Riwayat from "@/pages/Riwayat";
import Otorisasi from "@/pages/Otorisasi";
import AdminUsers from "@/pages/AdminUsers";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <TaksasiProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route element={<AppLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/taksasi/tanah" element={<TaksasiTanah />} />
                <Route path="/taksasi/tanah-bangunan" element={<TaksasiTanahBangunan />} />
                <Route path="/taksasi/kendaraan" element={<TaksasiKendaraan />} />
                <Route path="/riwayat" element={<Riwayat />} />
                <Route path="/otorisasi" element={<Otorisasi />} />
                <Route path="/admin/users" element={<AdminUsers />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TaksasiProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
