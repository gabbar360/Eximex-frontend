import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { createCompany } from '../features/companySlice';

interface OnboardingModalProps {
  onClose?: () => void;
  onSuccess?: () => void;
}

interface CompanyFormData {
  name: string;
  logo: File | null;
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

const OnboardingModal: React.FC<OnboardingModalProps> = ({
  onClose,
  onSuccess,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector(
    (state: any) => state.company || {}
  );

  const [form, setForm] = useState<CompanyFormData>({
    name: '',
    logo: null,
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
  useEffect(() => {
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type, files, multiple, selectedOptions } =
      e.target as HTMLInputElement & HTMLSelectElement;

    if (type === 'file' && files) {
      setForm((prev) => ({ ...prev, [name]: files[0] }));
    } else if (multiple && selectedOptions) {
      const values = Array.from(selectedOptions).map((option) => option.value);
      setForm((prev) => ({ ...prev, [name]: values }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));

      // Set default currencies and units based on currency selection
      if (name === 'default_currency') {
        setForm((prev) => ({
          ...prev,
          currencies: [value],
          allowed_units: ['sqm', 'kg', 'pcs', 'box'],
        }));
      }
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('address', form.address);
      formData.append('phone_no', form.phone_no);
      formData.append('email', form.email);
      formData.append('gst_number', form.gst_number);
      formData.append('iec_number', form.iec_number);
      formData.append('currencies', JSON.stringify(form.currencies));
      formData.append('default_currency', form.default_currency);
      formData.append('allowed_units', JSON.stringify(form.allowed_units));
      formData.append('plan_id', form.plan_id);
      formData.append('bank_name', form.bank_name);
      formData.append('bank_address', form.bank_address);
      formData.append('account_number', form.account_number);
      formData.append('ifsc_code', form.ifsc_code);
      formData.append('swift_code', form.swift_code);

      if (form.logo) {
        formData.append('logo', form.logo);
      }

      const resultAction = await dispatch(createCompany(formData)).unwrap();
      console.log('API Response:', resultAction);

      toast.success(resultAction.message || 'Company created successfully!');

      // Force immediate navigation
      window.location.replace('/cprospect');
    } catch (error: any) {
      console.error('Error submitting form:', error);

      // Handle different error formats from backend
      let errorMessage = 'Error submitting form';

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    }
  };

  return (
    <>
      <style>{`
        body { overflow: hidden !important; }
        .sidebar, [class*="sidebar"], nav, header, [class*="header"] { display: none !important; }
        .main-content, [class*="main"] { margin-left: 0 !important; width: 100% !important; }
      `}</style>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-2 sm:p-4">
        <div className="bg-white p-4 sm:p-5 lg:p-6 rounded-xl shadow-2xl w-full max-w-sm sm:max-w-md lg:max-w-lg max-h-[95vh] overflow-y-auto relative">
          <h2 className="text-base sm:text-lg lg:text-xl font-bold mb-2 text-center pr-6">
            Setup Your Company
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4 text-center">
            Please provide your company details to get started.
          </p>
          <form
            onSubmit={handleSubmit}
            className="space-y-2 sm:space-y-3 lg:space-y-4"
          >
            <input
              name="name"
              placeholder="Company Name"
              className="border border-gray-300 p-2 lg:p-3 w-full rounded text-sm lg:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={handleChange}
              required
            />

            <div className="flex flex-col lg:flex-row gap-2 lg:gap-3">
              <input
                name="phone_no"
                placeholder="Phone Number"
                className="border border-gray-300 p-2 lg:p-3 w-full rounded text-sm lg:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={handleChange}
              />
              <input
                name="email"
                type="email"
                placeholder="Email Address"
                className="border border-gray-300 p-2 lg:p-3 w-full rounded text-sm lg:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={handleChange}
              />
            </div>

            <div className="flex flex-col lg:flex-row gap-2 lg:gap-3">
              <input
                type="file"
                name="logo"
                className="border border-gray-300 p-2 lg:p-3 w-full rounded text-sm lg:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={handleChange}
              />
              <select
                name="default_currency"
                className="border border-gray-300 p-2 lg:p-3 w-full rounded text-sm lg:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={handleChange}
                required
              >
                <option value="">Select Default Currency</option>
                <option value="INR">INR</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>

            <div className="flex flex-col lg:flex-row gap-2 lg:gap-3">
              <input
                name="gst_number"
                placeholder="GST Number"
                className="border border-gray-300 p-2 lg:p-3 w-full rounded text-sm lg:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={handleChange}
                required
              />
              <input
                name="iec_number"
                placeholder="IEC Number"
                className="border border-gray-300 p-2 lg:p-3 w-full rounded text-sm lg:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={handleChange}
                required
              />
            </div>

            <textarea
              name="address"
              placeholder="Company Address"
              className="border border-gray-300 p-2 lg:p-3 w-full rounded text-sm lg:text-base min-h-[60px] sm:min-h-[80px] resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={handleChange}
              required
            ></textarea>

            <div className="border-t pt-3 mt-3">
              <h3 className="text-sm font-semibold mb-3 text-gray-700">
                Banking Details
              </h3>

              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Bank Name
                </label>
                <input
                  name="bank_name"
                  placeholder="Enter bank name"
                  className="border border-gray-300 p-2 lg:p-3 w-full rounded text-sm lg:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onChange={handleChange}
                />
              </div>

              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Bank Address
                </label>
                <textarea
                  name="bank_address"
                  placeholder="Enter bank address"
                  className="border border-gray-300 p-2 lg:p-3 w-full rounded text-sm lg:text-base min-h-[60px] resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onChange={handleChange}
                ></textarea>
              </div>

              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Account Number
                </label>
                <input
                  name="account_number"
                  placeholder="Enter account number"
                  className="border border-gray-300 p-2 lg:p-3 w-full rounded text-sm lg:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onChange={handleChange}
                />
              </div>

              <div className="flex flex-col lg:flex-row gap-2 lg:gap-3">
                <div className="w-full">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    IFSC Code
                  </label>
                  <input
                    name="ifsc_code"
                    placeholder="Enter IFSC code"
                    className="border border-gray-300 p-2 lg:p-3 w-full rounded text-sm lg:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onChange={handleChange}
                  />
                </div>
                <div className="w-full">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    SWIFT Code
                  </label>
                  <input
                    name="swift_code"
                    placeholder="Enter SWIFT code"
                    className="border border-gray-300 p-2 lg:p-3 w-full rounded text-sm lg:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-xs sm:text-sm">
                {typeof error === 'string' ? error : 'Failed to submit.'}
              </div>
            )}

            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 lg:py-3 rounded w-full mt-3 lg:mt-4 text-sm lg:text-base font-medium transition-colors disabled:opacity-50"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Continue'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default OnboardingModal;
