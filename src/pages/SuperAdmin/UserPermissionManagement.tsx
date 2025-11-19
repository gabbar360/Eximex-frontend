import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Table, Switch, Button, Modal, Select, message, Space, Card, Collapse } from 'antd';
import { EditOutlined, UserOutlined } from '@ant-design/icons';
import { toast } from 'react-toastify';
import {
  fetchAllUsersWithPermissions,
  fetchUserPermissions,
  updateUserPermissions,
  clearError
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
      menus.forEach(menu => {
        userPerms[`menu_${menu.id}`] = {
          canView: false,
          canCreate: false,
          canUpdate: false,
          canDelete: false
        };
        
        menu.submenus?.forEach(submenu => {
          userPerms[`submenu_${submenu.id}`] = {
            canView: false,
            canCreate: false,
            canUpdate: false,
            canDelete: false
          };
        });
      });
      
      // Map backend response to frontend state
      const responseData = response.data || response;
      if (responseData.menus) {
        responseData.menus.forEach(menu => {
          const menuKey = `menu_${menu.menuId}`;
          if (menu.permissions && userPerms[menuKey]) {
            userPerms[menuKey] = {
              canView: Boolean(menu.permissions.canView),
              canCreate: Boolean(menu.permissions.canCreate),
              canUpdate: Boolean(menu.permissions.canUpdate),
              canDelete: Boolean(menu.permissions.canDelete)
            };
          }
          
          if (menu.submenus) {
            menu.submenus.forEach(submenu => {
              const submenuKey = `submenu_${submenu.submenuId}`;
              if (submenu.permissions && userPerms[submenuKey]) {
                userPerms[submenuKey] = {
                  canView: Boolean(submenu.permissions.canView),
                  canCreate: Boolean(submenu.permissions.canCreate),
                  canUpdate: Boolean(submenu.permissions.canUpdate),
                  canDelete: Boolean(submenu.permissions.canDelete)
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
    setPermissions(prev => {
      const updated = {
        ...prev,
        [key]: {
          ...prev[key],
          [permissionType]: value
        }
      };
      console.log('Updated permissions:', updated);
      return updated;
    });
  };

  const handleSavePermissions = async () => {
    try {
      const menuPermissions = [];
      const submenuPermissions = [];

      Object.keys(permissions).forEach(key => {
        const [type, id] = key.split('_');
        const perms = permissions[key];
        
        // Only include permissions that have at least one true value
        const hasAnyPermission = Object.values(perms).some(value => value === true);
        
        if (hasAnyPermission) {
          if (type === 'menu') {
            menuPermissions.push({
              menuId: parseInt(id),
              ...perms
            });
          } else if (type === 'submenu') {
            submenuPermissions.push({
              submenuId: parseInt(id),
              ...perms
            });
          }
        }
      });

      const response = await dispatch(updateUserPermissions({
        userId: selectedUser.id,
        permissions: menuPermissions,
        submenuPermissions
      })).unwrap();

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
      title: 'User',
      key: 'user',
      render: (_, record) => (
        <div>
          <div className="font-medium">{record.name}</div>
          <div className="text-gray-500 text-sm">{record.email}</div>
        </div>
      ),
    },
    {
      title: 'Role',
      dataIndex: ['role', 'displayName'],
      key: 'role',
      render: (role) => role || 'No Role',
    },
    {
      title: 'Permissions Count',
      key: 'permissionsCount',
      render: (_, record) => {
        const activePermissions = record.permissions?.filter(p => 
          p.canView || p.canCreate || p.canUpdate || p.canDelete
        ) || [];
        return activePermissions.length;
      },
    },
    {
      title: 'Assigned Menus',
      key: 'assignedMenus',
      render: (_, record) => {
        const menuNames = record.permissions
          ?.filter(p => (p.canView || p.canCreate || p.canUpdate || p.canDelete) && p.menuName)
          ?.map(p => p.menuName)
          ?.filter((name, index, arr) => arr.indexOf(name) === index) || [];
        return menuNames.length > 0 ? menuNames.join(', ') : 'No menus assigned';
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button
          type="primary"
          icon={<EditOutlined />}
          onClick={() => handleEditPermissions(record)}
        >
          Edit Permissions
        </Button>
      ),
    },
  ];

  const renderPermissionControls = (item, keyPrefix) => {
    const key = `${keyPrefix}_${item.id}`;
    const itemPermissions = permissions[key] || {
      canView: false,
      canCreate: false,
      canUpdate: false,
      canDelete: false
    };

    return (
      <div className="grid grid-cols-4 gap-4 p-4 border rounded">
        <div>
          <label className="block text-sm font-medium mb-1">View</label>
          <Switch
            checked={Boolean(itemPermissions.canView)}
            onChange={(value) => handlePermissionChange(key, 'canView', value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Create</label>
          <Switch
            checked={Boolean(itemPermissions.canCreate)}
            onChange={(value) => handlePermissionChange(key, 'canCreate', value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Update</label>
          <Switch
            checked={Boolean(itemPermissions.canUpdate)}
            onChange={(value) => handlePermissionChange(key, 'canUpdate', value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Delete</label>
          <Switch
            checked={Boolean(itemPermissions.canDelete)}
            onChange={(value) => handlePermissionChange(key, 'canDelete', value)}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">User Permission Management</h1>
      </div>

      <Table
        columns={columns}
        dataSource={allUsersPermissions}
        loading={loading}
        rowKey="id"
      />

      <Modal
        title={`Edit Permissions - ${selectedUser?.name}`}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setPermissions({});
          setInitialPermissions({});
          setSelectedUser(null);
        }}
        width={800}
        footer={[
          <Button key="cancel" onClick={() => {
            setIsModalVisible(false);
            setPermissions({});
            setInitialPermissions({});
            setSelectedUser(null);
          }}>
            Cancel
          </Button>,
          <Button key="save" type="primary" onClick={handleSavePermissions} loading={loading}>
            Save Permissions
          </Button>,
        ]}
      >
        <div className="max-h-96 overflow-y-auto">
          <div className="mb-4 p-3 bg-blue-50 rounded">
            <p className="text-sm text-blue-700">
              <strong>Note:</strong> Only menus with at least one permission enabled will be saved.
            </p>
          </div>
          <Collapse>
            {menus.map(menu => (
              <Panel
                header={
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{menu.name}</span>
                  </div>
                }
                key={menu.id}
              >
                <div className="space-y-4">
                  {menu.submenus && menu.submenus.length > 0 ? (
                    <div>
                      <h4 className="font-medium mb-2">Submenu Permissions</h4>
                      <div className="space-y-3">
                        {menu.submenus.map(submenu => (
                          <div key={submenu.id}>
                            <h5 className="text-sm font-medium mb-2">{submenu.name}</h5>
                            {renderPermissionControls(submenu, 'submenu')}
                          </div>
                        ))}
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