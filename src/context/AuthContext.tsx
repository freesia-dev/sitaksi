import React, { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from 'react';
import { User, UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo users for initial development (will be replaced with Supabase auth)
const DEMO_USERS: (User & { password: string })[] = [
  { id: '1', nama: 'Admin Bankaltimtara', email: 'admin@bankaltimtara.id', role: 'Admin', password: 'admin123' },
  { id: '2', nama: 'Kepala Cabang', email: 'pimpinan@bankaltimtara.id', role: 'Pimpinan', password: 'pimpinan123' },
  { id: '3', nama: 'Haris Fadilah', email: 'officer@bankaltimtara.id', role: 'Officer', password: 'officer123' },
  { id: '4', nama: 'Demo User', email: 'demo@bankaltimtara.id', role: 'Demo', password: 'demo123' },
];

const IDLE_TIMEOUT = 15 * 60 * 1000; // 15 minutes in milliseconds

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const logout = useCallback(() => {
    setUser(null);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const resetIdleTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (user) {
      timeoutRef.current = setTimeout(() => {
        logout();
        alert('Sesi Anda telah berakhir karena tidak aktif selama 15 menit. Silakan login kembali.');
      }, IDLE_TIMEOUT);
    }
  }, [user, logout]);

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
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
    };
  }, [user, resetIdleTimer]);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const foundUser = DEMO_USERS.find(u => u.email === email && u.password === password);
    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      return true;
    }
    return false;
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
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
