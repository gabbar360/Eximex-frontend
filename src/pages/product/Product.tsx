import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { fetchProducts, deleteProduct } from '../../features/productSlice';
import { getAllCategories } from '../../features/categorySlice';
import { HiEye, HiPencil, HiTrash, HiPlus, HiMagnifyingGlass, HiCube, HiTag, HiFunnel } from 'react-icons/hi2';

const Product: React.FC = () => {
  const dispatch = useDispatch();
  const { products, loading, error } = useSelector(
    (state: any) => state.product
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  const itemsPerPage = 12;

  const { categories } = useSelector((state: any) => state.category);

  useEffect(() => {
    dispatch(fetchProducts() as any);
    dispatch(getAllCategories() as any);
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleDeleteClick = (id: string) => {
    setConfirmDelete(id);
  };

  const handleConfirmDelete = async () => {
    if (!confirmDelete) return;

    try {
      const result = await dispatch(
        deleteProduct(confirmDelete) as any
      ).unwrap();
      toast.success(result.message);
      setConfirmDelete(null);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const filteredProducts = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return Array.isArray(products)
      ? products.filter((product: any) => {
          const matchesSearch = product?.name?.toLowerCase().includes(term) ||
            product?.sku?.toLowerCase().includes(term) ||
            product?.category?.name?.toLowerCase().includes(term);
          
          const matchesCategory = !selectedCategory || product?.categoryId?.toString() === selectedCategory;
          const matchesSubCategory = !selectedSubCategory || product?.subCategoryId?.toString() === selectedSubCategory;
          
          return matchesSearch && matchesCategory && matchesSubCategory;
        })
      : [];
  }, [searchTerm, products, selectedCategory, selectedSubCategory]);

  const availableSubCategories = useMemo(() => {
    if (!selectedCategory || !categories) return [];
    const category = categories.find((cat: any) => cat.id.toString() === selectedCategory);
    return category?.subcategories || [];
  }, [selectedCategory, categories]);

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSelectedSubCategory('');
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const currentProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage]);
  const getProductTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      tiles: 'Tiles',
      bagasse: 'Bagasse',
      fabric: 'Fabric',
      generic: 'Generic',
    };
    return types[type] || type;
  };

  const getUnitLabel = (unit: string) => {
    const units: Record<string, string> = {
      sqm: 'Square Meter',
      kg: 'Kilogram',
      pcs: 'Pieces',
      box: 'Box',
      cbm: 'Cubic Meter',
    };
    return units[unit] || unit;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="p-4 lg:p-6 pt-6 sm:pt-8 lg:pt-12 pb-6 sm:pb-8 lg:pb-12">
        {/* Header */}
        <div className="mb-6">
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/30 p-6 lg:p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-blue-600 shadow-lg">
                  <HiCube className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 mb-1">
                    Products
                  </h1>
                  {/* <p className="text-slate-600 text-sm lg:text-base">Manage your product inventory</p> */}
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative">
                    <HiMagnifyingGlass className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search products..."
                      className="pl-12 pr-4 py-3 w-full sm:w-64 rounded-2xl border border-white/50 bg-white/60 backdrop-blur-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all duration-300 text-sm placeholder-slate-500 shadow-sm"
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                      }}
                    />
                  </div>
                  
                  <div className="relative">
                    <HiFunnel className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <select
                      value={selectedCategory}
                      onChange={(e) => handleCategoryChange(e.target.value)}
                      className="pl-11 pr-4 py-3 w-full sm:w-48 rounded-2xl border border-white/50 bg-white/60 backdrop-blur-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all duration-300 text-sm shadow-sm appearance-none"
                    >
                      <option value="">All Categories</option>
                      {categories?.map((category: any) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {selectedCategory && availableSubCategories.length > 0 && (
                    <div className="relative">
                      <HiFunnel className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <select
                        value={selectedSubCategory}
                        onChange={(e) => {
                          setSelectedSubCategory(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="pl-11 pr-4 py-3 w-full sm:w-48 rounded-2xl border border-white/50 bg-white/60 backdrop-blur-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all duration-300 text-sm shadow-sm appearance-none"
                      >
                        <option value="">All Subcategories</option>
                        {availableSubCategories.map((subCategory: any) => (
                          <option key={subCategory.id} value={subCategory.id}>
                            {subCategory.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
                
                <Link
                  to="/add-product"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-2xl font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-lg flex-shrink-0"
                >
                  <HiPlus className="w-5 h-5 mr-2" />
                  Add Product
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Products Display */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/30 p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg">
              <HiMagnifyingGlass className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">No products found</h3>
            <p className="text-slate-600 mb-6">Add your first product to get started</p>
            <Link
              to="/add-product"
              className="inline-flex items-center px-6 py-3 rounded-2xl font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-lg"
            >
              <HiPlus className="w-5 h-5 mr-2" />
              Add First Product
            </Link>
          </div>
        ) : (
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/30 overflow-hidden">
            {/* Desktop Table View */}
            <div className="hidden lg:block">
              {/* Table Header */}
              <div className="bg-blue-50 border-b border-white/30 p-4">
                <div className="grid grid-cols-7 gap-3 text-sm font-semibold text-slate-700">
                  <div className="flex items-center gap-2">
                    <HiCube className="w-4 h-4 text-blue-600" />
                    <span>Product Name</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <HiTag className="w-4 h-4 text-blue-600" />
                    <span>SKU</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <HiTag className="w-4 h-4 text-blue-600" />
                    <span>Category</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <HiCube className="w-4 h-4 text-blue-600" />
                    <span>Unit Weight</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <HiCube className="w-4 h-4 text-blue-600" />
                    <span>Total Weight</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <HiCube className="w-4 h-4 text-blue-600" />
                    <span>Price</span>
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <HiCube className="w-4 h-4 text-blue-600" />
                    <span>Actions</span>
                  </div>
                </div>
              </div>
              <div className="divide-y divide-white/20">
                {currentProducts.map((product: any) => (
                  <div key={product.id} className="p-4 hover:bg-white/50 transition-all duration-300">
                    <div className="grid grid-cols-7 gap-3 items-center">
                      {/* Product Name */}
                      <div className="flex items-center gap-2">
                        <HiCube className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        <span className="text-slate-800 font-medium truncate" title={product.name}>
                          {product.name}
                        </span>
                      </div>
                      
                      {/* SKU */}
                      <div className="text-slate-700 text-sm">
                        {product.sku || '-'}
                      </div>
                      
                      {/* Category */}
                      <div className="text-slate-700 text-sm">
                        {product.category?.name || '-'}
                      </div>
                      
                      {/* Unit Weight */}
                      <div className="text-slate-700 text-sm">
                        {product.unitWeight && product.weightUnitType
                          ? `${product.unitWeight} ${product.unitWeightUnit} per ${product.weightUnitType}`
                          : product.weight
                            ? `${product.weight} ${product.weightUnit}`
                            : '-'}
                      </div>
                      
                      {/* Total Weight */}
                      <div className="text-slate-700 text-sm">
                        {product.totalGrossWeight
                          ? `${product.totalGrossWeight} ${product.totalGrossWeightUnit}`
                          : '-'}
                      </div>
                      
                      {/* Price */}
                      <div className="text-slate-700 text-sm">
                        {product.price ? `${product.currency} ${product.price}` : '-'}
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          to={`/edit-product/${product.id}`}
                          className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-emerald-500 transition-all duration-300 hover:scale-110 transform"
                        >
                          <HiPencil className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDeleteClick(product.id)}
                          className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-red-500 transition-all duration-300 hover:scale-110 transform"
                        >
                          <HiTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Tablet/Mobile Table View with Horizontal Scroll */}
            <div className="lg:hidden">
              <div className="overflow-x-auto">
                <div className="min-w-[800px]">
                  {/* Table Header */}
                  <div className="bg-blue-50 border-b border-white/30 p-4">
                    <div className="grid grid-cols-7 gap-3 text-sm font-semibold text-slate-700">
                      <div className="flex items-center gap-2">
                        <HiCube className="w-4 h-4 text-blue-600" />
                        <span>Product Name</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <HiTag className="w-4 h-4 text-blue-600" />
                        <span>SKU</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <HiTag className="w-4 h-4 text-blue-600" />
                        <span>Category</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <HiCube className="w-4 h-4 text-blue-600" />
                        <span>Unit Weight</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <HiCube className="w-4 h-4 text-blue-600" />
                        <span>Total Weight</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <HiCube className="w-4 h-4 text-blue-600" />
                        <span>Price</span>
                      </div>
                      <div className="flex items-center justify-end gap-2">
                        <HiCube className="w-4 h-4 text-blue-600" />
                        <span>Actions</span>
                      </div>
                    </div>
                  </div>
                  <div className="divide-y divide-white/20">
                    {currentProducts.map((product: any) => (
                      <div key={product.id} className="p-4 hover:bg-white/50 transition-all duration-300">
                        <div className="grid grid-cols-7 gap-3 items-center">
                          {/* Product Name */}
                          <div className="flex items-center gap-2">
                            <HiCube className="w-4 h-4 text-blue-600 flex-shrink-0" />
                            <span className="text-slate-800 font-medium truncate" title={product.name}>
                              {product.name}
                            </span>
                          </div>
                          
                          {/* SKU */}
                          <div className="text-slate-700 text-sm">
                            {product.sku || '-'}
                          </div>
                          
                          {/* Category */}
                          <div className="text-slate-700 text-sm">
                            {product.category?.name || '-'}
                          </div>
                          
                          {/* Unit Weight */}
                          <div className="text-slate-700 text-sm">
                            {product.unitWeight && product.weightUnitType
                              ? `${product.unitWeight} ${product.unitWeightUnit} per ${product.weightUnitType}`
                              : product.weight
                                ? `${product.weight} ${product.weightUnit}`
                                : '-'}
                          </div>
                          
                          {/* Total Weight */}
                          <div className="text-slate-700 text-sm">
                            {product.totalGrossWeight
                              ? `${product.totalGrossWeight} ${product.totalGrossWeightUnit}`
                              : '-'}
                          </div>
                          
                          {/* Price */}
                          <div className="text-slate-700 text-sm">
                            {product.price ? `${product.currency} ${product.price}` : '-'}
                          </div>
                          
                          {/* Actions */}
                          <div className="flex items-center justify-end space-x-2">
                            <Link
                              to={`/edit-product/${product.id}`}
                              className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-emerald-500 transition-all duration-300 hover:scale-110 transform"
                            >
                              <HiPencil className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => handleDeleteClick(product.id)}
                              className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-red-500 transition-all duration-300 hover:scale-110 transform"
                            >
                              <HiTrash className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pagination */}
        {filteredProducts.length > 0 && (
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/30 p-6 mt-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-600">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredProducts.length)} of {filteredProducts.length} products
              </p>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-xl border border-white/50 text-slate-600 hover:bg-blue-500 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-lg"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-4 py-2 rounded-xl transition-all duration-300 ${
                      currentPage === page
                        ? 'bg-blue-600 text-white font-semibold shadow-lg'
                        : 'text-slate-600 hover:bg-blue-500 hover:text-white hover:shadow-lg'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-xl border border-white/50 text-slate-600 hover:bg-blue-500 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-lg"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl max-w-md w-full p-8 border border-white/30">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-500 flex items-center justify-center shadow-lg">
                <HiTrash className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Delete Product</h3>
              <p className="text-slate-600">Are you sure you want to delete this product? This action cannot be undone.</p>
            </div>
            <div className="flex items-center justify-center space-x-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-6 py-3 rounded-2xl border border-white/50 text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-6 py-3 rounded-2xl bg-red-500 text-white hover:bg-red-600 shadow-lg"
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

export default Product;
