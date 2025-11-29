import { useDispatch, useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import PageBreadcrumb from '../components/common/PageBreadCrumb';
import UserMetaCard from '../components/UserProfile/UserMetaCard';
import UserInfoCard from '../components/UserProfile/UserInfoCard';
import UserAddressCard from '../components/UserProfile/UserAddressCard';
import CompanyDetailsCard from '../components/UserProfile/CompanyDetailsCard';
import PageMeta from '../components/common/PageMeta';
import { fetchCurrentUser, updateUser } from '../features/userSlice';
import {
  HiUser,
  HiShieldCheck,
  HiBuildingOffice2,
  HiChartBar,
  HiCog6Tooth,
  HiBell,
} from 'react-icons/hi2';
import { Image } from 'antd';
import { EyeOutlined } from '@ant-design/icons';

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
    bankName?: string;
    bankAddress?: string;
    accountNumber?: string;
    ifscCode?: string;
    swiftCode?: string;
  };
}

export default function UserProfiles() {
  const dispatch = useDispatch();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingProfile, setEditingProfile] = useState(false);


  const fetchUserData = async () => {
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
  };

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
  }, []);

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
        <div className="max-w-7xl mx-auto p-6">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-700 rounded-full mb-6 shadow-xl">
              <HiUser className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-slate-800 mb-4">
              Profile Dashboard
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Manage your personal information and company details in one place
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8">
            {/* Profile Section */}
            <div>
              {/* Profile Card */}
              <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden mb-8">
                <div className="relative">
                  <div className="h-32 bg-slate-700"></div>
                  <div className="absolute -bottom-16 left-8">
                    <div className="relative">
                      <div className="w-32 h-32 bg-white rounded-full border-4 border-white shadow-2xl flex items-center justify-center overflow-hidden">
                        {userData?.profilePicture ? (
                          <img
                            src={userData.profilePicture}
                            alt={userData.name || 'User'}
                            className="w-full h-full object-cover"
                            onLoad={() =>
                              console.log(
                                'Profile image loaded successfully:',
                                userData.profilePicture
                              )
                            }
                            onError={(e) => {
                              console.log(
                                'Profile image failed to load:',
                                userData.profilePicture
                              );
                              console.log('Error details:', e);
                            }}
                          />
                        ) : (
                          <HiUser className="text-4xl text-slate-400" />
                        )}{' '}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-20 pb-8 px-8">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-3xl font-bold text-slate-800 mb-2">
                        {userData?.name || 'Loading...'}
                      </h2>
                      <p className="text-lg text-slate-600">
                        {typeof userData?.role === 'object' && userData.role
                          ? userData.role.displayName
                          : userData?.role || 'N/A'}
                      </p>
                    </div>

                    <button
                      onClick={() => setEditingProfile(!editingProfile)}
                      className="px-6 py-3 bg-slate-700 hover:bg-slate-800 text-white rounded-xl font-semibold shadow-lg transition-all duration-300 transform hover:scale-105"
                    >
                      {editingProfile ? 'Cancel Edit' : 'Edit Profile'}
                    </button>
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
              </div>

              {/* Company Card */}
              {userData?.company && (
                <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg overflow-hidden border border-gray-200">
                        {userData.company.logo ? (
                          <Image
                            src={`${import.meta.env.VITE_API_BASE_URL?.replace('/api/v1', '') || window.location.origin}${userData.company.logo}`}
                            alt="Company Logo"
                            className="w-full h-full object-contain"
                            preview={{
                              mask: (
                                <EyeOutlined
                                  style={{ fontSize: '20px', color: 'white' }}
                                />
                              ),
                            }}
                          />
                        ) : (
                          <HiBuildingOffice2 className="w-8 h-8 text-slate-600" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-slate-800">
                          Company Information
                        </h3>
                        <p className="text-slate-600">
                          Manage your business details and settings
                        </p>
                      </div>
                    </div>


                  </div>

                  <CompanyDetailsCard companyData={userData.company} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
