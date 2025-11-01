import { useDispatch, useSelector } from 'react-redux';
import React, { useState, useEffect } from 'react';
import { PermissionGuard } from '../context/AuthContext';
import { fetchActivityLogs, fetchActivityStats } from '../features/userSlice';
import { toast } from 'react-toastify';

interface ActivityLog {
  id: number;
  action: string;
  entityType: string;
  entityName: string | null;
  description: string | null;
  createdAt: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
}

interface ActivityStats {
  totalActivities: number;
  recentActivities: ActivityLog[];
}

const ActivityLogComponent: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [stats, setStats] = useState<ActivityStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    userId: '',
    entityType: '',
    action: '',
    startDate: '',
    endDate: '',
    page: 1,
    limit: 50,
  });

  const dispatch = useDispatch();

  const loadActivityLogs = async () => {
    try {
      const data = await dispatch(fetchActivityLogs(filters)).unwrap();
      setLogs(data.data || []);
    } catch (error) {
      console.error('Failed to fetch activity logs:', error);
      toast.error('Failed to fetch activity logs');
    } finally {
      setLoading(false);
    }
  };

  const loadActivityStats = async () => {
    try {
      const data = await dispatch(fetchActivityStats()).unwrap();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch activity stats:', error);
      toast.error('Failed to fetch activity stats');
    }
  };

  useEffect(() => {
    loadActivityLogs();
    loadActivityStats();
  }, [filters, dispatch]);

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'UPDATE':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'DELETE':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'VIEW':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8 text-gray-900 dark:text-gray-100">
        Loading...
      </div>
    );
  }

  return (
    <PermissionGuard permission="canViewActivityLogs">
      <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">
          Activity Logs
        </h1>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                Activity Overview
              </h2>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                {stats.totalActivities}
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Total Activities
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                Recent Activity
              </h2>
              <div className="space-y-2">
                {stats.recentActivities.slice(0, 3).map((activity) => (
                  <div key={activity.id} className="text-sm">
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {activity.user.name}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {' '}
                      {activity.action.toLowerCase()}d{' '}
                    </span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {activity.entityType}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
            Filters
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Entity Type
              </label>
              <select
                value={filters.entityType}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    entityType: e.target.value,
                    page: 1,
                  })
                }
                className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="">All Types</option>
                <option value="Party">Party</option>
                <option value="Product">Product</option>
                <option value="PiInvoice">PI Invoice</option>
                <option value="Order">Order</option>
                <option value="VgmDocument">VGM Document</option>
                <option value="User">User</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Action
              </label>
              <select
                value={filters.action}
                onChange={(e) =>
                  setFilters({ ...filters, action: e.target.value, page: 1 })
                }
                className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="">All Actions</option>
                <option value="CREATE">Create</option>
                <option value="UPDATE">Update</option>
                <option value="DELETE">Delete</option>
                <option value="VIEW">View</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Start Date
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) =>
                  setFilters({ ...filters, startDate: e.target.value, page: 1 })
                }
                className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                End Date
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) =>
                  setFilters({ ...filters, endDate: e.target.value, page: 1 })
                }
                className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={() =>
                  setFilters({
                    userId: '',
                    entityType: '',
                    action: '',
                    startDate: '',
                    endDate: '',
                    page: 1,
                    limit: 50,
                  })
                }
                className="w-full bg-gray-500 dark:bg-gray-600 text-white px-3 py-2 rounded hover:bg-gray-600 dark:hover:bg-gray-700"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Activity Logs Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Activity History
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Entity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Date & Time
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {logs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {log.user.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {log.user.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getActionColor(log.action)}`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-gray-100">
                        {log.entityType}
                      </div>
                      {log.entityName && (
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {log.entityName}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-gray-100 max-w-xs truncate">
                        {log.description || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(log.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {logs.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No activity logs found
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-6">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing {logs.length} activities
          </div>
          <div className="flex gap-2">
            <button
              onClick={() =>
                setFilters({ ...filters, page: Math.max(1, filters.page - 1) })
              }
              disabled={filters.page === 1}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              Previous
            </button>
            <span className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-blue-50 dark:bg-blue-900 text-gray-900 dark:text-gray-100">
              {filters.page}
            </span>
            <button
              onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
              disabled={logs.length < filters.limit}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </PermissionGuard>
  );
};

export default ActivityLogComponent;
