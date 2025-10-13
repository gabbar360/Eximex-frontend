import axiosInstance from '../utils/axiosInstance';
import handleAxiosError from '../utils/handleAxiosError';

export const getAllPackagingUnits = async () => {
  try {
    const { data } = await axiosInstance.get('/packaging/units');
    return data;
  } catch (error) {
    handleAxiosError(error);
    throw error;
  }
};

export const createPackagingUnits = async () => {
  try {
    const { data } = await axiosInstance.post('/packaging/units/seed');
    return data;
  } catch (error) {
    handleAxiosError(error);
    throw error;
  }
};

export const createPackagingHierarchy = async (categoryId, packagingLevels) => {
  try {
    const { data } = await axiosInstance.post('/packaging/hierarchy', {
      categoryId,
      packagingLevels,
    });
    return data;
  } catch (error) {
    handleAxiosError(error);
    throw error;
  }
};

export const getPackagingHierarchy = async (categoryId) => {
  try {
    const { data } = await axiosInstance.get(
      `/packaging/hierarchy/${categoryId}`
    );
    return data;
  } catch (error) {
    handleAxiosError(error);
    throw error;
  }
};

export const getFullPackagingStructure = async (categoryId) => {
  try {
    const { data } = await axiosInstance.get(
      `/packaging/structure/${categoryId}`
    );
    return data;
  } catch (error) {
    handleAxiosError(error);
    throw error;
  }
};

export const convertUnits = async (categoryId, fromUnit, toUnit, quantity) => {
  try {
    const { data } = await axiosInstance.post('/packaging/convert', {
      categoryId,
      fromUnit,
      toUnit,
      quantity,
    });
    return data;
  } catch (error) {
    handleAxiosError(error);
    throw error;
  }
};

const packagingService = {
  getAllPackagingUnits,
  createPackagingUnits,
  createPackagingHierarchy,
  getPackagingHierarchy,
  getFullPackagingStructure,
  convertUnits,
};

export default packagingService;
