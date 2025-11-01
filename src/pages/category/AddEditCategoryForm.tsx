import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useSelector } from 'react-redux';
import {
  createCategory,
  getCategoryById,
  updateCategory,
  getAllCategories,
} from '../../features/categorySlice';
import {
  createPackagingHierarchy,
  fetchPackagingHierarchy,
} from '../../features/packagingSlice';
import { useDispatch } from 'react-redux';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import PageMeta from '../../components/common/PageMeta';
import Form from '../../components/form/Form';
import Input from '../../components/form/input/InputField';
import Label from '../../components/form/Label';
import TextArea from '../../components/form/input/TextArea';
import Select from '../../components/form/Select';
import PackagingDetailsSection from '../../components/form/PackagingDetailsSection';
// import PricingConfigSection from "../../components/form/PricingConfigSection";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import * as Yup from 'yup';
import { Formik } from 'formik';

// TypeScript interfaces
interface Category {
  id?: string;
  name: string;
  hsn_code: string;
  description: string;
  parent_id?: string;
  primary_unit?: string;
  secondary_unit?: string;
  hsnCode?: string;
  parentId?: string;
  other_ItemCategory?: Subcategory[];
  packagingHierarchy?: PackagingLevel[];
}

interface Subcategory {
  id?: string;
  name: string;
  hsn_code: string;
  desc: string;
  useParentHsnCode: boolean;
  hsnCode?: string;
  description?: string;
}

interface PackagingLevel {
  parentUnitId: string;
  childUnitId: string;
  conversionQuantity: number;
  quantity?: number;
}

interface FormValues {
  name: string;
  hsn_code: string;
  desc: string;
  parent_id: string;
  primary_unit: string;
  secondary_unit: string;
}

// Unit Dropdown Component
const UnitDropdown: React.FC<{
  id: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}> = ({ id, name, value, onChange, placeholder = 'Select unit' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const units = [
    { value: 'sqm', label: 'Square Meter (sqm)' },
    { value: 'sqft', label: 'Square Feet (sqft)' },
    { value: 'sqyd', label: 'Square Yard (sqyd)' },
    { value: 'acre', label: 'Acre' },
    { value: 'hectare', label: 'Hectare (ha)' },
    { value: 'mm', label: 'Millimeter (mm)' },
    { value: 'cm', label: 'Centimeter (cm)' },
    { value: 'm', label: 'Meter (m)' },
    { value: 'km', label: 'Kilometer (km)' },
    { value: 'inch', label: 'Inch (in)' },
    { value: 'ft', label: 'Foot (ft)' },
    { value: 'yd', label: 'Yard (yd)' },
    { value: 'mile', label: 'Mile (mi)' },
    { value: 'mg', label: 'Milligram (mg)' },
    { value: 'g', label: 'Gram (g)' },
    { value: 'kg', label: 'Kilogram (kg)' },
    { value: 'mt', label: 'Metric Ton (mt)' },
    { value: 'lb', label: 'Pound (lb)' },
    { value: 'oz', label: 'Ounce (oz)' },
    { value: 'ml', label: 'Milliliter (ml)' },
    { value: 'ltr', label: 'Liter (ltr)' },
    { value: 'gal', label: 'Gallon (gal)' },
    { value: 'cuft', label: 'Cubic Feet (cu ft)' },
    { value: 'cum', label: 'Cubic Meter (cu m)' },
    { value: 'pcs', label: 'Pieces (pcs)' },
    { value: 'dozen', label: 'Dozen' },
    { value: 'pack', label: 'Pack' },
    { value: 'box', label: 'Box' },
    { value: 'set', label: 'Set' },
    { value: 'unit', label: 'Unit' },
  ];

  const filteredUnits = units.filter(
    (unit) =>
      unit.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      unit.value.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedUnit = units.find((unit) => unit.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (unitValue: string) => {
    onChange(unitValue);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        id={id}
        className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-white px-4 py-2.5 pr-11 text-sm shadow-theme-xs text-left focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span
          className={
            selectedUnit
              ? 'text-gray-900 dark:text-white/90'
              : 'text-gray-400 dark:text-white/30'
          }
        >
          {selectedUnit ? selectedUnit.label : placeholder}
        </span>
        <svg
          className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-60 overflow-hidden">
          <div className="p-2 border-b border-gray-200 dark:border-gray-700">
            <input
              type="text"
              placeholder="Search units..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-gray-800 dark:text-white"
              autoFocus
            />
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filteredUnits.length > 0 ? (
              filteredUnits.map((unit) => (
                <button
                  key={unit.value}
                  type="button"
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-800 ${
                    value === unit.value
                      ? 'bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400'
                      : 'text-gray-900 dark:text-white/90'
                  }`}
                  onClick={() => handleSelect(unit.value)}
                >
                  {unit.label}
                </button>
              ))
            ) : (
              <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                No units found
              </div>
            )}
          </div>
        </div>
      )}

      <input type="hidden" name={name} value={value} />
    </div>
  );
};

const AddEditCategoryForm: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const user = useSelector((state: any) => state.user.user);

  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<any>({});
  const [parentCategories, setParentCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState([
    { name: '', hsn_code: '', desc: '', useParentHsnCode: false },
  ]);
  const [packagingLevels, setPackagingLevels] = useState([]);

  useEffect(() => {
    const fetchParentCategories = async () => {
      try {
        const data = await dispatch(getAllCategories()).unwrap();
        // Filter out categories that could create circular references
        const filteredCategories = isEditMode
          ? (data.data || data).filter((cat: any) => cat.id !== id)
          : (data.data || data);
        setParentCategories(filteredCategories || []);
      } catch (err: any) {
        console.error('Failed to fetch parent categories:', err);
      }
    };

    fetchParentCategories();

    if (isEditMode && id) {
      const fetchCategory = async () => {
        try {
          setLoading(true);
          const response = await dispatch(getCategoryById(id)).unwrap();
          const data = response.data || response;
          console.log('Category data:', data); // Debug log to see the structure

          // Map API response fields to our state
          setCategory({
            id: data.id,
            name: data.name,
            hsn_code: data.hsnCode || data.hsn_code,
            description: data.description,
            parent_id: data.parentId,
            primary_unit: data.primary_unit,
            secondary_unit: data.secondary_unit,
          });

          // If there are subcategories, load them
          if (data?.other_ItemCategory && data.other_ItemCategory.length > 0) {
            const formattedSubcategories = data.other_ItemCategory.map(
              (sub: any) => ({
                id: sub.id, // Keep existing ID for updates
                name: sub.name || '',
                hsn_code: sub.hsnCode || sub.hsn_code || '',
                desc: sub.description || '',
                useParentHsnCode: sub.useParentHsnCode || false,
              })
            );
            setSubcategories(formattedSubcategories);
          }

          // Load packaging hierarchy if exists in the category data
          if (data.packagingHierarchy && data.packagingHierarchy.length > 0) {
            setPackagingLevels(
              data.packagingHierarchy.map((level: any) => ({
                parentUnitId: level.parentUnitId,
                childUnitId: level.childUnitId,
                conversionQuantity: level.conversionQuantity,
              }))
            );
          } else {
            // Fallback to separate API call if not included in category data
            try {
              const packagingResponse = await dispatch(fetchPackagingHierarchy(id)).unwrap();
              if (
                packagingResponse.success &&
                packagingResponse.data.length > 0
              ) {
                setPackagingLevels(
                  packagingResponse.data.map((level: any) => ({
                    parentUnitId: level.parentUnitId,
                    childUnitId: level.childUnitId,
                    conversionQuantity:
                      level.quantity || level.conversionQuantity,
                  }))
                );
              }
            } catch (packagingError) {
              console.log(
                'No packaging hierarchy found or error loading it:',
                packagingError
              );
              // This is not a critical error, so we don't show it to the user
            }
          }
        } catch (err: any) {
          setError(err.message);
          toast.error(err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchCategory();
    }
  }, [id, isEditMode]);

  const addSubcategoryField = () => {
    setSubcategories([
      ...subcategories,
      {
        name: '',
        hsn_code: '',
        desc: '',
        useParentHsnCode: false,
      },
    ]);
  };

  const removeSubcategoryField = (index: number) => {
    const updatedSubcategories = [...subcategories];
    updatedSubcategories.splice(index, 1);
    setSubcategories(updatedSubcategories);
  };
  const handleSubmit = async (values: any) => {
    setSubmitting(true);
    try {
      if (isEditMode) {
        // Filter valid packaging levels and ensure conversionQuantity is set
        const validPackagingLevels = packagingLevels
          .filter((level: any) => level.parentUnitId && level.childUnitId)
          .map((level: any) => ({
            ...level,
            conversionQuantity: level.conversionQuantity || 1, // Default to 1 if not set
          }));

        // Prepare subcategories data
        const validSubcategories = subcategories.filter(
          (sub) => sub.name.trim() !== ''
        );

        // Update main category with subcategories and packaging levels
        const categoryData = {
          name: values.name,
          hsn_code: values.hsn_code,
          desc: values.desc,
          parent_id: values.parent_id || null,
          primary_unit: values.primary_unit || null,
          secondary_unit: values.secondary_unit || null,
          subcategory: validSubcategories.map((sub) => ({
            ...sub,
            hsn_code: sub.useParentHsnCode ? '' : sub.hsn_code,
          })),
          packagingLevels: validPackagingLevels,
        };

        console.log('Updating category:', categoryData);
        const result = await dispatch(updateCategory({ id, category: categoryData })).unwrap();

        toast.success(result.message);

        // We've already included packaging levels in the category update data,
        // so we don't need to make a separate API call here.
        // The backend will handle updating the packaging hierarchy.
      } else {
        // Prepare subcategories data
        const validSubcategories = subcategories.filter(
          (sub) => sub.name.trim() !== ''
        );

        // Filter valid packaging levels and ensure conversionQuantity is set
        const validPackagingLevels = packagingLevels
          .filter((level: any) => level.parentUnitId && level.childUnitId)
          .map((level: any) => ({
            ...level,
            conversionQuantity: level.conversionQuantity || 1, // Default to 1 if not set
          }));

        // Include packaging levels in the category data
        const categoryData = {
          name: values.name,
          hsn_code: values.hsn_code,
          desc: values.desc,
          parent_id: values.parent_id || null,
          primary_unit: values.primary_unit || null,
          secondary_unit: values.secondary_unit || null,
          subcategory: validSubcategories.map((sub) => ({
            ...sub,
            hsn_code: sub.useParentHsnCode ? '' : sub.hsn_code,
          })), // Include subcategories in the request
          packagingLevels: validPackagingLevels, // Include packaging levels in the request
        };

        console.log(
          'Sending category data with packaging levels:',
          categoryData
        );
        const result = await dispatch(createCategory(categoryData)).unwrap();

        // We've already included packaging levels in the category data,
        // so we don't need to make a separate API call here.
        // The backend will handle creating the packaging hierarchy.

        toast.success(result.message);
      }

      setTimeout(() => navigate('/categories'), 1500);
    } catch (err: any) {
      toast.error(err.message);
      if (err.response && err.response.status === 401) {
        toast.error('Session expired. Please log in again.');
        setTimeout(() => {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          navigate('/login');
        }, 2000);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
        <strong>Error:</strong> {error}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-screen-2xl p-2 sm:p-4 md:p-6 2xl:p-10">
      <PageMeta
        title={`${isEditMode ? 'Edit' : 'Add'} Category | EximEx Dashboard`}
        description={`${
          isEditMode ? 'Edit' : 'Add'
        } a category in your EximEx Dashboard`}
      />
      <PageBreadcrumb pageTitle={`${isEditMode ? 'Edit' : 'Add'} Category`} />

      <div className="rounded-sm bg-white shadow-default dark:border-strokedark dark:bg-gray-900 p-3 sm:p-6 md:p-8">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-3 sm:p-6">
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-3 sm:pb-4 mb-4 sm:mb-8">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100">
              {isEditMode ? 'Edit Category' : 'Add New Category'}
            </h2>
          </div>

          <Formik
            enableReinitialize
            initialValues={{
              name: category.name || '',
              hsn_code: category.hsn_code || '',
              desc: category.description || '',
              parent_id: category.parent_id || '',
              primary_unit: category.primary_unit || '',
              secondary_unit: category.secondary_unit || '',
              // pricing_model: category.pricing_model || "",
              // pricing_logic_config: category.pricing_logic_config
              // ? Object.entries(category.pricing_logic_config).map(
              //     ([key, value]) => ({ key, value })
              //   )
              // : [{ key: "", value: "" }],
            }}
            validationSchema={Yup.object({
              name: Yup.string().required('Category name is required'),
              hsn_code: Yup.string().required('HSN code is required'),
              desc: Yup.string().required('Description is required'),
              primary_unit: Yup.string().required('Primary unit is required'),
              secondary_unit: Yup.string().required(
                'Secondary unit is required'
              ),
            })}
            onSubmit={handleSubmit}
          >
            {({
              handleSubmit,
              handleChange,
              handleBlur,
              values,
              touched,
              errors,
              setFieldValue,
            }) => (
              <Form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  {/* Category Name */}
                  <div className="col-span-1">
                    <Label htmlFor="name">Category Name</Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Enter category name"
                      value={values.name}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                    />
                    {touched.name && errors.name && (
                      <div className="text-sm text-red-500 mt-1">
                        {errors.name}
                      </div>
                    )}
                  </div>

                  {/* HSN Code */}
                  <div className="col-span-1">
                    <Label htmlFor="hsn_code">HSN Code</Label>
                    <Input
                      id="hsn_code"
                      name="hsn_code"
                      type="text"
                      placeholder="Enter HSN code"
                      value={values.hsn_code}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                    />
                    {touched.hsn_code && errors.hsn_code && (
                      <div className="text-sm text-red-500 mt-1">
                        {errors.hsn_code}
                      </div>
                    )}
                  </div>

                  {/* Primary Unit */}
                  <div className="col-span-1">
                    <Label htmlFor="primary_unit">Primary Unit</Label>
                    <UnitDropdown
                      id="primary_unit"
                      name="primary_unit"
                      value={values.primary_unit || ''}
                      onChange={(value) => setFieldValue('primary_unit', value)}
                      placeholder="Select Primary Unit"
                    />
                    {touched.primary_unit && errors.primary_unit && (
                      <div className="text-sm text-red-500 mt-1">
                        {errors.primary_unit}
                      </div>
                    )}
                  </div>

                  {/* Secondary Unit */}
                  <div className="col-span-1">
                    <Label htmlFor="secondary_unit">Secondary Unit</Label>
                    <UnitDropdown
                      id="secondary_unit"
                      name="secondary_unit"
                      value={values.secondary_unit || ''}
                      onChange={(value) =>
                        setFieldValue('secondary_unit', value)
                      }
                      placeholder="Select Secondary Unit"
                    />
                    {touched.secondary_unit && errors.secondary_unit && (
                      <div className="text-sm text-red-500 mt-1">
                        {errors.secondary_unit}
                      </div>
                    )}
                  </div>
                  <div className="col-span-1 lg:col-span-2">
                    <Label htmlFor="desc">Description</Label>
                    <TextArea
                      rows={3}
                      placeholder="Category description..."
                      value={values.desc}
                      onChange={(value) => setFieldValue('desc', value)}
                      required
                    />
                    {touched.desc && errors.desc && (
                      <div className="text-sm text-red-500 mt-1">
                        {errors.desc}
                      </div>
                    )}
                  </div>
                </div>

                {/* Subcategories Section - Show in both Add and Edit modes */}
                <div className="mt-6 sm:mt-8">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white/90">
                      Subcategories
                    </h3>
                    <button
                      type="button"
                      onClick={addSubcategoryField}
                      className="w-full sm:w-auto px-3 py-1.5 bg-brand-500 text-white rounded-md text-sm hover:bg-brand-600"
                    >
                      Add Subcategory
                    </button>
                  </div>

                  {subcategories.map((subcategory, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-10 gap-3 sm:gap-4 mb-4 p-3 sm:p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                    >
                      <div className="sm:col-span-1 lg:col-span-3">
                        <Label htmlFor={`subcategory-name-${index}`}>
                          Name
                        </Label>
                        <Input
                          id={`subcategory-name-${index}`}
                          name="name"
                          type="text"
                          placeholder="Subcategory name"
                          value={subcategory.name}
                          onChange={(e) => {
                            const { name, value } = e.target;
                            const updatedSubcategories = [...subcategories];
                            updatedSubcategories[index] = {
                              ...updatedSubcategories[index],
                              [name]: value,
                            };
                            setSubcategories(updatedSubcategories);
                          }}
                        />
                      </div>
                      <div className="sm:col-span-1 lg:col-span-3">
                        <Label htmlFor={`subcategory-hsn_code-${index}`}>
                          HSN Code
                        </Label>
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <input
                              id={`use-parent-hsn-${index}`}
                              name="useParentHsnCode"
                              type="checkbox"
                              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              checked={subcategory.useParentHsnCode || false}
                              onChange={(e) => {
                                const updatedSubcategories = [...subcategories];
                                updatedSubcategories[index] = {
                                  ...updatedSubcategories[index],
                                  useParentHsnCode: e.target.checked,
                                };
                                setSubcategories(updatedSubcategories);
                              }}
                            />
                            <label
                              htmlFor={`use-parent-hsn-${index}`}
                              className="ml-2 text-sm text-gray-700 dark:text-gray-300"
                            >
                              Use parent's HSN code
                            </label>
                          </div>
                          {!subcategory.useParentHsnCode && (
                            <Input
                              id={`subcategory-hsn_code-${index}`}
                              name="hsn_code"
                              type="text"
                              placeholder="HSN code"
                              value={subcategory.hsn_code}
                              onChange={(e) => {
                                const { name, value } = e.target;
                                const updatedSubcategories = [...subcategories];
                                updatedSubcategories[index] = {
                                  ...updatedSubcategories[index],
                                  [name]: value,
                                };
                                setSubcategories(updatedSubcategories);
                              }}
                            />
                          )}
                          {subcategory.useParentHsnCode && (
                            <div className="text-sm text-gray-500 italic">
                              Will use parent category's HSN code
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="sm:col-span-2 lg:col-span-3">
                        <Label htmlFor={`subcategory-desc-${index}`}>
                          Description
                        </Label>
                        <Input
                          id={`subcategory-desc-${index}`}
                          name="desc"
                          type="text"
                          placeholder="Brief description"
                          value={subcategory.desc}
                          onChange={(e) => {
                            const { name, value } = e.target;
                            const updatedSubcategories = [...subcategories];
                            updatedSubcategories[index] = {
                              ...updatedSubcategories[index],
                              [name]: value,
                            };
                            setSubcategories(updatedSubcategories);
                          }}
                        />
                      </div>
                      <div className="sm:col-span-2 lg:col-span-1 flex items-end justify-center">
                        {subcategories.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeSubcategoryField(index)}
                            className="px-3 py-2 bg-red-500 text-white rounded-md text-sm hover:bg-red-600 w-full"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Packaging Details Section - Only show for parent categories */}
                {!values.parent_id && (
                  <PackagingDetailsSection
                    packagingLevels={packagingLevels}
                    onPackagingLevelsChange={setPackagingLevels}
                    primaryUnit={values.primary_unit}
                  />
                )}

                {/* Buttons */}
                <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-end gap-3 sm:gap-0 sm:space-x-4">
                  <button
                    type="button"
                    onClick={() => navigate('/categories')}
                    className="w-full sm:w-auto rounded-lg border border-gray-300 bg-white px-4 py-2.5 sm:py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full sm:w-auto rounded-lg bg-blue-600 px-4 py-2.5 sm:py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting
                      ? isEditMode
                        ? 'Updating...'
                        : 'Creating...'
                      : isEditMode
                        ? 'Update Category'
                        : 'Create Category'}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};

export default AddEditCategoryForm;
