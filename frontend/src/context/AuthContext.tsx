import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../lib/api';
import { resetSocket } from '../lib/socket';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'STUDENT' | 'MODERATOR' | 'ADMIN';
  avatarUrl?: string | null;
  college?: string | null;
  department?: string | null;
  year?: string | null;
  bio?: string | null;
  availability?: string | null;
  languages?: string;
  learningHours?: number;
  teachingHours?: number;
  skills?: any[];
  achievements?: any[];
  learningGoals?: any[];
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchCurrentUser = async () => {
    try {
      if (!localStorage.getItem('token')) {
        setUser(null);
        setIsLoading(false);
        return;
      }
      const userData = await api.get<User>('/auth/me');
      setUser(userData);
    } catch (err) {
      console.warn('Session expired or invalid token');
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, [token]);

  const login = async (email: string, password: string) => {
    const res = await api.post<{ token: string; user: User }>('/auth/login', { email, password });
    localStorage.setItem('token', res.token);
    setToken(res.token);
    setUser(res.user);
  };

  const register = async (data: any) => {
    const res = await api.post<{ token: string; user: User }>('/auth/register', data);
    localStorage.setItem('token', res.token);
    setToken(res.token);
    setUser(res.user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    resetSocket();
    window.location.href = '/login';
  };

  const refreshUser = async () => {
    await fetchCurrentUser();
  };

  const updateUser = async (data: Partial<User>) => {
    const updated = await api.patch<User>('/users/me', data);
    setUser((prev) => (prev ? { ...prev, ...updated } : updated));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
