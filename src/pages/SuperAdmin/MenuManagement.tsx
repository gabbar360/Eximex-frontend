import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Table, Switch, Pagination } from 'antd';
import { toast } from 'react-toastify';
import {
  HiPlus,
  HiPencil,
  HiTrash,
  HiListBullet,
  HiCog6Tooth,
  HiBars3,
  HiMagnifyingGlass,
  HiArrowLeft,
  HiCheckCircle,
} from 'react-icons/hi2';
import { MdMenu, MdMenuOpen, MdSettings } from 'react-icons/md';
import {
  fetchMenus,
  addMenu,
  updateMenu,
  deleteMenu,
  addSubmenu,
  updateSubmenu,
  deleteSubmenu,
  clearError,
} from '../../features/menuSlice';
import axiosInstance from '../../utils/axiosInstance';
import { useDebounce } from '../../utils/useDebounce';

const MenuManagement = () => {
  const dispatch = useDispatch();
  const { menus, loading, error, pagination } = useSelector(
    (state) => state.menu
  );

  const [showForm, setShowForm] = useState(false);
  const [isSubmenuModal, setIsSubmenuModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedMenuId, setSelectedMenuId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleteType, setDeleteType] = useState('menu');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    path: '',
    icon: '',
    sortOrder: '',
    isActive: true,
    menuId: '',
  });

  useEffect(() => {
    dispatch(
      fetchMenus({
        page: currentPage,
        limit: pageSize,
        search: '',
      })
    );
  }, [dispatch, currentPage, pageSize]);

  // Initial load
  useEffect(() => {
    dispatch(
      fetchMenus({
        page: 1,
        limit: 10,
        search: '',
      })
    );
  }, [dispatch]);

  const { debouncedCallback: debouncedSearch } = useDebounce(
    (value: string) => {
      dispatch(
        fetchMenus({
          page: 1,
          limit: pageSize,
          search: value,
        })
      );
    },
    500
  );

  const handleSearch = useCallback(
    (value: string) => {
      setSearchTerm(value);
      setCurrentPage(1);
      debouncedSearch(value);
    },
    [debouncedSearch]
  );

  useEffect(() => {
    if (error) {
      message.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleAddMenu = () => {
    resetForm();
    setIsSubmenuModal(false);
    setShowForm(true);
  };

  const handleEditMenu = (menu) => {
    setEditingItem(menu);
    setIsSubmenuModal(false);
    setFormData({
      name: menu.name || '',
      slug: menu.slug || '',
      path: menu.path || '',
      icon: menu.icon || '',
      sortOrder: menu.sortOrder || '',
      isActive: menu.isActive !== undefined ? menu.isActive : true,
      menuId: '',
    });
    setShowForm(true);
  };

  const handleAddSubmenu = (menuId) => {
    resetForm();
    setSelectedMenuId(menuId);
    setIsSubmenuModal(true);
    setFormData({ ...formData, menuId: menuId.toString() });
    setShowForm(true);
  };

  const handleEditSubmenu = (submenu) => {
    setEditingItem(submenu);
    setIsSubmenuModal(true);
    setFormData({
      name: submenu.name || '',
      slug: submenu.slug || '',
      path: submenu.path || '',
      icon: '',
      sortOrder: submenu.sortOrder || '',
      isActive: submenu.isActive !== undefined ? submenu.isActive : true,
      menuId: submenu.menuId?.toString() || '',
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      path: '',
      icon: '',
      sortOrder: '',
      isActive: true,
      menuId: '',
    });
    setEditingItem(null);
    setSelectedMenuId(null);
    setIsSubmenuModal(false);
    setShowForm(false);
  };

  const handleDeleteMenuClick = (menu) => {
    setConfirmDelete(menu);
    setDeleteType('menu');
  };

  const handleDeleteSubmenuClick = (submenu) => {
    setConfirmDelete(submenu);
    setDeleteType('submenu');
  };

  const handleConfirmDelete = async () => {
    if (confirmDelete) {
      try {
        if (deleteType === 'menu') {
          const response = await dispatch(
            deleteMenu(confirmDelete.id)
          ).unwrap();
          toast.success(response?.message || 'Menu deleted successfully');
        } else {
          const response = await dispatch(
            deleteSubmenu(confirmDelete.id)
          ).unwrap();
          toast.success(response?.message || 'Submenu deleted successfully');
        }
        setConfirmDelete(null);
        dispatch(
          fetchMenus({
            page: currentPage,
            limit: pageSize,
            search: searchTerm,
          })
        );
      } catch (error) {
        toast.error(error);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        sortOrder: formData.sortOrder ? parseInt(formData.sortOrder) : null,
        menuId: formData.menuId ? parseInt(formData.menuId) : null,
      };

      if (isSubmenuModal) {
        if (editingItem) {
          const response = await dispatch(
            updateSubmenu({ id: editingItem.id, submenu: submitData })
          ).unwrap();
          toast.success(response?.message || 'Submenu updated successfully');
        } else {
          const response = await dispatch(addSubmenu(submitData)).unwrap();
          toast.success(response?.message || 'Submenu created successfully');
        }
      } else {
        if (editingItem) {
          const response = await dispatch(
            updateMenu({ id: editingItem.id, menu: submitData })
          ).unwrap();
          toast.success(response?.message || 'Menu updated successfully');
        } else {
          const response = await dispatch(addMenu(submitData)).unwrap();
          toast.success(response?.message || 'Menu created successfully');
        }
      }
      resetForm();
      dispatch(
        fetchMenus({
          page: currentPage,
          limit: pageSize,
          search: searchTerm,
        })
      );
    } catch (error) {
      toast.error(error);
    }
  };

  const menuColumns = [
    {
      title: (
        <div className="flex items-center gap-2 text-slate-700 font-semibold">
          <MdMenu className="w-4 h-4" />
          <span>Name</span>
        </div>
      ),
      dataIndex: 'name',
      key: 'name',
      render: (text) => (
        <span className="text-slate-800 font-medium">{text}</span>
      ),
    },
    {
      title: (
        <div className="flex items-center gap-2 text-slate-700 font-semibold">
          <HiCog6Tooth className="w-4 h-4" />
          <span>Slug</span>
        </div>
      ),
      dataIndex: 'slug',
      key: 'slug',
      render: (text) => (
        <span className="text-slate-600 text-sm font-mono bg-gray-100 px-2 py-1 rounded">
          {text}
        </span>
      ),
    },
    {
      title: (
        <div className="flex items-center gap-2 text-slate-700 font-semibold">
          <HiListBullet className="w-4 h-4" />
          <span>Path</span>
        </div>
      ),
      dataIndex: 'path',
      key: 'path',
      render: (text) => (
        <span className="text-slate-600 text-sm">{text || '-'}</span>
      ),
    },
    {
      title: (
        <div className="flex items-center gap-2 text-slate-700 font-semibold">
          <MdSettings className="w-4 h-4" />
          <span>Icon</span>
        </div>
      ),
      dataIndex: 'icon',
      key: 'icon',
      render: (text) => (
        <span className="text-slate-600 text-sm">{text || '-'}</span>
      ),
    },
    {
      title: (
        <div className="flex items-center gap-2 text-slate-700 font-semibold">
          <span>Sort Order</span>
        </div>
      ),
      dataIndex: 'sortOrder',
      key: 'sortOrder',
      render: (text) => (
        <span className="text-slate-600 text-sm">{text || '-'}</span>
      ),
    },
    {
      title: (
        <div className="flex items-center gap-2 text-slate-700 font-semibold">
          <span>Active</span>
        </div>
      ),
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive) => (
        <Switch
          checked={isActive}
          disabled
          className={isActive ? 'bg-brand-500' : ''}
        />
      ),
    },
    {
      title: (
        <div className="flex items-center justify-center gap-2 text-slate-700 font-semibold">
          <span>Actions</span>
        </div>
      ),
      key: 'actions',
      render: (_, record) => (
        <div className="flex items-center justify-center space-x-2">
          <button
            onClick={() => handleAddSubmenu(record.id)}
            className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-all duration-200"
            title="Add Submenu"
          >
            <HiPlus className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleEditMenu(record)}
            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all duration-200"
            title="Edit Menu"
          >
            <HiPencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDeleteMenuClick(record)}
            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all duration-200"
            title="Delete Menu"
          >
            <HiTrash className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const submenuColumns = [
    {
      title: (
        <div className="flex items-center gap-2 text-slate-600 font-medium text-sm">
          <span>Name</span>
        </div>
      ),
      dataIndex: 'name',
      key: 'name',
      render: (text) => (
        <span className="text-slate-700 font-medium text-sm">↳ {text}</span>
      ),
    },
    {
      title: (
        <div className="flex items-center gap-2 text-slate-600 font-medium text-sm">
          <span>Slug</span>
        </div>
      ),
      dataIndex: 'slug',
      key: 'slug',
      render: (text) => (
        <span className="text-slate-500 text-xs font-mono bg-gray-50 px-2 py-1 rounded">
          {text}
        </span>
      ),
    },
    {
      title: (
        <div className="flex items-center gap-2 text-slate-600 font-medium text-sm">
          <span>Path</span>
        </div>
      ),
      dataIndex: 'path',
      key: 'path',
      render: (text) => (
        <span className="text-slate-500 text-xs">{text || '-'}</span>
      ),
    },
    {
      title: (
        <div className="flex items-center gap-2 text-slate-600 font-medium text-sm">
          <span>Sort Order</span>
        </div>
      ),
      dataIndex: 'sortOrder',
      key: 'sortOrder',
      render: (text) => (
        <span className="text-slate-500 text-xs">{text || '-'}</span>
      ),
    },
    {
      title: (
        <div className="flex items-center gap-2 text-slate-600 font-medium text-sm">
          <span>Active</span>
        </div>
      ),
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive) => (
        <Switch
          checked={isActive}
          disabled
          size="small"
          className={isActive ? 'bg-brand-500' : ''}
        />
      ),
    },
    {
      title: (
        <div className="flex items-center justify-center gap-2 text-slate-600 font-medium text-sm">
          <span>Actions</span>
        </div>
      ),
      key: 'actions',
      render: (_, record) => (
        <div className="flex items-center justify-center space-x-2">
          <button
            onClick={() => handleEditSubmenu(record)}
            className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-all duration-200"
            title="Edit Submenu"
          >
            <HiPencil className="w-3 h-3" />
          </button>
          <button
            onClick={() => handleDeleteSubmenuClick(record)}
            className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-all duration-200"
            title="Delete Submenu"
          >
            <HiTrash className="w-3 h-3" />
          </button>
        </div>
      ),
    },
  ];

  const expandedRowRender = (record) => {
    return (
      <div className="bg-gray-50 dark:bg-gray-800/30 rounded-lg p-4 ml-8">
        <Table
          columns={submenuColumns}
          dataSource={record.submenus || []}
          pagination={false}
          rowKey="id"
          size="small"
          className="submenu-table"
          showHeader={false}
        />
      </div>
    );
  };

  if (showForm) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-2 lg:p-4">
          {/* Header */}
          <div className="mb-3">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-3 lg:p-4">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setShowForm(false)}
                    className="p-3 rounded-lg bg-slate-700 text-white hover:bg-slate-800 transition-all duration-300 hover:shadow-lg"
                  >
                    <HiArrowLeft className="w-5 h-5" />
                  </button>
                  <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 mb-1">
                      {isSubmenuModal
                        ? editingItem
                          ? 'Edit Submenu'
                          : 'Add New Submenu'
                        : editingItem
                          ? 'Edit Menu'
                          : 'Add New Menu'}
                    </h1>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 lg:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {isSubmenuModal && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Menu ID *
                  </label>
                  <input
                    type="text"
                    value={formData.menuId}
                    disabled
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                    placeholder="Enter name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Slug *
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData({ ...formData, slug: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                    placeholder="Enter slug"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Path
                  </label>
                  <input
                    type="text"
                    value={formData.path}
                    onChange={(e) =>
                      setFormData({ ...formData, path: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                    placeholder="Enter path"
                  />
                </div>

                {!isSubmenuModal && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Icon
                    </label>
                    <input
                      type="text"
                      value={formData.icon}
                      onChange={(e) =>
                        setFormData({ ...formData, icon: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                      placeholder="Enter icon"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) =>
                      setFormData({ ...formData, sortOrder: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                    placeholder="Enter sort order"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Status
                </label>
                <select
                  value={formData.isActive?.toString() || 'true'}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      isActive: e.target.value === 'true',
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 rounded-lg border border-gray-300 text-slate-600 hover:bg-gray-50 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 rounded-lg font-semibold text-white bg-slate-700 hover:bg-slate-800 transition-all duration-300 hover:shadow-xl disabled:opacity-50 shadow-lg"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      {editingItem ? 'Updating...' : 'Creating...'}
                    </div>
                  ) : (
                    <>
                      <HiCheckCircle className="w-5 h-5 mr-2 inline" />
                      {editingItem ? 'Update' : 'Create'}{' '}
                      {isSubmenuModal ? 'Submenu' : 'Menu'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-2 lg:p-4">
        {/* Header */}
        <div className="mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-4 lg:p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-slate-700 shadow-lg">
                  <HiBars3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 dark:text-white mb-1">
                    Menu Management
                  </h1>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <HiMagnifyingGlass className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search menus..."
                    className="pl-12 pr-4 py-3 w-full sm:w-72 rounded-lg border border-gray-300 bg-white focus:border-slate-500 focus:ring-2 focus:ring-slate-200 transition-all duration-300 text-sm placeholder-gray-500 shadow-sm"
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                </div>

                <button
                  onClick={handleAddMenu}
                  className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-semibold text-white bg-slate-700 hover:bg-slate-800 shadow-lg transition-all duration-300"
                >
                  <HiPlus className="w-5 h-5 mr-2" />
                  Add Menu
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Menu Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-slate-600 mx-auto mb-4"></div>
              <p className="text-slate-600 dark:text-gray-400 font-medium">
                Loading menus...
              </p>
            </div>
          ) : menus.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-r from-slate-600 to-slate-700 flex items-center justify-center shadow-lg">
                <HiBars3 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">
                No menus found
              </h3>
              <p className="text-slate-600 dark:text-gray-400 mb-6">
                Add your first menu to get started
              </p>
              <button
                onClick={handleAddMenu}
                className="inline-flex items-center px-6 py-3 rounded-lg font-semibold text-white bg-slate-700 hover:bg-slate-800 shadow-lg transition-all duration-300"
              >
                <HiPlus className="w-5 h-5 mr-2" />
                Add First Menu
              </button>
            </div>
          ) : (
            <Table
              columns={menuColumns}
              dataSource={menus}
              loading={loading}
              rowKey="id"
              pagination={false}
              expandable={{
                expandedRowRender,
                rowExpandable: (record) =>
                  record.submenus && record.submenus.length > 0,
                expandIcon: ({ expanded, onExpand, record }) =>
                  record.submenus && record.submenus.length > 0 ? (
                    <button
                      onClick={(e) => onExpand(record, e)}
                      className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      {expanded ? (
                        <MdMenuOpen className="w-4 h-4 text-slate-600" />
                      ) : (
                        <MdMenu className="w-4 h-4 text-slate-600" />
                      )}
                    </button>
                  ) : (
                    <span className="w-6 h-6 inline-block" />
                  ),
              }}
              className="menu-management-table"
            />
          )}
        </div>

        {/* Pagination */}
        {pagination.total > 0 && (
          <div className="flex justify-center mt-6">
            <Pagination
              current={currentPage}
              total={pagination.total}
              pageSize={pageSize}
              onChange={(page) => {
                setCurrentPage(page);
                dispatch(
                  fetchMenus({
                    page: page,
                    limit: pageSize,
                    search: searchTerm,
                  })
                );
              }}
            />
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-8 border border-gray-200">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-lg bg-red-600 flex items-center justify-center shadow-lg">
                <HiTrash className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">
                Delete {deleteType === 'menu' ? 'Menu' : 'Submenu'}
              </h3>
              <p className="text-slate-600">
                Are you sure you want to delete "{confirmDelete.name}"? This
                action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-center space-x-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-6 py-3 rounded-lg border border-gray-300 text-slate-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-6 py-3 rounded-lg bg-red-600 text-white hover:bg-red-700 shadow-lg"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuManagement;
