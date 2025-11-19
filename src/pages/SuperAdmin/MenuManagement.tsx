import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Table, Modal, Form, Input, Switch, Space, Popconfirm, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { toast } from 'react-toastify';
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
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Slug',
      dataIndex: 'slug',
      key: 'slug',
    },
    {
      title: 'Path',
      dataIndex: 'path',
      key: 'path',
    },
    {
      title: 'Icon',
      dataIndex: 'icon',
      key: 'icon',
    },
    {
      title: 'Sort Order',
      dataIndex: 'sortOrder',
      key: 'sortOrder',
    },
    {
      title: 'Active',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive) => <Switch checked={isActive} disabled />,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<PlusOutlined />}
            onClick={() => handleAddSubmenu(record.id)}
          >
            Add Submenu
          </Button>
          <Button
            type="default"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditMenu(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this menu?"
            onConfirm={() => handleDeleteMenu(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="primary"
              danger
              size="small"
              icon={<DeleteOutlined />}
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const submenuColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Slug',
      dataIndex: 'slug',
      key: 'slug',
    },
    {
      title: 'Path',
      dataIndex: 'path',
      key: 'path',
    },
    {
      title: 'Sort Order',
      dataIndex: 'sortOrder',
      key: 'sortOrder',
    },
    {
      title: 'Active',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive) => <Switch checked={isActive} disabled />,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="default"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditSubmenu(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this submenu?"
            onConfirm={() => handleDeleteSubmenu(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="primary"
              danger
              size="small"
              icon={<DeleteOutlined />}
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const expandedRowRender = (record) => {
    return (
      <Table
        columns={submenuColumns}
        dataSource={record.submenus || []}
        pagination={false}
        rowKey="id"
        size="small"
      />
    );
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Menu Management</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAddMenu}
        >
          Add Menu
        </Button>
      </div>

      <Table
        columns={menuColumns}
        dataSource={menus}
        loading={loading}
        rowKey="id"
        expandable={{
          expandedRowRender,
          rowExpandable: (record) => record.submenus && record.submenus.length > 0,
        }}
      />

      <Modal
        title={
          isSubmenuModal
            ? editingItem
              ? 'Edit Submenu'
              : 'Add Submenu'
            : editingItem
            ? 'Edit Menu'
            : 'Add Menu'
        }
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          {isSubmenuModal && (
            <Form.Item
              name="menuId"
              label="Menu ID"
              rules={[{ required: true, message: 'Menu ID is required' }]}
            >
              <Input disabled />
            </Form.Item>
          )}
          
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Name is required' }]}
          >
            <Input placeholder="Enter name" />
          </Form.Item>

          <Form.Item
            name="slug"
            label="Slug"
            rules={[{ required: true, message: 'Slug is required' }]}
          >
            <Input placeholder="Enter slug" />
          </Form.Item>

          <Form.Item
            name="path"
            label="Path"
          >
            <Input placeholder="Enter path" />
          </Form.Item>

          <Form.Item
            name="icon"
            label="Icon"
          >
            <Input placeholder="Enter icon" />
          </Form.Item>

          <Form.Item
            name="sortOrder"
            label="Sort Order"
          >
            <Input type="number" placeholder="Enter sort order" />
          </Form.Item>

          <Form.Item
            name="isActive"
            label="Active"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingItem ? 'Update' : 'Create'}
              </Button>
              <Button onClick={() => setIsModalVisible(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MenuManagement;