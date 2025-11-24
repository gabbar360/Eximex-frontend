import axiosInstance from '../utils/axiosInstance';
import handleAxiosError from '../utils/handleAxiosError';

export const shipmentService = {
  create: async (shipmentData) => {
    try {
      return await axiosInstance.post('/shipments', shipmentData);
    } catch (error) {
      throw handleAxiosError(error);
    }
  },

  getById: async (shipmentId) => {
    try {
      return await axiosInstance.get(`/shipments/${shipmentId}`);
    } catch (error) {
      throw handleAxiosError(error);
    }
  },

  getByOrderId: async (orderId) => {
    try {
      return await axiosInstance.get(`/shipments/order/${orderId}`);
    } catch (error) {
      throw handleAxiosError(error);
    }
  },

  update: async (shipmentId, shipmentData) => {
    try {
      return await axiosInstance.put(`/shipments/${shipmentId}`, shipmentData);
    } catch (error) {
      throw handleAxiosError(error);
    }
  },

  getAll: async ({ page = 1, limit = 10, filters = {} }) => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...filters,
      });
      return await axiosInstance.get(`/shipments?${params}`);
    } catch (error) {
      throw handleAxiosError(error);
    }
  },

  delete: async (shipmentId) => {
    try {
      return await axiosInstance.delete(`/shipments/${shipmentId}`);
    } catch (error) {
      throw handleAxiosError(error);
    }
  },
};
