import { useDispatch } from 'react-redux';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import {
  getAllCategories,
  getCategoryById,
} from '../../features/categorySlice';
import {
  getProductById,
  updateProduct,
  addProduct,
} from '../../features/productSlice';
import { HiArrowLeft, HiCheckCircle } from 'react-icons/hi2';

import BasicProductInfo from '../../components/product/BasicProductInfo';
import PackagingDetails from '../../components/product/PackagingDetails';
import PackagingPreview from '../../components/product/PackagingPreview';
import PackagingCalculations from '../../components/product/PackagingCalculations';


const AddEditProductForm = () => {
  console.log('🔄 AddEditProductForm: Component function called');
  
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const dispatch = useDispatch();

  console.log('📍 Current state:', { 
    pathname: location.pathname, 
    id, 
    isEdit 
  });

  // Check if we should render this component
  const [forceHide, setForceHide] = useState(false);
  const shouldRender =
    (location.pathname.startsWith('/edit-product/') ||
      location.pathname === '/add-product') &&
    !forceHide;

  // Listen for force navigation events
  useEffect(() => {
    const handleForceNavigation = (event: CustomEvent) => {
      const targetPath = event.detail;
      if (
        !targetPath.startsWith('/edit-product/') &&
        targetPath !== '/add-product'
      ) {
        console.log(
          'Force hiding AddEditProductForm for navigation to:',
          targetPath
        );
        setForceHide(true);
      }
    };

    window.addEventListener('forceNavigation', handleForceNavigation);
    return () =>
      window.removeEventListener('forceNavigation', handleForceNavigation);
  }, []);

  const [categories, setCategories] = useState<Record<string, unknown>[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  console.log('📊 State values:', {
    categoriesLength: categories.length,
    categoriesLoading,
    forceHide
  });

  type ProductType = {
    [key: string]: unknown;
    packagingHierarchyData?: {
      dynamicFields?: {
        [key: string]: unknown;
      };
    };
  };

  const [product, setProduct] = useState<ProductType | null>(null);

  const [subcategories, setSubcategories] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(false);
  const [packagingHierarchy, setPackagingHierarchy] = useState<Record<string, unknown>[]>([]);
  const [trackVolume, setTrackVolume] = useState(false);
  const [loadingCategory, setLoadingCategory] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');

  const fetchCategories = useCallback(async () => {
    console.log('🔍 fetchCategories called:', { categoriesLoading, categoriesLength: categories.length });
    
    if (categoriesLoading || categories.length > 0) {
      console.log('⏭️ fetchCategories: Skipping - already loading or loaded');
      return;
    }
    
    try {
      console.log('📡 fetchCategories: Starting API call');
      setCategoriesLoading(true);
      // Fetch all categories without pagination for dropdown
      const response = await dispatch(
        getAllCategories({ limit: 1000 })
      ).unwrap();
      // Handle different response structures
      const categoriesData =
        response?.data?.data || response?.data || response || [];
      console.log('✅ fetchCategories: Success, got', categoriesData.length, 'categories');
      setCategories(categoriesData);
    } catch (error) {
      console.error('❌ fetchCategories: Failed:', error);
      toast.error(error);
      // Set empty array on error to prevent undefined issues
      setCategories([]);
    } finally {
      console.log('🏁 fetchCategories: Finished');
      setCategoriesLoading(false);
    }
  }, [dispatch, categoriesLoading, categories.length]);

  const loadSubcategories = useCallback(
    (categoryId: string | number) => {
      console.log('📁 loadSubcategories called:', { categoryId, categoriesLength: categories.length });
      
      if (!categoryId || !categories || categories.length === 0) {
        console.log('⏭️ loadSubcategories: Skipping - no categoryId or categories');
        setSubcategories([]);
        return;
      }

      // Find the selected category and get its subcategories
      const selectedCategory = categories.find(
        (cat) => cat.id.toString() === categoryId.toString()
      );

      if (
        selectedCategory &&
        selectedCategory.subcategories &&
        Array.isArray(selectedCategory.subcategories)
      ) {
        console.log('✅ loadSubcategories: Found', selectedCategory.subcategories.length, 'subcategories');
        setSubcategories(selectedCategory.subcategories);
      } else {
        console.log('⚠️ loadSubcategories: No subcategories found');
        setSubcategories([]);
      }
    },
    [categories]
  );

  // Fetch category details including packaging hierarchy
  const fetchCategoryDetails = useCallback(async (categoryId: string | number) => {
    console.log('📄 fetchCategoryDetails called:', { categoryId, loadingCategory });
    
    if (!categoryId) {
      console.log('⏭️ fetchCategoryDetails: Skipping - no categoryId');
      return;
    }

    try {
      console.log('📡 fetchCategoryDetails: Starting API call');
      setLoadingCategory(true);
      const categoryData = await dispatch(getCategoryById(categoryId)).unwrap();

      if (categoryData && categoryData.packagingHierarchy) {
        console.log('✅ fetchCategoryDetails: Got packaging hierarchy:', categoryData.packagingHierarchy.length);
        setPackagingHierarchy(categoryData.packagingHierarchy);
        setTrackVolume(categoryData.trackVolume || false);
      } else {
        console.log('⚠️ fetchCategoryDetails: No packaging hierarchy');
        setPackagingHierarchy([]);
        setTrackVolume(false);
      }
      setLoadingCategory(false);
    } catch (error) {
      console.error('❌ fetchCategoryDetails: Failed:', error);
      setPackagingHierarchy([]);
      setTrackVolume(false);
      setLoadingCategory(false);
    }
  }, [dispatch]);

  const fetchProduct = useCallback(async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const response = await dispatch(getProductById(id)).unwrap();
      setProduct(response.data);
      if (response.data.categoryId) {
        setSelectedCategoryId(response.data.categoryId.toString());
      }
    } catch (error) {
      console.error('Fetch product error:', error);
      toast.error(error);
      navigate('/products');
    } finally {
      setLoading(false);
    }
  }, [dispatch, id, navigate]);

  useEffect(() => {
    console.log('🎯 useEffect[fetchCategories]: Triggered');
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    console.log('🎯 useEffect[fetchProduct]: Triggered', { isEdit, id });
    if (isEdit && id) {
      fetchProduct();
    }
  }, [isEdit, id, fetchProduct]);
  // Handle category loading completion for edit mode
  useEffect(() => {
    console.log('🎯 useEffect[categoryCompletion]: Triggered', {
      isEdit,
      hasProduct: !!product,
      categoriesLength: categories.length,
      productCategoryId: product?.categoryId,
      selectedCategoryId
    });
    
    if (
      isEdit &&
      product &&
      categories &&
      categories.length > 0 &&
      product.categoryId &&
      selectedCategoryId !== product.categoryId.toString()
    ) {
      console.log('🔄 Loading subcategories and category details for:', product.categoryId);
      // Ensure subcategories and category details are loaded when categories become available
      loadSubcategories(product.categoryId);
      fetchCategoryDetails(product.categoryId);
    }
  }, [categories.length, product?.categoryId, isEdit, selectedCategoryId, loadSubcategories, fetchCategoryDetails]);

  // Load category details when product is loaded (for edit mode)
  useEffect(() => {
    if (isEdit && product && product.categoryId && categories.length > 0) {
      console.log('🔄 Product loaded, loading category details for:', product.categoryId);
      loadSubcategories(product.categoryId);
      fetchCategoryDetails(product.categoryId);
    }
  }, [product?.id, categories.length, isEdit, loadSubcategories, fetchCategoryDetails]);

  // Weight unit conversion functions
  const convertToKg = (weight: number | string, unit: string) => {
    if (!weight) return 0;
    weight = parseFloat(weight);

    switch (unit) {
      case 'kg':
        return weight;
      case 'g':
        return weight / 1000;
      case 'lb':
        return weight * 0.45359237;
      case 'oz':
        return weight * 0.0283495;
      default:
        return weight;
    }
  };

  const convertFromKg = (weightInKg: number, targetUnit: string) => {
    if (!weightInKg) return 0;

    switch (targetUnit) {
      case 'kg':
        return weightInKg;
      case 'g':
        return weightInKg * 1000;
      case 'lb':
        return weightInKg / 0.45359237;
      case 'oz':
        return weightInKg / 0.0283495;
      default:
        return weightInKg;
    }
  };

  // Dynamically build validation schema based on packaging hierarchy
  const validationSchema = useMemo(() => {
    const baseSchema = {
      name: Yup.string().required('Product name is required'),
      sku: Yup.string().optional(),
      description: Yup.string().required('Description is required'),
      price: Yup.number().min(0).optional(),
      currency: Yup.string().optional(),
      categoryId: Yup.number().required('Category is required'),
      subCategoryId: Yup.number().optional(),
      totalBoxes: Yup.number().integer().min(1).optional(),
      grossWeightPerBox: Yup.number().min(0).optional(),
      grossWeightUnit: Yup.string().optional(),
      packagingMaterialWeight: Yup.number().min(0).optional(),
      packagingMaterialWeightUnit: Yup.string().optional(),
      // Weight input fields
      unitWeight: Yup.number().min(0).optional(),
      unitWeightUnit: Yup.string().optional(),
      weightUnitType: Yup.string().optional(),
    };

    // Add validation for packaging hierarchy fields
    packagingHierarchy.forEach((level) => {
      const quantityField = `${level.from}Per${level.to}`;
      const weightField = `weightPer${
        level.from.charAt(0).toUpperCase() + level.from.slice(1)
      }`;
      const weightUnitField = `${weightField}Unit`;

      // Also add validation for 'to' unit weight fields
      const toWeightField = `weightPer${
        level.to.charAt(0).toUpperCase() + level.to.slice(1)
      }`;
      const toWeightUnitField = `${toWeightField}Unit`;

      baseSchema[quantityField] = Yup.number().min(0).optional();
      baseSchema[weightField] = Yup.number().min(0).optional();
      baseSchema[weightUnitField] = Yup.string().optional();
      baseSchema[toWeightField] = Yup.number().min(0).optional();
      baseSchema[toWeightUnitField] = Yup.string().optional();
    });

    // Add packaging dimension validation
    baseSchema.packagingLength = Yup.number().min(0).optional();
    baseSchema.packagingWidth = Yup.number().min(0).optional();
    baseSchema.packagingHeight = Yup.number().min(0).optional();
    baseSchema.packagingVolume = Yup.number().min(0).optional();

    // Add volume validation if needed
    if (trackVolume) {
      baseSchema.volumeLength = Yup.number().min(0).optional();
      baseSchema.volumeWidth = Yup.number().min(0).optional();
      baseSchema.volumeHeight = Yup.number().min(0).optional();
    }

    return Yup.object().shape(baseSchema);
  }, [packagingHierarchy, trackVolume]);

  // Dynamically build initial values based on packaging hierarchy
  const initialValues = useMemo(() => {
    console.log('🧮 initialValues: Computing', {
      isEdit,
      hasProduct: !!product,
      categoriesLoading,
      packagingHierarchyLength: packagingHierarchy.length
    });
    
    // Prevent re-computation if essential data is not ready
    if (isEdit && (!product || categoriesLoading)) {
      console.log('⏭️ initialValues: Returning null - data not ready');
      return null;
    }
    const baseValues = {
      name: product?.name || '',
      sku: product?.sku || '',
      description: product?.description || '',
      price: product?.price || '',
      currency: product?.currency || 'USD',
      categoryId: product?.categoryId || selectedCategoryId || '',
      subCategoryId: product?.subCategoryId || '',
      totalBoxes: product?.totalBoxes || 1,
      grossWeightPerBox: product?.grossWeightPerBox || '',
      grossWeightUnit: product?.grossWeightUnit || 'kg',
      packagingMaterialWeight:
        product?.packagingMaterialWeight ??
        product?.packagingHierarchyData?.dynamicFields
          ?.packagingMaterialWeight ??
        '',
      packagingMaterialWeightUnit:
        product?.packagingMaterialWeightUnit ??
        product?.packagingHierarchyData?.dynamicFields
          ?.packagingMaterialWeightUnit ??
        'g',
      // Weight input fields - populate from existing data
      unitWeight: product?.unitWeight || '',
      unitWeightUnit: product?.unitWeightUnit || 'kg',
      weightUnitType: product?.weightUnitType || '',
      // Calculated fields
      totalPieces: product?.totalPieces || '',
      totalGrossWeight: product?.totalGrossWeight || '',
      totalGrossWeightUnit: product?.totalGrossWeightUnit || 'g',
      volumePerBox: product?.volumePerBox || '',
      totalVolume: product?.totalVolume || '',
    };

    // Add fields for packaging hierarchy
    packagingHierarchy.forEach((level) => {
      const quantityField = `${level.from}Per${level.to}`;
      const weightField = `weightPer${
        level.from.charAt(0).toUpperCase() + level.from.slice(1)
      }`;
      const weightUnitField = `${weightField}Unit`;

      // Also add weight fields for 'to' units (like Box)
      const toWeightField = `weightPer${
        level.to.charAt(0).toUpperCase() + level.to.slice(1)
      }`;
      const toWeightUnitField = `${toWeightField}Unit`;

      baseValues[quantityField] =
        product?.[quantityField] ??
        product?.packagingHierarchyData?.dynamicFields?.[quantityField] ??
        '';
      baseValues[weightField] =
        product?.[weightField] ??
        product?.packagingHierarchyData?.dynamicFields?.[weightField] ??
        '';
      // Set appropriate default unit based on packaging level
      const defaultFromUnit =
        level.from.toLowerCase() === 'pieces' ||
        level.from.toLowerCase() === 'pack'
          ? 'g'
          : 'kg';
      const defaultToUnit =
        level.to.toLowerCase() === 'box' ||
        level.to.toLowerCase() === 'carton' ||
        level.to.toLowerCase() === 'pallet'
          ? 'kg'
          : 'g';

      // Get existing unit from product data
      const existingFromUnit =
        product?.[weightUnitField] ??
        product?.packagingHierarchyData?.dynamicFields?.[weightUnitField];
      const existingToUnit =
        product?.[toWeightUnitField] ??
        product?.packagingHierarchyData?.dynamicFields?.[toWeightUnitField];

      baseValues[weightUnitField] = existingFromUnit ?? defaultFromUnit;

      // Add 'to' unit weight fields
      const toWeight =
        product?.[toWeightField] ??
        product?.packagingHierarchyData?.dynamicFields?.[toWeightField];
      baseValues[toWeightField] = toWeight ?? '';
      baseValues[toWeightUnitField] = existingToUnit ?? defaultToUnit;
    });

    // If editing and unitWeight is empty, try to populate from packaging hierarchy data
    if (
      isEdit &&
      product &&
      !baseValues.unitWeight &&
      packagingHierarchy.length > 0
    ) {
      // Try to find a weight value from the packaging hierarchy
      for (const level of packagingHierarchy) {
        const weightField = `weightPer${
          level.from.charAt(0).toUpperCase() + level.from.slice(1)
        }`;
        const weightUnitField = `${weightField}Unit`;

        const weightValue =
          product?.packagingHierarchyData?.dynamicFields?.[weightField];
        const weightUnit =
          product?.packagingHierarchyData?.dynamicFields?.[weightUnitField];

        if (weightValue) {
          baseValues.unitWeight = weightValue;
          baseValues.unitWeightUnit = weightUnit || 'kg';
          baseValues.weightUnitType = level.from;
          break;
        }
      }
    }

    // Add packaging dimension fields with fallback to dynamicFields
    baseValues.packagingLength =
      product?.packagingLength ??
      product?.packagingHierarchyData?.dynamicFields?.packagingLength ??
      '';
    baseValues.packagingWidth =
      product?.packagingWidth ??
      product?.packagingHierarchyData?.dynamicFields?.packagingWidth ??
      '';
    baseValues.packagingHeight =
      product?.packagingHeight ??
      product?.packagingHierarchyData?.dynamicFields?.packagingHeight ??
      '';
    baseValues.packagingVolume =
      product?.packagingVolume ??
      product?.packagingHierarchyData?.dynamicFields?.packagingVolume ??
      '';

    // Add volume fields if needed
    if (trackVolume) {
      baseValues.volumeLength = product?.volumeLength || '';
      baseValues.volumeWidth = product?.volumeWidth || '';
      baseValues.volumeHeight = product?.volumeHeight || '';
    }

    console.log('✅ initialValues: Computed successfully');
    return baseValues;
  }, [product?.id, packagingHierarchy, trackVolume, isEdit, selectedCategoryId, categoriesLoading]);

  const handleSubmit = async (values: Record<string, unknown>, { setSubmitting, setFieldError }: { setSubmitting: (isSubmitting: boolean) => void; setFieldError: (field: string, message: string) => void }) => {
    try {
      setSubmitting(true);

      // Validate required fields before submission
      if (!values.name || !values.categoryId) {
        toast.error('Please fill all required fields (Name and Category)');
        setSubmitting(false);
        return;
      }

      const productData = {
        name: values.name.trim(),
        sku: values.sku?.trim() || null,
        description: values.description?.trim() || '',
        price: values.price ? parseFloat(values.price) : null,
        currency: values.currency || 'USD',
        categoryId: parseInt(values.categoryId),
        subCategoryId: values.subCategoryId
          ? parseInt(values.subCategoryId)
          : null,
        totalBoxes: values.totalBoxes ? parseInt(values.totalBoxes) : 1,
        grossWeightPerBox: values.grossWeightPerBox
          ? parseFloat(values.grossWeightPerBox)
          : null,
        grossWeightUnit: values.grossWeightUnit || 'kg',
        packagingMaterialWeight: values.packagingMaterialWeight
          ? parseFloat(values.packagingMaterialWeight)
          : null,
        packagingMaterialWeightUnit: values.packagingMaterialWeightUnit || 'g',
        // Unit weight fields
        unitWeight: values.unitWeight ? parseFloat(values.unitWeight) : null,
        unitWeightUnit: values.unitWeightUnit || 'kg',
        weightUnitType: values.weightUnitType || null,
        // Include calculated fields
        totalPieces: values.totalPieces ? parseInt(values.totalPieces) : null,
        totalGrossWeight: values.totalGrossWeight
          ? parseFloat(values.totalGrossWeight)
          : null,
        totalGrossWeightUnit:
          values.totalGrossWeightUnit || values.unitWeightUnit || 'kg',
        volumePerBox: values.volumePerBox
          ? parseFloat(values.volumePerBox)
          : null,
        totalVolume: values.totalVolume ? parseFloat(values.totalVolume) : null,

        // Add dynamic packaging fields
        ...packagingHierarchy.reduce((acc, level) => {
          const quantityField = `${level.from}Per${level.to}`;
          const weightField = `weightPer${
            level.from.charAt(0).toUpperCase() + level.from.slice(1)
          }`;
          const weightUnitField = `${weightField}Unit`;

          // Also add weight fields for 'to' units (like Box)
          const toWeightField = `weightPer${
            level.to.charAt(0).toUpperCase() + level.to.slice(1)
          }`;
          const toWeightUnitField = `${toWeightField}Unit`;

          acc[quantityField] = values[quantityField]
            ? parseFloat(values[quantityField])
            : null;
          acc[weightField] = values[weightField]
            ? parseFloat(values[weightField])
            : null;

          // Set appropriate default unit based on packaging level
          const defaultFromUnit =
            level.from.toLowerCase() === 'pieces' ||
            level.from.toLowerCase() === 'pack'
              ? 'g'
              : 'kg';
          const defaultToUnit =
            level.to.toLowerCase() === 'box' ||
            level.to.toLowerCase() === 'carton' ||
            level.to.toLowerCase() === 'pallet'
              ? 'kg'
              : 'g';
          acc[weightUnitField] = values[weightUnitField] || defaultFromUnit;

          // Add 'to' unit weight fields with proper unit conversion
          const toWeight = values[toWeightField]
            ? parseFloat(values[toWeightField])
            : null;
          const toWeightUnit = values[toWeightUnitField] || defaultToUnit;

          // Convert weight to match the unit being sent
          if (
            toWeight &&
            values.unitWeightUnit &&
            toWeightUnit !== values.unitWeightUnit
          ) {
            // Convert from display unit (unitWeightUnit) to target unit (toWeightUnit)
            const weightInKg = convertToKg(toWeight, values.unitWeightUnit);
            acc[toWeightField] = convertFromKg(weightInKg, toWeightUnit);
          } else {
            acc[toWeightField] = toWeight;
          }
          acc[toWeightUnitField] = toWeightUnit;

          return acc;
        }, {}),

        // Add packaging dimension fields
        packagingLength: values.packagingLength
          ? parseFloat(values.packagingLength)
          : null,
        packagingWidth: values.packagingWidth
          ? parseFloat(values.packagingWidth)
          : null,
        packagingHeight: values.packagingHeight
          ? parseFloat(values.packagingHeight)
          : null,
        packagingVolume: values.packagingVolume
          ? parseFloat(values.packagingVolume)
          : null,

        // Add volume fields if needed
        volumeLength:
          trackVolume && values.volumeLength
            ? parseFloat(values.volumeLength)
            : null,
        volumeWidth:
          trackVolume && values.volumeWidth
            ? parseFloat(values.volumeWidth)
            : null,
        volumeHeight:
          trackVolume && values.volumeHeight
            ? parseFloat(values.volumeHeight)
            : null,
      };

      // Build packagingHierarchyData with dynamicFields
      const dynamicFields = {};

      // Add all weight fields to dynamicFields
      packagingHierarchy.forEach((level) => {
        const quantityField = `${level.from}Per${level.to}`;
        const weightField = `weightPer${level.from}`; // Keep original field name with spaces
        const weightUnitField = `${weightField}Unit`;
        const toWeightField = `weightPer${level.to}`; // Keep original field name with spaces
        const toWeightUnitField = `${toWeightField}Unit`;

        if (values[quantityField])
          dynamicFields[quantityField] = parseFloat(values[quantityField]);
        if (values[weightField])
          dynamicFields[weightField] = parseFloat(values[weightField]);
        if (values[weightUnitField])
          dynamicFields[weightUnitField] = values[weightUnitField];
        if (values[toWeightField])
          dynamicFields[toWeightField] = parseFloat(values[toWeightField]);
        if (values[toWeightUnitField])
          dynamicFields[toWeightUnitField] = values[toWeightUnitField];
      });

      // Add grossWeightPerBox to dynamicFields if it exists
      if (values.grossWeightPerBox) {
        dynamicFields.grossWeightPerBox = parseFloat(values.grossWeightPerBox);
      }

      // Add packagingHierarchyData to productData
      if (Object.keys(dynamicFields).length > 0) {
        productData.packagingHierarchyData = { dynamicFields };
      }

      console.log('Submitting product data:', productData);

      if (isEdit) {
        const result = await dispatch(
          updateProduct({
            id: product.id,
            product: productData,
          })
        ).unwrap();
        toast.success(result.message);
      } else {
        const result = await dispatch(addProduct(productData)).unwrap();
        toast.success(result.message);
      }

      // Wait for toast to show before navigating
      setTimeout(() => {
        navigate('/products', { replace: true });
        window.dispatchEvent(
          new CustomEvent('forceNavigation', { detail: '/products' })
        );
      }, 2000);
    } catch (error) {
      console.error('Product submission error:', error);

      // Check if it's a duplicate SKU error
      const errorMessage =
        error?.response?.data?.message || error?.message || error;
      if (
        typeof errorMessage === 'string' &&
        errorMessage.toLowerCase().includes('sku')
      ) {
        // Set field-specific error for SKU
        setFieldError('sku', errorMessage);
        toast.error(errorMessage);
      } else {
        toast.error(errorMessage);
      }

      // Don't reset form data on error
    } finally {
      setSubmitting(false);
    }
  };

  console.log('🎨 Render decision:', {
    shouldRender,
    hasInitialValues: !!initialValues,
    loading,
    categoriesLoading,
    hasProduct: !!product
  });

  // Don't render if not on correct route
  if (!shouldRender) {
    console.log('❌ Not rendering - shouldRender is false');
    return null;
  }

  if (!initialValues || loading || categoriesLoading || (isEdit && !product)) {
    console.log('⏳ Showing loading screen');
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-slate-600 mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  console.log('✅ Rendering main component');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-2 lg:p-4">
        {/* Header */}
        <div className="mb-3">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-3 lg:p-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate('/products')}
                  className="p-3 rounded-lg bg-slate-700 text-white hover:bg-slate-800 transition-all duration-300 hover:shadow-lg"
                >
                  <HiArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 mb-1">
                    {isEdit ? 'Edit Product' : 'Add New Product'}
                  </h1>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 lg:p-8">
          <Formik
            key={`formik-${isEdit ? product?.id || 'edit' : 'add'}`}
            initialValues={initialValues}
            validationSchema={validationSchema}
            enableReinitialize={true}
            onSubmit={handleSubmit}
          >
            {({ values, errors, touched, setFieldValue, isSubmitting }) => (
              <Form className="space-y-6">
                <BasicProductInfo
                  values={values}
                  errors={errors}
                  touched={touched}
                  setFieldValue={setFieldValue}
                  categories={categories}
                  subcategories={subcategories}
                  categoriesLoading={categoriesLoading}
                  selectedCategoryId={selectedCategoryId}
                  setSelectedCategoryId={setSelectedCategoryId}
                  loadSubcategories={loadSubcategories}
                  fetchCategoryDetails={fetchCategoryDetails}
                  setSubcategories={setSubcategories}
                  setPackagingHierarchy={setPackagingHierarchy}
                  setTrackVolume={setTrackVolume}
                />

                <PackagingCalculations
                  packagingHierarchy={packagingHierarchy}
                  trackVolume={trackVolume}
                  convertToKg={convertToKg}
                  convertFromKg={convertFromKg}
                />

                <PackagingDetails
                  values={values}
                  setFieldValue={setFieldValue}
                  packagingHierarchy={packagingHierarchy}
                  trackVolume={trackVolume}
                  loadingCategory={loadingCategory}
                />

                <PackagingPreview
                  values={values}
                  packagingHierarchy={packagingHierarchy}
                  convertToKg={convertToKg}
                  convertFromKg={convertFromKg}
                  setFieldValue={setFieldValue}
                />

                {/* Submit Buttons */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 sm:gap-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => navigate('/products')}
                    className="px-6 py-3 rounded-lg border border-gray-300 text-slate-600 hover:bg-gray-50 transition-all duration-300 order-2 sm:order-1"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || isSubmitting}
                    className="px-6 py-3 rounded-lg font-semibold text-white bg-slate-700 hover:bg-slate-800 transition-all duration-300 hover:shadow-xl disabled:opacity-50 shadow-lg order-1 sm:order-2"
                  >
                    {loading || isSubmitting ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span className="hidden sm:inline">
                          {isEdit ? 'Updating...' : 'Creating...'}
                        </span>
                        <span className="sm:hidden">
                          {isEdit ? 'Update' : 'Create'}
                        </span>
                      </div>
                    ) : (
                      <>
                        <HiCheckCircle className="w-5 h-5 mr-2 inline" />
                        <span className="hidden sm:inline">
                          {isEdit ? 'Update Product' : 'Create Product'}
                        </span>
                        <span className="sm:hidden">
                          {isEdit ? 'Update' : 'Create'}
                        </span>
                      </>
                    )}
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

export default React.memo(AddEditProductForm);
