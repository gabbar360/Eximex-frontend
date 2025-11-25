import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPartyById } from '../../features/partySlice';
import { useDispatch } from 'react-redux';
import {
  HiArrowLeft,
  HiPencil,
  HiBuildingOffice2,
  HiUser,
  HiEnvelope,
  HiPhone,
  HiMapPin,
  HiGlobeAlt,
  HiTag,
  HiDocumentText,
  HiCheckBadge,
  HiXCircle,
} from 'react-icons/hi2';
import { Link } from 'react-router-dom';

const ViewParty = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [party, setParty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchParty = async () => {
      try {
        const response = await dispatch(getPartyById(id)).unwrap();
        setParty(response?.data || response);
      } catch (err) {
        setError(err.message || 'Failed to fetch party details');
      } finally {
        setLoading(false);
      }
    };
    fetchParty();
  }, [id, dispatch]);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-slate-600 mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading party details...</p>
        </div>
      </div>
    );
  }

  if (error || !party) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-12 text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-6 rounded-lg bg-red-600 flex items-center justify-center shadow-lg">
            <HiBuildingOffice2 className="text-white text-xl" />
          </div>
          <h3 className="text-xl font-semibold text-slate-800 mb-2">
            Party Not Found
          </h3>
          <p className="text-slate-600 mb-6">
            {error || 'The requested party could not be found'}
          </p>
          <button
            onClick={() => navigate('/cprospect')}
            className="px-6 py-3 rounded-lg font-semibold text-white bg-slate-700 hover:bg-slate-800 transition-all duration-300 shadow-lg"
          >
            Back to Prospects
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-3 sm:p-4 lg:p-6 pt-6 sm:pt-8 lg:pt-12 pb-6 sm:pb-8 lg:pb-12">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3 sm:gap-4">
                <button
                  onClick={() => navigate('/cprospect')}
                  className="p-2 sm:p-3 rounded-lg bg-slate-700 text-white hover:bg-slate-800 transition-all duration-300 hover:shadow-lg"
                >
                  <HiArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-2 sm:p-3 rounded-lg bg-slate-700 shadow-lg">
                    <HiBuildingOffice2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div className="min-w-0">
                    <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-800 truncate">
                      {party.companyName}
                    </h1>
                    <p className="text-slate-600 text-sm sm:text-base hidden sm:block">
                      Party Details & Information
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                <span
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold shadow-lg inline-flex items-center ${
                    party.status
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-red-100 text-red-800 border border-red-200'
                  }`}
                >
                  {party.status ? (
                    <>
                      <HiCheckBadge className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                      Active
                    </>
                  ) : (
                    <>
                      <HiXCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                      Inactive
                    </>
                  )}
                </span>
                <Link
                  to={`/edit-party/${party.id}`}
                  className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold text-white bg-slate-700 hover:bg-slate-800 transition-all duration-300 hover:shadow-xl shadow-lg text-center text-sm sm:text-base"
                >
                  <HiPencil className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 inline" />
                  Edit Party
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Party Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 sm:p-6 lg:p-8">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <div className="p-2 sm:p-3 rounded-lg bg-slate-700 shadow-lg">
                <HiBuildingOffice2 className="text-white w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-800">
                Basic Information
              </h2>
            </div>

            <div className="space-y-4 sm:space-y-6">
              <div>
                <label className="flex items-center text-xs sm:text-sm font-semibold text-slate-600 mb-2">
                  <HiBuildingOffice2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-slate-600" />
                  Company Name
                </label>
                <p className="text-base sm:text-lg font-semibold text-slate-800 bg-gray-50 rounded-lg p-2 sm:p-3 break-words">
                  {party.companyName}
                </p>
              </div>

              <div>
                <label className="flex items-center text-xs sm:text-sm font-semibold text-slate-600 mb-2">
                  <HiTag className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-slate-600" />
                  Role
                </label>
                <span className="inline-flex px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold bg-slate-700 text-white shadow-lg">
                  {party.role}
                </span>
              </div>

              <div>
                <label className="flex items-center text-xs sm:text-sm font-semibold text-slate-600 mb-2">
                  <HiUser className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-slate-600" />
                  Contact Person
                </label>
                <p className="text-sm sm:text-base text-slate-800 font-medium bg-gray-50 rounded-lg p-2 sm:p-3 break-words">
                  {party.contactPerson}
                </p>
              </div>

              {party.gstNumber && (
                <div>
                  <label className="flex items-center text-xs sm:text-sm font-semibold text-slate-600 mb-2">
                    <HiDocumentText className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-slate-600" />
                    GST Number
                  </label>
                  <p className="text-sm sm:text-base text-slate-800 font-medium bg-gray-50 rounded-lg p-2 sm:p-3">
                    {party.gstNumber}
                  </p>
                </div>
              )}

              {party.currency && (
                <div>
                  <label className="flex items-center text-xs sm:text-sm font-semibold text-slate-600 mb-2">
                    <HiGlobeAlt className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-slate-600" />
                    Currency
                  </label>
                  <p className="text-sm sm:text-base text-slate-800 font-medium bg-gray-50 rounded-lg p-2 sm:p-3">
                    {party.currency}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 sm:p-6 lg:p-8">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <div className="p-2 sm:p-3 rounded-lg bg-slate-700 shadow-lg">
                <HiPhone className="text-white w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-800">
                Contact Information
              </h2>
            </div>

            <div className="space-y-4 sm:space-y-6">
              <div>
                <label className="flex items-center text-xs sm:text-sm font-semibold text-slate-600 mb-2">
                  <HiEnvelope className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-slate-600" />
                  Email Address
                </label>
                <p className="text-sm sm:text-base text-slate-800 font-medium break-all bg-gray-50 rounded-lg p-2 sm:p-3">
                  {party.email}
                </p>
              </div>

              <div>
                <label className="flex items-center text-xs sm:text-sm font-semibold text-slate-600 mb-2">
                  <HiPhone className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-slate-600" />
                  Phone Number
                </label>
                <p className="text-sm sm:text-base text-slate-800 font-medium bg-gray-50 rounded-lg p-2 sm:p-3">
                  {party.phone}
                </p>
              </div>

              <div>
                <label className="flex items-center text-xs sm:text-sm font-semibold text-slate-600 mb-2">
                  <HiMapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-slate-600" />
                  Address
                </label>
                <p className="text-sm sm:text-base text-slate-800 font-medium bg-gray-50 rounded-lg p-2 sm:p-3 break-words">
                  {party.address}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="flex items-center text-xs sm:text-sm font-semibold text-slate-600 mb-2">
                    <HiMapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-slate-600" />
                    City
                  </label>
                  <p className="text-sm sm:text-base text-slate-800 font-medium bg-gray-50 rounded-lg p-2 sm:p-3">
                    {party.city}
                  </p>
                </div>
                <div>
                  <label className="flex items-center text-xs sm:text-sm font-semibold text-slate-600 mb-2">
                    <HiMapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-slate-600" />
                    Pincode
                  </label>
                  <p className="text-sm sm:text-base text-slate-800 font-medium bg-gray-50 rounded-lg p-2 sm:p-3">
                    {party.pincode}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="flex items-center text-xs sm:text-sm font-semibold text-slate-600 mb-2">
                    <HiMapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-slate-600" />
                    State
                  </label>
                  <p className="text-sm sm:text-base text-slate-800 font-medium bg-gray-50 rounded-lg p-2 sm:p-3">
                    {party.state}
                  </p>
                </div>
                <div>
                  <label className="flex items-center text-xs sm:text-sm font-semibold text-slate-600 mb-2">
                    <HiGlobeAlt className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-slate-600" />
                    Country
                  </label>
                  <p className="text-sm sm:text-base text-slate-800 font-medium bg-gray-50 rounded-lg p-2 sm:p-3">
                    {party.country}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          {(party.tags || party.notes) && (
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 sm:p-6 lg:p-8">
                <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                  <div className="p-2 sm:p-3 rounded-lg bg-slate-700 shadow-lg">
                    <HiDocumentText className="text-white w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-800">
                    Additional Information
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {party.tags && (
                    <div>
                      <label className="flex items-center text-xs sm:text-sm font-semibold text-slate-600 mb-2 sm:mb-3">
                        <HiTag className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-slate-600" />
                        Tags
                      </label>
                      <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        {party.tags.split(',').map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm font-medium bg-slate-700 text-white shadow-lg"
                          >
                            {tag.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {party.notes && (
                    <div className={party.tags ? '' : 'md:col-span-2'}>
                      <label className="flex items-center text-xs sm:text-sm font-semibold text-slate-600 mb-2 sm:mb-3">
                        <HiDocumentText className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-slate-600" />
                        Notes
                      </label>
                      <div className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200">
                        <p className="text-sm sm:text-base text-slate-800 leading-relaxed break-words">
                          {party.notes}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewParty;
