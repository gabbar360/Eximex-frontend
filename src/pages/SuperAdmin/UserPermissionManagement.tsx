import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Table,
  Pagination,
} from 'antd';
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
import { MdAdminPanelSettings } from 'react-icons/md';
import {
  fetchAllUsersWithPermissions,
  fetchUserPermissions,
  updateUserPermissions,
  clearError,
} from '../../features/userPermissionSlice';
import { deleteUser } from '../../features/userManagementSlice';
import { fetchMenus } from '../../features/menuSlice';
import { useDebounce } from '../../utils/useDebounce';

const UserPermissionManagement = () => {
  const dispatch = useDispatch();
  const { allUsersPermissions, loading, error, pagination } =
    useSelector((state) => state.userPermission);
  const { menus } = useSelector((state) => state.menu);

  const [showForm, setShowForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [permissions, setPermissions] = useState({});

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    dispatch(
      fetchAllUsersWithPermissions({
        page: currentPage,
        limit: 10,
        search: '',
      })
    );
    dispatch(fetchMenus());
  }, [dispatch, currentPage]);

  // Initial load
  useEffect(() => {
    dispatch(
      fetchAllUsersWithPermissions({
        page: 1,
        limit: 10,
        search: '',
      })
    );
  }, [dispatch]);

  const { debouncedCallback: debouncedSearch } = useDebounce(
    (value: string) => {
      dispatch(
        fetchAllUsersWithPermissions({
          page: 1,
          limit: 10,
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

      // Check if all permissions are selected
      const allSelected = Object.values(userPerms).every(
        (perm) =>
          perm.canView && perm.canCreate && perm.canUpdate && perm.canDelete
      );
      setSelectAll(allSelected);

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

  const handleSelectAll = (checked) => {
    setSelectAll(checked);

    // Update local state only
    const updatedPermissions = {};
    Object.keys(permissions).forEach((key) => {
      updatedPermissions[key] = {
        canView: checked,
        canCreate: checked,
        canUpdate: checked,
        canDelete: checked,
      };
    });

    setPermissions(updatedPermissions);
  };

  const checkIfAllSelected = useCallback(() => {
    const allPermissions = Object.values(permissions);
    if (allPermissions.length === 0) return false;

    return allPermissions.every(
      (perm) =>
        perm.canView && perm.canCreate && perm.canUpdate && perm.canDelete
    );
  }, [permissions]);

  useEffect(() => {
    setSelectAll(checkIfAllSelected());
  }, [permissions, checkIfAllSelected]);

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

      toast.success(response?.data?.message || response?.message);
      setShowForm(false);
      setPermissions({});
      setSelectedUser(null);
      dispatch(
        fetchAllUsersWithPermissions({
          page: currentPage,
          limit: 10,
          search: searchTerm,
        })
      );
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
        dispatch(
          fetchAllUsersWithPermissions({
            page: currentPage,
            limit: 10,
            search: searchTerm,
          })
        );
      } catch (error) {
        toast.error(error?.message || 'Delete failed');
      }
    }
  };

  const resetForm = () => {
    setPermissions({});
    setSelectedUser(null);
    setSelectAll(false);
    setShowForm(false);
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
            <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-slate-200">
              <div className="flex items-start gap-3">
                <HiShieldCheck className="w-5 h-5 text-slate-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-slate-800 mb-1">
                    Permission Guidelines
                  </p>
                  <p className="text-sm text-slate-700">
                    Only menus with at least one permission enabled will be
                    saved. Configure permissions carefully to ensure proper
                    access control.
                  </p>
                </div>
              </div>
            </div>

            {/* Select All Checkbox */}
            <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="selectAll"
                  checked={selectAll}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="w-5 h-5 text-slate-600 bg-gray-100 border-gray-300 rounded focus:ring-slate-500 focus:ring-2 cursor-pointer accent-slate-600"
                />
                <label
                  htmlFor="selectAll"
                  className="text-sm font-medium text-slate-700 cursor-pointer"
                >
                  Select All Permissions (Grant all permissions to all menus and
                  submenus)
                </label>
              </div>
            </div>

            <div className="border rounded-lg overflow-hidden overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gradient-to-r from-slate-100 to-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-slate-800">
                      <div className="flex items-center gap-2">
                        <HiCog6Tooth className="w-4 h-4" />
                        Menu / Submenu
                      </div>
                    </th>
                    <th className="px-3 py-3 text-center font-semibold text-slate-700">
                      <div className="flex items-center justify-center gap-1">
                        <HiUser className="w-4 h-4" />
                        View
                      </div>
                    </th>
                    <th className="px-3 py-3 text-center font-semibold text-slate-700">
                      <div className="flex items-center justify-center gap-1">
                        <HiCheckCircle className="w-4 h-4" />
                        Create
                      </div>
                    </th>
                    <th className="px-3 py-3 text-center font-semibold text-slate-700">
                      <div className="flex items-center justify-center gap-1">
                        <HiPencil className="w-4 h-4" />
                        Update
                      </div>
                    </th>
                    <th className="px-3 py-3 text-center font-semibold text-slate-700">
                      <div className="flex items-center justify-center gap-1">
                        <HiTrash className="w-4 h-4" />
                        Delete
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {menus.map((menu) => (
                    <React.Fragment key={menu.id}>
                      <tr className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 font-medium text-slate-900">
                          <div className="flex items-center gap-2">
                            <HiCog6Tooth className="w-4 h-4 text-slate-600" />
                            {menu.name}
                          </div>
                        </td>
                        {(() => {
                          const key = `menu_${menu.id}`;
                          const itemPermissions = permissions[key] || {
                            canView: false,
                            canCreate: false,
                            canUpdate: false,
                            canDelete: false,
                          };
                          return (
                            <>
                              <td className="px-3 py-3 text-center">
                                <input
                                  type="checkbox"
                                  checked={Boolean(itemPermissions.canView)}
                                  onChange={(e) =>
                                    handlePermissionChange(
                                      key,
                                      'canView',
                                      e.target.checked
                                    )
                                  }
                                  className="w-4 h-4 cursor-pointer accent-slate-600"
                                />
                              </td>
                              <td className="px-3 py-3 text-center">
                                <input
                                  type="checkbox"
                                  checked={Boolean(itemPermissions.canCreate)}
                                  onChange={(e) =>
                                    handlePermissionChange(
                                      key,
                                      'canCreate',
                                      e.target.checked
                                    )
                                  }
                                  className="w-4 h-4 cursor-pointer accent-slate-600"
                                />
                              </td>
                              <td className="px-3 py-3 text-center">
                                <input
                                  type="checkbox"
                                  checked={Boolean(itemPermissions.canUpdate)}
                                  onChange={(e) =>
                                    handlePermissionChange(
                                      key,
                                      'canUpdate',
                                      e.target.checked
                                    )
                                  }
                                  className="w-4 h-4 cursor-pointer accent-slate-600"
                                />
                              </td>
                              <td className="px-3 py-3 text-center">
                                <input
                                  type="checkbox"
                                  checked={Boolean(itemPermissions.canDelete)}
                                  onChange={(e) =>
                                    handlePermissionChange(
                                      key,
                                      'canDelete',
                                      e.target.checked
                                    )
                                  }
                                  className="w-4 h-4 cursor-pointer accent-slate-600"
                                />
                              </td>
                            </>
                          );
                        })()}
                      </tr>
                      {menu.submenus?.map((submenu) => (
                        <tr
                          key={submenu.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-4 py-2 pl-8 text-slate-600">
                            <span className="text-gray-400 mr-2">↳</span>
                            {submenu.name}
                          </td>
                          {(() => {
                            const key = `submenu_${submenu.id}`;
                            const itemPermissions = permissions[key] || {
                              canView: false,
                              canCreate: false,
                              canUpdate: false,
                              canDelete: false,
                            };
                            return (
                              <>
                                <td className="px-3 py-2 text-center">
                                  <input
                                    type="checkbox"
                                    checked={Boolean(itemPermissions.canView)}
                                    onChange={(e) =>
                                      handlePermissionChange(
                                        key,
                                        'canView',
                                        e.target.checked
                                      )
                                    }
                                    className="w-4 h-4 cursor-pointer accent-slate-600"
                                  />
                                </td>
                                <td className="px-3 py-2 text-center">
                                  <input
                                    type="checkbox"
                                    checked={Boolean(itemPermissions.canCreate)}
                                    onChange={(e) =>
                                      handlePermissionChange(
                                        key,
                                        'canCreate',
                                        e.target.checked
                                      )
                                    }
                                    className="w-4 h-4 cursor-pointer accent-slate-600"
                                  />
                                </td>
                                <td className="px-3 py-2 text-center">
                                  <input
                                    type="checkbox"
                                    checked={Boolean(itemPermissions.canUpdate)}
                                    onChange={(e) =>
                                      handlePermissionChange(
                                        key,
                                        'canUpdate',
                                        e.target.checked
                                      )
                                    }
                                    className="w-4 h-4 cursor-pointer accent-slate-600"
                                  />
                                </td>
                                <td className="px-3 py-2 text-center">
                                  <input
                                    type="checkbox"
                                    checked={Boolean(itemPermissions.canDelete)}
                                    onChange={(e) =>
                                      handlePermissionChange(
                                        key,
                                        'canDelete',
                                        e.target.checked
                                      )
                                    }
                                    className="w-4 h-4 cursor-pointer accent-slate-600"
                                  />
                                </td>
                              </>
                            );
                          })()}
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
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
      render: (email) => <div className="text-sm text-slate-600">{email}</div>,
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
          <div className="overflow-x-auto">
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
                scroll={{ x: 800 }}
                className="permission-management-table"
              />
            )}
          </div>
        </div>

        {/* Pagination */}
        {pagination.total > 0 && (
          <div className="flex justify-center mt-6">
            <Pagination
              current={currentPage}
              total={pagination.total}
              pageSize={10}
              onChange={(page) => {
                setCurrentPage(page);
                dispatch(
                  fetchAllUsersWithPermissions({
                    page: page,
                    limit: 10,
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
