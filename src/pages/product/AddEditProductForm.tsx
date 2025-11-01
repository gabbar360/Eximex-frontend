import { useDispatch, useSelector } from 'react-redux';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { getAllCategories, getCategoryById } from '../../features/categorySlice';
import { getProductById, updateProduct, addProduct } from '../../features/productSlice';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import PageMeta from '../../components/common/PageMeta';


import BasicProductInfo from '../../components/product/BasicProductInfo';
import PackagingDetails from '../../components/product/PackagingDetails';
import PackagingPreview from '../../components/product/PackagingPreview';
import PackagingCalculations from '../../components/product/PackagingCalculations';

// Weight display component with unit conversion
const WeightDisplay = ({
  weight,
  unit,
  materialWeight,
  materialUnit,
  totalBoxes,
}) => {
  const [displayUnit, setDisplayUnit] = useState(unit);

  // Convert weight to display unit
  const convertWeight = (weight, fromUnit, toUnit) => {
    // Convert to kg first
    let weightInKg;
    switch (fromUnit) {
      case 'g':
        weightInKg = weight / 1000;
        break;
      case 'lb':
        weightInKg = weight * 0.45359237;
        break;
      case 'oz':
        weightInKg = weight * 0.0283495;
        break;
      default:
        weightInKg = weight; // kg
    }

    // Convert from kg to target unit
    switch (toUnit) {
      case 'g':
        return weightInKg * 1000;
      case 'lb':
        return weightInKg / 0.45359237;
      case 'oz':
        return weightInKg / 0.0283495;
      default:
        return weightInKg; // kg
    }
  };

  // Calculate converted weights
  const convertedWeight = convertWeight(weight, unit, displayUnit);

  // Calculate material weight if provided
  let convertedMaterialText = '';
  if (materialWeight > 0 && totalBoxes > 0) {
    const totalMaterialWeight = materialWeight * totalBoxes;
    const convertedMaterialWeight = convertWeight(
      totalMaterialWeight,
      materialUnit,
      displayUnit
    );
    convertedMaterialText = ` (Includes ${convertedMaterialWeight.toFixed(
      2
    )} ${displayUnit} box material)`;
  }

  return (
    <>
      <div>
        {weight > 0
          ? `${convertedWeight.toFixed(
              2
            )} ${displayUnit}${convertedMaterialText}`
          : 'N/A'}
      </div>
      <div className="mt-1">
        <select
          value={displayUnit}
          onChange={(e) => setDisplayUnit(e.target.value)}
          className="ml-1 text-xs border border-gray-300 rounded px-1 py-0.5 dark:bg-gray-700 dark:border-gray-600"
        >
          <option value="kg">Show in kg</option>
          <option value="g">Show in g</option>
          <option value="lb">Show in lb</option>
          <option value="oz">Show in oz</option>
        </select>
      </div>
    </>
  );
};

const AddEditProductForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const dispatch = useDispatch();

  // Check if we should render this component
  const [forceHide, setForceHide] = useState(false);
  const shouldRender =
    (location.pathname.startsWith('/edit-product/') ||
      location.pathname === '/add-product') &&
    !forceHide;

  // Listen for force navigation events
  useEffect(() => {
    const handleForceNavigation = (event) => {
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

  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  type ProductType = {
    [key: string]: any;
    packagingHierarchyData?: {
      dynamicFields?: {
        [key: string]: any;
      };
    };
  };

  const [product, setProduct] = useState<ProductType | null>(null);

  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [packagingHierarchy, setPackagingHierarchy] = useState([]);
  const [trackVolume, setTrackVolume] = useState(false);
  const [loadingCategory, setLoadingCategory] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');

  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      const response = await dispatch(getAllCategories()).unwrap();
      setCategories(response.data || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      toast.error(error.message);
    } finally {
      setCategoriesLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    if (isEdit) {
      fetchProduct();
    }
  }, [isEdit, id]);

  // Handle category loading completion for edit mode
  useEffect(() => {
    if (
      isEdit &&
      product &&
      categories &&
      categories.length > 0 &&
      product.categoryId
    ) {
      // Ensure subcategories and category details are loaded when categories become available
      loadSubcategories(product.categoryId);
      fetchCategoryDetails(product.categoryId);
    }
  }, [categories, product, isEdit]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await dispatch(getProductById(id)).unwrap();
      setProduct(response.data);
      if (response.data.categoryId) {
        setSelectedCategoryId(response.data.categoryId.toString());
        loadSubcategories(response.data.categoryId);
        fetchCategoryDetails(response.data.categoryId);
      }
    } catch (error) {
      console.error('Fetch product error:', error);
      toast.error(error.message);
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  const loadSubcategories = useCallback(
    (categoryId) => {
      if (!categoryId || !categories || categories.length === 0) {
        setSubcategories([]);
        return;
      }

      // Find the selected category and get its subcategories
      const selectedCategory = categories.find(
        (cat) => parseInt(cat.id) === parseInt(categoryId)
      );

      if (selectedCategory && selectedCategory.subcategories) {
        setSubcategories(selectedCategory.subcategories);
      } else {
        setSubcategories([]);
      }
    },
    [categories]
  );

  // Fetch category details including packaging hierarchy
  const fetchCategoryDetails = useCallback(async (categoryId) => {
    if (!categoryId) return;

    try {
      setLoadingCategory(true);
      const categoryData = await dispatch(getCategoryById(categoryId)).unwrap();

      if (categoryData && categoryData.packagingHierarchy) {
        setPackagingHierarchy(categoryData.packagingHierarchy);
        setTrackVolume(categoryData.trackVolume || false);
      } else {
        setPackagingHierarchy([]);
        setTrackVolume(false);
      }
      setLoadingCategory(false);
    } catch (error) {
      console.error('Failed to fetch category details:', error);
      setPackagingHierarchy([]);
      setTrackVolume(false);
      setLoadingCategory(false);
    }
  }, []);

  // Weight unit conversion functions
  const convertToKg = (weight, unit) => {
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

  const convertFromKg = (weightInKg, targetUnit) => {
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

      baseSchema[quantityField] = Yup.number().integer().min(1).optional();
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
      packagingMaterialWeight: product?.packagingMaterialWeight || '',
      packagingMaterialWeightUnit: product?.packagingMaterialWeightUnit || 'g',
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
        level.to.toLowerCase() === 'box' || level.to.toLowerCase() === 'carton'
          ? 'kg'
          : 'g';

      // Get existing unit from product data
      const existingFromUnit =
        product?.[weightUnitField] ??
        product?.packagingHierarchyData?.dynamicFields?.[weightUnitField];
      const existingToUnit =
        product?.[toWeightUnitField] ??
        product?.packagingHierarchyData?.dynamicFields?.[toWeightUnitField];

      // Override incorrect units: if pieces/pack weight is in kg but value is small (< 100), it should be grams
      const fromWeight =
        product?.[weightField] ??
        product?.packagingHierarchyData?.dynamicFields?.[weightField];
      const shouldOverrideFromUnit =
        existingFromUnit === 'kg' &&
        fromWeight &&
        fromWeight < 100 &&
        (level.from.toLowerCase() === 'pieces' ||
          level.from.toLowerCase() === 'pack');

      baseValues[weightUnitField] = shouldOverrideFromUnit
        ? 'g'
        : (existingFromUnit ?? defaultFromUnit);

      // Add 'to' unit weight fields
      const toWeight =
        product?.[toWeightField] ??
        product?.packagingHierarchyData?.dynamicFields?.[toWeightField];
      baseValues[toWeightField] = toWeight ?? '';

      // Override incorrect Box units: if box weight is in kg but value is very large (> 100), it should be grams
      const shouldOverrideToUnit =
        existingToUnit === 'kg' &&
        toWeight &&
        toWeight > 100 &&
        level.to.toLowerCase() === 'box';
      baseValues[toWeightUnitField] = shouldOverrideToUnit
        ? 'g'
        : (existingToUnit ?? defaultToUnit);
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

    // Add packaging dimension fields
    baseValues.packagingLength = product?.packagingLength || '';
    baseValues.packagingWidth = product?.packagingWidth || '';
    baseValues.packagingHeight = product?.packagingHeight || '';
    baseValues.packagingVolume = product?.packagingVolume || '';

    // Add volume fields if needed
    if (trackVolume) {
      baseValues.volumeLength = product?.volumeLength || '';
      baseValues.volumeWidth = product?.volumeWidth || '';
      baseValues.volumeHeight = product?.volumeHeight || '';
    }

    return baseValues;
  }, [product, packagingHierarchy, trackVolume, isEdit]);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setLoading(true);
      setSubmitting(true);

      // Validate required fields before submission
      if (!values.name || !values.categoryId) {
        toast.error('Please fill all required fields (Name and Category)');
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
            ? parseInt(values[quantityField])
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
            level.to.toLowerCase() === 'carton'
              ? 'kg'
              : 'g';

          // Apply unit correction logic for both create and edit modes
          const fromWeight = values[weightField]
            ? parseFloat(values[weightField])
            : null;
          const shouldOverrideFromUnit =
            values[weightUnitField] === 'kg' &&
            fromWeight &&
            fromWeight < 100 &&
            (level.from.toLowerCase() === 'pieces' ||
              level.from.toLowerCase() === 'pack');

          acc[weightUnitField] = shouldOverrideFromUnit
            ? 'g'
            : values[weightUnitField] || defaultFromUnit;

          // Add 'to' unit weight fields
          acc[toWeightField] = values[toWeightField]
            ? parseFloat(values[toWeightField])
            : null;

          // Apply unit correction for 'to' units as well
          const toWeight = values[toWeightField]
            ? parseFloat(values[toWeightField])
            : null;
          const shouldOverrideToUnit =
            values[toWeightUnitField] === 'kg' &&
            toWeight &&
            toWeight > 100 &&
            level.to.toLowerCase() === 'box';

          acc[toWeightUnitField] = shouldOverrideToUnit
            ? 'g'
            : values[toWeightUnitField] || defaultToUnit;

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
        const weightField = `weightPer${level.from.charAt(0).toUpperCase() + level.from.slice(1)}`;
        const weightUnitField = `${weightField}Unit`;
        const toWeightField = `weightPer${level.to.charAt(0).toUpperCase() + level.to.slice(1)}`;
        const toWeightUnitField = `${toWeightField}Unit`;

        if (values[quantityField])
          dynamicFields[quantityField] = parseInt(values[quantityField]);
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
        const result = await dispatch(updateProduct({
          id: product.id,
          product: productData
        })).unwrap();
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
      toast.error(error.message);
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  // Don't render if not on correct route
  if (!shouldRender) {
    console.log(
      'AddEditProductForm: Not rendering, current path:',
      location.pathname
    );
    return null;
  }

  console.log(
    'AddEditProductForm: Rendering, current path:',
    location.pathname
  );

  if (!initialValues || loading || categoriesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  return (
    <>
      <PageMeta title={`${isEdit ? 'Edit' : 'Add'} Product | EximEx`} />
      <PageBreadcrumb
        pageTitle={`${isEdit ? 'Edit' : 'Add'} Product`}
        breadcrumbItems={[{ label: 'Products', href: '/products' }]}
      />

      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-6">
          {isEdit ? 'Edit Product' : 'Add Product'}
        </h3>

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
              <div className="flex gap-3 pt-6 border-t border-gray-200 dark:border-gray-800">
                <button
                  type="submit"
                  disabled={loading || isSubmitting}
                  className="rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading || isSubmitting ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      {isEdit ? 'Updating...' : 'Creating...'}
                    </span>
                  ) : isEdit ? (
                    'Update Product'
                  ) : (
                    'Create Product'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => window.history.back()}
                  className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </>
  );
};

export default AddEditProductForm;
