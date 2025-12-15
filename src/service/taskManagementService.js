import axiosInstance from '../utils/axiosInstance';

const taskManagementService = {
  // Get tasks
  getTasks: async (params = {}) => {
    console.log('🌐 Frontend service getTasks called with params:', params);
    try {
      const response = await axiosInstance.get('/task-management', { params });
      console.log('✅ Frontend service response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Frontend service error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Create task (Admin only)
  createTask: async (taskData) => {
    const response = await axiosInstance.post('/task-management/tasks', taskData);
    return response.data;
  },

  // Update task status
  updateTaskStatus: async (taskId, status) => {
    const response = await axiosInstance.patch(`/task-management/tasks/${taskId}/status`, { status });
    return response.data;
  },

  // Get task by ID
  getTaskById: async (taskId) => {
    const response = await axiosInstance.get(`/task-management/tasks/${taskId}`);
    return response.data;
  },

  // Delete task (Admin only)
  deleteTask: async (taskId) => {
    const response = await axiosInstance.delete(`/task-management/tasks/${taskId}`);
    return response.data;
  },

  // Get staff list (Admin only)
  getStaffList: async () => {
    const response = await axiosInstance.get('/task-management/staff-list');
    return response.data;
  }
};

export default taskManagementService;