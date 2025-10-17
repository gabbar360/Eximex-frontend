import React, { createContext, useContext, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setUser, clearUser } from '../features/userSlice';
import authService from '../service/authService';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'STAFF';
  companyId: number;
  profilePicture?: string;
  googleId?: string;
  isEmailVerified?: boolean;
  company?: {
    id: number;
    name: string;
    isActive: boolean;
  };
}

const getPermissions = (role: string) => ({
  canManageStaff: ['ADMIN', 'SUPER_ADMIN'].includes(role),
  canViewAllData: ['ADMIN', 'SUPER_ADMIN'].includes(role),
  canReassignData: ['ADMIN', 'SUPER_ADMIN'].includes(role),
  canViewActivityLogs: ['ADMIN', 'SUPER_ADMIN'].includes(role),
});

const AuthContext = createContext<{
  user: User | null;
  isAuthenticated: boolean;
  permissions: {
    canManageStaff: boolean;
    canViewAllData: boolean;
    canReassignData: boolean;
    canViewActivityLogs: boolean;
  };
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => void;
}>({} as any);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const dispatch = useDispatch();
  const user = useSelector((state: any) => state.user.user);

  const isAuthenticated = !!user;
  const permissions = user
    ? getPermissions(user.role)
    : {
        canManageStaff: false,
        canViewAllData: false,
        canReassignData: false,
        canViewActivityLogs: false,
      };

  const login = async (credentials: { email: string; password: string }) => {
    try {
      const response = await authService.login(credentials);
      if (response?.data) {
        dispatch(setUser(response.data.user));
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    dispatch(clearUser());
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, permissions, login, logout }}
    >
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

// Role-based component wrapper
export const RoleGuard: React.FC<{
  children: React.ReactNode;
  allowedRoles: string[];
  fallback?: React.ReactNode;
}> = ({ children, allowedRoles, fallback = null }) => {
  const { user } = useAuth();

  if (!user || !allowedRoles.includes(user.role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

// Permission-based component wrapper
export const PermissionGuard: React.FC<{
  children: React.ReactNode;
  permission:
    | 'canManageStaff'
    | 'canViewAllData'
    | 'canReassignData'
    | 'canViewActivityLogs';
  fallback?: React.ReactNode;
}> = ({ children, permission, fallback = null }) => {
  const { permissions } = useAuth();

  if (!permissions[permission]) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
