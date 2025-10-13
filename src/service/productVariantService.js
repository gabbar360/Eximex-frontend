// src/services/productVariantService.js
import axiosInstance from '../utils/axiosInstance';
import handleAxiosError from '../utils/handleAxiosError';

export const getAllProductVariants = async (options = {}) => {
  try {
    const { data } = await axiosInstance.get('/get-all/product-variants', {
      params: options,
    });
    return data.data;
  } catch (error) {
    handleAxiosError(error);
    throw error;
  }
};

export const getProductVariantById = async (id) => {
  try {
    const { data } = await axiosInstance.get(`/get/product-variant/${id}`);
    return data.data;
  } catch (error) {
    handleAxiosError(error);
    throw error;
  }
};

export const createProductVariant = async (variant) => {
  try {
    const { data } = await axiosInstance.post(
      '/create/product-variant',
      variant
    );
    return data.data;
  } catch (error) {
    handleAxiosError(error);
    throw error;
  }
};

export const updateProductVariant = async (id, variant) => {
  try {
    const { data } = await axiosInstance.put(
      `/update/product-variant/${id}`,
      variant
    );
    return data.data;
  } catch (error) {
    handleAxiosError(error);
    throw error;
  }
};

export const deleteProductVariant = async (id) => {
  try {
    await axiosInstance.delete(`/delete/product-variant/${id}`);
    return id;
  } catch (error) {
    handleAxiosError(error);
    throw error;
  }
};

const productVariantService = {
  getAllProductVariants,
  getProductVariantById,
  createProductVariant,
  updateProductVariant,
  deleteProductVariant,
};

export default productVariantService;
