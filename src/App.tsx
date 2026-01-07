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
import EditTaksasiTanah from "@/pages/forms/EditTaksasiTanah";
import EditTaksasiTanahBangunan from "@/pages/forms/EditTaksasiTanahBangunan";
import EditTaksasiKendaraan from "@/pages/forms/EditTaksasiKendaraan";
import Riwayat from "@/pages/Riwayat";
import Otorisasi from "@/pages/Otorisasi";
import AdminUsers from "@/pages/AdminUsers";
import DetailTaksasi from "@/pages/DetailTaksasi";
import About from "@/pages/About";
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
                <Route path="/taksasi/tanah/edit/:id" element={<EditTaksasiTanah />} />
                <Route path="/taksasi/tanah-bangunan/edit/:id" element={<EditTaksasiTanahBangunan />} />
                <Route path="/taksasi/kendaraan/edit/:id" element={<EditTaksasiKendaraan />} />
                <Route path="/riwayat" element={<Riwayat />} />
                <Route path="/otorisasi" element={<Otorisasi />} />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/taksasi/:id" element={<DetailTaksasi />} />
                <Route path="/about" element={<About />} />
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
