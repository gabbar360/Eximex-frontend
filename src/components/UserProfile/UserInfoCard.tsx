import { useState, useEffect } from 'react';
import { useModal } from '../../hooks/useModal';
import { Modal } from '../ui/modal';
import Button from '../ui/button/Button';
import Input from '../form/input/InputField';
import Label from '../form/Label';

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
  company?: {
    id: number;
    name: string;
    address?: string;
  };
}

interface UserInfoCardProps {
  userData: UserData | null;
  onUpdate: (data: Partial<UserData>) => Promise<void>;
}

export default function UserInfoCard({
  userData,
  onUpdate,
}: UserInfoCardProps) {
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
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
            Personal Information
          </h4>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Full Name
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {userData?.name || 'N/A'}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Email address
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {userData?.email || 'N/A'}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Mobile Number
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {userData?.mobileNum || 'N/A'}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Role
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {typeof userData?.role === 'object' && userData.role ? userData.role.displayName : userData?.role || 'N/A'}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Company
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {userData?.company?.name || 'No Company'}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={openModal}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
        >
          <svg
            className="fill-current"
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z"
              fill=""
            />
          </svg>
          Edit
        </button>
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-4xl mx-4">
        <div className="relative w-full max-w-4xl bg-white dark:bg-gray-900 rounded-3xl shadow-2xl">
          {/* Header */}
          <div className="px-6 py-6 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                Edit Personal Information
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Update your personal details to keep your profile current
              </p>
            </div>
          </div>

          {/* Form Content */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSave();
            }}
          >
            <div className="px-6 py-6 max-h-[70vh] overflow-y-auto">
              {/* Personal Information Section */}
              <div className="mb-8">
                <div className="flex items-center mb-6">
                  <div className="flex items-center justify-center w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-3">
                    <svg
                      className="w-5 h-5 text-blue-600 dark:text-blue-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Personal Information
                    </h4>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="lg:col-span-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder="your.email@example.com"
                    />
                  </div>

                  <div>
                    <Label htmlFor="mobileNum">Mobile Number</Label>
                    <Input
                      id="mobileNum"
                      type="text"
                      value={formData.mobileNum}
                      onChange={(e) =>
                        setFormData({ ...formData, mobileNum: e.target.value })
                      }
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 rounded-b-3xl">
              <div className="flex items-center justify-end">
                <div className="flex items-center space-x-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={closeModal}
                    type="button"
                    className="hover:bg-red-500 hover:text-white transition-colors duration-300 ease-in-out"
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    type="submit"
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                  >
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Save Changes
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
