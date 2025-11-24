import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import menuService from '../service/menuService';

export const fetchMenus = createAsyncThunk(
  'menu/fetchMenus',
  async (_, { rejectWithValue }) => {
    try {
      return await menuService.getAllMenus();
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch menus');
    }
  }
);

export const addMenu = createAsyncThunk(
  'menu/addMenu',
  async (menu, { rejectWithValue }) => {
    try {
      const response = await menuService.createMenu(menu);
      return response;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateMenu = createAsyncThunk(
  'menu/updateMenu',
  async ({ id, menu }, { rejectWithValue }) => {
    try {
      const response = await menuService.updateMenu(id, menu);
      return response;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const deleteMenu = createAsyncThunk(
  'menu/deleteMenu',
  async (id, { rejectWithValue }) => {
    try {
      const response = await menuService.deleteMenu(id);
      return response;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const getMenuById = createAsyncThunk(
  'menu/getMenuById',
  async (id, { rejectWithValue }) => {
    try {
      return await menuService.getMenuById(id);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const addSubmenu = createAsyncThunk(
  'menu/addSubmenu',
  async (submenu, { rejectWithValue }) => {
    try {
      const response = await menuService.createSubmenu(submenu);
      return response;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateSubmenu = createAsyncThunk(
  'menu/updateSubmenu',
  async ({ id, submenu }, { rejectWithValue }) => {
    try {
      const response = await menuService.updateSubmenu(id, submenu);
      return response;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const deleteSubmenu = createAsyncThunk(
  'menu/deleteSubmenu',
  async (id, { rejectWithValue }) => {
    try {
      const response = await menuService.deleteSubmenu(id);
      return response;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const menuSlice = createSlice({
  name: 'menu',
  initialState: {
    menus: [],
    loading: false,
    error: null,
    selectedMenu: null,
  },
  reducers: {
    setSelectedMenu(state, { payload }) {
      state.selectedMenu = payload;
    },
    clearSelectedMenu(state) {
      state.selectedMenu = null;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch menus
      .addCase(fetchMenus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMenus.fulfilled, (state, { payload }) => {
        state.loading = false;
        const responseData = payload?.data || payload;
        state.menus = responseData || [];
      })
      .addCase(fetchMenus.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      // Add menu
      .addCase(addMenu.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addMenu.fulfilled, (state, { payload }) => {
        state.loading = false;
        const menuData = payload?.data || payload;
        state.menus.push(menuData);
      })
      .addCase(addMenu.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      // Update menu
      .addCase(updateMenu.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateMenu.fulfilled, (state, { payload }) => {
        state.loading = false;
        const menuData = payload?.data || payload;
        state.menus = state.menus.map((m) =>
          m.id === menuData.id ? menuData : m
        );
      })
      .addCase(updateMenu.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      // Delete menu
      .addCase(deleteMenu.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteMenu.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.menus = state.menus.filter((m) => m.id !== payload.id);
      })
      .addCase(deleteMenu.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      // Add submenu
      .addCase(addSubmenu.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addSubmenu.fulfilled, (state, { payload }) => {
        state.loading = false;
        const submenuData = payload?.data || payload;
        const menu = state.menus.find((m) => m.id === submenuData.menuId);
        if (menu) {
          if (!menu.submenus) menu.submenus = [];
          menu.submenus.push(submenuData);
        }
      })
      .addCase(addSubmenu.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      // Update submenu
      .addCase(updateSubmenu.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSubmenu.fulfilled, (state, { payload }) => {
        state.loading = false;
        const submenuData = payload?.data || payload;
        const menu = state.menus.find((m) => m.id === submenuData.menuId);
        if (menu && menu.submenus) {
          menu.submenus = menu.submenus.map((s) =>
            s.id === submenuData.id ? submenuData : s
          );
        }
      })
      .addCase(updateSubmenu.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      // Delete submenu
      .addCase(deleteSubmenu.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteSubmenu.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.menus.forEach((menu) => {
          if (menu.submenus) {
            menu.submenus = menu.submenus.filter((s) => s.id !== payload.id);
          }
        });
      })
      .addCase(deleteSubmenu.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      });
  },
});

export const { setSelectedMenu, clearSelectedMenu, clearError } =
  menuSlice.actions;
export default menuSlice.reducer;
