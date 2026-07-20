import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { TaksasiProvider } from "@/context/TaksasiContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { Loader2 } from "lucide-react";

// Lazy load all pages for code splitting
const Login = lazy(() => import("@/pages/Login"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const TaksasiTanah = lazy(() => import("@/pages/forms/TaksasiTanah"));
const TaksasiTanahBangunan = lazy(() => import("@/pages/forms/TaksasiTanahBangunan"));
const TaksasiKendaraan = lazy(() => import("@/pages/forms/TaksasiKendaraan"));
const EditTaksasiTanah = lazy(() => import("@/pages/forms/EditTaksasiTanah"));
const EditTaksasiTanahBangunan = lazy(() => import("@/pages/forms/EditTaksasiTanahBangunan"));
const EditTaksasiKendaraan = lazy(() => import("@/pages/forms/EditTaksasiKendaraan"));
const TaksasiTanahList = lazy(() => import("@/pages/lists/TaksasiTanahList"));
const TaksasiTanahBangunanList = lazy(() => import("@/pages/lists/TaksasiTanahBangunanList"));
const TaksasiKendaraanList = lazy(() => import("@/pages/lists/TaksasiKendaraanList"));
const Riwayat = lazy(() => import("@/pages/Riwayat"));

const AdminUsers = lazy(() => import("@/pages/AdminUsers"));
const Profile = lazy(() => import("@/pages/Profile"));
const DetailTaksasi = lazy(() => import("@/pages/DetailTaksasi"));
const About = lazy(() => import("@/pages/About"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const MonitoringList = lazy(() => import("@/pages/monitoring/MonitoringList"));
const MonitoringForm = lazy(() => import("@/pages/monitoring/MonitoringForm"));
const MonitoringDetail = lazy(() => import("@/pages/monitoring/MonitoringDetail"));
const MonitoringJadwal = lazy(() => import("@/pages/monitoring/MonitoringJadwal"));
const MonitoringDashboard = lazy(() => import("@/pages/monitoring/MonitoringDashboard"));
const SubrogasiList = lazy(() => import("@/pages/laporan-rko/SubrogasiList"));
const SubrogasiForm = lazy(() => import("@/pages/laporan-rko/SubrogasiForm"));
const PlNplList = lazy(() => import("@/pages/laporan-rko/PlNplList"));
const PlNplForm = lazy(() => import("@/pages/laporan-rko/PlNplForm"));
const NplExistingList = lazy(() => import("@/pages/laporan-rko/NplExistingList"));

// Optimized QueryClient with caching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="flex flex-col items-center gap-3">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">Memuat...</p>
    </div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider delayDuration={0}>
      <AuthProvider>
        <TaksasiProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route element={<AppLayout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  {/* List pages */}
                  <Route path="/list/tanah" element={<TaksasiTanahList />} />
                  <Route path="/list/tanah-bangunan" element={<TaksasiTanahBangunanList />} />
                  <Route path="/list/kendaraan" element={<TaksasiKendaraanList />} />
                  {/* Form pages */}
                  <Route path="/taksasi/tanah/new" element={<TaksasiTanah />} />
                  <Route path="/taksasi/tanah-bangunan/new" element={<TaksasiTanahBangunan />} />
                  <Route path="/taksasi/kendaraan/new" element={<TaksasiKendaraan />} />
                  <Route path="/taksasi/tanah/edit/:id" element={<EditTaksasiTanah />} />
                  <Route path="/taksasi/tanah-bangunan/edit/:id" element={<EditTaksasiTanahBangunan />} />
                  <Route path="/taksasi/kendaraan/edit/:id" element={<EditTaksasiKendaraan />} />
                  <Route path="/riwayat" element={<Riwayat />} />
                  
                  <Route path="/admin/users" element={<AdminUsers />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/taksasi/:id" element={<DetailTaksasi />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/monitoring" element={<MonitoringList />} />
                  <Route path="/monitoring/new" element={<MonitoringForm />} />
                  <Route path="/monitoring/edit/:id" element={<MonitoringForm />} />
                  <Route path="/monitoring/jadwal" element={<MonitoringJadwal />} />
                  <Route path="/monitoring/dashboard" element={<MonitoringDashboard />} />
                  <Route path="/monitoring/:id" element={<MonitoringDetail />} />
                  <Route path="/laporan-rko/subrogasi" element={<SubrogasiList />} />
                  <Route path="/laporan-rko/subrogasi/new" element={<SubrogasiForm />} />
                  <Route path="/laporan-rko/subrogasi/edit/:id" element={<SubrogasiForm />} />
                  <Route path="/laporan-rko/pl-to-npl" element={<PlNplList />} />
                  <Route path="/laporan-rko/pl-to-npl/new" element={<PlNplForm />} />
                  <Route path="/laporan-rko/pl-to-npl/edit/:id" element={<PlNplForm />} />
                  <Route path="/laporan-rko/npl-existing" element={<NplExistingList />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TaksasiProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
