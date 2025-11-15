import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getAllRoles, createRole, updateRole, deleteRole } from '../../features/roleSlice';
import { HiPlus, HiPencil, HiTrash, HiEye, HiArrowLeft, HiCheckCircle } from 'react-icons/hi';

const RoleManagement: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { roles, loading, error } = useSelector((state: any) => state.role);
  
  const [showForm, setShowForm] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredRoles, setFilteredRoles] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    description: ''
  });

  useEffect(() => {
    dispatch(getAllRoles());
  }, [dispatch]);

  useEffect(() => {
    if (roles) {
      const filtered = roles.filter((role: any) =>
        role.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        role.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        role.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredRoles(filtered);
    }
  }, [roles, searchTerm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingRole) {
        await dispatch(updateRole({ id: editingRole.id, roleData: formData })).unwrap();
        toast.success('Role updated successfully');
      } else {
        await dispatch(createRole(formData)).unwrap();
        toast.success('Role created successfully');
      }
      resetForm();
    } catch (error) {
      toast.error(error || 'Operation failed');
    }
  };

  const handleDelete = async (id: number, roleName: string) => {
    if (window.confirm(`Are you sure you want to delete the role "${roleName}"?`)) {
      try {
        await dispatch(deleteRole(id)).unwrap();
        toast.success('Role deleted successfully');
      } catch (error) {
        toast.error(error || 'Delete failed');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      displayName: '',
      description: ''
    });
    setEditingRole(null);
    setShowForm(false);
  };

  const handleEdit = (role: any) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      displayName: role.displayName,
      description: role.description
    });
    setShowForm(true);
  };

  const handleAddNew = () => {
    resetForm();
    setShowForm(true);
  };

  if (loading && !roles.length) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-slate-600 mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading roles...</p>
        </div>
      </div>
    );
  }

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
                      {editingRole ? 'Edit Role' : 'Add New Role'}
                    </h1>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 lg:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Role Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                    placeholder="Enter role name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Display Name *
                  </label>
                  <input
                    type="text"
                    value={formData.displayName}
                    onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                    placeholder="Enter display name"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                  placeholder="Enter role description"
                  rows={3}
                />
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
                      {editingRole ? 'Updating...' : 'Creating...'}
                    </div>
                  ) : (
                    <>
                      <HiCheckCircle className="w-5 h-5 mr-2 inline" />
                      {editingRole ? 'Update Role' : 'Create Role'}
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
        <div className="mb-3">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-3 lg:p-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 mb-1">
                  Role Management
                </h1>
                {/* <p className="text-slate-600">Manage system roles and permissions</p> */}
              </div>
              <button
                onClick={handleAddNew}
                className="flex items-center gap-2 px-4 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-all duration-300 hover:shadow-lg font-medium"
              >
                <HiPlus className="w-5 h-5" />
                Add New Role
              </button>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-4">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
            <input
              type="text"
              placeholder="Search roles by name, display name, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Roles Table */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          {filteredRoles.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-slate-400 mb-4">
                <HiEye className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-slate-600 mb-2">No roles found</h3>
              <p className="text-slate-500 mb-4">
                {searchTerm ? 'No roles match your search criteria.' : 'Get started by creating your first role.'}
              </p>
              {!searchTerm && (
                <button
                  onClick={handleAddNew}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <HiPlus className="w-4 h-4" />
                  Add First Role
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                      Role Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                      Display Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-slate-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRoles.map((role: any) => (
                    <tr key={role.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-slate-900">{role.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-600">{role.displayName}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-600 max-w-xs truncate">
                          {role.description || 'No description'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          role.isSystem 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {role.isSystem ? 'System' : 'Custom'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(role)}
                            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all duration-200"
                            title="Edit Role"
                          >
                            <HiPencil className="w-4 h-4" />
                          </button>
                          {!role.isSystem && (
                            <button
                              onClick={() => handleDelete(role.id, role.name)}
                              className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all duration-200"
                              title="Delete Role"
                            >
                              <HiTrash className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Summary */}
        {filteredRoles.length > 0 && (
          <div className="mt-4 bg-white rounded-lg border border-gray-200 shadow-sm p-4">
            <div className="flex items-center justify-between text-sm text-slate-600">
              <span>
                Showing {filteredRoles.length} of {roles.length} roles
              </span>
              <span>
                {roles.filter((r: any) => r.isSystem).length} system roles, {' '}
                {roles.filter((r: any) => !r.isSystem).length} custom roles
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoleManagement;