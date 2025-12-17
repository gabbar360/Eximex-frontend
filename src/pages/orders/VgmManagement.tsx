import React, { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import {
  HiPencil,
  HiTrash,
  HiPlus,
  HiMagnifyingGlass,
  HiDocumentText,
  HiCube,
  HiArrowDownTray,
} from 'react-icons/hi2';
import { Pagination } from 'antd';
import { fetchOrders } from '../../features/orderSlice';
import { downloadVgmPdf, deleteVgm } from '../../features/vgmSlice';
import { toast } from 'react-toastify';

const VgmManagement: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { orders = [], loading = false } = useSelector(
    (state: any) => state.order || {}
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  }, []);

  const handleDeleteClick = (id: string) => {
    setConfirmDelete(id);
  };

  const handleConfirmDelete = async () => {
    if (!confirmDelete) return;

    try {
      await dispatch(deleteVgm(confirmDelete)).unwrap();
      toast.success('VGM document deleted successfully');
      setConfirmDelete(null);
      // Refresh orders to update the UI
      dispatch(fetchOrders());
    } catch (error: any) {
      console.log('Delete VGM error:', error);
      toast.error(error || 'Failed to delete VGM document');
    }
  };

  const handlePDFDownload = async (order: any) => {
    try {
      toast.info('Preparing VGM PDF download...', { autoClose: 2000 });
      const vgmId = order.piInvoice?.vgmDocuments?.[0]?.id;
      if (!vgmId) {
        toast.error('No VGM found for this order');
        return;
      }

      const response = await dispatch(downloadVgmPdf(vgmId)).unwrap();

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;

      const contentDisposition = response.headers['content-disposition'];
      let filename = `VGM-${order.orderNumber}.pdf`;

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('VGM PDF downloaded successfully');
    } catch (error) {
      console.error('Error downloading VGM PDF:', error);
      toast.error('Failed to download VGM PDF');
    }
  };

  const filteredOrders = orders.filter((order: any) => {
    const hasVgm =
      order.piInvoice?.vgmDocuments && order.piInvoice.vgmDocuments.length > 0;
    if (!hasVgm) return false;
    return (
      order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.piInvoice?.party?.companyName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
  });

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-slate-600 mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading VGM documents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-2 lg:p-4">
        <div className="mb-3">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-3 lg:p-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-slate-700 shadow-lg">
                  <HiDocumentText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 mb-1">
                    VGM Management
                  </h1>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <HiMagnifyingGlass className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search orders..."
                    className="pl-12 pr-4 py-3 w-full sm:w-64 rounded-lg border border-gray-300 bg-white focus:border-slate-500 focus:ring-2 focus:ring-slate-200 transition-all duration-300 text-sm placeholder-gray-500 shadow-sm"
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                </div>

                <button
                  onClick={() => navigate('/vgm/create')}
                  className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-semibold text-white bg-slate-700 hover:bg-slate-800 shadow-lg flex-shrink-0"
                >
                  <HiPlus className="w-5 h-5 mr-2" />
                  Add VGM
                </button>
              </div>
            </div>
          </div>
        </div>

        {paginatedOrders.length === 0 && !loading ? (
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/30 p-12 text-center">
            <div className="w-10 h-10 mx-auto mb-6 rounded-2xl bg-slate-600 flex items-center justify-center shadow-lg">
              <HiMagnifyingGlass className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">
              No VGM documents found
            </h3>
            <p className="text-slate-600 mb-6">
              Create your first VGM document to get started
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <div className="min-w-[800px]">
                <div className="bg-gray-50 border-b border-gray-200 p-4">
                  <div className="grid grid-cols-7 gap-3 text-sm font-semibold text-slate-700">
                    <div className="flex items-center gap-2">
                      <HiDocumentText className="w-4 h-4 text-slate-600" />
                      <span>Order Number</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <HiCube className="w-4 h-4 text-slate-600" />
                      <span>Company</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <HiCube className="w-4 h-4 text-slate-600" />
                      <span>Verified By</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <HiCube className="w-4 h-4 text-slate-600" />
                      <span>VGM Weight</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <HiCube className="w-4 h-4 text-slate-600" />
                      <span>Method</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <HiCube className="w-4 h-4 text-slate-600" />
                      <span>Status</span>
                    </div>
                    <div className="flex items-center justify-end gap-2">
                      <HiCube className="w-4 h-4 text-slate-600" />
                      <span>Actions</span>
                    </div>
                  </div>
                </div>
                <div className="divide-y divide-white/20">
                  {paginatedOrders.map((order: any) => {
                    const vgmDoc = order.piInvoice?.vgmDocuments?.[0];
                    const hasVgm = vgmDoc && Object.keys(vgmDoc).length > 0;
                    const vgmWeight = vgmDoc?.verifiedGrossMass || 0;

                    return (
                      <div
                        key={order.id}
                        className="p-4 hover:bg-white/50 transition-all duration-300"
                      >
                        <div className="grid grid-cols-7 gap-3 items-center">
                          <div className="flex items-center gap-2">
                            <HiDocumentText className="w-4 h-4 text-slate-600 flex-shrink-0" />
                            <span
                              className="text-slate-800 font-medium truncate"
                              title={order.orderNumber}
                            >
                              #{order.orderNumber}
                            </span>
                          </div>

                          <div className="text-slate-700 text-sm">
                            {order.piInvoice?.party?.companyName || '-'}
                          </div>

                          <div className="text-slate-700 text-sm">
                            {vgmDoc?.verifiedBy || '-'}
                          </div>

                          <div className="text-slate-700 text-sm font-medium">
                            {vgmWeight > 0 ? `${vgmWeight}kg` : '-'}
                          </div>

                          <div className="text-slate-700 text-sm">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                vgmDoc?.method === 'METHOD_1'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-green-100 text-green-800'
                              }`}
                            >
                              {vgmDoc?.method === 'METHOD_1'
                                ? 'Method 1'
                                : 'Method 2'}
                            </span>
                          </div>

                          <div className="text-slate-700 text-sm">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                hasVgm
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              {hasVgm ? 'Complete' : 'Pending'}
                            </span>
                          </div>

                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handlePDFDownload(order)}
                              className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-blue-600 transition-all duration-300"
                              title="Download VGM PDF"
                            >
                              <HiArrowDownTray className="w-4 h-4" />
                            </button>
                            <Link
                              to={`/vgm/${vgmDoc?.id}`}
                              className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-emerald-600 transition-all duration-300"
                              title="Edit VGM"
                            >
                              <HiPencil className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => handleDeleteClick(vgmDoc?.id)}
                              className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-red-600 transition-all duration-300"
                              title="Delete VGM"
                            >
                              <HiTrash className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {filteredOrders.length > 0 && (
          <div className="flex justify-center mt-6">
            <Pagination
              current={currentPage}
              total={filteredOrders.length}
              pageSize={pageSize}
              onChange={(page) => setCurrentPage(page)}
            />
          </div>
        )}
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-8 border border-gray-200">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-lg bg-red-600 flex items-center justify-center shadow-lg">
                <HiTrash className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">
                Delete VGM Document
              </h3>
              <p className="text-slate-600">
                Are you sure you want to delete this VGM document? This action
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
  );
};

export default VgmManagement;
