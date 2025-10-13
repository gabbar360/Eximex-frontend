import axiosInstance from '../utils/axiosInstance';
import handleAxiosError from '../utils/handleAxiosError';

const register = async (userData) => {
  try {
    const { data } = await axiosInstance.post('/register', userData);
    return data;
  } catch (error) {
    throw handleAxiosError(error, 'auth', 'register');
  }
};

const login = async (email, password) => {
  try {
    const { data } = await axiosInstance.post(
      '/login',
      {
        email: email,
        password: password,
      },
      {
        skipAuthRefresh: true, // Skip token refresh for login
      }
    );
    const { accessToken, refreshToken } = data?.data || {};
    if (accessToken) {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
    }
    return data;
  } catch (error) {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    throw handleAxiosError(error, 'auth', 'login');
  }
};

const logout = async () => {
  try {
    const response = await axiosInstance.post('/logout');
    return response.data;
  } catch (error) {
    console.warn('Logout request failed:', error);
    throw handleAxiosError(error, 'auth', 'logout');
  } finally {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
};

const getCurrentUser = async () => {
  try {
    const { data } = await axiosInstance.get('/me');
    return data;
  } catch (error) {
    throw handleAxiosError(error, 'auth', 'fetch');
  }
};

const changePassword = async (oldPassword, newPassword) => {
  try {
    const { data } = await axiosInstance.post('/change-password', {
      oldPassword,
      newPassword,
    });
    return data;
  } catch (error) {
    throw handleAxiosError(error, 'auth', 'change_password');
  }
};

const refreshToken = async () => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const { data } = await axiosInstance.post('/refresh-token', {
      refreshToken,
    });

    const { accessToken, refreshToken: newRefreshToken } = data?.data || {};
    if (accessToken) {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', newRefreshToken);
    }

    return data;
  } catch (error) {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    throw handleAxiosError(error, 'auth', 'token_refresh');
  }
};

const verifyToken = async () => {
  try {
    const { data } = await axiosInstance.get('/verify-token');
    return data;
  } catch (error) {
    throw handleAxiosError(error, 'auth', 'verify');
  }
};

const authService = {
  register,
  login,
  logout,
  getCurrentUser,
  changePassword,
  refreshToken,
  verifyToken,
};

export default authService;
