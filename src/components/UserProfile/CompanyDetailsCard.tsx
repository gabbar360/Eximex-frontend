import { useState, useEffect } from 'react';
import { useModal } from '../../hooks/useModal';
import { Modal } from '../ui/modal';
import Button from '../ui/button/Button';
import Input from '../form/input/InputField';
import Label from '../form/Label';
import { toast } from 'react-toastify';
import { Image } from 'antd';
import { EyeOutlined } from '@ant-design/icons';

interface CompanyData {
  id: number;
  name: string;
  logo?: string;
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
}

export default function CompanyDetailsCard({
  companyData,
  onUpdate,
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
      closeModal();
    } catch (error: any) {
      toast.error(error?.message || 'Error updating company');
      console.error('Error saving changes:', error);
    }
  };

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-shrink-0">
              <Image
                src={`${import.meta.env.VITE_API_BASE_URL?.replace('/api/v1', '') || 'http://localhost:8000'}${companyData?.logo || '/uploads/logos/logo-1758172153913-500170623.webp'}`}
                alt="Company Logo"
                width={96}
                height={96}
                className="rounded-lg object-cover border border-gray-200 dark:border-gray-700"
                preview={{
                  mask: (
                    <EyeOutlined style={{ fontSize: '20px', color: 'white' }} />
                  ),
                }}
              />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                Company Details
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {companyData?.name || 'Company Name'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Company Name
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {companyData?.name || 'N/A'}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Email
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {companyData?.email || 'N/A'}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Phone Number
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {companyData?.phoneNo || 'N/A'}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Default Currency
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {companyData?.defaultCurrency || 'N/A'}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                GST Number
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {companyData?.gstNumber || 'N/A'}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                IEC Number
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {companyData?.iecNumber || 'N/A'}
              </p>
            </div>

            <div className="lg:col-span-2">
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Address
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {companyData?.address || 'N/A'}
              </p>
            </div>

            <div className="lg:col-span-2 border-t pt-4 mt-4">
              <h5 className="text-md font-semibold text-gray-700 dark:text-white/80 mb-4">
                Banking Information
              </h5>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7">
                <div>
                  <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                    Bank Name
                  </p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {companyData?.bankName || 'N/A'}
                  </p>
                </div>

                <div>
                  <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                    Account Number
                  </p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {companyData?.accountNumber || 'N/A'}
                  </p>
                </div>

                <div>
                  <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                    IFSC Code
                  </p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {companyData?.ifscCode || 'N/A'}
                  </p>
                </div>

                <div>
                  <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                    SWIFT Code
                  </p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {companyData?.swiftCode || 'N/A'}
                  </p>
                </div>

                <div className="lg:col-span-2">
                  <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                    Bank Address
                  </p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {companyData?.bankAddress || 'N/A'}
                  </p>
                </div>
              </div>
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
                Edit Company Details
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Update your company information and banking details
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
              {/* Company Information Section */}
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
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Company Information
                    </h4>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="lg:col-span-2">
                    <Label htmlFor="logo">Company Logo</Label>
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        {logoPreview ? (
                          <img
                            src={
                              logoPreview.startsWith('http')
                                ? logoPreview
                                : `${import.meta.env.VITE_API_BASE_URL?.replace('/api/v1', '') || 'http://localhost:8000'}${logoPreview}`
                            }
                            alt="Logo Preview"
                            className="w-16 h-16 rounded-lg object-cover border border-gray-200 dark:border-gray-700"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center border border-gray-200 dark:border-gray-700">
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
                          className="h-11 w-full rounded-lg border bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:text-white/90 dark:focus:border-brand-800 px-4 py-2.5 text-sm shadow-theme-xs focus:outline-hidden focus:ring-3 dark:bg-gray-900"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Upload a new logo (max 1MB)
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-2">
                    <Label htmlFor="name">Company Name *</Label>
                    <Input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="Enter company name"
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
                    />
                  </div>

                  <div>
                    <Label htmlFor="defaultCurrency">Default Currency</Label>
                    <select
                      id="defaultCurrency"
                      value={formData.defaultCurrency}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          defaultCurrency: e.target.value,
                        })
                      }
                      className="h-11 w-full rounded-lg border bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:text-white/90 dark:focus:border-brand-800 px-4 py-2.5 text-sm shadow-theme-xs focus:outline-hidden focus:ring-3 dark:bg-gray-900"
                    >
                      <option value="">Select Currency</option>
                      <option value="INR">INR - Indian Rupee</option>
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                    </select>
                  </div>

                  <div className="lg:col-span-2">
                    <Label htmlFor="address">Company Address</Label>
                    <textarea
                      id="address"
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      placeholder="Enter complete company address"
                      className="h-24 w-full rounded-lg border bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:text-white/90 dark:focus:border-brand-800 px-4 py-2.5 text-sm shadow-theme-xs focus:outline-hidden focus:ring-3 dark:bg-gray-900 resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Banking Information Section */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
                <div className="flex items-center mb-6">
                  {/* <div className="flex items-center justify-center w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg mr-3">
                    <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div> */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Banking Information
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Bank account details for transactions
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="lg:col-span-2">
                    <Label htmlFor="bankName">Bank Name</Label>
                    <Input
                      id="bankName"
                      type="text"
                      value={formData.bankName}
                      onChange={(e) =>
                        setFormData({ ...formData, bankName: e.target.value })
                      }
                      placeholder="State Bank of India"
                    />
                  </div>

                  <div className="lg:col-span-2">
                    <Label htmlFor="bankAddress">Bank Address</Label>
                    <textarea
                      id="bankAddress"
                      value={formData.bankAddress}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          bankAddress: e.target.value,
                        })
                      }
                      placeholder="Enter bank branch address"
                      className="h-20 w-full rounded-lg border bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:text-white/90 dark:focus:border-brand-800 px-4 py-2.5 text-sm shadow-theme-xs focus:outline-hidden focus:ring-3 dark:bg-gray-900 resize-none"
                    />
                  </div>

                  <div className="lg:col-span-2">
                    <Label htmlFor="accountNumber">Account Number</Label>
                    <Input
                      id="accountNumber"
                      type="text"
                      value={formData.accountNumber}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          accountNumber: e.target.value,
                        })
                      }
                      placeholder="1234567890123456"
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
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 rounded-b-3xl">
              <div className="flex items-center justify-end">
                {/* <div className="text-xs text-gray-500 dark:text-gray-400">
                  All changes will be saved automatically
                </div> */}
                <div className="flex items-center space-x-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={closeModal}
                    type="button"
                    className=" hover:bg-red-500  hover:text-white transition-colors duration-300 ease-in-out"
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
