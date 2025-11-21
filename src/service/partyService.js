import axiosInstance from '../utils/axiosInstance';
import handleAxiosError from '../utils/handleAxiosError';

export const getAllParties = async (params = {}) => {
  try {
    // First try with pagination parameters
    if (params.page || params.limit || params.search) {
      const queryParams = {
        page: parseInt(params.page) || 1,
        limit: parseInt(params.limit) || 10,
        search: params.search || '',
        ...(params.role && { role: params.role }),
        ...(params.status !== undefined && { status: params.status })
      };
      
      const { data } = await axiosInstance.get('/get-all/parties', { params: queryParams });
      return data;
    } else {
      // Fallback to simple request without pagination
      const { data } = await axiosInstance.get('/get-all/parties');
      return {
        data: data.data || data,
        pagination: {
          page: 1,
          limit: (data.data || data).length,
          total: (data.data || data).length
        }
      };
    }
  } catch (error) {
    console.error('Party service error:', error.response?.data || error.message);
    
    // If pagination request fails, try without pagination
    if (params.page || params.limit) {
      try {
        const { data } = await axiosInstance.get('/get-all/parties');
        const parties = data.data || data;
        
        // Apply client-side filtering if search term exists
        let filteredParties = parties;
        if (params.search) {
          const searchTerm = params.search.toLowerCase();
          filteredParties = parties.filter(party => 
            party.companyName?.toLowerCase().includes(searchTerm) ||
            party.contactPerson?.toLowerCase().includes(searchTerm) ||
            party.email?.toLowerCase().includes(searchTerm)
          );
        }
        
        // Apply client-side pagination
        const page = parseInt(params.page) || 1;
        const limit = parseInt(params.limit) || 10;
        const start = (page - 1) * limit;
        const paginatedData = filteredParties.slice(start, start + limit);
        
        return {
          data: paginatedData,
          pagination: {
            page,
            limit,
            total: filteredParties.length
          }
        };
      } catch (fallbackError) {
        throw handleAxiosError(fallbackError, 'party', 'fetch');
      }
    }
    
    throw handleAxiosError(error, 'party', 'fetch');
  }
};

export const getPartyById = async (id) => {
  try {
    const response = await axiosInstance.get(`/get/party/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching party:', error);
    throw handleAxiosError(error, 'party', 'fetch');
  }
};

export const createParty = async (party) => {
  try {
    const response = await axiosInstance.post('/create/party', party);
    return {
      data: response.data.data,
      message: response.data.message,
    };
  } catch (error) {
    throw handleAxiosError(error, 'party', 'create');
  }
};

export const updateParty = async (id, party) => {
  try {
    const response = await axiosInstance.put(`/update/party/${id}`, party);
    return {
      data: response.data.data,
      message: response.data.message,
    };
  } catch (error) {
    throw error;
  }
};

export const deleteParty = async (id) => {
  try {
    const response = await axiosInstance.delete(`/delete/party/${id}`);
    return {
      id,
      message: response.data.message,
    };
  } catch (error) {
    throw handleAxiosError(error, 'party', 'delete');
  }
};

const partyService = {
  getAllParties,
  getPartyById,
  createParty,
  updateParty,
  deleteParty,
};

export default partyService;
