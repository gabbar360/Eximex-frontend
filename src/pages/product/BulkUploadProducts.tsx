import React, { useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
  HiArrowDownTray,
  HiArrowUpTray,
  HiDocument,
  HiCheckCircle,
  HiXCircle,
  HiExclamationTriangle,
  HiInformationCircle,
  HiArrowPath,
  HiMagnifyingGlass,
  HiCloudArrowUp,
} from 'react-icons/hi2';
import { bulkUploadProducts, downloadTemplate, clearBulkUploadResult } from '../../features/productSlice';
import { getAllCategories } from '../../features/categorySlice';

const BulkUploadProducts = () => {
  const dispatch = useDispatch();
  const { bulkUpload } = useSelector((state) => state.product);
  const { categories } = useSelector((state) => state.category);
  const [file, setFile] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categorySearch, setCategorySearch] = useState('');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  
  const { loading: uploading, result, error } = bulkUpload;
  
  // Get result data properly
  const uploadResult = result?.data || result;

  // Filter categories based on search
  const filteredCategories = useMemo(() => {
    if (!categorySearch) return categories || [];
    return (categories || []).filter(category => 
      category.name.toLowerCase().includes(categorySearch.toLowerCase())
    );
  }, [categories, categorySearch]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      const validTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel'
      ];
      
      if (!validTypes.includes(selectedFile.type)) {
        toast.error('Please select an Excel file (.xlsx or .xls)');
        return;
      }

      // Validate file size (5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast.error('File size should be less than 5MB');
        return;
      }

      setFile(selectedFile);
      dispatch(clearBulkUploadResult());
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select an Excel file to upload');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const result = await dispatch(bulkUploadProducts(formData)).unwrap();
      const message = result.message || result.data?.message || `Successfully uploaded ${result.data?.success || result.success} products`;
      
      // Show toast based on results
      if (result.data?.failed > 0) {
        toast.warning(message);
      } else {
        toast.success(message);
      }
    } catch (error) {
      toast.error(error || 'Failed to upload products');
    }
  };

  const downloadErrorReport = () => {
    if (!result?.errors || result.errors.length === 0) return;
    
    const csvContent = [
      ['Row', 'Product Name', 'Error Reason'],
      ...result.errors.map(err => [err.row, err.product, err.error])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'bulk-upload-errors.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    toast.success('Error report downloaded successfully');
  };

  const handleDownloadTemplate = async () => {
    if (!selectedCategory) {
      toast.error('Please select a category first');
      return;
    }
    
    try {
      console.log('Downloading template for category:', selectedCategory);
      
      const baseUrl = import.meta.env.VITE_API_BASE_URL;
      const url = `${baseUrl}/download/template?categoryId=${selectedCategory}`;
      
      console.log('Template URL:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Download error:', errorText);
        throw new Error(`Download failed: ${response.status}`);
      }
      
      const blob = await response.blob();
      console.log('Blob size:', blob.size);
      
      if (blob.size === 0) {
        throw new Error('Empty file received');
      }
      
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = selectedCategory ? `template-${categories.find(c => c.id == selectedCategory)?.name || 'category'}.xlsx` : 'product-template.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      
      toast.success('Excel template downloaded successfully');
    } catch (error) {
      console.error('Template download error:', error);
      toast.error(`Failed to download template: ${error.message}`);
    }
  };

  // Load categories on component mount
  React.useEffect(() => {
    dispatch(getAllCategories({ limit: 1000 }));
  }, [dispatch]);

  const resetUpload = () => {
    setFile(null);
    dispatch(clearBulkUploadResult());
    // Reset file input
    const fileInput = document.getElementById('file-upload');
    if (fileInput) fileInput.value = '';
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-3 sm:p-4">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-800">
                Bulk Upload Products
              </h1>
              
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              {/* Category Search Dropdown */}
              <div className="relative min-w-[280px]">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search and select category..."
                    value={categorySearch}
                    onChange={(e) => {
                      setCategorySearch(e.target.value);
                      setShowCategoryDropdown(true);
                    }}
                    onFocus={() => setShowCategoryDropdown(true)}
                    onBlur={() => setTimeout(() => setShowCategoryDropdown(false), 200)}
                    className="w-full pl-10 pr-10 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-100 transition-all duration-200"
                  />
                  <HiMagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                
                {showCategoryDropdown && (
                  <div className="absolute z-50 w-full mt-2 bg-white border-2 border-slate-200 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                    {filteredCategories.length > 0 ? (
                      filteredCategories.map((category) => (
                        <button
                          key={category.id}
                          onClick={() => {
                            setSelectedCategory(category.id);
                            setCategorySearch(category.name);
                            setShowCategoryDropdown(false);
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors duration-150 border-b border-slate-100 last:border-b-0"
                        >
                          <span className="font-medium text-slate-900">{category.name}</span>
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-slate-500 text-center">
                        No categories found
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <button 
                onClick={handleDownloadTemplate} 
                disabled={!selectedCategory}
className={`inline-flex items-center justify-center px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  selectedCategory 
                    ? 'bg-slate-700 text-white hover:bg-slate-800' 
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <HiArrowDownTray className="w-5 h-5 mr-2" />
                Download Template
              </button>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-slate-700 p-6">
            <h3 className="text-xl font-bold text-white flex items-center">
              <HiDocument className="w-6 h-6 mr-3" />
              Upload Instructions
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                    <span className="text-slate-600 font-bold text-sm">1</span>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Select Category</p>
                    <p className="text-slate-600 text-sm">Choose a category for category-specific packaging fields</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                    <span className="text-slate-700 font-bold text-sm">2</span>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Download Template</p>
                    <p className="text-slate-600 text-sm">Get the Excel template and fill in your product data</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-slate-300 rounded-full flex items-center justify-center">
                    <span className="text-slate-800 font-bold text-sm">3</span>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Upload File</p>
                    <p className="text-slate-600 text-sm">Upload your completed Excel file</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                <h4 className="font-semibold text-slate-900">Important Notes:</h4>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-center"><span className="w-2 h-2 bg-slate-400 rounded-full mr-2"></span>Categories will be created automatically if they don't exist</li>
                  <li className="flex items-center"><span className="w-2 h-2 bg-slate-500 rounded-full mr-2"></span>SKU must be unique across your company</li>
                  <li className="flex items-center"><span className="w-2 h-2 bg-slate-600 rounded-full mr-2"></span>Required fields: Product Name, Category</li>
                  <li className="flex items-center"><span className="w-2 h-2 bg-slate-700 rounded-full mr-2"></span>File size limit: 5MB (.xlsx, .xls)</li>
                </ul>
                {selectedCategory && (
                  <div className="mt-4 p-3 bg-slate-100 border border-slate-200 rounded-lg">
                    <p className="text-slate-800 font-medium text-sm">
                      Selected: {categories?.find(c => c.id == selectedCategory)?.name}
                    </p>
                    <p className="text-slate-600 text-xs mt-1">Template will include packaging hierarchy fields</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-slate-700 p-6">
            <h3 className="text-xl font-bold text-white flex items-center">
              <HiCloudArrowUp className="w-6 h-6 mr-3" />
              Upload Excel File
            </h3>
          </div>
          <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <div className="flex-1">
                <label htmlFor="file-upload" className="block text-sm font-medium text-slate-700 mb-2">
                  Choose Excel File
                </label>
                <input
                  id="file-upload"
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-100 transition-all duration-200 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-slate-50 file:text-slate-700 hover:file:bg-slate-100"
                />
              </div>
              
              <button 
                onClick={handleUpload} 
                disabled={!file || uploading}
                className={`min-w-[160px] px-8 py-2 rounded-xl font-bold text-white transition-all duration-200 flex items-center justify-center mt-6 ${
                  !file || uploading 
                    ? 'bg-slate-400 cursor-not-allowed' 
                    : 'bg-slate-800 hover:bg-slate-900'
                }`}
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <HiArrowUpTray className="w-5 h-5 mr-3" />
                    Upload Products
                  </>
                )}
              </button>
            </div>

            {file && (
              <div className="bg-slate-50 border-2 border-slate-200 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mr-4">
                      <HiDocument className="h-6 w-6 text-slate-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{file.name}</p>
                      <p className="text-slate-600 text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <button
                    onClick={resetUpload}
                    className="text-red-500 hover:text-red-700 transition-colors duration-200"
                  >
                    <HiXCircle className="w-6 h-6" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Upload Results */}
        {result && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-slate-700 p-6">
              <h3 className="text-xl font-bold text-white flex items-center">
                <HiInformationCircle className="w-6 h-6 mr-3" />
                Upload Results
              </h3>
            </div>
            <div className="p-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-slate-600 uppercase">Total Products</p>
                      <p className="text-xl font-bold text-slate-900 mt-1">{result.total}</p>
                    </div>
                    <div className="w-10 h-10 bg-slate-200 rounded-lg flex items-center justify-center">
                      <HiDocument className="w-5 h-5 text-slate-600" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-green-600 uppercase">Successful</p>
                      <p className="text-xl font-bold text-green-900 mt-1">{result.success}</p>
                    </div>
                    <div className="w-10 h-10 bg-green-200 rounded-lg flex items-center justify-center">
                      <HiCheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                  </div>
                </div>
              
                <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-red-600 uppercase">Failed</p>
                      <p className="text-xl font-bold text-red-900 mt-1">{result.failed}</p>
                    </div>
                    <div className="w-10 h-10 bg-red-200 rounded-lg flex items-center justify-center">
                      <HiXCircle className="w-5 h-5 text-red-600" />
                    </div>
                  </div>
                </div>
            </div>

            {/* Success Products */}
            {result.successProducts && result.successProducts.length > 0 && (
              <div className="mb-6">
                <h4 className="text-md font-semibold text-green-700 mb-3 flex items-center">
                  <HiCheckCircle className="w-4 h-4 mr-2" />
                  Successfully Uploaded Products
                </h4>
                <div className="bg-green-50 rounded-lg p-4 border border-green-200 max-h-40 overflow-y-auto">
                  <div className="space-y-2">
                    {result.successProducts.map((product, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span className="text-green-800">
                          <strong>Row {product.row}:</strong> {product.product}
                        </span>
                        <span className="text-green-600 font-mono text-xs bg-green-100 px-2 py-1 rounded">
                          {product.sku}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Error Products */}
            {result.errors && result.errors.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-md font-semibold text-red-700 flex items-center">
                    <HiXCircle className="w-4 h-4 mr-2" />
                    Failed Products ({result.errors.length})
                  </h4>
                  <button
                    onClick={downloadErrorReport}
                    className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-red-700 bg-red-100 border border-red-300 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    <HiArrowDownTray className="w-3 h-3 mr-1" />
                    Download Error Report
                  </button>
                </div>
                <div className="bg-red-50 rounded-lg border border-red-200 max-h-60 overflow-y-auto">
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead className="bg-red-100">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-red-700 uppercase tracking-wider">Row</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-red-700 uppercase tracking-wider">Product Name</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-red-700 uppercase tracking-wider">Error Reason</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-red-200">
                        {result.errors.map((error, index) => (
                          <tr key={index} className="hover:bg-red-75">
                            <td className="px-4 py-2 text-sm font-medium text-red-900">{error.row}</td>
                            <td className="px-4 py-2 text-sm text-red-800">{error.product}</td>
                            <td className="px-4 py-2 text-sm text-red-700">
                              <div className="flex items-center">
                                <HiExclamationTriangle className="w-3 h-3 mr-1 text-red-500" />
                                {error.error}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-6 border-t border-gray-200">
                <button
                  onClick={resetUpload}
                  className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-white bg-slate-600 rounded-xl hover:bg-slate-700 transition-all duration-200"
                >
                  <HiArrowPath className="w-5 h-5 mr-2" />
                  Upload Another File
                </button>
                
                {result.failed > 0 && (
                  <button
                    onClick={handleDownloadTemplate}
                    className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-white bg-slate-700 rounded-xl hover:bg-slate-800 transition-all duration-200"
                  >
                    <HiArrowDownTray className="w-5 h-5 mr-2" />
                    Download Fresh Template
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BulkUploadProducts;