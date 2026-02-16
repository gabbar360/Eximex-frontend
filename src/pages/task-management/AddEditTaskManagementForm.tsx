import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
  createTask,
  updateTask,
  getTaskById,
  getStaffList,
} from '../../features/taskManagementSlice';
import { useAuth } from '../../context/AuthContext';
import {
  HiArrowLeft,
  HiCheckCircle,
  HiUser,
  HiClipboardDocumentList,
  HiExclamationTriangle,
  HiCalendarDays,
  HiChevronDown,
  HiMagnifyingGlass,
} from 'react-icons/hi2';
import { MdTask, MdDescription } from 'react-icons/md';
import * as Yup from 'yup';
import { Formik } from 'formik';

interface FormValues {
  title: string;
  description: string;
  type: string;
  priority: string;
  dueDate: string;
  assignedTo: string;
  slaHours: string;
}

const AddEditTaskManagementForm: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { staffList, currentTask } = useSelector(
    (state: Record<string, unknown>) =>
      state.taskManagement as {
        staffList: Record<string, unknown>[];
        currentTask: Record<string, unknown>;
      }
  );

  const isEditMode = Boolean(id);
  const [submitting, setSubmitting] = useState(false);
  const [task, setTask] = useState<{
    title: string;
    description: string;
    type: string;
    priority: string;
    dueDate: string;
    assignedTo: string;
    slaHours: string;
  }>({} as Record<string, string>);

  // Dropdown states
  const [typeSearch, setTypeSearch] = useState('');
  const [assigneeSearch, setAssigneeSearch] = useState('');
  const [prioritySearch, setPrioritySearch] = useState('');
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);

  const typeRef = useRef<HTMLDivElement>(null);
  const assigneeRef = useRef<HTMLDivElement>(null);
  const priorityRef = useRef<HTMLDivElement>(null);

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
    displayKey = 'name',
    valueKey = 'id',
  }) => {
    const selectedOption = options.find(
      (opt) => opt[valueKey]?.toString() === value?.toString()
    );

    return (
      <div className="relative" ref={dropdownRef}>
        <div
          className="w-full px-4 py-3 border border-gray-300 bg-white rounded-lg cursor-pointer flex items-center justify-between transition-all duration-300 shadow-sm hover:border-slate-400 focus-within:ring-2 focus-within:ring-slate-200 focus-within:border-slate-500"
          onClick={onToggle}
        >
          <span
            className={`text-sm ${selectedOption ? 'text-slate-900' : 'text-slate-500'}`}
          >
            {selectedOption ? selectedOption[displayKey] : placeholder}
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
                    key={option[valueKey]}
                    className={`px-4 py-3 hover:bg-slate-50 cursor-pointer text-sm transition-colors duration-150 ${
                      option[valueKey]?.toString() === value?.toString()
                        ? 'bg-slate-100 text-slate-900 font-medium'
                        : 'text-slate-700'
                    }`}
                    onClick={() => {
                      onSelect(option[valueKey]);
                      onToggle();
                    }}
                  >
                    {option[displayKey]}
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
    const handleClickOutside = (event: MouseEvent) => {
      if (typeRef.current && !typeRef.current.contains(event.target as Node)) {
        setShowTypeDropdown(false);
      }
      if (
        assigneeRef.current &&
        !assigneeRef.current.contains(event.target as Node)
      ) {
        setShowAssigneeDropdown(false);
      }
      if (
        priorityRef.current &&
        !priorityRef.current.contains(event.target as Node)
      ) {
        setShowPriorityDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isAdmin) {
      dispatch(getStaffList());
    }
  }, [dispatch, isAdmin]);

  useEffect(() => {
    if (isEditMode && id) {
      console.log('🔄 Fetching task by ID:', id);
      dispatch(getTaskById(id));
    }
  }, [dispatch, id, isEditMode]);

  useEffect(() => {
    if (currentTask && isEditMode) {
      console.log('📝 Populating form with task data:', currentTask);
      setTask({
        title: currentTask.title || '',
        description: currentTask.description || '',
        type: currentTask.type || 'INTERNAL',
        priority: currentTask.priority || 'MEDIUM',
        dueDate: currentTask.dueDate
          ? new Date(currentTask.dueDate).toISOString().slice(0, 16)
          : '',
        assignedTo: currentTask.assignedTo?.toString() || '',
        slaHours: currentTask.slaHours?.toString() || '',
      });
    }
  }, [currentTask, isEditMode]);

  const validationSchema = Yup.object({
    title: Yup.string().required('Task title is required'),
    type: Yup.string().required('Task type is required'),
    assignedTo: Yup.string().required('Please select a staff member'),
    priority: Yup.string().required('Priority is required'),
  });

  const handleSubmit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      if (isEditMode) {
        // Update complete task
        const result = await dispatch(
          updateTask({
            taskId: Number(id),
            taskData: {
              title: values.title,
              description: values.description,
              type: values.type,
              priority: values.priority,
              dueDate: values.dueDate || null,
              assignedTo: Number(values.assignedTo),
              slaHours: values.slaHours ? Number(values.slaHours) : null,
            },
          })
        ).unwrap();
        toast.success(result.message || 'Task updated successfully');
      } else {
        // Create new task
        const result = await dispatch(
          createTask({
            title: values.title,
            description: values.description,
            type: values.type,
            priority: values.priority,
            dueDate: values.dueDate || null,
            assignedTo: Number(values.assignedTo),
            slaHours: values.slaHours ? Number(values.slaHours) : null,
          })
        ).unwrap();
        toast.success(result.message || 'Task assigned successfully');
      }

      setTimeout(() => navigate('/task-management'), 1500);
    } catch (error: unknown) {
      toast.error((error as string) || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 rounded-lg bg-red-600 flex items-center justify-center shadow-lg">
            <HiExclamationTriangle className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">
            Access Denied
          </h3>
          <p className="text-slate-600">
            Only administrators can assign tasks.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-2 lg:p-4">
        {/* Header */}
        <div className="mb-3">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-3 lg:p-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate('/task-management')}
                  className="p-3 rounded-lg bg-slate-700 text-white hover:bg-slate-800 transition-all duration-300 hover:shadow-lg"
                >
                  <HiArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 mb-1">
                    {isEditMode ? 'Edit Task' : 'Assign New Task'}
                  </h1>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 lg:p-8">
          <Formik
            enableReinitialize
            initialValues={{
              title: task.title || '',
              description: task.description || '',
              type: task.type || 'INTERNAL',
              priority: task.priority || 'MEDIUM',
              dueDate: task.dueDate || '',
              assignedTo: task.assignedTo || '',
              slaHours: task.slaHours || '',
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({
              handleSubmit,
              handleChange,
              handleBlur,
              values,
              touched,
              errors,
              setFieldValue,
            }) => (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Task Title */}
                  <div>
                    <label className="flex items-center text-sm font-semibold text-slate-700 mb-3">
                      <MdTask className="w-4 h-4 mr-2 text-slate-600" />
                      Task Title *
                    </label>
                    <input
                      name="title"
                      type="text"
                      placeholder="Enter task title"
                      value={values.title}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className="w-full px-4 py-3 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-slate-200 focus:border-slate-500 transition-all duration-300 shadow-sm"
                    />
                    {touched.title && errors.title && (
                      <div className="text-sm text-red-500 mt-1">
                        {errors.title}
                      </div>
                    )}
                  </div>

                  {/* Task Type */}
                  <div>
                    <label className="flex items-center text-sm font-semibold text-slate-700 mb-3">
                      <HiClipboardDocumentList className="w-4 h-4 mr-2 text-slate-600" />
                      Task Type *
                    </label>
                    <SearchableDropdown
                      label="Task Type"
                      value={values.type}
                      options={[
                        { id: 'LEAD_FOLLOW_UP', name: 'Lead Follow Up' },
                        { id: 'QUOTATION', name: 'Quotation' },
                        { id: 'DOCUMENTATION', name: 'Documentation' },
                        { id: 'SHIPMENT', name: 'Shipment' },
                        { id: 'PAYMENT', name: 'Payment' },
                        { id: 'INTERNAL', name: 'Internal' },
                      ].filter((type) =>
                        type.name
                          .toLowerCase()
                          .includes(typeSearch.toLowerCase())
                      )}
                      onSelect={(value) => {
                        setFieldValue('type', value);
                        setTypeSearch('');
                      }}
                      searchValue={typeSearch}
                      onSearchChange={setTypeSearch}
                      isOpen={showTypeDropdown}
                      onToggle={() => setShowTypeDropdown(!showTypeDropdown)}
                      placeholder="Select Task Type"
                      dropdownRef={typeRef}
                    />
                    {touched.type && errors.type && (
                      <div className="text-sm text-red-500 mt-1">
                        {errors.type}
                      </div>
                    )}
                  </div>

                  {/* Assign To */}
                  <div>
                    <label className="flex items-center text-sm font-semibold text-slate-700 mb-3">
                      <HiUser className="w-4 h-4 mr-2 text-slate-600" />
                      Assign To *
                    </label>
                    <SearchableDropdown
                      label="Staff Member"
                      value={values.assignedTo}
                      options={[
                        { id: '', name: 'Select Staff Member' },
                        ...staffList
                          .filter(
                            (staff: {
                              id: number;
                              name: string;
                              email: string;
                            }) =>
                              `${staff.name} (${staff.email})`
                                .toLowerCase()
                                .includes(assigneeSearch.toLowerCase())
                          )
                          .map(
                            (staff: {
                              id: number;
                              name: string;
                              email: string;
                            }) => ({
                              id: staff.id,
                              name: `${staff.name} (${staff.email})`,
                            })
                          ),
                      ]}
                      onSelect={(value) => {
                        setFieldValue('assignedTo', value);
                        setAssigneeSearch('');
                      }}
                      searchValue={assigneeSearch}
                      onSearchChange={setAssigneeSearch}
                      isOpen={showAssigneeDropdown}
                      onToggle={() =>
                        setShowAssigneeDropdown(!showAssigneeDropdown)
                      }
                      placeholder="Select Staff Member"
                      dropdownRef={assigneeRef}
                    />
                    {touched.assignedTo && errors.assignedTo && (
                      <div className="text-sm text-red-500 mt-1">
                        {errors.assignedTo}
                      </div>
                    )}
                  </div>

                  {/* Priority */}
                  <div>
                    <label className="flex items-center text-sm font-semibold text-slate-700 mb-3">
                      <HiExclamationTriangle className="w-4 h-4 mr-2 text-slate-600" />
                      Priority *
                    </label>
                    <SearchableDropdown
                      label="Priority"
                      value={values.priority}
                      options={[
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
                        setFieldValue('priority', value);
                        setPrioritySearch('');
                      }}
                      searchValue={prioritySearch}
                      onSearchChange={setPrioritySearch}
                      isOpen={showPriorityDropdown}
                      onToggle={() =>
                        setShowPriorityDropdown(!showPriorityDropdown)
                      }
                      placeholder="Select Priority"
                      dropdownRef={priorityRef}
                    />
                    {touched.priority && errors.priority && (
                      <div className="text-sm text-red-500 mt-1">
                        {errors.priority}
                      </div>
                    )}
                  </div>

                  {/* Due Date */}
                  <div>
                    <label className="flex items-center text-sm font-semibold text-slate-700 mb-3">
                      <HiCalendarDays className="w-4 h-4 mr-2 text-slate-600" />
                      Due Date
                    </label>
                    <input
                      name="dueDate"
                      type="datetime-local"
                      value={values.dueDate}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className="w-full px-4 py-3 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-slate-200 focus:border-slate-500 transition-all duration-300 shadow-sm"
                    />
                  </div>

                  {/* SLA Hours */}
                  <div>
                    <label className="flex items-center text-sm font-semibold text-slate-700 mb-3">
                      <HiExclamationTriangle className="w-4 h-4 mr-2 text-slate-600" />
                      SLA Hours
                    </label>
                    <input
                      name="slaHours"
                      type="number"
                      placeholder="Enter SLA hours"
                      value={values.slaHours}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className="w-full px-4 py-3 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-slate-200 focus:border-slate-500 transition-all duration-300 shadow-sm"
                    />
                  </div>

                  {/* Description */}
                  <div className="md:col-span-2">
                    <label className="flex items-center text-sm font-semibold text-slate-700 mb-3">
                      <MdDescription className="w-4 h-4 mr-2 text-slate-600" />
                      Description
                    </label>
                    <textarea
                      name="description"
                      rows={4}
                      placeholder="Task description and requirements..."
                      value={values.description}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className="w-full px-4 py-3 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-slate-200 focus:border-slate-500 transition-all duration-300 shadow-sm"
                    />
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => navigate('/task-management')}
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
                        {isEditMode ? 'Updating...' : 'Assigning...'}
                      </div>
                    ) : (
                      <>
                        <HiCheckCircle className="w-5 h-5 mr-2 inline" />
                        {isEditMode ? 'Update Task' : 'Assign Task'}
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

export default AddEditTaskManagementForm;
