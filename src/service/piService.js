import axiosInstance from '../utils/axiosInstance';

export const createPiInvoice = async (piData) => {
  try {
    const response = await axiosInstance.post('/create/pi-invoice', piData);
    return {
      data: response.data.data,
      message: response.data.message,
    };
  } catch (error) {
    throw error;
  }
};

export const getAllPiInvoices = async (params = {}) => {
  try {
    const queryParams = {
      page: parseInt(params.page) || 1,
      limit: parseInt(params.limit) || 10,
      search: params.search || '',
      ...(params.includeProducts && { include: 'products' }),
      ...(params.status && { status: params.status })
    };
    
    const { data } = await axiosInstance.get('/get-all/pi-invoices', { params: queryParams });
    return data;
  } catch (error) {
    console.error('Error in getAllPiInvoices:', error);
    
    // Fallback mechanism similar to product service
    if (params.page || params.limit) {
      try {
        const { data } = await axiosInstance.get('/get-all/pi-invoices');
        const piInvoices = data?.data?.piInvoices || data?.piInvoices || [];
        
        let filteredPIs = piInvoices;
        if (params.search) {
          const searchTerm = params.search.toLowerCase();
          filteredPIs = piInvoices.filter(pi => 
            pi.piNumber?.toLowerCase().includes(searchTerm) ||
            pi.partyName?.toLowerCase().includes(searchTerm) ||
            pi.party?.companyName?.toLowerCase().includes(searchTerm)
          );
        }
        
        const page = parseInt(params.page) || 1;
        const limit = parseInt(params.limit) || 10;
        const start = (page - 1) * limit;
        const paginatedData = filteredPIs.slice(start, start + limit);
        
        return {
          data: {
            piInvoices: paginatedData,
            pagination: {
              page,
              limit,
              total: filteredPIs.length,
              pages: Math.ceil(filteredPIs.length / limit)
            }
          }
        };
      } catch (fallbackError) {
        throw fallbackError;
      }
    }
    
    throw error;
  }
};

export const getPiInvoiceHistory = async (id) => {
  try {
    const { data } = await axiosInstance.get(`/${id}/history`);
    return data.data;
  } catch (error) {
    throw error;
  }
};

export const getPiInvoiceById = async (id) => {
  try {
    const response = await axiosInstance.get(`/get-pi-invoice/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching PI invoice:', error);
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
    throw error;
  }
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
  try {
    const response = await axiosInstance.put(`/${id}/update-pi-status`, {
      status,
    });
    return response.data.data;
  } catch (error) {
    console.error('Error updating PI status:', error);
    throw error;
  }
};

export const updatePiAmount = async (id, amountData) => {
  try {
    const response = await axiosInstance.put(`/${id}/update-amount`, amountData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const emailInvoice = async (id, email) => {
  try {
    const response = await axiosInstance.post(`/${id}/email`, { email });
    return response.data;
  } catch (error) {
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
