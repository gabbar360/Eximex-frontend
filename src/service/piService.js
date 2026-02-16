import axiosInstance from '../utils/axiosInstance';

export const createPiInvoice = async (piData) => {
  const response = await axiosInstance.post('/create/pi-invoice', piData);
  return {
    data: response.data.data,
    message: response.data.message,
  };
};

export const getAllPiInvoices = async (params = {}) => {
  const queryParams = {
    page: parseInt(params.page) || 1,
    limit: parseInt(params.limit) || 10,
    search: params.search || '',
    ...(params.includeProducts && { include: 'products' }),
    ...(params.status && { status: params.status }),
  };

  const { data } = await axiosInstance.get('/get-all/pi-invoices', {
    params: queryParams,
  });
  return data;
};

export const getPiInvoiceHistory = async (id) => {
  const { data } = await axiosInstance.get(`/${id}/history`);
  return data.data;
};

export const getPiInvoiceById = async (id) => {
  const response = await axiosInstance.get(`/get-pi-invoice/${id}`);
  return response.data;
};

export const updatePiInvoice = async (id, piData) => {
  const response = await axiosInstance.put(`/update/pi-invoice/${id}`, piData);
  return {
    data: response.data.data,
    message: response.data.message,
  };
};

export const deletePiInvoice = async (id) => {
  const response = await axiosInstance.delete(`/delete/pi-invoice/${id}`);
  return {
    id,
    message: response.data.message,
  };
};

export const downloadPiInvoicePdf = async (id) => {
  try {
    const response = await axiosInstance.get(`/download-pi-pdf/${id}`, {
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
    throw error;
  }
};

export const updatePiStatus = async (id, status) => {
  const response = await axiosInstance.put(`/${id}/update-pi-status`, {
    status,
  });
  return response.data.data;
};

export const updatePiAmount = async (id, amountData) => {
  const response = await axiosInstance.put(`/${id}/update-amount`, amountData);
  return response.data;
};

export const emailInvoice = async (id, email) => {
  const response = await axiosInstance.post(`/${id}/email`, { email });
  return response.data;
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
