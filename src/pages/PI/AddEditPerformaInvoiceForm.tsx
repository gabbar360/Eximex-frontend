import { useDispatch, useSelector } from 'react-redux';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { fetchCategories } from '../../features/categorySlice';
import { fetchProducts } from '../../features/productSlice';
import { HiChevronDown, HiMagnifyingGlass } from 'react-icons/hi2';
import { Steps } from 'antd';
import {
  UserOutlined,
  ContainerOutlined,
  FileTextOutlined,
  ShoppingOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';

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
  } | null;
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
  containerNumber?: number;
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
  notes?: string;
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

const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
];

const deliveryTermNames = {
  fob: 'FOB (Free On Board)',
  cif: 'CIF (Cost, Insurance & Freight)',
  ddp: 'DDP (Delivered Duty Paid)',
};

const containerTypes: ContainerConfig[] = CONTAINER_CONFIGS;
const currencies: any[] = CURRENCIES;

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
  const [advancePercentage, setAdvancePercentage] = useState<string>('');
  const [balancePaymentTerm, setBalancePaymentTerm] = useState<string>('');
  const [showToTheOrder, setShowToTheOrder] = useState<boolean>(false);
  const [isSampleKit, setIsSampleKit] = useState<boolean>(false);
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
  const [notes, setNotes] = useState<string>('');

  // Container-wise product management
  const [selectedContainer, setSelectedContainer] = useState<number>(1);
  const [containerProducts, setContainerProducts] = useState<{
    [containerNumber: number]: ProductData[];
  }>({});
  const dispatch = useDispatch();
  const { categories } = useSelector((state: any) => state.category);
  const { products } = useSelector((state: any) => state.product);
  const [companies, setCompanies] = useState<Company[]>([]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (companyRef.current && !companyRef.current.contains(event.target)) {
        setShowCompanyDropdown(false);
      }
      if (
        containerTypeRef.current &&
        !containerTypeRef.current.contains(event.target)
      ) {
        setShowContainerTypeDropdown(false);
      }
      if (
        paymentTermRef.current &&
        !paymentTermRef.current.contains(event.target)
      ) {
        setShowPaymentTermDropdown(false);
      }
      if (
        deliveryTermRef.current &&
        !deliveryTermRef.current.contains(event.target)
      ) {
        setShowDeliveryTermDropdown(false);
      }
      if (currencyRef.current && !currencyRef.current.contains(event.target)) {
        setShowCurrencyDropdown(false);
      }
      if (
        preCarriageRef.current &&
        !preCarriageRef.current.contains(event.target)
      ) {
        setShowPreCarriageDropdown(false);
      }
      if (
        balancePaymentTermRef.current &&
        !balancePaymentTermRef.current.contains(event.target)
      ) {
        setShowBalancePaymentTermDropdown(false);
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
    className = '',
    style = {},
  }) => {
    const selectedOption = options.find(
      (opt) => opt[valueKey]?.toString() === value?.toString()
    );

    return (
      <div className="relative" ref={dropdownRef}>
        <div
          className={`w-full px-4 py-3 border border-gray-300 bg-white rounded-lg cursor-pointer flex items-center justify-between transition-all duration-300 shadow-sm ${className} ${
            disabled
              ? 'bg-gray-100 cursor-not-allowed'
              : 'hover:border-slate-400 focus-within:ring-2 focus-within:ring-slate-200 focus-within:border-slate-500'
          }`}
          onClick={() => !disabled && onToggle()}
          style={style}
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

  // Backend integration state
  const [formDataLoaded, setFormDataLoaded] = useState<boolean>(false);
  const [validationResult, setValidationResult] = useState<any>(null);

  // Dropdown states for searchable dropdowns
  const [companySearch, setCompanySearch] = useState('');
  const [containerTypeSearch, setContainerTypeSearch] = useState('');
  const [paymentTermSearch, setPaymentTermSearch] = useState('');
  const [deliveryTermSearch, setDeliveryTermSearch] = useState('');
  const [currencySearch, setCurrencySearch] = useState('');
  const [preCarriageSearch, setPreCarriageSearch] = useState('');
  const [balancePaymentTermSearch, setBalancePaymentTermSearch] = useState('');

  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
  const [showContainerTypeDropdown, setShowContainerTypeDropdown] =
    useState(false);
  const [showPaymentTermDropdown, setShowPaymentTermDropdown] = useState(false);
  const [showDeliveryTermDropdown, setShowDeliveryTermDropdown] =
    useState(false);
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const [showPreCarriageDropdown, setShowPreCarriageDropdown] = useState(false);
  const [showBalancePaymentTermDropdown, setShowBalancePaymentTermDropdown] =
    useState(false);

  const companyRef = useRef(null);
  const containerTypeRef = useRef(null);
  const paymentTermRef = useRef(null);
  const deliveryTermRef = useRef(null);
  const currencyRef = useRef(null);
  const preCarriageRef = useRef(null);
  const balancePaymentTermRef = useRef(null);

  // Step validation functions
  const validateStep1 = () => {
    const errors: { [key: string]: boolean } = {};

    if (!companyId || companyId.toString().trim() === '')
      errors.companyId = true;
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
        break;
      case 2:
        isValid = validateStep2();
        break;
      case 3:
        isValid = validateStep3();
        break;
      case 4:
        isValid = validateStep4();
        break;
      default:
        isValid = true;
    }

    if (isValid) {
      setValidationErrors({});
      setCompletedSteps((prev) => new Set([...prev, step]));
      if (step < 5) {
        setCurrentStep(step + 1);
      }
      return true;
    } else {
      toast.error('Please fill all required fields.');
      return false;
    }
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
              setAdvancePercentage(pi.advancePercentage || '');
              setBalancePaymentTerm(pi.balancePaymentTerm || '');
              setShowToTheOrder(pi.showToTheOrder || false);
              setIsSampleKit(pi.isSampleKit || false);
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

              // Set notes
              setNotes(pi.notes || '');

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
                const productDataList = pi.products.map((p: any) => {
                  console.log('Loading product from backend:', {
                    productId: p.productId,
                    productName: p.productName,
                    packagingCalculation: p.packagingCalculation,
                    rawProduct: p, // Log the entire product object
                  });

                  return {
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
                    containerNumber: p.containerNumber || 1,
                    packagingCalculation:
                      p.calculatedPallets &&
                      (p.unit === 'Square Meter' ||
                        p.unit === 'sqm' ||
                        p.unit === 'm²')
                        ? {
                            totalPallets: p.calculatedPallets,
                            totalBoxes: p.calculatedBoxes || 0,
                            calculatedFor: p.quantity,
                          }
                        : null,
                  };
                });

                setAddedProducts(productDataList);

                // Initialize container products for edit mode using actual container numbers
                const containers = pi.numberOfContainers || 1;
                const containerProds: { [key: number]: ProductData[] } = {};

                // Initialize all containers
                for (let i = 1; i <= containers; i++) {
                  containerProds[i] = [];
                }

                // Group products by their actual container numbers
                productDataList.forEach((product: ProductData) => {
                  const containerNum = product.containerNumber || 1;
                  if (containerProds[containerNum]) {
                    containerProds[containerNum].push(product);
                  } else {
                    // If container number doesn't exist, add to container 1
                    containerProds[1].push(product);
                  }
                });

                setContainerProducts(containerProds);

                // Keep product form empty in edit mode
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
              } else {
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

  const handlePaymentTermChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPaymentTerm(e.target.value);
    setAdvancePercentage('');
    setBalancePaymentTerm('');
  };

  const getFormattedPaymentTerm = () => {
    if (paymentTerm === 'advance' && advancePercentage) {
      const advance = parseInt(advancePercentage);
      const balance = 100 - advance;
      if (balance > 0 && balancePaymentTerm) {
        return `${advance}% ADVANCE. ${balance}% ${balancePaymentTerm}`;
      }
      return `${advance}% ADVANCE`;
    }
    const termNames = {
      fob: 'FOB (Free On Board)',
      cif: 'CIF (Cost, Insurance & Freight)',
      ddp: 'DDP (Delivered Duty Paid)',
      lc: 'LC (Letter of Credit)',
      advance: 'Advance',
    };
    return termNames[paymentTerm] || paymentTerm || 'N/A';
  };

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
  const calculateTotalWeightWrapper = (
    productId: string,
    quantity: string,
    unit: string
  ) => {
    return calculateTotalWeight(productId, quantity, unit, products);
  };

  const calculateQuantityFromWeightWrapper = (
    productId: string,
    weightKg: string
  ) => {
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
      // Don't auto-update numberOfContainers in edit mode to preserve backend value
      if (!isEditMode && utilization.recommendedContainers > 0) {
        setNumberOfContainers(Math.max(utilization.recommendedContainers, 1));
      }
    } else if (!isEditMode) {
      // Ensure numberOfContainers is never 0, but only in create mode
      setNumberOfContainers(Math.max(numberOfContainers, 1));
    }
  };

  // Effect to update container utilization when products or container type changes
  useEffect(() => {
    updateContainerUtilization();
  }, [addedProducts, containerType, capacityBasis]);

  // Initialize container products when number of containers changes
  useEffect(() => {
    if (numberOfContainers > 0) {
      setContainerProducts((prev) => {
        const updated = { ...prev };
        // Initialize containers that don't exist
        for (let i = 1; i <= numberOfContainers; i++) {
          if (!updated[i]) {
            updated[i] = [];
          }
        }
        // Remove containers that exceed the current count
        Object.keys(updated).forEach((key) => {
          const containerNum = parseInt(key);
          if (containerNum > numberOfContainers) {
            delete updated[containerNum];
          }
        });
        return updated;
      });

      // Set selected container to 1 if it's out of range
      if (selectedContainer > numberOfContainers) {
        setSelectedContainer(1);
      }
    }
  }, [numberOfContainers]);

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

  // Helper function to get consistent CBM per pallet value
  const getCBMPerPallet = (productId: string) => {
    const productInfo = products.find(
      (p) => p.id.toString() === productId.toString()
    );

    // Try multiple possible paths for CBM per pallet with consistent fallback
    return (
      productInfo?.packagingVolume ||
      productInfo?.packingHierarchy?.volumes?.cbmPerPallet ||
      productInfo?.packagingHierarchyData?.dynamicFields?.cbmPerPallet ||
      productInfo?.cbmPerPallet ||
      (productInfo?.packagingHierarchyData?.dynamicFields?.weightPerPallet
        ? (productInfo.packagingHierarchyData.dynamicFields.weightPerPallet /
            1000) *
          0.075
        : null) || // Estimate from weight
      0.07 // Default fallback
    );
  };

  const getCurrentTotals = () => {
    const totalWeight = addedProducts.reduce((sum, p) => {
      if (p.totalWeight && p.totalWeight > 0) {
        return sum + p.totalWeight;
      }
      // Use the improved calculateTotalWeight function with products array
      return (
        sum +
        calculateTotalWeight(
          p.productId,
          p.quantity.toString(),
          p.unit,
          products
        )
      );
    }, 0);

    // CBM calculation based on pallet calculation for tiles
    const totalVolume = addedProducts.reduce((sum, p) => {
      const product = products.find(
        (pr) => pr.id.toString() === p.productId.toString()
      );

      // Check if this product has packaging calculation (for tiles)
      if (p.packagingCalculation && p.packagingCalculation.totalPallets > 0) {
        // Get CBM per pallet using consistent helper function
        const palletCBM = getCBMPerPallet(p.productId);

        console.log('CBM Calculation Debug:', {
          productId: p.productId,
          totalPallets: p.packagingCalculation.totalPallets,
          palletCBM,
        });

        const totalCBM = p.packagingCalculation.totalPallets * palletCBM;
        return sum + totalCBM;
      }

      if (product?.packagingVolume) {
        // Calculate CBM based on quantity and packaging volume
        let totalCBM = 0;

        if (p.unit === 'box' || p.unit === 'Box') {
          // If unit is box, multiply quantity by packaging volume per box
          totalCBM = p.quantity * product.packagingVolume;
        } else if (
          p.unit === 'pcs' ||
          p.unit === 'pieces' ||
          p.unit === 'Pieces'
        ) {
          // If unit is pieces, calculate boxes first then CBM
          const piecesPerBox = product.totalPieces || product.piecesPerBox || 1;
          const boxes = Math.ceil(p.quantity / piecesPerBox);
          totalCBM = boxes * product.packagingVolume;
        } else {
          // For other units, assume direct multiplication with packaging volume
          totalCBM = p.quantity * product.packagingVolume;
        }

        return sum + totalCBM;
      }

      // Fallback: use legacy calculation if no packaging volume
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

      // Final fallback: assume 0.01 CBM per unit if no config available
      return sum + p.quantity * 0.01;
    }, 0);

    return { weight: totalWeight, volume: totalVolume };
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
        toast.error(
          'Please fill all required fields: Category, Product, Unit, Quantity, and Rate'
        );
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

      const productName =
        product?.name ||
        product?.productName ||
        `Product ${currentProduct.productId}`;

      const productData: ProductData = {
        productId: currentProduct.productId,
        name: productName,
        productName: productName,
        hsCode: (() => {
          // Match PDF template HS Code logic exactly
          if (product?.hsCode && product.hsCode !== 'N/A') return product.hsCode;
          if (product?.hsnCode && product.hsnCode !== 'N/A') return product.hsnCode;
          const category = categories.find(c => c.id.toString() === (currentProduct.categoryId || selectedCategory)?.toString());
          if (category?.hsnCode) return category.hsnCode;
          if (product?.category?.hsnCode) return product.category.hsnCode;
          if (product?.hsCode) return product.hsCode;
          if (product?.hsnCode) return product.hsnCode;
          return 'N/A';
        })(),
        description: product?.description || 'No description available',
        quantity: quantity,
        rate: rate,
        unit: currentProduct.unit,
        total: quantity * rate,
        totalWeight: totalWeight,
        categoryId: currentProduct.categoryId || selectedCategory,
        subcategoryId: currentProduct.subcategoryId || selectedSubcategory,
        containerNumber: numberOfContainers > 1 ? selectedContainer : 1,
        packagingCalculation: currentProduct.packagingCalculation,
      };

      if (editingProductIndex !== null) {
        // Update existing product in the selected container
        const containerNum = numberOfContainers > 1 ? selectedContainer : 1;
        const updatedContainerProducts = [
          ...(containerProducts[containerNum] || []),
        ];
        const globalIndex = editingProductIndex;

        // Find which container and local index this global index refers to
        let currentIndex = 0;
        let targetContainer = 1;
        let localIndex = 0;

        for (let i = 1; i <= numberOfContainers; i++) {
          const containerProds = containerProducts[i] || [];
          if (currentIndex + containerProds.length > globalIndex) {
            targetContainer = i;
            localIndex = globalIndex - currentIndex;
            break;
          }
          currentIndex += containerProds.length;
        }

        const targetContainerProducts = [
          ...(containerProducts[targetContainer] || []),
        ];
        targetContainerProducts[localIndex] = productData;

        setContainerProducts((prev) => ({
          ...prev,
          [targetContainer]: targetContainerProducts,
        }));

        // Update global addedProducts
        const allProducts: ProductData[] = [];
        for (let i = 1; i <= numberOfContainers; i++) {
          if (i === targetContainer) {
            allProducts.push(...targetContainerProducts);
          } else {
            allProducts.push(...(containerProducts[i] || []));
          }
        }
        setAddedProducts(allProducts);

        setEditingProductIndex(null);
        toast.success('Product updated successfully!');
      } else {
        // Add new product to selected container
        const containerNum = numberOfContainers > 1 ? selectedContainer : 1;
        const updatedContainerProducts = [
          ...(containerProducts[containerNum] || []),
          productData,
        ];

        setContainerProducts((prev) => ({
          ...prev,
          [containerNum]: updatedContainerProducts,
        }));

        // Update global addedProducts
        const allProducts: ProductData[] = [];
        for (let i = 1; i <= numberOfContainers; i++) {
          if (i === containerNum) {
            allProducts.push(...updatedContainerProducts);
          } else {
            allProducts.push(...(containerProducts[i] || []));
          }
        }
        setAddedProducts(allProducts);

        toast.success(
          `Product added to Container ${containerNum} successfully!`
        );
      }

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
    // Find which container this product belongs to
    let currentIndex = 0;
    let targetContainer = 1;
    let localIndex = 0;

    for (let i = 1; i <= numberOfContainers; i++) {
      const containerProds = containerProducts[i] || [];
      if (currentIndex + containerProds.length > index) {
        targetContainer = i;
        localIndex = index - currentIndex;
        break;
      }
      currentIndex += containerProds.length;
    }

    // Remove from container
    const updatedContainerProducts = [
      ...(containerProducts[targetContainer] || []),
    ];
    updatedContainerProducts.splice(localIndex, 1);

    setContainerProducts((prev) => ({
      ...prev,
      [targetContainer]: updatedContainerProducts,
    }));

    // Update global addedProducts
    const allProducts: ProductData[] = [];
    for (let i = 1; i <= numberOfContainers; i++) {
      if (i === targetContainer) {
        allProducts.push(...updatedContainerProducts);
      } else {
        allProducts.push(...(containerProducts[i] || []));
      }
    }
    setAddedProducts(allProducts);
  };

  const removeProduct = (idx: number) =>
    setProductsAdded((prev) => prev.filter((_, i) => i !== idx));

  const updateProduct = useCallback(
    (idx: number, field: keyof ProductAdded, value: string | any) => {
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
      notes,
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
        advancePercentage: advancePercentage || '',
        balancePaymentTerm: balancePaymentTerm || '',
        showToTheOrder: showToTheOrder,
        isSampleKit: isSampleKit,
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
        notes,
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
          containerNumber: product.containerNumber || 1,
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
        advancePercentage,
        balancePaymentTerm,
        showToTheOrder,
        isSampleKit,
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
        notes,
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
          containerNumber: product.containerNumber || 1,
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
            <Steps
              current={currentStep - 1}
              onChange={(step) => setCurrentStep(step + 1)}
              items={[
                {
                  title: 'Company',
                  status:
                    currentStep > 1 || completedSteps.has(1)
                      ? 'finish'
                      : currentStep === 1
                        ? 'process'
                        : 'wait',
                  icon: <UserOutlined />,
                },
                {
                  title: 'Container',
                  status:
                    currentStep > 2 || completedSteps.has(2)
                      ? 'finish'
                      : currentStep === 2
                        ? 'process'
                        : 'wait',
                  icon: <ContainerOutlined />,
                },
                {
                  title: 'Terms',
                  status:
                    currentStep > 3 || completedSteps.has(3)
                      ? 'finish'
                      : currentStep === 3
                        ? 'process'
                        : 'wait',
                  icon: <FileTextOutlined />,
                },
                {
                  title: 'Products',
                  status:
                    currentStep > 4 || completedSteps.has(4)
                      ? 'finish'
                      : currentStep === 4
                        ? 'process'
                        : 'wait',
                  icon: <ShoppingOutlined />,
                },
                {
                  title: 'Review',
                  status:
                    currentStep > 5 || completedSteps.has(5)
                      ? 'finish'
                      : currentStep === 5
                        ? 'process'
                        : 'wait',
                  icon: <CheckCircleOutlined />,
                },
              ]}
            />
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
                      <SearchableDropdown
                        label="Company"
                        value={companyId}
                        options={(Array.isArray(companies) ? companies : [])
                          .filter((comp) => comp.role === 'Customer')
                          .filter((comp) =>
                            comp.companyName
                              .toLowerCase()
                              .includes(companySearch.toLowerCase())
                          )
                          .map((comp) => ({
                            id: comp.id,
                            name: comp.companyName,
                          }))}
                        onSelect={(companyId) => {
                          setCompanyId(companyId);
                          setCompanySearch('');
                          const selectedParty = companies.find(
                            (c) => c.id == companyId
                          );
                          if (selectedParty) {
                            setCompany({
                              id: selectedParty.id,
                              name:
                                selectedParty.companyName || selectedParty.name,
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
                        }}
                        searchValue={companySearch}
                        onSearchChange={setCompanySearch}
                        isOpen={showCompanyDropdown}
                        onToggle={() =>
                          setShowCompanyDropdown(!showCompanyDropdown)
                        }
                        placeholder="Choose Company"
                        dropdownRef={companyRef}
                        className={
                          validationErrors.companyId ? 'border-red-500' : ''
                        }
                        style={
                          validationErrors.companyId
                            ? { borderColor: '#ef4444', borderWidth: '2px' }
                            : {}
                        }
                      />
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

                  {/* Consignee Display Option */}
                  <div className="mt-6 space-y-4">
                    <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 font-medium">
                      <input
                        type="checkbox"
                        checked={showToTheOrder}
                        onChange={(e) => setShowToTheOrder(e.target.checked)}
                        className="rounded border-gray-300 text-brand-500 shadow-sm focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800"
                      />
                      <span>
                        Show "TO THE ORDER" in PDF instead of customer details
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 font-medium">
                      <input
                        type="checkbox"
                        checked={isSampleKit}
                        onChange={(e) => setIsSampleKit(e.target.checked)}
                        className="rounded border-gray-300 text-brand-500 shadow-sm focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800"
                      />
                      <span>
                        Sample Kit Invoice (Changes header to "SAMPLE KIT
                        PROFORMA INVOICE")
                      </span>
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
                      <SearchableDropdown
                        label="Container Type"
                        value={containerType}
                        options={containerTypes
                          .filter((config) =>
                            config.type
                              .toLowerCase()
                              .includes(containerTypeSearch.toLowerCase())
                          )
                          .map((config) => ({
                            id: config.type,
                            name: `${config.type} (CBM: ${config.cbm})`,
                          }))}
                        onSelect={(type) => {
                          setContainerType(type);
                          setContainerTypeSearch('');
                          setMaxPermissibleWeight('');
                        }}
                        searchValue={containerTypeSearch}
                        onSearchChange={setContainerTypeSearch}
                        isOpen={showContainerTypeDropdown}
                        onToggle={() =>
                          setShowContainerTypeDropdown(
                            !showContainerTypeDropdown
                          )
                        }
                        placeholder="Select Container Type"
                        dropdownRef={containerTypeRef}
                        style={
                          validationErrors.containerType
                            ? { borderColor: '#ef4444', borderWidth: '2px' }
                            : {}
                        }
                      />
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
                              {containerUtilization.totalVolume.toFixed(3)} CBM
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

                        {/* CBM Calculation Details */}
                        {containerUtilization.totalVolume > 0 && (
                          <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-600">
                            <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                              Container Summary Only - Detailed CBM breakdown
                              available in Step 4
                            </div>
                          </div>
                        )}
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
                        <SearchableDropdown
                          label="Pre Carriage Mode"
                          value={preCarriageBy}
                          options={[
                            { id: '', name: 'Select Mode' },
                            { id: 'By Road', name: 'By Road' },
                            { id: 'By Rail', name: 'By Rail' },
                            { id: 'By Air', name: 'By Air' },
                            { id: 'By Sea', name: 'By Sea' },
                          ].filter((mode) =>
                            mode.name
                              .toLowerCase()
                              .includes(preCarriageSearch.toLowerCase())
                          )}
                          onSelect={(mode) => {
                            setPreCarriageBy(mode);
                            setPreCarriageSearch('');
                          }}
                          searchValue={preCarriageSearch}
                          onSearchChange={setPreCarriageSearch}
                          isOpen={showPreCarriageDropdown}
                          onToggle={() =>
                            setShowPreCarriageDropdown(!showPreCarriageDropdown)
                          }
                          placeholder="Select Mode"
                          dropdownRef={preCarriageRef}
                        />
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
                      <SearchableDropdown
                        label="Payment Term"
                        value={paymentTerm}
                        options={[
                          { id: 'advance', name: 'Advance' },
                          { id: 'lc', name: 'LC (Letter of Credit)' },
                        ].filter((term) =>
                          term.name
                            .toLowerCase()
                            .includes(paymentTermSearch.toLowerCase())
                        )}
                        onSelect={(term) => {
                          setPaymentTerm(term);
                          setPaymentTermSearch('');
                          setAdvancePercentage('');
                          setBalancePaymentTerm('');
                        }}
                        searchValue={paymentTermSearch}
                        onSearchChange={setPaymentTermSearch}
                        isOpen={showPaymentTermDropdown}
                        onToggle={() =>
                          setShowPaymentTermDropdown(!showPaymentTermDropdown)
                        }
                        placeholder="Choose Payment Term"
                        dropdownRef={paymentTermRef}
                        style={
                          validationErrors.paymentTerm
                            ? { borderColor: '#ef4444', borderWidth: '2px' }
                            : {}
                        }
                      />
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
                      <SearchableDropdown
                        label="Delivery Term"
                        value={deliveryTerm}
                        options={[
                          { id: 'fob', name: 'FOB' },
                          { id: 'cif', name: 'CIF' },
                          { id: 'ddp', name: 'DDP' },
                        ].filter((term) =>
                          term.name
                            .toLowerCase()
                            .includes(deliveryTermSearch.toLowerCase())
                        )}
                        onSelect={(term) => {
                          setDeliveryTerm(term);
                          setDeliveryTermSearch('');
                          setCharges({});
                        }}
                        searchValue={deliveryTermSearch}
                        onSearchChange={setDeliveryTermSearch}
                        isOpen={showDeliveryTermDropdown}
                        onToggle={() =>
                          setShowDeliveryTermDropdown(!showDeliveryTermDropdown)
                        }
                        placeholder="Choose Delivery Term"
                        dropdownRef={deliveryTermRef}
                        style={
                          validationErrors.deliveryTerm
                            ? { borderColor: '#ef4444', borderWidth: '2px' }
                            : {}
                        }
                      />
                      {validationErrors.deliveryTerm && (
                        <p className="text-red-500 text-sm mt-1">
                          Delivery term is required
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Payment Term Configuration */}
                  {paymentTerm === 'advance' && (
                    <div className="mt-6 space-y-4">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="advancePercentage">
                            Advance Percentage *
                          </Label>
                          <Input
                            type="number"
                            id="advancePercentage"
                            value={advancePercentage}
                            onChange={(e) =>
                              setAdvancePercentage(e.target.value)
                            }
                            placeholder="Enter percentage (e.g., 30)"
                            min="1"
                            max="100"
                            required
                          />
                        </div>
                        {advancePercentage &&
                          parseInt(advancePercentage) < 100 && (
                            <div>
                              <Label htmlFor="balancePaymentTerm">
                                Balance {100 - parseInt(advancePercentage)}%
                                Payment Term *
                              </Label>
                              <SearchableDropdown
                                label="Balance Payment Term"
                                value={balancePaymentTerm}
                                options={[
                                  { id: 'AGAINST SCAN BL', name: 'AGAINST SCAN BL' },
                                  {
                                    id: 'AGAINST DOCUMENTS',
                                    name: 'AGAINST DOCUMENTS',
                                  },
                                  { id: 'ON DELIVERY', name: 'ON DELIVERY' },
                                  {
                                    id: 'BEFORE DISPATCH',
                                    name: 'BEFORE DISPATCH',
                                  },
                                  {
                                    id: 'Balance 70% Payment Term',
                                    name: 'Balance 70% Payment Term',
                                  },
                                ].filter((term) =>
                                  term.name
                                    .toLowerCase()
                                    .includes(
                                      balancePaymentTermSearch.toLowerCase()
                                    )
                                )}
                                onSelect={(term) => {
                                  setBalancePaymentTerm(term);
                                  setBalancePaymentTermSearch('');
                                }}
                                searchValue={balancePaymentTermSearch}
                                onSearchChange={setBalancePaymentTermSearch}
                                isOpen={showBalancePaymentTermDropdown}
                                onToggle={() =>
                                  setShowBalancePaymentTermDropdown(
                                    !showBalancePaymentTermDropdown
                                  )
                                }
                                placeholder="Select balance payment term"
                                dropdownRef={balancePaymentTermRef}
                              />
                            </div>
                          )}
                      </div>

                      {/* Live Preview */}
                      {advancePercentage && (
                        <div className="p-3 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg">
                          <div className="flex items-center">
                            <FontAwesomeIcon
                              icon={faCheck}
                              className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3"
                            />
                            <div>
                              <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                                Payment Terms Preview:
                              </p>
                              <p className="text-sm text-blue-700 dark:text-blue-300 font-semibold">
                                {getFormattedPaymentTerm()}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mt-8 space-y-6">{renderChargesFields()}</div>

                  {/* Notes Section */}
                  <div className="mt-8">
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <TextArea
                      value={notes}
                      onChange={(value) => setNotes(value)}
                      rows={4}
                      placeholder="Enter any additional notes or special instructions for the PI..."
                      className="mt-1"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      These notes will appear in the PDF and can include special
                      instructions, terms, or other relevant information.
                    </p>
                  </div>
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
                      <SearchableDropdown
                        label="Currency"
                        value={currency}
                        options={currencies
                          .filter(
                            (curr) =>
                              curr.code
                                .toLowerCase()
                                .includes(currencySearch.toLowerCase()) ||
                              curr.name
                                .toLowerCase()
                                .includes(currencySearch.toLowerCase())
                          )
                          .map((curr) => ({
                            id: curr.code,
                            name: `${curr.code} (${curr.symbol}) - ${curr.name}`,
                          }))}
                        onSelect={(currencyCode) => {
                          setCurrency(currencyCode);
                          setCurrencySearch('');
                        }}
                        searchValue={currencySearch}
                        onSearchChange={setCurrencySearch}
                        isOpen={showCurrencyDropdown}
                        onToggle={() =>
                          setShowCurrencyDropdown(!showCurrencyDropdown)
                        }
                        placeholder="Select Currency"
                        dropdownRef={currencyRef}
                      />
                    </div>
                  </div>

                  {/* Container Selection */}
                  {numberOfContainers > 1 && (
                    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <Label className="text-gray-700 font-semibold mb-3">
                        Select Container for Product Addition
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        {Array.from(
                          { length: numberOfContainers },
                          (_, index) => {
                            const containerNum = index + 1;
                            const containerProductCount =
                              containerProducts[containerNum]?.length || 0;

                            // Calculate container CBM
                            const containerCBM = (
                              containerProducts[containerNum] || []
                            ).reduce((sum, prod) => {
                              // Check if this product has packaging calculation (for tiles)
                              if (
                                prod.packagingCalculation &&
                                prod.packagingCalculation.totalPallets > 0
                              ) {
                                // Get CBM per pallet using consistent helper function
                                const palletCBM = getCBMPerPallet(
                                  prod.productId
                                );
                                const totalCBM =
                                  prod.packagingCalculation.totalPallets *
                                  palletCBM;
                                return sum + totalCBM;
                              }

                              const productInfo = products.find(
                                (p) =>
                                  p.id.toString() === prod.productId.toString()
                              );
                              if (!productInfo?.packagingVolume) return sum;

                              let productCBM = 0;
                              if (prod.unit === 'box' || prod.unit === 'Box') {
                                productCBM =
                                  prod.quantity * productInfo.packagingVolume;
                              } else if (
                                prod.unit === 'pcs' ||
                                prod.unit === 'pieces' ||
                                prod.unit === 'Pieces'
                              ) {
                                const piecesPerBox =
                                  productInfo.totalPieces ||
                                  productInfo.piecesPerBox ||
                                  1;
                                const boxes = Math.ceil(
                                  prod.quantity / piecesPerBox
                                );
                                productCBM =
                                  boxes * productInfo.packagingVolume;
                              } else {
                                productCBM =
                                  prod.quantity * productInfo.packagingVolume;
                              }

                              return sum + productCBM;
                            }, 0);

                            const containerConfig = getContainerConfig();
                            const utilizationPercent = containerConfig?.cbm
                              ? (containerCBM / containerConfig.cbm) * 100
                              : 0;

                            return (
                              <button
                                key={containerNum}
                                type="button"
                                onClick={() =>
                                  setSelectedContainer(containerNum)
                                }
                                className={`px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                                  selectedContainer === containerNum
                                    ? 'bg-slate-700 text-white'
                                    : 'bg-slate-700 text-white hover:bg-slate-800'
                                }`}
                              >
                                <div className="text-center">
                                  <div className="font-bold">
                                    Container {containerNum}
                                  </div>
                                </div>
                              </button>
                            );
                          }
                        )}
                      </div>
                      <div className="text-sm text-gray-700 mt-2">
                        Adding products to Container {selectedContainer}
                      </div>
                    </div>
                  )}
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
                        calculateQuantityFromWeight={
                          calculateQuantityFromWeightWrapper
                        }
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
                      className="inline-flex items-center px-5 py-2 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 "
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

                  {/* CBM Summary Display */}
                  {addedProducts.length > 0 && (
                    <div className="mt-6 space-y-6">
                      {/* Overall CBM Summary */}
                      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                        <div className="bg-slate-700 px-6 py-4">
                          <h4 className="text-lg font-semibold text-white">
                            Overall CBM Summary
                          </h4>
                        </div>
                        <div className="p-6">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="text-center">
                              <div className="text-3xl font-bold text-slate-700 mb-1">
                                {getCurrentTotals().volume.toFixed(3)} CBM
                              </div>
                              <div className="text-sm font-medium text-gray-600">
                                Total CBM
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-3xl font-bold text-slate-700 mb-1">
                                {numberOfContainers}
                              </div>
                              <div className="text-sm font-medium text-gray-600">
                                Containers
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-3xl font-bold text-slate-700 mb-1">
                                {containerType && getContainerConfig()?.cbm
                                  ? (
                                      (getCurrentTotals().volume /
                                        (numberOfContainers *
                                          getContainerConfig()?.cbm)) *
                                      100
                                    ).toFixed(1) + '%'
                                  : '0%'}
                              </div>
                              <div className="text-sm font-medium text-gray-600">
                                Avg Utilization
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Container-wise CBM Breakdown */}
                      {numberOfContainers > 1 && (
                        <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                          <div className="bg-slate-700 px-6 py-4">
                            <h4 className="text-lg font-semibold text-white">
                              Container-wise CBM Breakdown
                            </h4>
                          </div>
                          <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                              {Array.from(
                                { length: numberOfContainers },
                                (_, index) => {
                                  const containerNum = index + 1;
                                  const containerProds =
                                    containerProducts[containerNum] || [];

                                  const containerCBM = containerProds.reduce(
                                    (sum, prod) => {
                                      // Check if this product has packaging calculation (for tiles)
                                      if (
                                        prod.packagingCalculation &&
                                        prod.packagingCalculation.totalPallets >
                                          0
                                      ) {
                                        // Get CBM per pallet using consistent helper function
                                        const palletCBM = getCBMPerPallet(
                                          prod.productId
                                        );
                                        const totalCBM =
                                          prod.packagingCalculation
                                            .totalPallets * palletCBM;
                                        return sum + totalCBM;
                                      }

                                      const productInfo = products.find(
                                        (p) =>
                                          p.id.toString() ===
                                          prod.productId.toString()
                                      );
                                      if (!productInfo?.packagingVolume)
                                        return sum;

                                      let productCBM = 0;
                                      if (
                                        prod.unit === 'box' ||
                                        prod.unit === 'Box'
                                      ) {
                                        productCBM =
                                          prod.quantity *
                                          productInfo.packagingVolume;
                                      } else if (
                                        prod.unit === 'pcs' ||
                                        prod.unit === 'pieces' ||
                                        prod.unit === 'Pieces'
                                      ) {
                                        const piecesPerBox =
                                          productInfo.totalPieces ||
                                          productInfo.piecesPerBox ||
                                          1;
                                        const boxes = Math.ceil(
                                          prod.quantity / piecesPerBox
                                        );
                                        productCBM =
                                          boxes * productInfo.packagingVolume;
                                      } else {
                                        productCBM =
                                          prod.quantity *
                                          productInfo.packagingVolume;
                                      }

                                      return sum + productCBM;
                                    },
                                    0
                                  );

                                  const containerConfig = getContainerConfig();
                                  const utilizationPercent =
                                    containerConfig?.cbm
                                      ? (containerCBM / containerConfig.cbm) *
                                        100
                                      : 0;

                                  return (
                                    <div
                                      key={containerNum}
                                      className="bg-slate-50 border border-slate-200 rounded-lg p-4"
                                    >
                                      <div className="text-center mb-4">
                                        <h5 className="text-lg font-semibold text-slate-700">
                                          Container {containerNum}
                                        </h5>
                                      </div>
                                      <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                          <span className="text-sm font-medium text-gray-600">
                                            Products:
                                          </span>
                                          <span className="text-lg font-bold text-slate-700">
                                            {containerProds.length}
                                          </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                          <span className="text-sm font-medium text-gray-600">
                                            CBM Used:
                                          </span>
                                          <span className="text-lg font-bold text-slate-700">
                                            {containerCBM.toFixed(3)}
                                          </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                          <span className="text-sm font-medium text-gray-600">
                                            Capacity:
                                          </span>
                                          <span className="text-lg font-bold text-slate-700">
                                            {containerConfig?.cbm || 0}
                                          </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                          <span className="text-sm font-medium text-gray-600">
                                            Utilization:
                                          </span>
                                          <span
                                            className={`text-lg font-bold ${
                                              utilizationPercent > 90
                                                ? 'text-red-600'
                                                : utilizationPercent > 70
                                                  ? 'text-orange-600'
                                                  : 'text-green-600'
                                            }`}
                                          >
                                            {utilizationPercent.toFixed(1)}%
                                          </span>
                                        </div>
                                      </div>

                                      {/* Progress bar */}
                                      <div className="mt-4">
                                        <div className="w-full bg-gray-200 rounded-full h-3">
                                          <div
                                            className={`h-3 rounded-full transition-all duration-300 ${
                                              utilizationPercent > 90
                                                ? 'bg-red-500'
                                                : utilizationPercent > 70
                                                  ? 'bg-orange-500'
                                                  : 'bg-green-500'
                                            }`}
                                            style={{
                                              width: `${Math.min(utilizationPercent, 100)}%`,
                                            }}
                                          ></div>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                }
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Detailed CBM Calculation */}
                      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden max-w-6xl mx-auto">
                        <div className="bg-slate-700 px-4 sm:px-6 py-4">
                          <h4 className="text-lg font-semibold text-white">
                            CBM Calculation Details
                          </h4>
                        </div>
                        <div className="p-4 sm:p-6">
                          <div className="space-y-3 sm:space-y-4">
                            {addedProducts
                              .map((product, index) => {
                                const productInfo = products.find(
                                  (p) =>
                                    p.id.toString() ===
                                    product.productId.toString()
                                );

                                // Check if this product has packaging calculation (for tiles)
                                if (
                                  product.packagingCalculation &&
                                  product.packagingCalculation.totalPallets > 0
                                ) {
                                  // Get CBM per pallet using consistent helper function
                                  const palletCBM = getCBMPerPallet(
                                    product.productId
                                  );
                                  const totalCBM =
                                    product.packagingCalculation.totalPallets *
                                    palletCBM;

                                  console.log(
                                    'CBM Calculation with packaging:',
                                    {
                                      productId: product.productId,
                                      quantity: product.quantity,
                                      unit: product.unit,
                                      totalPallets:
                                        product.packagingCalculation
                                          .totalPallets,
                                      palletCBM,
                                      totalCBM,
                                    }
                                  );

                                  const calculation = `${product.quantity} ${product.unit} = ${product.packagingCalculation.totalPallets} PALLETS × ${palletCBM.toFixed(6)} CBM/pallet = ${totalCBM.toFixed(3)} CBM`;

                                  return (
                                    <div
                                      key={index}
                                      className="bg-slate-50 border border-slate-200 rounded-lg p-3 sm:p-4"
                                    >
                                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-4">
                                        <div className="flex-1 min-w-0">
                                          <div className="font-semibold text-slate-700 text-base sm:text-lg mb-1 truncate">
                                            {productInfo?.name ||
                                              'Unknown Product'}
                                            :
                                          </div>
                                          <div className="text-xs sm:text-sm text-gray-600 break-words">
                                            {calculation}
                                          </div>
                                        </div>
                                        <div className="text-right sm:ml-4 flex-shrink-0">
                                          <div className="text-xl sm:text-2xl font-bold text-slate-700">
                                            {totalCBM.toFixed(3)} CBM
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                }

                                if (!productInfo?.packagingVolume) return null;

                                let productCBM = 0;
                                let calculation = '';

                                if (
                                  product.unit === 'box' ||
                                  product.unit === 'Box'
                                ) {
                                  productCBM =
                                    product.quantity *
                                    productInfo.packagingVolume;
                                  calculation = `${product.quantity} boxes × ${(productInfo.packagingVolume || 0).toFixed(6)} CBM/box = ${productCBM.toFixed(3)} CBM`;
                                } else if (
                                  product.unit === 'pcs' ||
                                  product.unit === 'pieces' ||
                                  product.unit === 'Pieces'
                                ) {
                                  const piecesPerBox =
                                    productInfo.totalPieces ||
                                    productInfo.piecesPerBox ||
                                    1;
                                  const boxes = Math.ceil(
                                    product.quantity / piecesPerBox
                                  );
                                  productCBM =
                                    boxes * productInfo.packagingVolume;
                                  calculation = `${product.quantity} pcs = ${boxes} boxes × ${(productInfo.packagingVolume || 0).toFixed(6)} CBM/box = ${productCBM.toFixed(3)} CBM`;
                                } else {
                                  productCBM =
                                    product.quantity *
                                    productInfo.packagingVolume;
                                  // For tiles, show pallet calculation instead of unit-based
                                  if (
                                    product.unit === 'Square Meter' ||
                                    product.unit === 'sqm' ||
                                    product.unit === 'm²'
                                  ) {
                                    const estimatedPallets = Math.ceil(
                                      productCBM / productInfo.packagingVolume
                                    ); // Estimate pallets from CBM
                                    calculation = `${product.quantity} ${product.unit} = ${estimatedPallets} PALLETS × ${(productInfo.packagingVolume || 0).toFixed(6)} CBM/pallet = ${productCBM.toFixed(3)} CBM`;
                                  } else {
                                    calculation = `${product.quantity} ${product.unit} × ${(productInfo.packagingVolume || 0).toFixed(6)} CBM/unit = ${productCBM.toFixed(3)} CBM`;
                                  }
                                }

                                return (
                                  <div
                                    key={index}
                                    className="bg-slate-50 border border-slate-200 rounded-lg p-3 sm:p-4"
                                  >
                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-4">
                                      <div className="flex-1 min-w-0">
                                        <div className="font-semibold text-slate-700 text-base sm:text-lg mb-1 truncate">
                                          {productInfo.name}:
                                        </div>
                                        <div className="text-xs sm:text-sm text-gray-600 break-words">
                                          {calculation}
                                        </div>
                                      </div>
                                      <div className="text-right sm:ml-4 flex-shrink-0">
                                        <div className="text-xl sm:text-2xl font-bold text-slate-700">
                                          {productCBM.toFixed(3)} CBM
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })
                              .filter(Boolean)}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

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
                            {getFormattedPaymentTerm()}
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
                        {notes && (
                          <div className="sm:col-span-2">
                            <dt className="font-medium text-gray-500 dark:text-gray-400">
                              Notes
                            </dt>
                            <dd className="mt-1 font-semibold whitespace-pre-line">
                              {notes}
                            </dd>
                          </div>
                        )}
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
                                  Volume (CBM)
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
                                      {(() => {
                                        // Match PDF template HS Code logic exactly
                                        if (productInfo?.hsCode && productInfo.hsCode !== 'N/A') return productInfo.hsCode;
                                        if (productInfo?.hsnCode && productInfo.hsnCode !== 'N/A') return productInfo.hsnCode;
                                        const category = categories.find(c => c.id.toString() === prod.categoryId?.toString());
                                        if (category?.hsnCode) return category.hsnCode;
                                        if (productInfo?.category?.hsnCode) return productInfo.category.hsnCode;
                                        if (productInfo?.hsCode) return productInfo.hsCode;
                                        if (productInfo?.hsnCode) return productInfo.hsnCode;
                                        return 'N/A';
                                      })()} 
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
                                      {(() => {
                                        // Check if this product has packaging calculation (for tiles)
                                        if (
                                          prod.packagingCalculation &&
                                          prod.packagingCalculation
                                            .totalPallets > 0
                                        ) {
                                          // Get CBM per pallet using consistent helper function
                                          const palletCBM = getCBMPerPallet(
                                            prod.productId
                                          );
                                          const totalCBM =
                                            prod.packagingCalculation
                                              .totalPallets * palletCBM;
                                          return totalCBM.toFixed(3);
                                        }

                                        const productInfo = products.find(
                                          (p) =>
                                            p.id.toString() ===
                                            prod.productId.toString()
                                        );
                                        if (!productInfo?.packagingVolume)
                                          return '0.000';

                                        let productCBM = 0;
                                        if (
                                          prod.unit === 'box' ||
                                          prod.unit === 'Box'
                                        ) {
                                          productCBM =
                                            prod.quantity *
                                            productInfo.packagingVolume;
                                        } else if (
                                          prod.unit === 'pcs' ||
                                          prod.unit === 'pieces' ||
                                          prod.unit === 'Pieces'
                                        ) {
                                          const piecesPerBox =
                                            productInfo.totalPieces ||
                                            productInfo.piecesPerBox ||
                                            1;
                                          const boxes = Math.ceil(
                                            prod.quantity / piecesPerBox
                                          );
                                          productCBM =
                                            boxes * productInfo.packagingVolume;
                                        } else {
                                          productCBM =
                                            prod.quantity *
                                            productInfo.packagingVolume;
                                        }

                                        return productCBM.toFixed(3);
                                      })()}{' '}
                                      CBM
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
                                  {addedProducts
                                    .reduce((sum, prod) => {
                                      // Check if this product has packaging calculation (for tiles)
                                      if (
                                        prod.packagingCalculation &&
                                        prod.packagingCalculation.totalPallets >
                                          0
                                      ) {
                                        // Get CBM per pallet using consistent helper function
                                        const palletCBM = getCBMPerPallet(
                                          prod.productId
                                        );
                                        const totalCBM =
                                          prod.packagingCalculation
                                            .totalPallets * palletCBM;
                                        return sum + totalCBM;
                                      }

                                      const productDetails = products.find(
                                        (p) =>
                                          p.id.toString() ===
                                          prod.productId.toString()
                                      );
                                      if (!productDetails?.packagingVolume)
                                        return sum;

                                      let productCBM = 0;
                                      if (
                                        prod.unit === 'box' ||
                                        prod.unit === 'Box'
                                      ) {
                                        productCBM =
                                          prod.quantity *
                                          productDetails.packagingVolume;
                                      } else if (
                                        prod.unit === 'pcs' ||
                                        prod.unit === 'pieces' ||
                                        prod.unit === 'Pieces'
                                      ) {
                                        const piecesPerBox =
                                          productDetails.totalPieces ||
                                          productDetails.piecesPerBox ||
                                          1;
                                        const boxes = Math.ceil(
                                          prod.quantity / piecesPerBox
                                        );
                                        productCBM =
                                          boxes *
                                          productDetails.packagingVolume;
                                      } else {
                                        productCBM =
                                          prod.quantity *
                                          productDetails.packagingVolume;
                                      }

                                      return sum + productCBM;
                                    }, 0)
                                    .toFixed(3)}{' '}
                                  CBM
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
