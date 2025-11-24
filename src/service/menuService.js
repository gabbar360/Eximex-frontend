import axiosInstance from '../utils/axiosInstance';
import { handleAxiosError } from '../utils/handleAxiosError';

const menuService = {
  // Get all menus with submenus
  getAllMenus: async () => {
    try {
      const { data } = await axiosInstance.get('/menus');
      return data;
    } catch (error) {
      throw handleAxiosError(error, 'menu', 'fetch');
    }
  },

  // Get menu by ID
  getMenuById: async (id) => {
    try {
      const { data } = await axiosInstance.get(`/menus/${id}`);
      return data;
    } catch (error) {
      throw handleAxiosError(error, 'menu', 'fetch');
    }
  },

  // Create menu
  createMenu: async (menuData) => {
    try {
      const response = await axiosInstance.post('/menus', menuData);
      return response.data;
    } catch (error) {
      throw handleAxiosError(error, 'menu', 'create');
    }
  },

  // Update menu
  updateMenu: async (id, menuData) => {
    try {
      const response = await axiosInstance.put(`/menus/${id}`, menuData);
      return response.data;
    } catch (error) {
      throw handleAxiosError(error, 'menu', 'update');
    }
  },

  // Delete menu
  deleteMenu: async (id) => {
    try {
      const response = await axiosInstance.delete(`/menus/${id}`);
      return {
        id,
        message: response.data.message,
      };
    } catch (error) {
      throw handleAxiosError(error, 'menu', 'delete');
    }
  },

  // Create submenu
  createSubmenu: async (submenuData) => {
    try {
      const response = await axiosInstance.post('/submenus', submenuData);
      return response.data;
    } catch (error) {
      throw handleAxiosError(error, 'submenu', 'create');
    }
  },

  // Update submenu
  updateSubmenu: async (id, submenuData) => {
    try {
      const response = await axiosInstance.put(`/submenus/${id}`, submenuData);
      return response.data;
    } catch (error) {
      throw handleAxiosError(error, 'submenu', 'update');
    }
  },

  // Delete submenu
  deleteSubmenu: async (id) => {
    try {
      const response = await axiosInstance.delete(`/submenus/${id}`);
      return {
        id,
        message: response.data.message,
      };
    } catch (error) {
      throw handleAxiosError(error, 'submenu', 'delete');
    }
  },
};

export default menuService;
