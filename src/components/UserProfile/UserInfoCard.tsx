import { useState, useEffect } from 'react';
import Input from '../form/input/InputField';
import Label from '../form/Label';

interface UserData {
  id: number;
  name: string;
  email: string;
  mobileNum?: string;
  role:
    | {
        id: number;
        name: string;
        displayName: string;
        description?: string;
        permissions?: any;
        isActive: boolean;
        isSystem: boolean;
        createdAt: string;
        updatedAt: string;
      }
    | string;
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
  isEditing?: boolean;
  onCancel?: () => void;
}

export default function UserInfoCard({
  userData,
  onUpdate,
  isEditing = false,
  onCancel,
}: UserInfoCardProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNum, setMobileNum] = useState('');

  useEffect(() => {
    if (userData) {
      setName(userData.name || '');
      setEmail(userData.email || '');
      setMobileNum(userData.mobileNum || '');
    }
  }, [userData, isEditing]);

  const handleSaveClick = () => {
    console.log('Save button clicked!');
    const formData = { name, email, mobileNum };
    console.log('Form data:', formData);
    onUpdate(formData);
  };

  if (isEditing) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="mobileNum">Mobile Number</Label>
            <Input
              id="mobileNum"
              type="text"
              value={mobileNum}
              onChange={(e) => setMobileNum(e.target.value)}
              placeholder="+91 98765 43210"
              className="mt-2"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4 border-t border-gray-200">
          <button
            onClick={onCancel}
            type="button"
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveClick}
            type="button"
            className="px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-lg transition-colors text-sm sm:text-base"
          >
            Save Changes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">Full Name</p>
          <p className="text-slate-800 font-medium">
            {userData?.name || 'N/A'}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">Email</p>
          <p className="text-slate-800 font-medium">
            {userData?.email || 'N/A'}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">Mobile</p>
          <p className="text-slate-800 font-medium">
            {userData?.mobileNum || 'N/A'}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">Role</p>
          <p className="text-slate-800 font-medium">
            {typeof userData?.role === 'object' && userData.role
              ? userData.role.displayName
              : userData?.role || 'N/A'}
          </p>
        </div>
        <div className="md:col-span-2">
          <p className="text-sm font-medium text-slate-500 mb-1">Company</p>
          <p className="text-slate-800 font-medium">
            {userData?.company?.name || 'No Company'}
          </p>
        </div>
      </div>
    </div>
  );
}
