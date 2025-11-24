import React, { createContext, useContext, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { loginUser, logoutUser } from '../features/authSlice';
import { clearUser } from '../features/userSlice';

interface User {
  id: number;
  name: string;
  email: string;
  role: {
    id: number;
    name: 'SUPER_ADMIN' | 'ADMIN' | 'STAFF';
    displayName: string;
    permissions: any;
  };
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

const getPermissions = (role: any) => {
  const roleName = role?.name || role;
  return {
    canManageStaff: ['ADMIN', 'SUPER_ADMIN'].includes(roleName),
    canViewAllData: ['ADMIN', 'SUPER_ADMIN'].includes(roleName),
    canReassignData: ['ADMIN', 'SUPER_ADMIN'].includes(roleName),
  };
};

const AuthContext = createContext<{
  user: User | null;
  isAuthenticated: boolean;
  permissions: {
    canManageStaff: boolean;
    canViewAllData: boolean;
    canReassignData: boolean;
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
      };

  const login = async (credentials: { email: string; password: string }) => {
    try {
      const response = await dispatch(loginUser(credentials)).unwrap();
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Call backend logout API
      await dispatch(logoutUser()).unwrap();
    } catch (error) {
      console.warn('Logout API failed:', error);
    } finally {
      // Always clear local state and storage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      dispatch(clearUser());
    }
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

  const userRole = user?.role?.name || user?.role;
  if (!user || !allowedRoles.includes(userRole)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

// Permission-based component wrapper
export const PermissionGuard: React.FC<{
  children: React.ReactNode;
  permission: 'canManageStaff' | 'canViewAllData' | 'canReassignData';
  fallback?: React.ReactNode;
}> = ({ children, permission, fallback = null }) => {
  const { permissions } = useAuth();

  if (!permissions[permission]) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
