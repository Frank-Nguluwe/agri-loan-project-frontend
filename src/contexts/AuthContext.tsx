import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService } from '@/lib/api';

interface District {
  id: string;
  name: string;
  region?: string;
}

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;  
  role: 'farmer' | 'loan_officer' | 'supervisor' | 'admin';
  district_id: string;
  district?: District;
  farmer_profile?: any;
}

interface LoginCredentials {
  email?: string;
  phone_number?: string;
  password: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (userData: any) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  hasRole: (role: string | string[]) => boolean;
  isAdmin: () => boolean;
  getDistrictId: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const userData = await apiService.getDashboardInfo();
      setUser({
        ...userData,
        district_id: userData.district_id || userData.district?.id || '',
        phone_number: userData.phone_number || ''
      });
    } catch (error) {
      console.error('Auth invalid or expired:', error);
      apiService.logout();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      // Validate that either email or phone_number is provided
      if (!credentials.email && !credentials.phone_number) {
        throw new Error('Either email or phone number must be provided');
      }

      await apiService.login(credentials);
      const userData = await apiService.getDashboardInfo();
      setUser({
        ...userData,
        district_id: userData.district_id || '',
        phone_number: userData.phone_number || ''
      });
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const signup = async (userData: any) => {
    try {
      const response = await apiService.signup(userData);
      await login({
        email: userData.email,
        password: userData.password
      });
      return response;
    } catch (error) {
      console.error('Signup failed:', error);
      throw error;
    }
  };

  const logout = () => {
    apiService.logout();
    setUser(null);
  };

  const hasRole = (role: string | string[]) => {
    if (!user) return false;
    return Array.isArray(role) ? role.includes(user.role) : user.role === role;
  };

  const isAdmin = () => hasRole('admin');

  const getDistrictId = () => {
    return user?.district_id || null;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
        isAuthenticated: !!user,
        hasRole,
        isAdmin,
        getDistrictId
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};