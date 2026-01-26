import axiosInstance from '../utils/axiosInstance';
import { handleAxiosError } from '../utils/handleAxiosError';

const productService = {
  // Get all products
  getAllProducts: async (params = {}) => {
    try {
      const queryParams = {
        page: parseInt(params.page) || 1,
        limit: parseInt(params.limit) || 10,
        search: params.search || '',
        ...(params.categoryId && { categoryId: params.categoryId }),
        ...(params.subCategoryId && { subCategoryId: params.subCategoryId }),
        ...(params.status !== undefined && { status: params.status }),
      };

      const { data } = await axiosInstance.get('/get-all/products', {
        params: queryParams,
      });
      return data;
    } catch (error) {
      console.error(
        'Product service error:',
        error.response?.data || error.message
      );

      if (params.page || params.limit) {
        try {
          const { data } = await axiosInstance.get('/get-all/products');
          const products = data.data || data;

          let filteredProducts = products;
          if (params.search) {
            const searchTerm = params.search.toLowerCase();
            filteredProducts = products.filter(
              (product) =>
                product.name?.toLowerCase().includes(searchTerm) ||
                product.sku?.toLowerCase().includes(searchTerm) ||
                product.description?.toLowerCase().includes(searchTerm)
            );
          }

          const page = parseInt(params.page) || 1;
          const limit = parseInt(params.limit) || 10;
          const start = (page - 1) * limit;
          const paginatedData = filteredProducts.slice(start, start + limit);

          return {
            data: paginatedData,
            pagination: {
              page,
              limit,
              total: filteredProducts.length,
            },
          };
        } catch (fallbackError) {
          throw handleAxiosError(fallbackError, 'product', 'fetch');
        }
      }

      throw handleAxiosError(error, 'product', 'fetch');
    }
  },

  // Get product by ID
  getProductById: async (id) => {
    const { data } = await axiosInstance.get(`/get/product/${id}`);
    return data;
  },

  // Create product
  createProduct: async (productData) => {
    const response = await axiosInstance.post('/create/product', productData);
    return response.data;
  },

  // Update product
  updateProduct: async (id, productData) => {
    const response = await axiosInstance.put(
      `/update/product/${id}`,
      productData
    );
    return response.data;
  },

  // Delete product
  deleteProduct: async (id) => {
    const response = await axiosInstance.delete(`/delete/product/${id}`);
    return {
      id,
      message: response.data.message,
    };
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

  // Bulk upload products
  bulkUpload: async (formData) => {
    const response = await axiosInstance.post(
      '/bulk-upload/products',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  // Download template
  downloadTemplate: async () => {
    const response = await axiosInstance.get('/download/template', {
      responseType: 'blob',
    });
    return response;
  },
};

export default productService;
