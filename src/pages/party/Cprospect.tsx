import React, { useState, useEffect, useCallback, useRef } from 'react';
import { fetchParties, deleteParty } from '../../features/partySlice';
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
  HiExclamationTriangle,
  HiEllipsisVertical,
  HiChevronDown,
  HiSparkles,
  HiCheckBadge,
  HiChatBubbleLeftRight,
  HiDocumentText,
  HiTrophy,
  HiXCircle,
} from 'react-icons/hi2';
import { toast } from 'react-toastify';
import { Pagination } from 'antd';
import { useDebounce } from '../../utils/useDebounce';
import partyService from '../../service/partyService';

const Cprospect = () => {
  const dispatch = useDispatch();
  const {
    parties = [],
    loading = false,
    error = null,
    pagination = {},
  } = useSelector((state) => state.party || {});
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [wasSearching, setWasSearching] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [openStageDropdown, setOpenStageDropdown] = useState(null);
  const [filterRole, setFilterRole] = useState('');
  
  // Check if there are any Customer contacts to show Stage column
  const hasCustomers = parties && parties.some(party => party.role === 'Customer');

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const target = event.target;
      if (openDropdown && !target.closest('.dropdown-container')) {
        setOpenDropdown(null);
      }
      if (openStageDropdown && !target.closest('.stage-dropdown-container')) {
        setOpenStageDropdown(null);
      }
    };

    if (openDropdown || openStageDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdown, openStageDropdown]);

  // Stage dropdown data and logic
  const stages = [
    { value: 'NEW', label: 'New', color: 'bg-gray-50 text-gray-600 border-gray-200', icon: HiSparkles, iconColor: 'text-gray-500' },
    { value: 'QUALIFIED', label: 'Qualified', color: 'bg-blue-50 text-blue-600 border-blue-200', icon: HiCheckBadge, iconColor: 'text-blue-500' },
    { value: 'NEGOTIATION', label: 'Negotiation', color: 'bg-yellow-50 text-yellow-600 border-yellow-200', icon: HiChatBubbleLeftRight, iconColor: 'text-yellow-500' },
    { value: 'QUOTATION_SENT', label: 'Quotation Sent', color: 'bg-purple-50 text-purple-600 border-purple-200', icon: HiDocumentText, iconColor: 'text-purple-500' },
    { value: 'WON', label: 'Won', color: 'bg-emerald-50 text-emerald-600 border-emerald-200', icon: HiTrophy, iconColor: 'text-emerald-500' },
    { value: 'LOST', label: 'Lost', color: 'bg-red-50 text-red-600 border-red-200', icon: HiXCircle, iconColor: 'text-red-500' },
  ];

  const getStageData = (stage) => {
    return stages.find(s => s.value === stage) || stages[0];
  };

  const handleStageSelect = async (partyId, newStage) => {
    setOpenStageDropdown(null);
    try {
      await partyService.updatePartyStage(partyId, newStage);
      
      // Reload current page data after stage update
      dispatch(
        fetchParties({
          page: currentPage,
          limit: pageSize,
          search: searchTerm,
          role: filterRole,
        })
      );
      
      toast.success('Stage updated successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to update stage');
    }
  };

  useEffect(() => {
    // Only fetch when page or pageSize changes, not searchTerm (handled by debounced search)
    dispatch(
      fetchParties({
        page: currentPage,
        limit: pageSize,
        search: '',
        role: filterRole,
      })
    );
  }, [dispatch, currentPage, pageSize, filterRole]);

  // Initial load
  useEffect(() => {
    dispatch(
      fetchParties({
        page: 1,
        limit: 10,
        search: '',
        role: filterRole,
      })
    );
  }, [dispatch, filterRole]);

  const handleDeleteClick = (id) => {
    setConfirmDelete(id);
  };

  const handleConfirmDelete = async () => {
    if (!confirmDelete) return;

    try {
      const response = await dispatch(deleteParty(confirmDelete)).unwrap();
      setConfirmDelete(null);

      // Reload current page data after deletion
      dispatch(
        fetchParties({
          page: currentPage,
          limit: pageSize,
          search: searchTerm,
          role: filterRole,
        })
      );

      const message = response?.message || 'Contact deleted successfully';
      toast.success(message);
    } catch (err) {
      setConfirmDelete(null);
      toast.error(err);
    }
  };



  const handlePageChange = (page, size) => {
    setCurrentPage(page);
    if (size !== pageSize) {
      setPageSize(size);
      setCurrentPage(1); // Reset to first page when changing page size
    }
  };

  // Debounced search function
  const { debouncedCallback: debouncedSearch } = useDebounce((value) => {
    setWasSearching(true);
    dispatch(
      fetchParties({
        page: 1,
        limit: pageSize,
        search: value,
        role: filterRole,
      })
    );
  }, 500);

  const handleSearch = useCallback(
    (value) => {
      setSearchTerm(value);
      setCurrentPage(1);
      debouncedSearch(value);
    },
    [debouncedSearch, pageSize]
  );

  // Restore focus after search results load
  useEffect(() => {
    if (wasSearching && !loading && searchInputRef.current) {
      searchInputRef.current.focus();
      setWasSearching(false);
    }
  }, [loading, wasSearching]);


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
                  <div className="relative">
                    <HiMagnifyingGlass className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Search prospects..."
                      className="pl-12 pr-4 py-3 w-full sm:w-72 rounded-lg border border-gray-300 bg-white focus:border-slate-500 focus:ring-2 focus:ring-slate-200 transition-all duration-300 text-sm placeholder-gray-500 shadow-sm"
                      value={searchTerm}
                      onChange={(e) => handleSearch(e.target.value)}
                    />
                  </div>

                  <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="px-3 py-2 w-full sm:w-36 rounded-lg border border-gray-300 bg-white focus:border-slate-500 focus:ring-2 focus:ring-slate-200 transition-all duration-300 text-sm shadow-sm"
                  >
                    <option value="">All Roles</option>
                    <option value="Customer">Customer</option>
                    <option value="Supplier">Supplier</option>
                    <option value="Vendor">Vendor</option>
                  </select>



                  <Link
                    to="/add-contact"
                    className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-semibold text-white bg-slate-700 hover:bg-slate-800 shadow-lg"
                  >
                    <HiPlus className="w-5 h-5 mr-2" />
                    Add Contact
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Contacts List */}
          {loading ? (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-slate-600 mx-auto mb-4"></div>
              <p className="text-slate-600 font-medium">
                Loading contacts...
              </p>
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
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-visible">
              {/* Desktop Table View */}
              <div className="hidden lg:block">
                {/* Table Header */}
                <div className="bg-gray-50 border-b border-gray-200 p-4">
                  <div
                    className="grid gap-2 text-sm font-semibold text-slate-700"
                    style={{
                      gridTemplateColumns: hasCustomers
                        ? '2fr 1.5fr 1fr 1fr 1fr 0.8fr 0.8fr'
                        : '2fr 1.5fr 1fr 1fr 0.8fr 0.8fr',
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <HiBuildingOffice2 className="w-4 h-4 text-slate-600" />
                      <span>Company</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>Email</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>Phone</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>Role</span>
                    </div>
                    {hasCustomers && (
                      <div className="flex items-center gap-2">
                        <span>Stage</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <span>Status</span>
                    </div>
                    <div className="flex items-center justify-end gap-2">
                      <span>Actions</span>
                    </div>
                  </div>
                </div>
                <div className="divide-y divide-white/20">
                  {parties.map((party) => (
                    <div
                      key={party.id}
                      className="p-4 hover:bg-white/50 transition-all duration-300"
                    >
                      <div
                        className="grid gap-2 items-center"
                        style={{
                          gridTemplateColumns: hasCustomers
                            ? '2fr 1.5fr 1fr 1fr 1fr 0.8fr 0.8fr'
                            : '2fr 1.5fr 1fr 1fr 0.8fr 0.8fr',
                        }}
                      >
                        {/* Company */}
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-lg bg-slate-700 shadow-md flex-shrink-0">
                            <HiBuildingOffice2 className="w-4 h-4 text-white" />
                          </div>
                          <span
                            className="text-slate-800 font-medium truncate"
                            title={party.companyName}
                          >
                            {party.companyName}
                          </span>
                        </div>

                        {/* Email */}
                        <div
                          className="text-slate-700 text-sm truncate"
                          title={party.email}
                        >
                          {party.email || '-'}
                        </div>

                        {/* Phone */}
                        <div className="text-slate-700 text-sm">
                          {party.phone || '-'}
                        </div>

                        {/* Role */}
                        <div className="text-slate-700 text-sm font-medium">
                          {party.role}
                        </div>

                        {/* Stage */}
                        {hasCustomers && (
                          <div>
                            {party.role === 'Customer' ? (
                              <div className="relative stage-dropdown-container">
                                {(() => {
                                  const stageData = getStageData(party.stage || 'NEW');
                                  return (
                                    <>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setOpenStageDropdown(
                                            openStageDropdown === party.id ? null : party.id
                                          );
                                        }}
                                        className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border ${stageData.color} hover:opacity-80 transition-all duration-200`}
                                      >
                                        <stageData.icon className={`w-3 h-3 mr-2 ${stageData.iconColor}`} />
                                        {stageData.label}
                                        <HiChevronDown className="ml-1 w-3 h-3" />
                                      </button>

                                      {openStageDropdown === party.id && (
                                        <div className="absolute left-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-[9999] backdrop-blur-sm">
                                          {stages.map((stage) => (
                                            <button
                                              key={stage.value}
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleStageSelect(party.id, stage.value);
                                              }}
                                              className={`flex items-center gap-3 w-full px-4 py-3 text-sm transition-all duration-200 border-b border-gray-50 last:border-b-0 ${
                                                stage.value === (party.stage || 'NEW')
                                                  ? `${stage.color} font-medium` 
                                                  : 'text-slate-700 hover:bg-gray-50'
                                              }`}
                                            >
                                              <stage.icon className={`w-4 h-4 ${stage.iconColor}`} />
                                              <span className="font-medium">{stage.label}</span>
                                            </button>
                                          ))}
                                        </div>
                                      )}
                                    </>
                                  );
                                })()
                                }
                              </div>
                            ) : (
                              <span className="text-slate-500 text-xs">-</span>
                            )}
                          </div>
                        )}

                        {/* Status */}
                        <div>
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
                              party.status
                                ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                                : 'bg-red-50 text-red-600 border-red-200'
                            }`}
                          >
                            {party.status ? 'Active' : 'Inactive'}
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end">
                          <div className="relative dropdown-container">
                            <button
                              data-dropdown-id={party.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenDropdown(
                                  openDropdown === party.id ? null : party.id
                                );
                              }}
                              className="p-2 rounded-lg text-slate-500 hover:bg-gray-100 transition-all duration-300"
                            >
                              <HiEllipsisVertical className="w-5 h-5" />
                            </button>

                            {openDropdown === party.id && (
                              <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-[9999] backdrop-blur-sm">
                                <Link
                                  to={`/view-party/${party.id}`}
                                  className="flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-all duration-200 border-b border-gray-50 last:border-b-0"
                                  onClick={() => setOpenDropdown(null)}
                                >
                                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                                    <HiEye className="w-4 h-4 text-slate-600" />
                                  </div>
                                  <span className="font-medium">
                                    View Details
                                  </span>
                                </Link>
                                <Link
                                  to={`/edit-contact/${party.id}`}
                                  className="flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-emerald-50 transition-all duration-200 border-b border-gray-50 last:border-b-0"
                                  onClick={() => setOpenDropdown(null)}
                                >
                                  <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                                    <HiPencil className="w-4 h-4 text-emerald-600" />
                                  </div>
                                  <span className="font-medium">
                                    Edit Contact
                                  </span>
                                </Link>
                                <button
                                  onClick={() => {
                                    setOpenDropdown(null);
                                    handleDeleteClick(party.id);
                                  }}
                                  className="flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-all duration-200 w-full text-left"
                                >
                                  <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                                    <HiTrash className="w-4 h-4 text-red-600" />
                                  </div>
                                  <span className="font-medium">
                                    Delete Contact
                                  </span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden divide-y divide-white/20">
                {parties.map((party) => (
                  <div key={party.id} className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-slate-700 shadow-md flex-shrink-0">
                          <HiBuildingOffice2 className="w-4 h-4 text-white" />
                        </div>
                        <h3 className="font-semibold text-slate-800">
                          {party.companyName}
                        </h3>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                      <div>
                        <span className="font-medium text-slate-500 text-xs">
                          Email:
                        </span>
                        <div className="text-slate-700 truncate">
                          {party.email || '-'}
                        </div>
                      </div>
                      <div>
                        <span className="font-medium text-slate-500 text-xs">
                          Phone:
                        </span>
                        <div className="text-slate-700">
                          {party.phone || '-'}
                        </div>
                      </div>
                      <div>
                        <span className="font-medium text-slate-500 text-xs">
                          Role:
                        </span>
                        <div className="text-slate-700 font-medium">
                          {party.role}
                        </div>
                      </div>
                      {party.role === 'Customer' && (
                        <div>
                          <span className="font-medium text-slate-500 text-xs">
                            Stage:
                          </span>
                          <div className="relative stage-dropdown-container">
                            {(() => {
                              const stageData = getStageData(party.stage || 'NEW');
                              return (
                                <>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setOpenStageDropdown(
                                        openStageDropdown === party.id ? null : party.id
                                      );
                                    }}
                                    className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border ${stageData.color} hover:opacity-80 transition-all duration-200`}
                                  >
                                    <stageData.icon className={`w-3 h-3 mr-2 ${stageData.iconColor}`} />
                                    {stageData.label}
                                    <HiChevronDown className="ml-1 w-3 h-3" />
                                  </button>

                                  {openStageDropdown === party.id && (
                                    <div className="absolute left-0 bottom-full mb-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-[9999] backdrop-blur-sm">
                                      {stages.map((stage) => (
                                        <button
                                          key={stage.value}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleStageSelect(party.id, stage.value);
                                          }}
                                          className={`flex items-center gap-3 w-full px-4 py-3 text-sm transition-all duration-200 border-b border-gray-50 last:border-b-0 ${
                                            stage.value === (party.stage || 'NEW')
                                              ? `${stage.color} font-medium` 
                                              : 'text-slate-700 hover:bg-gray-50'
                                          }`}
                                        >
                                          <stage.icon className={`w-4 h-4 ${stage.iconColor}`} />
                                          <span className="font-medium">{stage.label}</span>
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </>
                              );
                            })()
                            }
                          </div>
                        </div>
                      )}
                      <div>
                        <span className="font-medium text-slate-500 text-xs">
                          Status:
                        </span>
                        <div>
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
                              party.status
                                ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                                : 'bg-red-50 text-red-600 border-red-200'
                            }`}
                          >
                            {party.status ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-center pt-3 mt-3 border-t border-gray-200">
                      <div className="relative dropdown-container">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenDropdown(
                              openDropdown === party.id ? null : party.id
                            );
                          }}
                          className="p-2 rounded-lg text-slate-500 hover:bg-gray-100 transition-all duration-300"
                        >
                          <HiEllipsisVertical className="w-5 h-5" />
                        </button>

                        {openDropdown === party.id && (
                          <div className="absolute right-0 bottom-full mb-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-[9999] backdrop-blur-sm">
                            <Link
                              to={`/view-party/${party.id}`}
                              className="flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-all duration-200 border-b border-gray-50 last:border-b-0"
                              onClick={() => setOpenDropdown(null)}
                            >
                              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                                <HiEye className="w-4 h-4 text-slate-600" />
                              </div>
                              <span className="font-medium">
                                View Details
                              </span>
                            </Link>
                            <Link
                              to={`/edit-contact/${party.id}`}
                              className="flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-emerald-50 transition-all duration-200 border-b border-gray-50 last:border-b-0"
                              onClick={() => setOpenDropdown(null)}
                            >
                              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                                <HiPencil className="w-4 h-4 text-emerald-600" />
                              </div>
                              <span className="font-medium">
                                Edit Contact
                              </span>
                            </Link>
                            <button
                              onClick={() => {
                                setOpenDropdown(null);
                                handleDeleteClick(party.id);
                              }}
                              className="flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-all duration-200 w-full text-left"
                            >
                              <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                                <HiTrash className="w-4 h-4 text-red-600" />
                              </div>
                              <span className="font-medium">
                                Delete Contact
                              </span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Simple Pagination */}
          {pagination && pagination.total > 0 && (
            <div className="flex justify-center mt-6">
              <Pagination
                current={currentPage}
                total={pagination.total}
                pageSize={pageSize}
                onChange={(page) => {
                  setCurrentPage(page);
                  dispatch(
                    fetchParties({
                      page: page,
                      limit: pageSize,
                      search: searchTerm,
                      role: filterRole,
                    })
                  );
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
