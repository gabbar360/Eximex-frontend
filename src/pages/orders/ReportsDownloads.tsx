import React, { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { HiMagnifyingGlass, HiDocumentText, HiCube, HiArrowDownTray } from 'react-icons/hi2';
import { Pagination } from 'antd';
import { fetchOrders } from '../../features/orderSlice';

import { toast } from 'react-toastify';
import axiosInstance from '../../utils/axiosInstance';

const ReportsDownloads: React.FC = () => {
  const dispatch = useDispatch();
  const { orders = [], loading = false } = useSelector((state: any) => state.order || {});
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  }, []);

  const handleCommercialInvoiceDownload = async (order: any) => {
    try {
      toast.info('Preparing Commercial Invoice PDF...', { autoClose: 2000 });
      const response = await axiosInstance.get(`/orders/${order.id}/download-invoice-pdf`, {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Commercial-Invoice-${order.orderNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Commercial Invoice downloaded successfully');
    } catch (error) {
      console.error('Error downloading Commercial Invoice:', error);
      toast.error('Failed to download Commercial Invoice');
    }
  };

  const handleBLDraftDownload = async (order: any) => {
    try {
      toast.info('Preparing BL Draft PDF...', { autoClose: 2000 });
      const response = await axiosInstance.get(`/orders/${order.id}/bl-draft-pdf`, {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `BL-Draft-${order.orderNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('BL Draft downloaded successfully');
    } catch (error) {
      console.error('Error downloading BL Draft:', error);
      toast.error('Failed to download BL Draft');
    }
  };



  const filteredOrders = orders.filter((order: any) => {
    return (
      order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.piInvoice?.party?.companyName?.toLowerCase().includes(searchTerm.toLowerCase())
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
          <p className="text-slate-600 font-medium">Loading reports...</p>
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
                    Reports & Downloads
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
              </div>
            </div>
          </div>
        </div>

        {paginatedOrders.length === 0 && !loading ? (
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/30 p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-slate-600 flex items-center justify-center shadow-lg">
              <HiMagnifyingGlass className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">No orders found</h3>
            <p className="text-slate-600 mb-6">No orders available for download</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="hidden lg:block">
              <div className="bg-gray-50 border-b border-gray-200 p-4">
                <div className="grid grid-cols-5 gap-3 text-sm font-semibold text-slate-700">
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
                    <span>Total Amount</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <HiCube className="w-4 h-4 text-slate-600" />
                    <span>Commercial Invoice</span>
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <HiCube className="w-4 h-4 text-slate-600" />
                    <span>BL Draft</span>
                  </div>
                </div>
              </div>
              <div className="divide-y divide-white/20">
                {paginatedOrders.map((order: any) => {

                  return (
                    <div key={order.id} className="p-4 hover:bg-white/50 transition-all duration-300">
                      <div className="grid grid-cols-5 gap-3 items-center">
                        <div className="flex items-center gap-2">
                          <HiDocumentText className="w-4 h-4 text-slate-600 flex-shrink-0" />
                          <span className="text-slate-800 font-medium truncate" title={order.orderNumber}>
                            #{order.orderNumber}
                          </span>
                        </div>
                        
                        <div className="text-slate-700 text-sm">
                          {order.piInvoice?.party?.companyName || '-'}
                        </div>
                        
                        <div className="text-slate-700 text-sm font-medium">
                          ${order.totalAmount?.toLocaleString() || '0'}
                        </div>
                        
                        <div className="text-slate-700 text-sm">
                          <button
                            onClick={() => handleCommercialInvoiceDownload(order)}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
                          >
                            <HiArrowDownTray className="w-3 h-3" />
                            Download
                          </button>
                        </div>
                        
                        <div className="flex items-center justify-end">
                          <button
                            onClick={() => handleBLDraftDownload(order)}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium bg-orange-100 text-orange-800 hover:bg-orange-200 transition-colors"
                          >
                            <HiArrowDownTray className="w-3 h-3" />
                            Download
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
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
    </div>
  );
};

export default ReportsDownloads;