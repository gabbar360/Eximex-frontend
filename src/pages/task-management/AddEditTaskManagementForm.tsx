import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { createTask, updateTaskStatus, getTaskById, getStaffList } from '../../features/taskManagementSlice';
import { useAuth } from '../../context/AuthContext';
import {
  HiArrowLeft,
  HiCheckCircle,
  HiUser,
  HiClipboardDocumentList,
  HiExclamationTriangle,
  HiCalendarDays,
} from 'react-icons/hi2';
import { MdTask, MdDescription } from 'react-icons/md';
import * as Yup from 'yup';
import { Formik } from 'formik';

interface FormValues {
  title: string;
  description: string;
  priority: string;
  dueDate: string;
  assignedTo: string;
}

const AddEditTaskManagementForm: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { staffList, currentTask, loading } = useSelector((state: any) => state.taskManagement);

  const isEditMode = Boolean(id);
  const [submitting, setSubmitting] = useState(false);
  const [task, setTask] = useState<any>({});

  const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(user?.role?.name);

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
        priority: currentTask.priority || 'MEDIUM',
        dueDate: currentTask.dueDate ? new Date(currentTask.dueDate).toISOString().slice(0, 16) : '',
        assignedTo: currentTask.assignedTo?.toString() || ''
      });
    }
  }, [currentTask, isEditMode]);

  const validationSchema = Yup.object({
    title: Yup.string().required('Task title is required'),
    assignedTo: Yup.string().required('Please select a staff member'),
    priority: Yup.string().required('Priority is required'),
  });

  const handleSubmit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      if (isEditMode) {
        // Update task status or details
        await dispatch(updateTaskStatus({ 
          taskId: Number(id), 
          status: 'IN_PROGRESS' // This would be dynamic based on form
        })).unwrap();
        toast.success('Task updated successfully');
      } else {
        // Create new task
        await dispatch(createTask({
          title: values.title,
          description: values.description,
          priority: values.priority,
          dueDate: values.dueDate || null,
          assignedTo: Number(values.assignedTo)
        })).unwrap();
        toast.success('Task assigned successfully');
      }
      
      setTimeout(() => navigate('/task-management'), 1500);
    } catch (error: any) {
      toast.error(error || 'Operation failed');
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
          <h3 className="text-xl font-bold text-slate-800 mb-2">Access Denied</h3>
          <p className="text-slate-600">Only administrators can assign tasks.</p>
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
              priority: task.priority || 'MEDIUM',
              dueDate: task.dueDate || '',
              assignedTo: task.assignedTo || '',
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
                      <div className="text-sm text-red-500 mt-1">{errors.title}</div>
                    )}
                  </div>

                  {/* Assign To */}
                  <div>
                    <label className="flex items-center text-sm font-semibold text-slate-700 mb-3">
                      <HiUser className="w-4 h-4 mr-2 text-slate-600" />
                      Assign To *
                    </label>
                    <select
                      name="assignedTo"
                      value={values.assignedTo}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className="w-full px-4 py-3 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-slate-200 focus:border-slate-500 transition-all duration-300 shadow-sm"
                    >
                      <option value="">Select Staff Member</option>
                      {staffList.map((staff: any) => (
                        <option key={staff.id} value={staff.id}>
                          {staff.name} ({staff.email})
                        </option>
                      ))}
                    </select>
                    {touched.assignedTo && errors.assignedTo && (
                      <div className="text-sm text-red-500 mt-1">{errors.assignedTo}</div>
                    )}
                  </div>

                  {/* Priority */}
                  <div>
                    <label className="flex items-center text-sm font-semibold text-slate-700 mb-3">
                      <HiExclamationTriangle className="w-4 h-4 mr-2 text-slate-600" />
                      Priority *
                    </label>
                    <select
                      name="priority"
                      value={values.priority}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className="w-full px-4 py-3 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-slate-200 focus:border-slate-500 transition-all duration-300 shadow-sm"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="URGENT">Urgent</option>
                    </select>
                    {touched.priority && errors.priority && (
                      <div className="text-sm text-red-500 mt-1">{errors.priority}</div>
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