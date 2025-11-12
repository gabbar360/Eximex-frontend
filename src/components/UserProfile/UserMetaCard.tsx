import { useState, useEffect } from 'react';
import { useModal } from '../../hooks/useModal';
import { Modal } from '../ui/modal';
import Button from '../ui/button/Button';
import Input from '../form/input/InputField';
import Label from '../form/Label';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';

interface UserData {
  id: number;
  name: string;
  email: string;
  mobileNum?: string;
  role: {
    id: number;
    name: string;
    displayName: string;
    description?: string;
    permissions?: any;
    isActive: boolean;
    isSystem: boolean;
    createdAt: string;
    updatedAt: string;
  } | string;
  status: string;
  companyId?: number;
  profilePicture?: string;
  googleId?: string;
  isEmailVerified?: boolean;
  company?: {
    id: number;
    name: string;
    address?: string;
  };
}

interface UserMetaCardProps {
  userData: UserData | null;
  onUpdate: (data: Partial<UserData>) => Promise<void>;
}

export default function UserMetaCard({
  userData,
  onUpdate,
}: UserMetaCardProps) {
  const { isOpen, openModal, closeModal } = useModal();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobileNum: '',
  });

  useEffect(() => {
    if (userData) {
      setFormData({
        name: userData.name || '',
        email: userData.email || '',
        mobileNum: userData.mobileNum || '',
      });
    }
  }, [userData]);

  const handleSave = async () => {
    try {
      await onUpdate(formData);
      closeModal();
    } catch (error) {
      console.error('Error saving changes:', error);
    }
  };
  return (
    <>
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
            <div className="w-20 h-20 flex items-center justify-center border border-gray-200 rounded-full dark:border-gray-800 bg-gray-100 dark:bg-gray-700 overflow-hidden relative">
              {userData?.profilePicture ? (
                <>
                  <img
                    src={userData.profilePicture}
                    alt={userData.name || 'User'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const fallback =
                        e.currentTarget.parentElement?.querySelector(
                          '.fallback-icon'
                        );
                      if (fallback) fallback.classList.remove('hidden');
                    }}
                  />
                  <div className="fallback-icon hidden absolute inset-0 flex items-center justify-center">
                    <FontAwesomeIcon
                      icon={faUser}
                      className="text-2xl text-gray-500 dark:text-gray-400"
                    />
                  </div>
                </>
              ) : (
                <FontAwesomeIcon
                  icon={faUser}
                  className="text-2xl text-gray-500 dark:text-gray-400"
                />
              )}
            </div>
            <div className="order-3 xl:order-2">
              <h4 className="mb-2 text-lg font-semibold text-center text-gray-800 dark:text-white/90 xl:text-left">
                {userData?.name || 'Loading...'}
              </h4>
              <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {typeof userData?.role === 'object' && userData.role ? userData.role.displayName : userData?.role || 'N/A'}
                </p>
                <div className="hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 xl:block"></div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {userData?.company?.name || 'No Company'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Edit Personal Information
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Update your details to keep your profile up-to-date.
            </p>
          </div>
          <form className="flex flex-col">
            <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
              <div className="mt-7">
                <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                  Personal Information
                </h5>

                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                  <div className="col-span-2">
                    <Label>Full Name</Label>
                    <Input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Email Address</Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Mobile Number</Label>
                    <Input
                      type="text"
                      value={formData.mobileNum}
                      onChange={(e) =>
                        setFormData({ ...formData, mobileNum: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeModal}>
                Close
              </Button>
              <Button size="sm" onClick={handleSave}>
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}
