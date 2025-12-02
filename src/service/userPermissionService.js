import axiosInstance from '../utils/axiosInstance';
import { handleAxiosError } from '../utils/handleAxiosError';

const userPermissionService = {
  // Get user permissions
  getUserPermissions: async (userId) => {
    try {
      const { data } = await axiosInstance.get(`/user-permissions/${userId}`);
      return data;
    } catch (error) {
      throw handleAxiosError(error, 'user permission', 'fetch');
    }
  },

  // Set user permissions
  setUserPermissions: async (userId, permissions) => {
    try {
      const response = await axiosInstance.post(`/user-permissions/${userId}`, {
        permissions,
      });
      return response.data;
    } catch (error) {
      throw handleAxiosError(error, 'user permission', 'create');
    }
  },

  // Update user permissions
  updateUserPermissions: async (userId, permissions, submenuPermissions) => {
    try {
      const response = await axiosInstance.put(`/user-permissions/${userId}`, {
        permissions,
        submenuPermissions,
      });
      return response.data;
    } catch (error) {
      throw handleAxiosError(error, 'user permission', 'update');
    }
  },

  // Delete user permissions
  deleteUserPermissions: async (userId, menuItemIds = null) => {
    try {
      const response = await axiosInstance.delete(
        `/user-permissions/${userId}`,
        {
          data: { menuItemIds },
        }
      );
      return response.data;
    } catch (error) {
      throw handleAxiosError(error, 'user permission', 'delete');
    }
  },

  // Get user with permissions
  getUserWithPermissions: async (userId) => {
    try {
      const { data } = await axiosInstance.get(
        `/user-with-permissions/${userId}`
      );
      return data;
    } catch (error) {
      throw handleAxiosError(error, 'user permission', 'fetch');
    }
  },

  // Get all users with permissions
  getAllUsersWithPermissions: async (params = {}) => {
    try {
      const { data } = await axiosInstance.get('/all-users-permissions', { params });
      return data;
    } catch (error) {
      throw handleAxiosError(error, 'user permission', 'fetch');
    }
  },

  // Get user sidebar menu
  getUserSidebarMenu: async () => {
    try {
      const { data } = await axiosInstance.get('/my-sidebar-menu');
      return data;
    } catch (error) {
      throw handleAxiosError(error, 'sidebar menu', 'fetch');
    }
  },
};

export default userPermissionService;
