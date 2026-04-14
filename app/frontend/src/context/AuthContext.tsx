import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { apiFetch } from '../lib/api';

interface User {
  fullName?: string;
  email?: string;
  role?: string;
  verificationStatus?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  showWelcome: boolean;
  setShowWelcome: (show: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);

  // On init, try to restore token and fetch /me
  useEffect(() => {
    const token = localStorage.getItem('sms_token');
    if (!token) return;
    (async () => {
      try {
        const me = await apiFetch('/me');
        setUser({ fullName: (me as any).full_name || '', email: (me as any).email || (me as any).email });
      } catch {
        // token invalid or /me failed
        localStorage.removeItem('sms_token');
        setUser(null);
      }
    })();
  }, []);

  const login = async (email: string, password: string) => {
    const res: any = await apiFetch('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    const token = res?.access_token;
    if (!token) throw new Error('No token returned');
    localStorage.setItem('sms_token', token);
    // fetch profile
    const me = await apiFetch('/me');
    setUser({ fullName: (me as any).full_name || '', email: (me as any).email, role: (me as any).role });
    setShowWelcome(true);
    setTimeout(() => setShowWelcome(false), 3000);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, showWelcome, setShowWelcome }}>
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
