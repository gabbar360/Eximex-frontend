import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Table,
  Switch,
  Button,
  Select,
  message,
  Space,
  Card,
  Collapse,
  Pagination,
} from 'antd';
import { EditOutlined, UserOutlined } from '@ant-design/icons';
import { toast } from 'react-toastify';
import {
  HiShieldCheck,
  HiUser,
  HiCog6Tooth,
  HiPencil,
  HiUserGroup,
  HiMagnifyingGlass,
  HiTrash,
  HiArrowLeft,
  HiCheckCircle,
} from 'react-icons/hi2';
import { MdSecurity, MdAdminPanelSettings } from 'react-icons/md';
import {
  fetchAllUsersWithPermissions,
  fetchUserPermissions,
  updateUserPermissions,
  clearError,
} from '../../features/userPermissionSlice';
import { deleteUser } from '../../features/userManagementSlice';
import { fetchMenus } from '../../features/menuSlice';
import axiosInstance from '../../utils/axiosInstance';
import { useDebounce } from '../../utils/useDebounce';

const { Option } = Select;
const { Panel } = Collapse;

const UserPermissionManagement = () => {
  const dispatch = useDispatch();
  const { allUsersPermissions, userPermissions, loading, error, pagination } = useSelector(
    (state) => state.userPermission
  );
  const { menus } = useSelector((state) => state.menu);

  const [showForm, setShowForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [permissions, setPermissions] = useState({});
  const [initialPermissions, setInitialPermissions] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    dispatch(fetchAllUsersWithPermissions({
      page: currentPage,
      limit: pageSize,
      search: ''
    }));
    dispatch(fetchMenus());
  }, [dispatch, currentPage, pageSize]);

  // Initial load
  useEffect(() => {
    dispatch(fetchAllUsersWithPermissions({
      page: 1,
      limit: 10,
      search: ''
    }));
  }, [dispatch]);

  const { debouncedCallback: debouncedSearch } = useDebounce((value: string) => {
    dispatch(fetchAllUsersWithPermissions({
      page: 1,
      limit: pageSize,
      search: value
    }));
  }, 500);

  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
    debouncedSearch(value);
  }, [debouncedSearch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleEditPermissions = async (user) => {
    setSelectedUser(user);
    setShowForm(true);

    try {
      const response = await dispatch(fetchUserPermissions(user.id)).unwrap();
      console.log('Raw response from backend:', response);

      const userPerms = {};

      // Initialize all menus with false permissions first
      menus.forEach((menu) => {
        userPerms[`menu_${menu.id}`] = {
          canView: false,
          canCreate: false,
          canUpdate: false,
          canDelete: false,
        };

        menu.submenus?.forEach((submenu) => {
          userPerms[`submenu_${submenu.id}`] = {
            canView: false,
            canCreate: false,
            canUpdate: false,
            canDelete: false,
          };
        });
      });

      // Map backend response to frontend state
      const responseData = response.data || response;
      if (responseData.menus) {
        responseData.menus.forEach((menu) => {
          const menuKey = `menu_${menu.menuId}`;
          if (menu.permissions && userPerms[menuKey]) {
            userPerms[menuKey] = {
              canView: Boolean(menu.permissions.canView),
              canCreate: Boolean(menu.permissions.canCreate),
              canUpdate: Boolean(menu.permissions.canUpdate),
              canDelete: Boolean(menu.permissions.canDelete),
            };
          }

          if (menu.submenus) {
            menu.submenus.forEach((submenu) => {
              const submenuKey = `submenu_${submenu.submenuId}`;
              if (submenu.permissions && userPerms[submenuKey]) {
                userPerms[submenuKey] = {
                  canView: Boolean(submenu.permissions.canView),
                  canCreate: Boolean(submenu.permissions.canCreate),
                  canUpdate: Boolean(submenu.permissions.canUpdate),
                  canDelete: Boolean(submenu.permissions.canDelete),
                };
              }
            });
          }
        });
      }

      setPermissions(userPerms);
      setInitialPermissions(userPerms);
      console.log('Final mapped permissions:', userPerms);
    } catch (error) {
      toast.error(error?.message || 'Failed to fetch user permissions');
      console.error('Error loading permissions:', error);
    }
  };

  const handlePermissionChange = (key, permissionType, value) => {
    console.log('Permission change:', key, permissionType, value);
    setPermissions((prev) => {
      const updated = {
        ...prev,
        [key]: {
          ...prev[key],
          [permissionType]: value,
        },
      };
      console.log('Updated permissions:', updated);
      return updated;
    });
  };

  const handleSavePermissions = async () => {
    try {
      const menuPermissions = [];
      const submenuPermissions = [];

      Object.keys(permissions).forEach((key) => {
        const [type, id] = key.split('_');
        const perms = permissions[key];

        // Include all permissions (both true and false) to ensure proper state management
        if (type === 'menu') {
          menuPermissions.push({
            menuId: parseInt(id),
            ...perms,
          });
        } else if (type === 'submenu') {
          submenuPermissions.push({
            submenuId: parseInt(id),
            ...perms,
          });
        }
      });

      const response = await dispatch(
        updateUserPermissions({
          userId: selectedUser.id,
          permissions: menuPermissions,
          submenuPermissions,
        })
      ).unwrap();

      toast.success(response?.message || 'Permissions updated successfully');
      setShowForm(false);
      setPermissions({});
      setInitialPermissions({});
      setSelectedUser(null);
      dispatch(fetchAllUsersWithPermissions({
        page: currentPage,
        limit: pageSize,
        search: searchTerm
      }));
    } catch (error) {
      toast.error(error?.message || 'Failed to update permissions');
    }
  };

  const handleDeleteClick = (user) => {
    setConfirmDelete(user);
  };

  const handleConfirmDelete = async () => {
    if (confirmDelete) {
      try {
        const result = await dispatch(deleteUser(confirmDelete.id)).unwrap();
        toast.success(result.message || 'User deleted successfully');
        setConfirmDelete(null);
        dispatch(fetchAllUsersWithPermissions({
          page: currentPage,
          limit: pageSize,
          search: searchTerm
        }));
      } catch (error) {
        toast.error(error?.message || 'Delete failed');
      }
    }
  };

  const resetForm = () => {
    setPermissions({});
    setInitialPermissions({});
    setSelectedUser(null);
    setShowForm(false);
  };

  const renderPermissionControls = (item, keyPrefix) => {
    const key = `${keyPrefix}_${item.id}`;
    const itemPermissions = permissions[key] || {
      canView: false,
      canCreate: false,
      canUpdate: false,
      canDelete: false,
    };

    return (
      <div className="grid grid-cols-4 gap-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            View
          </label>
          <Switch
            checked={Boolean(itemPermissions.canView)}
            onChange={(value) => handlePermissionChange(key, 'canView', value)}
            className={itemPermissions.canView ? 'bg-brand-500' : ''}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Create
          </label>
          <Switch
            checked={Boolean(itemPermissions.canCreate)}
            onChange={(value) =>
              handlePermissionChange(key, 'canCreate', value)
            }
            className={itemPermissions.canCreate ? 'bg-brand-500' : ''}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Update
          </label>
          <Switch
            checked={Boolean(itemPermissions.canUpdate)}
            onChange={(value) =>
              handlePermissionChange(key, 'canUpdate', value)
            }
            className={itemPermissions.canUpdate ? 'bg-brand-500' : ''}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Delete
          </label>
          <Switch
            checked={Boolean(itemPermissions.canDelete)}
            onChange={(value) =>
              handlePermissionChange(key, 'canDelete', value)
            }
            className={itemPermissions.canDelete ? 'bg-brand-500' : ''}
          />
        </div>
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
                      Edit Permissions - {selectedUser?.name}
                    </h1>
                    <p className="text-sm text-slate-600">
                      Configure user access permissions for menus and submenus
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 lg:p-8">
            <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start gap-3">
                <HiShieldCheck className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-800 mb-1">
                    Permission Guidelines
                  </p>
                  <p className="text-sm text-blue-700">
                    Only menus with at least one permission enabled will be saved.
                    Configure permissions carefully to ensure proper access control.
                  </p>
                </div>
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
              <Collapse className="permission-collapse">
                {menus.map((menu) => (
                  <Panel
                    header={
                      <div className="flex items-center gap-3">
                        <HiCog6Tooth className="w-4 h-4 text-slate-600" />
                        <span className="font-medium text-slate-800">
                          {menu.name}
                        </span>
                      </div>
                    }
                    key={menu.id}
                    className="mb-2"
                  >
                    <div className="space-y-4">
                      {menu.submenus && menu.submenus.length > 0 ? (
                        <div>
                          <div className="mb-4">
                            <h4 className="font-medium text-slate-800 mb-3 flex items-center gap-2">
                              <HiCog6Tooth className="w-4 h-4" />
                              Main Menu Permissions
                            </h4>
                            {renderPermissionControls(menu, 'menu')}
                          </div>
                          <div>
                            <h4 className="font-medium text-slate-800 mb-3 flex items-center gap-2">
                              <HiCog6Tooth className="w-4 h-4" />
                              Submenu Permissions
                            </h4>
                            <div className="space-y-4">
                              {menu.submenus.map((submenu) => (
                                <div
                                  key={submenu.id}
                                  className="pl-4 border-l-2 border-gray-200"
                                >
                                  <h5 className="text-sm font-medium text-slate-700 mb-3">
                                    ↳ {submenu.name}
                                  </h5>
                                  {renderPermissionControls(submenu, 'submenu')}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <h4 className="font-medium mb-2">Menu Permissions</h4>
                          {renderPermissionControls(menu, 'menu')}
                        </div>
                      )}
                    </div>
                  </Panel>
                ))}
              </Collapse>
            </div>

            {/* Submit Buttons */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200 mt-6">
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-3 rounded-lg border border-gray-300 text-slate-600 hover:bg-gray-50 transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePermissions}
                disabled={loading}
                className="px-6 py-3 rounded-lg font-semibold text-white bg-slate-700 hover:bg-slate-800 transition-all duration-300 hover:shadow-xl disabled:opacity-50 shadow-lg flex items-center gap-2"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </div>
                ) : (
                  <>
                    <HiCheckCircle className="w-5 h-5" />
                    Save Permissions
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const columns = [
    {
      title: (
        <div className="flex items-center gap-2 text-slate-700 font-semibold">
          <HiUser className="w-4 h-4" />
          <span>Username</span>
        </div>
      ),
      key: 'username',
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
            <HiUser className="w-5 h-5 text-slate-600" />
          </div>
          <div className="font-medium text-slate-800">{record.name}</div>
        </div>
      ),
    },
    {
      title: (
        <div className="flex items-center gap-2 text-slate-700 font-semibold">
          <span>Email</span>
        </div>
      ),
      dataIndex: 'email',
      key: 'email',
      render: (email) => (
        <div className="text-sm text-slate-600">{email}</div>
      ),
    },
    {
      title: (
        <div className="flex items-center gap-2 text-slate-700 font-semibold">
          <MdAdminPanelSettings className="w-4 h-4" />
          <span>Role</span>
        </div>
      ),
      dataIndex: ['role', 'displayName'],
      key: 'role',
      render: (role) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
          {role || 'No Role'}
        </span>
      ),
    },
    {
      title: (
        <div className="flex items-center gap-2 text-slate-700 font-semibold">
          <HiShieldCheck className="w-4 h-4" />
          <span>Permissions Count</span>
        </div>
      ),
      key: 'permissionsCount',
      render: (_, record) => {
        const activePermissions =
          record.permissions?.filter(
            (p) => p.canView || p.canCreate || p.canUpdate || p.canDelete
          ) || [];
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-100 text-brand-800">
            {activePermissions.length}
          </span>
        );
      },
    },

    {
      title: (
        <div className="flex items-center justify-center gap-2 text-slate-700 font-semibold">
          <span>Actions</span>
        </div>
      ),
      key: 'actions',
      render: (_, record) => (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => handleEditPermissions(record)}
            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all duration-200"
            title="Edit Permissions"
          >
            <HiPencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDeleteClick(record)}
            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all duration-200"
            title="Delete User"
          >
            <HiTrash className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="p-2 lg:p-4">
        {/* Header */}
        <div className="mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-4 lg:p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-slate-700 shadow-lg">
                  <HiShieldCheck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 dark:text-white mb-1">
                    User Permission Management
                  </h1>
                </div>
              </div>

              <div className="relative">
                <HiMagnifyingGlass className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search users..."
                  className="pl-12 pr-4 py-3 w-full sm:w-72 rounded-lg border border-gray-300 bg-white focus:border-slate-500 focus:ring-2 focus:ring-slate-200 transition-all duration-300 text-sm placeholder-gray-500 shadow-sm"
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-slate-600 mx-auto mb-4"></div>
              <p className="text-slate-600 dark:text-gray-400 font-medium">
                Loading users...
              </p>
            </div>
          ) : allUsersPermissions.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-r from-slate-600 to-slate-700 flex items-center justify-center shadow-lg">
                <HiUserGroup className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">
                No users found
              </h3>
              <p className="text-slate-600 dark:text-gray-400">
                No users available for permission management
              </p>
            </div>
          ) : (
            <Table
              columns={columns}
              dataSource={allUsersPermissions}
              loading={loading}
              rowKey="id"
              pagination={false}
              className="permission-management-table"
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
                dispatch(fetchAllUsersWithPermissions({
                  page: page,
                  limit: pageSize,
                  search: searchTerm
                }));
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
                Delete User
              </h3>
              <p className="text-slate-600">
                Are you sure you want to delete "{confirmDelete.name}"?
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

export default UserPermissionManagement;
