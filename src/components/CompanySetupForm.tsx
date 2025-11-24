import React, { useState, ChangeEvent, FormEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Spin } from 'antd';
import { createCompany } from '../features/companySlice';
import { getCurrentUser } from '../features/authSlice';
import { setUser } from '../features/userSlice';
import {
  FaCheck,
  FaChevronRight,
  FaChevronLeft,
  FaBuilding,
  FaAddressCard,
  FaUniversity,
} from 'react-icons/fa';

interface CompanyFormData {
  name: string;
  logo: File | null;
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
  bank_name: string;
  bank_address: string;
  account_number: string;
  ifsc_code: string;
  swift_code: string;
}

const steps = [
  {
    id: 1,
    title: 'Company & Contact Info',
    description: 'Basic details & contact',
    icon: FaBuilding,
  },
  {
    id: 2,
    title: 'Banking Info',
    description: 'Financial setup',
    icon: FaUniversity,
  },
];

export default function CompanySetupForm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state: any) => state.company || {});

  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState<CompanyFormData>({
    name: '',
    logo: null,
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
    bank_name: '',
    bank_address: '',
    account_number: '',
    ifsc_code: '',
    swift_code: '',
  });

  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

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

  const nextStep = () => {
    if (currentStep < 2) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (currentStep < 2) {
      nextStep();
      return;
    }

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
    if (!form.bank_name.trim()) errors.bank_name = 'Bank name is required';
    if (!form.account_number.trim())
      errors.account_number = 'Account number is required';
    if (!form.bank_address.trim())
      errors.bank_address = 'Bank address is required';
    if (!form.ifsc_code.trim()) errors.ifsc_code = 'IFSC code is required';

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      toast.error('Please fill in all required fields correctly');
      return;
    }

    try {
      const formData = new FormData();
      const excludedFields = ['industry', 'website'];

      Object.entries(form).forEach(([key, value]) => {
        if (excludedFields.includes(key)) return;

        if (key === 'logo' && value) {
          formData.append(key, value);
        } else if (Array.isArray(value)) {
          formData.append(key, JSON.stringify(value));
        } else if (value) {
          formData.append(key, value.toString());
        }
      });

      const resultAction = await dispatch(createCompany(formData)).unwrap();

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
    } catch (error: any) {
      console.error('API Error:', error);

      if (error?.response?.data?.errors) {
        setFieldErrors(error.response.data.errors);
        toast.error('Please check the highlighted fields');
      } else {
        const errorMessage =
          error?.response?.data?.message ||
          error?.message ||
          'Failed to create company. Please try again.';
        toast.error(errorMessage);
      }
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="h-full flex flex-col space-y-2 lg:space-y-3">
            {/* Company Info Section */}
            <div className="bg-gray-50 p-2 lg:p-3 rounded-lg">
              {/* <h3 className="text-xs lg:text-sm font-semibold text-gray-700 mb-2">Company Information</h3> */}
              <div className="space-y-2">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                  <div className="group">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Company Name *
                    </label>
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Enter your company name"
                      className={`w-full px-2 py-1.5 lg:px-3 lg:py-2 border-2 rounded-lg transition-all duration-200 text-xs lg:text-sm focus:outline-none ${
                        fieldErrors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required
                    />
                    {fieldErrors.name && (
                      <p className="text-red-500 text-xs mt-1">
                        {fieldErrors.name}
                      </p>
                    )}
                  </div>

                  <div className="group">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Company Logo
                    </label>
                    <input
                      type="file"
                      name="logo"
                      onChange={handleChange}
                      accept="image/*"
                      className="w-full px-2 py-1.5 lg:px-3 lg:py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 text-xs lg:text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Details Section */}
            <div className="bg-gray-50 p-2 lg:p-3 rounded-lg flex-1">
              <h3 className="text-xs lg:text-sm font-semibold text-gray-700 mb-2">
                Contact Information
              </h3>
              <div className="space-y-2">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                  <div className="group">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="company@example.com"
                      className={`w-full px-2 py-1.5 lg:px-3 lg:py-2 border-2 rounded-lg transition-all duration-200 text-xs lg:text-sm focus:outline-none ${
                        fieldErrors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required
                    />
                    {fieldErrors.email && (
                      <p className="text-red-500 text-xs mt-1">
                        {fieldErrors.email}
                      </p>
                    )}
                  </div>

                  <div className="group">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      name="phone_no"
                      value={form.phone_no}
                      onChange={handleChange}
                      placeholder="+1 (555) 123-4567"
                      className="w-full px-2 py-1.5 lg:px-3 lg:py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 text-xs lg:text-sm"
                    />
                  </div>
                </div>

                <div className="group">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Company Address *
                  </label>
                  <textarea
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    placeholder="Enter your complete company address"
                    rows={2}
                    className="w-full px-2 py-1.5 lg:px-3 lg:py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 resize-none text-xs lg:text-sm"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  <div className="group">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      GST Number *
                    </label>
                    <input
                      name="gst_number"
                      value={form.gst_number}
                      onChange={handleChange}
                      placeholder="22AAAAA0000A1Z5"
                      className="w-full px-2 py-1.5 lg:px-3 lg:py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 text-xs lg:text-sm"
                      required
                    />
                  </div>

                  <div className="group">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      IEC Number *
                    </label>
                    <input
                      name="iec_number"
                      value={form.iec_number}
                      onChange={handleChange}
                      placeholder="0123456789"
                      className="w-full px-2 py-1.5 lg:px-3 lg:py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 text-xs lg:text-sm"
                      required
                    />
                  </div>

                  <div className="group">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Default Currency *
                    </label>
                    <select
                      name="default_currency"
                      value={form.default_currency}
                      onChange={handleChange}
                      className="w-full px-2 py-1.5 lg:px-3 lg:py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 text-xs lg:text-sm"
                      required
                    >
                      <option value="">Select Currency</option>
                      <option value="INR">INR - Indian Rupee</option>
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="h-full flex flex-col">
            {/* Banking Details Section */}
            <div className="bg-gray-50 p-2 lg:p-3 rounded-lg flex-1">
              {/* <h3 className="text-xs lg:text-sm font-semibold text-gray-700 mb-2">Banking Information</h3> */}
              <div className="space-y-2">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                  <div className="group">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Bank Name *
                    </label>
                    <input
                      name="bank_name"
                      value={form.bank_name}
                      onChange={handleChange}
                      placeholder="Enter bank name"
                      className={`w-full px-2 py-1.5 lg:px-3 lg:py-2 border-2 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 text-xs lg:text-sm ${
                        fieldErrors.bank_name
                          ? 'border-red-500'
                          : 'border-gray-200'
                      }`}
                      required
                    />
                    {fieldErrors.bank_name && (
                      <p className="text-red-500 text-xs mt-1">
                        {fieldErrors.bank_name}
                      </p>
                    )}
                  </div>

                  <div className="group">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Account Number *
                    </label>
                    <input
                      name="account_number"
                      value={form.account_number}
                      onChange={handleChange}
                      placeholder="Enter account number"
                      className={`w-full px-2 py-1.5 lg:px-3 lg:py-2 border-2 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 text-xs lg:text-sm ${
                        fieldErrors.account_number
                          ? 'border-red-500'
                          : 'border-gray-200'
                      }`}
                      required
                    />
                    {fieldErrors.account_number && (
                      <p className="text-red-500 text-xs mt-1">
                        {fieldErrors.account_number}
                      </p>
                    )}
                  </div>
                </div>

                <div className="group">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Bank Address *
                  </label>
                  <textarea
                    name="bank_address"
                    value={form.bank_address}
                    onChange={handleChange}
                    placeholder="Enter bank address"
                    rows={2}
                    className={`w-full px-2 py-1.5 lg:px-3 lg:py-2 border-2 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 resize-none text-xs lg:text-sm ${
                      fieldErrors.bank_address
                        ? 'border-red-500'
                        : 'border-gray-200'
                    }`}
                    required
                  />
                  {fieldErrors.bank_address && (
                    <p className="text-red-500 text-xs mt-1">
                      {fieldErrors.bank_address}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                  <div className="group">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      IFSC Code *
                    </label>
                    <input
                      name="ifsc_code"
                      value={form.ifsc_code}
                      onChange={handleChange}
                      placeholder="SBIN0001234"
                      className={`w-full px-2 py-1.5 lg:px-3 lg:py-2 border-2 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 text-xs lg:text-sm ${
                        fieldErrors.ifsc_code
                          ? 'border-red-500'
                          : 'border-gray-200'
                      }`}
                      required
                    />
                    {fieldErrors.ifsc_code && (
                      <p className="text-red-500 text-xs mt-1">
                        {fieldErrors.ifsc_code}
                      </p>
                    )}
                  </div>

                  <div className="group">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      SWIFT Code
                    </label>
                    <input
                      name="swift_code"
                      value={form.swift_code}
                      onChange={handleChange}
                      placeholder="SBININBB123"
                      className="w-full px-2 py-1.5 lg:px-3 lg:py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 text-xs lg:text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-white/95 backdrop-blur-xl rounded-xl lg:rounded-2xl shadow-2xl border border-white/20 overflow-hidden h-full flex flex-col">
      {/* Progress Header - Compact */}
      <div
        className="bg-white px-3 py-2 lg:p-4 border-b-2 flex-shrink-0"
        style={{ borderColor: '#86a0b2' }}
      >
        <div className="flex items-center justify-center mb-2">
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            return (
              <div key={step.id} className="flex items-center">
                <div
                  className={`relative flex items-center justify-center w-6 h-6 lg:w-8 lg:h-8 rounded-lg transition-all duration-300 ${
                    currentStep >= step.id
                      ? 'shadow-lg scale-110'
                      : 'bg-gray-100'
                  }`}
                  style={{
                    backgroundColor:
                      currentStep >= step.id ? '#86a0b2' : undefined,
                    color: currentStep >= step.id ? 'white' : '#4a5568',
                  }}
                >
                  {currentStep > step.id ? (
                    <FaCheck
                      className="w-3 h-3 lg:w-4 lg:h-4"
                      style={{ color: '#4a5568' }}
                    />
                  ) : (
                    <IconComponent
                      className="w-3 h-3 lg:w-4 lg:h-4"
                      style={{ color: '#4a5568' }}
                    />
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-6 lg:w-8 h-0.5 mx-1 lg:mx-2 rounded-full transition-all duration-500`}
                    style={{
                      backgroundColor:
                        currentStep > step.id ? '#86a0b2' : '#e5e7eb',
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>

        <div className="text-center">
          <h2
            className="text-sm lg:text-lg font-bold mb-1"
            style={{ color: '#86a0b2' }}
          >
            {steps[currentStep - 1].title}
          </h2>
          <p className="text-gray-600 text-xs lg:text-sm hidden sm:block">
            Step {currentStep} of {steps.length} •{' '}
            {steps[currentStep - 1].description}
          </p>
        </div>
      </div>

      {/* Form Content - Flexible height */}
      <div className="flex-1 overflow-y-auto px-2 py-1 sm:p-3 lg:p-4 min-h-0">
        <div className="h-full">{renderStep()}</div>
      </div>

      {/* Navigation Buttons - Compact */}
      <div className="flex-shrink-0 p-2 lg:p-4 border-t border-gray-200">
        <div className="flex justify-between gap-2">
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex items-center justify-center px-3 py-1.5 lg:px-4 lg:py-2 text-gray-900 bg-gray-300 rounded-lg hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-xs lg:text-sm"
          >
            <FaChevronLeft
              className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2"
              style={{ color: '#4a5568' }}
            />
            Previous
          </button>

          <button
            type="button"
            disabled={loading}
            className="flex items-center justify-center px-4 py-1.5 lg:px-6 lg:py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:shadow-lg disabled:opacity-50 transition-all duration-200 text-xs lg:text-sm"
            onClick={
              currentStep < 2
                ? nextStep
                : () => handleSubmit({ preventDefault: () => {} } as any)
            }
          >
            {loading ? (
              <>
                <Spin size="small" className="mr-1 lg:mr-2" />
                Creating...
              </>
            ) : currentStep < 2 ? (
              <>
                Continue
                <FaChevronRight className="w-3 h-3 lg:w-4 lg:h-4 ml-1 lg:ml-2" />
              </>
            ) : (
              'Complete Setup'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
