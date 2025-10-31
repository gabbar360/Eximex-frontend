import { useDispatch, useSelector } from 'react-redux';
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faEdit,
  faHistory,
  faTrash,
  faDownload,
  faEye,
  faEnvelope,
  faEllipsisV,
  faCheck,
} from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import form components
import Form from '../../components/form/Form';
import Label from '../../components/form/Label';
import Input from '../../components/form/input/InputField';
import Select from '../../components/form/Select';

// --- Types ---
type Company = {
  id: string;
  name: string;
  status: string;
  contactPerson: string;
  address: string;
  country: string;
  email: string;
  phone: string;
};

type ProductData = {
  productId: string;
  name: string;
  hsCode: string;
  description: string;
  quantity: number;
  rate: number;
  unit: string;
  total: number;
};

type Charges = {
  [key: string]: any;
};

type PIData = {
  company: Company | undefined;
  paymentTerm: string;
  deliveryTerm: string;
  productsData: ProductData[];
  charges: Charges;
};

type PI = {
  piNumber: string;
  date: string;
  status: string;
  data: PIData;
};

// Import API service
import {
  getAllPiInvoices,
  deletePiInvoice,
  downloadPiInvoicePdf,
} from '../../service/piService';
import EmailInvoiceModal from '../../components/EmailInvoiceModal';

// --- Helper functions ---
const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
    value
  );

const calculateTotalAmount = (
  productsData: ProductData[],
  deliveryTerm: string,
  charges: Charges
) => {
  let subtotal = 0;
  productsData.forEach((prod) => {
    subtotal += prod.total;
  });

  let chargesTotal = 0;
  if (deliveryTerm === 'fob' && charges.noOtherCharges) {
    // No other charges
  } else if (charges) {
    Object.entries(charges).forEach(([key, val]) => {
      if (key === 'noOtherCharges') return;
      if (key === 'otherCharges' && Array.isArray(val)) {
        val.forEach((oc: any) => {
          chargesTotal += parseFloat(oc.amount) || 0;
        });
      } else if (typeof val === 'number' || !isNaN(parseFloat(val))) {
        let amount = parseFloat(val) || 0;
        if ((key === 'dutyPercent' || key === 'vatPercent') && subtotal > 0) {
          amount = (amount / 100) * subtotal;
        }
        chargesTotal += amount;
      }
    });
  }
  return subtotal + chargesTotal;
};

