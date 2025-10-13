import React, { useState, useEffect } from 'react';
import { useAuth, PermissionGuard } from '../context/AuthContext';
import { userService } from '../service/userService';
import { toast } from 'react-toastify';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import DataAssignment from './DataAssignment';

interface Staff {
  id: number;
  name: string;
  email: string;
  mobileNum?: string;
  role: string;
  status: string;
  lastLogin: string | null;
  createdAt: string;
}

interface DataSummary {
  parties: number;
  products: number;
  piInvoices: number;
  orders: number;
  vgmDocuments: number;
  total: number;
}

const StaffManagement: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [dataSummary, setDataSummary] = useState<DataSummary | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [showDataAssignment, setShowDataAssignment] = useState(false);

  const fetchStaff = async () => {
    try {
      const data = await userService.getCompanyStaff();
      setStaff(data.data || []);
    } catch (error) {
      console.error('Failed to fetch staff:', error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchDataSummary = async (userId: number) => {
    try {
      const data = await userService.getUserDataSummary(userId);
      setDataSummary(data);
    } catch (error) {
      console.error('Failed to fetch data summary:', error);
      toast.error(error.message);
    }
  };

  const handleCreateStaff = async (formData: any) => {
    try {
      const userData = {
        ...formData,
        companyId: currentUser?.companyId,
      };
      const result = await userService.createUser(userData);
      setShowCreateForm(false);
      fetchStaff();
      toast.success(result.message);
    } catch (error) {
      console.error('Failed to create staff:', error);
      toast.error(error.message);
    }
  };

  const handleDeleteAndReassign = async (
    staffId: number,
    reassignToUserId: number
  ) => {
    try {
      const result = await userService.deleteStaffAndReassign(
        staffId,
        reassignToUserId
      );
      setShowReassignModal(false);
      setSelectedStaff(null);
      fetchStaff();
      toast.success(result.message);
    } catch (error) {
      console.error('Failed to delete and reassign:', error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  useEffect(() => {
    if (selectedStaff) {
      fetchDataSummary(selectedStaff.id);
    }
  }, [selectedStaff]);

  if (loading) {
    return (
      <div className="flex justify-center p-8 text-gray-900 dark:text-gray-100">
        Loading...
      </div>
    );
  }

  return (
    <PermissionGuard permission="canManageStaff">
      <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Staff Management
          </h1>
          <div className="flex gap-2">
            <button
              onClick={() => setShowDataAssignment(true)}
              className="bg-green-500 dark:bg-green-600 text-white px-4 py-2 rounded hover:bg-green-600 dark:hover:bg-green-700"
            >
              Assign Data
            </button>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-500 dark:bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-600 dark:hover:bg-blue-700"
            >
              Add Staff
            </button>
          </div>
        </div>

        {/* Staff List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Staff Members
            </h2>
            <div className="space-y-3">
              {staff.map((member) => (
                <div
                  key={member.id}
                  className={`p-3 border border-gray-200 dark:border-gray-600 rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${
                    selectedStaff?.id === member.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : ''
                  }`}
                  onClick={() => setSelectedStaff(member)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">
                        {member.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {member.email}
                      </p>
                      {member.mobileNum && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {member.mobileNum}
                        </p>
                      )}
                      <div className="flex gap-2 mt-1">
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            member.role === 'ADMIN'
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          }`}
                        >
                          {member.role}
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            member.status === 'ACTIVE'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}
                        >
                          {member.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Staff Details */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            {selectedStaff ? (
              <div>
                <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                  Staff Details
                </h2>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Name
                    </label>
                    <p className="text-gray-900 dark:text-gray-100">
                      {selectedStaff.name}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Email
                    </label>
                    <p className="text-gray-900 dark:text-gray-100">
                      {selectedStaff.email}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Mobile Number
                    </label>
                    <p className="text-gray-900 dark:text-gray-100">
                      {selectedStaff.mobileNum || 'Not provided'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Last Login
                    </label>
                    <p className="text-gray-900 dark:text-gray-100">
                      {selectedStaff.lastLogin
                        ? new Date(selectedStaff.lastLogin).toLocaleDateString()
                        : 'Never'}
                    </p>
                  </div>

                  {dataSummary && (
                    <div className="mt-6">
                      <h3 className="font-medium mb-3 text-gray-900 dark:text-gray-100">
                        Data Summary
                      </h3>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">
                            Parties:
                          </span>
                          <span className="text-gray-900 dark:text-gray-100">
                            {dataSummary.parties}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">
                            Products:
                          </span>
                          <span className="text-gray-900 dark:text-gray-100">
                            {dataSummary.products}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">
                            PI Invoices:
                          </span>
                          <span className="text-gray-900 dark:text-gray-100">
                            {dataSummary.piInvoices}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">
                            Orders:
                          </span>
                          <span className="text-gray-900 dark:text-gray-100">
                            {dataSummary.orders}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">
                            VGM Documents:
                          </span>
                          <span className="text-gray-900 dark:text-gray-100">
                            {dataSummary.vgmDocuments}
                          </span>
                        </div>
                        <div className="flex justify-between font-medium border-t border-gray-200 dark:border-gray-600 pt-2">
                          <span className="text-gray-900 dark:text-gray-100">
                            Total:
                          </span>
                          <span className="text-gray-900 dark:text-gray-100">
                            {dataSummary.total}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 mt-6">
                    <button
                      onClick={() => setShowReassignModal(true)}
                      className="bg-red-500 dark:bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-600 dark:hover:bg-red-700 disabled:opacity-50"
                      disabled={
                        selectedStaff.role === 'ADMIN' &&
                        currentUser?.role !== 'SUPER_ADMIN'
                      }
                    >
                      Delete & Reassign
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 dark:text-gray-400">
                Select a staff member to view details
              </div>
            )}
          </div>
        </div>

        {/* Create Staff Modal */}
        {showCreateForm && (
          <CreateStaffModal
            onClose={() => setShowCreateForm(false)}
            onSubmit={handleCreateStaff}
          />
        )}

        {/* Reassign Modal */}
        {showReassignModal && selectedStaff && (
          <ReassignModal
            staff={selectedStaff}
            availableStaff={staff.filter(
              (s) => s.id !== selectedStaff.id && s.status === 'ACTIVE'
            )}
            onClose={() => setShowReassignModal(false)}
            onConfirm={handleDeleteAndReassign}
          />
        )}

        {/* Data Assignment Modal */}
        <DataAssignment
          isOpen={showDataAssignment}
          onClose={() => setShowDataAssignment(false)}
        />
      </div>
    </PermissionGuard>
  );
};

// Create Staff Modal Component
const CreateStaffModal: React.FC<{
  onClose: () => void;
  onSubmit: (data: any) => void;
}> = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobileNum: '',
    password: '',
    role: 'STAFF',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    mobileNum: '',
    password: '',
  });

  const validateForm = () => {
    const newErrors = { name: '', email: '', mobileNum: '', password: '' };

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = 'Email is invalid';
    if (!formData.mobileNum) newErrors.mobileNum = 'Mobile number is required';
    else if (formData.mobileNum.length < 10)
      newErrors.mobileNum = 'Mobile number must be at least 10 digits';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6)
      newErrors.password = 'Password must be at least 6 characters';

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const formattedData = {
      ...formData,
      mobileNum: formData.mobileNum
        ? formData.mobileNum.replace(/\D/g, '')
        : '',
    };

    onSubmit(formattedData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Create New Staff
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Name
            </label>
            <input
              type="text"
              value={formData.name}
              placeholder="Enter name"
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                if (errors.name) setErrors({ ...errors, name: '' });
              }}
              className={`w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${errors.name ? 'border-red-500' : ''}`}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              placeholder="Enter email"
              onChange={(e) => {
                setFormData({ ...formData, email: e.target.value });
                if (errors.email) setErrors({ ...errors, email: '' });
              }}
              className={`w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${errors.email ? 'border-red-500' : ''}`}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Mobile Number
            </label>
            <input
              type="tel"
              value={formData.mobileNum}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                if (value.length <= 12) {
                  setFormData({ ...formData, mobileNum: value });
                  if (errors.mobileNum) setErrors({ ...errors, mobileNum: '' });
                }
              }}
              minLength={10}
              maxLength={12}
              className={`w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${errors.mobileNum ? 'border-red-500' : ''}`}
              placeholder="Enter mobile number"
              pattern="[0-9]*"
            />
            {errors.mobileNum && (
              <p className="text-red-500 text-sm mt-1">{errors.mobileNum}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                placeholder="Enter password"
                onChange={(e) => {
                  setFormData({ ...formData, password: e.target.value });
                  if (errors.password) setErrors({ ...errors, password: '' });
                }}
                className={`w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 pr-10 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${errors.password ? 'border-red-500' : ''}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                {showPassword ? (
                  <AiOutlineEyeInvisible size={20} />
                ) : (
                  <AiOutlineEye size={20} />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Role
            </label>
            <select
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value })
              }
              className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="STAFF">Staff</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 dark:bg-blue-600 text-white rounded hover:bg-blue-600 dark:hover:bg-blue-700"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Reassign Modal Component
const ReassignModal: React.FC<{
  staff: Staff;
  availableStaff: Staff[];
  onClose: () => void;
  onConfirm: (staffId: number, reassignToUserId: number) => void;
}> = ({ staff, availableStaff, onClose, onConfirm }) => {
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const handleConfirm = () => {
    if (selectedUserId) {
      onConfirm(staff.id, selectedUserId);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Delete Staff & Reassign Data
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          This will permanently delete{' '}
          <strong className="text-gray-900 dark:text-gray-100">
            {staff.name}
          </strong>{' '}
          and reassign all their data to another staff member.
        </p>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            Reassign data to:
          </label>
          <select
            value={selectedUserId || ''}
            onChange={(e) => setSelectedUserId(Number(e.target.value))}
            className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            required
          >
            <option value="">Select a staff member</option>
            {availableStaff.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.email})
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedUserId}
            className="px-4 py-2 bg-red-500 dark:bg-red-600 text-white rounded hover:bg-red-600 dark:hover:bg-red-700 disabled:opacity-50"
          >
            Delete & Reassign
          </button>
        </div>
      </div>
    </div>
  );
};

export default StaffManagement;
