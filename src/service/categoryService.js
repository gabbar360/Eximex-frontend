import axiosInstance from '../utils/axiosInstance';
import handleAxiosError from '../utils/handleAxiosError';

export const getAllCategories = async () => {
  try {
    const { data } = await axiosInstance.get(
      '/get-all/categories?parentId=null'
    );
    return data.data;
  } catch (error) {
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