const PICard: React.FC<{ pi: any; onDelete: (id: string) => void }> = ({
  pi,
  onDelete,
}) => {
  const navigate = useNavigate();
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<boolean>(false);
  const [showEmailModal, setShowEmailModal] = useState<boolean>(false);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  const {
    id = '',
    piNumber = '',
    invoiceDate = new Date().toISOString(),
    status = 'Pending',
    party = {},
    paymentTerm = '',
    deliveryTerm = '',
    totalAmount = 0,
    currency = 'USD',
    containerType = '',
    _count = { products: 0 },
  } = pi || {};

  const paymentTermNames: Record<string, string> = {
    advance: 'Advance',
    lc: 'LC',
    '30days': '30 Days Credit',
  };
  const deliveryTermNames: Record<string, string> = {
    fob: 'FOB',
    cif: 'CIF',
    ddp: 'DDP',
  };

  const formattedDate = new Date(invoiceDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
    maximumFractionDigits: 0,
  }).format(totalAmount || 0);

  const handleDownloadPdf = async () => {
    try {
      setDownloading(true);
      await downloadPiInvoicePdf(id);
      toast.success('PDF downloaded successfully');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('Failed to download PDF');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="relative p-4 sm:p-6 border-b border-gray-100 dark:border-gray-700">
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex items-center gap-2">
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full ${
              status === 'draft'
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                : status === 'pending'
                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                  : status === 'confirmed'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                    : status === 'cancelled'
                      ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <FontAwesomeIcon icon={faEllipsisV} className="w-4 h-4" />
            </button>

            {showDropdown && (
              <div className="absolute top-full right-0 mt-1 w-56 sm:w-60 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50 transform sm:transform-none -translate-x-2 sm:translate-x-0">
                <button
                  onClick={() => {
                    navigate(`/pi-details/${id}`);
                    setShowDropdown(false);
                  }}
                  className="w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-600"
                >
                  <FontAwesomeIcon
                    icon={faEye}
                    className="w-3 h-3 sm:w-4 sm:h-4 text-green-600"
                  />
                  View & Confirm Order
                </button>
                <button
                  onClick={() => {
                    navigate(`/edit-pi/${id}`);
                    setShowDropdown(false);
                  }}
                  className="w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-600"
                >
                  <FontAwesomeIcon
                    icon={faEdit}
                    className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600"
                  />
                  Edit
                </button>
                <button
                  onClick={() => {
                    navigate(`/proforma-invoices/${id}/history`);
                    setShowDropdown(false);
                  }}
                  className="w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-600"
                >
                  <FontAwesomeIcon
                    icon={faHistory}
                    className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600"
                  />
                  History
                </button>
                <button
                  onClick={() => {
                    setShowEmailModal(true);
                    setShowDropdown(false);
                  }}
                  className="w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-600"
                >
                  <FontAwesomeIcon
                    icon={faEnvelope}
                    className="w-3 h-3 sm:w-4 sm:h-4 text-indigo-600"
                  />
                  Email
                </button>
                <button
                  onClick={() => {
                    handleDownloadPdf();
                    setShowDropdown(false);
                  }}
                  disabled={downloading}
                  className="w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-600 disabled:opacity-50"
                >
                  {downloading ? (
                    <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-purple-500"></div>
                  ) : (
                    <FontAwesomeIcon
                      icon={faDownload}
                      className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600"
                    />
                  )}
                  {downloading ? 'Downloading...' : 'Download PDF'}
                </button>
                <button
                  onClick={() => {
                    setConfirmDelete(id);
                    setShowDropdown(false);
                  }}
                  className="w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <FontAwesomeIcon
                    icon={faTrash}
                    className="w-3 h-3 sm:w-4 sm:h-4 text-red-600"
                  />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white pr-16">
          {piNumber}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {formattedDate}
        </p>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6">
        <div className="space-y-3 mb-4">
          <div className="flex justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Client:
            </span>
            <span className="text-sm font-medium text-gray-900 dark:text-white text-right">
              {party?.companyName || 'N/A'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Products:
            </span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {_count?.products || 0} items
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Payment:
            </span>
            <span className="text-sm font-medium text-gray-900 dark:text-white text-right">
              {paymentTermNames[paymentTerm] || paymentTerm}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Container:
            </span>
            <span className="text-sm font-medium text-gray-900 dark:text-white text-right">
              {containerType || 'N/A'}
            </span>
          </div>
        </div>

        <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Total Amount:
            </span>
            <span className="text-lg font-bold text-green-600 dark:text-green-400">
              {formattedAmount}
            </span>
          </div>
        </div>
      </div>

      {/* Email Modal */}
      <EmailInvoiceModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        invoiceId={parseInt(id)}
        defaultEmail={party?.email || ''}
      />

      {/* Delete Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Confirm Delete
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete this invoice?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDelete(id);
                  setConfirmDelete(null);
                }}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
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

const PerformaInvoice: React.FC = () => {
  const navigate = useNavigate();
  const [piList, setPiList] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(true);
  const [deleting, setDeleting] = useState<boolean>(false);
  const fetchPiInvoicesData = async () => {
    try {
      setLoading(true);
      const response = await getAllPiInvoices();
      
      if (response && response.piInvoices && Array.isArray(response.piInvoices)) {
        setPiList(response.piInvoices);
      } else if (Array.isArray(response)) {
        setPiList(response);
      } else {
        setPiList([]);
      }
    } catch (error) {
      console.error('Error fetching PI invoices:', error);
      setPiList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPiInvoicesData();
  }, []);

  // Add refresh function for when returning from add/edit
  useEffect(() => {
    const handleFocus = () => {
      fetchPiInvoicesData();
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  // Debug the piList
  useEffect(() => {
    console.log('Current piList:', piList);
  }, [piList]);

  // Handle PI deletion
  const handleDelete = async (id: string) => {
    try {
      setDeleting(true);
      const result = await deletePiInvoice(id);
      setPiList((prevList) => prevList.filter((pi) => pi.id !== id));
      toast.success(result.message);
    } catch (error) {
      console.error('Error deleting PI invoice:', error);
      toast.error(error.message);
    } finally {
      setDeleting(false);
    }
  };

  // Filter PIs based on search term and status
  const filteredPIs = piList.filter((pi) => {
    // Skip null/undefined items
    if (!pi) return false;

    try {
      const matchesSearch =
        searchTerm === '' ||
        (pi.piNumber &&
          pi.piNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (pi.party?.companyName &&
          pi.party.companyName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()));

      const matchesStatus =
        filterStatus === 'all' ||
        (pi.status && pi.status.toLowerCase() === filterStatus.toLowerCase());

      return matchesSearch && matchesStatus;
    } catch (err) {
      console.error('Error filtering PI:', pi, err);
      return false;
    }
  });

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Proforma Invoices
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage and track all your proforma invoices
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/add-pi"
            className="inline-flex items-center justify-center rounded-md bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700 transition-colors shadow-sm"
          >
            <FontAwesomeIcon icon={faPlus} className="mr-2" />
            Create New Invoice
          </Link>
        </div>
      </div>

      {/* Search and Filter Card */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-5 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <Label htmlFor="search">Search Invoices</Label>
            <div className="relative">
              <Input
                type="text"
                id="search"
                placeholder="Search by PI number or company name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </span>
            </div>
          </div>

          <div>
            <Label htmlFor="status">Filter by Status</Label>
            <Select
              options={[
                { value: 'all', label: 'All Statuses' },
                { value: 'draft', label: 'Draft' },
                { value: 'pending', label: 'Pending' },
                { value: 'confirmed', label: 'Confirmed' },
                { value: 'cancelled', label: 'Cancelled' },
              ]}
              onChange={(value) => setFilterStatus(value)}
              defaultValue={filterStatus}
            />
          </div>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
        </div>
      ) : filteredPIs.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-8 text-center">
          <div className="flex flex-col items-center justify-center py-12">
            <svg
              className="w-16 h-16 text-gray-400 dark:text-gray-600 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              ></path>
            </svg>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Proforma Invoices Found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {searchTerm || filterStatus !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'Get started by creating your first proforma invoice'}
            </p>
            {!searchTerm && filterStatus === 'all' && (
              <Link
                to="/add-pi"
                className="inline-flex items-center justify-center rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 transition-colors"
              >
                <FontAwesomeIcon icon={faPlus} className="mr-2" />
                Create New Invoice
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPIs.map((pi) => (
            <PICard key={pi.id} pi={pi} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
};

export default PerformaInvoice;
