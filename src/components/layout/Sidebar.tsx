import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Car, 
  Home, 
  Building2, 
  Users, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  Info,
  UserCircle,
  FileSpreadsheet
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import logoSitaksi from '@/assets/logo-sitaksi-fix.png';
import logoSitaksiOnly from '@/assets/logo-sitaksi-only.png';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isOfficerOrAdmin = user?.role === 'Officer' || user?.role === 'Admin';
  const isPimpinan = user?.role === 'Pimpinan';
  const isAdmin = user?.role === 'Admin';
  const isDemo = user?.role === 'Demo';

  const menuItems = [
    {
      label: 'Dashboard',
      icon: LayoutDashboard,
      href: '/dashboard',
      show: true,
    },
    {
      label: 'Taksasi Tanah',
      icon: Home,
      href: '/list/tanah',
      show: isOfficerOrAdmin || isDemo,
    },
    {
      label: 'Taksasi T & B',
      icon: Building2,
      href: '/list/tanah-bangunan',
      show: isOfficerOrAdmin || isDemo,
    },
    {
      label: 'Taksasi Kendaraan',
      icon: Car,
      href: '/list/kendaraan',
      show: isOfficerOrAdmin || isDemo,
    },
    {
      label: 'Riwayat',
      icon: FileText,
      href: '/riwayat',
      show: true,
    },
    {
      label: 'Export Laporan',
      icon: FileSpreadsheet,
      href: '/export',
      show: true,
    },
    {
      label: 'Kelola User',
      icon: Users,
      href: '/admin/users',
      show: isAdmin,
    },
    {
      label: 'Profil Saya',
      icon: UserCircle,
      href: '/profile',
      show: true,
    },
    {
      label: 'Tentang',
      icon: Info,
      href: '/about',
      show: true,
    },
  ];

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-sidebar transition-all duration-300 flex flex-col",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        {!isCollapsed && (
          <div className="flex items-center justify-center animate-fade-in">
            <img 
              src={logoSitaksi} 
              alt="SITAKSI" 
              className="w-44 h-auto object-contain"
            />
          </div>
        )}
        {isCollapsed && (
          <img 
            src={logoSitaksiOnly} 
            alt="SITAKSI" 
            className="w-12 h-12 mx-auto object-contain"
          />
        )}
      </div>

      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-20 w-6 h-6 bg-sidebar-primary text-sidebar-primary-foreground rounded-full flex items-center justify-center shadow-elevated hover:scale-110 transition-transform"
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
        {menuItems.filter(item => item.show).map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-soft"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon size={20} className={cn(isActive && "animate-scale-up")} />
              {!isCollapsed && (
                <span className="font-medium text-sm animate-fade-in">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User & Logout */}
      <div className="p-4 border-t border-sidebar-border">
        {!isCollapsed && (
          <div className="mb-3 p-3 rounded-lg bg-sidebar-accent/50 animate-fade-in">
            <p className="font-semibold text-sidebar-foreground text-sm truncate">{user?.nama}</p>
            <p className="text-xs text-sidebar-foreground/60">{user?.role}</p>
          </div>
        )}
        <Button
          variant="ghost"
          onClick={logout}
          className={cn(
            "w-full text-sidebar-foreground hover:bg-destructive hover:text-destructive-foreground",
            isCollapsed ? "px-2" : "justify-start"
          )}
        >
          <LogOut size={20} />
          {!isCollapsed && <span className="ml-2">Keluar</span>}
        </Button>
      </div>
    </aside>
  );
}
