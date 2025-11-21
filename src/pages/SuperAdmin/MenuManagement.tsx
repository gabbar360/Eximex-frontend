import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Table, Modal, Form, Input, Switch, Space, Popconfirm, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { toast } from 'react-toastify';
import { HiPlus, HiPencil, HiTrash, HiListBullet, HiCog6Tooth, HiBars3 } from 'react-icons/hi2';
import { MdMenu, MdMenuOpen, MdSettings } from 'react-icons/md';
import {
  fetchMenus,
  addMenu,
  updateMenu,
  deleteMenu,
  addSubmenu,
  updateSubmenu,
  deleteSubmenu,
  clearError
} from '../../features/menuSlice';

const MenuManagement = () => {
  const dispatch = useDispatch();
  const { menus, loading, error } = useSelector((state) => state.menu);
  
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isSubmenuModal, setIsSubmenuModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedMenuId, setSelectedMenuId] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    dispatch(fetchMenus());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      message.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleAddMenu = () => {
    setEditingItem(null);
    setIsSubmenuModal(false);
    setIsModalVisible(true);
    form.resetFields();
  };

  const handleEditMenu = (menu) => {
    setEditingItem(menu);
    setIsSubmenuModal(false);
    setIsModalVisible(true);
    form.setFieldsValue(menu);
  };

  const handleAddSubmenu = (menuId) => {
    setSelectedMenuId(menuId);
    setEditingItem(null);
    setIsSubmenuModal(true);
    setIsModalVisible(true);
    form.resetFields();
    form.setFieldsValue({ menuId });
  };

  const handleEditSubmenu = (submenu) => {
    setEditingItem(submenu);
    setIsSubmenuModal(true);
    setIsModalVisible(true);
    form.setFieldsValue(submenu);
  };

  const handleDeleteMenu = async (id) => {
    try {
      const response = await dispatch(deleteMenu(id)).unwrap();
      toast.success(response?.message || 'Menu deleted successfully');
    } catch (error) {
      toast.error(error);
    }
  };

  const handleDeleteSubmenu = async (id) => {
    try {
      const response = await dispatch(deleteSubmenu(id)).unwrap();
      toast.success(response?.message || 'Submenu deleted successfully');
    } catch (error) {
      toast.error(error);
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (isSubmenuModal) {
        if (editingItem) {
          const response = await dispatch(updateSubmenu({ id: editingItem.id, submenu: values })).unwrap();
          toast.success(response?.message || 'Submenu updated successfully');
        } else {
          const response = await dispatch(addSubmenu(values)).unwrap();
          toast.success(response?.message || 'Submenu created successfully');
        }
      } else {
        if (editingItem) {
          const response = await dispatch(updateMenu({ id: editingItem.id, menu: values })).unwrap();
          toast.success(response?.message || 'Menu updated successfully');
        } else {
          const response = await dispatch(addMenu(values)).unwrap();
          toast.success(response?.message || 'Menu created successfully');
        }
      }
      setIsModalVisible(false);
      form.resetFields();
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
        <span className="text-slate-600 text-sm font-mono bg-gray-100 px-2 py-1 rounded">{text}</span>
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
            className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-brand-500 transition-all duration-300 group"
            title="Add Submenu"
          >
            <HiPlus className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleEditMenu(record)}
            className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-emerald-600 transition-all duration-300"
            title="Edit Menu"
          >
            <HiPencil className="w-4 h-4" />
          </button>
          <Popconfirm
            title="Are you sure you want to delete this menu?"
            onConfirm={() => handleDeleteMenu(record.id)}
            okText="Yes"
            cancelText="No"
            placement="topRight"
          >
            <button
              className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-red-600 transition-all duration-300"
              title="Delete Menu"
            >
              <HiTrash className="w-4 h-4" />
            </button>
          </Popconfirm>
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
        <span className="text-slate-500 text-xs font-mono bg-gray-50 px-2 py-1 rounded">{text}</span>
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
            className="p-1.5 rounded text-slate-500 hover:text-white hover:bg-emerald-600 transition-all duration-300"
            title="Edit Submenu"
          >
            <HiPencil className="w-3 h-3" />
          </button>
          <Popconfirm
            title="Are you sure you want to delete this submenu?"
            onConfirm={() => handleDeleteSubmenu(record.id)}
            okText="Yes"
            cancelText="No"
            placement="topRight"
          >
            <button
              className="p-1.5 rounded text-slate-500 hover:text-white hover:bg-red-600 transition-all duration-300"
              title="Delete Submenu"
            >
              <HiTrash className="w-3 h-3" />
            </button>
          </Popconfirm>
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
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
                  <p className="text-slate-600 dark:text-gray-400 text-sm">
                    Manage your application menus and submenus
                  </p>
                </div>
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

        {/* Menu Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-slate-600 mx-auto mb-4"></div>
              <p className="text-slate-600 dark:text-gray-400 font-medium">Loading menus...</p>
            </div>
          ) : menus.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-r from-slate-600 to-slate-700 flex items-center justify-center shadow-lg">
                <HiBars3 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">No menus found</h3>
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
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
              }}
              expandable={{
                expandedRowRender,
                rowExpandable: (record) => record.submenus && record.submenus.length > 0,
                expandIcon: ({ expanded, onExpand, record }) => (
                  record.submenus && record.submenus.length > 0 ? (
                    <button
                      onClick={e => onExpand(record, e)}
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
                  )
                ),
              }}
              className="menu-management-table"
            />
          )}
        </div>
      </div>

      {/* Modal */}
      <Modal
        title={
          <div className="flex items-center gap-3 pb-4 border-b border-gray-200 dark:border-gray-700">
            <div className="p-2 rounded-lg bg-slate-700">
              {isSubmenuModal ? (
                <MdMenuOpen className="w-5 h-5 text-white" />
              ) : (
                <HiBars3 className="w-5 h-5 text-white" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
                {isSubmenuModal
                  ? editingItem
                    ? 'Edit Submenu'
                    : 'Add Submenu'
                  : editingItem
                  ? 'Edit Menu'
                  : 'Add Menu'}
              </h3>
              <p className="text-sm text-slate-600 dark:text-gray-400">
                {isSubmenuModal
                  ? editingItem
                    ? 'Update submenu details'
                    : 'Create a new submenu'
                  : editingItem
                  ? 'Update menu details'
                  : 'Create a new menu'}
              </p>
            </div>
          </div>
        }
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
        className="menu-modal"
      >
        <div className="pt-6">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            className="space-y-4"
          >
            {isSubmenuModal && (
              <Form.Item
                name="menuId"
                label={<span className="text-slate-700 dark:text-gray-300 font-medium">Menu ID</span>}
                rules={[{ required: true, message: 'Menu ID is required' }]}
              >
                <Input 
                  disabled 
                  className="bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                />
              </Form.Item>
            )}
            
            <Form.Item
              name="name"
              label={<span className="text-slate-700 dark:text-gray-300 font-medium">Name</span>}
              rules={[{ required: true, message: 'Name is required' }]}
            >
              <Input 
                placeholder="Enter name" 
                className="border-gray-300 dark:border-gray-600 focus:border-brand-500 dark:focus:border-brand-400"
              />
            </Form.Item>

            <Form.Item
              name="slug"
              label={<span className="text-slate-700 dark:text-gray-300 font-medium">Slug</span>}
              rules={[{ required: true, message: 'Slug is required' }]}
            >
              <Input 
                placeholder="Enter slug" 
                className="border-gray-300 dark:border-gray-600 focus:border-brand-500 dark:focus:border-brand-400"
              />
            </Form.Item>

            <Form.Item
              name="path"
              label={<span className="text-slate-700 dark:text-gray-300 font-medium">Path</span>}
            >
              <Input 
                placeholder="Enter path" 
                className="border-gray-300 dark:border-gray-600 focus:border-brand-500 dark:focus:border-brand-400"
              />
            </Form.Item>

            {!isSubmenuModal && (
              <Form.Item
                name="icon"
                label={<span className="text-slate-700 dark:text-gray-300 font-medium">Icon</span>}
              >
                <Input 
                  placeholder="Enter icon" 
                  className="border-gray-300 dark:border-gray-600 focus:border-brand-500 dark:focus:border-brand-400"
                />
              </Form.Item>
            )}

            <Form.Item
              name="sortOrder"
              label={<span className="text-slate-700 dark:text-gray-300 font-medium">Sort Order</span>}
            >
              <Input 
                type="number" 
                placeholder="Enter sort order" 
                className="border-gray-300 dark:border-gray-600 focus:border-brand-500 dark:focus:border-brand-400"
              />
            </Form.Item>

            <Form.Item
              name="isActive"
              label={<span className="text-slate-700 dark:text-gray-300 font-medium">Active</span>}
              valuePropName="checked"
              initialValue={true}
            >
              <Switch className="bg-gray-300 checked:bg-brand-500" />
            </Form.Item>

            <Form.Item className="mb-0 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalVisible(false)}
                  className="px-6 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-slate-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 rounded-lg bg-slate-700 hover:bg-slate-800 text-white font-medium shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading && (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  )}
                  {editingItem ? 'Update' : 'Create'}
                </button>
              </div>
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </div>
  );
};

export default MenuManagement;