import axiosInstance from '../utils/axiosInstance';
import handleAxiosError from '../utils/handleAxiosError';

export const createPiInvoice = async (piData) => {
  try {
    const response = await axiosInstance.post('/create/pi-invoice', piData);
    return {
      data: response.data.data,
      message: response.data.message,
    };
  } catch (error) {
    handleAxiosError(error);
    throw error;
  }
};

export const getAllPiInvoices = async (
  includeProducts = false,
  status = null
) => {
  try {
    const params = new URLSearchParams();
    if (includeProducts) params.append('include', 'products');
    if (status) params.append('status', status);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    const { data } = await axiosInstance.get(
      `/get-all/pi-invoices${queryString}`
    );
    return {
      piInvoices: data?.data?.piInvoices || [],
      message: data?.message || 'Success'
    };
  } catch (error) {
    console.error('Error in getAllPiInvoices:', error);
    handleAxiosError(error);
    return {
      piInvoices: [],
      message: 'Error fetching invoices'
    };
  }
};

export const getPiInvoiceHistory = async (id) => {
  try {
    const { data } = await axiosInstance.get(`/${id}/history`);
    return data.data;
  } catch (error) {
    handleAxiosError(error);
    throw error;
  }
};

export const getPiInvoiceById = async (id) => {
  try {
    const response = await axiosInstance.get(`/get-pi-invoice/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching PI invoice:', error);
    handleAxiosError(error);
    throw error;
  }
};

export const updatePiInvoice = async (id, piData) => {
  try {
    const response = await axiosInstance.put(
      `/update/pi-invoice/${id}`,
      piData
    );
    return {
      data: response.data.data,
      message: response.data.message,
    };
  } catch (error) {
    console.error('Error updating PI invoice:', error);
    handleAxiosError(error);
    throw error;
  }
};

export const deletePiInvoice = async (id) => {
  try {
    const response = await axiosInstance.delete(`/delete/pi-invoice/${id}`);
    return {
      id,
      message: response.data.message,
    };
  } catch (error) {
    handleAxiosError(error);
    throw error;
  }
};

export const downloadPiInvoicePdf = async (id) => {
  try {
    const response = await axiosInstance.get(`/${id}/download-pdf`, {
      responseType: 'blob', // Important for handling binary data
    });

    // Create blob link to download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;

    // Get filename from response headers or use default
    const contentDisposition = response.headers['content-disposition'];
    let filename = `PI-Invoice-${id}.pdf`;

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

export const updatePiStatus = async (id, status) => {
  try {
    const response = await axiosInstance.put(`/${id}/update-pi-status`, {
      status,
    });
    return response.data.data;
  } catch (error) {
    console.error('Error updating PI status:', error);
    handleAxiosError(error);
    throw error;
  }
};

export const updatePiAmount = async (id, amountData) => {
  try {
    const response = await axiosInstance.put(`/${id}/update-amount`, amountData);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
    throw error;
  }
};

export const emailInvoice = async (id, email) => {
  try {
    const response = await axiosInstance.post(`/${id}/email`, { email });
    return response.data;
  } catch (error) {
    handleAxiosError(error);
    throw error;
  }
};

const piService = {
  createPiInvoice,
  getAllPiInvoices,
  getAllPerformaInvoices: getAllPiInvoices, // Alias for compatibility
  getPiInvoiceById,
  getPiInvoiceHistory,
  updatePiInvoice,
  updatePiAmount,
  deletePiInvoice,
  downloadPiInvoicePdf,
  updatePiStatus,
  emailInvoice,
};

export default piService;
