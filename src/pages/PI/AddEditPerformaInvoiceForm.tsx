import { useDispatch, useSelector } from 'react-redux';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { fetchCategories } from '../../features/categorySlice';
import { fetchProducts } from '../../features/productSlice';

// Extend Window interface for timeout handling
declare global {
  interface Window {
    quantityTimeout: NodeJS.Timeout;
    weightTimeout: NodeJS.Timeout;
    rateTimeout: NodeJS.Timeout;
  }
}
import { createPortal } from 'react-dom';
import { useNavigate, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faTimes,
  faEye,
  faCheck,
  faChevronLeft,
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import form components
import Form from '../../components/form/Form';
import Label from '../../components/form/Label';
import Input from '../../components/form/input/InputField';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import PageMeta from '../../components/common/PageMeta';
import TextArea from '../../components/form/input/TextArea';

import { fetchParties, getAllParties } from '../../features/partySlice';
import {
  createPiInvoice,
  updatePiInvoice,
  getPiInvoiceById,
} from '../../features/piSlice';

// Import PI components
import ProductRow from '../../components/PI/ProductRow';
import ProductTable from '../../components/PI/ProductTable';
import OtherChargesList from '../../components/PI/OtherChargesList';

// Import utility functions
import {
  calculateTotalWeight,
  calculateQuantityFromWeight,
  calculateGrossWeight,
} from '../../utils/weightCalculations';

// --- Types ---
type Company = {
  id: string;
  name: string;
  status: string;
  contactPerson: string;
  address: string;
  country: string;
  email: string;
  phone: string;
};

type Product = {
  id: string;
  name: string;
  hsCode: string;
  description: string;
  weightPerUnitKg: number;
  packingBoxWeightKg: number;
  units: string[];
  categoryId?: string;
  subcategoryId?: string;
  packingConfig?: {
    weightPerBox: number;
    unitsPerBox: number;
    cbmPerBox: number;
  };
  packingHierarchy?: {
    primaryUnit: string;
    secondaryUnit: string;
    packagingUnit: string;
    conversionRates: {
      piecesPerBox: number;
      boxesPerPallet: number;
      palletsPerContainer: number;
    };
    weights: {
      weightPerPiece: number;
      weightPerBox: number;
      weightPerPallet: number;
    };
    volumes: {
      cbmPerBox: number;
      cbmPerPallet: number;
    };
  };
};

type ProductAdded = {
  productId: string;
  quantity: string;
  rate: string;
  unit: string;
  categoryId?: string;
  subcategoryId?: string;
  quantityByWeight?: string;
  packagingCalculation?: {
    totalBoxes: number;
    totalPallets: number;
    sqmPerBox: number;
    boxesPerPallet: number;
    calculatedFor: number;
  };
};

type ProductData = {
  productId: string;
  name: string;
  productName?: string;
  hsCode: string;
  description: string;
  quantity: number;
  rate: number;
  unit: string;
  total: number;
  totalWeight?: number;
  convertedQuantity?: number;
  categoryId?: string;
  subcategoryId?: string;
  packagingCalculation?: {
    totalBoxes: number;
    totalPallets: number;
    sqmPerBox: number;
    boxesPerPallet: number;
    calculatedFor: number;
  };
};

type Charges = {
  [key: string]: any;
};

type PIData = {
  company: Company | undefined;
  paymentTerm: string;
  deliveryTerm: string;
  productsData: ProductData[];
  charges: Charges;
  containerType?: string;
  capacityBasis?: string;
  numberOfContainers?: number;
  maxWeight?: number;
};

type PI = {
  piNumber: string;
  date: string;
  status: string;
  data: PIData;
};

type ContainerConfig = {
  type: string;
  cbm: number;
  maxWeight: number;
};

type PackingCalculation = {
  inputQuantity: number;
  inputUnit: string;
  calculatedBoxes: number;
  calculatedPallets: number;
  totalWeight: number;
  totalCBM: number;
  containerCapacityUsed: number;
};

type ContainerUtilization = {
  totalWeight: number;
  totalVolume: number;
  weightUtilization: number;
  volumeUtilization: number;
  recommendedContainers: number;
  limitingFactor: 'weight' | 'volume';
};

type Category = {
  id: string;
  name: string;
};

type Subcategory = {
  id: string;
  name: string;
  categoryId: string;
};

// Container static configurations
const CONTAINER_CONFIGS: ContainerConfig[] = [
  { type: '20 Feet', cbm: 28, maxWeight: 21000 },
  { type: '40 Feet', cbm: 56, maxWeight: 26500 },
  { type: '40 Feet HQ', cbm: 68, maxWeight: 26500 },
  { type: 'LCL', cbm: 0, maxWeight: 0 },
];

// Categories and subcategories
const categoriesStatic: Category[] = [
  { id: 'cat1', name: 'Ceramics' },
  { id: 'cat2', name: 'Bagasse' },
  { id: 'cat3', name: 'Engineering' },
  { id: 'cat4', name: 'Agri-Products' },
];

const subcategoriesStatic: Subcategory[] = [
  { id: 'sub1', name: 'Tiles', categoryId: 'cat1' },
  { id: 'sub2', name: 'Sanitaryware', categoryId: 'cat1' },
  { id: 'sub3', name: 'Plates', categoryId: 'cat2' },
  { id: 'sub4', name: 'Bowls', categoryId: 'cat2' },
  { id: 'sub5', name: 'Machinery', categoryId: 'cat3' },
  { id: 'sub6', name: 'Tools', categoryId: 'cat3' },
];

const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
];
const containerTypes: ContainerConfig[] = CONTAINER_CONFIGS;
const currencies: any[] = CURRENCIES;

const paymentTermNames: Record<string, string> = {
  advance: 'Advance',
  lc: 'LC',
  '30days': '30 Days Credit',
};
const deliveryTermNames: Record<string, string> = {
  fob: 'FOB',
  cif: 'CIF',
  ddp: 'DDP',
};
const chargesTemplates: Record<string, any[]> = {
  fob: [
    {
      key: 'noOtherCharges',
      label: 'No other charges applicable',
      type: 'checkbox',
    },
  ],
  cif: [
    {
      key: 'freightCharge',
      label: 'Freight Charge',
      type: 'number',
      min: 0,
      step: 'any',
      placeholder: 'Enter freight charge',
    },
    {
      key: 'insurance',
      label: 'Insurance',
      type: 'number',
      min: 0,
      step: 'any',
      placeholder: 'Enter insurance charge',
    },
    { key: 'otherCharges', label: 'Other Charges', type: 'dynamicList' },
  ],
  ddp: [
    {
      key: 'freightCharge',
      label: 'Freight Charge',
      type: 'number',
      min: 0,
      step: 'any',
      placeholder: 'Enter freight charge',
    },
    {
      key: 'insurance',
      label: 'Insurance',
      type: 'number',
      min: 0,
      step: 'any',
      placeholder: 'Enter insurance charge',
    },
    {
      key: 'destinationPortHandlingCharge',
      label: 'Destination Port Handling Charge',
      type: 'number',
      min: 0,
      step: 'any',
      placeholder: 'Enter destination port handling charge',
    },
    {
      key: 'dutyPercent',
      label: 'Duty (%)',
      type: 'number',
      min: 0,
      max: 100,
      step: 'any',
      placeholder: 'Enter duty percentage',
    },
    {
      key: 'vatPercent',
      label: 'VAT (%)',
      type: 'number',
      min: 0,
      max: 100,
      step: 'any',
      placeholder: 'Enter VAT percentage',
    },
    {
      key: 'transportationCharge',
      label: 'Transportation Charge',
      type: 'number',
      min: 0,
      step: 'any',
      placeholder: 'Enter transportation charge',
    },
    { key: 'otherCharges', label: 'Other Charges', type: 'dynamicList' },
  ],
};

// --- Helper functions ---
const formatCurrency = (
  value: number,
  currencyCode: string = 'USD',
  minimumFractionDigits: number = 2,
  maximumFractionDigits: number = 3
) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(value);

const generatePiNumber = () => {
  const date = new Date();
  const y = date.getFullYear().toString().slice(-2);
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const d = date.getDate().toString().padStart(2, '0');
  const random = Math.floor(1000 + Math.random() * 9000);
  return `PI${y}${m}${d}-${random}`;
};

const AddEditPerformaInvoiceForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);

  const [companyId, setCompanyId] = useState<string>('');
  const [company, setCompany] = useState<Company | null>(null);
  const [paymentTerm, setPaymentTerm] = useState<string>('');
  const [deliveryTerm, setDeliveryTerm] = useState<string>('');
  const [charges, setCharges] = useState<Charges>({});
  const [otherCharges, setOtherCharges] = useState<any[]>([]);
  const [productsAdded, setProductsAdded] = useState<ProductAdded[]>([
    {
      productId: '',
      quantity: '',
      rate: '',
      unit: '',
      categoryId: '',
      subcategoryId: '',
      quantityByWeight: '',
    },
  ]);
  const [maxShipmentWeight, setMaxShipmentWeight] = useState<string>('');
  const [reviewOpen, setReviewOpen] = useState<boolean>(false);
  const [reviewData, setReviewData] = useState<PIData | null>(null);
  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [originalPiStatus, setOriginalPiStatus] = useState<string>('');
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: boolean;
  }>({});

  // Enhanced container management state
  const [containerType, setContainerType] = useState<string>('');
  const [capacityBasis, setCapacityBasis] = useState<'weight' | 'volume'>(
    'weight'
  );
  const [maxPermissibleWeight, setMaxPermissibleWeight] = useState<string>('');
  const [numberOfContainers, setNumberOfContainers] = useState<number>(1);
  const [containerUtilization, setContainerUtilization] =
    useState<ContainerUtilization | null>(null);

  // Shipping details state
  const [preCarriageBy, setPreCarriageBy] = useState<string>('');
  const [placeOfReceipt, setPlaceOfReceipt] = useState<string>('');
  const [countryOfOrigin, setCountryOfOrigin] = useState<string>('INDIA');
  const [countryOfDestination, setCountryOfDestination] = useState<string>('');

  const [portOfLoading, setPortOfLoading] = useState<string>('');
  const [portOfDischarge, setPortOfDischarge] = useState<string>('');
  const [finalDestination, setFinalDestination] = useState<string>('');

  // Enhanced product entry state
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');
  const [quantityByWeight, setQuantityByWeight] = useState<string>('');
  const [addedProducts, setAddedProducts] = useState<ProductData[]>([]);
  const [editingProductIndex, setEditingProductIndex] = useState<number | null>(
    null
  );
  const [showPIPreview, setShowPIPreview] = useState<boolean>(false);
  const [currency, setCurrency] = useState<string>('USD');
  const dispatch = useDispatch();
  const { categories } = useSelector((state: any) => state.category);
  const { products } = useSelector((state: any) => state.product);
  const [companies, setCompanies] = useState<Company[]>([]);

  // Debug Redux state
  console.log('Redux categories:', categories);
  console.log('Redux products:', products);
  console.log('Companies state:', companies);

  // Backend integration state
  const [formDataLoaded, setFormDataLoaded] = useState<boolean>(false);
  const [validationResult, setValidationResult] = useState<any>(null);

  // Step validation functions
  const validateStep1 = () => {
    const errors: { [key: string]: boolean } = {};

    if (!companyId || companyId.trim() === '') errors.companyId = true;
    if (!company?.contactPerson || company.contactPerson.trim() === '')
      errors.contactPerson = true;
    if (!company?.email || company.email.trim() === '') errors.email = true;
    if (!company?.phone || company.phone.trim() === '') errors.phone = true;
    if (!company?.country || company.country.trim() === '')
      errors.country = true;
    if (!company?.address || company.address.trim() === '')
      errors.address = true;

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep2 = () => {
    const errors: { [key: string]: boolean } = {};

    if (!containerType || containerType.trim() === '')
      errors.containerType = true;
    if (!numberOfContainers || numberOfContainers < 1)
      errors.numberOfContainers = true;

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep3 = () => {
    const errors: { [key: string]: boolean } = {};

    if (!paymentTerm || paymentTerm.trim() === '') errors.paymentTerm = true;
    if (!deliveryTerm || deliveryTerm.trim() === '') errors.deliveryTerm = true;

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep4 = () => {
    const errors: { [key: string]: boolean } = {};

    if (!maxShipmentWeight || maxShipmentWeight.trim() === '')
      errors.maxShipmentWeight = true;
    if (addedProducts.length === 0) errors.products = true;

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleStepComplete = (step: number) => {
    let isValid = false;

    switch (step) {
      case 1:
        isValid = validateStep1();
        if (!isValid) {
          toast.error('Please fill all required fields in red.');
          return false;
        }
        break;
      case 2:
        isValid = validateStep2();
        if (!isValid) {
          toast.error('Please fill all required fields in red.');
          return false;
        }
        break;
      case 3:
        isValid = validateStep3();
        if (!isValid) {
          toast.error('Please fill all required fields in red.');
          return false;
        }
        break;
      case 4:
        isValid = validateStep4();
        if (!isValid) {
          toast.error(
            'Please fill all required fields in red and add products.'
          );
          return false;
        }
        break;
    }

    if (isValid) {
      setValidationErrors({});
      setCompletedSteps((prev) => new Set([...prev, step]));
      if (step < 5) {
        setCurrentStep(step + 1);
      }
      return true;
    }
    return false;
  };

  // Company detail handlers
  const handleCompanyDetailChange = (field: keyof Company, value: string) => {
    if (company) {
      setCompany((prev) => (prev ? { ...prev, [field]: value } : null));
    }
  };

  const loadDefaultData = async () => {
    try {
      const partiesResponse = await dispatch(getAllParties()).unwrap();
      console.log('Full parties response:', partiesResponse);
      const partiesData =
        partiesResponse?.data?.data || partiesResponse?.data || [];
      console.log('Extracted parties data:', partiesData);
      setCompanies(partiesData);

      // Dispatch Redux actions for categories and products
      console.log('Dispatching fetchCategories and fetchProducts...');
      const categoriesResult = await dispatch(fetchCategories()).unwrap();
      const productsResult = await dispatch(
        fetchProducts({ limit: 1000 })
      ).unwrap();

      console.log('Categories loaded:', categoriesResult);
      console.log('Products loaded:', productsResult);
    } catch (err) {
      console.error('Error loading default data:', err);
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };
  // Load existing PI data if in edit mode
  useEffect(() => {
    loadDefaultData();
    if (isEditMode) {
      setLoading(true);
      try {
        // Fetch from API
        dispatch(getPiInvoiceById(parseInt(id!)))
          .unwrap()
          .then((response) => {
            const pi = response.data;
            if (pi) {
              // Set company data
              if (pi.partyId) {
                setCompanyId(pi.partyId.toString());
                setCompany({
                  id: pi.partyId.toString(),
                  name: pi.partyName,
                  status: 'active',
                  contactPerson: pi.contactPerson || '',
                  address: pi.address || '',
                  country: pi.country || '',
                  email: pi.email || '',
                  phone: pi.phone || '',
                });
              }

              // Set terms
              setPaymentTerm(pi.paymentTerm || '');
              setDeliveryTerm(pi.deliveryTerm || '');

              // Set charges
              setCharges(pi.charges || {});
              setOtherCharges(pi.charges?.otherCharges || []);

              // Set container info
              setContainerType(pi.containerType || '');
              setCapacityBasis(
                (pi.capacityBasis as 'weight' | 'volume') || 'weight'
              );
              setMaxPermissibleWeight(
                pi.maxPermissibleWeight?.toString() || ''
              );
              setNumberOfContainers(pi.numberOfContainers || 1);

              // Set currency
              setCurrency(pi.currency || 'USD');

              // Store original PI status
              setOriginalPiStatus(pi.status || '');

              // Set max shipment weight
              setMaxShipmentWeight(pi.maxShipmentWeight?.toString() || '');

              // Set shipping details
              setPreCarriageBy(pi.preCarriageBy || '');
              setPlaceOfReceipt(pi.placeOfReceipt || '');
              setCountryOfOrigin(pi.countryOfOrigin || 'INDIA');
              setCountryOfDestination(pi.countryOfDestination || '');

              setPortOfLoading(pi.portOfLoading || '');
              setPortOfDischarge(pi.portOfDischarge || '');
              setFinalDestination(pi.finalDestination || '');

              // Set products
              if (pi.products && pi.products.length > 0) {
                // Add products to the table
                const productDataList = pi.products.map((p: any) => ({
                  productId: p.productId?.toString() || '',
                  name: p.productName,
                  hsCode: p.hsCode || '',
                  description: p.productDescription || '',
                  quantity: p.quantity,
                  rate: p.rate,
                  unit: p.unit,
                  total: p.total,
                  totalWeight: p.totalWeight,
                  categoryId: p.categoryId?.toString(),
                  subcategoryId: p.subcategoryId?.toString(),
                }));

                setAddedProducts(productDataList);

                // Set the first product form
                const firstProduct = pi.products[0];
                setProductsAdded([
                  {
                    productId: firstProduct.productId?.toString() || '',
                    quantity: firstProduct.quantity.toString(),
                    rate: firstProduct.rate.toString(),
                    unit: firstProduct.unit,
                    categoryId: firstProduct.categoryId?.toString(),
                    subcategoryId: firstProduct.subcategoryId?.toString(),
                    quantityByWeight: '',
                  },
                ]);
              } else {
                setProductsAdded([
                  { productId: '', quantity: '', rate: '', unit: '' },
                ]);
              }
            }
          })
          .catch((err) => {
            setError(err.message || 'Failed to load Proforma Invoice');
            toast.error('Failed to load Proforma Invoice');
          })
          .finally(() => {
            setLoading(false);
          });
      } catch (err: any) {
        setError(err.message || 'Failed to load Proforma Invoice');
        toast.error('Failed to load Proforma Invoice');
        setLoading(false);
      }
    }
  }, [id, isEditMode]);

  const handleCompanyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCompanyId(e.target.value);
    const selectedParty = companies.find((c) => c.id == e.target.value);
    if (selectedParty) {
      setCompany({
        id: selectedParty.id,
        name: selectedParty.name,
        status: selectedParty.status || 'active',
        contactPerson: selectedParty.contactPerson || '',
        address: selectedParty.address || '',
        country: selectedParty.country || '',
        email: selectedParty.email || '',
        phone: selectedParty.phone || '',
      });
    } else {
      setCompany(null);
    }
  };

  const handlePaymentTermChange = (e: React.ChangeEvent<HTMLSelectElement>) =>
    setPaymentTerm(e.target.value);

  const handleDeliveryTermChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setDeliveryTerm(e.target.value);
    setCharges({});
  };

  const handleChargeChange = (key: string, value: any) =>
    setCharges((prev) => ({ ...prev, [key]: value }));

  const handleOtherChargesChange = (list: any[]) => {
    setOtherCharges(list);
    setCharges((prev) => ({ ...prev, otherCharges: list }));
  };

  // Container management handlers
  const handleContainerTypeChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setContainerType(e.target.value);
    setMaxPermissibleWeight('');
  };

  const handleCapacityBasisChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setCapacityBasis(e.target.value as 'weight' | 'volume');
    setMaxPermissibleWeight('');
  };

  const getContainerConfig = () => {
    return containerTypes.find((c) => c.type === containerType);
  };

  // Wrapper functions to pass products array to utility functions
  const calculateTotalWeightWrapper = (productId: string, quantity: string, unit: string) => {
    return calculateTotalWeight(productId, quantity, unit, products);
  };

  const calculateQuantityFromWeightWrapper = (productId: string, weightKg: string) => {
    return calculateQuantityFromWeight(productId, weightKg, products);
  };

  const calculateGrossWeightWrapper = (productList: any[]) => {
    return calculateGrossWeight(productList, products);
  };





  // Enhanced calculation functions for packing hierarchy
  const calculatePackingBreakdown = (
    productId: string,
    quantity: number,
    unit: string
  ): PackingCalculation => {
    const product = products.find(
      (p) => p.id.toString() === productId.toString()
    );
    const category = categories.find(
      (c) => c.id.toString() === product?.categoryId?.toString()
    );

    if (
      !category?.packagingHierarchy ||
      category.packagingHierarchy.length === 0
    ) {
      return {
        inputQuantity: quantity,
        inputUnit: unit,
        calculatedBoxes: 0,
        calculatedPallets: 0,
        totalWeight: calculateTotalWeight(productId, quantity.toString(), unit),
        totalCBM: 0,
        containerCapacityUsed: 0,
      };
    }

    const hierarchy = category.packagingHierarchy.sort(
      (a, b) => a.level - b.level
    );
    const baseLevel = hierarchy[0]; // Level 1
    const level2 = hierarchy[1]; // Level 2
    const level3 = hierarchy[2]; // Level 3

    let boxes = 0;
    let pallets = 0;
    const totalWeight = calculateTotalWeight(
      productId,
      quantity.toString(),
      unit
    );

    // Calculate boxes and pallets based on hierarchy
    if (unit === baseLevel?.parentUnit?.name) {
      // e.g., "pcs"
      const pcsPerPack = baseLevel.conversionQuantity;
      const packsPerBox = level2?.conversionQuantity || 1;
      boxes = Math.ceil(quantity / (pcsPerPack * packsPerBox));
    } else if (unit === baseLevel?.childUnit?.name) {
      // e.g., "pack"
      const packsPerBox = level2?.conversionQuantity || 1;
      boxes = Math.ceil(quantity / packsPerBox);
    } else if (unit === level2?.childUnit?.name) {
      // e.g., "box"
      boxes = Math.ceil(quantity);
    } else if (unit === level3?.childUnit?.name) {
      // e.g., "pallet"
      pallets = Math.ceil(quantity);
      boxes = quantity * (level3.conversionQuantity || 1);
    }

    // Calculate pallets from boxes if not already calculated
    if (pallets === 0 && level3) {
      pallets = Math.ceil(boxes / (level3.conversionQuantity || 1));
    }

    return {
      inputQuantity: quantity,
      inputUnit: unit,
      calculatedBoxes: boxes,
      calculatedPallets: pallets,
      totalWeight,
      totalCBM: boxes * 0.1, // Default CBM per box
      containerCapacityUsed: 0,
    };
  };

  const calculateContainerUtilization = (): ContainerUtilization => {
    const totals = getCurrentTotals();
    const containerConfig = getContainerConfig();

    if (!containerConfig || containerConfig.type === 'LCL') {
      return {
        totalWeight: totals.weight,
        totalVolume: totals.volume,
        weightUtilization: 0,
        volumeUtilization: 0,
        recommendedContainers: 1,
        limitingFactor: 'weight',
      };
    }

    const weightUtilization =
      containerConfig.maxWeight > 0
        ? (totals.weight / containerConfig.maxWeight) * 100
        : 0;
    const volumeUtilization =
      containerConfig.cbm > 0 ? (totals.volume / containerConfig.cbm) * 100 : 0;

    const containersNeededByWeight =
      containerConfig.maxWeight > 0
        ? Math.ceil(totals.weight / containerConfig.maxWeight)
        : 1;
    const containersNeededByVolume =
      containerConfig.cbm > 0
        ? Math.ceil(totals.volume / containerConfig.cbm)
        : 1;

    const recommendedContainers = Math.max(
      containersNeededByWeight,
      containersNeededByVolume,
      1
    );
    const limitingFactor =
      containersNeededByWeight > containersNeededByVolume ? 'weight' : 'volume';

    return {
      totalWeight: totals.weight,
      totalVolume: totals.volume,
      weightUtilization,
      volumeUtilization,
      recommendedContainers,
      limitingFactor,
    };
  };

  const calculateQuantityByWeight = (
    productId: string,
    targetWeight: number,
    unit: string = 'pcs'
  ): number => {
    const product = products.find(
      (p) => p.id.toString() === productId.toString()
    );
    if (!product?.packingHierarchy) return 0;

    const hierarchy = product.packingHierarchy;

    switch (unit) {
      case 'pcs':
        return targetWeight / hierarchy.weights.weightPerPiece;
      case 'box':
        return targetWeight / hierarchy.weights.weightPerBox;
      case 'pallet':
        return targetWeight / hierarchy.weights.weightPerPallet;
      case 'sqm':
      case 'm²':
        return targetWeight / hierarchy.weights.weightPerPiece;
      default:
        return targetWeight / hierarchy.weights.weightPerPiece;
    }
  };

  // Update container utilization whenever products or container type changes
  const updateContainerUtilization = () => {
    if (containerType && addedProducts.length > 0) {
      const utilization = calculateContainerUtilization();
      setContainerUtilization(utilization);
      if (utilization.recommendedContainers > 0) {
        setNumberOfContainers(Math.max(utilization.recommendedContainers, 1));
      }
    } else {
      // Ensure numberOfContainers is never 0
      setNumberOfContainers(Math.max(numberOfContainers, 1));
    }
  };

  // Effect to update container utilization when products or container type changes
  useEffect(() => {
    updateContainerUtilization();
  }, [addedProducts, containerType, capacityBasis]);

  const getContainerLimits = () => {
    const config = getContainerConfig();
    if (!config) return { weight: 0, volume: 0 };

    const weightLimit =
      capacityBasis === 'weight' && maxPermissibleWeight
        ? parseFloat(maxPermissibleWeight)
        : config.maxWeight;
    const volumeLimit = config.cbm;

    return { weight: weightLimit, volume: volumeLimit };
  };

  const getCurrentTotals = () => {
    const totalWeight = addedProducts.reduce((sum, p) => {
      if (p.totalWeight && p.totalWeight > 0) {
        return sum + p.totalWeight;
      }
      // Use the improved calculateTotalWeight function with products array
      return (
        sum + calculateTotalWeight(p.productId, p.quantity.toString(), p.unit, products)
      );
    }, 0);

    // CBM calculation commented out as requested
    /*
    const totalVolume = addedProducts.reduce((sum, p) => {
      const product = products.find((pr) => pr.id === p.productId);
      if (product?.packingHierarchy) {
        const breakdown = calculatePackingBreakdown(
          p.productId,
          p.quantity,
          p.unit
        );
        return sum + (breakdown?.totalCBM || 0);
      }
      if (product?.packingConfig) {
        // Calculate boxes based on unit
        let boxes = 0;
        if (p.unit === 'box') {
          boxes = p.quantity;
        } else {
          boxes = p.quantity / product.packingConfig.unitsPerBox;
        }
        return sum + boxes * product.packingConfig.cbmPerBox;
      }
      // Fallback: assume 0.01 CBM per unit if no config available
      return sum + p.quantity * 0.01;
    }, 0);
    */

    return { weight: totalWeight, volume: 0 }; // Volume set to 0
  };

  const calculateRequiredContainers = () => {
    // Container calculation simplified - always return 1
    return 1;

    /* Original container calculation commented out
    if (!containerType || containerType === 'LCL') return 1;

    const limits = getContainerLimits();
    const totals = getCurrentTotals();

    let containersNeeded = 1;

    if (capacityBasis === 'weight' && limits.weight > 0) {
      containersNeeded = Math.ceil(totals.weight / limits.weight);
    } else if (capacityBasis === 'volume' && limits.volume > 0) {
      containersNeeded = Math.ceil(totals.volume / limits.volume);
    }

    return Math.max(1, containersNeeded);
    */
  };

  const validateContainerCapacity = (newProduct?: ProductData) => {
    if (!containerType) return { valid: true, message: '', containers: 1 };

    const limits = getContainerLimits();
    const current = getCurrentTotals();

    let totalWeight = current.weight;
    let totalVolume = current.volume;

    if (newProduct) {
      totalWeight += newProduct.totalWeight || 0;
      const product = products.find(
        (p) => p.id.toString() === newProduct.productId.toString()
      );
      if (product?.packingConfig) {
        const boxes = newProduct.quantity / product.packingConfig.unitsPerBox;
        totalVolume += boxes * product.packingConfig.cbmPerBox;
      }
    }

    let containersNeeded = 1;
    let message = '';

    if (capacityBasis === 'weight' && limits.weight > 0) {
      containersNeeded = Math.ceil(totalWeight / limits.weight);
      if (containersNeeded > 1) {
        message = `${containersNeeded} containers needed (${totalWeight.toFixed(
          0
        )} KG total)`;
      }
    }

    if (capacityBasis === 'volume' && limits.volume > 0) {
      containersNeeded = Math.ceil(totalVolume / limits.volume);
      if (containersNeeded > 1) {
        message = `${containersNeeded} containers needed (${totalVolume.toFixed(
          2
        )} CBM total)`;
      }
    }

    return {
      valid: true,
      message,
      containers: Math.max(1, containersNeeded),
    };
  };

  // --- Product logic ---
  const addProductToTable = () => {
    try {
      const currentProduct = productsAdded[0];
      
      if (
        !currentProduct ||
        !currentProduct.productId ||
        !currentProduct.rate ||
        !currentProduct.unit
      ) {
        toast.error('Please fill all required fields: Category, Product, Unit, Quantity, and Rate');
        return;
      }

      if (!currentProduct.quantity || currentProduct.quantity === '') {
        currentProduct.quantity = '1';
      }

      const product = products.find(
        (p) => p.id.toString() === currentProduct.productId.toString()
      );

      const quantity = parseFloat(currentProduct.quantity);
      const rate = parseFloat(currentProduct.rate);

      let totalWeight = 0;
      try {
        totalWeight = calculateTotalWeight(
          currentProduct.productId,
          currentProduct.quantity,
          currentProduct.unit,
          products
        );
      } catch (error) {
        totalWeight = quantity * 1;
      }

      const productName = product?.name || product?.productName || `Product ${currentProduct.productId}`;
      
      const productData: ProductData = {
        productId: currentProduct.productId,
        name: productName,
        productName: productName,
        hsCode: product?.hsCode || 'N/A',
        description: product?.description || 'No description available',
        quantity: quantity,
        rate: rate,
        unit: currentProduct.unit,
        total: quantity * rate,
        totalWeight: totalWeight,
        categoryId: currentProduct.categoryId || selectedCategory,
        subcategoryId: currentProduct.subcategoryId || selectedSubcategory,
        packagingCalculation: currentProduct.packagingCalculation,
      };

      if (editingProductIndex !== null) {
        const updated = [...addedProducts];
        updated[editingProductIndex] = productData;
        setAddedProducts(updated);
        setEditingProductIndex(null);
        toast.success('Product updated successfully!');
      } else {
        setAddedProducts(prev => [...prev, productData]);
        toast.success('Product added successfully!');
      }

      setProductsAdded([{
        productId: '',
        quantity: '',
        rate: '',
        unit: '',
        categoryId: '',
        subcategoryId: '',
        quantityByWeight: '',
      }]);
      setSelectedCategory('');
      setSelectedSubcategory('');
      setQuantityByWeight('');
      
    } catch (error) {
      toast.error('Failed to add product. Please try again.');
    }
  };

  const editProduct = (index: number) => {
    const product = addedProducts[index];
    const productInfo = products.find(
      (p) => p.id.toString() === product.productId.toString()
    );

    // Calculate quantityByWeight from the product's weight
    const weight = product.totalWeight || 0;
    const quantityByWeightValue = weight > 0 ? weight.toString() : '';

    const categoryId = product.categoryId || productInfo?.categoryId || '';
    const subcategoryId =
      product.subcategoryId || productInfo?.subcategoryId || '';

    // Set editing index first
    setEditingProductIndex(index);

    // Set the selected category and subcategory to trigger unit dropdown update
    setSelectedCategory(categoryId);
    setSelectedSubcategory(subcategoryId);



    // Clear unit first to force dropdown refresh
    setProductsAdded([
      {
        productId: product.productId,
        quantity: product.quantity.toString(),
        rate: product.rate.toString(),
        unit: '', // Clear unit first
        categoryId: categoryId,
        subcategoryId: subcategoryId,
        quantityByWeight: quantityByWeightValue,
      },
    ]);

    // Then set the unit after a brief delay to ensure dropdown is refreshed
    setTimeout(() => {
      setProductsAdded([
        {
          productId: product.productId,
          quantity: product.quantity.toString(),
          rate: product.rate.toString(),
          unit: product.unit,
          categoryId: categoryId,
          subcategoryId: subcategoryId,
          quantityByWeight: quantityByWeightValue,
        },
      ]);
    }, 10);
  };

  const deleteProduct = (index: number) => {
    setAddedProducts((prev) => prev.filter((_, i) => i !== index));
  };

  const removeProduct = (idx: number) =>
    setProductsAdded((prev) => prev.filter((_, i) => i !== idx));

  const updateProduct = useCallback(
    (idx: number, field: keyof ProductAdded, value: string) => {
      setProductsAdded((prev) => {
        if (prev[idx] && prev[idx][field] === value) {
          return prev; // No change, return same reference
        }
        const newProducts = [...prev];
        newProducts[idx] = { ...newProducts[idx], [field]: value };
        return newProducts;
      });

      // If unit is being updated and we have added products, sync the unit
      if (field === 'unit' && addedProducts.length > 0) {
        const currentProduct = productsAdded[idx];
        if (currentProduct?.productId) {
          // Find the corresponding product in addedProducts and update its unit
          setAddedProducts((prev) =>
            prev.map((product) => {
              if (product.productId === currentProduct.productId) {
                console.log(
                  `Syncing unit change: ${product.unit} -> ${value} for product ${product.productId}`
                );
                return { ...product, unit: value };
              }
              return product;
            })
          );
        }
      }
    },
    [addedProducts, productsAdded]
  );

  // --- Max shipment weight logic ---
  const handleMaxShipmentWeightChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => setMaxShipmentWeight(e.target.value);

  // --- Review logic ---
  const gatherFormData = (): PIData => {
    const selectedCompany = company;

    // Log the products data to debug unit issues
    console.log(
      'Gathering form data - addedProducts with units:',
      addedProducts.map((p) => ({
        productId: p.productId,
        name: p.name,
        unit: p.unit,
        quantity: p.quantity,
        rate: p.rate,
      }))
    );

    return {
      company: selectedCompany,
      paymentTerm,
      deliveryTerm,
      productsData: addedProducts,
      charges,
      containerType,
      capacityBasis,
      numberOfContainers,
      maxWeight: maxPermissibleWeight
        ? parseFloat(maxPermissibleWeight)
        : undefined,
    };
  };

  const handleReview = (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent the default form validation if we already have products added
    if (addedProducts.length > 0) {
      // Only check company, payment and delivery terms
      if (!companyId || !paymentTerm || !deliveryTerm) {
        toast.error('Please select company, payment term, and delivery term.');
        return;
      }

      // Skip other validations since we already have products
      const data = gatherFormData();
      setReviewData(data);
      setReviewOpen(true);
      return;
    }

    // If no products added yet, do the normal validation
    if (!companyId || !paymentTerm || !deliveryTerm) {
      toast.error('Please fill all required fields.');
      return;
    }
    if (addedProducts.length === 0) {
      toast.error('Please add at least one product.');
      return;
    }

    const data = gatherFormData();
    setReviewData(data);
    setReviewOpen(true);
  };

  // Check if form is complete
  const isFormComplete = () => {
    return (
      companyId &&
      company?.contactPerson &&
      company?.email &&
      company?.phone &&
      paymentTerm &&
      deliveryTerm &&
      addedProducts.length > 0
    );
  };

  const handleSaveDraft = async () => {
    setSubmitting(true);
    try {
      const formData = gatherFormData();

      // Prepare data for API with draft status
      const apiData = {
        partyId: companyId ? parseInt(companyId) : null,
        partyName: company?.name || '',
        contactPerson: company?.contactPerson || '',
        address: company?.address || '',
        country: company?.country || '',
        email: company?.email || '',
        phone: company?.phone || '',
        paymentTerm: paymentTerm || '',
        deliveryTerm: deliveryTerm || '',
        containerType: containerType || '',
        capacityBasis,
        numberOfContainers: Math.max(numberOfContainers, 1),
        maxPermissibleWeight: maxPermissibleWeight
          ? parseFloat(maxPermissibleWeight)
          : undefined,
        maxShipmentWeight: maxShipmentWeight
          ? parseFloat(maxShipmentWeight)
          : undefined,
        currency,
        charges: formData.charges,
        preCarriageBy,
        placeOfReceipt,
        countryOfOrigin,
        countryOfDestination,
        portOfLoading,
        portOfDischarge,
        finalDestination,
        totalGrossWeight: calculateGrossWeightWrapper(formData.productsData),
        status: 'draft',
        products: formData.productsData.map((product) => ({
          productId: product.productId ? parseInt(product.productId) : null,
          productName: product.productName || product.name,
          hsCode: product.hsCode,
          productDescription: product.description,
          categoryId: product.categoryId ? parseInt(product.categoryId) : null,
          subcategoryId: product.subcategoryId
            ? parseInt(product.subcategoryId)
            : null,
          quantity: product.quantity,
          unit: product.unit || 'pcs',
          rate: product.rate,
          total: product.total,
          totalWeight: product.totalWeight,
          packagingCalculation: product.packagingCalculation,
        })),
      };

      if (isEditMode) {
        // Update existing PI as draft
        const result = await dispatch(
          updatePiInvoice({ id: parseInt(id!), piData: apiData })
        ).unwrap();
        toast.success(result.message);
        navigate('/proforma-invoices');
      } else {
        // Create new PI as draft
        const result = await dispatch(createPiInvoice(apiData)).unwrap();
        toast.success(result.message);
        navigate('/proforma-invoices');
      }
    } catch (err: any) {
      console.error('Error saving draft:', err);
      toast.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      const formData = gatherFormData();

      // Prepare data for API
      const apiData = {
        partyId: parseInt(companyId),
        partyName: company?.name || '',
        contactPerson: company?.contactPerson || '',
        address: company?.address || '',
        country: company?.country || '',
        email: company?.email || '',
        phone: company?.phone || '',
        paymentTerm,
        deliveryTerm,
        containerType,
        capacityBasis,
        numberOfContainers: Math.max(numberOfContainers, 1),
        maxPermissibleWeight: maxPermissibleWeight
          ? parseFloat(maxPermissibleWeight)
          : undefined,
        maxShipmentWeight: maxShipmentWeight
          ? parseFloat(maxShipmentWeight)
          : undefined,
        currency,
        charges: formData.charges,
        preCarriageBy,
        placeOfReceipt,
        countryOfOrigin,
        countryOfDestination,
        portOfLoading,
        portOfDischarge,
        finalDestination,
        totalGrossWeight: calculateGrossWeightWrapper(formData.productsData),
        status:
          isEditMode && originalPiStatus === 'confirmed'
            ? 'confirmed'
            : isFormComplete()
              ? 'pending'
              : 'draft',
        products: formData.productsData.map((product) => ({
          productId: parseInt(product.productId),
          productName: product.productName || product.name,
          hsCode: product.hsCode,
          productDescription: product.description,
          categoryId: product.categoryId ? parseInt(product.categoryId) : null,
          subcategoryId: product.subcategoryId
            ? parseInt(product.subcategoryId)
            : null,
          quantity: product.quantity,
          unit: product.unit || 'pcs',
          rate: product.rate,
          total: product.total,
          totalWeight: product.totalWeight,
          packagingCalculation: product.packagingCalculation,
        })),
      };

      if (isEditMode) {
        // Update existing PI
        const result = await dispatch(
          updatePiInvoice({ id: parseInt(id!), piData: apiData })
        ).unwrap();
        toast.success(result.message);
      } else {
        // Create new PI
        const result = await dispatch(createPiInvoice(apiData)).unwrap();
        toast.success(result.message);
      }

      setTimeout(() => navigate('/proforma-invoices'), 1500);
    } catch (err: any) {
      console.error('Error saving PI:', err);
      toast.error(err);
    } finally {
      setSubmitting(false);
      setReviewOpen(false);
    }
  };

  // --- Charges fields rendering ---
  const renderChargesFields = () => {
    if (!deliveryTerm || !chargesTemplates[deliveryTerm]) return null;
    return chargesTemplates[deliveryTerm].map((charge) => {
      if (charge.type === 'checkbox') {
        return (
          <label
            key={charge.key}
            className="inline-flex items-center space-x-2 text-gray-700 dark:text-gray-300 font-medium"
          >
            <input
              type="checkbox"
              checked={!!charges[charge.key]}
              onChange={(e) => handleChargeChange(charge.key, e.target.checked)}
              className="rounded border-gray-300 text-brand-500 shadow-sm focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800"
            />
            <span>{charge.label}</span>
          </label>
        );
      } else if (charge.type === 'number') {
        return (
          <div key={charge.key} className="flex flex-col">
            <Label className="text-gray-700 dark:text-gray-300">
              {charge.label}
            </Label>
            <Input
              type="number"
              min={charge.min}
              max={charge.max}
              step={charge.step}
              value={charges[charge.key] || ''}
              onChange={(e) => handleChargeChange(charge.key, e.target.value)}
              placeholder={charge.placeholder}
            />
          </div>
        );
      } else if (charge.type === 'dynamicList') {
        return (
          <OtherChargesList
            key={charge.key}
            value={otherCharges}
            onChange={handleOtherChargesChange}
          />
        );
      }
      return null;
    });
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
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        <strong>Error:</strong> {error}
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
                  onClick={() => navigate('/proforma-invoices')}
                  className="p-3 rounded-lg bg-slate-700 text-white hover:bg-slate-800 transition-all duration-300 hover:shadow-lg"
                >
                  <FontAwesomeIcon icon={faChevronLeft} className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 mb-1">
                    {isEditMode
                      ? 'Edit Proforma Invoice'
                      : 'Add New Proforma Invoice'}
                  </h1>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Step Progress Indicator */}
        <div className="mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <div className="flex items-center justify-between overflow-x-auto pb-4">
              {[1, 2, 3, 4, 5].map((step) => (
                <div key={step} className="flex items-center flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(step)}
                    className={`w-12 h-12 rounded-lg flex items-center justify-center text-sm font-bold ${
                      step === currentStep
                        ? 'bg-slate-700 text-white'
                        : step < currentStep || completedSteps.has(step)
                          ? 'bg-green-500 text-white'
                          : 'bg-white text-gray-600 border-2 border-gray-300'
                    }`}
                  >
                    {step < currentStep || completedSteps.has(step)
                      ? '✓'
                      : step}
                  </button>
                  {step < 5 && (
                    <div className="mx-4">
                      <div
                        className={`w-20 h-2 rounded-full ${
                          step < currentStep || completedSteps.has(step)
                            ? 'bg-green-500'
                            : 'bg-gray-200 border border-gray-300'
                        }`}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-6 text-sm font-medium overflow-x-auto">
              <span
                className={
                  currentStep === 1
                    ? 'text-slate-700 font-bold flex-shrink-0'
                    : 'text-gray-500 flex-shrink-0'
                }
              >
                Company
              </span>
              <span
                className={
                  currentStep === 2
                    ? 'text-slate-700 font-bold flex-shrink-0'
                    : 'text-gray-500 flex-shrink-0'
                }
              >
                Container
              </span>
              <span
                className={
                  currentStep === 3
                    ? 'text-slate-700 font-bold flex-shrink-0'
                    : 'text-gray-500 flex-shrink-0'
                }
              >
                Terms
              </span>
              <span
                className={
                  currentStep === 4
                    ? 'text-slate-700 font-bold flex-shrink-0'
                    : 'text-gray-500 flex-shrink-0'
                }
              >
                Products
              </span>
              <span
                className={
                  currentStep === 5
                    ? 'text-slate-700 font-bold flex-shrink-0'
                    : 'text-gray-500 flex-shrink-0'
                }
              >
                Review
              </span>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 border-b border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900">
              {isEditMode ? 'Edit' : 'Create'} Proforma Invoice
            </h3>
          </div>

          <div className="p-6">
            <Form onSubmit={handleReview} className="space-y-6 sm:space-y-10">
              {currentStep === 1 && (
                <div className="step-content">
                  <div className="mb-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 rounded-lg bg-slate-700">
                        <FontAwesomeIcon
                          icon={faPlus}
                          className="w-5 h-5 text-white"
                        />
                      </div>
                      <h4 className="text-xl font-semibold text-gray-900">
                        Step 1: Company Selection
                      </h4>
                    </div>
                    <div className="h-1 bg-slate-700 rounded w-20"></div>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <Label htmlFor="company">Select Company</Label>
                      <select
                        id="company"
                        value={companyId}
                        onChange={handleCompanyChange}
                        required
                        className={`block w-full rounded-lg border shadow-sm py-3 px-4 text-base bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 disabled:bg-gray-100 dark:disabled:bg-gray-800 ${
                          validationErrors.companyId
                            ? 'border-red-500 dark:border-red-500'
                            : 'border-gray-300 dark:border-gray-700'
                        }`}
                      >
                        <option value="" disabled>
                          Choose Company
                        </option>
                        {(Array.isArray(companies) ? companies : [])
                          .filter((comp) => comp.role === 'Customer')
                          .map((comp) => (
                            <option key={comp.id} value={comp.id}>
                              {comp.companyName}
                            </option>
                          ))}
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="contactPerson">Contact Person *</Label>
                      <Input
                        type="text"
                        id="contactPerson"
                        value={company?.contactPerson || ''}
                        onChange={(e) =>
                          handleCompanyDetailChange(
                            'contactPerson',
                            e.target.value
                          )
                        }
                        placeholder="Enter contact person name"
                        style={
                          validationErrors.contactPerson
                            ? { borderColor: '#ef4444', borderWidth: '2px' }
                            : {}
                        }
                      />
                      {validationErrors.contactPerson && (
                        <p className="text-red-500 text-sm mt-1">
                          Contact person is required
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="mt-6 sm:mt-8 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        type="email"
                        id="email"
                        value={company?.email || ''}
                        onChange={(e) =>
                          handleCompanyDetailChange('email', e.target.value)
                        }
                        placeholder="Enter email address"
                        style={
                          validationErrors.email
                            ? { borderColor: '#ef4444', borderWidth: '2px' }
                            : {}
                        }
                      />
                      {validationErrors.email && (
                        <p className="text-red-500 text-sm mt-1">
                          Email is required
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone *</Label>
                      <Input
                        type="tel"
                        id="phone"
                        value={company?.phone || ''}
                        onChange={(e) =>
                          handleCompanyDetailChange('phone', e.target.value)
                        }
                        placeholder="Enter phone number"
                        style={
                          validationErrors.phone
                            ? { borderColor: '#ef4444', borderWidth: '2px' }
                            : {}
                        }
                      />
                      {validationErrors.phone && (
                        <p className="text-red-500 text-sm mt-1">
                          Phone is required
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="country">Country *</Label>
                      <Input
                        type="text"
                        id="country"
                        value={company?.country || ''}
                        onChange={(e) =>
                          handleCompanyDetailChange('country', e.target.value)
                        }
                        placeholder="Enter country"
                        style={
                          validationErrors.country
                            ? { borderColor: '#ef4444', borderWidth: '2px' }
                            : {}
                        }
                      />
                      {validationErrors.country && (
                        <p className="text-red-500 text-sm mt-1">
                          Country is required
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="address">Company Address *</Label>
                      <TextArea
                        id="address"
                        value={company?.address || ''}
                        onChange={(e) =>
                          handleCompanyDetailChange('address', e.target.value)
                        }
                        rows={2}
                        placeholder="Enter company address"
                        style={
                          validationErrors.address
                            ? { borderColor: '#ef4444', borderWidth: '2px' }
                            : {}
                        }
                      />
                      {validationErrors.address && (
                        <p className="text-red-500 text-sm mt-1">
                          Address is required
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="step-content">
                  <div className="mb-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 rounded-xl bg-slate-700 shadow-md">
                        <FontAwesomeIcon
                          icon={faPlus}
                          className="w-5 h-5 text-white"
                        />
                      </div>
                      <h4 className="text-xl font-semibold text-slate-800">
                        Step 2: Container Management
                      </h4>
                    </div>
                    <div className="h-1 bg-slate-700 rounded-full w-20"></div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
                    <div>
                      <Label htmlFor="numberOfContainers">
                        Number of Containers
                      </Label>
                      <Input
                        type="number"
                        id="numberOfContainers"
                        value={numberOfContainers}
                        onChange={(e) =>
                          setNumberOfContainers(parseInt(e.target.value) || 1)
                        }
                        placeholder="Enter number of containers"
                        min={1}
                        className={`text-center font-semibold ${
                          validationErrors.numberOfContainers
                            ? 'border-red-500 dark:border-red-500'
                            : ''
                        }`}
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        Auto-calculated based on weight/volume
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="containerType">Container Type *</Label>
                      <select
                        id="containerType"
                        value={containerType}
                        onChange={handleContainerTypeChange}
                        className="block w-full rounded-lg border border-gray-300 dark:border-gray-700 shadow-sm py-3 px-4 text-base bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                        style={
                          validationErrors.containerType
                            ? { borderColor: '#ef4444', borderWidth: '2px' }
                            : {}
                        }
                      >
                        <option value="">Select Container Type</option>
                        {containerTypes.map((config) => (
                          <option key={config.type} value={config.type}>
                            {config.type} (CBM: {config.cbm})
                          </option>
                        ))}
                      </select>
                      {validationErrors.containerType && (
                        <p className="text-red-500 text-sm mt-1">
                          Container type is required
                        </p>
                      )}
                    </div>
                    {containerType && (
                      <div className="text-sm text-gray-600 dark:text-gray-400 p-3 bg-gray-50 dark:bg-gray-800 rounded">
                        <strong>Max Permissible Capacity:</strong>
                        <br />
                        <span className="text-blue-600 dark:text-blue-400 font-semibold">
                          CBM: {getContainerConfig()?.cbm}
                        </span>
                        <br />
                        <span className="text-green-600 dark:text-green-400 font-semibold">
                          Weight: {getContainerConfig()?.maxWeight} KG
                        </span>
                      </div>
                    )}
                  </div>

                  {containerType && (
                    <div className="mb-6">
                      <Label>Capacity Basis</Label>
                      <div className="flex gap-6 mt-2">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            value="weight"
                            checked={capacityBasis === 'weight'}
                            onChange={handleCapacityBasisChange}
                            className="mr-2"
                          />
                          Capacity by Weight (KG)
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            value="volume"
                            checked={capacityBasis === 'volume'}
                            onChange={handleCapacityBasisChange}
                            className="mr-2"
                          />
                          Capacity by Volume (CBM)
                        </label>
                      </div>
                    </div>
                  )}

                  {containerType && capacityBasis === 'weight' && (
                    <div className="mb-6 max-w-xs">
                      <Label htmlFor="maxPermissibleWeight">
                        Max Permissible Allowed Weight (KG)
                      </Label>
                      <Input
                        type="number"
                        id="maxPermissibleWeight"
                        value={maxPermissibleWeight}
                        onChange={(e) =>
                          setMaxPermissibleWeight(e.target.value)
                        }
                        placeholder="Enter max weight"
                        min={0}
                        step="any"
                      />
                    </div>
                  )}

                  {/* Container Utilization Display */}
                  {containerType &&
                    containerUtilization &&
                    addedProducts.length > 0 &&
                    (containerUtilization.totalWeight > 0 ||
                      containerUtilization.totalVolume > 0) && (
                      <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100">
                            Container Summary ({containerType})
                          </h4>
                        </div>

                        <div className="grid grid-cols-3 gap-3 text-sm">
                          <div className="text-center">
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              Weight
                            </div>
                            <div className="font-bold text-gray-900 dark:text-gray-100">
                              {containerUtilization.totalWeight.toFixed(0)} KG
                            </div>
                          </div>

                          <div className="text-center">
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              Volume
                            </div>
                            <div className="font-bold text-gray-900 dark:text-gray-100">
                              {containerUtilization.totalVolume.toFixed(1)} CBM
                            </div>
                          </div>

                          <div className="text-center">
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              Containers
                            </div>
                            <div className="font-bold text-slate-700 dark:text-slate-400">
                              {containerUtilization.recommendedContainers}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                  {/* Shipping Details Section */}
                  <div className="mt-8">
                    <h5 className="text-lg font-semibold text-black dark:text-white mb-4 border-b pb-2">
                      Shipping Details
                    </h5>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <Label htmlFor="preCarriageBy">Pre Carriage By</Label>
                        <select
                          id="preCarriageBy"
                          value={preCarriageBy}
                          onChange={(e) => setPreCarriageBy(e.target.value)}
                          className="block w-full rounded-lg border border-gray-300 dark:border-gray-700 shadow-sm py-3 px-4 text-base bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                        >
                          <option value="">Select Mode</option>
                          <option value="By Road">By Road</option>
                          <option value="By Rail">By Rail</option>
                          <option value="By Air">By Air</option>
                          <option value="By Sea">By Sea</option>
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="placeOfReceipt">Place of Receipt</Label>
                        <Input
                          type="text"
                          id="placeOfReceipt"
                          value={placeOfReceipt}
                          onChange={(e) => setPlaceOfReceipt(e.target.value)}
                          placeholder="Enter place of receipt"
                        />
                      </div>
                      <div>
                        <Label htmlFor="countryOfOrigin">
                          Country of Origin
                        </Label>
                        <Input
                          type="text"
                          id="countryOfOrigin"
                          value={countryOfOrigin}
                          onChange={(e) => setCountryOfOrigin(e.target.value)}
                          placeholder="Enter country of origin"
                        />
                      </div>
                      <div>
                        <Label htmlFor="countryOfDestination">
                          Country of Destination
                        </Label>
                        <Input
                          type="text"
                          id="countryOfDestination"
                          value={countryOfDestination}
                          onChange={(e) =>
                            setCountryOfDestination(e.target.value)
                          }
                          placeholder="Enter destination country"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <Label htmlFor="portOfLoading">Port of Loading</Label>
                        <Input
                          type="text"
                          id="portOfLoading"
                          value={portOfLoading}
                          onChange={(e) => setPortOfLoading(e.target.value)}
                          placeholder="Enter port of loading"
                        />
                      </div>
                      <div>
                        <Label htmlFor="portOfDischarge">
                          Port of Discharge
                        </Label>
                        <Input
                          type="text"
                          id="portOfDischarge"
                          value={portOfDischarge}
                          onChange={(e) => setPortOfDischarge(e.target.value)}
                          placeholder="Enter port of discharge"
                        />
                      </div>
                      <div>
                        <Label htmlFor="finalDestination">
                          Final Destination
                        </Label>
                        <Input
                          type="text"
                          id="finalDestination"
                          value={finalDestination}
                          onChange={(e) => setFinalDestination(e.target.value)}
                          placeholder="Enter final destination"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="step-content">
                  <div className="mb-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 rounded-xl bg-slate-700 shadow-md">
                        <FontAwesomeIcon
                          icon={faPlus}
                          className="w-5 h-5 text-white"
                        />
                      </div>
                      <h4 className="text-xl font-semibold text-slate-800">
                        Step 3: Terms Configuration
                      </h4>
                    </div>
                    <div className="h-1 bg-slate-700 rounded-full w-20"></div>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <Label htmlFor="paymentTerm">Select Payment Term *</Label>
                      <select
                        id="paymentTerm"
                        value={paymentTerm}
                        onChange={handlePaymentTermChange}
                        required
                        className="block w-full rounded-lg border border-gray-300 dark:border-gray-700 shadow-sm py-3 px-4 text-base bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                        style={
                          validationErrors.paymentTerm
                            ? { borderColor: '#ef4444', borderWidth: '2px' }
                            : {}
                        }
                      >
                        <option value="" disabled>
                          Choose Payment Term
                        </option>
                        <option value="advance">Advance</option>
                        <option value="lc">LC</option>
                      </select>
                      {validationErrors.paymentTerm && (
                        <p className="text-red-500 text-sm mt-1">
                          Payment term is required
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="deliveryTerm">
                        Select Delivery Term *
                      </Label>
                      <select
                        id="deliveryTerm"
                        value={deliveryTerm}
                        onChange={handleDeliveryTermChange}
                        required
                        className="block w-full rounded-lg border border-gray-300 dark:border-gray-700 shadow-sm py-3 px-4 text-base bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                        style={
                          validationErrors.deliveryTerm
                            ? { borderColor: '#ef4444', borderWidth: '2px' }
                            : {}
                        }
                      >
                        <option value="" disabled>
                          Choose Delivery Term
                        </option>
                        <option value="fob">FOB</option>
                        <option value="cif">CIF</option>
                        <option value="ddp">DDP</option>
                      </select>
                      {validationErrors.deliveryTerm && (
                        <p className="text-red-500 text-sm mt-1">
                          Delivery term is required
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="mt-8 space-y-6">{renderChargesFields()}</div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="step-content">
                  <div className="mb-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 rounded-xl bg-slate-700 shadow-md">
                        <FontAwesomeIcon
                          icon={faPlus}
                          className="w-5 h-5 text-white"
                        />
                      </div>
                      <h4 className="text-xl font-semibold text-slate-800">
                        Step 4: Add Products
                      </h4>
                    </div>
                    <div className="h-1 bg-slate-700 rounded-full w-20"></div>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
                    <div>
                      <Label htmlFor="maxShipmentWeight">
                        Max Shipment Weight (kg) *
                      </Label>
                      <Input
                        type="number"
                        id="maxShipmentWeight"
                        min={0}
                        step="any"
                        value={maxShipmentWeight}
                        onChange={handleMaxShipmentWeightChange}
                        placeholder="e.g. 19000"
                        required
                        style={
                          validationErrors.maxShipmentWeight
                            ? { borderColor: '#ef4444', borderWidth: '2px' }
                            : {}
                        }
                      />
                      {validationErrors.maxShipmentWeight && (
                        <p className="text-red-500 text-sm mt-1">
                          Max shipment weight is required
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="currency">Currency</Label>
                      <select
                        id="currency"
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className="block w-full rounded-lg border border-gray-300 dark:border-gray-700 shadow-sm py-3 px-4 text-base bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                      >
                        {currencies.map((curr) => (
                          <option key={curr.code} value={curr.code}>
                            {curr.code} ({curr.symbol}) - {curr.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="space-y-6">
                    {productsAdded.map((p, idx) => (
                      <ProductRow
                        key={`product-row-${idx}`}
                        idx={idx}
                        data={p}
                        onChange={updateProduct}
                        onRemove={removeProduct}
                        categories={categories}
                        products={products}
                        selectedCategory={selectedCategory}
                        selectedSubcategory={selectedSubcategory}
                        setSelectedCategory={setSelectedCategory}
                        setSelectedSubcategory={setSelectedSubcategory}
                        calculateTotalWeight={calculateTotalWeightWrapper}
                        calculateQuantityFromWeight={calculateQuantityFromWeightWrapper}
                      />
                    ))}
                  </div>
                  <div className="flex gap-4 mt-6">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        addProductToTable();
                      }}
                      className="inline-flex items-center px-5 py-2 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      <FontAwesomeIcon icon={faPlus} className="mr-2" />
                      {editingProductIndex !== null
                        ? 'Update Product'
                        : 'Add Product'}
                    </button>

                    {editingProductIndex !== null && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingProductIndex(null);
                          setProductsAdded([
                            {
                              productId: '',
                              quantity: '',
                              rate: '',
                              unit: '',
                              categoryId: '',
                              subcategoryId: '',
                              quantityByWeight: '',
                            },
                          ]);
                          setSelectedCategory('');
                          setSelectedSubcategory('');
                        }}
                        className="inline-flex items-center px-5 py-3 border border-gray-300 text-base font-medium rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                      >
                        <FontAwesomeIcon icon={faTimes} className="mr-2" />{' '}
                        Cancel Edit
                      </button>
                    )}
                  </div>

                  {/* Products validation error */}
                  {validationErrors.products && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-700 text-sm font-medium">
                        Please add at least one product to continue.
                      </p>
                    </div>
                  )}

                  {/* Added Products Table */}
                  <ProductTable
                    addedProducts={addedProducts}
                    categories={categories}
                    products={products}
                    currency={currency}
                    editingProductIndex={editingProductIndex}
                    onEditProduct={editProduct}
                    onDeleteProduct={deleteProduct}
                    formatCurrency={formatCurrency}
                    calculateTotalWeight={calculateTotalWeightWrapper}
                    calculateGrossWeight={calculateGrossWeightWrapper}
                    getCurrentTotals={getCurrentTotals}
                  />

                  {/* PI Preview Popup */}
                  {showPIPreview && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                          <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                              Proforma Invoice Preview
                            </h2>
                            <button
                              onClick={() => setShowPIPreview(false)}
                              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                              <FontAwesomeIcon icon={faTimes} size="lg" />
                            </button>
                          </div>

                          {/* Products Table */}
                          <div className="mb-6">
                            <h3 className="font-semibold mb-4">
                              Product Details
                            </h3>
                            <div className="overflow-x-auto">
                              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-800">
                                  <tr>
                                    <th className="px-3 py-2 text-left text-sm font-semibold">
                                      Category
                                    </th>
                                    <th className="px-3 py-2 text-left text-sm font-semibold">
                                      Product
                                    </th>
                                    <th className="px-3 py-2 text-right text-sm font-semibold">
                                      Quantity
                                    </th>
                                    <th className="px-3 py-2 text-left text-sm font-semibold">
                                      Unit
                                    </th>
                                    <th className="px-3 py-2 text-right text-sm font-semibold">
                                      Weight (KG)
                                    </th>
                                    <th className="px-3 py-2 text-right text-sm font-semibold">
                                      Rate
                                    </th>
                                    <th className="px-3 py-2 text-right text-sm font-semibold">
                                      Amount
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                  {addedProducts.map((product, index) => {
                                    const category = categories.find(
                                      (c) => c.id === product.categoryId
                                    );
                                    return (
                                      <tr key={index}>
                                        <td className="px-3 py-2 text-sm">
                                          {category?.name || 'N/A'}
                                        </td>
                                        <td className="px-3 py-2 text-sm">
                                          {product.name}
                                        </td>
                                        <td className="px-3 py-2 text-sm text-right">
                                          {product.quantity}
                                        </td>
                                        <td className="px-3 py-2 text-sm">
                                          {product.unit}
                                        </td>
                                        <td className="px-3 py-2 text-sm text-right">
                                          {product.totalWeight?.toFixed(2) ||
                                            '0.00'}
                                        </td>
                                        <td className="px-3 py-2 text-sm text-right">
                                          {formatCurrency(
                                            product.rate,
                                            currency,
                                            2,
                                            4
                                          )}
                                        </td>
                                        <td className="px-3 py-2 text-sm text-right font-semibold">
                                          {formatCurrency(
                                            product.total,
                                            currency
                                          )}
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                                <tfoot className="bg-gray-50 dark:bg-gray-800">
                                  <tr>
                                    <td
                                      colSpan={4}
                                      className="px-3 py-2 text-right font-semibold"
                                    >
                                      Totals:
                                    </td>
                                    <td className="px-3 py-2 text-right font-semibold">
                                      {addedProducts
                                        .reduce(
                                          (sum, p) =>
                                            sum + (p.totalWeight || 0),
                                          0
                                        )
                                        .toFixed(2)}{' '}
                                      KG
                                    </td>
                                    <td className="px-3 py-2"></td>
                                    <td className="px-3 py-2 text-right font-semibold text-lg">
                                      {formatCurrency(
                                        addedProducts.reduce(
                                          (sum, p) => sum + p.total,
                                          0
                                        ),
                                        currency
                                      )}
                                    </td>
                                  </tr>
                                </tfoot>
                              </table>
                            </div>
                          </div>

                          <div className="flex justify-end gap-4">
                            <button
                              onClick={() => setShowPIPreview(false)}
                              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                            >
                              Close Preview
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {currentStep === 5 && (
                <div className="step-content">
                  <div className="mb-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 rounded-xl bg-slate-700 shadow-md">
                        <FontAwesomeIcon
                          icon={faEye}
                          className="w-5 h-5 text-white"
                        />
                      </div>
                      <h4 className="text-xl font-semibold text-slate-800">
                        Step 5: Review & Confirmation
                      </h4>
                    </div>
                    <div className="h-1 bg-slate-700 rounded-full w-20"></div>
                  </div>

                  {/* Review Details Section */}
                  <div className="space-y-8">
                    {/* Company & Contact Details */}
                    <section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                      <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
                        <div className="w-2 h-2 bg-slate-700 rounded-full mr-3"></div>
                        Company & Contact Details
                      </h4>
                      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-gray-700 dark:text-gray-300">
                        <div>
                          <dt className="font-medium text-gray-500 dark:text-gray-400">
                            Company
                          </dt>
                          <dd className="mt-1 font-semibold">
                            {company?.name || 'N/A'}
                          </dd>
                        </div>
                        <div>
                          <dt className="font-medium text-gray-500 dark:text-gray-400">
                            Contact Person
                          </dt>
                          <dd className="mt-1 font-semibold">
                            {company?.contactPerson || 'N/A'}
                          </dd>
                        </div>
                        <div>
                          <dt className="font-medium text-gray-500 dark:text-gray-400">
                            Email
                          </dt>
                          <dd className="mt-1 font-semibold">
                            {company?.email || 'N/A'}
                          </dd>
                        </div>
                        <div>
                          <dt className="font-medium text-gray-500 dark:text-gray-400">
                            Phone
                          </dt>
                          <dd className="mt-1 font-semibold">
                            {company?.phone || 'N/A'}
                          </dd>
                        </div>
                        <div>
                          <dt className="font-medium text-gray-500 dark:text-gray-400">
                            Country
                          </dt>
                          <dd className="mt-1 font-semibold">
                            {company?.country || 'N/A'}
                          </dd>
                        </div>
                        <div>
                          <dt className="font-medium text-gray-500 dark:text-gray-400">
                            Address
                          </dt>
                          <dd className="mt-1 font-semibold whitespace-pre-line">
                            {company?.address || 'N/A'}
                          </dd>
                        </div>
                      </dl>
                    </section>

                    {/* Container & Terms Information */}
                    <section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                      <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
                        <div className="w-2 h-2 bg-slate-700 rounded-full mr-3"></div>
                        Container & Terms Information
                      </h4>
                      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-gray-700 dark:text-gray-300">
                        {containerType && (
                          <>
                            <div>
                              <dt className="font-medium text-gray-500 dark:text-gray-400">
                                Container Type
                              </dt>
                              <dd className="mt-1 font-semibold">
                                {containerType}
                              </dd>
                            </div>
                            <div>
                              <dt className="font-medium text-gray-500 dark:text-gray-400">
                                Number of Containers
                              </dt>
                              <dd className="mt-1 font-semibold">
                                {numberOfContainers}
                              </dd>
                            </div>
                            <div>
                              <dt className="font-medium text-gray-500 dark:text-gray-400">
                                Capacity Basis
                              </dt>
                              <dd className="mt-1 font-semibold">
                                {capacityBasis === 'weight'
                                  ? 'By Weight (KG)'
                                  : 'By Volume (CBM)'}
                              </dd>
                            </div>
                            {capacityBasis === 'weight' &&
                              maxPermissibleWeight && (
                                <div>
                                  <dt className="font-medium text-gray-500 dark:text-gray-400">
                                    Max Container Weight
                                  </dt>
                                  <dd className="mt-1 font-semibold">
                                    {maxPermissibleWeight} KG
                                  </dd>
                                </div>
                              )}
                          </>
                        )}
                        <div>
                          <dt className="font-medium text-gray-500 dark:text-gray-400">
                            Payment Term
                          </dt>
                          <dd className="mt-1 font-semibold">
                            {paymentTermNames[paymentTerm] ||
                              paymentTerm ||
                              'N/A'}
                          </dd>
                        </div>
                        <div>
                          <dt className="font-medium text-gray-500 dark:text-gray-400">
                            Delivery Term
                          </dt>
                          <dd className="mt-1 font-semibold">
                            {deliveryTermNames[deliveryTerm] ||
                              deliveryTerm ||
                              'N/A'}
                          </dd>
                        </div>
                        {maxShipmentWeight && (
                          <div>
                            <dt className="font-medium text-gray-500 dark:text-gray-400">
                              Max Shipment Weight
                            </dt>
                            <dd className="mt-1 font-semibold">
                              {maxShipmentWeight} KG
                            </dd>
                          </div>
                        )}
                        <div>
                          <dt className="font-medium text-gray-500 dark:text-gray-400">
                            Currency
                          </dt>
                          <dd className="mt-1 font-semibold">{currency}</dd>
                        </div>
                      </dl>
                    </section>

                    {/* Products Table */}
                    <section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                      <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
                        <div className="w-2 h-2 bg-slate-700 rounded-full mr-3"></div>
                        Products ({addedProducts.length})
                      </h4>
                      {addedProducts.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-gray-700 dark:text-gray-300">
                            <thead className="bg-gray-100 dark:bg-gray-700">
                              <tr>
                                <th className="px-3 py-3 text-left text-sm font-semibold">
                                  Category
                                </th>
                                <th className="px-3 py-3 text-left text-sm font-semibold">
                                  Product Name
                                </th>
                                <th className="px-3 py-3 text-left text-sm font-semibold">
                                  HS Code
                                </th>
                                <th className="px-3 py-3 text-right text-sm font-semibold">
                                  Quantity
                                </th>
                                <th className="px-3 py-3 text-left text-sm font-semibold">
                                  Unit
                                </th>
                                <th className="px-3 py-3 text-right text-sm font-semibold">
                                  Weight (KG)
                                </th>
                                <th className="px-3 py-3 text-right text-sm font-semibold">
                                  Rate
                                </th>
                                <th className="px-3 py-3 text-right text-sm font-semibold">
                                  Total
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                              {addedProducts.map((prod, i) => {
                                const category = categories.find(
                                  (c) =>
                                    c.id.toString() ===
                                    prod.categoryId?.toString()
                                );
                                const productInfo = products.find(
                                  (p) =>
                                    p.id.toString() ===
                                    prod.productId.toString()
                                );
                                const weight =
                                  prod.totalWeight ||
                                  calculateTotalWeight(
                                    prod.productId,
                                    prod.quantity.toString(),
                                    prod.unit
                                  );
                                const productName =
                                  productInfo?.name ||
                                  prod.name ||
                                  'Unknown Product';
                                return (
                                  <tr
                                    key={i}
                                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                                  >
                                    <td className="px-3 py-3 text-sm">
                                      {category?.name || 'N/A'}
                                    </td>
                                    <td className="px-3 py-3 text-sm font-medium">
                                      {productName}
                                    </td>
                                    <td className="px-3 py-3 text-sm">
                                      {prod.hsCode ||
                                        productInfo?.hsCode ||
                                        'N/A'}
                                    </td>
                                    <td className="px-3 py-3 text-sm text-right font-medium">
                                      {prod.quantity}
                                    </td>
                                    <td className="px-3 py-3 text-sm">
                                      {prod.unit}
                                    </td>
                                    <td className="px-3 py-3 text-sm text-right">
                                      {weight.toFixed(2)}
                                    </td>
                                    <td className="px-3 py-3 text-sm text-right">
                                      {formatCurrency(
                                        prod.rate,
                                        currency,
                                        2,
                                        3
                                      )}
                                    </td>
                                    <td className="px-3 py-3 text-sm text-right font-semibold">
                                      {formatCurrency(prod.total, currency)}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                            <tfoot>
                              <tr className="bg-gray-50 dark:bg-gray-700 font-semibold text-gray-900 dark:text-gray-200">
                                <td
                                  colSpan={5}
                                  className="text-right px-3 py-3"
                                >
                                  Net Weight:
                                </td>
                                <td className="text-right px-3 py-3">
                                  {addedProducts
                                    .reduce((sum, prod) => {
                                      const weight =
                                        prod.totalWeight ||
                                        calculateTotalWeightWrapper(
                                          prod.productId,
                                          prod.quantity.toString(),
                                          prod.unit
                                        );
                                      return sum + weight;
                                    }, 0)
                                    .toFixed(2)}{' '}
                                  KG
                                </td>
                                <td className="text-right px-3 py-3">
                                  Subtotal:
                                </td>
                                <td className="text-right px-3 py-3">
                                  {formatCurrency(
                                    addedProducts.reduce(
                                      (sum, p) => sum + p.total,
                                      0
                                    ),
                                    currency
                                  )}
                                </td>
                              </tr>
                              <tr className="bg-slate-50 dark:bg-slate-800 font-semibold text-slate-900 dark:text-slate-200">
                                <td
                                  colSpan={5}
                                  className="text-right px-3 py-3"
                                >
                                  Gross Weight:
                                </td>
                                <td className="text-right px-3 py-3">
                                  {calculateGrossWeightWrapper(addedProducts).toFixed(
                                    2
                                  )}{' '}
                                  KG
                                </td>
                                <td
                                  colSpan={2}
                                  className="text-center px-3 py-3 text-sm"
                                >
                                  (Net + Packaging)
                                </td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      ) : (
                        <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                          No products added yet.
                        </p>
                      )}
                    </section>

                    {/* Charges Section */}
                    {deliveryTerm && (
                      <section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                        <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
                          <div className="w-2 h-2 bg-slate-700 rounded-full mr-3"></div>
                          Additional Charges Breakdown
                        </h4>
                        <div className="text-gray-700 dark:text-gray-300 space-y-2">
                          {(() => {
                            let subtotal = addedProducts.reduce(
                              (sum, p) => sum + p.total,
                              0
                            );
                            let chargesTotal = 0;
                            let chargesList = [];

                            if (
                              deliveryTerm === 'fob' &&
                              charges.noOtherCharges
                            ) {
                              chargesList.push(
                                <p
                                  key="no-charges"
                                  className="text-green-600 dark:text-green-400 font-medium"
                                >
                                  ✓ No other charges applicable
                                </p>
                              );
                            } else if (charges) {
                              Object.entries(charges).forEach(([key, val]) => {
                                if (key === 'noOtherCharges') return;
                                if (
                                  key === 'otherCharges' &&
                                  Array.isArray(val)
                                ) {
                                  val.forEach((oc, i) => {
                                    if (oc.name && oc.amount) {
                                      chargesTotal +=
                                        parseFloat(oc.amount) || 0;
                                      chargesList.push(
                                        <div
                                          key={`other-${i}`}
                                          className="flex justify-between"
                                        >
                                          <span>{oc.name}:</span>
                                          <span className="font-semibold">
                                            {formatCurrency(
                                              oc.amount,
                                              currency
                                            )}
                                          </span>
                                        </div>
                                      );
                                    }
                                  });
                                } else if (
                                  (typeof val === 'number' ||
                                    !isNaN(parseFloat(val))) &&
                                  parseFloat(val) > 0
                                ) {
                                  let label = '';
                                  switch (key) {
                                    case 'freightCharge':
                                      label = 'Freight Charge';
                                      break;
                                    case 'insurance':
                                      label = 'Insurance';
                                      break;
                                    case 'destinationPortHandlingCharge':
                                      label =
                                        'Destination Port Handling Charge';
                                      break;
                                    case 'dutyPercent':
                                      label = 'Duty (%)';
                                      break;
                                    case 'vatPercent':
                                      label = 'VAT (%)';
                                      break;
                                    case 'transportationCharge':
                                      label = 'Transportation Charge';
                                      break;
                                    default:
                                      label = key;
                                  }
                                  let amount = parseFloat(val);
                                  if (
                                    key === 'dutyPercent' ||
                                    key === 'vatPercent'
                                  ) {
                                    amount = (amount / 100) * subtotal;
                                  }
                                  chargesTotal += amount;
                                  chargesList.push(
                                    <div
                                      key={key}
                                      className="flex justify-between"
                                    >
                                      <span>{label}:</span>
                                      <span className="font-semibold">
                                        {formatCurrency(amount, currency)}
                                      </span>
                                    </div>
                                  );
                                }
                              });
                            }

                            if (chargesList.length === 0) {
                              chargesList.push(
                                <p
                                  key="no-charges"
                                  className="text-gray-500 dark:text-gray-400"
                                >
                                  No additional charges configured.
                                </p>
                              );
                            }

                            return (
                              <>
                                {chargesList}
                                {chargesTotal > 0 && (
                                  <div className="border-t border-gray-200 dark:border-gray-600 pt-3 mt-3">
                                    <div className="flex justify-between font-semibold text-lg">
                                      <span>Total Charges:</span>
                                      <span className="text-blue-600 dark:text-blue-400">
                                        {formatCurrency(chargesTotal, currency)}
                                      </span>
                                    </div>
                                  </div>
                                )}
                              </>
                            );
                          })()}
                        </div>
                      </section>
                    )}

                    {/* Total Amount */}
                    <section className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900 dark:to-blue-900 rounded-lg border-2 border-green-200 dark:border-green-700 p-6">
                      <div className="text-center">
                        <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                          Total Invoice Amount
                        </h4>
                        <div className="text-3xl font-bold text-slate-700 dark:text-slate-400">
                          {(() => {
                            let subtotal = addedProducts.reduce(
                              (sum, p) => sum + p.total,
                              0
                            );
                            let chargesTotal = 0;

                            if (
                              deliveryTerm === 'fob' &&
                              charges.noOtherCharges
                            ) {
                              // No other charges
                            } else if (charges) {
                              Object.entries(charges).forEach(([key, val]) => {
                                if (key === 'noOtherCharges') return;
                                if (
                                  key === 'otherCharges' &&
                                  Array.isArray(val)
                                ) {
                                  val.forEach((oc) => {
                                    chargesTotal += parseFloat(oc.amount) || 0;
                                  });
                                } else if (
                                  typeof val === 'number' ||
                                  !isNaN(parseFloat(val))
                                ) {
                                  let amount = parseFloat(val) || 0;
                                  if (
                                    key === 'dutyPercent' ||
                                    key === 'vatPercent'
                                  )
                                    amount = (amount / 100) * subtotal;
                                  chargesTotal += amount;
                                }
                              });
                            }

                            return formatCurrency(
                              subtotal + chargesTotal,
                              currency
                            );
                          })()}
                        </div>
                      </div>
                    </section>
                  </div>
                </div>
              )}
              {/* Navigation Buttons */}
              <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 gap-4">
                <button
                  type="button"
                  onClick={() => setCurrentStep(Math.max(currentStep - 1, 1))}
                  disabled={currentStep === 1}
                  className={`inline-flex items-center justify-center px-5 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 shadow-sm ${
                    currentStep === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200 dark:bg-gray-800 dark:text-gray-600 dark:border-gray-700'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400 focus:ring-2 focus:ring-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700'
                  }`}
                >
                  <FontAwesomeIcon
                    icon={faChevronLeft}
                    className="mr-2 w-4 h-4"
                  />
                  Previous
                </button>

                <div className="flex flex-col sm:flex-row gap-3">
                  {!isEditMode && (
                    <button
                      type="button"
                      onClick={handleSaveDraft}
                      disabled={submitting}
                      className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-gray-600 text-white font-medium text-sm transition-all duration-200 shadow-sm hover:bg-gray-700 focus:ring-2 focus:ring-gray-200 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:hover:bg-gray-600"
                    >
                      {submitting ? 'Saving...' : 'Save as Draft'}
                    </button>
                  )}

                  {currentStep < 5 ? (
                    <button
                      type="button"
                      onClick={() => handleStepComplete(currentStep)}
                      className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-slate-700 text-white font-medium text-sm transition-all duration-200 shadow-sm hover:bg-slate-800 focus:ring-2 focus:ring-slate-200 dark:focus:ring-slate-600"
                    >
                      Next Step
                      <FontAwesomeIcon
                        icon={faChevronRight}
                        className="ml-2 w-4 h-4"
                      />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleConfirm}
                      disabled={submitting}
                      className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-slate-700 text-white font-medium text-sm transition-all duration-200 shadow-sm hover:bg-slate-800 focus:ring-2 focus:ring-slate-200 disabled:opacity-50 disabled:cursor-not-allowed dark:focus:ring-slate-600"
                    >
                      <FontAwesomeIcon
                        icon={faCheck}
                        className="mr-2 w-4 h-4"
                      />
                      {submitting
                        ? 'Saving...'
                        : isEditMode
                          ? 'Update PI'
                          : 'Save PI'}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => navigate('/proforma-invoices')}
                    className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-gray-500 text-white font-medium text-sm transition-all duration-200 shadow-sm hover:bg-gray-600 focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-600"
                  >
                    <FontAwesomeIcon icon={faTimes} className="mr-2 w-4 h-4" />
                    Cancel
                  </button>
                </div>
              </div>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddEditPerformaInvoiceForm;
