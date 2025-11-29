import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { HiPlus, HiOfficeBuilding, HiUsers, HiPencil, HiTrash } from 'react-icons/hi';
import axiosInstance from '../../utils/axiosInstance';
import CompanySetupForm from '../../components/CompanySetupForm';

const CompanyManagement: React.FC = () => {
  const [companies, setCompanies] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const response = await axiosInstance.get('/super-admin/companies');
      setCompanies(response.data.data);
    } catch (error) {
      console.error('Failed to fetch companies:', error);
    }
  };

  const handleFormClose = () => {
    setEditingCompany(null);
    setShowForm(false);
    fetchCompanies();
  };

  const handleEdit = (company: any) => {
    setEditingCompany(company);
    setShowForm(true);
  };

  const handleDelete = async (company: any) => {
    if (window.confirm(`Are you sure you want to delete ${company.name}?`)) {
      try {
        await axiosInstance.delete(`/super-admin/companies/${company.id}`);
        toast.success('Company deleted successfully');
        fetchCompanies();
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to delete company');
      }
    }
  };

  if (showForm) {
    return (
      <CompanySetupForm 
        editingCompany={editingCompany}
        onClose={handleFormClose}
        isSuperAdmin={true}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4">
        <div className="mb-4">
          <div className="bg-white rounded-lg border shadow-sm p-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-slate-800">Company Management</h1>
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 px-4 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-800"
              >
                <HiPlus className="w-5 h-5" />
                Create Company
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
          {companies.length === 0 ? (
            <div className="p-8 text-center">
              <HiOfficeBuilding className="w-16 h-16 mx-auto text-slate-400 mb-4" />
              <h3 className="text-lg font-medium text-slate-600 mb-2">No companies found</h3>
              <p className="text-slate-500 mb-4">Create your first company to get started.</p>
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800"
              >
                <HiPlus className="w-4 h-4" />
                Create First Company
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-600 uppercase">
                      Company Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-600 uppercase">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-600 uppercase">
                      Users
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-600 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-600 uppercase">
                      Created At
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-slate-600 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {companies.map((company: any) => (
                    <tr key={company.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <HiOfficeBuilding className="w-5 h-5 text-slate-400 mr-3" />
                          <div className="text-sm font-medium text-slate-900">
                            {company.name}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-600">{company.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-slate-600">
                          <HiUsers className="w-4 h-4 mr-1" />
                          {company._count.users}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          company.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {company.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-600">
                          {new Date(company.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(company)}
                            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all"
                            title="Edit Company"
                          >
                            <HiPencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(company)}
                            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all"
                            title="Delete Company"
                          >
                            <HiTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyManagement;