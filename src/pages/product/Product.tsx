import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { fetchProducts, deleteProduct } from '../../features/productSlice';
import { getAllCategories } from '../../features/categorySlice';
import {
  HiPencil,
  HiTrash,
  HiPlus,
  HiMagnifyingGlass,
  HiCube,
  HiTag,
  HiFunnel,
  HiChevronDown,
} from 'react-icons/hi2';
import { Pagination } from 'antd';
import { useDebounce } from '../../utils/useDebounce';
import SEOHead from '../../components/common/SEOHead';

const Product: React.FC = () => {
  const dispatch = useDispatch();
  const { products, loading, pagination } = useSelector(
    (state: any) => state.product
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [wasSearching, setWasSearching] = useState(false);

  // Dropdown states
  const [categorySearch, setCategorySearch] = useState('');
  const [subcategorySearch, setSubcategorySearch] = useState('');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showSubcategoryDropdown, setShowSubcategoryDropdown] = useState(false);

  const categoryRef = useRef(null);
  const subcategoryRef = useRef(null);

  const { categories } = useSelector((state: any) => state.category);

  // SearchableDropdown Component
  const SearchableDropdown = ({
    label,
    value,
    options,
    onSelect,
    searchValue,
    onSearchChange,
    isOpen,
    onToggle,
    placeholder,
    dropdownRef,
    disabled = false,
  }) => {
    const selectedOption = options.find(
      (opt) => opt.id?.toString() === value?.toString()
    );

    return (
      <div className="relative" ref={dropdownRef}>
        <div
          className={`w-full pl-11 pr-4 py-3 border border-gray-300 bg-white rounded-lg cursor-pointer flex items-center justify-between transition-all duration-300 shadow-sm ${
            disabled
              ? 'bg-gray-100 cursor-not-allowed'
              : 'hover:border-slate-400 focus-within:ring-2 focus-within:ring-slate-200 focus-within:border-slate-500'
          }`}
          onClick={() => !disabled && onToggle()}
        >
          <HiFunnel className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <span
            className={`text-sm ${selectedOption ? 'text-slate-900' : 'text-slate-500'}`}
          >
            {selectedOption ? selectedOption.name : placeholder}
          </span>
          <HiChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
        </div>

        {isOpen && !disabled && (
          <div
            className="absolute z-50 w-full bg-white border border-gray-200 rounded-lg shadow-xl"
            style={{ top: '100%', marginTop: '4px' }}
          >
            <div className="p-3 border-b border-gray-100">
              <div className="relative">
                <HiMagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder={`Search ${label.toLowerCase()}...`}
                  value={searchValue}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                  onClick={(e) => e.stopPropagation()}
                  autoFocus
                />
              </div>
            </div>
            <div className="max-h-60 overflow-y-auto">
              {options.length === 0 ? (
                <div className="px-4 py-3 text-slate-500 text-sm text-center">
                  No {label.toLowerCase()} found
                </div>
              ) : (
                options.map((option) => (
                  <div
                    key={option.id}
                    className={`px-4 py-3 hover:bg-slate-50 cursor-pointer text-sm transition-colors duration-150 ${
                      option.id?.toString() === value?.toString()
                        ? 'bg-slate-100 text-slate-900 font-medium'
                        : 'text-slate-700'
                    }`}
                    onClick={() => {
                      onSelect(option.id);
                      onToggle();
                    }}
                  >
                    {option.name}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (categoryRef.current && !categoryRef.current.contains(event.target)) {
        setShowCategoryDropdown(false);
      }
      if (
        subcategoryRef.current &&
        !subcategoryRef.current.contains(event.target)
      ) {
        setShowSubcategoryDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    dispatch(
      fetchProducts({
        page: currentPage,
        limit: pageSize,
        search: '',
        categoryId: selectedCategory || undefined,
        subCategoryId: selectedSubCategory || undefined,
      }) as any
    );
    dispatch(getAllCategories() as any);
  }, [dispatch, currentPage, pageSize, selectedCategory, selectedSubCategory]);

  // Initial load
  useEffect(() => {
    dispatch(
      fetchProducts({
        page: 1,
        limit: 10,
        search: '',
      }) as any
    );
  }, [dispatch]);

  const { debouncedCallback: debouncedSearch } = useDebounce(
    (value: string) => {
      setWasSearching(true);
      dispatch(
        fetchProducts({
          page: 1,
          limit: pageSize,
          search: value,
          categoryId: selectedCategory || undefined,
          subCategoryId: selectedSubCategory || undefined,
        }) as any
      );
    },
    500
  );

  const handleSearch = useCallback(
    (value: string) => {
      setSearchTerm(value);
      setCurrentPage(1);
      debouncedSearch(value);
    },
    [debouncedSearch, pageSize, selectedCategory, selectedSubCategory]
  );

  // Restore focus after search results load
  useEffect(() => {
    if (wasSearching && !loading && searchInputRef.current) {
      searchInputRef.current.focus();
      setWasSearching(false);
    }
  }, [loading, wasSearching]);

  const handleDeleteClick = (id: string) => {
    setConfirmDelete(id);
  };

  const handleConfirmDelete = async () => {
    if (!confirmDelete) return;

    try {
      const result = await dispatch(
        deleteProduct(confirmDelete) as any
      ).unwrap();
      setConfirmDelete(null);

      dispatch(
        fetchProducts({
          page: currentPage,
          limit: pageSize,
          search: searchTerm,
          categoryId: selectedCategory || undefined,
          subCategoryId: selectedSubCategory || undefined,
        }) as any
      );

      toast.success(result.message);
    } catch (error: any) {
      toast.error(error);
    }
  };

  const availableSubCategories = useMemo(() => {
    if (!selectedCategory || !categories) return [];
    const category = categories.find(
      (cat: any) => cat.id.toString() === selectedCategory
    );
    return category?.subcategories || [];
  }, [selectedCategory, categories]);

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSelectedSubCategory('');
    setCurrentPage(1);

    dispatch(
      fetchProducts({
        page: 1,
        limit: pageSize,
        search: searchTerm,
        categoryId: categoryId || undefined,
        subCategoryId: undefined,
      }) as any
    );
  };
  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-slate-600 mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title="Products - EximEx | Global Import Export Trading Platform"
        description="Manage your product inventory on EximEx. Add, edit, and organize products for seamless import-export operations with comprehensive product management tools."
        url="https://eximexperts.in/products"
      />
      <div className="min-h-screen bg-gray-50">
        <div className="p-2 lg:p-4">
          {/* Header */}
          <div className="mb-3">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-3 lg:p-4">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-slate-700 shadow-lg">
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
                        ref={searchInputRef}
                        type="text"
                        placeholder="Search products..."
                        className="pl-12 pr-4 py-3 w-full sm:w-64 rounded-lg border border-gray-300 bg-white focus:border-slate-500 focus:ring-2 focus:ring-slate-200 transition-all duration-300 text-sm placeholder-gray-500 shadow-sm"
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                      />
                    </div>

                    <div className="w-full sm:w-48">
                      <SearchableDropdown
                        label="Category"
                        value={selectedCategory}
                        options={[
                          { id: '', name: 'All Categories' },
                          ...(categories || [])
                            .filter((category: any) =>
                              category.name
                                .toLowerCase()
                                .includes(categorySearch.toLowerCase())
                            )
                            .map((category: any) => ({
                              id: category.id,
                              name: category.name,
                            })),
                        ]}
                        onSelect={(value) => {
                          handleCategoryChange(value);
                          setCategorySearch('');
                        }}
                        searchValue={categorySearch}
                        onSearchChange={setCategorySearch}
                        isOpen={showCategoryDropdown}
                        onToggle={() =>
                          setShowCategoryDropdown(!showCategoryDropdown)
                        }
                        placeholder="All Categories"
                        dropdownRef={categoryRef}
                      />
                    </div>

                    {selectedCategory && availableSubCategories.length > 0 && (
                      <div className="w-full sm:w-48">
                        <SearchableDropdown
                          label="Subcategory"
                          value={selectedSubCategory}
                          options={[
                            { id: '', name: 'All Subcategories' },
                            ...availableSubCategories
                              .filter((subCategory: any) =>
                                subCategory.name
                                  .toLowerCase()
                                  .includes(subcategorySearch.toLowerCase())
                              )
                              .map((subCategory: any) => ({
                                id: subCategory.id,
                                name: subCategory.name,
                              })),
                          ]}
                          onSelect={(value) => {
                            setSelectedSubCategory(value);
                            setCurrentPage(1);
                            setSubcategorySearch('');

                            dispatch(
                              fetchProducts({
                                page: 1,
                                limit: pageSize,
                                search: searchTerm,
                                categoryId: selectedCategory || undefined,
                                subCategoryId: value || undefined,
                              }) as any
                            );
                          }}
                          searchValue={subcategorySearch}
                          onSearchChange={setSubcategorySearch}
                          isOpen={showSubcategoryDropdown}
                          onToggle={() =>
                            setShowSubcategoryDropdown(!showSubcategoryDropdown)
                          }
                          placeholder="All Subcategories"
                          dropdownRef={subcategoryRef}
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <Link
                      to="/bulk-upload-products"
                      className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 shadow-lg flex-shrink-0"
                    >
                      <HiCube className="w-5 h-5 mr-2" />
                      Bulk Upload
                    </Link>
                    <Link
                      to="/add-product"
                      className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-semibold text-white bg-slate-700 hover:bg-slate-800 shadow-lg flex-shrink-0"
                    >
                      <HiPlus className="w-5 h-5 mr-2" />
                      Add Product
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Products Display */}
          {products.length === 0 && !loading ? (
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/30 p-12 text-center">
              <div className="w-10 h-10 mx-auto mb-6 rounded-2xl bg-slate-600 flex items-center justify-center shadow-lg">
                <HiMagnifyingGlass className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">
                No products found
              </h3>
              <p className="text-slate-600 mb-6">
                Add your first product to get started
              </p>
              {/* <Link
              to="/add-product"
              className="inline-flex items-center px-6 py-3 rounded-lg font-semibold text-white bg-slate-700 hover:bg-slate-800 shadow-lg"
            >
              <HiPlus className="w-5 h-5 mr-2" />
              Add First Product
            </Link> */}
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              {/* Desktop Table View */}
              <div className="hidden lg:block">
                {/* Table Header */}
                <div className="bg-gray-50 border-b border-gray-200 p-4">
                  <div className="grid grid-cols-7 gap-3 text-sm font-semibold text-slate-700">
                    <div className="flex items-center gap-2">
                      <HiCube className="w-4 h-4 text-slate-600" />
                      <span>Product Name</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <HiTag className="w-4 h-4 text-slate-600" />
                      <span>SKU</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <HiTag className="w-4 h-4 text-slate-600" />
                      <span>Category</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <HiCube className="w-4 h-4 text-slate-600" />
                      <span>Unit Weight</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <HiCube className="w-4 h-4 text-slate-600" />
                      <span>Total Weight</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <HiCube className="w-4 h-4 text-slate-600" />
                      <span>Price</span>
                    </div>
                    <div className="flex items-center justify-end gap-2">
                      <HiCube className="w-4 h-4 text-slate-600" />
                      <span>Actions</span>
                    </div>
                  </div>
                </div>
                <div className="divide-y divide-white/20">
                  {products.map((product: any) => (
                    <div
                      key={product.id}
                      className="p-4 hover:bg-white/50 transition-all duration-300"
                    >
                      <div className="grid grid-cols-7 gap-3 items-center">
                        {/* Product Name */}
                        <div className="flex items-center gap-2">
                          <HiCube className="w-4 h-4 text-slate-600 flex-shrink-0" />
                          <span
                            className="text-slate-800 font-medium truncate"
                            title={product.name}
                          >
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
                          {product.price
                            ? `${product.currency} ${product.price}`
                            : '-'}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end space-x-2">
                          <Link
                            to={`/edit-product/${product.id}`}
                            className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-emerald-600 transition-all duration-300"
                          >
                            <HiPencil className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDeleteClick(product.id)}
                            className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-red-600 transition-all duration-300"
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
                    <div className="bg-gray-50 border-b border-gray-200 p-4">
                      <div className="grid grid-cols-7 gap-3 text-sm font-semibold text-slate-700">
                        <div className="flex items-center gap-2">
                          <HiCube className="w-4 h-4 text-slate-600" />
                          <span>Product Name</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <HiTag className="w-4 h-4 text-slate-600" />
                          <span>SKU</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <HiTag className="w-4 h-4 text-slate-600" />
                          <span>Category</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <HiCube className="w-4 h-4 text-slate-600" />
                          <span>Unit Weight</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <HiCube className="w-4 h-4 text-slate-600" />
                          <span>Total Weight</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <HiCube className="w-4 h-4 text-slate-600" />
                          <span>Price</span>
                        </div>
                        <div className="flex items-center justify-end gap-2">
                          <HiCube className="w-4 h-4 text-slate-600" />
                          <span>Actions</span>
                        </div>
                      </div>
                    </div>
                    <div className="divide-y divide-white/20">
                      {products.map((product: any) => (
                        <div
                          key={product.id}
                          className="p-4 hover:bg-white/50 transition-all duration-300"
                        >
                          <div className="grid grid-cols-7 gap-3 items-center">
                            {/* Product Name */}
                            <div className="flex items-center gap-2">
                              <HiCube className="w-4 h-4 text-slate-600 flex-shrink-0" />
                              <span
                                className="text-slate-800 font-medium truncate"
                                title={product.name}
                              >
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
                              {product.price
                                ? `${product.currency} ${product.price}`
                                : '-'}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-end space-x-2">
                              <Link
                                to={`/edit-product/${product.id}`}
                                className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-emerald-600 transition-all duration-300"
                              >
                                <HiPencil className="w-4 h-4" />
                              </Link>
                              <button
                                onClick={() => handleDeleteClick(product.id)}
                                className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-red-600 transition-all duration-300"
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

          {/* Simple Pagination */}
          {pagination.total > 0 && (
            <div className="flex justify-center mt-6">
              <Pagination
                current={currentPage}
                total={pagination.total}
                pageSize={pageSize}
                onChange={(page) => {
                  setCurrentPage(page);
                  dispatch(
                    fetchProducts({
                      page: page,
                      limit: pageSize,
                      search: searchTerm,
                      categoryId: selectedCategory || undefined,
                      subCategoryId: selectedSubCategory || undefined,
                    }) as any
                  );
                }}
              />
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {confirmDelete && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-60 p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-8 border border-gray-200">
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-lg bg-red-600 flex items-center justify-center shadow-lg">
                  <HiTrash className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">
                  Delete Product
                </h3>
                <p className="text-slate-600">
                  Are you sure you want to delete this product? This action
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
    </>
  );
};

export default Product;
