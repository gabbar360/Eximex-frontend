import React from 'react';
import { Field } from 'formik';
import { toast } from 'react-toastify';
import { HiCube, HiTag, HiDocumentText, HiCurrencyDollar } from 'react-icons/hi2';

interface BasicProductInfoProps {
  values: any;
  errors: any;
  touched: any;
  setFieldValue: (field: string, value: any) => void;
  categories: any[];
  subcategories: any[];
  categoriesLoading: boolean;
  selectedCategoryId: string;
  setSelectedCategoryId: (id: string) => void;
  loadSubcategories: (categoryId: string) => void;
  fetchCategoryDetails: (categoryId: string) => void;
  setSubcategories: (subcategories: any[]) => void;
  setPackagingHierarchy: (hierarchy: any[]) => void;
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
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 shadow-md">
          <HiCube className="w-5 h-5 text-white" />
        </div>
        <h4 className="text-lg font-semibold text-slate-800">
          Product Information
        </h4>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="flex items-center text-sm font-semibold text-slate-700 mb-3">
            <HiTag className="w-4 h-4 mr-2 text-blue-600" />
            Select Category *
          </label>
          <select
            name="categoryId"
            value={values.categoryId || selectedCategoryId}
            onClick={(e) => {
              if (!categories || categories.length === 0) {
                e.preventDefault();
                toast.error(
                  'Please create a category first before adding products.'
                );
              }
            }}
            onChange={(e) => {
              const categoryId = e.target.value;
              setFieldValue('categoryId', categoryId);
              setFieldValue('subCategoryId', '');
              setSelectedCategoryId(categoryId);

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
            className="w-full px-4 py-3 border border-white/50 bg-white/60 backdrop-blur-sm rounded-2xl focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-300 shadow-sm"
            disabled={
              categoriesLoading || !categories || categories.length === 0
            }
          >
            <option value="">
              {categoriesLoading ? 'Loading categories...' : 'Select Category'}
            </option>
            {!categoriesLoading &&
              categories &&
              Array.isArray(categories) &&
              categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
          </select>
          {touched.categoryId && errors.categoryId && (
            <div className="text-sm text-red-500 mt-1">{errors.categoryId}</div>
          )}
        </div>

        <div>
          <label className="flex items-center text-sm font-semibold text-slate-700 mb-3">
            <HiTag className="w-4 h-4 mr-2 text-blue-600" />
            Subcategory (Optional)
          </label>
          <select
            name="subCategoryId"
            value={values.subCategoryId}
            onChange={(e) => setFieldValue('subCategoryId', e.target.value)}
            className="w-full px-4 py-3 border border-white/50 bg-white/60 backdrop-blur-sm rounded-2xl focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-300 shadow-sm"
            disabled={!values.categoryId}
          >
            <option value="">Select Subcategory</option>
            {Array.isArray(subcategories) && subcategories.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="flex items-center text-sm font-semibold text-slate-700 mb-3">
            <HiCube className="w-4 h-4 mr-2 text-blue-600" />
            Product Name *
          </label>
          <Field
            type="text"
            name="name"
            placeholder="Enter product name"
            className="w-full px-4 py-3 border border-white/50 bg-white/60 backdrop-blur-sm rounded-2xl focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-300 shadow-sm"
          />
          {touched.name && errors.name && (
            <div className="text-sm text-red-500 mt-1">{errors.name}</div>
          )}
        </div>

        <div>
          <label className="flex items-center text-sm font-semibold text-slate-700 mb-3">
            <HiTag className="w-4 h-4 mr-2 text-blue-600" />
            SKU
          </label>
          <Field
            type="text"
            name="sku"
            placeholder="Enter SKU"
            className="w-full px-4 py-3 border border-white/50 bg-white/60 backdrop-blur-sm rounded-2xl focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-300 shadow-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="flex items-center text-sm font-semibold text-slate-700 mb-3">
            <HiDocumentText className="w-4 h-4 mr-2 text-blue-600" />
            Description
          </label>
          <Field
            type="text"
            name="description"
            placeholder="Enter description"
            className="w-full px-4 py-3 border border-white/50 bg-white/60 backdrop-blur-sm rounded-2xl focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-300 shadow-sm"
          />
          {touched.description && errors.description && (
            <div className="text-sm text-red-500 mt-1">{errors.description}</div>
          )}
        </div>

        <div>
          <label className="flex items-center text-sm font-semibold text-slate-700 mb-3">
            <HiCurrencyDollar className="w-4 h-4 mr-2 text-blue-600" />
            Price
          </label>
          <div className="flex">
            <Field
              type="number"
              name="price"
              step="any"
              min="0"
              placeholder="Enter price"
              className="w-full px-4 py-3 border border-white/50 bg-white/60 backdrop-blur-sm rounded-l-2xl focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-300 shadow-sm"
            />
            <Field
              as="select"
              name="currency"
              className="px-3 py-3 border border-l-0 border-white/50 bg-white/60 backdrop-blur-sm rounded-r-2xl focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-300 shadow-sm"
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="INR">INR</option>
              <option value="JPY">JPY</option>
              <option value="CNY">CNY</option>
            </Field>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BasicProductInfo;
