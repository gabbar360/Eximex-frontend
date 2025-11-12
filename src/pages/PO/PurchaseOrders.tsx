import { useDispatch, useSelector } from 'react-redux';
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchPurchaseOrders, deletePurchaseOrder, downloadPurchaseOrderPDF } from '../../features/purchaseOrderSlice';
import { toast } from 'react-toastify';

import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import PageMeta from '../../components/common/PageMeta';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEdit,
  faTrash,
  faEye,
  faDownload,
} from '@fortawesome/free-solid-svg-icons';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '../../components/ui/table';

const PurchaseOrders: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [downloadingPdf, setDownloadingPdf] = useState<string | null>(null);

  const loadPurchaseOrders = async () => {
    setLoading(true);
    try {
      const response = await dispatch(fetchPurchaseOrders()).unwrap();
      console.log('Purchase Orders API Response:', response);
      
      // Handle different response structures
      let purchaseOrdersData = [];
      if (response?.data?.purchaseOrders) {
        purchaseOrdersData = response.data.purchaseOrders;
      } else if (response?.purchaseOrders) {
        purchaseOrdersData = response.purchaseOrders;
      } else if (Array.isArray(response?.data)) {
        purchaseOrdersData = response.data;
      } else if (Array.isArray(response)) {
        purchaseOrdersData = response;
      }
      
      console.log('Processed Purchase Orders Data:', purchaseOrdersData);
      setPurchaseOrders(purchaseOrdersData);
    } catch (error: any) {
      console.error('Error fetching purchase orders:', error);
      toast.error(error.message);
      setPurchaseOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPurchaseOrders();
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleDeleteClick = (id: string) => {
    setConfirmDelete(id);
  };

  const handleConfirmDelete = async () => {
    if (!confirmDelete) return;

    try {
      const result =
        await dispatch(deletePurchaseOrder(confirmDelete)).unwrap();
      toast.success(result.message || 'Purchase order deleted successfully');
      setConfirmDelete(null);
      loadPurchaseOrders();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete purchase order');
    }
  };

  const handleDownload = async (id: string, poNumber: string) => {
    setDownloadingPdf(id);
    try {
      const pdfBlob = await dispatch(downloadPurchaseOrderPDF(id)).unwrap();

      // Create download link
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `PO-${poNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('PDF downloaded successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to download PDF');
    } finally {
      setDownloadingPdf(null);
    }
  };

  const filteredPurchaseOrders = Array.isArray(purchaseOrders)
    ? purchaseOrders.filter(
        (po: any) =>
          po?.poNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          po?.vendorName?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const getStatusColor = (status: string) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800',
      completed: 'bg-blue-100 text-blue-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getTypeColor = (type: string) => {
    const colors = {
      import: 'bg-blue-100 text-blue-800',
      export: 'bg-green-100 text-green-800',
      domestic: 'bg-orange-100 text-orange-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <>
      <PageMeta
        title="Purchase Orders | EximEx Dashboard"
        description="Manage your purchase orders in EximEx Dashboard"
      />
      <PageBreadcrumb pageTitle="Purchase Orders" />

      <div className="rounded-sm bg-white shadow-default dark:border-strokedark dark:bg-gray-900">
        <div className="py-6 px-4 md:px-6 xl:px-7.5">
          <div className="flex items-center justify-between">
            <h4 className="text-xl font-semibold text-black dark:text-white">
              Purchase Orders
            </h4>
            <Link
              to="/purchase-orders/create"
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-black hover:bg-opacity-90 dark:text-white"
            >
              <svg className="mr-2" width="16" height="16" viewBox="0 0 16 16">
                <path
                  d="M8 3.33331V12.6666M3.33337 7.99998H12.6667"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Create Purchase Order
            </Link>
          </div>

          <div className="mt-4">
            <input
              type="text"
              placeholder="Search purchase orders..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full md:w-1/3 rounded-lg border border-gray-300 dark:text-gray-400 bg-transparent py-2 px-4 outline-none focus:border-primary focus:shadow-sm dark:border-gray-700 dark:bg-gray-800"
            />
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] mx-4 md:mx-6 xl:mx-7.5">
          <div className="max-w-full overflow-x-auto">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredPurchaseOrders.length === 0 ? (
              <div className="flex justify-center items-center h-64">
                <p className="text-gray-500 dark:text-gray-400">
                  No purchase orders found.{' '}
                  {searchTerm && 'Try a different search term.'}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      PO Number
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Supplier
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Type
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Status
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Total Amount
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Date
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-end text-theme-xs dark:text-gray-400"
                    >
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {filteredPurchaseOrders.map((po: any) => (
                    <TableRow key={po.id}>
                      <TableCell className="px-5 py-4 text-start">
                        <div className="flex flex-col gap-1">
                          <Link
                            to={`/purchase-orders/${po.id}`}
                            className="font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400"
                          >
                            {po.poNumber}
                          </Link>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {po.vendorName || 'N/A'}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-start">
                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                          DOMESTIC
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-start">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(po.status?.toLowerCase())}`}
                        >
                          {po.status?.toUpperCase() || 'N/A'}
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {po.totalAmount && po.currency
                          ? `${po.currency} ${po.totalAmount.toFixed(2)}`
                          : 'N/A'}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {po.poDate
                          ? new Date(po.poDate).toLocaleDateString()
                          : 'N/A'}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-end text-theme-sm dark:text-gray-400">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/purchase-orders/edit/${po.id}`}
                            className="hover:text-primary"
                            title="Edit"
                          >
                            <FontAwesomeIcon
                              icon={faEdit}
                              className="text-green-500 hover:text-green-700"
                            />
                          </Link>
                          <button
                            onClick={() => handleDownload(po.id, po.poNumber)}
                            disabled={downloadingPdf === po.id}
                            className="hover:text-primary disabled:opacity-50"
                            title="Download PDF"
                          >
                            {downloadingPdf === po.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-500"></div>
                            ) : (
                              <FontAwesomeIcon
                                icon={faDownload}
                                className="text-purple-500 hover:text-purple-700"
                              />
                            )}
                          </button>
                          <button
                            onClick={() => handleDeleteClick(po.id)}
                            className="hover:text-primary"
                            title="Delete"
                          >
                            <FontAwesomeIcon
                              icon={faTrash}
                              className="text-red-500 hover:text-red-700"
                            />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-999999 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-black dark:text-white">
              Confirm Delete
            </h3>
            <p className="mb-6 text-gray-600 dark:text-gray-400">
              Are you sure you want to delete this purchase order? This action
              cannot be undone.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setConfirmDelete(null)}
                className="rounded-md bg-gray-200 py-2 px-4 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="rounded-md bg-red-500 py-2 px-4 text-white hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PurchaseOrders;
