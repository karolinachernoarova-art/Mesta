import React, { createContext, useContext, useEffect, useState } from 'react';
import { authApi } from '../api/auth';
import { getAuthToken, removeAuthToken, setAuthToken } from '../api/client';

export interface User {
  id: number;
  uid: string;
  email: string;
  isAdmin?: boolean;
  photoUrl?: string;
}

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  signInEmail: (e: string, p: string) => Promise<any>;
  signUpEmail: (e: string, p: string) => Promise<any>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = getAuthToken();
      if (token) {
        try {
          const res = await authApi.me();
          if (res.user) {
            setUser(res.user);
            setIsAdmin(res.user.isAdmin);
          }
        } catch (e) {
          console.error("Token invalid", e);
          removeAuthToken();
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const signInEmail = async (email: string, pass: string) => {
    const res = await authApi.login(email, pass);
    setAuthToken(res.token);
    setUser(res.user);
    setIsAdmin(res.user.isAdmin);
    return res;
  };

  const signUpEmail = async (email: string, pass: string) => {
    const res = await authApi.register(email, pass);
    setAuthToken(res.token);
    setUser(res.user);
    setIsAdmin(res.user.isAdmin);
    return res;
  };

  const signOut = async () => {
    removeAuthToken();
    setUser(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, signInEmail, signUpEmail, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
