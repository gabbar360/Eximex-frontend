import { useState, useEffect } from 'react';
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
        
        <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            onClick={onCancel}
            type="button"
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-2xl hover:bg-gray-50 transition-colors font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveClick}
            type="button"
            className="px-6 py-3 bg-slate-700 hover:bg-slate-800 text-white rounded-2xl transition-all duration-300 font-semibold shadow-lg"
          >
            Save Changes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">
          Full Name
        </p>
        <p className="text-lg font-bold text-slate-800">
          {userData?.name || 'N/A'}
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">
          Email Address
        </p>
        <p className="text-lg font-bold text-slate-800">
          {userData?.email || 'N/A'}
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">
          Mobile Number
        </p>
        <p className="text-lg font-bold text-slate-800">
          {userData?.mobileNum || 'N/A'}
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">
          Role
        </p>
        <p className="text-lg font-bold text-slate-800">
          {typeof userData?.role === 'object' && userData.role ? userData.role.displayName : userData?.role || 'N/A'}
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm md:col-span-2">
        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">
          Company
        </p>
        <p className="text-lg font-bold text-slate-800">
          {userData?.company?.name || 'No Company'}
        </p>
      </div>
    </div>
  );
}