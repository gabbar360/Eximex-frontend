import axiosInstance from '../utils/axiosInstance';

export const getCompanies = async () => {
  try {
    const { data } = await axiosInstance.get('/get-all/companies');
    return data;
  } catch (error) {
    console.error('Get companies error:', error);
    throw error.response?.data || error;
  }
};

export const getCompanyById = async (id) => {
  try {
    const { data } = await axiosInstance.get(`/get/company/${id}`);
    return data;
  } catch (error) {
    console.error('Get company error:', error);
    throw error.response?.data || error;
  }
};

export const createCompany = async (formData) => {
  try {
    const { data } = await axiosInstance.post('/create/company', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return { data: data.data, message: data.message };
  } catch (error) {
    console.error('Create company error:', error);
    const backendMessage = error.response?.data?.message || error.message;
    const enhancedError = new Error(backendMessage);
    enhancedError.response = error.response;
    throw enhancedError;
  }
};

export const updateCompany = async (id, formData) => {
  try {
    const { data } = await axiosInstance.put(
      `/update/company/${id}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return { data: data.data, message: data.message };
  } catch (error) {
    console.error('Update company error:', error);
    throw error.response?.data || error;
  }
};
