import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getPartyById, updateParty, createParty } from '../../features/partySlice';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { HiArrowLeft, HiCheckCircle, HiUser, HiBuildingOffice2, HiEnvelope, HiPhone, HiMapPin, HiGlobeAlt, HiTag, HiDocumentText } from 'react-icons/hi2';

const fetchCurrencies = async () => {
  try {
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    const data = await response.json();
    return Object.keys(data.rates).map((code) => ({ code, name: code }));
  } catch (error) {
    return [];
  }
};

const fetchCountries = async () => {
  try {
    const response = await fetch('https://countriesnow.space/api/v0.1/countries');
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    return [];
  }
};

const fetchStates = async (countryName) => {
  try {
    const response = await fetch('https://countriesnow.space/api/v0.1/countries/states', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ country: countryName }),
    });
    const data = await response.json();
    return data.data?.states || [];
  } catch (error) {
    return [];
  }
};

const AddEditPartyForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [party, setParty] = useState({});
  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [countries, setCountries] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [availableStates, setAvailableStates] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const [countriesData, currenciesData] = await Promise.all([fetchCountries(), fetchCurrencies()]);
      setCountries(countriesData);
      setCurrencies(currenciesData);
    };
    loadData();
  }, []);

  useEffect(() => {
    if (isEditMode) {
      const fetchParty = async () => {
        try {
          setLoading(true);
          const response = await dispatch(getPartyById(Number(id))).unwrap();
          setParty(response.data || response);
        } catch (err) {
          toast.error(err.message || 'Failed to fetch party details');
          if (err.response?.status === 401) {
            setTimeout(() => navigate('/login'), 2000);
          }
        } finally {
          setLoading(false);
        }
      };
      fetchParty();
    }
  }, [id, isEditMode, navigate, dispatch]);

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      let response;
      if (isEditMode) {
        response = await dispatch(updateParty({ id: Number(id), party: values })).unwrap();
      } else {
        response = await dispatch(createParty(values)).unwrap();
      }
      toast.success(response.message);
      setTimeout(() => navigate('/cprospect'), 1500);
    } catch (err) {
      toast.error(err.message);
      if (err.response?.status === 401) {
        setTimeout(() => navigate('/login'), 2000);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-slate-600 mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  const getInitialValues = () => ({
    companyName: party.companyName || '',
    role: party.role || party.partyType || '',
    contactPerson: party.contactPerson || '',
    email: party.email || '',
    phone: party.phone || '',
    address: party.address || '',
    city: party.city || '',
    state: party.state || '',
    country: party.country || '',
    pincode: party.pincode || '',
    currency: party.currency || '',
    tags: party.tags || '',
    notes: party.notes || '',
    status: party.status !== undefined ? Boolean(party.status) : false,
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-2 lg:p-4">
        {/* Header */}
        <div className="mb-3">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-3 lg:p-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate('/cprospect')}
                  className="p-3 rounded-lg bg-slate-700 text-white hover:bg-slate-800 transition-all duration-300 hover:shadow-lg"
                >
                  <HiArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 mb-1">
                    {isEditMode ? 'Edit Party' : 'Add New Party'}
                  </h1>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 lg:p-8">
          <Formik
            enableReinitialize={true}
            initialValues={getInitialValues()}
            validationSchema={Yup.object({
              companyName: Yup.string().required('Company name is required'),
              role: Yup.string().required('Role is required'),
              email: Yup.string().email('Invalid email').required('Email is required'),
              phone: Yup.string().required('Phone number is required'),
              address: Yup.string().required('Address is required'),
              city: Yup.string().required('City is required'),
              state: Yup.string().required('State is required'),
              country: Yup.string().required('Country is required'),
              pincode: Yup.string().required('Pincode is required'),
              currency: Yup.string().required('Currency is required'),
            })}
            onSubmit={handleSubmit}
          >
            {({ handleSubmit, handleChange, handleBlur, values, touched, errors, setFieldValue }) => (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Company Name */}
                  <div>
                    <label className="flex items-center text-sm font-semibold text-slate-700 mb-3">
                      <HiBuildingOffice2 className="w-4 h-4 mr-2 text-slate-600" />
                      Company Name
                    </label>
                    <input
                      name="companyName"
                      type="text"
                      placeholder="Enter company name"
                      value={values.companyName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className="w-full px-4 py-3 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-slate-200 focus:border-slate-500 transition-all duration-300 shadow-sm"
                    />
                    {touched.companyName && errors.companyName && (
                      <div className="text-sm text-red-500 mt-1">{errors.companyName}</div>
                    )}
                  </div>

                  {/* Contact Person */}
                  <div>
                    <label className="flex items-center text-sm font-semibold text-slate-700 mb-3">
                      <HiUser className="w-4 h-4 mr-2 text-slate-600" />
                      Contact Person
                    </label>
                    <input
                      name="contactPerson"
                      type="text"
                      placeholder="Enter contact person name"
                      value={values.contactPerson}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className="w-full px-4 py-3 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-slate-200 focus:border-slate-500 transition-all duration-300 shadow-sm"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="flex items-center text-sm font-semibold text-slate-700 mb-3">
                      <HiEnvelope className="w-4 h-4 mr-2 text-slate-600" />
                      Email
                    </label>
                    <input
                      name="email"
                      type="email"
                      placeholder="Enter email address"
                      value={values.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className="w-full px-4 py-3 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-slate-200 focus:border-slate-500 transition-all duration-300 shadow-sm"
                    />
                    {touched.email && errors.email && (
                      <div className="text-sm text-red-500 mt-1">{errors.email}</div>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="flex items-center text-sm font-semibold text-slate-700 mb-3">
                      <HiPhone className="w-4 h-4 mr-2 text-slate-600" />
                      Phone
                    </label>
                    <input
                      name="phone"
                      type="text"
                      placeholder="Enter phone number"
                      value={values.phone}
                      onChange={(e) => {
                        const phoneValue = e.target.value.replace(/[^0-9+]/g, '');
                        setFieldValue('phone', phoneValue);
                      }}
                      onBlur={handleBlur}
                      className="w-full px-4 py-3 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-slate-200 focus:border-slate-500 transition-all duration-300 shadow-sm"
                    />
                    {touched.phone && errors.phone && (
                      <div className="text-sm text-red-500 mt-1">{errors.phone}</div>
                    )}
                  </div>

                  {/* Role */}
                  <div>
                    <label className="flex items-center text-sm font-semibold text-slate-700 mb-3">
                      <HiTag className="w-4 h-4 mr-2 text-slate-600" />
                      Role
                    </label>
                    <select
                      name="role"
                      value={values.role}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className="w-full px-4 py-3 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-slate-200 focus:border-slate-500 transition-all duration-300 shadow-sm"
                    >
                      <option value="">Select Role</option>
                      <option value="Customer">Customer</option>
                      <option value="Supplier">Supplier</option>
                      <option value="Vendor">Vendor</option>
                    </select>
                    {touched.role && errors.role && (
                      <div className="text-sm text-red-500 mt-1">{errors.role}</div>
                    )}
                  </div>

                  {/* Country */}
                  <div>
                    <label className="flex items-center text-sm font-semibold text-slate-700 mb-3">
                      <HiGlobeAlt className="w-4 h-4 mr-2 text-slate-600" />
                      Country
                    </label>
                    <select
                      name="country"
                      value={values.country}
                      onChange={async (e) => {
                        setFieldValue('country', e.target.value);
                        setFieldValue('state', '');
                        if (e.target.value) {
                          const states = await fetchStates(e.target.value);
                          setAvailableStates(states);
                        }
                      }}
                      onBlur={handleBlur}
                      className="w-full px-4 py-3 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-slate-200 focus:border-slate-500 transition-all duration-300 shadow-sm"
                    >
                      <option value="">Select Country</option>
                      {countries.map((country) => (
                        <option key={country.country} value={country.country}>
                          {country.country}
                        </option>
                      ))}
                    </select>
                    {touched.country && errors.country && (
                      <div className="text-sm text-red-500 mt-1">{errors.country}</div>
                    )}
                  </div>

                  {/* State */}
                  <div>
                    <label className="flex items-center text-sm font-semibold text-slate-700 mb-3">
                      <HiMapPin className="w-4 h-4 mr-2 text-slate-600" />
                      State
                    </label>
                    <select
                      name="state"
                      value={values.state}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className="w-full px-4 py-3 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-slate-200 focus:border-slate-500 transition-all duration-300 shadow-sm"
                    >
                      <option value="">Select State</option>
                      {availableStates.map((state) => (
                        <option key={state.name} value={state.name}>
                          {state.name}
                        </option>
                      ))}
                    </select>
                    {touched.state && errors.state && (
                      <div className="text-sm text-red-500 mt-1">{errors.state}</div>
                    )}
                  </div>

                  {/* City */}
                  <div>
                    <label className="flex items-center text-sm font-semibold text-slate-700 mb-3">
                      <HiMapPin className="w-4 h-4 mr-2 text-slate-600" />
                      City
                    </label>
                    <input
                      name="city"
                      type="text"
                      placeholder="Enter city"
                      value={values.city}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className="w-full px-4 py-3 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-slate-200 focus:border-slate-500 transition-all duration-300 shadow-sm"
                    />
                    {touched.city && errors.city && (
                      <div className="text-sm text-red-500 mt-1">{errors.city}</div>
                    )}
                  </div>

                  {/* Pincode */}
                  <div>
                    <label className="flex items-center text-sm font-semibold text-slate-700 mb-3">
                      <HiMapPin className="w-4 h-4 mr-2 text-slate-600" />
                      Pincode
                    </label>
                    <input
                      name="pincode"
                      type="text"
                      placeholder="Enter pincode"
                      value={values.pincode}
                      onChange={(e) => {
                        const numericValue = e.target.value.replace(/\D/g, '');
                        setFieldValue('pincode', numericValue);
                      }}
                      onBlur={handleBlur}
                      className="w-full px-4 py-3 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-slate-200 focus:border-slate-500 transition-all duration-300 shadow-sm"
                    />
                    {touched.pincode && errors.pincode && (
                      <div className="text-sm text-red-500 mt-1">{errors.pincode}</div>
                    )}
                  </div>

                  {/* Currency */}
                  <div>
                    <label className="flex items-center text-sm font-semibold text-slate-700 mb-3">
                      <HiGlobeAlt className="w-4 h-4 mr-2 text-slate-600" />
                      Currency
                    </label>
                    <select
                      name="currency"
                      value={values.currency}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className="w-full px-4 py-3 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-slate-200 focus:border-slate-500 transition-all duration-300 shadow-sm"
                    >
                      <option value="">Select Currency</option>
                      {currencies.map((currency) => (
                        <option key={currency.code} value={currency.code}>
                          {currency.code}
                        </option>
                      ))}
                    </select>
                    {touched.currency && errors.currency && (
                      <div className="text-sm text-red-500 mt-1">{errors.currency}</div>
                    )}
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="flex items-center text-sm font-semibold text-slate-700 mb-3">
                      <HiTag className="w-4 h-4 mr-2 text-slate-600" />
                      Tags
                    </label>
                    <input
                      name="tags"
                      type="text"
                      placeholder="Enter tags (comma separated)"
                      value={values.tags}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className="w-full px-4 py-3 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-slate-200 focus:border-slate-500 transition-all duration-300 shadow-sm"
                    />
                  </div>

                  {/* Address */}
                  <div className="md:col-span-2">
                    <label className="flex items-center text-sm font-semibold text-slate-700 mb-3">
                      <HiMapPin className="w-4 h-4 mr-2 text-slate-600" />
                      Address
                    </label>
                    <input
                      name="address"
                      type="text"
                      placeholder="Enter address"
                      value={values.address}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className="w-full px-4 py-3 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-slate-200 focus:border-slate-500 transition-all duration-300 shadow-sm"
                    />
                    {touched.address && errors.address && (
                      <div className="text-sm text-red-500 mt-1">{errors.address}</div>
                    )}
                  </div>

                  {/* Notes */}
                  <div className="md:col-span-2">
                    <label className="flex items-center text-sm font-semibold text-slate-700 mb-3">
                      <HiDocumentText className="w-4 h-4 mr-2 text-slate-600" />
                      Notes
                    </label>
                    <textarea
                      name="notes"
                      rows={3}
                      placeholder="Additional notes..."
                      value={values.notes}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className="w-full px-4 py-3 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-slate-200 focus:border-slate-500 transition-all duration-300 shadow-sm"
                    />
                  </div>

                  {/* Status */}
                  <div className="md:col-span-2">
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={values.status}
                        onChange={(e) => setFieldValue('status', e.target.checked)}
                        className="w-5 h-5 rounded border-2 border-gray-300 text-slate-600 focus:ring-slate-200"
                      />
                      <span className="text-sm font-semibold text-slate-700">Active Status</span>
                    </label>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => navigate('/cprospect')}
                    className="px-6 py-3 rounded-lg border border-gray-300 text-slate-600 hover:bg-gray-50 transition-all duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-3 rounded-lg font-semibold text-white bg-slate-700 hover:bg-slate-800 transition-all duration-300 hover:shadow-xl disabled:opacity-50 shadow-lg"
                  >
                    {submitting ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        {isEditMode ? 'Updating...' : 'Creating...'}
                      </div>
                    ) : (
                      <>
                        <HiCheckCircle className="w-5 h-5 mr-2 inline" />
                        {isEditMode ? 'Update Party' : 'Create Party'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};

export default AddEditPartyForm;