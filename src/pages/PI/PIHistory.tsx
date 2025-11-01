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
    <div className="max-w-7xl mx-auto p-4 md:p-6">
      <PageMeta
        title="PI History | EximEx Dashboard"
        description="View history of changes to this Proforma Invoice"
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Proforma Invoice History
          </h2>
        </div>
      </div>

      <PageBreadcrumb
        pageTitle="PI History"
        links={[
          { name: 'Dashboard', href: '/' },
          { name: 'Proforma Invoices', href: '/proforma-invoices' },
          { name: 'History', href: '#' },
        ]}
      />

      {/* Content */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 mb-6">
        <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Activity Timeline
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Track all changes made to this Proforma Invoice
          </p>
        </div>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <FontAwesomeIcon
              icon={faSpinner}
              className="animate-spin text-brand-600 text-2xl"
            />
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              No history records found for this invoice.
            </p>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline */}
            <div className="border-l-2 border-gray-200 dark:border-gray-700 ml-6">
              {history.map((item, index) => (
                <div key={item.id || index} className="mb-8 ml-6 relative">
                  {/* Timeline dot */}
                  <div className="absolute -left-9 mt-1.5 w-4 h-4 rounded-full bg-brand-500 border-4 border-white dark:border-gray-900"></div>

                  {/* Content */}
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2">
                      <h3 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 text-xs rounded-full ${getActionColor(item.action)}`}
                        >
                          {item.action === 'CREATE'
                            ? 'Created'
                            : item.action === 'UPDATE'
                              ? 'Updated'
                              : item.action === 'DELETE'
                                ? 'Deleted'
                                : item.action}
                        </span>
                      </h3>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(item.createdAt)}
                      </span>
                    </div>

                    <p className="text-gray-700 dark:text-gray-300 mb-2">
                      {item.description}
                    </p>

                    {/* Status change */}
                    {item.statusBefore !== item.statusAfter && (
                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                          {item.statusBefore}
                        </span>
                        <svg
                          className="w-4 h-4 text-gray-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M14 5l7 7m0 0l-7 7m7-7H3"
                          />
                        </svg>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            item.statusAfter === 'Pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : item.statusAfter === 'Approved'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {item.statusAfter}
                        </span>
                      </div>
                    )}

                    {/* Changed data summary */}
                    {item.changeData && item.action === 'CREATE' && (
                      <div className="mt-3 border-t border-gray-200 dark:border-gray-700 pt-3">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Invoice Details:
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">
                              Payment Term:
                            </span>{' '}
                            {item.changeData.paymentTerm?.toUpperCase() ||
                              'N/A'}
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">
                              Delivery Term:
                            </span>{' '}
                            {item.changeData.deliveryTerm?.toUpperCase() ||
                              'N/A'}
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">
                              Container:
                            </span>{' '}
                            {item.changeData.containerType || 'N/A'}
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">
                              Currency:
                            </span>{' '}
                            {item.changeData.currency || 'N/A'}
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">
                              Products:
                            </span>{' '}
                            {item.changeData.products?.length || 0} items
                          </div>
                        </div>
                      </div>
                    )}

                    {/* User info */}
                    {item.user && (
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          By:{' '}
                          <span className="font-medium">{item.user.name}</span>
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PIHistory;
