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
import PackagingDetailsSection from '../../components/form/PackagingDetailsSection';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { 
  HiArrowLeft, 
  HiCheckCircle, 
  HiPlus, 
  HiTrash,
  HiSparkles,
  HiClipboardDocumentList,
  HiCubeTransparent,
  HiRectangleStack,
  HiDocumentDuplicate,
  HiBeaker,
  HiCog6Tooth,
  HiShieldCheck,
  HiAcademicCap,
  HiChartBarSquare
} from 'react-icons/hi2';
import { 
  MdCategory, 
  MdInventory, 
  MdDescription, 
  MdQrCode2,
  MdPrecisionManufacturing
} from 'react-icons/md';
import { 
  FaBoxes, 
  FaCubes, 
  FaLayerGroup, 
  FaIndustry,
  FaBarcode
} from 'react-icons/fa';
import { 
  BiCategory, 
  BiPackage 
} from 'react-icons/bi';
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
        className="w-full px-4 py-3 border border-white/50 bg-white/60 backdrop-blur-sm rounded-2xl focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-300 shadow-sm text-left"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span
          className={
            selectedUnit
              ? 'text-slate-800'
              : 'text-slate-400'
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
        <div className="absolute top-full left-0 right-0 mt-1 bg-white/90 backdrop-blur-xl border border-white/30 rounded-2xl shadow-xl z-50 max-h-60 overflow-hidden">
          <div className="p-3 border-b border-white/20">
            <input
              type="text"
              placeholder="Search units..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-white/50 bg-white/60 backdrop-blur-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200"
              autoFocus
            />
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filteredUnits.length > 0 ? (
              filteredUnits.map((unit) => (
                <button
                  key={unit.value}
                  type="button"
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-blue-50 transition-colors ${
                    value === unit.value
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-slate-700'
                  }`}
                  onClick={() => handleSelect(unit.value)}
                >
                  {unit.label}
                </button>
              ))
            ) : (
              <div className="px-4 py-2 text-sm text-slate-500">
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
          setError(err);
          toast.error(err);
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
      toast.error(err);
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
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-slate-600 mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 rounded-lg bg-red-600 flex items-center justify-center shadow-lg">
            <HiDocumentText className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Error</h3>
          <p className="text-slate-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-2 lg:p-4">
        {/* Header */}
        <div className="mb-3">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-3 lg:p-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate('/categories')}
                  className="p-3 rounded-lg bg-slate-700 text-white hover:bg-slate-800 transition-all duration-300 hover:shadow-lg"
                >
                  <HiArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 mb-1">
                    {isEditMode ? 'Edit Category' : 'Add New Category'}
                  </h1>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 lg:p-8">

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
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Category Name */}
                  <div>
                    <label className="flex items-center text-sm font-semibold text-slate-700 mb-3">
                      <MdCategory className="w-4 h-4 mr-2 text-slate-600" />
                      Category Name
                    </label>
                    <input
                      name="name"
                      type="text"
                      placeholder="Enter category name"
                      value={values.name}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className="w-full px-4 py-3 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-slate-200 focus:border-slate-500 transition-all duration-300 shadow-sm"
                    />
                    {touched.name && errors.name && (
                      <div className="text-sm text-red-500 mt-1">{errors.name}</div>
                    )}
                  </div>

                  {/* HSN Code */}
                  <div>
                    <label className="flex items-center text-sm font-semibold text-slate-700 mb-3">
                      <FaBarcode className="w-4 h-4 mr-2 text-slate-600" />
                      HSN Code
                    </label>
                    <input
                      name="hsn_code"
                      type="text"
                      placeholder="Enter HSN code"
                      value={values.hsn_code}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className="w-full px-4 py-3 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-slate-200 focus:border-slate-500 transition-all duration-300 shadow-sm"
                    />
                    {touched.hsn_code && errors.hsn_code && (
                      <div className="text-sm text-red-500 mt-1">{errors.hsn_code}</div>
                    )}
                  </div>

                  {/* Primary Unit */}
                  <div>
                    <label className="flex items-center text-sm font-semibold text-slate-700 mb-3">
                      <FaCubes className="w-4 h-4 mr-2 text-slate-600" />
                      Primary Unit
                    </label>
                    <UnitDropdown
                      id="primary_unit"
                      name="primary_unit"
                      value={values.primary_unit || ''}
                      onChange={(value) => setFieldValue('primary_unit', value)}
                      placeholder="Select Primary Unit"
                    />
                    {touched.primary_unit && errors.primary_unit && (
                      <div className="text-sm text-red-500 mt-1">{errors.primary_unit}</div>
                    )}
                  </div>

                  {/* Secondary Unit */}
                  <div>
                    <label className="flex items-center text-sm font-semibold text-slate-700 mb-3">
                      <BiPackage className="w-4 h-4 mr-2 text-slate-600" />
                      Secondary Unit
                    </label>
                    <UnitDropdown
                      id="secondary_unit"
                      name="secondary_unit"
                      value={values.secondary_unit || ''}
                      onChange={(value) => setFieldValue('secondary_unit', value)}
                      placeholder="Select Secondary Unit"
                    />
                    {touched.secondary_unit && errors.secondary_unit && (
                      <div className="text-sm text-red-500 mt-1">{errors.secondary_unit}</div>
                    )}
                  </div>

                  {/* Description */}
                  <div className="md:col-span-2">
                    <label className="flex items-center text-sm font-semibold text-slate-700 mb-3">
                      <MdDescription className="w-4 h-4 mr-2 text-slate-600" />
                      Description
                    </label>
                    <textarea
                      name="desc"
                      rows={3}
                      placeholder="Category description..."
                      value={values.desc}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className="w-full px-4 py-3 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-slate-200 focus:border-slate-500 transition-all duration-300 shadow-sm"
                    />
                    {touched.desc && errors.desc && (
                      <div className="text-sm text-red-500 mt-1">{errors.desc}</div>
                    )}
                  </div>
                </div>

                {/* Subcategories Section */}
                <div className="mt-8">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                    <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                      <FaLayerGroup className="w-5 h-5 text-slate-600" />
                      Subcategories
                    </h3>
                    <button
                      type="button"
                      onClick={addSubcategoryField}
                      className="inline-flex items-center justify-center px-3 sm:px-4 py-2 sm:py-2 rounded-lg font-semibold text-white bg-slate-700 hover:bg-slate-800 shadow-lg transition-all duration-300 text-sm sm:text-base whitespace-nowrap"
                    >
                      <HiPlus className="w-4 h-4 mr-2" />
                      <span className="hidden xs:inline">Add Subcategory</span>
                      <span className="xs:hidden">Add Sub</span>
                    </button>
                  </div>

                  <div className="space-y-4">
                    {subcategories.map((subcategory, index) => (
                      <div
                        key={index}
                        className="bg-gray-50 rounded-lg border border-gray-200 p-6 shadow-sm"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                              Name
                            </label>
                            <input
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
                              className="w-full px-4 py-3 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-slate-200 focus:border-slate-500 transition-all duration-300 shadow-sm"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                              HSN Code
                            </label>
                            <div className="space-y-2">
                              <label className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={subcategory.useParentHsnCode || false}
                                  onChange={(e) => {
                                    const updatedSubcategories = [...subcategories];
                                    updatedSubcategories[index] = {
                                      ...updatedSubcategories[index],
                                      useParentHsnCode: e.target.checked,
                                    };
                                    setSubcategories(updatedSubcategories);
                                  }}
                                  className="w-4 h-4 rounded border-2 border-gray-300 text-slate-600 focus:ring-slate-200"
                                />
                                <span className="text-sm text-slate-600">Use parent's HSN</span>
                              </label>
                              {!subcategory.useParentHsnCode && (
                                <input
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
                                  className="w-full px-4 py-3 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-slate-200 focus:border-slate-500 transition-all duration-300 shadow-sm"
                                />
                              )}
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                              Description
                            </label>
                            <div className="flex gap-2">
                              <input
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
                                className="flex-1 px-4 py-3 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-slate-200 focus:border-slate-500 transition-all duration-300 shadow-sm"
                              />
                              {subcategories.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeSubcategoryField(index)}
                                  className="p-3 rounded-lg text-white bg-slate-500 hover:bg-slate-800 transition-all duration-300 shadow-lg"
                                >
                                  <HiTrash className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
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
                <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => navigate('/categories')}
                    className="px-6 py-3 rounded-lg border border-gray-300 text-slate-600 hover:bg-gray-50 transition-all duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-3 rounded-lg font-semibold text-white bg-slate-700 hover:bg-slate-800 transition-all duration-300 hover:shadow-xl disabled:opacity-50 shadow-lg"
                  >
                    {submitting ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        {isEditMode ? 'Updating...' : 'Creating...'}
                      </div>
                    ) : (
                      <>
                        <HiCheckCircle className="w-5 h-5 mr-2 inline" />
                        {isEditMode ? 'Update Category' : 'Create Category'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};

export default AddEditCategoryForm;
