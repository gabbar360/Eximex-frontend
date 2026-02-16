import { useDispatch } from 'react-redux';
import { useState, useEffect, useCallback } from 'react';
import UserInfoCard from '../components/UserProfile/UserInfoCard';
import CompanyDetailsCard from '../components/UserProfile/CompanyDetailsCard';
import PageMeta from '../components/common/PageMeta';
import { fetchCurrentUser, updateUser } from '../features/userSlice';
import {
  HiUser,
  HiBuildingOffice2,
  HiArrowLeft,
  HiPencil,
} from 'react-icons/hi2';
import { useNavigate } from 'react-router-dom';
import { Image } from 'antd';
import { EyeOutlined } from '@ant-design/icons';

interface BankDetail {
  id: number;
  companyId: number;
  bankName: string;
  bankAddress: string;
  accountNumber: string;
  ifscCode: string;
  swiftCode: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UserData {
  id: number;
  name: string;
  email: string;
  mobileNum?: string;
  role: string;
  status: string;
  companyId?: number;
  company?: {
    id: number;
    name: string;
    address?: string;
    bankDetails?: BankDetail[];
  };
}

export default function UserProfiles() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingProfile, setEditingProfile] = useState(false);

  const fetchUserData = useCallback(async () => {
    try {
      setLoading(true);
      const result = await dispatch(fetchCurrentUser()).unwrap();
      setUserData(result.data || result);
      setError(null);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  const handleUpdateUser = async (updatedData: Partial<UserData>) => {
    if (!userData) return;
    try {
      console.log('Updating user with data:', updatedData);
      const result = await dispatch(
        updateUser({ id: userData.id, userData: updatedData })
      ).unwrap();
      console.log('Update result:', result);

      // Update local state immediately
      setUserData((prev) => ({ ...prev, ...updatedData }));
      setEditingProfile(false);

      // Then refresh from server
      await fetchUserData();
    } catch (error) {
      console.error('Error updating user:', error);
      setError(error.message);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">Loading...</div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={fetchUserData}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title="Profile Settings | Eximex - Professional Export Management"
        description="Manage your profile settings and company information in Eximex"
      />

      <div className="min-h-screen bg-gray-50">
        <div className="p-2 lg:p-4">
          {/* Header */}
          <div className="mb-3">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-3 lg:p-4">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="p-3 rounded-lg bg-slate-700 text-white hover:bg-slate-800 transition-all duration-300 hover:shadow-lg"
                  >
                    <HiArrowLeft className="w-5 h-5" />
                  </button>
                  <div className="p-3 rounded-lg bg-slate-700 shadow-lg">
                    <HiUser className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 mb-1">
                      Profile
                    </h1>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => setEditingProfile(!editingProfile)}
                    className="inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold text-white bg-slate-700 hover:bg-slate-800 shadow-lg text-sm sm:text-base"
                  >
                    <HiPencil className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">
                      {editingProfile ? 'Cancel Edit' : 'Edit Profile'}
                    </span>
                    <span className="sm:hidden">
                      {editingProfile ? 'Cancel' : 'Edit'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center overflow-hidden">
                {userData?.profilePicture ? (
                  <img
                    src={userData.profilePicture}
                    alt={userData.name || 'User'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <HiUser className="w-8 h-8 text-slate-400" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-800">
                  {userData?.name || 'Loading...'}
                </h2>
                <p className="text-slate-600">
                  {typeof userData?.role === 'object' && userData.role
                    ? userData.role.displayName
                    : userData?.role || 'N/A'}
                </p>
              </div>
            </div>

            {editingProfile ? (
              <UserInfoCard
                userData={userData}
                onUpdate={handleUpdateUser}
                isEditing={true}
                onCancel={() => setEditingProfile(false)}
              />
            ) : (
              <UserInfoCard
                userData={userData}
                onUpdate={handleUpdateUser}
                isEditing={false}
              />
            )}
          </div>

          {/* Company Section */}
          {userData?.company && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden">
                  {userData.company.logo ? (
                    <Image
                      src={`${import.meta.env.VITE_API_BASE_URL?.replace('/api/v1', '') || window.location.origin}${userData.company.logo}`}
                      alt="Company Logo"
                      className="w-full h-full object-contain"
                      preview={{
                        mask: (
                          <EyeOutlined
                            style={{ fontSize: '16px', color: 'white' }}
                          />
                        ),
                      }}
                    />
                  ) : (
                    <HiBuildingOffice2 className="w-6 h-6 text-slate-600" />
                  )}
                </div>
                <h3 className="text-lg font-semibold text-slate-800">
                  Company Information
                </h3>
              </div>
              <CompanyDetailsCard companyData={userData.company} />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
