import axios from 'axios';
import API_URL from './config.js';

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

import { handleAxiosError } from './handleAxiosError.js';

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Skip token refresh for login requests
    if (originalRequest.skipAuthRefresh) {
      return Promise.reject(handleAxiosError(error));
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Create a new axios instance to avoid interceptor loop
        const refreshResponse = await axios.post(
          `${API_URL}/refresh-token`,
          {
            refreshToken,
          },
          {
            withCredentials: true,
          }
        );

        const { accessToken, refreshToken: newRefreshToken } =
          refreshResponse.data.data;

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.error('Token refresh failed', refreshError);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        return Promise.reject(
          handleAxiosError(refreshError, 'auth', 'token_refresh')
        );
      }
    }
    // Return user-friendly error for all other cases
    return Promise.reject(handleAxiosError(error));
  }
);

export default axiosInstance;
