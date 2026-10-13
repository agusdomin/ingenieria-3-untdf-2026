import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { queryClient } from '../api/queryClient';
import { queryKeys } from '../api/queryKeys';
import { getStoredToken } from '../api/client';
import { User, LoginDTO, RegisterDTO } from '../types/auth';
import * as authService from '../services/auth.service';

type UserRole = User['role'];

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginDTO) => Promise<void>;
  register: (data: RegisterDTO) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const token = await getStoredToken('accessToken');
        if (token) {
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser);
          queryClient.setQueryData(queryKeys.auth.user, currentUser);
        }
      } catch (error) {
        await authService.logout();
        setUser(null);
        queryClient.removeQueries({ queryKey: queryKeys.auth.user });
      } finally {
        setIsLoading(false);
      }
    };

    loadSession();
  }, []);

  const login = async (credentials: LoginDTO) => {
    const response = await authService.login(credentials);
    setUser(response.user);
    queryClient.setQueryData(queryKeys.auth.user, response.user);
  };

  const register = async (data: RegisterDTO) => {
    const response = await authService.register(data);
    setUser(response.user);
    queryClient.setQueryData(queryKeys.auth.user, response.user);
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    queryClient.clear();
  };

  const hasRole = (allowedRoles: UserRole[]) => {
    if (!user) return false;
    return allowedRoles.includes(user.role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}