import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchPartyById } from '../../features/partySlice';
import { useDispatch } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faEdit } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';

const ViewParty = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [party, setParty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchParty = async () => {
      try {
        const response = await getPartyById(id);
        setParty(response?.data);
      } catch (err) {
        setError(err.message || 'Failed to fetch party details');
      } finally {
        setLoading(false);
      }
    };
    fetchParty();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !party) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 text-lg">{error || 'Party not found'}</div>
        <button
          onClick={() => navigate('/cprospect')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Back to Prospects
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl p-4 md:p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/cprospect')}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
          <h2 className="text-2xl font-bold text-black dark:text-white">
            View Customer Prospect
          </h2>
        </div>
        <Link
          to={`/edit-party/${party.id}`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <FontAwesomeIcon icon={faEdit} />
          Edit
        </Link>
      </div>

      {/* Party Details Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              Company Name
            </label>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {party.companyName}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              Status
            </label>
            <span
              className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
                party.status
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                  : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
              }`}
            >
              {party.status ? 'Active' : 'Inactive'}
            </span>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              Role
            </label>
            <p className="text-gray-900 dark:text-white">{party.role}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              Contact Person
            </label>
            <p className="text-gray-900 dark:text-white">
              {party.contactPerson}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              Email
            </label>
            <p className="text-gray-900 dark:text-white">{party.email}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              Phone
            </label>
            <p className="text-gray-900 dark:text-white">{party.phone}</p>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              Address
            </label>
            <p className="text-gray-900 dark:text-white">{party.address}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              City
            </label>
            <p className="text-gray-900 dark:text-white">{party.city}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              State
            </label>
            <p className="text-gray-900 dark:text-white">{party.state}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              Country
            </label>
            <p className="text-gray-900 dark:text-white">{party.country}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              Pincode
            </label>
            <p className="text-gray-900 dark:text-white">{party.pincode}</p>
          </div>

          {party.gstNumber && (
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                GST Number
              </label>
              <p className="text-gray-900 dark:text-white">{party.gstNumber}</p>
            </div>
          )}

          {party.currency && (
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                Currency
              </label>
              <p className="text-gray-900 dark:text-white">{party.currency}</p>
            </div>
          )}

          {party.notes && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                Notes
              </label>
              <p className="text-gray-900 dark:text-white">{party.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewParty;
