import axiosInstance from '../utils/axiosInstance';

// Get current user from auth endpoint
export const getCurrentUser = async () => {
  const response = await axiosInstance.get('/me');
  return response.data.data;
};

export const userService = {
  // Get user by ID
  getUser: async (id) => {
    const response = await axiosInstance.get(`/users/${id}`);
    return response.data.data;
  },

  // Update user
  updateUser: async (id, userData) => {
    const response = await axiosInstance.put(`/users/${id}`, userData);
    return { data: response.data.data, message: response.data.message };
  },

  // Create user
  createUser: async (userData) => {
    const response = await axiosInstance.post('/users', userData);
    return { data: response.data.data, message: response.data.message };
  },

  // Delete user
  deleteUser: async (id) => {
    const response = await axiosInstance.delete(`/users/${id}`);
    return { id, message: response.data.message };
  },

  // Get all users
  getAllUsers: async (params = {}) => {
    const response = await axiosInstance.get('/users', { params });
    return response.data.data;
  },

  // Get user stats
  getUserStats: async () => {
    const response = await axiosInstance.get('/users/stats');
    return response.data.data;
  },

  // Get company dashboard stats (for both admin and staff)
  getCompanyDashboardStats: async () => {
    const response = await axiosInstance.get('/dashboard/stats');
    return response.data.data;
  },

  // Change password
  changePassword: async (id, passwordData) => {
    const response = await axiosInstance.patch(
      `/users/${id}/password`,
      passwordData
    );
    return { message: response.data.message };
  },

  // Staff management
  getCompanyStaff: async (params = {}) => {
    const response = await axiosInstance.get('/staff', { params });
    return response.data.data;
  },

  getUserDataSummary: async (id) => {
    const response = await axiosInstance.get(`/users/${id}/data-summary`);
    return response.data.data;
  },

  reassignUserData: async (fromUserId, toUserId) => {
    const response = await axiosInstance.post('/users/reassign-data', {
      fromUserId,
      toUserId,
    });
    return { message: response.data.message };
  },

  deleteStaffAndReassign: async (staffId, reassignToUserId) => {
    const response = await axiosInstance.delete(
      `/users/${staffId}/delete-and-reassign`,
      {
        data: { reassignToUserId },
      }
    );
    return { message: response.data.message };
  },

  // Activity logs
  getActivityLogs: async (params = {}) => {
    const response = await axiosInstance.get('/activity-logs', { params });
    return response.data.data;
  },

  getActivityStats: async (userId = null) => {
    const params = userId ? { userId } : {};
    const response = await axiosInstance.get('/activity-logs/stats', {
      params,
    });
    return response.data.data;
  },

  // Data assignment
  assignData: async (entityType, entityIds, fromUserId, toUserId) => {
    const response = await axiosInstance.post('/assign-data', {
      entityType,
      entityIds,
      fromUserId,
      toUserId,
    });
    return { message: response.data.message };
  },

  getAssignableData: async (userId, entityType) => {
    const response = await axiosInstance.get(
      `/assignable-data/${userId}/${entityType}`
    );
    return response.data;
  },

  // Super Admin functions
  getAllUsersForSuperAdmin: async (params = {}) => {
    const response = await axiosInstance.get('/super-admin/users', { params });
    return response.data.data;
  },

  toggleUserBlock: async (userId) => {
    const response = await axiosInstance.patch(
      `/super-admin/users/${userId}/block`
    );
    return { data: response.data.data, message: response.data.message };
  },

  getSuperAdminDashboardStats: async () => {
    const response = await axiosInstance.get('/super-admin/dashboard/stats');
    return response.data.data;
  },

  // Enhanced Super Admin functions
  getAllDatabaseData: async (params = {}) => {
    const response = await axiosInstance.get('/super-admin/database/all-data', { params });
    return response.data.data;
  },

  resetUserPassword: async (userId, passwordData) => {
    const response = await axiosInstance.patch(
      `/super-admin/users/${userId}/reset-password`,
      passwordData
    );
    return { message: response.data.message };
  },

  getAllCompanies: async (params = {}) => {
    const response = await axiosInstance.get('/super-admin/companies', { params });
    return response.data.data;
  },

  getCompanyDetails: async (companyId) => {
    const response = await axiosInstance.get(`/super-admin/companies/${companyId}`);
    return response.data.data;
  },

  getAllTables: async () => {
    const response = await axiosInstance.get('/super-admin/database/tables');
    return response.data.data;
  },

  getTableData: async (tableName, params = {}) => {
    const response = await axiosInstance.get(`/super-admin/database/tables/${tableName}`, { params });
    return response.data.data;
  },
};
