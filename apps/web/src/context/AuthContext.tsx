import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserWithoutPassword, LoginDto, RegisterDto } from '@devopshub/shared';
import { fetchApi } from '../api/client';

interface AuthContextType {
  user: UserWithoutPassword | null;
  loading: boolean;
  login: (data: LoginDto) => Promise<void>;
  register: (data: RegisterDto) => Promise<void>;
  logout: () => Promise<void>;
  quickDemoLogin: (role: 'ADMIN' | 'DEVELOPER') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserWithoutPassword | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = async () => {
    try {
      const data = await fetchApi<UserWithoutPassword>('/auth/me');
      setUser(data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (data: LoginDto) => {
    const res = await fetchApi<{ user: UserWithoutPassword; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    setUser(res.user);
  };

  const register = async (data: RegisterDto) => {
    const res = await fetchApi<{ user: UserWithoutPassword; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    setUser(res.user);
  };

  const logout = async () => {
    await fetchApi('/auth/logout', { method: 'POST' });
    setUser(null);
  };

  const quickDemoLogin = async (role: 'ADMIN' | 'DEVELOPER') => {
    const email = role === 'ADMIN' ? 'admin@devopshub.io' : 'dev@devopshub.io';
    await login({ email, password: 'Password123!' });
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, quickDemoLogin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
