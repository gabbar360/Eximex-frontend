import { useDispatch, useSelector } from 'react-redux';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { deletePackingList, downloadPackingListPdf, downloadBLDraftPdf } from '../../features/packingListSlice';
import { deleteVgm, downloadVgmPdf } from '../../features/vgmSlice';
import { downloadOrderInvoice } from '../../features/orderSlice';


import {
  faCalendarAlt,
  faBuilding,
  faBarcode,
  faShip,
  faBox,
  faShieldAlt,
  faFileAlt,
  faFileInvoice,
  faPaperclip,
  faStickyNote,
  faEdit,
  faTrash,
  faCheck,
  faClock,
  faCircle,
  faEye,
  faTruck,
  faCheckCircle,
  faMoneyBillWave,
  faPlus,
  faTimes,
  faList,
  faDownload,
  faWeight,
  faRulerHorizontal,
  faBalanceScale,
} from '@fortawesome/free-solid-svg-icons';

interface OrderCardProps {
  order: any;
  onDelete: (id: string) => void;
  onPackingDelete?: (packingId: string) => void;
  onDownloadInvoice?: (orderId: string) => void;
  onViewInvoice?: (orderId: string) => void;
  downloadingOrder?: string | null;
  onOrderSelect?: (orderId: number) => void;
}

