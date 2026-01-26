import React, { useState, useRef, useEffect } from 'react';
import { Field } from 'formik';
import { toast } from 'react-toastify';
import {
  HiCube,
  HiTag,
  HiDocumentText,
  HiCurrencyDollar,
  HiChevronDown,
  HiMagnifyingGlass,
} from 'react-icons/hi2';

interface BasicProductInfoProps {
  values: Record<string, unknown>;
  errors: Record<string, unknown>;
  touched: Record<string, unknown>;
  setFieldValue: (field: string, value: Record<string, unknown>) => void;
  categories: Record<string, unknown>[];
  subcategories: Record<string, unknown>[];
  categoriesLoading: boolean;
  selectedCategoryId: string;
  setSelectedCategoryId: (id: string) => void;
  loadSubcategories: (categoryId: string) => void;
  fetchCategoryDetails: (categoryId: string) => void;
  setSubcategories: (subcategories: Record<string, unknown>[]) => void;
  setPackagingHierarchy: (hierarchy: Record<string, unknown>[]) => void;
  setTrackVolume: (track: boolean) => void;
}

const BasicProductInfo: React.FC<BasicProductInfoProps> = ({
  values,
  errors,
  touched,
  setFieldValue,
  categories,
  subcategories,
  categoriesLoading,
  selectedCategoryId,
  setSelectedCategoryId,
  loadSubcategories,
  fetchCategoryDetails,
  setSubcategories,
  setPackagingHierarchy,
  setTrackVolume,
}) => {
  // Dropdown states
  const [categorySearch, setCategorySearch] = useState('');
  const [subcategorySearch, setSubcategorySearch] = useState('');
  const [currencySearch, setCurrencySearch] = useState('');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showSubcategoryDropdown, setShowSubcategoryDropdown] = useState(false);
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);

  const categoryRef = useRef(null);
  const subcategoryRef = useRef(null);
  const currencyRef = useRef(null);

  // Currency state and API fetch
  const [currencies, setCurrencies] = useState([]);

  const fetchCurrencies = async () => {
    try {
      const response = await fetch(
        'https://api.exchangerate-api.com/v4/latest/USD'
      );
      const data = await response.json();
      return Object.keys(data.rates).map((code) => ({ code, name: code }));
    } catch {
      return [];
    }
  };

  // Load currencies on component mount
  useEffect(() => {
    const loadCurrencies = async () => {
      const currenciesData = await fetchCurrencies();
      setCurrencies(currenciesData);
    };
    loadCurrencies();
  }, []);

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
      if (currencyRef.current && !currencyRef.current.contains(event.target)) {
        setShowCurrencyDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Custom Dropdown Component
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
    disabled = false,
    dropdownRef,
    displayKey = 'name',
    valueKey = 'id',
  }) => {
    const selectedOption = options.find(
      (opt) => opt[valueKey]?.toString() === value?.toString()
    );

    return (
      <div className="relative" ref={dropdownRef}>
        <div
          className={`w-full px-4 py-3 border border-gray-300 bg-white rounded-lg cursor-pointer flex items-center justify-between transition-all duration-300 shadow-sm ${
            disabled
              ? 'bg-gray-100 cursor-not-allowed'
              : 'hover:border-slate-400 focus-within:ring-2 focus-within:ring-slate-200 focus-within:border-slate-500'
          }`}
          onClick={() => !disabled && onToggle()}
        >
          <span
            className={`text-sm ${selectedOption ? 'text-slate-900' : 'text-slate-500'}`}
          >
            {selectedOption ? selectedOption[displayKey] : placeholder}
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
                    key={option[valueKey]}
                    className={`px-4 py-3 hover:bg-slate-50 cursor-pointer text-sm transition-colors duration-150 ${
                      option[valueKey]?.toString() === value?.toString()
                        ? 'bg-slate-100 text-slate-900 font-medium'
                        : 'text-slate-700'
                    }`}
                    onClick={() => {
                      onSelect(option[valueKey]);
                      onToggle();
                    }}
                  >
                    {option[displayKey]}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    );
  };
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-slate-700 shadow-lg">
          <HiCube className="w-5 h-5 text-white" />
        </div>
        <h4 className="text-lg font-semibold text-slate-800">
          Product Information
        </h4>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="flex items-center text-sm font-semibold text-slate-700 mb-3">
            <HiTag className="w-4 h-4 mr-2 text-slate-600" />
            Select Category *
          </label>
          <SearchableDropdown
            label="Category"
            value={values.categoryId || selectedCategoryId}
            options={
              categories
                ?.filter((category) =>
                  category.name
                    .toLowerCase()
                    .includes(categorySearch.toLowerCase())
                )
                .map((category) => ({
                  id: category.id,
                  name: category.name,
                })) || []
            }
            onSelect={(categoryId) => {
              if (!categories || categories.length === 0) {
                toast.error(
                  'Please create a category first before adding products.'
                );
                return;
              }

              setFieldValue('categoryId', categoryId);
              setFieldValue('subCategoryId', '');
              setSelectedCategoryId(categoryId);
              setCategorySearch('');

              if (categoryId) {
                setTimeout(() => {
                  loadSubcategories(categoryId);
                  fetchCategoryDetails(categoryId);
                }, 0);
              } else {
                setSubcategories([]);
                setPackagingHierarchy([]);
                setTrackVolume(false);
              }
            }}
            searchValue={categorySearch}
            onSearchChange={setCategorySearch}
            isOpen={showCategoryDropdown}
            onToggle={() => setShowCategoryDropdown(!showCategoryDropdown)}
            placeholder={
              categoriesLoading
                ? 'Loading categories...'
                : !categories || categories.length === 0
                  ? 'No categories available - Create one first'
                  : 'Select Category'
            }
            disabled={
              categoriesLoading || !categories || categories.length === 0
            }
            dropdownRef={categoryRef}
          />
          {touched.categoryId && errors.categoryId && (
            <div className="text-sm text-red-500 mt-1">{errors.categoryId}</div>
          )}
        </div>

        <div>
          <label className="flex items-center text-sm font-semibold text-slate-700 mb-3">
            <HiTag className="w-4 h-4 mr-2 text-slate-600" />
            Subcategory (Optional)
          </label>
          <SearchableDropdown
            label="Subcategory"
            value={values.subCategoryId}
            options={
              subcategories
                ?.filter((subcategory) =>
                  subcategory.name
                    .toLowerCase()
                    .includes(subcategorySearch.toLowerCase())
                )
                .map((subcategory) => ({
                  id: subcategory.id,
                  name: subcategory.name,
                })) || []
            }
            onSelect={(subcategoryId) => {
              setFieldValue('subCategoryId', subcategoryId);
              setSubcategorySearch('');
            }}
            searchValue={subcategorySearch}
            onSearchChange={setSubcategorySearch}
            isOpen={showSubcategoryDropdown}
            onToggle={() =>
              setShowSubcategoryDropdown(!showSubcategoryDropdown)
            }
            placeholder="Select Subcategory"
            disabled={!values.categoryId}
            dropdownRef={subcategoryRef}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="flex items-center text-sm font-semibold text-slate-700 mb-3">
            <HiCube className="w-4 h-4 mr-2 text-slate-600" />
            Product Name *
          </label>
          <Field
            type="text"
            name="name"
            placeholder="Enter product name"
            className="w-full px-4 py-3 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-slate-200 focus:border-slate-500 transition-all duration-300 shadow-sm"
          />
          {touched.name && errors.name && (
            <div className="text-sm text-red-500 mt-1">{errors.name}</div>
          )}
        </div>

        <div>
          <label className="flex items-center text-sm font-semibold text-slate-700 mb-3">
            <HiTag className="w-4 h-4 mr-2 text-slate-600" />
            SKU
          </label>
          <Field
            type="text"
            name="sku"
            placeholder="Enter SKU"
            className="w-full px-4 py-3 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-slate-200 focus:border-slate-500 transition-all duration-300 shadow-sm"
          />
          {touched.sku && errors.sku && (
            <div className="text-sm text-red-500 mt-1">{errors.sku}</div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="flex items-center text-sm font-semibold text-slate-700 mb-3">
            <HiDocumentText className="w-4 h-4 mr-2 text-slate-600" />
            Description
          </label>
          <Field
            type="text"
            name="description"
            placeholder="Enter description"
            className="w-full px-4 py-3 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-slate-200 focus:border-slate-500 transition-all duration-300 shadow-sm"
          />
          {touched.description && errors.description && (
            <div className="text-sm text-red-500 mt-1">
              {errors.description}
            </div>
          )}
        </div>

        <div>
          <label className="flex items-center text-sm font-semibold text-slate-700 mb-3">
            <HiCurrencyDollar className="w-4 h-4 mr-2 text-slate-600" />
            Price
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <Field
              type="number"
              name="price"
              step="any"
              min="0"
              placeholder="Enter price"
              className="flex-1 px-4 py-3 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-slate-200 focus:border-slate-500 transition-all duration-300 shadow-sm"
            />
            <div className="w-full sm:w-32 relative" ref={currencyRef}>
              <div
                className="w-full px-3 py-3 border border-gray-300 bg-white rounded-lg cursor-pointer flex items-center justify-between transition-all duration-300 shadow-sm hover:border-slate-400 focus-within:ring-2 focus-within:ring-slate-200 focus-within:border-slate-500"
                onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
              >
                <span className="text-sm text-slate-900 truncate">
                  {values.currency || 'USD'}
                </span>
                <HiChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform duration-200 flex-shrink-0 ${showCurrencyDropdown ? 'rotate-180' : ''}`}
                />
              </div>

              {showCurrencyDropdown && (
                <div
                  className="absolute z-50 w-full sm:w-40 bg-white border border-gray-200 rounded-lg shadow-xl"
                  style={{ top: '100%', marginTop: '4px', right: '0' }}
                >
                  <div className="p-3 border-b border-gray-100">
                    <div className="relative">
                      <HiMagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Search..."
                        value={currencySearch}
                        onChange={(e) => setCurrencySearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                        onClick={(e) => e.stopPropagation()}
                        autoFocus
                      />
                    </div>
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {currencies
                      .filter((currency) =>
                        currency.code
                          .toLowerCase()
                          .includes(currencySearch.toLowerCase())
                      )
                      .map((currency) => (
                        <div
                          key={currency.code}
                          className={`px-4 py-2 hover:bg-slate-50 cursor-pointer text-sm transition-colors duration-150 ${
                            currency.code === values.currency
                              ? 'bg-slate-100 text-slate-900 font-medium'
                              : 'text-slate-700'
                          }`}
                          onClick={() => {
                            setFieldValue('currency', currency.code);
                            setShowCurrencyDropdown(false);
                            setCurrencySearch('');
                          }}
                        >
                          {currency.code}
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BasicProductInfo;
