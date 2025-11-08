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
    // Don't throw error, just log it
  } finally {
    // Always clear localStorage regardless of API success/failure
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('selectedOrderId');
    localStorage.removeItem('theme');
    return { message: 'Logged out successfully' };
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

// Google OAuth
const googleLogin = () => {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  const apiUrl = apiBaseUrl.replace('/api/v1', '');
  window.location.href = `${apiUrl}/api/v1/auth/google`;
};

const handleGoogleCallback = (urlParams) => {
  const token = urlParams.get('token');
  const refresh = urlParams.get('refresh');
  const userParam = urlParams.get('user');

  if (token && refresh) {
    localStorage.setItem('accessToken', token);
    localStorage.setItem('refreshToken', refresh);

    // If user data is provided in URL, return it
    if (userParam) {
      try {
        const userData = JSON.parse(decodeURIComponent(userParam));
        return { success: true, userData };
      } catch (error) {
        console.warn('Failed to parse user data from URL:', error);
      }
    }

    return { success: true };
  }
  return { success: false };
};

const forgotPassword = async (email) => {
  try {
    const { data } = await axiosInstance.post(
      '/forgot-password',
      { email },
      {
        skipAuthRefresh: true,
      }
    );
    return data;
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    throw new Error(message);
  }
};

const resetPassword = async (resetData) => {
  try {
    const { data } = await axiosInstance.post('/reset-password', resetData, {
      skipAuthRefresh: true,
    });
    return data;
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    throw new Error(message);
  }
};

const authService = {
  register,
  login,
  logout,
  getCurrentUser,
  changePassword,
  forgotPassword,
  resetPassword,
  refreshToken,
  verifyToken,
  googleLogin,
  handleGoogleCallback,
};

export default authService;
