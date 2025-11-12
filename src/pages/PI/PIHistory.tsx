import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import Redux actions
import { fetchPiInvoiceHistory } from '../../features/piSlice';
import { useDispatch } from 'react-redux';

// Import components
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import PageMeta from '../../components/common/PageMeta';

interface HistoryItem {
  id: number;
  piInvoiceId: number;
  action: string;
  description: string;
  changeData: any;
  statusBefore: string;
  statusAfter: string;
  changedFields: string[];
  ipAddress: string;
  deviceInfo: string;
  createdAt: string;
  createdBy: number;
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

const PIHistory: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState<boolean>(true);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const response = await dispatch(fetchPiInvoiceHistory(id)).unwrap();
        console.log('History response:', response);

        if (response && Array.isArray(response)) {
          setHistory(response);
        } else if (response && response.data && Array.isArray(response.data)) {
          setHistory(response.data);
        } else {
          toast.error('Invalid history data format');
        }
      } catch (error) {
        console.error('Error fetching PI history:', error);
        toast.error('Failed to load history');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchHistory();
    }
  }, [id]);

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    });
  };

  // Get action color
  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500';
      case 'UPDATE':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500';
      case 'DELETE':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4 sm:p-6 lg:p-8">
        <PageMeta
          title="PI History | EximEx Dashboard"
          description="View history of changes to this Proforma Invoice"
        />

        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
              <button
                onClick={() => navigate(-1)}
                className="p-2.5 sm:p-3 rounded-lg bg-slate-700 text-white hover:bg-slate-800 transition-colors self-start"
              >
                <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                <div className="p-3 sm:p-4 rounded-lg bg-slate-700">
                  <FontAwesomeIcon icon={faSpinner} className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
                    Proforma Invoice History
                  </h1>
                  <p className="text-sm sm:text-base text-gray-600">Track all changes and activities for this invoice</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <PageBreadcrumb
            pageTitle="PI History"
            links={[
              { name: 'Dashboard', href: '/' },
              { name: 'Proforma Invoices', href: '/proforma-invoices' },
              { name: 'History', href: '#' },
            ]}
          />
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 border-b border-gray-200 p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <div className="p-2.5 sm:p-3 rounded-lg bg-slate-700">
                <FontAwesomeIcon icon={faSpinner} className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                  Activity Timeline
                </h3>
                <p className="text-sm sm:text-base text-gray-600 mt-1">
                  Complete history of all changes and activities
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-4 sm:p-6 lg:p-8">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 sm:py-16 lg:py-20">
                <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 border-gray-200 border-t-slate-600 mb-4 sm:mb-6"></div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Loading History</h3>
                <p className="text-sm sm:text-base text-gray-600 text-center px-4">Please wait while we fetch the timeline...</p>
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-12 sm:py-16 lg:py-20">
                <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 mx-auto mb-4 sm:mb-6 rounded-lg bg-slate-700 flex items-center justify-center">
                  <FontAwesomeIcon icon={faSpinner} className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">No History Found</h3>
                <p className="text-sm sm:text-base text-gray-600 max-w-md mx-auto px-4">
                  This invoice doesn't have any recorded history yet. Activities will appear here as they occur.
                </p>
              </div>
            ) : (
              <div className="relative">
                {/* Enhanced Timeline */}
                <div className="relative">
                  {/* Timeline line - Hidden on mobile, visible on larger screens */}
                  <div className="hidden sm:block absolute left-6 lg:left-8 top-0 bottom-0 w-0.5 sm:w-1 bg-slate-300 rounded"></div>
                  
                  {history.map((item, index) => (
                    <div key={item.id || index} className="relative mb-6 sm:mb-8 lg:mb-12 sm:ml-12 lg:ml-16">
                      {/* Timeline dot - Hidden on mobile */}
                      <div className="hidden sm:block absolute -left-8 lg:-left-12 top-4 sm:top-6">
                        <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-lg border-2 sm:border-4 border-white flex items-center justify-center shadow-lg ${
                          item.action === 'CREATE'
                            ? 'bg-emerald-600'
                            : item.action === 'UPDATE'
                              ? 'bg-slate-600'
                              : 'bg-red-600'
                        }`}>
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full"></div>
                        </div>
                      </div>

                      {/* Content Card */}
                      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-4 sm:p-5 lg:p-6">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 sm:mb-4">
                            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-0">
                              {/* Mobile timeline dot */}
                              <div className={`sm:hidden w-4 h-4 rounded-full flex-shrink-0 ${
                                item.action === 'CREATE'
                                  ? 'bg-emerald-600'
                                  : item.action === 'UPDATE'
                                    ? 'bg-slate-600'
                                    : 'bg-red-600'
                              }`}></div>
                              <span
                                className={`px-2.5 sm:px-3 lg:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-bold rounded-lg ${
                                  item.action === 'CREATE'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : item.action === 'UPDATE'
                                      ? 'bg-slate-50 text-slate-700 border border-slate-200'
                                      : 'bg-red-50 text-red-700 border border-red-200'
                                }`}
                              >
                                {item.action === 'CREATE'
                                  ? 'Created'
                                  : item.action === 'UPDATE'
                                    ? 'Updated'
                                    : item.action === 'DELETE'
                                      ? 'Deleted'
                                      : item.action}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-500">
                              <FontAwesomeIcon icon={faSpinner} className="w-3 h-3" />
                              <span className="truncate">{formatDate(item.createdAt)}</span>
                            </div>
                          </div>

                          <p className="text-gray-700 mb-3 sm:mb-4 text-sm sm:text-base lg:text-lg font-medium leading-relaxed">
                            {item.description}
                          </p>

                          {/* Status change */}
                          {item.statusBefore !== item.statusAfter && (
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
                              <span className="px-2.5 sm:px-3 lg:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold rounded-lg bg-gray-100 text-gray-700 border border-gray-300 text-center">
                                {item.statusBefore}
                              </span>
                              <div className="flex items-center justify-center gap-2 sm:gap-2">
                                <div className="w-6 sm:w-8 h-0.5 bg-slate-500 rounded"></div>
                                <FontAwesomeIcon icon={faArrowLeft} className="w-3 h-3 sm:w-4 sm:h-4 text-slate-500 rotate-180" />
                              </div>
                              <span
                                className={`px-2.5 sm:px-3 lg:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold rounded-lg border text-center ${
                                  item.statusAfter === 'pending'
                                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                                    : item.statusAfter === 'confirmed'
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                      : 'bg-gray-100 text-gray-800 border-gray-300'
                                }`}
                              >
                                {item.statusAfter}
                              </span>
                            </div>
                          )}

                          {/* Changed data summary */}
                          {item.changeData && item.action === 'CREATE' && (
                            <div className="mt-3 sm:mt-4 border-t border-gray-200 pt-3 sm:pt-4">
                              <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3 uppercase tracking-wide">
                                Invoice Details:
                              </h4>
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 text-xs sm:text-sm">
                                <div className="bg-gray-50 p-2 sm:p-3 rounded-lg">
                                  <span className="text-gray-500 font-medium block mb-1">
                                    Payment Term:
                                  </span>
                                  <span className="text-gray-900 font-semibold">
                                    {item.changeData.paymentTerm?.toUpperCase() || 'N/A'}
                                  </span>
                                </div>
                                <div className="bg-gray-50 p-2 sm:p-3 rounded-lg">
                                  <span className="text-gray-500 font-medium block mb-1">
                                    Delivery Term:
                                  </span>
                                  <span className="text-gray-900 font-semibold">
                                    {item.changeData.deliveryTerm?.toUpperCase() || 'N/A'}
                                  </span>
                                </div>
                                <div className="bg-gray-50 p-2 sm:p-3 rounded-lg">
                                  <span className="text-gray-500 font-medium block mb-1">
                                    Container:
                                  </span>
                                  <span className="text-gray-900 font-semibold">
                                    {item.changeData.containerType || 'N/A'}
                                  </span>
                                </div>
                                <div className="bg-gray-50 p-2 sm:p-3 rounded-lg">
                                  <span className="text-gray-500 font-medium block mb-1">
                                    Currency:
                                  </span>
                                  <span className="text-gray-900 font-semibold">
                                    {item.changeData.currency || 'N/A'}
                                  </span>
                                </div>
                                <div className="bg-gray-50 p-2 sm:p-3 rounded-lg">
                                  <span className="text-gray-500 font-medium block mb-1">
                                    Products:
                                  </span>
                                  <span className="text-gray-900 font-semibold">
                                    {item.changeData.products?.length || 0} items
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* User info */}
                          {item.user && (
                            <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                              <p className="text-xs sm:text-sm text-gray-500">
                                <span className="font-medium text-gray-600">By:</span>{' '}
                                <span className="font-semibold text-gray-900">{item.user.name}</span>
                              </p>
                              <p className="text-xs sm:text-sm text-gray-500">
                                <span className="font-medium text-gray-600">Date:</span>{' '}
                                <span className="font-semibold text-gray-900">
                                  {new Date(item.createdAt).toLocaleDateString()}
                                </span>
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PIHistory;
