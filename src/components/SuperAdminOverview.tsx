import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUsers,
  faBuilding,
  faDatabase,
  faShield,
  faChartLine,
  faCog,
  faUserShield,
  faServer,
  faLock,
  faHistory,
  faExclamationTriangle,
  faCheckCircle,
  faArrowRight,
  faRefresh
} from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import { getSuperAdminDashboardStats } from '../features/userSlice';
import { toast } from 'react-toastify';

const SuperAdminOverview: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await dispatch(getSuperAdminDashboardStats()).unwrap();
      setStats(response);
    } catch (error) {
      toast.error('Failed to fetch dashboard stats');
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const quickActions = [
    {
      title: 'Enhanced Dashboard',
      description: 'Comprehensive system overview with real-time analytics',
      icon: faChartLine,
      path: '/super-admin/dashboard',
      color: 'blue',
      features: ['Real-time stats', 'Database overview', 'System analytics', 'Quick actions']
    },
    {
      title: 'Management Center',
      description: 'Complete user and company management hub',
      icon: faUserShield,
      path: '/super-admin/management',
      color: 'purple',
      features: ['User management', 'Company oversight', 'Role management', 'Access control']
    },
    {
      title: 'Database Management',
      description: 'Direct database access and management tools',
      icon: faDatabase,
      path: '/super-admin/database/tables',
      color: 'green',
      features: ['Table viewer', 'Data export', 'Query tools', 'Backup management']
    },
    {
      title: 'Security Center',
      description: 'Security monitoring and access control',
      icon: faShield,
      path: '/super-admin/security/logs',
      color: 'red',
      features: ['Security logs', 'Threat detection', 'Access monitoring', 'API management']
    }
  ];

  const systemFeatures = [
    {
      category: 'User Management',
      icon: faUsers,
      features: [
        'View all system users across companies',
        'Block/unblock user accounts',
        'Reset user passwords',
        'Manage user roles and permissions',
        'Monitor user activity and login history'
      ]
    },
    {
      category: 'Company Management',
      icon: faBuilding,
      features: [
        'View all registered companies',
        'Monitor company statistics',
        'Manage company settings',
        'Track company usage and activity',
        'Handle subscription management'
      ]
    },
    {
      category: 'Database Operations',
      icon: faServer,
      features: [
        'Access all database tables',
        'Export data in various formats',
        'Monitor database performance',
        'Manage data integrity',
        'Perform system maintenance'
      ]
    },
    {
      category: 'Security & Monitoring',
      icon: faLock,
      features: [
        'Monitor system security logs',
        'Track suspicious activities',
        'Manage API access keys',
        'Configure security policies',
        'Generate security reports'
      ]
    }
  ];

  const ActionCard = ({ action }: { action: typeof quickActions[0] }) => (
    <div 
      onClick={() => navigate(action.path)}
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 cursor-pointer border-l-4 border-${action.color}-500 group`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-lg bg-${action.color}-50 dark:bg-${action.color}-900/20`}>
          <FontAwesomeIcon 
            icon={action.icon} 
            className={`text-2xl text-${action.color}-600 dark:text-${action.color}-400`} 
          />
        </div>
        <FontAwesomeIcon 
          icon={faArrowRight} 
          className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" 
        />
      </div>
      
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        {action.title}
      </h3>
      
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        {action.description}
      </p>
      
      <div className="space-y-2">
        {action.features.map((feature, index) => (
          <div key={index} className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <FontAwesomeIcon icon={faCheckCircle} className={`mr-2 text-${action.color}-500`} />
            {feature}
          </div>
        ))}
      </div>
    </div>
  );

  const FeatureSection = ({ feature }: { feature: typeof systemFeatures[0] }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div className="flex items-center mb-4">
        <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700 mr-4">
          <FontAwesomeIcon 
            icon={feature.icon} 
            className="text-xl text-gray-600 dark:text-gray-400" 
          />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {feature.category}
        </h3>
      </div>
      
      <ul className="space-y-2">
        {feature.features.map((item, index) => (
          <li key={index} className="flex items-start text-sm text-gray-600 dark:text-gray-400">
            <FontAwesomeIcon icon={faCheckCircle} className="mr-2 mt-0.5 text-green-500 flex-shrink-0" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div className="p-3 sm:p-6 bg-gray-50 dark:bg-gray-900 min-h-screen max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 mr-4">
            <FontAwesomeIcon 
              icon={faUserShield} 
              className="text-2xl text-red-600 dark:text-red-400" 
            />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Super Administrator Panel
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Complete system control and management dashboard
            </p>
          </div>
        </div>
        
        {/* <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-4 rounded-lg">
          <div className="flex items-center">
            <FontAwesomeIcon icon={faExclamationTriangle} className="mr-3" />
            <div>
              <p className="font-semibold">Super Administrator Access</p>
              <p className="text-sm opacity-90">
                You have full system access. Please use these privileges responsibly.
              </p>
            </div>
          </div>
        </div> */}
      </div>

      {/* Real Stats Overview */}
      {loading ? (
        <div className="flex justify-center items-center h-32 mb-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : stats && (
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              System Statistics
            </h2>
            <button
              onClick={fetchStats}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FontAwesomeIcon icon={faRefresh} className="mr-2" />
              Refresh
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{(stats.users || 0).toLocaleString()}</p>
                </div>
                <FontAwesomeIcon icon={faUsers} className="text-4xl text-blue-500" />
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Companies</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{(stats.companies || 0).toLocaleString()}</p>
                </div>
                <FontAwesomeIcon icon={faBuilding} className="text-4xl text-green-500" />
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Products</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{(stats.products || 0).toLocaleString()}</p>
                </div>
                <FontAwesomeIcon icon={faDatabase} className="text-4xl text-purple-500" />
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border-l-4 border-orange-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Orders</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{(stats.orders || 0).toLocaleString()}</p>
                </div>
                <FontAwesomeIcon icon={faChartLine} className="text-4xl text-orange-500" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border-l-4 border-indigo-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Parties</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{(stats.parties || 0).toLocaleString()}</p>
                </div>
                <FontAwesomeIcon icon={faUsers} className="text-4xl text-indigo-500" />
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border-l-4 border-pink-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">PI Invoices</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{(stats.piInvoices || 0).toLocaleString()}</p>
                </div>
                <FontAwesomeIcon icon={faServer} className="text-4xl text-pink-500" />
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border-l-4 border-red-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Categories</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{(stats.categories || 0).toLocaleString()}</p>
                </div>
                <FontAwesomeIcon icon={faDatabase} className="text-4xl text-red-500" />
              </div>
            </div>
          </div>
        </div>
      )}

      
    </div>
  );
};

export default SuperAdminOverview;