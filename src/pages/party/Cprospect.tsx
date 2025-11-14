import React, { useState, useEffect, useMemo } from 'react';
import { fetchParties, deleteParty } from '../../features/partySlice';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { HiEye, HiPencil, HiTrash, HiPlus, HiMagnifyingGlass, HiBuildingOffice2, HiUsers } from 'react-icons/hi2';
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
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-slate-600 mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading prospects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-2 lg:p-4">
        {/* Header */}
        <div className="mb-3">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 lg:p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-slate-700 shadow-lg">
                  <HiUsers className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 mb-1">
                    Customer Prospects
                  </h1>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <HiMagnifyingGlass className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search prospects..."
                    className="pl-12 pr-4 py-3 w-full sm:w-72 rounded-lg border border-gray-300 bg-white focus:border-slate-500 focus:ring-2 focus:ring-slate-200 transition-all duration-300 text-sm placeholder-gray-500 shadow-sm"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </div>
                
                <Link
                  to="/add-party"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-semibold text-white bg-slate-700 hover:bg-slate-800 shadow-lg"
                >
                  <HiPlus className="w-5 h-5 mr-2" />
                  Add Prospect
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Cards Grid */}
        {filteredParties.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-lg bg-slate-700 flex items-center justify-center shadow-lg">
              <HiMagnifyingGlass className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">No prospects found</h3>
            <p className="text-slate-600 mb-6">Add your first prospect to get started</p>
            <Link
              to="/add-party"
              className="inline-flex items-center px-6 py-3 rounded-lg font-semibold text-white bg-slate-700 hover:bg-slate-800 shadow-lg"
            >
              <HiPlus className="w-5 h-5 mr-2" />
              Add First Prospect
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 lg:gap-6">
            {currentParties.map((party) => (
              <div
                key={party.id}
                className="group bg-white rounded-lg border border-gray-200 shadow-sm p-6 transition-all duration-300 hover:shadow-lg hover:border-gray-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="p-2 rounded-lg bg-slate-700 shadow-md flex-shrink-0">
                      <HiBuildingOffice2 className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-slate-800 mb-1 truncate group-hover:text-slate-600 transition-colors" title={party.companyName}>
                        {party.companyName}
                      </h3>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3 mb-2">
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
                  <div className="flex items-center text-sm">
                    <span className="font-medium text-slate-500 w-16 text-xs">Status:</span>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full shadow-sm ${
                      party.status 
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                        : 'bg-red-100 text-red-800 border border-red-200'
                    }`}>
                      {party.status ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-center space-x-2 pt-2 border-t border-gray-200">
                  <Link
                    to={`/view-party/${party.id}`}
                    className="p-2.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-600 transition-all duration-300 hover:shadow-lg"
                  >
                    <HiEye className="w-4 h-4" />
                  </Link>
                  <Link
                    to={`/edit-party/${party.id}`}
                    className="p-2.5 rounded-lg text-slate-500 hover:text-white hover:bg-emerald-600 hover:shadow-lg"
                  >
                    <HiPencil className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => handleDeleteClick(party.id)}
                    className="p-2.5 rounded-lg text-slate-500 hover:text-white hover:bg-red-600 transition-all duration-300 hover:shadow-lg"
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
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mt-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-600">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredParties.length)} of {filteredParties.length} prospects
              </p>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-slate-600 hover:bg-slate-700 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-lg"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                      currentPage === page
                        ? 'bg-slate-700 text-white font-semibold shadow-lg'
                        : 'text-slate-600 hover:bg-slate-700 hover:text-white hover:shadow-lg'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-slate-600 hover:bg-slate-700 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-lg"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>



      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-8 border border-gray-200">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-lg bg-red-600 flex items-center justify-center shadow-lg">
                <HiTrash className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Delete Prospect</h3>
              <p className="text-slate-600">Are you sure you want to delete this prospect? This action cannot be undone.</p>
            </div>
            <div className="flex items-center justify-center space-x-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-6 py-3 rounded-lg border border-gray-300 text-slate-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-6 py-3 rounded-lg bg-red-600 text-white hover:bg-red-700 shadow-lg"
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