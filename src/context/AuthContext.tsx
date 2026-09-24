import React, { createContext, useContext, useState, useCallback, useEffect, useRef, useMemo, ReactNode } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/types';

interface AuthUser {
  id: string;
  nama: string;
  email: string;
  role: UserRole;
  isApproved: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  isAuthenticated: boolean;
  isApproved: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, nama: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  /** true satu menit sebelum sesi berakhir karena tidak ada aktivitas */
  idleWarning: boolean;
  extendSession: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const IDLE_TIMEOUT = 15 * 60 * 1000; // 15 menit tanpa aktivitas → logout
const IDLE_WARNING = 60 * 1000; // peringatan muncul 1 menit sebelumnya

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [idleWarning, setIdleWarning] = useState(false);

  const clearIdleTimers = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningRef.current) clearTimeout(warningRef.current);
    timeoutRef.current = null;
    warningRef.current = null;
  };

  const logout = useCallback(async () => {
    clearIdleTimers();
    setIdleWarning(false);
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  }, []);

  const resetIdleTimer = useCallback(() => {
    clearIdleTimers();
    setIdleWarning(false);
    if (user) {
      warningRef.current = setTimeout(() => setIdleWarning(true), IDLE_TIMEOUT - IDLE_WARNING);
      timeoutRef.current = setTimeout(() => {
        logout();
        try {
          sessionStorage.setItem('sitaksi_sesi_habis', '1');
        } catch {
          /* penyimpanan tidak tersedia — pesan di halaman login dilewati */
        }
      }, IDLE_TIMEOUT);
    }
  }, [user, logout]);

  // Fetch user profile and role
  const fetchUserProfile = async (userId: string, userEmail: string) => {
    try {
      // Fetch profile with is_approved
      const { data: profile } = await supabase
        .from('profiles')
        .select('nama, role, is_approved')
        .eq('user_id', userId)
        .maybeSingle();

      // Fetch role from user_roles table
      const { data: userRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();

      const roleMapping: Record<string, UserRole> = {
        'admin': 'Admin',
        'user': 'Officer',
        'demo': 'Demo'
      };

      const role = userRole?.role ? roleMapping[userRole.role] || 'Officer' : 'Officer';

      setUser({
        id: userId,
        email: userEmail,
        nama: profile?.nama || userEmail,
        role: role,
        isApproved: profile?.is_approved ?? false
      });
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setUser({
        id: userId,
        email: userEmail,
        nama: userEmail,
        role: 'Officer',
        isApproved: false
      });
    }
  };

  // Setup auth state listener
  // isLoading baru false setelah profil selesai dimuat. Dulu isLoading false
  // lebih dulu sehingga halaman sempat menganggap user belum login, dialihkan
  // ke /login, lalu ke /dashboard — refresh atau buka tautan langsung ke
  // halaman mana pun selalu berakhir di Dashboard.
  useEffect(() => {
    let aktif = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        if (session?.user) {
          // Ditunda dengan setTimeout untuk menghindari deadlock di callback auth
          setTimeout(async () => {
            await fetchUserProfile(session.user.id, session.user.email || '');
            if (aktif) setIsLoading(false);
          }, 0);
        } else {
          setUser(null);
          setIsLoading(false);
        }
      }
    );

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        await fetchUserProfile(session.user.id, session.user.email || '');
      }
      if (aktif) setIsLoading(false);
    });

    return () => {
      aktif = false;
      subscription.unsubscribe();
    };
  }, []);

  // Setup idle detection
  useEffect(() => {
    if (!user) return;

    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
    
    const handleActivity = () => {
      resetIdleTimer();
    };

    // Start idle timer
    resetIdleTimer();

    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, handleActivity);
    });

    return () => {
      clearIdleTimers();
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
    };
  }, [user, resetIdleTimer]);

  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Terjadi kesalahan' };
    }
  }, []);

  const signup = useCallback(async (email: string, password: string, nama: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            nama: nama,
            role: 'user'
          }
        }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Terjadi kesalahan' };
    }
  }, []);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({ 
    user, 
    session,
    isAuthenticated: !!session && !!user, 
    isApproved: user?.isApproved ?? false,
    isLoading,
    login, 
    signup,
    logout,
    idleWarning,
    extendSession: resetIdleTimer,
  }), [user, session, isLoading, login, signup, logout, idleWarning, resetIdleTimer]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
