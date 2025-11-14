import axiosInstance from '../utils/axiosInstance';
import handleAxiosError from '../utils/handleAxiosError';

export const getAllCategories = async (params = {}) => {
  try {
    const queryParams = {
      parentId: 'null',
      page: parseInt(params.page) || 1,
      limit: parseInt(params.limit) || 10,
      search: params.search || '',
      ...(params.status !== undefined && { status: params.status })
    };
    
    const { data } = await axiosInstance.get('/get-all/categories', { params: queryParams });
    return data;
  } catch (error) {
    console.error('Category service error:', error.response?.data || error.message);
    
    if (params.page || params.limit) {
      try {
        const { data } = await axiosInstance.get('/get-all/categories?parentId=null');
        const categories = data.data || data;
        
        let filteredCategories = categories;
        if (params.search) {
          const searchTerm = params.search.toLowerCase();
          filteredCategories = categories.filter(category => 
            category.name?.toLowerCase().includes(searchTerm) ||
            category.description?.toLowerCase().includes(searchTerm)
          );
        }
        
        const page = parseInt(params.page) || 1;
        const limit = parseInt(params.limit) || 10;
        const start = (page - 1) * limit;
        const paginatedData = filteredCategories.slice(start, start + limit);
        
        return {
          data: paginatedData,
          pagination: {
            page,
            limit,
            total: filteredCategories.length
          }
        };
      } catch (fallbackError) {
        throw handleAxiosError(fallbackError, 'category', 'fetch');
      }
    }
    
    throw handleAxiosError(error, 'category', 'fetch');
  }
};

export const getCategoryById = async (id) => {
  try {
    const response = await axiosInstance.get(`/get/category/${id}`);
    return response.data.data;
  } catch (error) {
    throw handleAxiosError(error, 'category', 'fetch');
  }
};

export const createCategory = async (categoryData) => {
  try {
    const response = await axiosInstance.post('/create/category', categoryData);
    return {
      data: response.data.data,
      message: response.data.message,
    };
  } catch (error) {
    throw handleAxiosError(error, 'category', 'create');
  }
};

export const updateCategory = async (id, category) => {
  try {
    const response = await axiosInstance.put(
      `/update/category/${id}`,
      category
    );
    return {
      data: response.data.data,
      message: response.data.message,
    };
  } catch (error) {
    throw handleAxiosError(error, 'category', 'update');
  }
};

export const deleteCategory = async (id) => {
  try {
    const response = await axiosInstance.delete(`/delete/category/${id}`);
    return {
      id,
      message: response.data.message,
    };
  } catch (error) {
    throw handleAxiosError(error, 'category', 'delete');
  }
};

export const getAttributeTemplatesByCategoryId = async (categoryId) => {
  try {
    const { data } = await axiosInstance.get(
      `/categories/${categoryId}/attribute`
    );
    return data.data;
  } catch (error) {
    throw handleAxiosError(error, 'category', 'fetch');
  }
};

const categoryService = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getAttributeTemplatesByCategoryId,
};

export default categoryService;
