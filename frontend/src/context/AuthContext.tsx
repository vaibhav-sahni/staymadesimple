import React, { createContext, useState, useContext, ReactNode } from "react";

interface User {
  email: string;
  role: string; // Added role to distinguish users
  fullName?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<User>; // Returns User for redirection logic
  logout: () => void;
  token: string | null;
  showWelcome: boolean; // Added to match your App.tsx usage
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE = "http://127.0.0.1:8000";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );

  const login = async (email: string, password: string): Promise<User> => {
  const cleanEmail = email.trim();
  const cleanPassword = password.trim();

  const response = await fetch(`${API_BASE}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: cleanEmail,
      password: cleanPassword
    }),
  });

  if (!response.ok) {
    throw new Error("Invalid email or password");
  }

  const data = await response.json();

  const accessToken = data.access_token;

  // Save token
  localStorage.setItem("token", accessToken);
  setToken(accessToken);

  // Decode JWT payload
  const payload = JSON.parse(atob(accessToken.split(".")[1]));

  const loggedInUser: User = {
    email: cleanEmail,
    role: payload.role,     // role from backend JWT
    fullName: cleanEmail.split("@")[0]
  };

  setUser(loggedInUser);

  setShowWelcome(true);
  setTimeout(() => setShowWelcome(false), 3000);

  return loggedInUser;
};

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, token, showWelcome }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};