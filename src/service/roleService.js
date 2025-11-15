import axiosInstance from '../utils/axiosInstance';

const roleService = {
  // Get all roles
  getAllRoles: async () => {
    const response = await axiosInstance.get('/getroles');
    return response.data;
  },

  // Create new role
  createRole: async (roleData) => {
    const response = await axiosInstance.post('/create-role', roleData);
    return response.data;
  },

  // Update role
  updateRole: async (id, roleData) => {
    const response = await axiosInstance.put(`/update-roles/${id}`, roleData);
    return response.data;
  },

  // Delete role
  deleteRole: async (id) => {
    const response = await axiosInstance.delete(`/delete-roles/${id}`);
    return response.data;
  }
};

export default roleService;