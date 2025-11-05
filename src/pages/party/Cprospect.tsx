import React, { useState, useEffect, useMemo } from 'react';
import { fetchParties, deleteParty, createParty, getPartyById, updateParty } from '../../features/partySlice';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { HiEye, HiPencil, HiTrash, HiPlus, HiMagnifyingGlass, HiBuildingOffice2, HiUsers, HiXMark, HiUser, HiEnvelope, HiPhone, HiMapPin, HiGlobeAlt, HiTag, HiDocumentText } from 'react-icons/hi2';
import { toast } from 'react-toastify';
import { Formik } from 'formik';
import * as Yup from 'yup';

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

const Cprospect = () => {
  const dispatch = useDispatch();
  const [parties, setParties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingParty, setEditingParty] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [countries, setCountries] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [availableStates, setAvailableStates] = useState([]);
  const [loadingCountries, setLoadingCountries] = useState(true);
  const [loadingCurrencies, setLoadingCurrencies] = useState(true);
  const itemsPerPage = 10;

  useEffect(() => {
    const loadParties = async () => {
      try {
        const response = await dispatch(fetchParties()).unwrap();
        setParties(response?.data || []);
      } catch (err) {
        setError('Failed to fetch parties');
      } finally {
        setLoading(false);
      }
    };
    loadParties();
  }, [dispatch]);

  useEffect(() => {
    const loadData = async () => {
      const [countriesData, currenciesData] = await Promise.all([fetchCountries(), fetchCurrencies()]);
      setCountries(countriesData);
      setCurrencies(currenciesData);
      setLoadingCountries(false);
      setLoadingCurrencies(false);
    };
    loadData();
  }, []);

  const handleDeleteClick = (id) => {
    setConfirmDelete(id);
  };

  const handleConfirmDelete = async () => {
    if (!confirmDelete) return;

    try {
      const response = await dispatch(deleteParty(confirmDelete)).unwrap();
      setParties((prev) => prev.filter((p) => p.id !== confirmDelete));
      setConfirmDelete(null);

      const message = response?.message || 'Party deleted successfully';
      toast.success(message);
    } catch (err) {
      const errorMessage = err.message || 'Failed to delete party';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleFormSubmit = async (values, { resetForm }) => {
    setSubmitting(true);
    try {
      const response = await dispatch(createParty(values)).unwrap();
      const newParty = response.data || response;
      setParties((prev) => [newParty, ...prev]);
      toast.success(response.message || 'Party created successfully');
      setShowAddForm(false);
      resetForm();
    } catch (err) {
      toast.error(err.message || 'Failed to create party');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClick = async (party) => {
    setEditingParty(party);
    setShowEditForm(true);
  };

  const handleEditSubmit = async (values, { resetForm }) => {
    setSubmitting(true);
    try {
      const response = await dispatch(updateParty({ id: editingParty.id, party: values })).unwrap();
      setParties((prev) => prev.map(p => p.id === editingParty.id ? { ...p, ...values } : p));
      toast.success(response.message || 'Party updated successfully');
      setShowEditForm(false);
      setEditingParty(null);
      resetForm();
    } catch (err) {
      toast.error(err.message || 'Failed to update party');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredParties = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return parties.filter(
      (p) =>
        p.companyName.toLowerCase().includes(term) ||
        p.contactPerson.toLowerCase().includes(term) ||
        p.email.toLowerCase().includes(term)
    );
  }, [searchTerm, parties]);

  const totalPages = Math.ceil(filteredParties.length / itemsPerPage);
  const currentParties = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredParties.slice(start, start + itemsPerPage);
  }, [filteredParties, currentPage]);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading prospects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="p-4 lg:p-6 pt-6 sm:pt-8 lg:pt-12 pb-6 sm:pb-8 lg:pb-12">
        {/* Header */}
        <div className="mb-6">
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/30 p-6 lg:p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg">
                  <HiUsers className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 mb-1">
                    Customer Prospects
                  </h1>
                  <p className="text-slate-600 text-sm lg:text-base">Manage your business relationships</p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <HiMagnifyingGlass className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search prospects..."
                    className="pl-12 pr-4 py-3 w-full sm:w-72 rounded-2xl border border-white/50 bg-white/60 backdrop-blur-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all duration-300 text-sm placeholder-slate-500 shadow-sm"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </div>
                
                <button
                  onClick={() => setShowAddForm(true)}
                  className="inline-flex items-center justify-center px-6 py-3 rounded-2xl font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 hover:shadow-xl hover:scale-105 transform shadow-lg"
                >
                  <HiPlus className="w-5 h-5 mr-2" />
                  Add Prospect
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Cards Grid */}
        {filteredParties.length === 0 ? (
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/30 p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
              <HiMagnifyingGlass className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">No prospects found</h3>
            <p className="text-slate-600 mb-6">Add your first prospect to get started</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center px-6 py-3 rounded-2xl font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 hover:scale-105 transform shadow-lg"
            >
              <HiPlus className="w-5 h-5 mr-2" />
              Add First Prospect
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 lg:gap-6">
            {currentParties.map((party) => (
              <div
                key={party.id}
                className="group bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/30 p-6 transition-all duration-500 hover:shadow-2xl hover:scale-105 hover:bg-white/80"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="p-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 shadow-md flex-shrink-0">
                      <HiBuildingOffice2 className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-slate-800 mb-1 truncate group-hover:text-blue-600 transition-colors" title={party.companyName}>
                        {party.companyName}
                      </h3>
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full shadow-sm inline-block ${
                        party.status 
                          ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white' 
                          : 'bg-gradient-to-r from-red-500 to-pink-500 text-white'
                      }`}>
                        {party.status ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-sm">
                    <span className="font-medium text-slate-500 w-16 text-xs">Role:</span>
                    <span className="text-slate-800 font-semibold text-sm">{party.role}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="font-medium text-slate-500 w-16 text-xs">Contact:</span>
                    <span className="text-slate-700 truncate text-sm">{party.contactPerson}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="font-medium text-slate-500 w-16 text-xs">Email:</span>
                    <span className="text-slate-700 truncate text-sm">{party.email}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="font-medium text-slate-500 w-16 text-xs">Phone:</span>
                    <span className="text-slate-700 text-sm">{party.phone}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="font-medium text-slate-500 w-16 text-xs">Location:</span>
                    <span className="text-slate-700 truncate text-sm">
                      {[party.city, party.state, party.country].filter(Boolean).join(', ')}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-end space-x-2 pt-4 border-t border-white/50">
                  <Link
                    to={`/view-party/${party.id}`}
                    className="p-2.5 rounded-xl text-slate-500 hover:text-white hover:bg-gradient-to-r hover:from-blue-500 hover:to-blue-600 transition-all duration-300 hover:scale-110 transform hover:shadow-lg"
                  >
                    <HiEye className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => handleEditClick(party)}
                    className="p-2.5 rounded-xl text-slate-500 hover:text-white hover:bg-gradient-to-r hover:from-emerald-500 hover:to-emerald-600 transition-all duration-300 hover:scale-110 transform hover:shadow-lg"
                  >
                    <HiPencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(party.id)}
                    className="p-2.5 rounded-xl text-slate-500 hover:text-white hover:bg-gradient-to-r hover:from-red-500 hover:to-red-600 transition-all duration-300 hover:scale-110 transform hover:shadow-lg"
                  >
                    <HiTrash className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/30 p-6 mt-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-600">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredParties.length)} of {filteredParties.length} prospects
              </p>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-xl border border-white/50 text-slate-600 hover:bg-gradient-to-r hover:from-blue-500 hover:to-indigo-600 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-lg"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-4 py-2 rounded-xl transition-all duration-300 ${
                      currentPage === page
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-lg'
                        : 'text-slate-600 hover:bg-gradient-to-r hover:from-blue-500 hover:to-indigo-600 hover:text-white hover:shadow-lg'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-xl border border-white/50 text-slate-600 hover:bg-gradient-to-r hover:from-blue-500 hover:to-indigo-600 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-lg"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Form Panel */}
      <div className={`fixed inset-y-0 right-0 z-50 w-full max-w-2xl transform transition-transform duration-300 ease-in-out ${
        showAddForm ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="h-full bg-white/95 backdrop-blur-xl shadow-2xl border-l border-white/30">
          <div className="flex items-center justify-between p-6 border-b border-white/30">
            <h2 className="text-xl font-bold text-slate-800">Add New Prospect</h2>
            <button
              onClick={() => setShowAddForm(false)}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-all duration-200"
            >
              <HiXMark className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-6 overflow-y-auto h-full pb-20">
            <Formik
              initialValues={{
                companyName: '',
                role: '',
                contactPerson: '',
                email: '',
                phone: '',
                address: '',
                city: '',
                state: '',
                country: '',
                pincode: '',
                currency: '',
                tags: '',
                notes: '',
                status: true
              }}
              validationSchema={Yup.object({
                companyName: Yup.string().required('Company name is required'),
                role: Yup.string().required('Role is required'),
                email: Yup.string().email('Invalid email').required('Email is required'),
                phone: Yup.string().required('Phone is required').matches(/^(?:\d{10}|\d{12})$/, 'Phone number must be exactly 10 or 12 digits'),
                address: Yup.string().required('Address is required'),
                city: Yup.string().required('City is required'),
                state: Yup.string().required('State is required'),
                country: Yup.string().required('Country is required'),
                pincode: Yup.string().required('Pincode is required'),
                currency: Yup.string().required('Currency is required')
              })}
              onSubmit={handleFormSubmit}
            >
              {({ handleSubmit, handleChange, handleBlur, values, touched, errors, setFieldValue }) => (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="flex items-center text-sm font-semibold text-slate-700 mb-2">
                      <HiBuildingOffice2 className="w-4 h-4 mr-2 text-blue-600" />
                      Company Name
                    </label>
                    <input
                      name="companyName"
                      type="text"
                      placeholder="Enter company name"
                      value={values.companyName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className="w-full px-4 py-3 border border-slate-200 bg-white/80 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-300"
                    />
                    {touched.companyName && errors.companyName && (
                      <div className="text-sm text-red-500 mt-1">{errors.companyName}</div>
                    )}
                  </div>

                  <div>
                    <label className="flex items-center text-sm font-semibold text-slate-700 mb-2">
                      <HiUser className="w-4 h-4 mr-2 text-blue-600" />
                      Contact Person
                    </label>
                    <input
                      name="contactPerson"
                      type="text"
                      placeholder="Enter contact person"
                      value={values.contactPerson}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className="w-full px-4 py-3 border border-slate-200 bg-white/80 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-300"
                    />
                  </div>

                  <div>
                    <label className="flex items-center text-sm font-semibold text-slate-700 mb-2">
                      <HiEnvelope className="w-4 h-4 mr-2 text-blue-600" />
                      Email
                    </label>
                    <input
                      name="email"
                      type="email"
                      placeholder="Enter email"
                      value={values.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className="w-full px-4 py-3 border border-slate-200 bg-white/80 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-300"
                    />
                    {touched.email && errors.email && (
                      <div className="text-sm text-red-500 mt-1">{errors.email}</div>
                    )}
                  </div>

                  <div>
                    <label className="flex items-center text-sm font-semibold text-slate-700 mb-2">
                      <HiPhone className="w-4 h-4 mr-2 text-blue-600" />
                      Phone
                    </label>
                    <input
                      name="phone"
                      type="text"
                      placeholder="Enter phone"
                      value={values.phone}
                      onChange={(e) => {
                        const numericValue = e.target.value.replace(/\D/g, '');
                        setFieldValue('phone', numericValue);
                      }}
                      onBlur={handleBlur}
                      className="w-full px-4 py-3 border border-slate-200 bg-white/80 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-300"
                    />
                    {touched.phone && errors.phone && (
                      <div className="text-sm text-red-500 mt-1">{errors.phone}</div>
                    )}
                  </div>

                  <div>
                    <label className="flex items-center text-sm font-semibold text-slate-700 mb-2">
                      Role
                    </label>
                    <select
                      name="role"
                      value={values.role}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className="w-full px-4 py-3 border border-slate-200 bg-white/80 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-300"
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

                  <div>
                    <label className="flex items-center text-sm font-semibold text-slate-700 mb-2">
                      <HiMapPin className="w-4 h-4 mr-2 text-blue-600" />
                      Address
                    </label>
                    <input
                      name="address"
                      type="text"
                      placeholder="Enter address"
                      value={values.address}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className="w-full px-4 py-3 border border-slate-200 bg-white/80 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-300"
                    />
                    {touched.address && errors.address && (
                      <div className="text-sm text-red-500 mt-1">{errors.address}</div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-semibold text-slate-700 mb-2 block">City</label>
                      <input
                        name="city"
                        type="text"
                        placeholder="City"
                        value={values.city}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className="w-full px-4 py-3 border border-slate-200 bg-white/80 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-300"
                      />
                      {touched.city && errors.city && (
                        <div className="text-sm text-red-500 mt-1">{errors.city}</div>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-700 mb-2 block">State</label>
                      <select
                        name="state"
                        value={values.state}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className="w-full px-4 py-3 border border-slate-200 bg-white/80 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-300"
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
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-semibold text-slate-700 mb-2 block">Country</label>
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
                        className="w-full px-4 py-3 border border-slate-200 bg-white/80 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-300"
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
                    <div>
                      <label className="text-sm font-semibold text-slate-700 mb-2 block">Pincode</label>
                      <input
                        name="pincode"
                        type="text"
                        placeholder="Pincode"
                        value={values.pincode}
                        onChange={(e) => {
                          const numericValue = e.target.value.replace(/\D/g, '');
                          setFieldValue('pincode', numericValue);
                        }}
                        onBlur={handleBlur}
                        className="w-full px-4 py-3 border border-slate-200 bg-white/80 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-300"
                      />
                      {touched.pincode && errors.pincode && (
                        <div className="text-sm text-red-500 mt-1">{errors.pincode}</div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center text-sm font-semibold text-slate-700 mb-2">
                      <HiGlobeAlt className="w-4 h-4 mr-2 text-blue-600" />
                      Currency
                    </label>
                    <select
                      name="currency"
                      value={values.currency}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className="w-full px-4 py-3 border border-slate-200 bg-white/80 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-300"
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

                  <div>
                    <label className="flex items-center text-sm font-semibold text-slate-700 mb-2">
                      <HiTag className="w-4 h-4 mr-2 text-blue-600" />
                      Tags
                    </label>
                    <input
                      name="tags"
                      type="text"
                      placeholder="Enter tags (comma separated)"
                      value={values.tags}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className="w-full px-4 py-3 border border-slate-200 bg-white/80 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-300"
                    />
                  </div>

                  <div>
                    <label className="flex items-center text-sm font-semibold text-slate-700 mb-2">
                      <HiDocumentText className="w-4 h-4 mr-2 text-blue-600" />
                      Notes
                    </label>
                    <textarea
                      name="notes"
                      rows={3}
                      placeholder="Additional notes..."
                      value={values.notes}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className="w-full px-4 py-3 border border-slate-200 bg-white/80 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-300"
                    />
                  </div>

                  <div className="flex items-center space-x-3 pt-4">
                    <input
                      type="checkbox"
                      checked={values.status}
                      onChange={(e) => setFieldValue('status', e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-200"
                    />
                    <label className="text-sm font-semibold text-slate-700">Active Status</label>
                  </div>

                  <div className="flex items-center justify-end space-x-3 pt-6 pb-6 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-6 py-2 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 disabled:opacity-50"
                    >
                      {submitting ? 'Creating...' : 'Create Prospect'}
                    </button>
                  </div>
                </form>
              )}
            </Formik>
          </div>
        </div>
      </div>

      {/* Edit Form Panel */}
      <div className={`fixed inset-y-0 right-0 z-50 w-full max-w-2xl transform transition-transform duration-300 ease-in-out ${
        showEditForm ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="h-full bg-white/95 backdrop-blur-xl shadow-2xl border-l border-white/30">
          <div className="flex items-center justify-between p-6 border-b border-white/30">
            <h2 className="text-xl font-bold text-slate-800">Edit Prospect</h2>
            <button
              onClick={() => {
                setShowEditForm(false);
                setEditingParty(null);
              }}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-all duration-200"
            >
              <HiXMark className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-6 overflow-y-auto h-full pb-20">
            {editingParty && (
              <Formik
                initialValues={{
                  companyName: editingParty.companyName || '',
                  role: editingParty.role || '',
                  contactPerson: editingParty.contactPerson || '',
                  email: editingParty.email || '',
                  phone: editingParty.phone || '',
                  address: editingParty.address || '',
                  city: editingParty.city || '',
                  state: editingParty.state || '',
                  country: editingParty.country || '',
                  pincode: editingParty.pincode || '',
                  currency: editingParty.currency || '',
                  tags: editingParty.tags || '',
                  notes: editingParty.notes || '',
                  status: editingParty.status !== undefined ? Boolean(editingParty.status) : true
                }}
                validationSchema={Yup.object({
                  companyName: Yup.string().required('Company name is required'),
                  role: Yup.string().required('Role is required'),
                  email: Yup.string().email('Invalid email').required('Email is required'),
                  phone: Yup.string().required('Phone is required').matches(/^(?:\d{10}|\d{12})$/, 'Phone number must be exactly 10 or 12 digits'),
                  address: Yup.string().required('Address is required'),
                  city: Yup.string().required('City is required'),
                  state: Yup.string().required('State is required'),
                  country: Yup.string().required('Country is required'),
                  pincode: Yup.string().required('Pincode is required'),
                  currency: Yup.string().required('Currency is required')
                })}
                onSubmit={handleEditSubmit}
                enableReinitialize
              >
                {({ handleSubmit, handleChange, handleBlur, values, touched, errors, setFieldValue }) => (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="flex items-center text-sm font-semibold text-slate-700 mb-2">
                        <HiBuildingOffice2 className="w-4 h-4 mr-2 text-blue-600" />
                        Company Name
                      </label>
                      <input
                        name="companyName"
                        type="text"
                        placeholder="Enter company name"
                        value={values.companyName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className="w-full px-4 py-3 border border-slate-200 bg-white/80 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-300"
                      />
                      {touched.companyName && errors.companyName && (
                        <div className="text-sm text-red-500 mt-1">{errors.companyName}</div>
                      )}
                    </div>

                    <div>
                      <label className="flex items-center text-sm font-semibold text-slate-700 mb-2">
                        <HiUser className="w-4 h-4 mr-2 text-blue-600" />
                        Contact Person
                      </label>
                      <input
                        name="contactPerson"
                        type="text"
                        placeholder="Enter contact person"
                        value={values.contactPerson}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className="w-full px-4 py-3 border border-slate-200 bg-white/80 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-300"
                      />
                    </div>

                    <div>
                      <label className="flex items-center text-sm font-semibold text-slate-700 mb-2">
                        <HiEnvelope className="w-4 h-4 mr-2 text-blue-600" />
                        Email
                      </label>
                      <input
                        name="email"
                        type="email"
                        placeholder="Enter email"
                        value={values.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className="w-full px-4 py-3 border border-slate-200 bg-white/80 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-300"
                      />
                      {touched.email && errors.email && (
                        <div className="text-sm text-red-500 mt-1">{errors.email}</div>
                      )}
                    </div>

                    <div>
                      <label className="flex items-center text-sm font-semibold text-slate-700 mb-2">
                        <HiPhone className="w-4 h-4 mr-2 text-blue-600" />
                        Phone
                      </label>
                      <input
                        name="phone"
                        type="text"
                        placeholder="Enter phone"
                        value={values.phone}
                        onChange={(e) => {
                          const numericValue = e.target.value.replace(/\D/g, '');
                          setFieldValue('phone', numericValue);
                        }}
                        onBlur={handleBlur}
                        className="w-full px-4 py-3 border border-slate-200 bg-white/80 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-300"
                      />
                      {touched.phone && errors.phone && (
                        <div className="text-sm text-red-500 mt-1">{errors.phone}</div>
                      )}
                    </div>

                    <div>
                      <label className="flex items-center text-sm font-semibold text-slate-700 mb-2">
                        Role
                      </label>
                      <select
                        name="role"
                        value={values.role}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className="w-full px-4 py-3 border border-slate-200 bg-white/80 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-300"
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

                    <div>
                      <label className="flex items-center text-sm font-semibold text-slate-700 mb-2">
                        <HiMapPin className="w-4 h-4 mr-2 text-blue-600" />
                        Address
                      </label>
                      <input
                        name="address"
                        type="text"
                        placeholder="Enter address"
                        value={values.address}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className="w-full px-4 py-3 border border-slate-200 bg-white/80 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-300"
                      />
                      {touched.address && errors.address && (
                        <div className="text-sm text-red-500 mt-1">{errors.address}</div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm font-semibold text-slate-700 mb-2 block">City</label>
                        <input
                          name="city"
                          type="text"
                          placeholder="City"
                          value={values.city}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className="w-full px-4 py-3 border border-slate-200 bg-white/80 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-300"
                        />
                        {touched.city && errors.city && (
                          <div className="text-sm text-red-500 mt-1">{errors.city}</div>
                        )}
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-slate-700 mb-2 block">State</label>
                        <select
                          name="state"
                          value={values.state}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className="w-full px-4 py-3 border border-slate-200 bg-white/80 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-300"
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
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm font-semibold text-slate-700 mb-2 block">Country</label>
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
                          className="w-full px-4 py-3 border border-slate-200 bg-white/80 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-300"
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
                      <div>
                        <label className="text-sm font-semibold text-slate-700 mb-2 block">Pincode</label>
                        <input
                          name="pincode"
                          type="text"
                          placeholder="Pincode"
                          value={values.pincode}
                          onChange={(e) => {
                            const numericValue = e.target.value.replace(/\D/g, '');
                            setFieldValue('pincode', numericValue);
                          }}
                          onBlur={handleBlur}
                          className="w-full px-4 py-3 border border-slate-200 bg-white/80 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-300"
                        />
                        {touched.pincode && errors.pincode && (
                          <div className="text-sm text-red-500 mt-1">{errors.pincode}</div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="flex items-center text-sm font-semibold text-slate-700 mb-2">
                        <HiGlobeAlt className="w-4 h-4 mr-2 text-blue-600" />
                        Currency
                      </label>
                      <select
                        name="currency"
                        value={values.currency}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className="w-full px-4 py-3 border border-slate-200 bg-white/80 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-300"
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

                    <div>
                      <label className="flex items-center text-sm font-semibold text-slate-700 mb-2">
                        <HiTag className="w-4 h-4 mr-2 text-blue-600" />
                        Tags
                      </label>
                      <input
                        name="tags"
                        type="text"
                        placeholder="Enter tags (comma separated)"
                        value={values.tags}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className="w-full px-4 py-3 border border-slate-200 bg-white/80 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-300"
                      />
                    </div>

                    <div>
                      <label className="flex items-center text-sm font-semibold text-slate-700 mb-2">
                        <HiDocumentText className="w-4 h-4 mr-2 text-blue-600" />
                        Notes
                      </label>
                      <textarea
                        name="notes"
                        rows={3}
                        placeholder="Additional notes..."
                        value={values.notes}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className="w-full px-4 py-3 border border-slate-200 bg-white/80 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-300"
                      />
                    </div>

                    <div className="flex items-center space-x-3 pt-4">
                      <input
                        type="checkbox"
                        checked={values.status}
                        onChange={(e) => setFieldValue('status', e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-200"
                      />
                      <label className="text-sm font-semibold text-slate-700">Active Status</label>
                    </div>

                    <div className="flex items-center justify-end space-x-3 pt-6 pb-6 border-t border-slate-200">
                      <button
                        type="button"
                        onClick={() => {
                          setShowEditForm(false);
                          setEditingParty(null);
                        }}
                        className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all duration-200"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="px-6 py-2 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 disabled:opacity-50"
                      >
                        {submitting ? 'Updating...' : 'Update Prospect'}
                      </button>
                    </div>
                  </form>
                )}
              </Formik>
            )}
          </div>
        </div>
      </div>

      {/* Backdrop */}
      {(showAddForm || showEditForm) && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={() => {
            setShowAddForm(false);
            setShowEditForm(false);
            setEditingParty(null);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl max-w-md w-full p-8 border border-white/30">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r from-red-500 to-pink-600 flex items-center justify-center shadow-lg">
                <HiTrash className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Delete Prospect</h3>
              <p className="text-slate-600">Are you sure you want to delete this prospect? This action cannot be undone.</p>
            </div>
            <div className="flex items-center justify-center space-x-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-6 py-3 rounded-2xl border border-white/50 text-slate-600 hover:bg-slate-50 transition-all duration-300 hover:scale-105 transform"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-red-500 to-pink-600 text-white hover:from-red-600 hover:to-pink-700 transition-all duration-300 hover:scale-105 transform shadow-lg"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cprospect;