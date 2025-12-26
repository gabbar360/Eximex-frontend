import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { fetchParties, deleteParty, updatePartyStage, updatePartyStageOptimistic } from '../../features/partySlice';
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
  HiSparkles,
  HiCheckBadge,
  HiChatBubbleLeftRight,
  HiDocumentText,
  HiTrophy,
  HiXCircle,
  HiEnvelope,
  HiPhone,
  HiEllipsisVertical,
  HiChevronDown,
} from 'react-icons/hi2';
import { toast } from 'react-toastify';
import { useDebounce } from '../../utils/useDebounce';

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
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [wasSearching, setWasSearching] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [filterRole, setFilterRole] = useState('');
  
  // Role filter dropdown states
  const [roleSearch, setRoleSearch] = useState('');
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const roleRef = useRef(null);
  
  // Check if there are any Customer contacts
  const hasCustomers = parties && parties.some(party => party.role === 'Customer');

  // SearchableDropdown Component
  const SearchableDropdown = ({ label, value, options, onSelect, searchValue, onSearchChange, isOpen, onToggle, placeholder, dropdownRef }) => {
    const selectedOption = options.find(opt => opt.id === value);
    
    return (
      <div className="relative" ref={dropdownRef}>
        <div
          className="w-full px-4 py-3 border border-gray-300 bg-white rounded-xl cursor-pointer flex items-center justify-between transition-all duration-300 shadow-sm hover:border-slate-400 focus-within:ring-2 focus-within:ring-slate-200 focus-within:border-slate-500"
          onClick={onToggle}
        >
          <span className={`text-sm ${selectedOption ? 'text-slate-900' : 'text-slate-500'}`}>
            {selectedOption ? selectedOption.name : placeholder}
          </span>
          <HiChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
        
        {isOpen && (
          <div className="absolute z-50 w-full bg-white border border-gray-200 rounded-xl shadow-xl" style={{ top: '100%', marginTop: '4px' }}>
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
                    key={option.id}
                    className={`px-4 py-3 hover:bg-slate-50 cursor-pointer text-sm transition-colors duration-150 ${
                      option.id === value ? 'bg-slate-100 text-slate-900 font-medium' : 'text-slate-700'
                    }`}
                    onClick={() => {
                      onSelect(option.id);
                      onToggle();
                    }}
                  >
                    {option.name}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openDropdown && !event.target.closest('.dropdown-container')) {
        setOpenDropdown(null);
      }
      if (roleRef.current && !roleRef.current.contains(event.target)) {
        setShowRoleDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openDropdown]);

  // Stage data for Kanban board
  const stages = [
    {
      id: 'NEW',
      title: 'New Leads',
      color: 'bg-gray-100 border-gray-300',
      headerColor: 'bg-gray-600',
      icon: HiSparkles,
    },
    {
      id: 'QUALIFIED',
      title: 'Qualified',
      color: 'bg-blue-100 border-blue-300',
      headerColor: 'bg-blue-600',
      icon: HiCheckBadge,
    },
    {
      id: 'NEGOTIATION',
      title: 'Negotiation',
      color: 'bg-yellow-100 border-yellow-300',
      headerColor: 'bg-yellow-600',
      icon: HiChatBubbleLeftRight,
    },
    {
      id: 'QUOTATION_SENT',
      title: 'Quotation Sent',
      color: 'bg-purple-100 border-purple-300',
      headerColor: 'bg-purple-600',
      icon: HiDocumentText,
    },
    {
      id: 'WON',
      title: 'Won',
      color: 'bg-emerald-100 border-emerald-300',
      headerColor: 'bg-emerald-600',
      icon: HiTrophy,
    },
  ];

  // Memoized contacts by stage to prevent unnecessary re-renders
  const contactsByStage = useMemo(() => {
    return stages.reduce((acc, stage) => {
      acc[stage.id] = parties.filter(
        (party) => party.role === 'Customer' && (party.stage || 'NEW') === stage.id
      );
      return acc;
    }, {});
  }, [parties, stages]);

  // Handle drag and drop using Redux slice with optimistic updates
  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newStage = destination.droppableId;
    const contactId = draggableId.replace('contact-', '');
    
    // Optimistic update - update UI immediately
    dispatch(updatePartyStageOptimistic({ id: contactId, stage: newStage }));
    
    try {
      const response = await dispatch(updatePartyStage({ id: contactId, stage: newStage })).unwrap();
      
      // Show backend response message
      const message = response?.message || 'Contact moved successfully';
      toast.success(message);
    } catch (error) {
      // Revert optimistic update on error by reloading data
      dispatch(
        fetchParties({
          page: 1,
          limit: 1000,
          search: searchTerm,
          role: 'Customer',
        })
      );
      
      const errorMessage = error || 'Failed to update contact stage';
      toast.error(errorMessage);
    }
  };

  // Load data for kanban view
  useEffect(() => {
    // Load all customers for kanban view
    dispatch(
      fetchParties({
        page: 1,
        limit: 1000,
        search: searchTerm,
        role: 'Customer',
      })
    );
  }, [dispatch, searchTerm, filterRole]);

  const handleDeleteClick = (id) => {
    setConfirmDelete(id);
  };

  const handleConfirmDelete = async () => {
    if (!confirmDelete) return;

    try {
      const response = await dispatch(deleteParty(confirmDelete)).unwrap();
      setConfirmDelete(null);

      // Reload data after deletion
      dispatch(
        fetchParties({
          page: 1,
          limit: 1000,
          search: searchTerm,
          role: 'Customer',
        })
      );

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
    dispatch(
      fetchParties({
        page: 1,
        limit: 1000,
        search: value,
        role: 'Customer',
      })
    );
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


  return (
    <>
      <PageMeta
        title="Contact - EximEx | Lead Management"
        description="Manage your contacts and leads for import-export business. Track potential clients and business opportunities with EximEx CRM."
      />
      <div className="min-h-screen bg-gray-50">
        <div className="p-2 lg:p-4">
          {/* Header */}
          <div className="mb-6">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 lg:p-6">
              <div className="flex flex-col space-y-4 lg:space-y-0 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-slate-700 shadow-lg">
                    <HiUsers className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">
                      Contacts
                    </h1>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                  <div className="relative flex-1 sm:flex-none">
                    <HiMagnifyingGlass className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Search contacts..."
                      className="pl-12 pr-4 py-3 w-full sm:w-72 rounded-xl border border-gray-300 bg-white focus:border-slate-500 focus:ring-2 focus:ring-slate-200 transition-all duration-300 text-sm placeholder-gray-500 shadow-sm"
                      value={searchTerm}
                      onChange={(e) => handleSearch(e.target.value)}
                    />
                  </div>

                  <div className="w-full sm:w-40">
                    <SearchableDropdown
                      label="Role"
                      value={filterRole}
                      options={[
                        { id: '', name: 'All Roles' },
                        { id: 'Customer', name: 'Customer' },
                        { id: 'Supplier', name: 'Supplier' },
                        { id: 'Vendor', name: 'Vendor' },
                      ].filter(role => role.name.toLowerCase().includes(roleSearch.toLowerCase()))}
                      onSelect={(value) => {
                        setFilterRole(value);
                        setRoleSearch('');
                      }}
                      searchValue={roleSearch}
                      onSearchChange={setRoleSearch}
                      isOpen={showRoleDropdown}
                      onToggle={() => setShowRoleDropdown(!showRoleDropdown)}
                      placeholder="All Roles"
                      dropdownRef={roleRef}
                    />
                  </div>

                  <div className="flex gap-2 flex-shrink-0 flex-1 sm:flex-none">
                    <Link
                      to="/add-contact"
                      className="inline-flex items-center justify-center px-3 sm:px-4 lg:px-6 py-3 w-full sm:w-auto rounded-xl font-semibold text-white bg-slate-700 hover:bg-slate-800 shadow-lg transition-colors whitespace-nowrap text-sm sm:text-base"
                    >
                      <HiPlus className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">Add Contact</span>
                      <span className="sm:hidden">Add</span>
                    </Link>
                  </div>
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
            // Kanban Board View
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
              <DragDropContext onDragEnd={handleDragEnd}>
                <div className="flex gap-4 overflow-x-auto pb-4 min-h-[600px]">
                  {stages.map((stage) => (
                    <div key={stage.id} className="flex-shrink-0 w-57">
                      <div className="bg-gray-50 rounded-xl border border-gray-200 h-full">
                        {/* Stage Header */}
                        <div className="bg-white border-b border-gray-200 p-4 rounded-t-xl">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                                <stage.icon className="w-4 h-4 text-slate-600" />
                              </div>
                              <h2 className="font-semibold text-sm text-slate-800">{stage.title}</h2>
                            </div>
                            <span className="bg-slate-100 text-slate-700 text-xs font-medium px-2 py-1 rounded-md">
                              {contactsByStage[stage.id]?.length || 0}
                            </span>
                          </div>
                        </div>

                        {/* Droppable Area */}
                        <Droppable droppableId={stage.id} key={stage.id} isDropDisabled={false} isCombineEnabled={false}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              className={`p-4 min-h-[500px] transition-colors duration-200 ${
                                snapshot.isDraggingOver ? 'bg-white/50' : ''
                              }`}
                            >
                              {contactsByStage[stage.id]?.map((contact, index) => (
                                <Draggable key={`${stage.id}-${contact.id}`} draggableId={`contact-${contact.id}`} index={index}>
                                  {(provided, snapshot) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      className={`bg-white rounded-xl border border-gray-200 p-4 mb-3 shadow-sm hover:shadow-md transition-all duration-200 cursor-move ${
                                        snapshot.isDragging ? 'shadow-lg border-slate-300 bg-slate-50' : ''
                                      }`}
                                    >
                                      <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-start gap-3 flex-1 min-w-0">
                                          {/* <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                                            <HiBuildingOffice2 className="w-5 h-5 text-slate-600" />
                                          </div> */}
                                          <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-slate-900 text-sm leading-tight truncate" title={contact.companyName}>
                                              {contact.companyName}
                                            </h3>
                                            {contact.contactPersonName && (
                                              <p className="text-xs text-slate-500 mt-1 truncate" title={contact.contactPersonName}>
                                                {contact.contactPersonName}
                                              </p>
                                            )}
                                          </div>
                                        </div>
                                        
                                        <div className="relative dropdown-container flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                                          <button
                                            onClick={(e) => {
                                              e.preventDefault();
                                              e.stopPropagation();
                                              setOpenDropdown(openDropdown === contact.id ? null : contact.id);
                                            }}
                                            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors flex items-center justify-center"
                                            style={{ pointerEvents: 'auto' }}
                                          >
                                            <HiEllipsisVertical className="w-4 h-4" />
                                          </button>

                                          {openDropdown === contact.id && (
                                            <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                                              <Link
                                                to={`/view-party/${contact.id}`}
                                                className="flex items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                                                onClick={() => setOpenDropdown(null)}
                                              >
                                                <HiEye className="w-4 h-4 text-slate-500" />
                                                <span>View Details</span>
                                              </Link>
                                              <Link
                                                to={`/edit-contact/${contact.id}`}
                                                className="flex items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
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
                                                className="flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left transition-colors"
                                              >
                                                <HiTrash className="w-4 h-4" />
                                                <span>Delete</span>
                                              </button>
                                            </div>
                                          )}
                                        </div>
                                      </div>

                                      <div className="space-y-3">
                                        {contact.email && (
                                          <div className="flex items-center gap-2 text-xs text-slate-600">
                                            <HiEnvelope className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                                            <span className="truncate font-medium" title={contact.email}>{contact.email}</span>
                                          </div>
                                        )}
                                        {contact.phone && (
                                          <div className="flex items-center gap-2 text-xs text-slate-600">
                                            <HiPhone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                                            <span className="font-medium">{contact.phone}</span>
                                          </div>
                                        )}
                                      </div>

                                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                                        <span className="text-xs font-medium text-slate-600 bg-slate-50 px-2 py-1 rounded-md">
                                          {contact.role}
                                        </span>
                                        <span
                                          className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                                            contact.status
                                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                              : 'bg-red-50 text-red-700 border border-red-200'
                                          }`}
                                        >
                                          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                                            contact.status ? 'bg-emerald-500' : 'bg-red-500'
                                          }`}></span>
                                          {contact.status ? 'Active' : 'Inactive'}
                                        </span>
                                      </div>
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                              
                              {contactsByStage[stage.id]?.length === 0 && (
                                <div className="text-center py-12 text-slate-400">
                                  <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
                                    <stage.icon className="w-6 h-6 text-slate-400" />
                                  </div>
                                  <p className="text-sm font-medium">No contacts</p>
                                  <p className="text-xs text-slate-400 mt-1">Drag cards here</p>
                                </div>
                              )}
                            </div>
                          )}
                        </Droppable>
                      </div>
                    </div>
                  ))}
                </div>
              </DragDropContext>
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
  