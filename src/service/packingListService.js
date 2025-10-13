import axiosInstance from '../utils/axiosInstance';

const packingListService = {
  // Get all packing lists
  getAllPackingLists: async (params = {}) => {
    try {
      const response = await axiosInstance.get('/packing-lists', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get packing list by ID
  getPackingListById: async (id) => {
    try {
      const response = await axiosInstance.get(`/packing-lists/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create new packing list
  createPackingList: async (data) => {
    try {
      const response = await axiosInstance.post('/packing-lists', data);
      return { data: response.data.data, message: response.data.message };
    } catch (error) {
      throw error;
    }
  },

  // Update packing list
  updatePackingList: async (id, data) => {
    try {
      const response = await axiosInstance.put(`/packing-lists/${id}`, data);
      return { data: response.data.data, message: response.data.message };
    } catch (error) {
      throw error;
    }
  },

  // Delete packing list
  deletePackingList: async (id) => {
    try {
      const response = await axiosInstance.delete(`/packing-lists/${id}`);
      return { id, message: response.data.message };
    } catch (error) {
      throw error;
    }
  },

  // Download packing list PDF
  downloadPDF: async (id) => {
    try {
      const response = await axiosInstance.get(`/packing-lists/${id}/pdf`, {
        responseType: 'blob',
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // ============ PACKAGING STEPS INTEGRATION ============

  // Create packaging steps for a product
  createPackagingSteps: async (data) => {
    try {
      const response = await axiosInstance.post('/packaging-steps', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update a packaging step
  updatePackagingStep: async (stepId, data) => {
    try {
      const response = await axiosInstance.put(
        `/packaging-steps/${stepId}`,
        data
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete a packaging step
  deletePackagingStep: async (stepId) => {
    try {
      const response = await axiosInstance.delete(`/packaging-steps/${stepId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Download packaging details as PDF
  downloadPackagingPDF: async (piInvoiceId) => {
    try {
      const response = await axiosInstance.get(
        `/packaging-steps/download-pdf/${piInvoiceId}`,
        {
          responseType: 'blob',
        }
      );
      return response;
    } catch (error) {
      throw error;
    }
  },
};

export default packingListService;
