import React, { useState } from 'react';
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
  ChevronDown,
  Info,
  UserCircle,
  FolderOpen,
  Settings,
  ClipboardCheck,
  CalendarClock,
  BarChart3,
  ListChecks,
  FileBarChart,
  ShieldAlert,
  TrendingDown
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import logoSitaksi from '@/assets/logo-sitaksi-fix.png';
import logoSitaksiOnly from '@/assets/logo-sitaksi-only.png';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

interface MenuItem {
  label: string;
  icon: React.ElementType;
  href: string;
  show: boolean;
}

interface MenuGroup {
  label: string;
  icon: React.ElementType;
  items: MenuItem[];
  show: boolean;
}

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isOfficerOrAdmin = user?.role === 'Officer' || user?.role === 'Admin';
  const isPimpinan = user?.role === 'Pimpinan';
  const isAdmin = user?.role === 'Admin';
  const isDemo = user?.role === 'Demo';

  const [taksasiOpen, setTaksasiOpen] = useState(true);
  const [configOpen, setConfigOpen] = useState(false);
  const [monitoringOpen, setMonitoringOpen] = useState(false);
  const [rkoOpen, setRkoOpen] = useState(false);

  // Single menu items
  const singleMenuItems: MenuItem[] = [
    {
      label: 'Dashboard',
      icon: LayoutDashboard,
      href: '/dashboard',
      show: true,
    },
    {
      label: 'Tentang',
      icon: Info,
      href: '/about',
      show: true,
    },
  ];

  // Grouped menu - Taksasi
  const taksasiGroup: MenuGroup = {
    label: 'Taksasi',
    icon: FolderOpen,
    show: isOfficerOrAdmin || isDemo,
    items: [
      {
        label: 'Tanah',
        icon: Home,
        href: '/list/tanah',
        show: true,
      },
      {
        label: 'Tanah & Bangunan',
        icon: Building2,
        href: '/list/tanah-bangunan',
        show: true,
      },
      {
        label: 'Kendaraan',
        icon: Car,
        href: '/list/kendaraan',
        show: true,
      },
      {
        label: 'Riwayat',
        icon: FileText,
        href: '/riwayat',
        show: true,
      },
    ],
  };

  // Grouped menu - Monitoring
  const monitoringGroup: MenuGroup = {
    label: 'Monitoring',
    icon: ClipboardCheck,
    show: true,
    items: [
      { label: 'Daftar Kunjungan', icon: ListChecks, href: '/monitoring', show: true },
      { label: 'Jadwal Kunjungan', icon: CalendarClock, href: '/monitoring/jadwal', show: true },
      { label: 'Dashboard', icon: BarChart3, href: '/monitoring/dashboard', show: true },
    ],
  };

  // Grouped menu - Laporan RKO
  const rkoGroup: MenuGroup = {
    label: 'Laporan RKO',
    icon: FileBarChart,
    show: isOfficerOrAdmin || isDemo,
    items: [
      { label: 'Laporan Subrogasi', icon: ShieldAlert, href: '/laporan-rko/subrogasi', show: true },
      { label: 'Laporan PL to NPL', icon: TrendingDown, href: '/laporan-rko/pl-to-npl', show: true },
    ],
  };

  // Grouped menu - Konfigurasi
  const configGroup: MenuGroup = {
    label: 'Konfigurasi',
    icon: Settings,
    show: true,
    items: [
      {
        label: 'Profil Saya',
        icon: UserCircle,
        href: '/profile',
        show: true,
      },
      {
        label: 'Kelola User',
        icon: Users,
        href: '/admin/users',
        show: isAdmin,
      },
    ].filter(item => item.show),
  };

  const renderMenuItem = (item: MenuItem) => {
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
  };

  const renderMenuGroup = (group: MenuGroup, isOpen: boolean, setIsOpen: (open: boolean) => void) => {
    if (!group.show) return null;
    
    const hasActiveItem = group.items.some(item => location.pathname === item.href);

    if (isCollapsed) {
      // When collapsed, show items directly
      return (
        <div className="space-y-1">
          {group.items.filter(item => item.show).map(renderMenuItem)}
        </div>
      );
    }

    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className={cn(
          "flex items-center justify-between w-full px-3 py-2.5 rounded-lg transition-all duration-200",
          hasActiveItem 
            ? "bg-sidebar-accent/70 text-sidebar-accent-foreground" 
            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        )}>
          <div className="flex items-center gap-3">
            <group.icon size={20} />
            <span className="font-medium text-sm">{group.label}</span>
          </div>
          <ChevronDown 
            size={16} 
            className={cn(
              "transition-transform duration-200",
              isOpen && "rotate-180"
            )} 
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="pl-4 mt-1 space-y-1">
          {group.items.filter(item => item.show).map(renderMenuItem)}
        </CollapsibleContent>
      </Collapsible>
    );
  };

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
        {/* Dashboard */}
        {renderMenuItem(singleMenuItems[0])}
        
        {/* Taksasi Group */}
        {renderMenuGroup(taksasiGroup, taksasiOpen, setTaksasiOpen)}

        {/* Monitoring Group */}
        {renderMenuGroup(monitoringGroup, monitoringOpen, setMonitoringOpen)}

        {/* Laporan RKO Group */}
        {renderMenuGroup(rkoGroup, rkoOpen, setRkoOpen)}
        
        {/* Konfigurasi Group */}
        {renderMenuGroup(configGroup, configOpen, setConfigOpen)}
        
        {/* Tentang */}
        {renderMenuItem(singleMenuItems[1])}
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
