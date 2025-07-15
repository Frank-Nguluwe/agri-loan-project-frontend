// src/contexts/AuthContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const clearAuthData = () => {
    localStorage.removeItem('access_token');
    setUser(null);
  };

  const checkAuthStatus = async () => {
    setLoading(true);
    const token = localStorage.getItem('access_token');

    if (!token) {
      clearAuthData();
      setLoading(false);
      return;
    }

    try {
      const userData = await apiService.getDashboardInfo();
      setUser({
        ...userData,
        district_id: userData.district_id || userData.district?.id || '',
        phone_number: userData.phone_number || '',
      });
    } catch (error) {
      clearAuthData();
      navigate('/auth/login', { replace: true });
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials) => {
    setLoading(true);
    clearAuthData();
    try {
      await apiService.login(credentials);
      await checkAuthStatus();
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData: any) => {
    await apiService.signup(userData);
    await login({ email: userData.email, password: userData.password });
  };

  const logout = () => {
    apiService.logout();
    clearAuthData();
    navigate('/auth/login', { replace: true });
  };

  const hasRole = (role: string | string[]) =>
    user ? (Array.isArray(role) ? role.includes(user.role) : user.role === role) : false;

  const isAdmin = () => hasRole('admin');

  const getDistrictId = () => user?.district_id || null;

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
        getDistrictId,
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
