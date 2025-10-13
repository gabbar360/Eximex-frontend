import axiosInstance from '../utils/axiosInstance';
import { handleAxiosError } from '../utils/handleAxiosError';

const productService = {
  // Get all products
  getAllProducts: async (params = {}) => {
    try {
      const { data } = await axiosInstance.get('/get-all/products', { params });
      return data.data;
    } catch (error) {
      throw handleAxiosError(error, 'product', 'fetch');
    }
  },

  // Get product by ID
  getProductById: async (id) => {
    try {
      const { data } = await axiosInstance.get(`/get/product/${id}`);
      return data;
    } catch (error) {
      throw handleAxiosError(error, 'product', 'fetch');
    }
  },

  // Create product
  createProduct: async (productData) => {
    try {
      const response = await axiosInstance.post('/create/product', productData);
      return response.data;
    } catch (error) {
      throw handleAxiosError(error, 'product', 'create');
    }
  },

  // Update product
  updateProduct: async (id, productData) => {
    try {
      const response = await axiosInstance.put(
        `/update/product/${id}`,
        productData
      );
      return response.data;
    } catch (error) {
      throw handleAxiosError(error, 'product', 'update');
    }
  },

  // Delete product
  deleteProduct: async (id) => {
    try {
      const response = await axiosInstance.delete(`/delete/product/${id}`);
      return {
        id,
        message: response.data.message,
      };
    } catch (error) {
      throw handleAxiosError(error, 'product', 'delete');
    }
  },

  // Get product stats
  getProductStats: async () => {
    try {
      const { data } = await axiosInstance.get('/stats/products');
      return data;
    } catch (error) {
      throw handleAxiosError(error, 'product', 'fetch');
    }
  },
};

export default productService;