const OrderCard: React.FC<OrderCardProps> = ({
  order,
  onDelete,
  onPackingDelete,
  onDownloadInvoice,
  onViewInvoice,
  downloadingOrder,
  onOrderSelect,
}) => {
  const dispatch = useDispatch();
  const [editableField, setEditableField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState<string>('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDownloadingBL, setIsDownloadingBL] = useState(false);
  const [confirmDeletePacking, setConfirmDeletePacking] = useState(false);
  const [isDownloadingVgm, setIsDownloadingVgm] = useState(false);
  const [confirmDeleteVgm, setConfirmDeleteVgm] = useState<{
    show: boolean;
    vgmId: string;
    vgmNumber: string;
  }>({ show: false, vgmId: '', vgmNumber: '' });

  // Local VGM documents state to avoid full page reloads on delete
  const [vgmDocuments, setVgmDocuments] = useState<any[]>(
    order.piInvoice?.vgmDocuments || []
  );

  // Keep local state in sync when order prop changes
  React.useEffect(() => {
    setVgmDocuments(order.piInvoice?.vgmDocuments || []);
  }, [order.piInvoice?.vgmDocuments]);

  // Safe trim function to prevent "trim is not a function" errors
  const safeTrim = (value) => {
    const result = typeof value === 'string' ? value.trim() : '';
    return result;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: {
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        label: 'Pending',
      },
      confirmed: {
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        label: 'Confirmed',
      },
      processing: {
        color: 'bg-purple-100 text-purple-800 border-purple-200',
        label: 'In-Production',
      },
      shipped: {
        color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
        label: 'Shipped',
      },
      delivered: {
        color: 'bg-green-100 text-green-800 border-green-200',
        label: 'Delivered',
      },
      cancelled: {
        color: 'bg-red-100 text-red-800 border-red-200',
        label: 'Cancelled',
      },
    };
    return (
      statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const statusConfig = {
      pending: {
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        label: 'Pending',
      },
      partial: {
        color: 'bg-orange-100 text-orange-800 border-orange-200',
        label: 'Partial',
      },
      paid: {
        color: 'bg-green-100 text-green-800 border-green-200',
        label: 'Paid',
      },
      overdue: {
        color: 'bg-red-100 text-red-800 border-red-200',
        label: 'Overdue',
      },
    };
    return (
      statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    );
  };

  const timelineSteps = [
    {
      id: 'advance_payment',
      label: 'Advance Payment',
      status: 'completed',
      date: '2023-06-12',
      icon: faMoneyBillWave,
    },
    {
      id: 'vendor_finalized',
      label: 'Vendor Finalized',
      status: 'completed',
      date: '2023-06-14',
      icon: faBuilding,
    },
    {
      id: 'production_started',
      label: 'Production Started',
      status: 'completed',
      date: '2023-06-16',
      icon: faBox,
    },
    {
      id: 'quality_check',
      label: 'Quality Check',
      status: 'in_progress',
      date: '',
      icon: faCheckCircle,
    },
    {
      id: 'dispatched',
      label: 'Dispatched',
      status: 'pending',
      date: '',
      icon: faTruck,
    },
    {
      id: 'delivered',
      label: 'Delivered',
      status: 'pending',
      date: '',
      icon: faCheck,
    },
  ];

  // Store current order ID in localStorage before navigation
  const handleNavigation = () => {
    localStorage.setItem('selectedOrderId', order.id.toString());
    onOrderSelect?.(order.id);
  };

  const handleEdit = (field: string, currentValue: string) => {
    setEditableField(field);
    setTempValue(currentValue);
  };

  const handleSave = async () => {
    if (!editableField || !tempValue.trim()) {
      handleCancel();
      return;
    }

    try {
      // You can replace this with your actual API call
      const updateData = {
        [editableField]: tempValue.trim(),
      };

      console.log(`Updating order ${order.id}:`, updateData);

      // Example API call (uncomment and modify as needed):
      // await dispatch(updateOrder({ id: order.id, data: updateData })).unwrap();

      // For now, just update locally
      order[editableField] = tempValue.trim();

      setEditableField(null);
      setTempValue('');

      // Show success message
      // toast.success(`${editableField} updated successfully!`);
    } catch (error) {
      console.error('Error updating field:', error);
      // toast.error('Failed to update field');
    }
  };

  const handleCancel = () => {
    setEditableField(null);
    setTempValue('');
  };

  // Check if shipment details exist
  const hasShipmentDetails =
    order.bookingNumber ||
    order.bookingDate ||
    order.vesselVoyageInfo ||
    order.containerNumber ||
    order.sealNumber ||
    order.wayBillNumber ||
    order.truckNumber;

  // Check if VGM documents exist
  const hasVgmDocuments =
    order.piInvoice?.vgmDocuments && order.piInvoice.vgmDocuments.length > 0;

  // Check if packing list exists - check both possible locations
  const hasPackingList = 
    (order.packingList && Object.keys(order.packingList).length > 0 && order.packingList.containers && order.packingList.containers.length > 0) ||
    (order.piInvoice?.packagingSteps && order.piInvoice.packagingSteps.length > 0 && order.piInvoice.packagingSteps[0]?.notes?.containers && order.piInvoice.packagingSteps[0].notes.containers.length > 0);

  // Extract containers from the correct location
  const containers = order.packingList?.containers?.length > 0 
    ? order.packingList.containers 
    : order.piInvoice?.packagingSteps?.[0]?.notes?.containers || [];

  // Debug: Log packing list data to console
  React.useEffect(() => {
    const containers = order.packingList?.containers || order.piInvoice?.packagingSteps?.[0]?.notes?.containers || [];
    console.log(`🔍 OrderCard Debug - Order ${order.id}:`, {
      hasPackingList,
      packingListExists: !!order.packingList,
      packingList: order.packingList,
      packagingStepsExists: !!order.piInvoice?.packagingSteps,
      packagingSteps: order.piInvoice?.packagingSteps,
      packagingStepsCount: order.piInvoice?.packagingSteps?.length,
      extractedContainers: containers,
      containersLength: containers?.length,
    });
  }, [order.packingList, order.piInvoice?.packagingSteps, hasPackingList]);

  const handlePackingListPDF = async () => {
    setIsDownloading(true);
    toast.info('Preparing PDF download...', { autoClose: 2000 });

    try {
      const packingId = order.packingListId || order.piInvoiceId;
      if (!packingId) {
        toast.error('No packing list ID found');
        setIsDownloading(false);
        return;
      }

      const response = await dispatch(downloadPackingListPdf(packingId)).unwrap();

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `packing-list-${order.orderNumber || packingId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Packing list PDF downloaded successfully!');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('Failed to download packing list PDF');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleBLDraftPDF = async () => {
    setIsDownloadingBL(true);
    toast.info('Preparing BL draft PDF download...', { autoClose: 2000 });

    try {
      const orderId = order.id;
      if (!orderId) {
        toast.error('No order ID found');
        setIsDownloadingBL(false);
        return;
      }

      const response = await dispatch(downloadBLDraftPdf(orderId)).unwrap();

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `bl-draft-${order.orderNumber || orderId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('BL draft PDF downloaded successfully!');
    } catch (error) {
      console.error('Error downloading BL draft PDF:', error);
      toast.error('Failed to download BL draft PDF');
    } finally {
      setIsDownloadingBL(false);
    }
  };

  const handlePackingListDelete = () => {
    if (onPackingDelete) {
      const packingId = order.packingListId || order.piInvoiceId;
      onPackingDelete(packingId);
    } else {
      setConfirmDeletePacking(true);
    }
  };

  const handleConfirmPackingDelete = async () => {
    try {
      const packingId = order.packingListId || order.piInvoiceId;
      if (!packingId) {
        toast.error('No packing list ID found');
        return;
      }

      await dispatch(deletePackingList(packingId)).unwrap();
      toast.success('Packing list deleted successfully!');
      setConfirmDeletePacking(false);
      window.location.reload();
    } catch (error) {
      console.error('Error deleting packing list:', error);
      toast.error('Failed to delete packing list');
    }
  };

  const handleVgmPDF = async (vgmId: string, vgmNumber?: string) => {
    setIsDownloadingVgm(true);
    toast.info('Preparing VGM PDF download...', { autoClose: 2000 });

    try {
      const response = await dispatch(downloadVgmPdf(vgmId)).unwrap();

      // Try to get filename from response headers first
      const disposition =
        response.headers?.['content-disposition'] ||
        response.headers?.['Content-Disposition'];
      let filenameFromHeader: string | null = null;
      if (disposition) {
        const match = /filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i.exec(
          disposition
        );
        if (match) {
          filenameFromHeader = decodeURIComponent(match[1] || match[2]);
        }
      }

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      // Fallbacks if vgmNumber is missing
      const vgmFromState = vgmDocuments.find((d) => d.id === vgmId);
      const safeNumber =
        vgmNumber ||
        vgmFromState?.vgmNumber ||
        vgmFromState?.containerNumber ||
        order?.containerNumber ||
        order?.orderNumber ||
        null;

      link.download = filenameFromHeader || `VGM-${safeNumber || vgmId}.pdf`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('VGM PDF downloaded successfully!');
    } catch (error) {
      console.error('Error downloading VGM PDF:', error);
      toast.error('Failed to download VGM PDF');
    } finally {
      setIsDownloadingVgm(false);
    }
  };

  const handleVgmDelete = (vgmId: string, vgmNumber: string) => {
    setConfirmDeleteVgm({ show: true, vgmId, vgmNumber });
  };

  const handleConfirmVgmDelete = async () => {
    try {
      await dispatch(deleteVgm(confirmDeleteVgm.vgmId)).unwrap();
      toast.success('VGM document deleted successfully!');

      // Update local list without reloading the page
      setVgmDocuments((prev) =>
        prev.filter((d) => d.id !== confirmDeleteVgm.vgmId)
      );

      setConfirmDeleteVgm({ show: false, vgmId: '', vgmNumber: '' });
    } catch (error) {
      console.error('Error deleting VGM document:', error);
      toast.error('Failed to delete VGM document');
    }
  };

  const getVgmStatusBadge = (status) => {
    const statusConfig = {
      PENDING: {
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        label: 'Pending',
      },
      VERIFIED: {
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        label: 'Verified',
      },
      SUBMITTED: {
        color: 'bg-purple-100 text-purple-800 border-purple-200',
        label: 'Submitted',
      },
      APPROVED: {
        color: 'bg-green-100 text-green-800 border-green-200',
        label: 'Approved',
      },
      REJECTED: {
        color: 'bg-red-100 text-red-800 border-red-200',
        label: 'Rejected',
      },
    };
    return statusConfig[status] || statusConfig.PENDING;
  };

  const renderEditableField = (
    field: string,
    value: string,
    placeholder: string = '',
    inputType: string = 'text'
  ) => {
    if (editableField === field) {
      return (
        <div className="flex items-center gap-2">
          <input
            type={inputType}
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            className="px-2 py-1 border border-blue-300 dark:border-blue-600 rounded text-sm focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder={placeholder}
            autoFocus
          />
          <button
            onClick={handleSave}
            className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 text-xs"
          >
            ✓
          </button>
          <button
            onClick={handleCancel}
            className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-xs"
          >
            ✕
          </button>
        </div>
      );
    }

    return (
      <span
        onClick={() =>
          handleEdit(
            field,
            inputType === 'date' && value ? value.split('T')[0] : value || ''
          )
        }
        className={`cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 px-1 py-0.5 rounded ${
          !value ? 'text-gray-400 dark:text-gray-500 italic' : ''
        }`}
      >
        {value || placeholder}
      </span>
    );
  };

  const orderStatus = getStatusBadge(order.orderStatus || 'pending');
  const paymentStatus = getPaymentStatusBadge(order.paymentStatus || 'pending');

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 p-3 sm:p-6 mb-4">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="bg-blue-50 dark:bg-blue-900/30 p-2 rounded-lg flex-shrink-0">
            <FontAwesomeIcon
              icon={faFileAlt}
              className="text-blue-600 dark:text-blue-400"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white truncate">
              #{order.orderNumber || 'ORD1023'}
            </h3>
            <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              <FontAwesomeIcon icon={faCalendarAlt} className="text-xs" />
              <span>{formatDate(order.createdAt)}</span>
            </div>
          </div>
        </div>

        <div className="w-full sm:w-auto flex-shrink-0">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 sm:gap-3 flex-1 sm:flex-none min-w-0">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                <FontAwesomeIcon
                  icon={faBuilding}
                  className="text-white text-xs"
                />
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-sm sm:text-base text-gray-800 dark:text-white truncate">
                  {order.piInvoice?.party?.companyName || 'Company Name'}
                </div>
                <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                  {order.piInvoice?.party?.country || 'Location'}
                </div>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 dark:text-white">
                ${order.totalAmount?.toLocaleString() || '0'}
              </div>
              {/* Advance Payment Display */}
              {(order.pi?.advanceAmount ||
                order.piInvoice?.advanceAmount ||
                order.advanceAmount) &&
                (order.pi?.advanceAmount ||
                  order.piInvoice?.advanceAmount ||
                  order.advanceAmount) > 0 && (
                  <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                    Advance: $
                    {(
                      order.pi?.advanceAmount ||
                      order.piInvoice?.advanceAmount ||
                      order.advanceAmount
                    ).toLocaleString()}
                  </div>
                )}
              <span
                className={`inline-flex px-2 sm:px-3 py-1 text-xs font-semibold rounded-full border ${orderStatus.color} mt-1`}
              >
                {orderStatus.label}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Shipment & Logistics Details */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Shipment & Logistics Details
          </h4>
          {hasShipmentDetails && (
            <Link
              to={`/edit-order/${order.id}`}
              onClick={handleNavigation}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm flex items-center gap-1"
            >
              <FontAwesomeIcon icon={faEdit} className="text-xs" />
              Edit
            </Link>
          )}
        </div>

        {hasShipmentDetails ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {order.bookingNumber && (
              <div className="bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-lg flex items-center gap-2 text-xs sm:text-sm border border-gray-200 dark:border-gray-600">
                <FontAwesomeIcon
                  icon={faBarcode}
                  className="text-gray-600 dark:text-gray-400 flex-shrink-0"
                />
                <span className="text-gray-700 dark:text-gray-300 hidden sm:inline">
                  Booking:
                </span>
                <span className="font-medium text-gray-900 dark:text-white truncate">
                  {order.bookingNumber}
                </span>
              </div>
            )}
            {order.bookingDate && (
              <div className="bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-lg flex items-center gap-2 text-xs sm:text-sm border border-gray-200 dark:border-gray-600">
                <FontAwesomeIcon
                  icon={faCalendarAlt}
                  className="text-purple-600 dark:text-purple-400 flex-shrink-0"
                />
                <span className="text-gray-700 dark:text-gray-300 hidden sm:inline">
                  Date:
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatDate(order.bookingDate)}
                </span>
              </div>
            )}
            {order.vesselVoyageInfo && (
              <div className="bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-lg flex items-center gap-2 text-xs sm:text-sm border border-gray-200 dark:border-gray-600">
                <FontAwesomeIcon
                  icon={faShip}
                  className="text-blue-600 dark:text-blue-400 flex-shrink-0"
                />
                <span className="text-gray-700 dark:text-gray-300 hidden sm:inline">
                  Vessel:
                </span>
                <span className="font-medium text-gray-900 dark:text-white truncate">
                  {order.vesselVoyageInfo}
                </span>
              </div>
            )}
            {order.containerNumber && (
              <div className="bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-lg flex items-center gap-2 text-xs sm:text-sm border border-gray-200 dark:border-gray-600">
                <FontAwesomeIcon
                  icon={faBox}
                  className="text-orange-600 dark:text-orange-400 flex-shrink-0"
                />
                <span className="text-gray-700 dark:text-gray-300 hidden sm:inline">
                  Container:
                </span>
                <span className="font-medium text-gray-900 dark:text-white truncate">
                  {order.containerNumber}
                </span>
              </div>
            )}
            {order.sealNumber && (
              <div className="bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-lg flex items-center gap-2 text-xs sm:text-sm border border-gray-200 dark:border-gray-600">
                <FontAwesomeIcon
                  icon={faShieldAlt}
                  className="text-green-600 dark:text-green-400 flex-shrink-0"
                />
                <span className="text-gray-700 dark:text-gray-300 hidden sm:inline">
                  Seal:
                </span>
                <span className="font-medium text-gray-900 dark:text-white truncate">
                  {order.sealNumber}
                </span>
              </div>
            )}
            {order.wayBillNumber && (
              <div className="bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-lg flex items-center gap-2 text-xs sm:text-sm border border-gray-200 dark:border-gray-600">
                <FontAwesomeIcon
                  icon={faFileAlt}
                  className="text-indigo-600 dark:text-indigo-400 flex-shrink-0"
                />
                <span className="text-gray-700 dark:text-gray-300 hidden sm:inline">
                  Way Bill:
                </span>
                <span className="font-medium text-gray-900 dark:text-white truncate">
                  {order.wayBillNumber}
                </span>
              </div>
            )}
            {order.truckNumber && (
              <div className="bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-lg flex items-center gap-2 text-xs sm:text-sm border border-gray-200 dark:border-gray-600">
                <FontAwesomeIcon
                  icon={faTruck}
                  className="text-red-600 dark:text-red-400 flex-shrink-0"
                />
                <span className="text-gray-700 dark:text-gray-300 hidden sm:inline">
                  Truck:
                </span>
                <span className="font-medium text-gray-900 dark:text-white truncate">
                  {order.truckNumber}
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-lg p-6 text-center">
            <FontAwesomeIcon
              icon={faShip}
              className="text-gray-400 dark:text-gray-500 text-2xl mb-3"
            />
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              No shipment details added yet
            </p>
            <Link
              to={`/edit-order/${order.id}`}
              onClick={handleNavigation}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <FontAwesomeIcon icon={faPlus} />
              Add Shipment Details
            </Link>
          </div>
        )}
      </div>

      {/* <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
          Production & Fulfillment Stages
        </h4>
        <div className="relative">
          <div className="hidden md:block">
            <div className="absolute top-6 left-6 right-6 h-0.5 bg-gray-200 dark:bg-gray-600"></div>
            <div className="flex justify-between relative">
              {timelineSteps.map((step, index) => (
                <div key={step.id} className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center border-2 z-10 ${
                      step.status === 'completed'
                        ? 'bg-green-500 border-green-500 text-white'
                        : step.status === 'in_progress'
                          ? 'bg-yellow-500 border-yellow-500 text-white animate-pulse'
                          : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500'
                    }`}
                  >
                    {step.status === 'completed' ? (
                      <FontAwesomeIcon icon={faCheck} className="text-sm" />
                    ) : step.status === 'in_progress' ? (
                      <FontAwesomeIcon icon={faClock} className="text-sm" />
                    ) : (
                      <FontAwesomeIcon icon={faCircle} className="text-sm" />
                    )}
                  </div>
                  <div className="mt-2 text-center">
                    <div
                      className={`text-xs font-medium ${
                        step.status === 'completed'
                          ? 'text-green-600 dark:text-green-400'
                          : step.status === 'in_progress'
                            ? 'text-yellow-600 dark:text-yellow-400'
                            : 'text-gray-400 dark:text-gray-500'
                      }`}
                    >
                      {step.label}
                    </div>
                    {step.date && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {step.date}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="md:hidden space-y-3">
            {timelineSteps.map((step, index) => (
              <div key={step.id} className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center border-2 flex-shrink-0 ${
                    step.status === 'completed'
                      ? 'bg-green-500 border-green-500 text-white'
                      : step.status === 'in_progress'
                        ? 'bg-yellow-500 border-yellow-500 text-white animate-pulse'
                        : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500'
                  }`}
                >
                  {step.status === 'completed' ? (
                    <FontAwesomeIcon icon={faCheck} className="text-xs" />
                  ) : step.status === 'in_progress' ? (
                    <FontAwesomeIcon icon={faClock} className="text-xs" />
                  ) : (
                    <FontAwesomeIcon icon={faCircle} className="text-xs" />
                  )}
                </div>
                <div className="flex-1">
                  <div
                    className={`text-sm font-medium ${
                      step.status === 'completed'
                        ? 'text-green-600 dark:text-green-400'
                        : step.status === 'in_progress'
                          ? 'text-yellow-600 dark:text-yellow-400'
                          : 'text-gray-400 dark:text-gray-500'
                    }`}
                  >
                    {step.label}
                  </div>
                  {step.date && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {step.date}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div> */}

      {/* Packing List Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Packing List
          </h4>
        </div>

        {hasPackingList ? (
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="mt-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Container Details:
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Last updated: {new Date().toLocaleDateString()}
                </div>
              </div>

              {/* Mobile Card View */}
              <div className="block sm:hidden space-y-3">
                {containers?.map((container, index) => (
                  <div
                    key={index}
                    className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-600"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <FontAwesomeIcon
                          icon={faBox}
                          className="text-orange-500 text-sm flex-shrink-0"
                        />
                        <span className="font-medium text-sm text-gray-900 dark:text-white truncate">
                          {container.containerNumber ||
                            `Container ${index + 1}`}
                        </span>
                      </div>
                      {container.sealNumber && (
                        <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-600 dark:text-gray-400">
                          Seal: {container.sealNumber}
                        </span>
                      )}
                    </div>

                    {container.descriptionOfGoods && (
                      <div className="text-xs text-gray-600 dark:text-gray-400 mb-3 truncate">
                        {container.descriptionOfGoods}
                      </div>
                    )}

                    <div className="space-y-2 mb-3">
                      <div className="flex items-center gap-2">
                        <FontAwesomeIcon
                          icon={faBox}
                          className="text-orange-500 w-4"
                        />
                        <span className="text-gray-600 dark:text-gray-400 text-sm">
                          Boxes:
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white text-sm">
                          {container.totalNoOfBoxes || container.noOfBoxes || 0}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FontAwesomeIcon
                          icon={faWeight}
                          className="text-blue-500 w-4"
                        />
                        <span className="text-gray-600 dark:text-gray-400 text-sm">
                          Net Weight:
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white text-sm">
                          {container.totalNetWeight || container.netWeight || 0}
                          kg
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FontAwesomeIcon
                          icon={faWeight}
                          className="text-purple-500 w-4"
                        />
                        <span className="text-gray-600 dark:text-gray-400 text-sm">
                          Gross Weight:
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white text-sm">
                          {container.totalGrossWeight ||
                            container.grossWeight ||
                            0}
                          kg
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FontAwesomeIcon
                          icon={faRulerHorizontal}
                          className="text-green-500 w-4"
                        />
                        <span className="text-gray-600 dark:text-gray-400 text-sm">
                          Volume:
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white text-sm">
                          {container.totalMeasurement || container.volume || 0}
                          m³
                        </span>
                      </div>
                    </div>

                    {container.products && container.products.length > 0 && (
                      <div className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                        Products:{' '}
                        <span className="font-medium">
                          {container.products.length} item(s)
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                        <Link
                          to={`/packing-list/${order.id}`}
                          onClick={handleNavigation}
                          className="p-2 rounded-lg transition-colors text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 flex-1 text-center"
                          title="Edit Packing List"
                        >
                          <FontAwesomeIcon icon={faEdit} className="text-sm" />
                        </Link>
                        <button
                          onClick={handlePackingListPDF}
                          disabled={isDownloading}
                          className={`p-2 rounded-lg transition-colors flex-1 text-center ${
                            isDownloading
                              ? 'text-gray-400 cursor-not-allowed'
                              : 'text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20'
                          }`}
                          title={
                            isDownloading ? 'Downloading...' : 'Download Packing List PDF'
                          }
                        >
                          {isDownloading ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-500"></div>
                          ) : (
                            <FontAwesomeIcon
                              icon={faDownload}
                              className="text-sm"
                            />
                          )}
                        </button>
                        <button
                          onClick={handlePackingListDelete}
                          className="p-2 rounded-lg transition-colors text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex-1 text-center"
                          title="Delete Packing List"
                        >
                          <FontAwesomeIcon icon={faTrash} className="text-sm" />
                        </button>
                      </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden sm:block overflow-x-auto">
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Container
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Description
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Boxes
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell">
                          Net Wt
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell">
                          Gross Wt
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden xl:table-cell">
                          Volume
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
                      {containers?.map(
                        (container, index) => (
                          <tr
                            key={index}
                            className="hover:bg-gray-50 dark:hover:bg-gray-700"
                          >
                            <td className="px-3 py-3">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {container.containerNumber ||
                                  `Container ${index + 1}`}
                              </div>
                              {container.sealNumber && (
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  Seal: {container.sealNumber}
                                </div>
                              )}
                              <div className="lg:hidden mt-1 text-xs text-gray-500 dark:text-gray-400">
                                <div className="flex gap-3">
                                  <span>
                                    Net:{' '}
                                    {container.totalNetWeight ||
                                      container.netWeight ||
                                      0}
                                    kg
                                  </span>
                                  <span>
                                    Gross:{' '}
                                    {container.totalGrossWeight ||
                                      container.grossWeight ||
                                      0}
                                    kg
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="px-3 py-3">
                              <div className="text-sm text-gray-900 dark:text-white max-w-xs">
                                <div
                                  className="truncate"
                                  title={
                                    container.descriptionOfGoods ||
                                    'No description'
                                  }
                                >
                                  {container.descriptionOfGoods ||
                                    'No description'}
                                </div>
                                {container.products &&
                                  container.products.length > 0 && (
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                      {container.products.length} product(s)
                                    </div>
                                  )}
                              </div>
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap">
                              <div className="flex items-center text-sm text-gray-900 dark:text-white">
                                <FontAwesomeIcon
                                  icon={faBox}
                                  className="text-orange-500 mr-2 text-xs"
                                />
                                {container.totalNoOfBoxes ||
                                  container.noOfBoxes ||
                                  0}
                              </div>
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap hidden lg:table-cell">
                              <div className="flex items-center text-sm text-gray-900 dark:text-white">
                                <FontAwesomeIcon
                                  icon={faWeight}
                                  className="text-blue-500 mr-2 text-xs"
                                />
                                {container.totalNetWeight ||
                                  container.netWeight ||
                                  0}
                                kg
                              </div>
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap hidden lg:table-cell">
                              <div className="flex items-center text-sm text-gray-900 dark:text-white">
                                <FontAwesomeIcon
                                  icon={faWeight}
                                  className="text-purple-500 mr-2 text-xs"
                                />
                                {container.totalGrossWeight ||
                                  container.grossWeight ||
                                  0}
                                kg
                              </div>
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap hidden xl:table-cell">
                              <div className="flex items-center text-sm text-gray-900 dark:text-white">
                                <FontAwesomeIcon
                                  icon={faRulerHorizontal}
                                  className="text-green-500 mr-2 text-xs"
                                />
                                {container.totalMeasurement ||
                                  container.volume ||
                                  0}
                                m³
                              </div>
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap">
                              <div className="flex items-center space-x-2">
                                  <Link
                                    to={`/packing-list/${order.id}`}
                                    onClick={handleNavigation}
                                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                    title="Edit Packing List"
                                  >
                                    <FontAwesomeIcon
                                      icon={faEdit}
                                      className="text-sm"
                                    />
                                  </Link>
                                  <button
                                    onClick={handlePackingListPDF}
                                    disabled={isDownloading}
                                    className={`p-1 rounded ${
                                      isDownloading
                                        ? 'text-gray-400 cursor-not-allowed'
                                        : 'text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20'
                                    }`}
                                    title={
                                      isDownloading
                                        ? 'Downloading...'
                                        : 'Download Packing List PDF'
                                    }
                                  >
                                    {isDownloading ? (
                                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-green-500"></div>
                                    ) : (
                                      <FontAwesomeIcon
                                        icon={faDownload}
                                        className="text-sm"
                                      />
                                    )}
                                  </button>
                                  <button
                                    onClick={handlePackingListDelete}
                                    className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                                    title="Delete"
                                  >
                                    <FontAwesomeIcon
                                      icon={faTrash}
                                      className="text-sm"
                                    />
                                  </button>
                                </div>
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-lg p-6 text-center">
            <FontAwesomeIcon
              icon={faList}
              className="text-gray-400 dark:text-gray-500 text-2xl mb-3"
            />
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              No packing list created yet
            </p>
            <Link
              to={`/packing-list/${order.id}`}
              onClick={handleNavigation}
              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <FontAwesomeIcon icon={faPlus} />
              Add Packing List
            </Link>
          </div>
        )}
      </div>

      {/* VGM Documents Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            VGM Documents
          </h4>
        </div>

        {vgmDocuments && vgmDocuments.length > 0 ? (
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 sm:p-4">
            <div className="space-y-3">
              {vgmDocuments.map((vgm, index) => {
                const statusBadge = getVgmStatusBadge(vgm.status);
                return (
                  <div
                    key={vgm.id || index}
                    className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-600"
                  >
                    {/* Mobile Layout */}
                    <div className="block sm:hidden">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <FontAwesomeIcon
                            icon={faBalanceScale}
                            className="text-blue-500 text-sm flex-shrink-0"
                          />
                          <span className="font-medium text-sm text-gray-900 dark:text-white truncate">
                            {vgm.vgmNumber || 'VGM Document'}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2 mb-3">
                        <div className="flex items-center gap-2">
                          <FontAwesomeIcon
                            icon={faBox}
                            className="text-orange-500 w-4"
                          />
                          <span className="text-gray-600 dark:text-gray-400 text-sm">
                            Container:
                          </span>
                          <span className="font-medium text-gray-900 dark:text-white text-sm">
                            {vgm.containerNumber || 'N/A'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FontAwesomeIcon
                            icon={faWeight}
                            className="text-purple-500 w-4"
                          />
                          <span className="text-gray-600 dark:text-gray-400 text-sm">
                            VGM:
                          </span>
                          <span className="font-medium text-gray-900 dark:text-white text-sm">
                            {vgm.verifiedGrossMass} KG
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FontAwesomeIcon
                            icon={faShieldAlt}
                            className="text-green-500 w-4"
                          />
                          <span className="text-gray-600 dark:text-gray-400 text-sm">
                            Method:
                          </span>
                          <span className="font-medium text-gray-900 dark:text-white text-sm">
                            {vgm.method?.replace('_', ' ') || 'METHOD 2'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FontAwesomeIcon
                            icon={faCalendarAlt}
                            className="text-blue-500 w-4"
                          />
                          <span className="text-gray-600 dark:text-gray-400 text-sm">
                            Date:
                          </span>
                          <span className="font-medium text-gray-900 dark:text-white text-sm">
                            {vgm.verificationDate
                              ? new Date(
                                  vgm.verificationDate
                                ).toLocaleDateString()
                              : 'N/A'}
                          </span>
                        </div>
                      </div>

                      <div className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                        Verified by:{' '}
                        <span className="font-medium">
                          {vgm.verifiedBy || 'N/A'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link
                          to={`/vgm/edit/${vgm.id}`}
                          onClick={handleNavigation}
                          className="p-2 rounded-lg transition-colors text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 flex-1 text-center"
                          title="Edit VGM Document"
                        >
                          <FontAwesomeIcon icon={faEdit} className="text-sm" />
                        </Link>
                        <button
                          onClick={() => handleVgmPDF(vgm.id, vgm.vgmNumber)}
                          disabled={isDownloadingVgm}
                          className={`p-2 rounded-lg transition-colors flex-1 text-center ${
                            isDownloadingVgm
                              ? 'text-gray-400 cursor-not-allowed'
                              : 'text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20'
                          }`}
                          title={
                            isDownloadingVgm
                              ? 'Downloading...'
                              : 'Download VGM PDF'
                          }
                        >
                          {isDownloadingVgm ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-500"></div>
                          ) : (
                            <FontAwesomeIcon
                              icon={faDownload}
                              className="text-sm"
                            />
                          )}
                        </button>
                        <button
                          onClick={() => handleVgmDelete(vgm.id, vgm.vgmNumber)}
                          className="p-2 rounded-lg transition-colors text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex-1 text-center"
                          title="Delete VGM Document"
                        >
                          <FontAwesomeIcon icon={faTrash} className="text-sm" />
                        </button>
                      </div>
                    </div>

                    {/* Desktop Layout */}
                    <div className="hidden sm:block">
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <FontAwesomeIcon
                              icon={faBalanceScale}
                              className="text-blue-500 text-sm flex-shrink-0"
                            />
                            <span className="font-medium text-sm text-gray-900 dark:text-white truncate">
                              {vgm.vgmNumber || 'VGM Document'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <Link
                              to={`/vgm/edit/${vgm.id}`}
                              onClick={handleNavigation}
                              className="p-2 rounded-lg transition-colors text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                              title="Edit VGM Document"
                            >
                              <FontAwesomeIcon
                                icon={faEdit}
                                className="text-xs"
                              />
                            </Link>
                            <button
                              onClick={() =>
                                handleVgmPDF(vgm.id, vgm.vgmNumber)
                              }
                              disabled={isDownloadingVgm}
                              className={`p-2 rounded-lg transition-colors ${
                                isDownloadingVgm
                                  ? 'text-gray-400 cursor-not-allowed'
                                  : 'text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20'
                              }`}
                              title={
                                isDownloadingVgm
                                  ? 'Downloading...'
                                  : 'Download VGM PDF'
                              }
                            >
                              {isDownloadingVgm ? (
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-green-500"></div>
                              ) : (
                                <FontAwesomeIcon
                                  icon={faDownload}
                                  className="text-xs"
                                />
                              )}
                            </button>
                            <button
                              onClick={() =>
                                handleVgmDelete(vgm.id, vgm.vgmNumber)
                              }
                              className="p-2 rounded-lg transition-colors text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                              title="Delete VGM Document"
                            >
                              <FontAwesomeIcon
                                icon={faTrash}
                                className="text-xs"
                              />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
                          <div className="flex items-center gap-1">
                            <FontAwesomeIcon
                              icon={faBox}
                              className="text-orange-500 flex-shrink-0"
                            />
                            <span className="text-gray-600 dark:text-gray-400">
                              Container:
                            </span>
                            <span className="font-medium text-gray-900 dark:text-white truncate">
                              {vgm.containerNumber || 'N/A'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <FontAwesomeIcon
                              icon={faWeight}
                              className="text-purple-500 flex-shrink-0"
                            />
                            <span className="text-gray-600 dark:text-gray-400">
                              VGM:
                            </span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {vgm.verifiedGrossMass} KG
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <FontAwesomeIcon
                              icon={faShieldAlt}
                              className="text-green-500 flex-shrink-0"
                            />
                            <span className="text-gray-600 dark:text-gray-400">
                              Method:
                            </span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {vgm.method?.replace('_', ' ') || 'METHOD 2'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <FontAwesomeIcon
                              icon={faCalendarAlt}
                              className="text-blue-500 flex-shrink-0"
                            />
                            <span className="text-gray-600 dark:text-gray-400">
                              Date:
                            </span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {vgm.verificationDate
                                ? new Date(
                                    vgm.verificationDate
                                  ).toLocaleDateString()
                                : 'N/A'}
                            </span>
                          </div>
                        </div>

                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          Verified by:{' '}
                          <span className="font-medium">
                            {vgm.verifiedBy || 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-lg p-6 text-center">
            <FontAwesomeIcon
              icon={faBalanceScale}
              className="text-gray-400 dark:text-gray-500 text-2xl mb-3"
            />
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              No VGM documents created yet
            </p>
            <Link
              to={`/vgm/create?piInvoiceId=${
                order.piInvoiceId || order.piInvoice?.id
              }`}
              onClick={handleNavigation}
              className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <FontAwesomeIcon icon={faPlus} />
              Create VGM Document
            </Link>
          </div>
        )}
      </div>

      {/* Bottom Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4 border-t border-gray-100 dark:border-gray-700">
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          {order.piInvoiceId || order.piInvoice?.id ? (
            <Link
              to={`/pi-details/${order.piInvoiceId || order.piInvoice?.id}`}
              className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <FontAwesomeIcon icon={faEye} className="text-xs" />
              <span className="hidden sm:inline">View PI</span>
              <span className="sm:hidden">PI</span>
            </Link>
          ) : (
            <button
              className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-400 dark:text-gray-500 cursor-not-allowed"
              disabled
            >
              <FontAwesomeIcon icon={faEye} className="text-xs" />
              <span className="hidden sm:inline">View PI</span>
              <span className="sm:hidden">PI</span>
            </button>
          )}
          <button className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            <FontAwesomeIcon icon={faFileInvoice} className="text-xs" />
            <span className="hidden sm:inline">View Invoice</span>
            <span className="sm:hidden">Invoice</span>
          </button>
          <button className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            <FontAwesomeIcon icon={faPaperclip} className="text-xs" />
            <span className="hidden sm:inline">Attachments (3)</span>
            <span className="sm:hidden">Files</span>
          </button>
          <button className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            <FontAwesomeIcon icon={faStickyNote} className="text-xs" />
            <span className="hidden sm:inline">Notes</span>
            <span className="sm:hidden">Notes</span>
          </button>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Link
            to={`/edit-order/${order.id}`}
            onClick={handleNavigation}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center gap-2 text-xs sm:text-sm font-medium transition-colors flex-1 sm:flex-none justify-center"
          >
            <FontAwesomeIcon icon={faEdit} className="text-xs" />
            <span>Edit Order</span>
          </Link>
          {onViewInvoice && (
            <button
              onClick={() => onViewInvoice(order.id)}
              className="text-blue-500 hover:text-blue-700 p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
              title="View Invoice"
            >
              <FontAwesomeIcon icon={faEye} className="text-sm" />
            </button>
          )}
          <button
            onClick={async () => {
              try {
                toast.info('Preparing commercial invoice PDF download...', { autoClose: 2000 });
                const result = await dispatch(downloadOrderInvoice(order.id)).unwrap();
                toast.success(`Commercial invoice PDF downloaded successfully!`);
              } catch (error) {
                console.error('Error downloading commercial invoice PDF:', error);
                toast.error('Failed to download commercial invoice PDF');
              }
            }}
            disabled={downloadingOrder === order.id}
            className="text-purple-500 hover:text-purple-700 p-2 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors disabled:opacity-50"
            title="Download Commercial Invoice PDF"
          >
            {downloadingOrder === order.id ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-500"></div>
            ) : (
              <FontAwesomeIcon icon={faDownload} className="text-sm" />
            )}
          </button>
          <button
            onClick={handleBLDraftPDF}
            disabled={isDownloadingBL}
            className={`p-2 rounded-lg transition-colors ${
              isDownloadingBL
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-orange-500 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-900/20'
            }`}
            title={isDownloadingBL ? 'Downloading...' : 'Download BL Draft PDF'}
          >
            {isDownloadingBL ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
            ) : (
              <FontAwesomeIcon icon={faFileAlt} className="text-sm" />
            )}
          </button>
          <button
            onClick={() => onDelete(order.id)}
            className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <FontAwesomeIcon icon={faTrash} className="text-sm" />
          </button>
        </div>
      </div>

      {/* Delete Packing List Confirmation Modal - Only show if no parent handler */}
      {!onPackingDelete && confirmDeletePacking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl dark:bg-gray-800 transform transition-all">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
              <FontAwesomeIcon icon={faTrash} className="text-red-600" />
            </div>
            <h3 className="mb-2 text-lg sm:text-xl font-semibold text-center text-gray-800 dark:text-white">
              Delete Packing List
            </h3>
            <p className="mb-6 text-sm sm:text-base text-center text-gray-600 dark:text-gray-400">
              Are you sure you want to delete this packing list? This will
              remove all container data, product information, and cannot be
              undone.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setConfirmDeletePacking(false)}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPackingDelete}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete Packing List
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete VGM Confirmation Modal */}
      {confirmDeleteVgm.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl dark:bg-gray-800 transform transition-all">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
              <FontAwesomeIcon icon={faTrash} className="text-red-600" />
            </div>
            <h3 className="mb-2 text-lg sm:text-xl font-semibold text-center text-gray-800 dark:text-white">
              Delete VGM Document
            </h3>
            <p className="mb-6 text-sm sm:text-base text-center text-gray-600 dark:text-gray-400">
              Are you sure you want to delete VGM document{' '}
              <strong>{confirmDeleteVgm.vgmNumber}</strong>? This action cannot
              be undone.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() =>
                  setConfirmDeleteVgm({ show: false, vgmId: '', vgmNumber: '' })
                }
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmVgmDelete}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete VGM
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderCard;
