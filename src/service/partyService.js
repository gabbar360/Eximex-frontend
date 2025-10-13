import axiosInstance from '../utils/axiosInstance';
import handleAxiosError from '../utils/handleAxiosError';

export const getAllParties = async () => {
  try {
    const { data } = await axiosInstance.get('/get-all/parties');
    return data.data;
  } catch (error) {
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
    console.error('Error updating party:', error);
    throw handleAxiosError(error, 'party', 'update');
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
