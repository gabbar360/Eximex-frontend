import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Table,
  Switch,
  Button,
  Modal,
  Select,
  message,
  Space,
  Card,
  Collapse,
} from 'antd';
import { EditOutlined, UserOutlined } from '@ant-design/icons';
import { toast } from 'react-toastify';
import {
  HiShieldCheck,
  HiUser,
  HiCog6Tooth,
  HiPencil,
  HiUserGroup,
} from 'react-icons/hi2';
import { MdSecurity, MdAdminPanelSettings } from 'react-icons/md';
import {
  fetchAllUsersWithPermissions,
  fetchUserPermissions,
  updateUserPermissions,
  clearError,
} from '../../features/userPermissionSlice';
import { fetchMenus } from '../../features/menuSlice';

const { Option } = Select;
const { Panel } = Collapse;

const UserPermissionManagement = () => {
  const dispatch = useDispatch();
  const { allUsersPermissions, userPermissions, loading, error } = useSelector(
    (state) => state.userPermission
  );
  const { menus } = useSelector((state) => state.menu);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [permissions, setPermissions] = useState({});
  const [initialPermissions, setInitialPermissions] = useState({});

  useEffect(() => {
    dispatch(fetchAllUsersWithPermissions());
    dispatch(fetchMenus());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleEditPermissions = async (user) => {
    setSelectedUser(user);
    setIsModalVisible(true);

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
      setIsModalVisible(false);
      setPermissions({});
      setInitialPermissions({});
      setSelectedUser(null);
      dispatch(fetchAllUsersWithPermissions());
    } catch (error) {
      toast.error(error?.message || 'Failed to update permissions');
    }
  };

  const columns = [
    {
      title: (
        <div className="flex items-center gap-2 text-slate-700 font-semibold">
          <HiUser className="w-4 h-4" />
          <span>User</span>
        </div>
      ),
      key: 'user',
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
            <HiUser className="w-5 h-5 text-slate-600" />
          </div>
          <div>
            <div className="font-medium text-slate-800">{record.name}</div>
            <div className="text-slate-500 text-sm">{record.email}</div>
          </div>
        </div>
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
        <div className="flex items-center gap-2 text-slate-700 font-semibold">
          <HiCog6Tooth className="w-4 h-4" />
          <span>Assigned Menus</span>
        </div>
      ),
      key: 'assignedMenus',
      render: (_, record) => {
        const menuNames =
          record.permissions
            ?.filter(
              (p) =>
                (p.canView || p.canCreate || p.canUpdate || p.canDelete) &&
                p.menuName
            )
            ?.map((p) => p.menuName)
            ?.filter((name, index, arr) => arr.indexOf(name) === index) || [];
        return (
          <div className="text-slate-600 text-sm">
            {menuNames.length > 0 ? menuNames.join(', ') : 'No menus assigned'}
          </div>
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
        <div className="flex justify-center">
          <button
            onClick={() => handleEditPermissions(record)}
            className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-brand-500 transition-all duration-300"
            title="Edit Permissions"
          >
            <HiPencil className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="p-2 lg:p-4">
        {/* Header */}
        <div className="mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-4 lg:p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-slate-700 shadow-lg">
                <HiShieldCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 dark:text-white mb-1">
                  User Permission Management
                </h1>
                <p className="text-slate-600 dark:text-gray-400 text-sm">
                  Manage user permissions and access control
                </p>
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
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} of ${total} items`,
              }}
              className="permission-management-table"
            />
          )}
        </div>
      </div>

      {/* Permission Modal */}
      <Modal
        title={
          <div className="flex items-center gap-3 pb-4 border-b border-gray-200 dark:border-gray-700">
            <div className="p-2 rounded-lg bg-slate-700">
              <MdSecurity className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
                Edit Permissions - {selectedUser?.name}
              </h3>
              <p className="text-sm text-slate-600 dark:text-gray-400">
                Configure user access permissions for menus and submenus
              </p>
            </div>
          </div>
        }
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setPermissions({});
          setInitialPermissions({});
          setSelectedUser(null);
        }}
        width={900}
        footer={
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => {
                setIsModalVisible(false);
                setPermissions({});
                setInitialPermissions({});
                setSelectedUser(null);
              }}
              className="px-6 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-slate-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300"
            >
              Cancel
            </button>
            <button
              onClick={handleSavePermissions}
              disabled={loading}
              className="px-6 py-2.5 rounded-lg bg-slate-700 hover:bg-slate-800 text-white font-medium shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading && (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              )}
              Save Permissions
            </button>
          </div>
        }
        className="permission-modal"
      >
        <div className="max-h-96 overflow-y-auto">
          <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <HiShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                  Permission Guidelines
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Only menus with at least one permission enabled will be saved.
                  Configure permissions carefully to ensure proper access
                  control.
                </p>
              </div>
            </div>
          </div>

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
      </Modal>
    </div>
  );
};

export default UserPermissionManagement;
