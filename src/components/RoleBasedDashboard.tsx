import React from 'react';
import { useAuth } from '../context/AuthContext';
import SuperAdminOverview from './SuperAdminOverview';
import ComprehensiveDashboard from './dashboard/ComprehensiveDashboard';
import SEOHead from './common/SEOHead';

const RoleBasedDashboard: React.FC = () => {
  const { user } = useAuth();

  // Show SuperAdmin overview for SUPER_ADMIN role
  if (user?.role?.name === 'SUPER_ADMIN') {
    return (
      <>
        <SEOHead
          title="Admin Dashboard - EximEx | Global Import Export Trading Platform"
          description="EximEx Admin Dashboard - Manage your global import-export operations with comprehensive analytics, user management, and trading insights."
          url="https://eximexperts.in/dashboard"
        />
        <SuperAdminOverview />
      </>
    );
  }

  // Use new dashboard for all other users
  return (
    <>
      <SEOHead
        title="Dashboard - EximEx | Global Import Export Trading Platform"
        description="EximEx Dashboard - Your comprehensive view of global trading operations, market insights, and import-export management tools."
        url="https://eximexperts.in/dashboard"
      />
      <ComprehensiveDashboard />
    </>
  );
};

export default RoleBasedDashboard;
