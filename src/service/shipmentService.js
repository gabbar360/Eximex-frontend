import axiosInstance from '../utils/axiosInstance';

export const shipmentService = {
  create: (shipmentData) => axiosInstance.post('/shipments', shipmentData),
  
  getById: (shipmentId) => axiosInstance.get(`/shipments/${shipmentId}`),
  
  getByOrderId: (orderId) => axiosInstance.get(`/shipments/order/${orderId}`),
  
  update: (shipmentId, shipmentData) => axiosInstance.put(`/shipments/${shipmentId}`, shipmentData),
  
  getAll: ({ page = 1, limit = 10, filters = {} }) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters
    });
    return axiosInstance.get(`/shipments?${params}`);
  },
  
  delete: (shipmentId) => axiosInstance.delete(`/shipments/${shipmentId}`)
};