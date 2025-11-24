import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getPartyById, updateParty, createParty } from '../../features/partySlice';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { HiArrowLeft, HiCheckCircle, HiUser, HiBuildingOffice2, HiEnvelope, HiPhone, HiMapPin, HiGlobeAlt, HiTag, HiDocumentText, HiChevronDown, HiMagnifyingGlass } from 'react-icons/hi2';
import { Country, State, City } from 'country-state-city';

const fetchCurrencies = async () => {
  try {
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    const data = await response.json();
    return Object.keys(data.rates).map((code) => ({ code, name: code }));
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
  const [currencies, setCurrencies] = useState([]);
  const [locationData, setLocationData] = useState({ country: '', state: '', city: '' });
  const [currencySearch, setCurrencySearch] = useState('');
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const currencyRef = useRef(null);
  
  // Country State City states
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [countrySearch, setCountrySearch] = useState('');
  const [stateSearch, setStateSearch] = useState('');
  const [citySearch, setCitySearch] = useState('');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [showStateDropdown, setShowStateDropdown] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const countryRef = useRef(null);
  const stateRef = useRef(null);
  const cityRef = useRef(null);

  useEffect(() => {
    const loadData = async () => {
      const currenciesData = await fetchCurrencies();
      setCurrencies(currenciesData);
      
      // Load countries
      const allCountries = Country.getAllCountries();
      setCountries(allCountries);
    };
    loadData();
  }, []);
  
  // Initialize location with existing values (only for edit mode)
  useEffect(() => {
    if (countries.length > 0 && !initialized && isEditMode && Object.keys(party).length > 0) {
      const country = countries.find(c => c.name === party.country);
      if (country) {
        setSelectedCountry(country.isoCode);
        const countryStates = State.getStatesOfCountry(country.isoCode);
        setStates(countryStates);
        
        const state = countryStates.find(s => s.name === party.state);
        if (state) {
          setSelectedState(state.isoCode);
          const stateCities = City.getCitiesOfState(country.isoCode, state.isoCode);
          setCities(stateCities);
          
          if (party.city) {
            setSelectedCity(party.city);
          }
        }
      }
      setInitialized(true);
    } else if (countries.length > 0 && !isEditMode && !initialized) {
      setInitialized(true);
    }
  }, [countries, party, initialized, isEditMode]);
  
  // Load states when country changes
  useEffect(() => {
    if (selectedCountry) {
      const countryStates = State.getStatesOfCountry(selectedCountry);
      setStates(countryStates);
      if (!isEditMode || !party.state) {
        setSelectedState('');
        setCities([]);
        setSelectedCity('');
      }
    }
  }, [selectedCountry, isEditMode, party.state]);
  
  // Load cities when state changes
  useEffect(() => {
    if (selectedCountry && selectedState) {
      const stateCities = City.getCitiesOfState(selectedCountry, selectedState);
      setCities(stateCities);
      if (!isEditMode || !party.city) {
        setSelectedCity('');
      }
    }
  }, [selectedCountry, selectedState, isEditMode, party.city]);



  useEffect(() => {
    if (isEditMode) {
      const fetchParty = async () => {
        try {
          setLoading(true);
          const response = await dispatch(getPartyById(Number(id))).unwrap();
          setParty(response.data || response);
        } catch (err) {
          toast.error(err.message);
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

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (currencyRef.current && !currencyRef.current.contains(event.target)) {
        setShowCurrencyDropdown(false);
      }
      if (countryRef.current && !countryRef.current.contains(event.target)) {
        setShowCountryDropdown(false);
      }
      if (stateRef.current && !stateRef.current.contains(event.target)) {
        setShowStateDropdown(false);
      }
      if (cityRef.current && !cityRef.current.contains(event.target)) {
        setShowCityDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
      toast.error(err);
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
    city: selectedCity || party.city || '',
    state: states.find(s => s.isoCode === selectedState)?.name || party.state || '',
    country: countries.find(c => c.isoCode === selectedCountry)?.name || party.country || '',
    pincode: party.pincode || '',
    currency: party.currency || '',
    tags: party.tags || '',
    notes: party.notes || '',
    status: party.status !== undefined ? Boolean(party.status) : false,
  });
  
  // Custom Dropdown Component
  const SearchableDropdown = ({ 
    label, 
    value, 
    options, 
    onSelect, 
    searchValue, 
    onSearchChange, 
    isOpen, 
    onToggle, 
    placeholder, 
    disabled = false,
    dropdownRef 
  }) => {
    const selectedOption = options.find(opt => opt.value === value);
    
    return (
      <div className="relative" ref={dropdownRef}>
        <label className="block text-sm font-semibold text-slate-700 mb-2">{label}</label>
        <div 
          className={`w-full px-4 py-3 border border-gray-300 bg-white rounded-lg cursor-pointer flex items-center justify-between transition-all duration-300 shadow-sm ${
            disabled 
              ? 'bg-gray-100 cursor-not-allowed' 
              : 'hover:border-slate-400 focus-within:ring-2 focus-within:ring-slate-200 focus-within:border-slate-500'
          }`}
          onClick={() => !disabled && onToggle()}
        >
          <span className={`text-sm ${selectedOption ? 'text-slate-900' : 'text-slate-500'}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <HiChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
        
        {isOpen && !disabled && (
          <div className="absolute z-50 w-full bg-white border border-gray-200 rounded-lg shadow-xl" style={{ top: '100%', marginTop: '4px' }}>
            <div className="p-3 border-b border-gray-100">
              <div className="relative">
                <HiMagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder={`Search ${label.toLowerCase()}...`}
                  value={searchValue}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                  onClick={(e) => e.stopPropagation()}
                  autoFocus
                />
              </div>
            </div>
            <div className="max-h-60 overflow-y-auto">
              {options.length === 0 ? (
                <div className="px-4 py-3 text-slate-500 text-sm text-center">No {label.toLowerCase()} found</div>
              ) : (
                options.map((option) => (
                  <div
                    key={option.value}
                    className={`px-4 py-3 hover:bg-slate-50 cursor-pointer text-sm transition-colors duration-150 ${
                      option.value === value ? 'bg-slate-100 text-slate-900 font-medium' : 'text-slate-700'
                    }`}
                    onClick={() => {
                      onSelect(option.value);
                      onToggle();
                    }}
                  >
                    {option.label}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

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

                  {/* Location - Country, State, City */}
                  <div className="md:col-span-2">
                    <label className="flex items-center text-sm font-semibold text-slate-700 mb-3">
                      <HiGlobeAlt className="w-4 h-4 mr-2 text-slate-600" />
                      Location
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Country */}
                      <SearchableDropdown
                        label="Country"
                        value={selectedCountry}
                        options={countries.filter(country => 
                          country.name.toLowerCase().includes(countrySearch.toLowerCase())
                        ).map(country => ({
                          value: country.isoCode,
                          label: country.name
                        }))}
                        onSelect={(value) => {
                          setSelectedCountry(value);
                          setCountrySearch('');
                          const countryName = countries.find(c => c.isoCode === value)?.name || '';
                          setFieldValue('country', countryName);
                        }}
                        searchValue={countrySearch}
                        onSearchChange={setCountrySearch}
                        isOpen={showCountryDropdown}
                        onToggle={() => setShowCountryDropdown(!showCountryDropdown)}
                        placeholder="Select Country"
                        dropdownRef={countryRef}
                      />

                      {/* State */}
                      <SearchableDropdown
                        label="State"
                        value={selectedState}
                        options={states.filter(state => 
                          state.name.toLowerCase().includes(stateSearch.toLowerCase())
                        ).map(state => ({
                          value: state.isoCode,
                          label: state.name
                        }))}
                        onSelect={(value) => {
                          setSelectedState(value);
                          setStateSearch('');
                          const stateName = states.find(s => s.isoCode === value)?.name || '';
                          setFieldValue('state', stateName);
                        }}
                        searchValue={stateSearch}
                        onSearchChange={setStateSearch}
                        isOpen={showStateDropdown}
                        onToggle={() => setShowStateDropdown(!showStateDropdown)}
                        placeholder="Select State"
                        disabled={!selectedCountry}
                        dropdownRef={stateRef}
                      />

                      {/* City */}
                      <SearchableDropdown
                        label="City"
                        value={selectedCity}
                        options={cities.filter(city => 
                          city.name.toLowerCase().includes(citySearch.toLowerCase())
                        ).map(city => ({
                          value: city.name,
                          label: city.name
                        }))}
                        onSelect={(value) => {
                          setSelectedCity(value);
                          setCitySearch('');
                          setFieldValue('city', value);
                        }}
                        searchValue={citySearch}
                        onSearchChange={setCitySearch}
                        isOpen={showCityDropdown}
                        onToggle={() => setShowCityDropdown(!showCityDropdown)}
                        placeholder="Select City"
                        disabled={!selectedState}
                        dropdownRef={cityRef}
                      />
                    </div>
                    {(touched.country && errors.country) && (
                      <div className="text-sm text-red-500 mt-1">{errors.country}</div>
                    )}
                    {(touched.state && errors.state) && (
                      <div className="text-sm text-red-500 mt-1">{errors.state}</div>
                    )}
                    {(touched.city && errors.city) && (
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
                        const validValue = e.target.value.replace(/[^a-zA-Z0-9\s-]/g, '');
                        setFieldValue('pincode', validValue);
                      }}
                      onBlur={handleBlur}
                      className="w-full px-4 py-3 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-slate-200 focus:border-slate-500 transition-all duration-300 shadow-sm"
                    />
                    {touched.pincode && errors.pincode && (
                      <div className="text-sm text-red-500 mt-1">{errors.pincode}</div>
                    )}
                  </div>

                  {/* Currency */}
                  <div className="relative" ref={currencyRef}>
                    <label className="flex items-center text-sm font-semibold text-slate-700 mb-2">
                      <HiGlobeAlt className="w-4 h-4 mr-2 text-slate-600" />
                      Currency
                    </label>
                    <div 
                      className="w-full px-4 py-3 border border-gray-300 bg-white rounded-lg cursor-pointer flex items-center justify-between transition-all duration-300 shadow-sm hover:border-slate-400 focus-within:ring-2 focus-within:ring-slate-200 focus-within:border-slate-500"
                      onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
                    >
                      <span className={`text-sm ${values.currency ? 'text-slate-900' : 'text-slate-500'}`}>
                        {values.currency ? `${values.currency}` : 'Select Currency'}
                      </span>
                      <HiChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${showCurrencyDropdown ? 'rotate-180' : ''}`} />
                    </div>
                    
                    {showCurrencyDropdown && (
                      <div className="absolute z-50 w-full bg-white border border-gray-200 rounded-lg shadow-xl" style={{ top: '100%', marginTop: '4px' }}>
                        <div className="p-3 border-b border-gray-100">
                          <div className="relative">
                            <HiMagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <input
                              type="text"
                              placeholder="Search currency..."
                              value={currencySearch}
                              onChange={(e) => setCurrencySearch(e.target.value)}
                              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                              onClick={(e) => e.stopPropagation()}
                              autoFocus
                            />
                          </div>
                        </div>
                        <div className="max-h-60 overflow-y-auto">
                          {currencies.filter(currency => 
                            currency.code.toLowerCase().includes(currencySearch.toLowerCase())
                          ).length === 0 ? (
                            <div className="px-4 py-3 text-slate-500 text-sm text-center">No currency found</div>
                          ) : (
                            currencies.filter(currency => 
                              currency.code.toLowerCase().includes(currencySearch.toLowerCase())
                            ).map((currency) => (
                              <div
                                key={currency.code}
                                className={`px-4 py-3 hover:bg-slate-50 cursor-pointer text-sm transition-colors duration-150 ${
                                  currency.code === values.currency ? 'bg-slate-100 text-slate-900 font-medium' : 'text-slate-700'
                                }`}
                                onClick={() => {
                                  setFieldValue('currency', currency.code);
                                  setShowCurrencyDropdown(false);
                                  setCurrencySearch('');
                                }}
                              >
                                {currency.code}
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
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
                  <div>
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