import React, { createContext, useContext, useEffect, useState } from 'react';

interface AuthUser {
  uid: string;
  email: string;
  displayName: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
}

// Hardcoded credentials as requested
const ADMIN_USER = {
  uid: 'aec-corp-admin-001',
  email: 'admin@aleradah.bh',
  displayName: 'Corporate Admin',
  pass: 'aec-secure-2026'
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('aec_user_session');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (emailInput: string, passInput: string) => {
    const email = emailInput.trim().toLowerCase();
    const pass = passInput.trim();

    if (email === ADMIN_USER.email.toLowerCase() && pass === ADMIN_USER.pass) {
      const sessionUser = {
        uid: ADMIN_USER.uid,
        email: ADMIN_USER.email,
        displayName: ADMIN_USER.displayName
      };
      setUser(sessionUser);
      localStorage.setItem('aec_user_session', JSON.stringify(sessionUser));
    } else {
      throw new Error('Invalid credentials');
    }
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem('aec_user_session');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {!loading && children}
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
