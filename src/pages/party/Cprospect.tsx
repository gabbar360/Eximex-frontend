import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  fetchParties,
  deleteParty,
  updatePartyStage,
} from '../../features/partySlice';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import PageMeta from '../../components/common/PageMeta';
import {
  HiEye,
  HiPencil,
  HiTrash,
  HiPlus,
  HiMagnifyingGlass,
  HiBuildingOffice2,
  HiUsers,
  HiPhone,
  HiEllipsisVertical,
  HiChevronDown,
  HiSparkles,
  HiStar,
  HiCheckCircle,
  HiChatBubbleLeftRight,
  HiDocumentText,
  HiTrophy,
  HiXCircle,
} from 'react-icons/hi2';
import { MdBadge } from 'react-icons/md';
import { toast } from 'react-toastify';
import { useDebounce } from '../../utils/useDebounce';
import { Pagination } from 'antd';

const Cprospect = () => {
  const dispatch = useDispatch();
  const {
    parties = [],
    loading = false,
    pagination = {},
  } = useSelector((state: any) => state.party || {});
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [wasSearching, setWasSearching] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [stageDropdowns, setStageDropdowns] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Stage options with icons
  const stageOptions = [
    { value: 'NEW', label: 'New Leads', icon: HiStar, color: 'text-blue-500' },
    {
      value: 'QUALIFIED',
      label: 'Qualified',
      icon: HiCheckCircle,
      color: 'text-green-500',
    },
    {
      value: 'NEGOTIATION',
      label: 'Negotiation',
      icon: HiChatBubbleLeftRight,
      color: 'text-orange-500',
    },
    {
      value: 'QUOTATION_SENT',
      label: 'Quotation Sent',
      icon: HiDocumentText,
      color: 'text-purple-500',
    },
    { value: 'WON', label: 'Won', icon: HiTrophy, color: 'text-emerald-500' },
    { value: 'LOST', label: 'Lost', icon: HiXCircle, color: 'text-red-500' },
  ];

  console.log('Stage options:', stageOptions);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openDropdown && !event.target.closest('.dropdown-container')) {
        setOpenDropdown(null);
      }
      if (!event.target.closest('.stage-dropdown')) {
        setStageDropdowns({});
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openDropdown]);

  // Load data
  useEffect(() => {
    const params = {
      search: searchTerm,
      page: currentPage,
      limit: pageSize,
    };
    dispatch(fetchParties(params));
  }, [dispatch, searchTerm, currentPage, pageSize]);

  const handleDeleteClick = (id) => {
    setConfirmDelete(id);
  };

  const handleConfirmDelete = async () => {
    if (!confirmDelete) return;

    try {
      const response = await dispatch(deleteParty(confirmDelete)).unwrap();
      setConfirmDelete(null);

      const params = {
        search: searchTerm,
        page: currentPage,
        limit: pageSize,
      };
      dispatch(fetchParties(params));

      const message = response?.message || 'Contact deleted successfully';
      toast.success(message);
    } catch (err) {
      setConfirmDelete(null);
      toast.error(err);
    }
  };

  // Debounced search function
  const { debouncedCallback: debouncedSearch } = useDebounce((value) => {
    setWasSearching(true);
    const params = {
      search: value,
      page: 1,
      limit: pageSize,
    };
    setCurrentPage(1);
    dispatch(fetchParties(params));
  }, 500);

  const handleSearch = useCallback(
    (value) => {
      setSearchTerm(value);
      debouncedSearch(value);
    },
    [debouncedSearch]
  );

  // Restore focus after search results load
  useEffect(() => {
    if (wasSearching && !loading && searchInputRef.current) {
      searchInputRef.current.focus();
      setWasSearching(false);
    }
  }, [loading, wasSearching]);

  const handleStageChange = async (contactId, newStage) => {
    try {
      const response = await dispatch(
        updatePartyStage({ id: contactId, stage: newStage })
      ).unwrap();
      toast.success(response?.message || 'Stage updated successfully');
      setStageDropdowns({});
    } catch (error) {
      toast.error(error || 'Failed to update stage');
    }
  };

  return (
    <>
      <PageMeta
        title="Contact - EximEx | Lead Management"
        description="Manage your contacts and leads for import-export business. Track potential clients and business opportunities with EximEx CRM."
      />
      <div className="min-h-screen bg-gray-50">
        <div className="p-2 lg:p-4">
          {/* Header */}
          <div className="mb-3">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-3 lg:p-4">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-slate-700 shadow-lg">
                    <HiUsers className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 mb-1">
                      Contacts
                    </h1>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1 sm:flex-none">
                    <HiMagnifyingGlass className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Search contacts..."
                      className="pl-12 pr-4 py-3 w-full sm:w-72 rounded-lg border border-gray-300 bg-white focus:border-slate-500 focus:ring-2 focus:ring-slate-200 transition-all duration-300 text-sm placeholder-gray-500 shadow-sm"
                      value={searchTerm}
                      onChange={(e) => handleSearch(e.target.value)}
                    />
                  </div>

                  <Link
                    to="/add-contact"
                    className="inline-flex items-center justify-center px-4 sm:px-6 py-3 rounded-lg font-semibold text-white bg-slate-700 hover:bg-slate-800 shadow-lg text-sm sm:text-base whitespace-nowrap"
                  >
                    <HiPlus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    <span className="hidden xs:inline">Add Contact</span>
                    <span className="xs:hidden">Add Contact</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Contacts List */}
          {loading ? (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-slate-600 mx-auto mb-4"></div>
              <p className="text-slate-600 font-medium">Loading contacts...</p>
            </div>
          ) : parties.length === 0 ? (
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/30 p-12 text-center">
              <div className="w-10 h-10 mx-auto mb-6 rounded-2xl bg-gradient-to-r from-slate-600 to-slate-700 flex items-center justify-center shadow-lg">
                <HiMagnifyingGlass className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">
                No contacts found
              </h3>
              <p className="text-slate-600 mb-6">
                {searchTerm
                  ? 'Try a different search term.'
                  : 'Add your first contact to get started'}
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="bg-gray-50 border-b border-gray-200 p-4 text-left">
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                          <HiBuildingOffice2 className="w-4 h-4 text-slate-600" />
                          <span>Company</span>
                        </div>
                      </th>

                      <th className="bg-gray-50 border-b border-gray-200 p-4 text-left">
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                          <HiPhone className="w-4 h-4 text-slate-600" />
                          <span>Phone</span>
                        </div>
                      </th>
                      <th className="bg-gray-50 border-b border-gray-200 p-4 text-left">
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                          <MdBadge className="w-4 h-4 text-slate-600" />
                          <span>Role</span>
                        </div>
                      </th>
                      <th className="bg-gray-50 border-b border-gray-200 p-4 text-left">
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                          <HiChevronDown className="w-4 h-4 text-slate-600" />
                          <span>Stage</span>
                        </div>
                      </th>
                      <th className="bg-gray-50 border-b border-gray-200 p-4 text-left">
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                          <span className="w-2 h-2 rounded-full bg-slate-600"></span>
                          <span>Status</span>
                        </div>
                      </th>
                      <th className="bg-gray-50 border-b border-gray-200 p-4 text-right">
                        <div className="flex items-center justify-end gap-2 text-sm font-semibold text-slate-700">
                          <HiSparkles className="w-4 h-4 text-slate-600" />
                          <span>Actions</span>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {parties.map((contact) => {
                      return (
                        <tr
                          key={contact.id}
                          className="hover:bg-gray-50 transition-colors"
                          data-contact-id={contact.id}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 w-10 h-10">
                                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                                  <HiBuildingOffice2 className="w-5 h-5 text-slate-600" />
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-semibold text-slate-900">
                                  {contact.companyName?.length > 12
                                    ? `${contact.companyName.substring(0, 12)}...`
                                    : contact.companyName}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-slate-900">
                              {contact.phone || '-'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                              {contact.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {contact.role?.toLowerCase() === 'customer' ? (
                              <div className="relative stage-dropdown">
                                <button
                                  onClick={() =>
                                    setStageDropdowns((prev) => ({
                                      ...prev,
                                      [contact.id]: !prev[contact.id],
                                    }))
                                  }
                                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
                                >
                                  {(() => {
                                    const currentStage = stageOptions.find(
                                      (s) =>
                                        s.value === (contact.stage || 'NEW')
                                    );
                                    const IconComponent =
                                      currentStage?.icon || HiStar;
                                    return (
                                      <>
                                        <IconComponent
                                          className={`w-4 h-4 ${currentStage?.color || 'text-blue-500'}`}
                                        />
                                        <span>
                                          {currentStage?.label || 'New Leads'}
                                        </span>
                                      </>
                                    );
                                  })()}
                                  <HiChevronDown
                                    className={`w-4 h-4 transition-transform ${
                                      stageDropdowns[contact.id]
                                        ? 'rotate-180'
                                        : ''
                                    }`}
                                  />
                                </button>

                                {stageDropdowns[contact.id] && (
                                  <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[160px]">
                                    {stageOptions.map((stage) => {
                                      const IconComponent = stage.icon;
                                      return (
                                        <button
                                          key={stage.value}
                                          onClick={() =>
                                            handleStageChange(
                                              contact.id,
                                              stage.value
                                            )
                                          }
                                          className={`flex items-center gap-2 w-full text-left px-3 py-2 text-sm hover:bg-slate-50 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                                            (contact.stage || 'NEW') ===
                                            stage.value
                                              ? 'bg-slate-100 text-slate-900 font-medium'
                                              : 'text-slate-700'
                                          }`}
                                        >
                                          <IconComponent
                                            className={`w-4 h-4 ${stage.color}`}
                                          />
                                          <span>{stage.label}</span>
                                        </button>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="text-sm text-slate-500">-</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                contact.status
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                                  contact.status
                                    ? 'bg-emerald-500'
                                    : 'bg-red-500'
                                }`}
                              ></span>
                              {contact.status ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="relative dropdown-container">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenDropdown(
                                    openDropdown === contact.id
                                      ? null
                                      : contact.id
                                  );
                                }}
                                className="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-100 transition-colors"
                              >
                                <HiEllipsisVertical className="w-5 h-5" />
                              </button>

                              {openDropdown === contact.id && (
                                <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 w-48">
                                  <Link
                                    to={`/view-party/${contact.id}`}
                                    className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                                    onClick={() => setOpenDropdown(null)}
                                  >
                                    <HiEye className="w-4 h-4 text-slate-500" />
                                    <span>View Details</span>
                                  </Link>
                                  <Link
                                    to={`/edit-contact/${contact.id}`}
                                    className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                                    onClick={() => setOpenDropdown(null)}
                                  >
                                    <HiPencil className="w-4 h-4 text-slate-500" />
                                    <span>Edit Contact</span>
                                  </Link>
                                  <button
                                    onClick={() => {
                                      setOpenDropdown(null);
                                      handleDeleteClick(contact.id);
                                    }}
                                    className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left transition-colors"
                                  >
                                    <HiTrash className="w-4 h-4" />
                                    <span>Delete</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Simple Pagination */}
          {pagination?.total > 0 && (
            <div className="flex justify-center mt-6">
              <Pagination
                current={currentPage}
                total={pagination.total}
                pageSize={pageSize}
                onChange={(page) => {
                  setCurrentPage(page);
                  const params = {
                    search: searchTerm,
                    page: page,
                    limit: pageSize,
                  };
                  dispatch(fetchParties(params));
                }}
              />
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {confirmDelete && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-60 p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-8 border border-gray-200">
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-lg bg-red-600 flex items-center justify-center shadow-lg">
                  <HiTrash className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">
                  Delete Prospect
                </h3>
                <p className="text-slate-600">
                  Are you sure you want to delete this prospect? This action
                  cannot be undone.
                </p>
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
    </>
  );
};

export default Cprospect;
