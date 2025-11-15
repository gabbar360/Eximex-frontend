import axiosInstance from '../utils/axiosInstance';
import handleAxiosError from '../utils/handleAxiosError';

const createVgm = async (vgmData) => {
  try {
    const { data } = await axiosInstance.post('/vgm', vgmData);
    return { data: data.data, message: data.message, success: data.success };
  } catch (error) {
    handleAxiosError(error);
  }
};

const getVgmDocuments = async (params = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const { data } = await axiosInstance.get(`/vgm?${queryString}`);
    return data;
  } catch (error) {
    handleAxiosError(error);
  }
};

const getVgmById = async (id) => {
  try {
    const { data } = await axiosInstance.get(`/vgm/${id}`);
    return data;
  } catch (error) {
    handleAxiosError(error);
  }
};

const updateVgm = async (id, vgmData) => {
  try {
    const { data } = await axiosInstance.put(`/vgm/${id}`, vgmData);
    return { data: data.data, message: data.message, success: data.success };
  } catch (error) {
    handleAxiosError(error);
  }
};

const deleteVgm = async (id) => {
  try {
    const { data } = await axiosInstance.delete(`/vgm/${id}`);
    return { id, message: data.message };
  } catch (error) {
    handleAxiosError(error);
  }
};

const downloadVgmPdf = async (id) => {
  try {
    const response = await axiosInstance.get(`/vgm/${id}/pdf`, {
      responseType: 'blob',
    });
    return response;
  } catch (error) {
    handleAxiosError(error);
    throw error;
  }
};

const vgmService = {
  createVgm,
  getVgmDocuments,
  getVgmById,
  updateVgm,
  deleteVgm,
  downloadVgmPdf,
};

export default vgmService;
