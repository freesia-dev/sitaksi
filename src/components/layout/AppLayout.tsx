import React, { useState, lazy, Suspense } from 'react';
import { Outlet, Navigate, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { ClipboardCheck, FolderOpen, LayoutDashboard, Loader2, Menu, Plus } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Sidebar } from './Sidebar';
import { SessionTimeoutDialog } from './SessionTimeoutDialog';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { JENIS } from '@/lib/jenisAgunan';
import logoSitaksiOnly from '@/assets/logo-sitaksi-only.png';

const PendingApproval = lazy(() => import('@/pages/PendingApproval'));

const Memuat = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

export function AppLayout() {
  const { isAuthenticated, isApproved, isLoading, user } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [menuTerbuka, setMenuTerbuka] = useState(false);
  const [pilihJenis, setPilihJenis] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  if (isLoading) return <Memuat />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (!isApproved) {
    return (
      <Suspense fallback={<Memuat />}>
        <PendingApproval />
      </Suspense>
    );
  }

  const bisaBuatTaksasi = user?.role === 'Officer' || user?.role === 'Admin';
  const aktif = (awalan: string) => location.pathname === awalan || location.pathname.startsWith(`${awalan}/`);

  const itemBawah = (to: string, label: string, Ikon: React.ElementType, awalan = to) => (
    <NavLink
      to={to}
      className={cn(
        'flex flex-1 flex-col items-center justify-center gap-0.5 py-1.5 text-[11px] font-medium',
        aktif(awalan) ? 'text-primary' : 'text-muted-foreground',
      )}
    >
      <Ikon size={20} />
      {label}
    </NavLink>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Layar lebar: sidebar tetap */}
      <Sidebar isCollapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      {/* HP: bilah atas */}
      <header className="md:hidden sticky top-0 z-30 flex items-center gap-3 border-b bg-card/95 px-4 py-2.5 backdrop-blur">
        <img src={logoSitaksiOnly} alt="" className="h-8 w-8 object-contain" />
        <span className="flex-1 font-bold tracking-tight text-primary">SITAKSI</span>
        <span className="max-w-[40%] truncate text-xs text-muted-foreground">{user?.nama}</span>
      </header>

      <main
        className={cn(
          'min-h-screen transition-all duration-300 px-4 pt-4 pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:p-6',
          sidebarCollapsed ? 'md:ml-20' : 'md:ml-64',
        )}
      >
        <div className="max-w-7xl mx-auto animate-fade-in">
          <Outlet />
        </div>
      </main>

      {/* HP: navigasi bawah */}
      <nav
        aria-label="Navigasi utama"
        className="md:hidden fixed inset-x-0 bottom-0 z-30 flex items-stretch border-t bg-card/95 backdrop-blur pb-[env(safe-area-inset-bottom)]"
      >
        {itemBawah('/dashboard', 'Beranda', LayoutDashboard)}
        {itemBawah('/taksasi', 'Taksasi', FolderOpen)}
        {bisaBuatTaksasi && (
          <div className="flex flex-1 items-start justify-center">
            <button
              type="button"
              onClick={() => setPilihJenis(true)}
              aria-label="Taksasi baru"
              className="-mt-5 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-elevated active:scale-95"
            >
              <Plus size={26} />
            </button>
          </div>
        )}
        {itemBawah('/monitoring', 'Kunjungan', ClipboardCheck)}
        <button
          type="button"
          onClick={() => setMenuTerbuka(true)}
          className="flex flex-1 flex-col items-center justify-center gap-0.5 py-1.5 text-[11px] font-medium text-muted-foreground"
        >
          <Menu size={20} />
          Menu
        </button>
      </nav>

      {/* HP: menu lengkap */}
      <Sheet open={menuTerbuka} onOpenChange={setMenuTerbuka}>
        <SheetContent side="left" className="w-[85vw] max-w-xs p-0 border-0 [&>button]:text-sidebar-foreground [&>button]:opacity-90">
          <SheetHeader className="sr-only">
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>
          <Sidebar isCollapsed={false} onToggle={() => undefined} variant="panel" onNavigate={() => setMenuTerbuka(false)} />
        </SheetContent>
      </Sheet>

      {/* HP: pilih jenis taksasi baru */}
      <Sheet open={pilihJenis} onOpenChange={setPilihJenis}>
        <SheetContent side="bottom" className="rounded-t-2xl pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
          <SheetHeader>
            <SheetTitle>Taksasi baru</SheetTitle>
          </SheetHeader>
          <div className="mt-4 grid gap-2">
            {JENIS.map((j) => (
              <button
                key={j.kode}
                type="button"
                onClick={() => {
                  setPilihJenis(false);
                  navigate(j.baru);
                }}
                className="flex items-center gap-3 rounded-xl border bg-card p-4 text-left hover:bg-muted"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <j.ikon size={20} />
                </span>
                <span className="font-medium">{j.label}</span>
              </button>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      <SessionTimeoutDialog />
    </div>
  );
}
