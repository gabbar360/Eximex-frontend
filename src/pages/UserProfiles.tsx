import { useDispatch, useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import PageBreadcrumb from '../components/common/PageBreadCrumb';
import UserMetaCard from '../components/UserProfile/UserMetaCard';
import UserInfoCard from '../components/UserProfile/UserInfoCard';
import UserAddressCard from '../components/UserProfile/UserAddressCard';
import CompanyDetailsCard from '../components/UserProfile/CompanyDetailsCard';
import PageMeta from '../components/common/PageMeta';
import { fetchCurrentUser, updateUser } from '../features/userSlice';
import { updateCompany } from '../features/companySlice';

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
      const result = await dispatch(updateUser({ id: userData.id, userData: updatedData })).unwrap();
      setUserData({ ...userData, ...result.data });
    } catch (error) {
      console.error('Error updating user:', error);
      setError(error.message);
    }
  };

  const handleUpdateCompany = async (updatedData: any) => {
    if (!userData?.company) return;
    try {
      console.log('Updating company with data:', updatedData);
      console.log('Company ID:', userData.company.id);

      // Create FormData for the API call
      const formData = new FormData();
      Object.keys(updatedData).forEach((key) => {
        if (updatedData[key] !== undefined && updatedData[key] !== null) {
          if (key === 'logo' && updatedData[key] instanceof File) {
            formData.append('logo', updatedData[key]);
          } else if (key !== 'logo') {
            formData.append(key, updatedData[key]);
          }
        }
      });

      const result = await dispatch(updateCompany({ id: userData.company.id, companyData: formData })).unwrap();
      console.log('Update result:', result);

      // Refresh user data to get updated company info
      await fetchUserData();
      return result;
    } catch (error) {
      console.error('Error updating company:', error);
      throw error;
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
        title="React.js Profile Dashboard | TailAdmin - Next.js Admin Dashboard Template"
        description="This is React.js Profile Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageBreadcrumb pageTitle="Profile" />
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
          Profile
        </h3>
        <div className="space-y-6">
          <UserMetaCard userData={userData} onUpdate={handleUpdateUser} />
          <UserInfoCard userData={userData} onUpdate={handleUpdateUser} />
          {/* <UserAddressCard userData={userData} onUpdate={handleUpdateUser} /> */}
          {userData?.company && (
            <CompanyDetailsCard
              companyData={userData.company}
              onUpdate={handleUpdateCompany}
            />
          )}
        </div>
      </div>
    </>
  );
}
