import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import {
  HiPlus,
  HiOfficeBuilding,
  HiUsers,
  HiPencil,
  HiTrash,
} from 'react-icons/hi';
import { HiMagnifyingGlass } from 'react-icons/hi2';
import { Pagination } from 'antd';
import axiosInstance from '../../utils/axiosInstance';
import CompanySetupForm from '../../components/CompanySetupForm';
import { useDebounce } from '../../utils/useDebounce';

const CompanyManagement: React.FC = () => {
  const [companies, setCompanies] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Record<
    string,
    unknown
  > | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Record<
    string,
    unknown
  > | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });

  const fetchCompanies = React.useCallback(
    async (page = currentPage, limit = pageSize, search = searchTerm) => {
      try {
        setLoading(true);
        const response = await axiosInstance.get('/super-admin/companies', {
          params: { page, limit, search },
        });
        setCompanies(response.data.data.data || response.data.data);
        if (response.data.data.pagination) {
          setPagination(response.data.data.pagination);
        }
      } catch {
        toast.error('Failed to fetch companies');
      } finally {
        setLoading(false);
      }
    },
    [currentPage, pageSize, searchTerm]
  );

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const { debouncedCallback: debouncedSearch } = useDebounce(
    (value: string) => {
      setCurrentPage(1);
      fetchCompanies(1, pageSize, value);
    },
    500
  );

  const handleFormClose = () => {
    setEditingCompany(null);
    setShowForm(false);
    fetchCompanies();
  };

  const handleSearch = useCallback(
    (value: string) => {
      setSearchTerm(value);
      debouncedSearch(value);
    },
    [debouncedSearch]
  );

  const handleEdit = (company: Record<string, unknown>) => {
    setEditingCompany(company);
    setShowForm(true);
  };

  const handleDeleteClick = (company: Record<string, unknown>) => {
    setConfirmDelete(company);
  };

  const handleConfirmDelete = async () => {
    if (confirmDelete) {
      try {
        await axiosInstance.delete(
          `/super-admin/companies/${confirmDelete.id}`
        );
        toast.success('Company deleted successfully');
        fetchCompanies();
        setConfirmDelete(null);
      } catch {
        toast.error('Failed to delete company');
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
        <div className="mb-3">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-3 lg:p-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-slate-700 shadow-lg">
                  <HiOfficeBuilding className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 mb-1">
                    Company Management
                  </h1>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <HiMagnifyingGlass className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search companies..."
                    className="pl-12 pr-4 py-3 w-full sm:w-72 rounded-lg border border-gray-300 bg-white focus:border-slate-500 focus:ring-2 focus:ring-slate-200 transition-all duration-300 text-sm placeholder-gray-500 shadow-sm"
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                </div>

                <button
                  onClick={() => setShowForm(true)}
                  className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-semibold text-white bg-slate-700 hover:bg-slate-800 shadow-lg"
                >
                  <HiPlus className="w-5 h-5 mr-2" />
                  Create Company
                </button>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-slate-600 mx-auto mb-4"></div>
            <p className="text-slate-600 font-medium">Loading companies...</p>
          </div>
        ) : companies.length === 0 ? (
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/30 p-12 text-center">
            <div className="w-10 h-10 mx-auto mb-6 rounded-2xl bg-slate-600 flex items-center justify-center shadow-lg">
              <HiMagnifyingGlass className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">
              No companies found
            </h3>
            <p className="text-slate-600 mb-6">
              {searchTerm
                ? 'Try adjusting your search.'
                : 'Create your first company to get started.'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
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
                  {companies.map((company: Record<string, unknown>) => (
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
                        <div className="text-sm text-slate-600">
                          {company.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-slate-600">
                          <HiUsers className="w-4 h-4 mr-1" />
                          {company._count?.users || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            company.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
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
                            onClick={() => handleDeleteClick(company)}
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
          </div>
        )}

        {/* Pagination */}
        {pagination.total > 0 && (
          <div className="flex justify-center mt-6">
            <Pagination
              current={currentPage}
              total={pagination.total}
              pageSize={pageSize}
              onChange={(page) => {
                setCurrentPage(page);
                fetchCompanies(page, pageSize, searchTerm);
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
                Delete Company
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

export default CompanyManagement;
