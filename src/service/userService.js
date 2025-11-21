import axiosInstance from '../utils/axiosInstance';

// Get current user from auth endpoint
export const getCurrentUser = async () => {
  const response = await axiosInstance.get('/me');
  return response.data.data;
};

export const userService = {
  // Get current user
  getCurrentUser,

  // Get user by ID (Super Admin)
  getUser: async (id) => {
    const response = await axiosInstance.get(`/super-admin/get-users/${id}`);
    return response.data.data;
  },

  // Update user (Super Admin)
  updateUser: async (id, userData) => {
    const response = await axiosInstance.put(`/super-admin/update-users/${id}`, userData);
    return { data: response.data.data, message: response.data.message };
  },

  // Create user (Super Admin)
  createUser: async (userData) => {
    // If no password provided, remove it from data to trigger invitation
    if (!userData.password || userData.password.trim() === '') {
      delete userData.password;
    }
    const response = await axiosInstance.post('/super-admin/create-users', userData);
    return { data: response.data.data, message: response.data.message };
  },

  // Delete user (Super Admin)
  deleteUser: async (id) => {
    const response = await axiosInstance.delete(`/super-admin/delete-users/${id}`);
    return { id, message: response.data.message };
  },

  // Get all users (Super Admin)
  getAllUsers: async (params = {}) => {
    const response = await axiosInstance.get('/super-admin/get-users', { params });
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
    const response = await axiosInstance.get('/super-admin/database/all-data', {
      params,
    });
    return response.data.data;
  },

  resetUserPassword: async (userId, newPassword) => {
    const response = await axiosInstance.patch(
      `/super-admin/users/${userId}/reset-password`,
      { newPassword }
    );
    return { message: response.data.message };
  },

  getAllCompanies: async (params = {}) => {
    const response = await axiosInstance.get('/super-admin/companies', {
      params,
    });
    return response.data.data;
  },

  getCompanyDetails: async (companyId) => {
    const response = await axiosInstance.get(
      `/super-admin/companies/${companyId}`
    );
    return response.data.data;
  },

  getAllTables: async () => {
    const response = await axiosInstance.get('/super-admin/database/tables');
    return response.data.data;
  },

  getTableData: async (tableName, params = {}) => {
    const response = await axiosInstance.get(
      `/super-admin/database/tables/${tableName}`,
      { params }
    );
    return response.data.data;
  },
};

export default userService;
