import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import PageMeta from '../../components/common/PageMeta';
import {
  getPartyById,
  updateParty,
  createParty,
} from '../../service/partyService';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Form from '../../components/form/Form';
import Input from '../../components/form/input/InputField';
import Label from '../../components/form/Label';
import Select from '../../components/form/Select';
import TextArea from '../../components/form/input/TextArea';
import Switch from '../../components/form/switch/Switch';

import { Formik } from 'formik';
import * as Yup from 'yup';
// Fetch currencies from API
const fetchCurrencies = async () => {
  try {
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    const data = await response.json();
    return Object.keys(data.rates).map(code => ({ code, name: code }));
  } catch (error) {
    console.error('Error fetching currencies:', error);
    return [];
  }
};

// Fetch countries from API
const fetchCountries = async () => {
  try {
    const response = await fetch('https://countriesnow.space/api/v0.1/countries');
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching countries:', error);
    return [];
  }
};

// Fetch states from CountriesNow API
const fetchStates = async (countryName) => {
  try {
    const response = await fetch('https://countriesnow.space/api/v0.1/countries/states', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        country: countryName
      })
    });
    const data = await response.json();
    return data.data?.states || [];
  } catch (error) {
    console.error('Error fetching states:', error);
    return [];
  }
};

const AddEditPartyForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [party, setParty] = useState({});
  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [countrySearch, setCountrySearch] = useState('');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [currencySearch, setCurrencySearch] = useState('');
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const [availableStates, setAvailableStates] = useState([]);
  const [loadingStates, setLoadingStates] = useState(false);
  const [stateSearch, setStateSearch] = useState('');
  const [showStateDropdown, setShowStateDropdown] = useState(false);
  const [countries, setCountries] = useState([]);
  const [loadingCountries, setLoadingCountries] = useState(true);
  const [currencies, setCurrencies] = useState([]);
  const [loadingCurrencies, setLoadingCurrencies] = useState(true);

  // Fetch countries and currencies on component mount
  useEffect(() => {
    const loadData = async () => {
      const [countriesData, currenciesData] = await Promise.all([
        fetchCountries(),
        fetchCurrencies()
      ]);
      setCountries(countriesData);
      setCurrencies(currenciesData);
      setLoadingCountries(false);
      setLoadingCurrencies(false);
    };
    loadData();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.country-dropdown')) {
        setShowCountryDropdown(false);
      }
      if (!event.target.closest('.currency-dropdown')) {
        setShowCurrencyDropdown(false);
      }
      if (!event.target.closest('.state-dropdown')) {
        setShowStateDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isEditMode) {
      const fetchParty = async () => {
        try {
          setLoading(true);
          const response = await getPartyById(Number(id));
          const responseData = response.data;



          setParty(responseData);
        } catch (err) {
          setError(err.message || 'Failed to fetch party details');
          if (err.response && err.response.status === 401) {
            toast.error(err.message);
            setTimeout(() => {
              localStorage.removeItem('accessToken');
              localStorage.removeItem('refreshToken');
              navigate('/login');
            }, 2000);
          }
        } finally {
          setLoading(false);
        }
      };
      fetchParty();
    }
  }, [id, isEditMode, navigate]);

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      let response;
      if (isEditMode) {
        response = await updateParty(Number(id), values);
      } else {
        response = await createParty(values);
      }

      // Use backend response message
      toast.success(response.message);

      setTimeout(() => navigate('/cprospect'), 1500);
    } catch (err) {
      // Use backend error message
      toast.error(err.message);
      if (err.response && err.response.status === 401) {
        setTimeout(() => {
          localStorage.removeItem('accessToken');
          localStorage.removeToken('refreshToken');
          navigate('/login');
        }, 2000);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        <strong>Error:</strong> {error}
      </div>
    );
  }

  // Define initial values with proper fallbacks
  const getInitialValues = () => {
    const initialValues = {
      companyName: party.companyName || '',
      role: party.role || party.partyType || '', // Handle both role and partyType
      contactPerson: party.contactPerson || '',
      email: party.email || '',
      phone: party.phone || '',
      address: party.address || '',
      city: party.city || '',
      state: party.state || '',
      country: party.country || '',
      pincode: party.pincode || '',
      currency: party.currency || '', // This should work with your API response
      tags: party.tags || '',
      notes: party.notes || '',
      status: party.status !== undefined ? Boolean(party.status) : false,
    };



    return initialValues;
  };

  return (
    <div className="mx-auto max-w-screen-2xl p-2 sm:p-4 md:p-6 2xl:p-10">
      <PageMeta
        title={`${isEditMode ? 'Edit' : 'Add'} Party | EximEx Dashboard`}
        description={`${
          isEditMode ? 'Edit' : 'Add'
        } party details in your EximEx Dashboard`}
      />
      <PageBreadcrumb pageTitle={`${isEditMode ? 'Edit' : 'Add'} Party`} />

      <div className="rounded-sm bg-white shadow-default dark:border-strokedark dark:bg-gray-900 p-3 sm:p-6 md:p-8">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-3 sm:p-6">
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-3 sm:pb-4 mb-4 sm:mb-8">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100">
              {isEditMode ? 'Edit Party' : 'Add Party'}
            </h2>
          </div>

          <Formik
            enableReinitialize={true}
            initialValues={getInitialValues()}
            validationSchema={Yup.object({
              companyName: Yup.string().required('Company name is required'),
              role: Yup.string().required('Role is required'),
              email: Yup.string()
                .email('Invalid email')
                .required('Email is required'),
              phone: Yup.string()
  .required('Phone number is required')
  .matches(/^(?:\d{10}|\d{12})$/, 'Phone number must be exactly 10 or 12 digits'),

              address: Yup.string().required('Address is required'),
              city: Yup.string().required('City is required'),
              state: Yup.string().required('State is required'),
              country: Yup.string().required('Country is required'),
              pincode: Yup.string().required('Pincode is required'),
              currency: Yup.string().required('Currency is required'),
            })}
            onSubmit={handleSubmit}
          >
            {({
              handleSubmit,
              handleChange,
              handleBlur,
              values,
              touched,
              errors,
              setFieldValue,
            }) => {


              return (
                <Form
                  onSubmit={handleSubmit}
                  className="space-y-4 sm:space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                    {[
                      {
                        name: 'companyName',
                        label: 'Company Name',
                        type: 'text',
                        placeholder: 'Enter company name',
                      },
                      {
                        name: 'contactPerson',
                        label: 'Contact Person',
                        type: 'text',
                        placeholder: 'Enter contact person name',
                      },
                      {
                        name: 'phone',
                        label: 'Phone',
                        type: 'text',
                        placeholder: 'Enter phone number',
                      },
                      {
                        name: 'email',
                        label: 'Email',
                        type: 'email',
                        placeholder: 'Enter email address',
                      },
                      {
                        name: 'address',
                        label: 'Address',
                        type: 'text',
                        placeholder: 'Enter address',
                      },
                      {
                        name: 'city',
                        label: 'City',
                        type: 'text',
                        placeholder: 'Enter city',
                      },


                      {
                        name: 'pincode',
                        label: 'Pincode',
                        type: 'text',
                        placeholder: 'Enter pincode',
                      },
                      {
                        name: 'tags',
                        label: 'Tags',
                        type: 'text',
                        placeholder: 'Enter tags (comma separated)',
                      },
                    ].map(({ name, label, type, placeholder }) => (
                      <div className="col-span-1" key={name}>
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        value={values[name]}
        onChange={(e) => {
          // ✅ Allow only numbers for phone & pincode
          if (name === 'phone' || name === 'pincode') {
            const numericValue = e.target.value.replace(/\D/g, '');
            setFieldValue(name, numericValue);
          } else {
            handleChange(e);
          }
        }}
        onBlur={handleBlur}
        inputMode={name === 'phone' || name === 'pincode' ? 'numeric' : undefined} // mobile numeric keyboard
      />
      {touched[name] && errors[name] && (
        <div className="text-sm text-red-500 mt-1">{errors[name]}</div>
      )}
    </div>

                    ))}

                    <div className="col-span-1 relative country-dropdown">
                      <Label htmlFor="country">Country</Label>
                      <div className="relative">
                        <input
                          type="text"
                          value={showCountryDropdown ? countrySearch : values.country}
                          onChange={(e) => {
                            setCountrySearch(e.target.value);
                            setShowCountryDropdown(true);
                          }}
                          onFocus={() => {
                            setCountrySearch('');
                            setShowCountryDropdown(true);
                          }}
                          placeholder="Search and select country"
                          className="w-full rounded-lg border border-gray-300 bg-white px-2 sm:px-3 py-2 pr-8 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                        {showCountryDropdown && (
                          <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                            {loadingCountries ? (
                              <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400 flex items-center">
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Loading countries...
                              </div>
                            ) : (
                              <>
                                {countries
                                  .filter(country => 
                                    country.country.toLowerCase().includes(countrySearch.toLowerCase())
                                  )
                                  .map((country) => (
                                    <div
                                      key={country.country}
                                      onClick={async () => {
                                        setFieldValue('country', country.country);
                                        setFieldValue('state', ''); // Clear state when country changes
                                        setShowCountryDropdown(false);
                                        setCountrySearch('');
                                        
                                        // Fetch states from API
                                        setLoadingStates(true);
                                        const states = await fetchStates(country.country);
                                        setAvailableStates(states);
                                        setLoadingStates(false);
                                      }}
                                      className="px-3 py-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 text-sm text-gray-700 dark:text-gray-300"
                                    >
                                      <span>{country.country}</span>
                                    </div>
                                  ))
                                }
                                {countries.filter(country => 
                                  country.country.toLowerCase().includes(countrySearch.toLowerCase())
                                ).length === 0 && (
                                  <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                                    No countries found
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        )}
                      </div>
                      {touched.country && errors.country && (
                        <div className="text-sm text-red-500 mt-1">
                          {errors.country}
                        </div>
                      )}
                    </div>

                    <div className="col-span-1 relative state-dropdown">
                      <Label htmlFor="state">State</Label>
                      {loadingStates ? (
                        <div className="w-full rounded-lg border border-gray-300 bg-white px-2 sm:px-3 py-2 text-sm text-gray-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Loading states...
                        </div>
                      ) : availableStates.length > 0 ? (
                        <div className="relative">
                          <input
                            type="text"
                            value={showStateDropdown ? stateSearch : values.state}
                            onChange={(e) => {
                              setStateSearch(e.target.value);
                              setShowStateDropdown(true);
                            }}
                            onFocus={() => {
                              setStateSearch('');
                              setShowStateDropdown(true);
                            }}
                            placeholder="Search and select state"
                            className="w-full rounded-lg border border-gray-300 bg-white px-2 sm:px-3 py-2 pr-8 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                          {showStateDropdown && (
                            <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                              {availableStates
                                .filter(state => 
                                  state.name.toLowerCase().includes(stateSearch.toLowerCase())
                                )
                                .map((state) => (
                                  <div
                                    key={state.name}
                                    onClick={() => {
                                      setFieldValue('state', state.name);
                                      setShowStateDropdown(false);
                                      setStateSearch('');
                                    }}
                                    className="px-3 py-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 text-sm text-gray-700 dark:text-gray-300"
                                  >
                                    {state.name}
                                  </div>
                                ))
                              }
                              {availableStates.filter(state => 
                                state.name.toLowerCase().includes(stateSearch.toLowerCase())
                              ).length === 0 && (
                                <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                                  No states found
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        <Input
                          id="state"
                          name="state"
                          type="text"
                          placeholder={values.country ? "Enter state/province" : "Select country first"}
                          value={values.state}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          disabled={!values.country || loadingStates}
                        />
                      )}
                      {touched.state && errors.state && (
                        <div className="text-sm text-red-500 mt-1">
                          {errors.state}
                        </div>
                      )}
                    </div>

                    <div className="col-span-1">
                      <Label htmlFor="role">Role</Label>
                      <select
                        id="role"
                        name="role"
                        value={values.role}
                        onChange={(e) => setFieldValue('role', e.target.value)}
                        onBlur={handleBlur}
                        className="w-full rounded-lg border border-gray-300 bg-white px-2 sm:px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      >
                        <option value="">Select Role</option>
                        <option value="Customer">Customer</option>
                        <option value="Supplier">Supplier</option>
                        <option value="Vendor">Vendor</option>

                        {/* <option value="vendor">vendor</option> */}
                      </select>
                      {touched.role && errors.role && (
                        <div className="text-sm text-red-500 mt-1">
                          {errors.role}
                        </div>
                      )}
                    </div>

                    <div className="col-span-1 relative currency-dropdown">
                      <Label htmlFor="currency">Currency</Label>
                      <div className="relative">
                        <input
                          type="text"
                          value={showCurrencyDropdown ? currencySearch : values.currency}
                          onChange={(e) => {
                            setCurrencySearch(e.target.value);
                            setShowCurrencyDropdown(true);
                          }}
                          onFocus={() => {
                            setCurrencySearch('');
                            setShowCurrencyDropdown(true);
                          }}
                          placeholder="Search and select currency"
                          className="w-full rounded-lg border border-gray-300 bg-white px-2 sm:px-3 py-2 pr-8 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                        {showCurrencyDropdown && (
                          <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                            {loadingCurrencies ? (
                              <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400 flex items-center">
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Loading currencies...
                              </div>
                            ) : (
                              <>
                                {currencies
                                  .filter(currency => 
                                    currency.code.toLowerCase().includes(currencySearch.toLowerCase())
                                  )
                                  .map((currency) => (
                                    <div
                                      key={currency.code}
                                      onClick={() => {
                                        setFieldValue('currency', currency.code);
                                        setShowCurrencyDropdown(false);
                                        setCurrencySearch('');
                                      }}
                                      className="px-3 py-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 text-sm text-gray-700 dark:text-gray-300"
                                    >
                                      <span>{currency.code}</span>
                                    </div>
                                  ))
                                }
                                {currencies.filter(currency => 
                                  currency.code.toLowerCase().includes(currencySearch.toLowerCase())
                                ).length === 0 && (
                                  <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                                    No currencies found
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        )}
                      </div>
                      {touched.currency && errors.currency && (
                        <div className="text-sm text-red-500 mt-1">
                          {errors.currency}
                        </div>
                      )}
                    </div>

                    <div className="col-span-1 md:col-span-2">
                      <Label htmlFor="notes">Notes</Label>
                      <TextArea
                        id="notes"
                        name="notes"
                        rows={3}
                        placeholder="Additional notes..."
                        value={values.notes}
                        onChange={(val) => setFieldValue('notes', val)}
                      />
                    </div>

                    <div className="col-span-1 md:col-span-2">
                      <Switch
                        label="Active"
                        checked={values.status}
                        onChange={(val) => setFieldValue('status', val)}
                      />
                    </div>
                  </div>

                  <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-end gap-3 sm:gap-0 sm:space-x-4">
                    <button
                      type="button"
                      onClick={() => navigate(-1)}
                      className="w-full sm:w-auto rounded-lg border border-gray-300 bg-white px-4 py-2.5 sm:py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full sm:w-auto rounded-lg bg-blue-600 px-4 py-2.5 sm:py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting
                        ? isEditMode
                          ? 'Updating...'
                          : 'Creating...'
                        : isEditMode
                          ? 'Update Party'
                          : 'Create Party'}
                    </button>
                  </div>
                </Form>
              );
            }}
          </Formik>
        </div>
      </div>
    </div>
  );
};

export default AddEditPartyForm;
