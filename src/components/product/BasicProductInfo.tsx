import React from 'react';
import { Field } from 'formik';
import { toast } from 'react-toastify';

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
    <div className="space-y-4">
      <h4 className="font-medium text-gray-900 dark:text-white">
        Product Information
      </h4>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            disabled={
              categoriesLoading || !categories || categories.length === 0
            }
          >
            <option value="">
              {categoriesLoading ? 'Loading categories...' : 'Select Category'}
            </option>
            {!categoriesLoading &&
              categories &&
              categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Subcategory (Optional)
          </label>
          <select
            name="subCategoryId"
            value={values.subCategoryId}
            onChange={(e) => setFieldValue('subCategoryId', e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            disabled={!values.categoryId}
          >
            <option value="">Select Subcategory</option>
            {subcategories.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Product Name *
          </label>
          <Field
            type="text"
            name="name"
            placeholder="Enter product name"
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
          {touched.name && errors.name && (
            <div className="mt-1 text-sm text-red-600">{errors.name}</div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            SKU
          </label>
          <Field
            type="text"
            name="sku"
            placeholder="Enter SKU"
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description
          </label>
          <Field
            type="text"
            name="description"
            placeholder="Enter description"
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Price
          </label>
          <div className="flex">
            <Field
              type="number"
              name="price"
              step="any"
              min="0"
              placeholder="Enter price"
              className="w-full rounded-l-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
            <Field
              as="select"
              name="currency"
              className="rounded-r-lg border border-l-0 border-gray-300 px-3 py-2.5 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
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
