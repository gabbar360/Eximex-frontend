import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { createCompany } from '../features/companySlice';
import { getCurrentUser } from '../features/authSlice';
import { setUser } from '../features/userSlice';
import {
  FaCheck,
  FaChevronLeft,
  FaBuilding,
  FaUniversity,
  FaPlus,
  FaTrash,
} from 'react-icons/fa';
import { HiOfficeBuilding } from 'react-icons/hi';
import axiosInstance from '../utils/axiosInstance';

interface BankDetail {
  bank_name: string;
  bank_address: string;
  account_number: string;
  ifsc_code: string;
  swift_code: string;
}

interface CompanyFormData {
  name: string;
  logo: File | null;
  signature: File | null;
  industry: string;
  website: string;
  address: string;
  phone_no: string;
  email: string;
  gst_number: string;
  iec_number: string;
  currencies: string[];
  default_currency: string;
  allowed_units: string[];
  plan_id: string;
  bank_details: BankDetail[];
}

interface CompanySetupFormProps {
  editingCompany?: Record<string, unknown>;
  onClose?: () => void;
  isSuperAdmin?: boolean;
}

export default function CompanySetupForm({
  editingCompany,
  onClose,
  isSuperAdmin,
}: CompanySetupFormProps) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector(
    (state: Record<string, unknown>) =>
      (state.company as Record<string, unknown>) || {}
  ) as { loading?: boolean };
  const user = useSelector(
    (state: Record<string, unknown>) =>
      (state.user as Record<string, unknown>)?.user
  ) as Record<string, unknown> | undefined;

  // Redirect if user already has a company assigned (but not for SuperAdmin)
  useEffect(() => {
    if (
      user &&
      ((user as any).company || (user as any).companyId) &&
      !isSuperAdmin
    ) {
      navigate('/dashboard');
      return;
    }
  }, [user, navigate, isSuperAdmin]);

  const [form, setForm] = useState<CompanyFormData>({
    name: '',
    logo: null,
    signature: null,
    industry: '',
    website: '',
    address: '',
    phone_no: '',
    email: '',
    gst_number: '',
    iec_number: '',
    currencies: [],
    default_currency: '',
    allowed_units: [],
    plan_id: 'trial',
    bank_details: [
      {
        bank_name: '',
        bank_address: '',
        account_number: '',
        ifsc_code: '',
        swift_code: '',
      },
    ],
  });

  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  // Populate form with editing company data
  useEffect(() => {
    if (editingCompany) {
      // Handle bank details from new bankDetails array or legacy fields
      let bankDetails = [];
      if (
        editingCompany.bankDetails &&
        Array.isArray(editingCompany.bankDetails) &&
        editingCompany.bankDetails.length > 0
      ) {
        // Use new bankDetails array
        bankDetails = (editingCompany.bankDetails as any[]).map(
          (bank: any) => ({
            bank_name: bank.bankName || '',
            bank_address: bank.bankAddress || '',
            account_number: bank.accountNumber || '',
            ifsc_code: bank.ifscCode || '',
            swift_code: bank.swiftCode || '',
          })
        );
      } else {
        // Fallback to legacy fields if bankDetails array is empty
        bankDetails = [
          {
            bank_name: (editingCompany.bankName as string) || '',
            bank_address: (editingCompany.bankAddress as string) || '',
            account_number: (editingCompany.accountNumber as string) || '',
            ifsc_code: (editingCompany.ifscCode as string) || '',
            swift_code: (editingCompany.swiftCode as string) || '',
          },
        ];
      }

      setForm({
        name: (editingCompany.name as string) || '',
        logo: null,
        signature: null,
        industry: '',
        website: '',
        address: (editingCompany.address as string) || '',
        phone_no: (editingCompany.phoneNo as string) || '',
        email: (editingCompany.email as string) || '',
        gst_number: (editingCompany.gstNumber as string) || '',
        iec_number: (editingCompany.iecNumber as string) || '',
        currencies: (editingCompany.currencies as string[]) || [],
        default_currency: (editingCompany.defaultCurrency as string) || 'USD',
        allowed_units: (editingCompany.allowedUnits as string[]) || [
          'sqm',
          'kg',
          'pcs',
          'box',
        ],
        plan_id: (editingCompany.planId as string) || 'trial',
        bank_details: bankDetails,
      });
    }
  }, [editingCompany]);

  // Show message if user has assigned company (but allow SuperAdmin)
  if (
    user &&
    (user as any).companyId &&
    (user as any).role?.name !== 'SUPER_ADMIN' &&
    !isSuperAdmin
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4 text-center">
          <div className="mb-4">
            <HiOfficeBuilding className="w-16 h-16 text-green-500 mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Company Already Assigned
          </h2>
          <p className="text-gray-600 mb-6">
            Your administrator has already assigned you to a company. You can
            now access the dashboard.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type, files } = e.target as HTMLInputElement;

    if (type === 'file' && files) {
      setForm((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));

      if (name === 'default_currency') {
        setForm((prev) => ({
          ...prev,
          currencies: [value],
          allowed_units: ['sqm', 'kg', 'pcs', 'box'],
        }));
      }
    }
  };

  const handleBankChange = (
    index: number,
    field: keyof BankDetail,
    value: string
  ) => {
    setForm((prev) => ({
      ...prev,
      bank_details: prev.bank_details.map((bank, i) =>
        i === index ? { ...bank, [field]: value } : bank
      ),
    }));
  };

  const addBankDetail = () => {
    setForm((prev) => ({
      ...prev,
      bank_details: [
        ...prev.bank_details,
        {
          bank_name: '',
          bank_address: '',
          account_number: '',
          ifsc_code: '',
          swift_code: '',
        },
      ],
    }));
  };

  const removeBankDetail = (index: number) => {
    if (form.bank_details.length > 1) {
      setForm((prev) => ({
        ...prev,
        bank_details: prev.bank_details.filter((_, i) => i !== index),
      }));
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setFieldErrors({});

    // Client-side validation
    const errors: { [key: string]: string } = {};

    if (!form.name.trim()) errors.name = 'Company name is required';
    if (!form.email.trim()) errors.email = 'Email is required';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = 'Please enter a valid email address';
    }
    if (!form.address.trim()) errors.address = 'Company address is required';
    if (!form.gst_number.trim()) errors.gst_number = 'GST number is required';
    if (!form.iec_number.trim()) errors.iec_number = 'IEC number is required';
    if (!form.default_currency)
      errors.default_currency = 'Please select a currency';

    // Validate bank details
    form.bank_details.forEach((bank, index) => {
      if (!bank.bank_name.trim())
        errors[`bank_name_${index}`] = 'Bank name is required';
      if (!bank.account_number.trim())
        errors[`account_number_${index}`] = 'Account number is required';
      if (!bank.bank_address.trim())
        errors[`bank_address_${index}`] = 'Bank address is required';
      if (!bank.ifsc_code.trim())
        errors[`ifsc_code_${index}`] = 'IFSC code is required';
    });

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      toast.error('Please fill in all required fields correctly');
      return;
    }

    try {
      if (isSuperAdmin) {
        // SuperAdmin API call - use FormData for file uploads
        const formData = new FormData();

        // Add text fields
        formData.append('name', form.name);
        formData.append('email', form.email);
        formData.append('address', form.address);
        formData.append('phoneNo', form.phone_no);
        formData.append('gstNumber', form.gst_number);
        formData.append('iecNumber', form.iec_number);
        formData.append('defaultCurrency', form.default_currency);
        formData.append('bankDetails', JSON.stringify(form.bank_details));

        // Add files if selected
        if (form.logo) {
          formData.append('logo', form.logo);
        }
        if (form.signature) {
          formData.append('signature', form.signature);
        }

        if (editingCompany) {
          await axiosInstance.put(
            `/super-admin/companies/${editingCompany.id}`,
            formData,
            {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            }
          );
          toast.success('Company updated successfully!');
        } else {
          await axiosInstance.post('/super-admin/create-company', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
          toast.success('Company created successfully!');
        }

        if (onClose) {
          onClose();
        } else {
          navigate('/super-admin/companies');
        }
      } else {
        // Regular user company creation
        const formData = new FormData();
        const excludedFields = ['industry', 'website'];

        (Object.entries(form) as [string, any][]).forEach(([key, value]) => {
          if (excludedFields.includes(key)) return;

          if (key === 'logo' && value) {
            formData.append(key, value);
          } else if (key === 'bank_details') {
            formData.append(key, JSON.stringify(value));
          } else if (Array.isArray(value)) {
            formData.append(key, JSON.stringify(value));
          } else if (value) {
            formData.append(key, value.toString());
          }
        });

        await dispatch(createCompany(formData)).unwrap();

        // Refresh user data to include the new company
        try {
          const userResponse = await dispatch(getCurrentUser()).unwrap();
          if (userResponse?.data) {
            dispatch(setUser(userResponse.data));
          }
        } catch (userError) {
          console.warn('Failed to refresh user data:', userError);
        }

        toast.success('Company created successfully!');
        navigate('/dashboard');
      }
    } catch (error: unknown) {
      console.error('API Error:', error);

      if (error && typeof error === 'object' && 'response' in error) {
        const apiError = error as Record<string, unknown>;
        const response = apiError.response as Record<string, unknown>;
        const data = response?.data as Record<string, unknown>;

        if (data?.errors) {
          setFieldErrors(data.errors as { [key: string]: string });
          toast.error('Please check the highlighted fields');
        } else {
          const errorMessage =
            (data?.message as string) ||
            (apiError?.message as string) ||
            'Failed to create company. Please try again.';
          toast.error(errorMessage);
        }
      } else {
        toast.error('Failed to create company. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-2 lg:p-4">
        {/* Header */}
        <div className="mb-3">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-3 lg:p-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-center gap-4">
                {onClose && (
                  <button
                    onClick={onClose}
                    className="p-3 rounded-lg bg-slate-700 text-white hover:bg-slate-800 transition-all duration-300 hover:shadow-lg"
                  >
                    <FaChevronLeft className="w-5 h-5" />
                  </button>
                )}
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 mb-1">
                    {editingCompany ? 'Edit Company' : 'Create New Company'}
                  </h1>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 lg:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Company Information */}
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <FaBuilding className="text-slate-600" />
                Company Information
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Company Name *
                  </label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Enter company name"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent ${
                      fieldErrors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                  />
                  {fieldErrors.name && (
                    <p className="text-red-500 text-sm mt-1">
                      {fieldErrors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="company@example.com"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent ${
                      fieldErrors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                  />
                  {fieldErrors.email && (
                    <p className="text-red-500 text-sm mt-1">
                      {fieldErrors.email}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Company Logo
                  </label>
                  {editingCompany?.logo &&
                  typeof editingCompany.logo === 'string' ? (
                    <div className="mb-3">
                      <img
                        src={
                          (editingCompany.logo as string).startsWith('http')
                            ? (editingCompany.logo as string)
                            : `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${editingCompany.logo}`
                        }
                        alt="Current Logo"
                        className="h-20 w-auto border rounded-lg"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display =
                            'none';
                        }}
                      />
                      <p className="text-xs text-gray-500 mt-1">Current logo</p>
                    </div>
                  ) : null}
                  <input
                    type="file"
                    name="logo"
                    onChange={handleChange}
                    accept="image/*"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {editingCompany?.logo &&
                    typeof editingCompany.logo === 'string'
                      ? 'Upload new logo to replace current one'
                      : 'Upload company logo (PNG, JPG)'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Company Signature
                  </label>
                  {editingCompany?.signature &&
                  typeof editingCompany.signature === 'string' ? (
                    <div className="mb-3">
                      <img
                        src={
                          (editingCompany.signature as string).startsWith(
                            'http'
                          )
                            ? (editingCompany.signature as string)
                            : `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${editingCompany.signature}`
                        }
                        alt="Current Signature"
                        className="h-16 w-auto border rounded-lg"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display =
                            'none';
                        }}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Current signature
                      </p>
                    </div>
                  ) : null}
                  <input
                    type="file"
                    name="signature"
                    onChange={handleChange}
                    accept="image/*"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {editingCompany?.signature &&
                    typeof editingCompany.signature === 'string'
                      ? 'Upload new signature to replace current one'
                      : 'Upload authorized signature (PNG, JPG)'}
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Company Address *
                </label>
                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Enter complete company address"
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    name="phone_no"
                    value={form.phone_no}
                    onChange={handleChange}
                    placeholder="+1 (555) 123-4567"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    GST Number *
                  </label>
                  <input
                    name="gst_number"
                    value={form.gst_number}
                    onChange={handleChange}
                    placeholder="22AAAAA0000A1Z5"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    IEC Number *
                  </label>
                  <input
                    name="iec_number"
                    value={form.iec_number}
                    onChange={handleChange}
                    placeholder="0123456789"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Default Currency *
                </label>
                <select
                  name="default_currency"
                  value={form.default_currency}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Currency</option>
                  <option value="INR">INR - Indian Rupee</option>
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                </select>
              </div>
            </div>

            {/* Banking Information */}
            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                  <FaUniversity className="text-slate-600" />
                  Banking Information
                </h3>
                <button
                  type="button"
                  onClick={addBankDetail}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
                >
                  <FaPlus className="w-4 h-4" />
                  Add Bank
                </button>
              </div>

              {form.bank_details.map((bank, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-6 mb-4"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-md font-medium text-slate-700">
                      Bank Details {index + 1}
                    </h4>
                    {form.bank_details.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeBankDetail(index)}
                        className="flex items-center gap-2 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                      >
                        <FaTrash className="w-3 h-3" />
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Bank Name *
                      </label>
                      <input
                        value={bank.bank_name}
                        onChange={(e) =>
                          handleBankChange(index, 'bank_name', e.target.value)
                        }
                        placeholder="Enter bank name"
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent ${
                          fieldErrors[`bank_name_${index}`]
                            ? 'border-red-500'
                            : 'border-gray-300'
                        }`}
                        required
                      />
                      {fieldErrors[`bank_name_${index}`] && (
                        <p className="text-red-500 text-sm mt-1">
                          {fieldErrors[`bank_name_${index}`]}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Account Number *
                      </label>
                      <input
                        value={bank.account_number}
                        onChange={(e) =>
                          handleBankChange(
                            index,
                            'account_number',
                            e.target.value
                          )
                        }
                        placeholder="Enter account number"
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent ${
                          fieldErrors[`account_number_${index}`]
                            ? 'border-red-500'
                            : 'border-gray-300'
                        }`}
                        required
                      />
                      {fieldErrors[`account_number_${index}`] && (
                        <p className="text-red-500 text-sm mt-1">
                          {fieldErrors[`account_number_${index}`]}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-6">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Bank Address *
                    </label>
                    <textarea
                      value={bank.bank_address}
                      onChange={(e) =>
                        handleBankChange(index, 'bank_address', e.target.value)
                      }
                      placeholder="Enter bank address"
                      rows={2}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent ${
                        fieldErrors[`bank_address_${index}`]
                          ? 'border-red-500'
                          : 'border-gray-300'
                      }`}
                      required
                    />
                    {fieldErrors[`bank_address_${index}`] && (
                      <p className="text-red-500 text-sm mt-1">
                        {fieldErrors[`bank_address_${index}`]}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        IFSC Code *
                      </label>
                      <input
                        value={bank.ifsc_code}
                        onChange={(e) =>
                          handleBankChange(index, 'ifsc_code', e.target.value)
                        }
                        placeholder="SBIN0001234"
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent ${
                          fieldErrors[`ifsc_code_${index}`]
                            ? 'border-red-500'
                            : 'border-gray-300'
                        }`}
                        required
                      />
                      {fieldErrors[`ifsc_code_${index}`] && (
                        <p className="text-red-500 text-sm mt-1">
                          {fieldErrors[`ifsc_code_${index}`]}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        SWIFT Code
                      </label>
                      <input
                        value={bank.swift_code}
                        onChange={(e) =>
                          handleBankChange(index, 'swift_code', e.target.value)
                        }
                        placeholder="SBININBB123"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Submit Buttons */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose || (() => navigate('/dashboard'))}
                className="px-6 py-3 rounded-lg border border-gray-300 text-slate-600 hover:bg-gray-50 transition-all duration-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 rounded-lg font-semibold text-white bg-slate-700 hover:bg-slate-800 transition-all duration-300 hover:shadow-xl disabled:opacity-50 shadow-lg"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {editingCompany ? 'Updating...' : 'Creating...'}
                  </div>
                ) : (
                  <>
                    <FaCheck className="w-5 h-5 mr-2 inline" />
                    {editingCompany ? 'Update Company' : 'Create Company'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
