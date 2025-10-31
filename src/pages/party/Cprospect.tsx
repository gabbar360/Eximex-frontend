import React, { useState, useEffect, useMemo } from 'react';
import { fetchParties, deleteParty } from '../../features/partySlice';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom'; // ✅ Correct import
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faEye, faTrash } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';

const Cprospect = () => {
  const dispatch = useDispatch();
  const [parties, setParties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmDelete, setConfirmDelete] = useState(null);
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

  const handleDeleteClick = (id) => {
    setConfirmDelete(id);
  };

  const handleConfirmDelete = async () => {
    if (!confirmDelete) return;

    try {
      const response = await dispatch(deleteParty(confirmDelete)).unwrap();
      setParties((prev) => prev.filter((p) => p.id !== confirmDelete));
      setConfirmDelete(null);

      // Use backend response message
      const message = response?.message || 'Party deleted successfully';
      toast.success(message);
    } catch (err) {
      const errorMessage = err.message || 'Failed to delete party';
      setError(errorMessage);
      toast.error(errorMessage);
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
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-title-md2 font-bold text-black dark:text-white">
          Customer Prospects
        </h2>
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search prospects..."
              className="w-full rounded-lg border border-stroke bg-white dark:bg-gray-800 px-4 py-2 pl-9 text-sm focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-boxdark dark:focus:border-primary dark:text-white"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
            <span className="absolute left-3 top-2.5 text-gray-500 dark:text-gray-500">
              <svg
                className="fill-current"
                width="16"
                height="16"
                viewBox="0 0 16 16"
              >
                <path
                  d="M10.7 11.5L14 14.8M12.5 7C12.5 9.76142 10.2614 12 7.5 12C4.73858 12 2.5 9.76142 2.5 7C2.5 4.23858 4.73858 2 7.5 2C10.2614 2 12.5 4.23858 12.5 7Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </div>
          <Link
            to="/add-party"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-black hover:bg-opacity-90 dark:text-white"
          >
            <svg className="mr-2" width="16" height="16" viewBox="0 0 16 16">
              <path
                d="M8 3.33331V12.6666M3.33337 7.99998H12.6667"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Add Prospect
          </Link>
        </div>
      </div>

      {/* Cards */}
      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-gray-900">
        {filteredParties.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg dark:text-gray-400">
              No prospects found
            </div>
            <p className="text-gray-400 mt-2 dark:text-gray-500">
              Add your first prospect to get started
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 p-5">
            {currentParties.map((party) => (
              <div
                key={party.id}
                className="rounded-lg border border-stroke bg-white dark:bg-gray-900 p-5 shadow-sm transition-all hover:shadow-md dark:border-strokedark dark:bg-meta-4"
              >
                <div className="flex items-center justify-between mb-4">
                  <h5 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                    {party.companyName}
                  </h5>
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                      party.status
                        ? 'bg-success bg-opacity-10 text-success dark:bg-success/20 dark:text-green-400'
                        : 'bg-danger bg-opacity-10 text-danger dark:bg-danger/20 dark:text-red-400'
                    }`}
                  >
                    {party.status ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center">
                    <span className="text-gray-600 dark:text-gray-400 w-24">
                      Role:
                    </span>
                    <span className="text-gray-800 dark:text-gray-100">
                      {party.role}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-600 dark:text-gray-400 w-24">
                      Contact:
                    </span>
                    <span className="text-gray-800 dark:text-gray-100">
                      {party.contactPerson}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-600 dark:text-gray-400 w-24">
                      Email:
                    </span>
                    <span className="text-gray-800 dark:text-gray-100 truncate">
                      {party.email}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-600 dark:text-gray-400 w-24">
                      Phone:
                    </span>
                    <span className="text-gray-800 dark:text-gray-100">
                      {party.phone}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-600 dark:text-gray-400 w-24">
                      Location:
                    </span>
                    <span className="text-gray-800 dark:text-gray-100 truncate">
                      {[party.city, party.state, party.country]
                        .filter(Boolean)
                        .join(', ')}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-end space-x-3.5 mt-5 pt-4 border-t border-stroke dark:border-strokedark">
                  <Link
                    to={`/view-party/${party.id}`}
                    className="hover:text-primary text-gray-700 dark:text-gray-300"
                  >
                    <FontAwesomeIcon
                      icon={faEye}
                      className="w-3 h-3 text-blue-600 hover:text-blue-800"
                    />
                  </Link>
                  <Link
                    to={`/edit-party/${party.id}`}
                    className="hover:text-primary text-gray-700 dark:text-gray-300"
                  >
                    <FontAwesomeIcon
                      icon={faEdit}
                      className="text-green-600 hover:text-green-800"
                    />
                  </Link>
                  <button
                    onClick={() => handleDeleteClick(party.id)}
                    className="hover:text-primary text-gray-700 dark:text-gray-300"
                  >
                    <FontAwesomeIcon
                      icon={faTrash}
                      className="text-red-600 hover:text-red-800"
                    />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center py-6">
            <nav className="flex space-x-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded-md bg-white border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:bg-boxdark dark:border-strokedark dark:text-gray-300 dark:hover:bg-meta-4"
              >
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (num) => (
                  <button
                    key={num}
                    onClick={() => setCurrentPage(num)}
                    className={`px-3 py-1 rounded-md text-sm font-medium ${
                      currentPage === num
                        ? 'bg-primary text-white'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-boxdark dark:border-strokedark dark:text-gray-300 dark:hover:bg-meta-4'
                    }`}
                  >
                    {num}
                  </button>
                )
              )}

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded-md bg-white border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:bg-boxdark dark:border-strokedark dark:text-gray-300 dark:hover:bg-meta-4"
              >
                Next
              </button>
            </nav>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-black dark:text-white">
              Confirm Delete
            </h3>
            <p className="mb-6 text-gray-600 dark:text-gray-400">
              Are you sure you want to delete this prospect? This action cannot
              be undone.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setConfirmDelete(null)}
                className="rounded-md bg-gray-200 py-2 px-4 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="rounded-md bg-red-500 py-2 px-4 text-white hover:bg-red-600"
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
