import axiosInstance from '../utils/axiosInstance';
import handleAxiosError from '../utils/handleAxiosError';

export const getAllOrders = async (params = {}) => {
  try {
    const { data } = await axiosInstance.get('/get/all-orders', { params });
    return data;
  } catch (error) {
    throw handleAxiosError(error, 'order', 'fetch');
  }
};

export const getOrderById = async (id) => {
  try {
    const { data } = await axiosInstance.get(`/get/order-by-id/${id}`);
    return data;
  } catch (error) {
    throw handleAxiosError(error, 'order', 'fetch');
  }
};

export const createOrder = async (orderData) => {
  try {
    const { data } = await axiosInstance.post('/create-order', orderData);
    return { data: data.data, message: data.message };
  } catch (error) {
    throw handleAxiosError(error, 'order', 'create');
  }
};

export const createOrderFromPi = async (piId) => {
  try {
    const { data } = await axiosInstance.post(`/from-pi/${piId}`);
    return { data: data.data, message: data.message };
  } catch (error) {
    throw handleAxiosError(error, 'order', 'create');
  }
};

export const updateOrder = async (id, orderData) => {
  try {
    const { data } = await axiosInstance.put(`/update-order/${id}`, orderData);
    return { data: data.data, message: data.message };
  } catch (error) {
    throw handleAxiosError(error, 'order', 'update');
  }
};

export const updateOrderStatus = async (id, status) => {
  try {
    const { data } = await axiosInstance.patch(`/${id}/status`, { status });
    return { data: data.data, message: data.message };
  } catch (error) {
    throw handleAxiosError(error, 'order', 'update');
  }
};

export const updatePaymentStatus = async (id, paymentStatus) => {
  try {
    const { data } = await axiosInstance.patch(`/${id}/payment-status`, {
      paymentStatus,
    });
    return { data: data.data, message: data.message };
  } catch (error) {
    throw handleAxiosError(error, 'order', 'update');
  }
};

export const deleteOrder = async (id) => {
  try {
    const { data } = await axiosInstance.delete(`/delete-order/${id}`);
    return { id, message: data.message };
  } catch (error) {
    throw handleAxiosError(error, 'order', 'delete');
  }
};

export const downloadOrderInvoicePdf = async (id) => {
  try {
    const response = await axiosInstance.get(`/orders/${id}/download-invoice-pdf`, {
      responseType: 'blob', // Important for handling binary data
    });

    // Create blob link to download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;

    // Get filename from response headers or use default
    const contentDisposition = response.headers['content-disposition'];
    let filename = `Order-Invoice-${id}.pdf`;

    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="(.+)"/);
      if (filenameMatch) {
        filename = filenameMatch[1];
      }
    }

    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    return { success: true, filename };
  } catch (error) {
    console.error('Error downloading PDF:', error);
    handleAxiosError(error);
    throw error;
  }
};

const orderService = {
  getAllOrders,
  getOrderById,
  createOrder,
  createOrderFromPi,
  updateOrder,
  updateOrderStatus,
  updatePaymentStatus,
  deleteOrder,
  downloadOrderInvoicePdf,
};

export default orderService;
