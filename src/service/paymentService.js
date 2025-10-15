import axiosInstance from '../utils/axiosInstance';

const paymentService = {
  getPayments: (params = {}) => {
    return axiosInstance.get('/payments', { params });
  },

  getDuePayments: () => {
    return axiosInstance.get('/payments/due');
  },

  createPayment: (data) => {
    return axiosInstance.post('/payments', data);
  },

  updatePaymentStatus: (id, status) => {
    return axiosInstance.patch(`/payments/${id}/status`, { status });
  },
};

export default paymentService;
