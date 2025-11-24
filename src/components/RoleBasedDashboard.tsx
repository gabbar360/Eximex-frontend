import React from 'react';
import { useAuth } from '../context/AuthContext';
import SuperAdminOverview from './SuperAdminOverview';
import ComprehensiveDashboard from './dashboard/ComprehensiveDashboard';

const RoleBasedDashboard: React.FC = () => {
  const { user } = useAuth();

  // Show SuperAdmin overview for SUPER_ADMIN role
  if (user?.role?.name === 'SUPER_ADMIN') {
    return <SuperAdminOverview />;
  }

  // Use new dashboard for all other users
  return <ComprehensiveDashboard />;
};

export default RoleBasedDashboard;
