import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  fullName: string;
  email: string;
  role: string;
  verificationStatus: 'Verified' | 'Unverified';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  showWelcome: boolean;
  setShowWelcome: (show: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);

  // Restore session from token on mount
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token && !user) {
      fetch('http://localhost:8000/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => (r.ok ? r.json() : null))
        .then((me) => {
          if (me) {
            setUser({
              fullName: me.full_name || '',
              email: me.email || '',
              role: me.role || 'User',
              verificationStatus: 'Verified',
            });
          } else {
            localStorage.removeItem('auth_token');
          }
        })
        .catch(() => localStorage.removeItem('auth_token'));
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('http://localhost:8000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) return false;
      const data = await res.json();
      const token = data.access_token;
      if (!token) return false;
      localStorage.setItem('auth_token', token);

      const meRes = await fetch('http://localhost:8000/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!meRes.ok) return false;
      const me = await meRes.json();
      setUser({
        fullName: me.full_name || '',
        email: me.email || email,
        role: me.role || 'User',
        verificationStatus: 'Verified',
      });
      setShowWelcome(true);
      setTimeout(() => setShowWelcome(false), 3000);
      return true;
    } catch {
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('auth_token');
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
