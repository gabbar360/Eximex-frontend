import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  getTasks,
  updateTask,
  deleteTask,
} from '../../features/taskManagementSlice';
import PageMeta from '../../components/common/PageMeta';
import {
  HiPencil,
  HiTrash,
  HiPlus,
  HiMagnifyingGlass,
  HiSparkles,
  HiChevronDown,
} from 'react-icons/hi2';
import { MdSupervisorAccount, MdTask } from 'react-icons/md';
import { Pagination } from 'antd';
import { useDebounce } from '../../utils/useDebounce';
import { useAuth } from '../../context/AuthContext';

const TaskManagement: React.FC = () => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { tasks, loading, pagination } = useSelector(
    (state: any) => state.taskManagement
  );

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [confirmStatusChange, setConfirmStatusChange] = useState<{
    taskId: number;
    newStatus: string;
    taskTitle: string;
  } | null>(null);

  // Dropdown states
  const [statusSearch, setStatusSearch] = useState('');
  const [prioritySearch, setPrioritySearch] = useState('');
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);

  const statusRef = useRef(null);
  const priorityRef = useRef(null);

  const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(user?.role?.name);

  // SearchableDropdown Component
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
    dropdownRef,
  }) => {
    const selectedOption = options.find((opt) => opt.id === value);

    return (
      <div className="relative" ref={dropdownRef}>
        <div
          className="w-full px-4 py-3 border border-gray-300 bg-white rounded-lg cursor-pointer flex items-center justify-between transition-all duration-300 shadow-sm hover:border-slate-400 focus-within:ring-2 focus-within:ring-slate-200 focus-within:border-slate-500"
          onClick={onToggle}
        >
          <span
            className={`text-sm ${selectedOption ? 'text-slate-900' : 'text-slate-500'}`}
          >
            {selectedOption ? selectedOption.name : placeholder}
          </span>
          <HiChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
        </div>

        {isOpen && (
          <div
            className="absolute z-50 w-full bg-white border border-gray-200 rounded-lg shadow-xl"
            style={{ top: '100%', marginTop: '4px' }}
          >
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
                <div className="px-4 py-3 text-slate-500 text-sm text-center">
                  No {label.toLowerCase()} found
                </div>
              ) : (
                options.map((option) => (
                  <div
                    key={option.id}
                    className={`px-4 py-3 hover:bg-slate-50 cursor-pointer text-sm transition-colors duration-150 ${
                      option.id === value
                        ? 'bg-slate-100 text-slate-900 font-medium'
                        : 'text-slate-700'
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

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (statusRef.current && !statusRef.current.contains(event.target)) {
        setShowStatusDropdown(false);
      }
      if (priorityRef.current && !priorityRef.current.contains(event.target)) {
        setShowPriorityDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const params = {
      page: currentPage,
      limit: pageSize,
      search: '',
      status: statusFilter,
      priority: priorityFilter,
    };
    console.log('🚀 Frontend dispatching getTasks with params:', params);
    dispatch(getTasks(params));
  }, [dispatch, currentPage, pageSize, statusFilter, priorityFilter]);

  const { debouncedCallback: debouncedSearch } = useDebounce(
    (value: string) => {
      dispatch(
        getTasks({
          page: 1,
          limit: pageSize,
          search: value,
          status: statusFilter,
          priority: priorityFilter,
        })
      );
    },
    500
  );

  const handleSearch = useCallback(
    (value: string) => {
      setSearchTerm(value);
      setCurrentPage(1);
      debouncedSearch(value);
    },
    [debouncedSearch, pageSize, statusFilter, priorityFilter]
  );

  const handleStatusUpdate = async (taskId: number, newStatus: string) => {
    const task = tasks.find((t) => t.id === taskId);
    setConfirmStatusChange({
      taskId,
      newStatus,
      taskTitle: task?.title || 'Unknown Task',
    });
  };

  const handleConfirmStatusChange = async () => {
    if (!confirmStatusChange) return;

    try {
      const result = await dispatch(
        updateTask({
          taskId: confirmStatusChange.taskId,
          taskData: { status: confirmStatusChange.newStatus },
        })
      ).unwrap();
      toast.success(result.message || 'Task status updated successfully');
      setConfirmStatusChange(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update task status');
      setConfirmStatusChange(null);
    }
  };

  const handleDeleteClick = (taskId: number) => {
    setConfirmDelete(taskId);
  };

  const handleConfirmDelete = async () => {
    if (!confirmDelete) return;

    try {
      await dispatch(deleteTask(confirmDelete));
      setConfirmDelete(null);
      toast.success('Task deleted successfully');
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-red-100 text-red-800';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800';
      case 'LOW':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'ON_HOLD':
        return 'bg-orange-100 text-orange-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'OVERDUE':
        return 'bg-red-200 text-red-900';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <PageMeta
        title="Task Management - EximEx | Task Assignment & Management"
        description="Manage staff tasks and assignments for your import-export business. Assign tasks to team members and track progress."
      />
      <div className="min-h-screen bg-gray-50">
        <div className="p-2 lg:p-4">
          {/* Header */}
          <div className="mb-3">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-3 lg:p-4">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-slate-700 shadow-lg">
                    <MdSupervisorAccount className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 mb-1">
                      Task
                    </h1>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  {/* Search Bar */}
                  <div className="relative flex-1">
                    <HiMagnifyingGlass className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search tasks..."
                      className="pl-12 pr-4 py-3 w-full sm:w-72 rounded-lg border border-gray-300 bg-white focus:border-slate-500 focus:ring-2 focus:ring-slate-200 transition-all duration-300 text-sm placeholder-gray-500 shadow-sm"
                      value={searchTerm}
                      onChange={(e) => handleSearch(e.target.value)}
                    />
                  </div>

                  {/* Status Filter */}
                  <div className="w-full sm:w-48">
                    <SearchableDropdown
                      label="Status"
                      value={statusFilter}
                      options={[
                        { id: '', name: 'All Status' },
                        { id: 'PENDING', name: 'Pending' },
                        { id: 'IN_PROGRESS', name: 'In Progress' },
                        { id: 'ON_HOLD', name: 'On Hold' },
                        { id: 'COMPLETED', name: 'Completed' },
                        { id: 'CANCELLED', name: 'Cancelled' },
                        { id: 'OVERDUE', name: 'Overdue' },
                      ].filter((status) =>
                        status.name
                          .toLowerCase()
                          .includes(statusSearch.toLowerCase())
                      )}
                      onSelect={(value) => {
                        setStatusFilter(value);
                        setStatusSearch('');
                      }}
                      searchValue={statusSearch}
                      onSearchChange={setStatusSearch}
                      isOpen={showStatusDropdown}
                      onToggle={() =>
                        setShowStatusDropdown(!showStatusDropdown)
                      }
                      placeholder="All Status"
                      dropdownRef={statusRef}
                    />
                  </div>

                  {/* Priority Filter */}
                  <div className="w-full sm:w-40">
                    <SearchableDropdown
                      label="Priority"
                      value={priorityFilter}
                      options={[
                        { id: '', name: 'All Priority' },
                        { id: 'LOW', name: 'Low' },
                        { id: 'MEDIUM', name: 'Medium' },
                        { id: 'HIGH', name: 'High' },
                        { id: 'URGENT', name: 'Urgent' },
                      ].filter((priority) =>
                        priority.name
                          .toLowerCase()
                          .includes(prioritySearch.toLowerCase())
                      )}
                      onSelect={(value) => {
                        setPriorityFilter(value);
                        setPrioritySearch('');
                      }}
                      searchValue={prioritySearch}
                      onSearchChange={setPrioritySearch}
                      isOpen={showPriorityDropdown}
                      onToggle={() =>
                        setShowPriorityDropdown(!showPriorityDropdown)
                      }
                      placeholder="All Priority"
                      dropdownRef={priorityRef}
                    />
                  </div>

                  {/* Add Task Button */}
                  {isAdmin && (
                    <Link
                      to="/task-management/add-task"
                      className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-semibold text-white bg-slate-700 hover:bg-slate-800 shadow-lg whitespace-nowrap"
                    >
                      <HiPlus className="w-5 h-5 mr-2" />
                      Add Task
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Tasks Table */}
          {loading ? (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-slate-600 mx-auto mb-4"></div>
              <p className="text-slate-600 font-medium">Loading tasks...</p>
            </div>
          ) : tasks.length === 0 ? (
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/30 p-12 text-center">
              <div className="w-10 h-10 mx-auto mb-6 rounded-2xl bg-slate-700 flex items-center justify-center shadow-lg">
                <MdTask className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">
                No tasks found
              </h3>
              <p className="text-slate-600 mb-6">
                {searchTerm
                  ? 'Try adjusting your search or filters.'
                  : isAdmin
                    ? 'Start by assigning tasks to your team members.'
                    : 'No tasks have been assigned to you yet.'}
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <div className="min-w-[800px]">
                  <div className="bg-gray-50 border-b border-gray-200 p-4">
                    <div
                      className="grid gap-3 text-sm font-semibold text-slate-700"
                      style={{
                        gridTemplateColumns:
                          '2fr 1fr 1.2fr 1.2fr 0.8fr 1fr 1fr 0.8fr',
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <MdTask className="w-4 h-4 text-slate-600" />
                        <span>Task</span>
                      </div>
                      <div>Type</div>
                      <div>Assigned To</div>
                      <div>Assigned By</div>
                      <div>Priority</div>
                      <div>Status</div>
                      <div>Due Date</div>
                      <div className="flex items-center justify-end gap-2">
                        <HiSparkles className="w-4 h-4 text-slate-600" />
                        <span>Actions</span>
                      </div>
                    </div>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {tasks.map((task: any) => (
                      <div key={task.id} className="p-4 hover:bg-gray-50">
                        <div
                          className="grid gap-3 items-center"
                          style={{
                            gridTemplateColumns:
                              '2fr 1fr 1.2fr 1.2fr 0.8fr 1fr 1fr 0.8fr',
                          }}
                        >
                          <div>
                            <h3 className="font-semibold text-slate-900">
                              {task.title}
                            </h3>
                            {task.description && (
                              <p className="text-sm text-slate-600 mt-1 truncate">
                                {task.description}
                              </p>
                            )}
                          </div>
                          <div className="text-sm text-slate-700">
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {task.type?.replace('_', ' ')}
                            </span>
                          </div>
                          <div className="text-sm text-slate-700">
                            {task.assignee?.name}
                          </div>
                          <div className="text-sm text-slate-700">
                            {task.assigner?.name}
                          </div>
                          <div>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}
                            >
                              {task.priority}
                            </span>
                          </div>
                          <div>
                            {!isAdmin ? (
                              <select
                                value={task.status}
                                onChange={(e) =>
                                  handleStatusUpdate(task.id, e.target.value)
                                }
                                className={`px-2 py-1 rounded-full text-xs font-medium border-0 ${getStatusColor(task.status)}`}
                                disabled={task.status === 'COMPLETED'}
                              >
                                <option value="PENDING">Pending</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="ON_HOLD">On Hold</option>
                                <option value="COMPLETED">Completed</option>
                                <option value="CANCELLED">Cancelled</option>
                              </select>
                            ) : (
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}
                              >
                                {task.status.replace('_', ' ')}
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-slate-700">
                            {task.dueDate
                              ? new Date(task.dueDate).toLocaleDateString()
                              : '-'}
                          </div>
                          <div className="flex items-center justify-end space-x-2">
                            {isAdmin && (
                              <>
                                <Link
                                  to={`/task-management/edit-task/${task.id}`}
                                  className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-emerald-600 transition-all duration-300"
                                >
                                  <HiPencil className="w-4 h-4" />
                                </Link>
                                <button
                                  onClick={() => handleDeleteClick(task.id)}
                                  className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-red-600 transition-all duration-300"
                                >
                                  <HiTrash className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Pagination */}
          {pagination.total > 0 && (
            <div className="flex justify-center mt-6">
              <Pagination
                current={currentPage}
                total={pagination.total}
                pageSize={pageSize}
                onChange={(page) => {
                  setCurrentPage(page);
                  dispatch(
                    getTasks({
                      page: page,
                      limit: pageSize,
                      search: searchTerm,
                      status: statusFilter,
                      priority: priorityFilter,
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
                  Delete Task
                </h3>
                <p className="text-slate-600">
                  Are you sure you want to delete this task? This action cannot
                  be undone.
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

        {/* Status Change Confirmation Modal */}
        {confirmStatusChange && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-60 p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-8 border border-gray-200">
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-lg bg-slate-600 flex items-center justify-center shadow-lg">
                  <MdTask className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">
                  Change Task Status
                </h3>
                <p className="text-slate-600">
                  Are you sure you want to change the status of{' '}
                  <strong>"{confirmStatusChange.taskTitle}"</strong> to{' '}
                  <strong>
                    {confirmStatusChange.newStatus.replace('_', ' ')}
                  </strong>
                  ?
                </p>
              </div>
              <div className="flex items-center justify-center space-x-3">
                <button
                  onClick={() => setConfirmStatusChange(null)}
                  className="px-6 py-3 rounded-lg border border-gray-300 text-slate-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmStatusChange}
                  className="px-6 py-3 rounded-lg bg-slate-700 text-white hover:bg-slate-800 shadow-lg"
                >
                  Change Status
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default TaskManagement;
