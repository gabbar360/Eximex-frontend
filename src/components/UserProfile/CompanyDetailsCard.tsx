import { useState, useEffect } from 'react';
import { useModal } from '../../hooks/useModal';
import { Modal } from '../ui/modal';
import Button from '../ui/button/Button';
import Input from '../form/input/InputField';
import Label from '../form/Label';
import { toast } from 'react-toastify';
import { Image } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import SignatureUpload from '../SignatureUpload';

interface CompanyData {
  id: number;
  name: string;
  logo?: string;
  signature?: string;
  address?: string;
  phoneNo?: string;
  email?: string;
  gstNumber?: string;
  iecNumber?: string;
  currencies?: string[];
  defaultCurrency?: string;
  allowedUnits?: string[];
  bankName?: string;
  bankAddress?: string;
  accountNumber?: string;
  ifscCode?: string;
  swiftCode?: string;
  isActive?: boolean;
  planId?: string;
}

interface CompanyDetailsCardProps {
  companyData: CompanyData | null;
  onUpdate: (data: Partial<CompanyData>) => Promise<void>;
  isEditing?: boolean;
  onCancel?: () => void;
}

export default function CompanyDetailsCard({
  companyData,
  onUpdate,
  isEditing = false,
  onCancel,
}: CompanyDetailsCardProps) {
  const { isOpen, openModal, closeModal } = useModal();
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phoneNo: '',
    email: '',
    gstNumber: '',
    iecNumber: '',
    defaultCurrency: '',
    bankName: '',
    bankAddress: '',
    accountNumber: '',
    ifscCode: '',
    swiftCode: '',
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoError, setLogoError] = useState(false);
  const [signaturePreview, setSignaturePreview] = useState<string | null>(null);

  useEffect(() => {
    if (companyData) {
      setFormData({
        name: companyData.name || '',
        address: companyData.address || '',
        phoneNo: companyData.phoneNo || '',
        email: companyData.email || '',
        gstNumber: companyData.gstNumber || '',
        iecNumber: companyData.iecNumber || '',
        defaultCurrency: companyData.defaultCurrency || '',
        bankName: companyData.bankName || '',
        bankAddress: companyData.bankAddress || '',
        accountNumber: companyData.accountNumber || '',
        ifscCode: companyData.ifscCode || '',
        swiftCode: companyData.swiftCode || '',
      });
      setLogoPreview(companyData.logo || null);
      setSignaturePreview(companyData.signature || null);
      setLogoError(false); // Reset error state when data changes
    }
  }, [companyData]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };



  const handleSave = async () => {
    try {
      const updateData = { ...formData };
      if (logoFile) {
        updateData.logo = logoFile;
      }

      const result = await onUpdate(updateData);
      toast.success(result?.message || 'Company updated successfully');
      onCancel?.();
    } catch (error: any) {
      toast.error(error?.message || 'Error updating company');
      console.error('Error saving changes:', error);
    }
  };

  if (isEditing) {
    return (
      <div className="space-y-8">
        {/* Company Logo */}
        <div>
          <Label htmlFor="logo">Company Logo</Label>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex-shrink-0">
              {logoPreview ? (
                <img
                  src={
                    logoPreview.startsWith('http') ||
                    logoPreview.startsWith('data:')
                      ? logoPreview
                      : `${import.meta.env.VITE_API_BASE_URL?.replace('/api/v1', '') || window.location.origin}${logoPreview}`
                  }
                  alt="Logo Preview"
                  className="w-20 h-20 rounded-2xl object-cover border border-gray-200"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center border border-gray-200">
                  <svg
                    className="w-8 h-8 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              )}
            </div>
            <div className="flex-1">
              <input
                id="logo"
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
              />
              <p className="text-sm text-gray-500 mt-1">
                Upload a new logo (max 1MB)
              </p>
            </div>
          </div>
        </div>

        {/* Company Signature */}
        <div>
          <Label htmlFor="signature">Company Signature</Label>
          <div className="mt-2">
            <SignatureUpload
              companyId={companyData?.id || 0}
              currentSignature={companyData?.signature}
              onUploadSuccess={(signatureUrl) => {
                setSignaturePreview(signatureUrl);
              }}
            />
          </div>
        </div>

        {/* Company Details Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <Label htmlFor="name">Company Name *</Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Enter company name"
              className="mt-2"
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
              placeholder="company@example.com"
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="phoneNo">Phone Number</Label>
            <Input
              id="phoneNo"
              type="text"
              value={formData.phoneNo}
              onChange={(e) =>
                setFormData({ ...formData, phoneNo: e.target.value })
              }
              placeholder="+91 98765 43210"
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="gstNumber">GST Number</Label>
            <Input
              id="gstNumber"
              type="text"
              value={formData.gstNumber}
              onChange={(e) =>
                setFormData({ ...formData, gstNumber: e.target.value })
              }
              placeholder="22AAAAA0000A1Z5"
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="iecNumber">IEC Number</Label>
            <Input
              id="iecNumber"
              type="text"
              value={formData.iecNumber}
              onChange={(e) =>
                setFormData({ ...formData, iecNumber: e.target.value })
              }
              placeholder="AAAPA0000A000"
              className="mt-2"
            />
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="address">Company Address</Label>
            <textarea
              id="address"
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              placeholder="Enter complete company address"
              className="mt-2 w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-slate-500 focus:border-slate-500 resize-none h-24"
            />
          </div>
        </div>

        {/* Banking Information */}
        <div className="border-t border-gray-200 pt-8">
          <h4 className="text-xl font-bold text-slate-800 mb-6">
            Banking Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <Label htmlFor="bankName">Bank Name</Label>
              <Input
                id="bankName"
                type="text"
                value={formData.bankName}
                onChange={(e) =>
                  setFormData({ ...formData, bankName: e.target.value })
                }
                placeholder="State Bank of India"
                className="mt-2"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="accountNumber">Account Number</Label>
              <Input
                id="accountNumber"
                type="text"
                value={formData.accountNumber}
                onChange={(e) =>
                  setFormData({ ...formData, accountNumber: e.target.value })
                }
                placeholder="1234567890123456"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="ifscCode">IFSC Code</Label>
              <Input
                id="ifscCode"
                type="text"
                value={formData.ifscCode}
                onChange={(e) =>
                  setFormData({ ...formData, ifscCode: e.target.value })
                }
                placeholder="SBIN0001234"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="swiftCode">SWIFT Code</Label>
              <Input
                id="swiftCode"
                type="text"
                value={formData.swiftCode}
                onChange={(e) =>
                  setFormData({ ...formData, swiftCode: e.target.value })
                }
                placeholder="SBININBB123"
                className="mt-2"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="bankAddress">Bank Address</Label>
              <textarea
                id="bankAddress"
                value={formData.bankAddress}
                onChange={(e) =>
                  setFormData({ ...formData, bankAddress: e.target.value })
                }
                placeholder="Enter bank branch address"
                className="mt-2 w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-slate-500 focus:border-slate-500 resize-none h-20"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            onClick={onCancel}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-2xl hover:bg-gray-50 transition-colors font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
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
          Company Name
        </p>
        <p className="text-lg font-bold text-slate-800">
          {companyData?.name || 'N/A'}
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">
          Email Address
        </p>
        <p className="text-lg font-bold text-slate-800">
          {companyData?.email || 'N/A'}
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">
          Phone Number
        </p>
        <p className="text-lg font-bold text-slate-800">
          {companyData?.phoneNo || 'N/A'}
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">
          GST Number
        </p>
        <p className="text-lg font-bold text-slate-800">
          {companyData?.gstNumber || 'N/A'}
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">
          IEC Number
        </p>
        <p className="text-lg font-bold text-slate-800">
          {companyData?.iecNumber || 'N/A'}
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">
          Bank Name
        </p>
        <p className="text-lg font-bold text-slate-800">
          {companyData?.bankName || 'N/A'}
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">
          Account Number
        </p>
        <p className="text-lg font-bold text-slate-800">
          {companyData?.accountNumber || 'N/A'}
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">
          IFSC Code
        </p>
        <p className="text-lg font-bold text-slate-800">
          {companyData?.ifscCode || 'N/A'}
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">
          SWIFT Code
        </p>
        <p className="text-lg font-bold text-slate-800">
          {companyData?.swiftCode || 'N/A'}
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">
          Bank Address
        </p>
        <p className="text-lg font-bold text-slate-800">
          {companyData?.bankAddress || 'N/A'}
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm md:col-span-2">
        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">
          Company Address
        </p>
        <p className="text-lg font-bold text-slate-800">
          {companyData?.address || 'N/A'}
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">
          Profile Updated
        </p>
        <p className="text-lg font-bold text-slate-800">2 hours ago</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">
          Company Verified
        </p>
        <p className="text-lg font-bold text-slate-800">1 day ago</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">
          Account Created
        </p>
        <p className="text-lg font-bold text-slate-800">3 days ago</p>
      </div>
    </div>
  );
}
