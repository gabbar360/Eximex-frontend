import { useDispatch } from 'react-redux';
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HiCheckCircle, HiArrowLeft, HiPlus, HiTrash } from 'react-icons/hi';
import { HiChevronDown, HiMagnifyingGlass } from 'react-icons/hi2';
import { toast } from 'react-toastify';
import { getOrderById, updateOrder } from '../../features/orderSlice';
import { getPiInvoiceById } from '../../features/piSlice';
import {
  getPackingListById,
  updatePackingList,
  createPackingList,
} from '../../features/packingListSlice';

import OrderSelector from '../../components/order/OrderSelector';

const AddEditPackingList = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isEdit = !!id && id !== 'create';
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [piProducts, setPiProducts] = useState([]);
  const [piData, setPiData] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showToTheOrder, setShowToTheOrder] = useState(false);

  const [showSealTypeDropdown, setShowSealTypeDropdown] = useState({});
  const sealTypeRefs = useRef({});
  const [showProductNameDropdown, setShowProductNameDropdown] = useState({});
  const productNameRefs = useRef({});
  const orderSelectorRef = useRef(null);

  // Packaging List State
  const [packagingList, setPackagingList] = useState({
    exportInvoiceNo: '',
    exportInvoiceDate: '',
    buyerReference: '',
    buyerDetails: '',
    sellerInfo: '',
    containers: [
      {
        containerNumber: '',
        sealType: '',
        sealNumber: '',
        products: [],
        totalNoOfBoxes: '',
        totalNetWeight: '',
        totalGrossWeight: '',
        totalMeasurement: '',
        totalSquareMeters: '',
        totalPallets: '',
      },
    ],
    notes: '',
    totalBoxes: 0,
    totalNetWeight: 0,
    totalGrossWeight: 0,
    totalVolume: 0,
    totalSquareMeters: 0,
    totalPallets: 0,
    totalContainers: 0,
    dateOfIssue: new Date().toISOString().split('T')[0],
  });

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
  }) => {
    const selectedOption = options.find(
      (opt) => opt[valueKey]?.toString() === value?.toString()
    );

    return (
      <div className="relative" ref={dropdownRef}>
        <label className="block text-sm font-semibold text-slate-700 mb-3">
          {label}
        </label>
        <div
          className={`w-full px-4 py-3 border border-gray-300 bg-white rounded-lg cursor-pointer flex items-center justify-between transition-all duration-300 shadow-sm ${className} ${
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
            className="absolute z-[9999] w-full bg-white border border-gray-200 rounded-lg shadow-xl"
            style={{ top: '100%', marginTop: '4px' }}
          >
            {(() => {
              console.log('SearchableDropdown rendering options:', {
                label,
                isOpen,
                optionsLength: options.length,
                options,
              });
              return null;
            })()}
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

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Skip if click is inside OrderSelector
      if (
        orderSelectorRef.current &&
        orderSelectorRef.current.contains(event.target)
      ) {
        return;
      }

      // Check seal type dropdowns
      Object.keys(sealTypeRefs.current).forEach((containerIndex) => {
        if (
          sealTypeRefs.current[containerIndex] &&
          !sealTypeRefs.current[containerIndex].contains(event.target)
        ) {
          setShowSealTypeDropdown((prev) => ({
            ...prev,
            [containerIndex]: false,
          }));
        }
      });

      // Check product name dropdowns
      Object.keys(productNameRefs.current).forEach((containerIndex) => {
        if (
          productNameRefs.current[containerIndex] &&
          !productNameRefs.current[containerIndex].contains(event.target)
        ) {
          setShowProductNameDropdown((prev) => ({
            ...prev,
            [containerIndex]: false,
          }));
        }
      });
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (id && id !== 'create') {
      fetchOrderDetails();
    } else {
      setLoading(false);
    }
  }, [id]);

  // Initialize dropdown states for containers
  useEffect(() => {
    const initialSealTypeDropdown = {};
    const initialProductNameDropdown = {};
    packagingList.containers.forEach((_, index) => {
      if (!(index in showSealTypeDropdown)) {
        initialSealTypeDropdown[index] = false;
      }
      if (!(index in showProductNameDropdown)) {
        initialProductNameDropdown[index] = false;
      }
    });
    if (Object.keys(initialSealTypeDropdown).length > 0) {
      setShowSealTypeDropdown((prev) => ({
        ...prev,
        ...initialSealTypeDropdown,
      }));
    }
    if (Object.keys(initialProductNameDropdown).length > 0) {
      setShowProductNameDropdown((prev) => ({
        ...prev,
        ...initialProductNameDropdown,
      }));
    }
  }, [packagingList.containers.length]);

  // Add state to track if order was just selected
  const [justSelectedOrderId, setJustSelectedOrderId] = useState(null);

  const handleOrderSelect = async (orderId, orderData) => {
    console.log('Order selected:', { orderId, orderData });
    setJustSelectedOrderId(orderId);
    setSelectedOrder(orderData);
    setOrderDetails(orderData);

    // Fetch PI products for selected order
    if (orderData.piInvoiceId || orderData.id) {
      await fetchPIProducts(orderData.piInvoiceId || orderData.id);
    }
  };

  useEffect(() => {
    if (orderDetails) {
      loadPackagingData();
    }
  }, [orderDetails]);

  const fetchOrderDetails = async () => {
    if (!id || id === 'create') {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await dispatch(getOrderById(id)).unwrap();
      const order = response.data || response; // Handle both response formats

      console.log('🔍 Order Details Loaded:', {
        orderId: order.id,
        packingListId: order.packingListId,
        piInvoiceId: order.piInvoiceId,
        hasPackingListId: !!order.packingListId,
        fullOrder: order,
      });

      setOrderDetails(order);

      // Fetch PI products if PI exists
      if (order.piInvoiceId || order.id) {
        await fetchPIProducts(order.piInvoiceId || order.id);
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast.error(error || 'Failed to fetch order details');
      navigate('/orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchPIProducts = async (piId) => {
    try {
      console.log('🔍 Fetching PI products for piId:', piId);
      const response = await dispatch(getPiInvoiceById(piId)).unwrap();
      const piDataResponse = response.data || response;
      console.log('📦 PI Data Response:', piDataResponse);
      setPiData(piDataResponse);

      const products =
        piDataResponse.products ||
        piDataResponse.piProducts ||
        piDataResponse.items ||
        piDataResponse.lineItems ||
        [];
      console.log('🛍️ Extracted products:', products);
      setPiProducts(products);

      // Auto-create containers based on PI container count
      const containerCount =
        piDataResponse.numberOfContainers || piDataResponse.containerCount || 1;
      if (containerCount > 1) {
        const containers = Array.from(
          { length: containerCount },
          (_, index) => ({
            containerNumber: '',
            sealType: '',
            sealNumber: '',
            products: [],
            totalNoOfBoxes: '',
            totalNetWeight: '',
            totalGrossWeight: '',
            totalMeasurement: '',
            totalSquareMeters: '',
            totalPallets: '',
          })
        );

        setPackagingList((prev) => ({
          ...prev,
          containers,
          totalContainers: containerCount,
        }));
      }
    } catch (error) {
      console.error('Error fetching PI products:', error);
    }
  };

  const loadPackagingData = async () => {
    if (!orderDetails) return;

    // Try packingListId first, then piInvoiceId, then order id
    const packingId =
      orderDetails.packingListId || orderDetails.piInvoiceId || orderDetails.id;

    if (!packingId) {
      console.log(
        '🆕 No packingListId/piInvoiceId found - this is a new packing list'
      );
      return; // Don't load anything, keep default empty state
    }

    try {
      console.log(
        '📥 Loading existing packing data for ID:',
        packingId,
        '(type:',
        orderDetails.packingListId ? 'packingListId' : 'piInvoiceId',
        ')'
      );

      const rawPackingResponse = await dispatch(
        getPackingListById(packingId)
      ).unwrap();
      const rawPackingData = rawPackingResponse.data || rawPackingResponse;

      let containerData = [];
      let detailedPackingData = {};

      if (
        rawPackingData.pi &&
        rawPackingData.pi.packingLists &&
        rawPackingData.pi.packingLists.length > 0
      ) {
        const packagingStep = rawPackingData.pi.packingLists[0];
        if (packagingStep.notes) {
          try {
            // Handle both string and object cases
            detailedPackingData = packagingStep.notes;
            if (typeof detailedPackingData === 'string') {
              detailedPackingData = JSON.parse(detailedPackingData);
            }
            containerData = detailedPackingData.containers || [];
            console.log('Parsed container data:', containerData);
          } catch (e) {
            console.error('Failed to parse packaging notes:', e);
          }
        }
      }

      // Check if we have meaningful packing data
      const hasMeaningfulData =
        containerData.length > 0 &&
        containerData.some(
          (container) =>
            (container.containerNumber && container.containerNumber.trim()) ||
            (container.products && container.products.length > 0) ||
            (container.totalNoOfBoxes &&
              parseFloat(container.totalNoOfBoxes) > 0) ||
            (container.totalNetWeight &&
              parseFloat(container.totalNetWeight) > 0)
        );

      // Only load data if we have meaningful data
      if (hasMeaningfulData) {
        const loadedData = {
          id: rawPackingData.id || packingId,
          exportInvoiceNo:
            rawPackingData.exportInvoiceNo ||
            detailedPackingData.exportInvoiceNo ||
            '',
          exportInvoiceDate: rawPackingData.exportInvoiceDate
            ? new Date(rawPackingData.exportInvoiceDate)
                .toISOString()
                .split('T')[0]
            : '',
          buyerReference:
            rawPackingData.buyerReference ||
            detailedPackingData.buyerReference ||
            '',
          buyerDetails:
            rawPackingData.buyerDetails ||
            detailedPackingData.buyerDetails ||
            '',
          sellerInfo:
            rawPackingData.sellerInfo || detailedPackingData.sellerInfo || '',
          containers:
            containerData.length > 0
              ? containerData.map((container) => ({
                  containerNumber: container.containerNumber || '',
                  sealType: container.sealType || '',
                  sealNumber: container.sealNumber || '',
                  products: (container.products || []).map((product) => ({
                    ...product,
                    packedQuantity:
                      product.packedQuantity || product.quantity || '',
                    unit: product.unit || 'Box',
                    productData: product.productData || null,
                  })),
                  totalNoOfBoxes: (container.totalNoOfBoxes || '').toString(),
                  totalNetWeight: (container.totalNetWeight || '').toString(),
                  totalGrossWeight: (
                    container.totalGrossWeight || ''
                  ).toString(),
                  totalMeasurement: (
                    container.totalMeasurement || ''
                  ).toString(),
                  totalSquareMeters: (
                    container.totalSquareMeters || ''
                  ).toString(),
                  totalPallets: (container.totalPallets || '').toString(),
                }))
              : [
                  {
                    containerNumber: '',
                    sealType: '',
                    sealNumber: '',
                    products: [],
                    totalNoOfBoxes: '',
                    totalNetWeight: '',
                    totalGrossWeight: '',
                    totalMeasurement: '',
                    totalSquareMeters: '',
                    totalPallets: '',
                  },
                ],
          notes: rawPackingData.notes || detailedPackingData.notes || '',
          totalBoxes:
            detailedPackingData.totalBoxes || rawPackingData.totalBoxes || 0,
          totalNetWeight:
            detailedPackingData.totalNetWeight ||
            rawPackingData.totalNetWeight ||
            0,
          totalGrossWeight:
            detailedPackingData.totalGrossWeight ||
            rawPackingData.totalGrossWeight ||
            0,
          totalVolume:
            detailedPackingData.totalVolume || rawPackingData.totalVolume || 0,
          totalSquareMeters:
            detailedPackingData.totalSquareMeters ||
            rawPackingData.totalSquareMeters ||
            0,
          totalPallets:
            detailedPackingData.totalPallets ||
            rawPackingData.totalPallets ||
            0,
          totalContainers:
            detailedPackingData.totalContainers ||
            rawPackingData.totalContainers ||
            0,
          dateOfIssue: rawPackingData.dateOfIssue
            ? new Date(rawPackingData.dateOfIssue).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0],
          isExisting: true,
        };

        // Load showToTheOrder from existing data - check notes first, then fallback to entry level
        const showToTheOrderValue =
          detailedPackingData.showToTheOrder !== undefined
            ? detailedPackingData.showToTheOrder
            : rawPackingData.showToTheOrder;
        if (showToTheOrderValue !== undefined) {
          setShowToTheOrder(showToTheOrderValue);
        }

        console.log('✅ LoadPackagingData - Found meaningful data:', {
          containerDataLength: containerData.length,
          hasMeaningfulData,
          isExisting: true,
          rawPackingDataId: rawPackingData.id,
          usedPackingId: packingId,
          orderPackingListId: orderDetails.packingListId,
          orderPiInvoiceId: orderDetails.piInvoiceId,
        });

        const calculatedData = calculateTotals(loadedData);

        // Calculate missing totals from backend data if not present
        if (
          calculatedData.totalSquareMeters === 0 &&
          calculatedData.totalPallets === 0
        ) {
          let backendSquareMeters = 0;
          let backendPallets = 0;

          // Calculate from container data
          containerData.forEach((container) => {
            if (container.totalSquareMeters) {
              backendSquareMeters +=
                parseFloat(container.totalSquareMeters) || 0;
            }
            if (container.totalPallets) {
              backendPallets += parseFloat(container.totalPallets) || 0;
            }

            // If container totals not available, calculate from products
            if (container.products) {
              container.products.forEach((product) => {
                if (
                  product.unit?.toLowerCase() === 'square meter' ||
                  product.unit?.toLowerCase() === 'sqm'
                ) {
                  backendSquareMeters +=
                    parseFloat(product.packedQuantity) || 0;
                }
                if (product.noOfPallets) {
                  backendPallets += parseFloat(product.noOfPallets) || 0;
                }
              });
            }
          });

          calculatedData.totalSquareMeters = backendSquareMeters;
          calculatedData.totalPallets = backendPallets;
        }

        setPackagingList(calculatedData);
      } else {
        console.log(
          '⚠️ LoadPackagingData - No meaningful data found, keeping default state'
        );
      }
    } catch (error) {
      console.error('Error loading packaging data:', error);
      console.log('🆕 Treating as new packing list due to load error');
    }
  };

  const handlePackagingInputChange = (e) => {
    const { name, value } = e.target;
    setPackagingList((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const addContainer = () => {
    const updatedContainers = [
      ...packagingList.containers,
      {
        containerNumber: '',
        sealType: '',
        sealNumber: '',
        products: [],
        totalNoOfBoxes: '',
        totalNetWeight: '',
        totalGrossWeight: '',
        totalMeasurement: '',
        totalSquareMeters: '',
        totalPallets: '',
      },
    ];

    const calculatedData = calculateTotals({
      ...packagingList,
      containers: updatedContainers,
    });
    setPackagingList(calculatedData);
  };

  const removeContainer = (index) => {
    if (packagingList.containers.length > 1) {
      const updatedContainers = packagingList.containers.filter(
        (_, i) => i !== index
      );

      const calculatedData = calculateTotals({
        ...packagingList,
        containers: updatedContainers,
      });
      setPackagingList(calculatedData);
    }
  };

  const handleContainerChange = (index, field, value) => {
    const updatedContainers = [...packagingList.containers];
    updatedContainers[index][field] = value;

    const calculatedData = calculateTotals({
      ...packagingList,
      containers: updatedContainers,
    });
    setPackagingList(calculatedData);
  };

  // Product form state
  const [productForm, setProductForm] = useState({
    productName: '',
    hsnCode: '',
    quantity: '',
    quantityUnit: 'Pcs',
    noOfBoxes: '',
    noOfPallets: '',
    netWeight: '',
    grossWeight: '',
    measurement: '',
    packedQuantity: '',
    unit: 'Box',
    perBoxWeight: '',
    productData: null,
  });

  // Edit mode state
  const [editMode, setEditMode] = useState({
    isEditing: false,
    containerIndex: -1,
    productIndex: -1,
  });

  const clearProductForm = () => {
    setProductForm({
      productName: '',
      hsnCode: '',
      quantity: '',
      quantityUnit: 'Pcs',
      noOfBoxes: '',
      noOfPallets: '',
      netWeight: '',
      grossWeight: '',
      measurement: '',
      packedQuantity: '',
      unit: 'Box',
      perBoxWeight: '',
      productData: null,
    });
    setEditMode({ isEditing: false, containerIndex: -1, productIndex: -1 });
  };

  const addProductToContainer = (containerIndex) => {
    if (!productForm.productName || !productForm.packedQuantity) {
      toast.error('Please select a product and enter packed quantity');
      return;
    }

    const updatedContainers = [...packagingList.containers];

    if (editMode.isEditing) {
      // Update existing product
      updatedContainers[editMode.containerIndex].products[
        editMode.productIndex
      ] = { ...productForm };
      toast.success('Product updated successfully!');
    } else {
      // Add new product
      if (!updatedContainers[containerIndex].products) {
        updatedContainers[containerIndex].products = [];
      }
      updatedContainers[containerIndex].products.push({ ...productForm });
      toast.success('Product added successfully!');
    }

    const calculatedData = calculateTotals({
      ...packagingList,
      containers: updatedContainers,
    });
    setPackagingList(calculatedData);

    // Clear the form
    clearProductForm();
  };

  const removeProductFromContainer = (containerIndex, productIndex) => {
    const updatedContainers = [...packagingList.containers];
    updatedContainers[containerIndex].products.splice(productIndex, 1);

    const calculatedData = calculateTotals({
      ...packagingList,
      containers: updatedContainers,
    });
    setPackagingList(calculatedData);
  };

  const updateProductInContainer = (
    containerIndex,
    productIndex,
    field,
    value
  ) => {
    const updatedContainers = [...packagingList.containers];

    // Ensure container and product exist
    if (!updatedContainers[containerIndex]) {
      console.error('Container not found at index:', containerIndex);
      return;
    }

    if (!updatedContainers[containerIndex].products) {
      updatedContainers[containerIndex].products = [];
    }

    if (!updatedContainers[containerIndex].products[productIndex]) {
      console.error('Product not found at index:', productIndex);
      return;
    }

    updatedContainers[containerIndex].products[productIndex][field] = value;

    // If weight fields are manually updated, recalculate totals
    if (
      field === 'netWeight' ||
      field === 'grossWeight' ||
      field === 'noOfBoxes' ||
      field === 'measurement'
    ) {
      const calculatedData = calculateTotals({
        ...packagingList,
        containers: updatedContainers,
      });
      setPackagingList(calculatedData);
    } else {
      const calculatedData = calculateTotals({
        ...packagingList,
        containers: updatedContainers,
      });
      setPackagingList(calculatedData);
    }
  };

  const calculateProductValues = (
    containerIndex,
    productIndex,
    packedQuantity,
    productData
  ) => {
    if (!packedQuantity || !productData) {
      return;
    }

    const qty = parseFloat(packedQuantity);
    const unit = productData.unit || 'Box';

    // Get current product from containers
    const currentProduct =
      packagingList.containers[containerIndex].products[productIndex];

    let boxesNeeded = 1;
    let netWeightKg = 0;
    let grossWeightKg = 0;
    let volumeM3 = 0;

    // Calculate based on unit type
    if (unit.toLowerCase() === 'box') {
      // If unit is Box, then packed quantity is number of boxes
      boxesNeeded = qty;

      // Calculate weight from PI data
      const totalWeightFromPI = productData.totalWeight || 0; // Net weight in kg from PI
      const piQuantity = productData.quantity || 1;

      // Calculate per box net weight
      const netWeightPerBox = totalWeightFromPI / piQuantity;
      netWeightKg = qty * netWeightPerBox;

      // Calculate gross weight using actual box weight
      const product = productData.product || productData;
      const boxWeightGrams = product.packagingMaterialWeight; // grams per box
      const boxWeightKg = boxWeightGrams / 1000; // Convert to kg

      grossWeightKg = netWeightKg + qty * boxWeightKg;
    } else {
      // If unit is Pcs, calculate boxes needed
      const product = productData.product || productData;
      const packagingData = product.packagingHierarchyData?.dynamicFields || {};
      const piecesPerPack =
        packagingData.PiecesPerPack || packagingData.PiecesPerPackage || 50;
      const packPerBox =
        packagingData.PackPerBox || packagingData.PackagePerBox || 40;
      const unitWeight = product.unitWeight || 8; // Weight per piece in grams

      const piecesPerBox = piecesPerPack * packPerBox;
      boxesNeeded = Math.ceil(qty / piecesPerBox);

      // Calculate net weight (product weight only)
      const netWeightGrams = qty * unitWeight;
      netWeightKg = netWeightGrams / 1000;

      // Calculate gross weight (net weight + actual box weight)
      const boxWeightGrams =
        product.packagingMaterialWeight || product.boxWeight || 700; // grams per box
      const boxWeightKg = boxWeightGrams / 1000; // Convert to kg

      grossWeightKg = netWeightKg + boxesNeeded * boxWeightKg;
    }

    // Calculate volume if available
    const product = productData.product || productData;
    if (product.packagingVolume) {
      volumeM3 = boxesNeeded * product.packagingVolume;
    } else {
      // Default volume calculation (0.0055 m³ per box as shown in your data)
      volumeM3 = boxesNeeded * 0.0055;
    }

    // Update the product with calculated values
    const updatedContainers = [...packagingList.containers];
    const productToUpdate =
      updatedContainers[containerIndex].products[productIndex];

    productToUpdate.noOfBoxes = boxesNeeded.toString();
    productToUpdate.netWeight = netWeightKg.toFixed(2);
    productToUpdate.grossWeight = grossWeightKg.toFixed(2);
    productToUpdate.measurement = volumeM3.toFixed(4);
    // Set per box weight for future modifications
    if (boxesNeeded > 0) {
      productToUpdate.perBoxWeight = (netWeightKg / boxesNeeded).toFixed(2);
    }

    const calculatedData = calculateTotals({
      ...packagingList,
      containers: updatedContainers,
    });

    setPackagingList(calculatedData);
  };

  const calculateTotals = (data) => {
    let totalBoxes = 0;
    let totalNetWeight = 0;
    let totalGrossWeight = 0;
    let totalVolume = 0;
    let totalSquareMeters = 0;
    let totalPallets = 0;
    const totalContainers = data.containers.length;

    const updatedContainers = data.containers.map((container) => {
      let containerBoxes = 0;
      let containerNetWeight = 0;
      let containerGrossWeight = 0;
      let containerMeasurement = 0;
      let containerSquareMeters = 0;
      let containerPallets = 0;

      container.products.forEach((product) => {
        const boxes = parseFloat(product.noOfBoxes) || 0;
        const netWeight = parseFloat(product.netWeight) || 0;
        const grossWeight = parseFloat(product.grossWeight) || 0;
        const measurement = parseFloat(product.measurement) || 0;
        const pallets = parseFloat(product.noOfPallets) || 0;

        // Add square meters for tiles products
        if (
          product.unit?.toLowerCase() === 'square meter' ||
          product.unit?.toLowerCase() === 'sqm'
        ) {
          const sqm = parseFloat(product.packedQuantity) || 0;
          containerSquareMeters += sqm;
        }

        containerBoxes += boxes;
        containerNetWeight += netWeight;
        containerGrossWeight += grossWeight;
        containerMeasurement += measurement;
        containerPallets += pallets;
      });

      totalBoxes += containerBoxes;
      totalNetWeight += containerNetWeight;
      totalGrossWeight += containerGrossWeight;
      totalVolume += containerMeasurement;
      totalSquareMeters += containerSquareMeters;
      totalPallets += containerPallets;

      return {
        ...container,
        totalNoOfBoxes: containerBoxes.toString(),
        totalNetWeight: containerNetWeight.toFixed(2),
        totalGrossWeight: containerGrossWeight.toFixed(2),
        totalMeasurement: containerMeasurement.toFixed(2),
        totalSquareMeters: containerSquareMeters.toFixed(2),
        totalPallets: containerPallets.toString(),
      };
    });

    return {
      ...data,
      containers: updatedContainers,
      totalBoxes,
      totalNetWeight: parseFloat(totalNetWeight.toFixed(2)),
      totalGrossWeight: parseFloat(totalGrossWeight.toFixed(2)),
      totalVolume: parseFloat(totalVolume.toFixed(2)),
      totalSquareMeters: parseFloat(totalSquareMeters.toFixed(2)),
      totalPallets,
      totalContainers,
    };
  };

  const savePackagingList = async () => {
    try {
      setSaving(true);
      if (!orderDetails && !selectedOrder) {
        toast.error('Please select an order first');
        return;
      }

      const currentOrder = orderDetails || selectedOrder;
      if (!currentOrder?.piInvoiceId) {
        toast.error('No PI Invoice associated with this order');
        return;
      }

      const packagingData = {
        ...packagingList,
        piId: currentOrder.piInvoiceId,
        showToTheOrder: showToTheOrder,
      };

      const hasExistingData =
        packagingList.isExisting ||
        (packagingList.id &&
          packagingList.containers.some(
            (container) =>
              container.containerNumber ||
              container.products.length > 0 ||
              container.totalNoOfBoxes ||
              container.totalNetWeight
          ));

      if (hasExistingData) {
        const updateId = packagingList.id || currentOrder.piInvoiceId;
        const result = await dispatch(
          updatePackingList({
            id: updateId,
            packingData: packagingData,
          })
        ).unwrap();
        toast.success(result.message);
      } else {
        try {
          const result = await dispatch(
            createPackingList(packagingData)
          ).unwrap();
          const createdId = result.data?.id || result.data;

          setPackagingList((prev) => ({
            ...prev,
            id: createdId,
            isExisting: true,
          }));

          // Update order with packingListId for future updates
          if (createdId && currentOrder?.id) {
            try {
              await dispatch(
                updateOrder({
                  id: currentOrder.id,
                  data: { packingListId: createdId },
                })
              ).unwrap();
              console.log('✅ Order updated with packingListId:', createdId);

              // Update local orderDetails state
              setOrderDetails((prev) => ({
                ...prev,
                packingListId: createdId,
              }));
            } catch (updateError) {
              console.warn(
                '⚠️ Failed to update order with packingListId:',
                updateError
              );
            }
          }

          toast.success(result.message);
        } catch (createError) {
          if (createError.response?.data?.existingPackingListId) {
            const existingId = createError.response.data.existingPackingListId;
            const updateResult = await dispatch(
              updatePackingList({
                id: existingId,
                packingData: packagingData,
              })
            ).unwrap();
            setPackagingList((prev) => ({
              ...prev,
              id: existingId,
              isExisting: true,
            }));
            toast.success(updateResult.message);
          } else {
            throw createError;
          }
        }
      }

      setTimeout(() => {
        navigate('/orders/packing-lists');
      }, 1500);
    } catch (error) {
      console.error('Error saving packaging list:', error);
      toast.error(error || 'Failed to save packing list');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-2 lg:p-6 xl:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-3 lg:mb-6">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-3 lg:p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate('/orders/packing-lists')}
                  className="p-3 rounded-lg bg-slate-700 text-white hover:bg-slate-800 transition-all duration-300 hover:shadow-lg"
                >
                  <HiArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-2xl lg:text-3xl xl:text-4xl font-bold text-slate-800 mb-1">
                    {isEdit ? 'Edit Packing List' : 'Create Packing List'}
                  </h1>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 lg:p-8 xl:p-10">
          <div className="space-y-4 lg:space-y-8">
            {/* Order Selection for new packing lists */}
            {!isEdit && (
              <div className="bg-slate-50 p-4 lg:p-8 rounded-lg border border-slate-200">
                <div className="w-full lg:max-w-2xl" ref={orderSelectorRef}>
                  <OrderSelector
                    selectedOrderId={
                      justSelectedOrderId ||
                      selectedOrder?.id ||
                      orderDetails?.id ||
                      null
                    }
                    onOrderSelect={handleOrderSelect}
                    placeholder="Select Order for Packing List"
                    filterType="packingList"
                  />
                </div>
              </div>
            )}

            {/* Packaging List Header */}
            <div className="bg-slate-50 p-4 lg:p-8 rounded-lg border border-slate-200">
              <div className="w-full">
                <div className="flex flex-col gap-3 lg:gap-4">
                  <div>
                    <h3 className="text-lg lg:text-2xl font-semibold text-slate-700">
                      Packaging List Details
                    </h3>
                    <div className="text-xs lg:text-sm text-slate-600 mt-2 lg:hidden">
                      PI Containers:{' '}
                      {piData?.numberOfContainers ||
                        piData?.containerCount ||
                        'N/A'}{' '}
                      | Current: {packagingList.containers.length} | Boxes:{' '}
                      {packagingList.totalBoxes}
                    </div>
                    <div className="hidden lg:grid lg:grid-cols-3 gap-4 mt-4 text-base text-slate-600">
                      <div className="bg-white p-3 rounded border">
                        <span className="font-medium">PI Containers:</span>
                        <div className="text-lg font-bold text-slate-800">
                          {piData?.numberOfContainers ||
                            piData?.containerCount ||
                            'N/A'}
                        </div>
                      </div>
                      <div className="bg-white p-3 rounded border">
                        <span className="font-medium">Current:</span>
                        <div className="text-lg font-bold text-slate-800">
                          {packagingList.containers.length}
                        </div>
                      </div>
                      <div className="bg-white p-3 rounded border">
                        <span className="font-medium">Total Boxes:</span>
                        <div className="text-lg font-bold text-slate-800">
                          {packagingList.totalBoxes}
                        </div>
                      </div>
                    </div>
                    {piData?.numberOfContainers &&
                      packagingList.containers.length !==
                        piData.numberOfContainers && (
                        <div className="text-xs lg:text-base text-orange-600 mt-2 lg:mt-4 p-2 lg:p-4 bg-orange-50 rounded border border-orange-200">
                          ⚠️ Container count mismatch! PI has{' '}
                          {piData.numberOfContainers} containers, but form has{' '}
                          {packagingList.containers.length}
                        </div>
                      )}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      type="button"
                      onClick={addContainer}
                      className="flex items-center justify-center gap-2 px-4 py-3 lg:px-6 lg:py-4 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-all duration-300 shadow-md hover:shadow-lg font-medium text-sm lg:text-base"
                    >
                      <HiPlus className="w-4 h-4 lg:w-5 lg:h-5" />
                      <span className="lg:hidden">Add Container</span>
                      <span className="hidden lg:inline">Add Container</span>
                      {piData?.numberOfContainers && (
                        <span className="text-xs bg-slate-500 px-2 py-1 rounded">
                          {packagingList.containers.length}/
                          {piData.numberOfContainers}
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Containers */}
            {packagingList.containers.map((container, containerIndex) => (
              <div
                key={containerIndex}
                className="w-full border border-slate-200 rounded-lg p-4 lg:p-8 bg-slate-50"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4 lg:mb-8">
                  <h4 className="text-base lg:text-2xl font-semibold text-slate-700">
                    Container {containerIndex + 1}
                  </h4>
                  {packagingList.containers.length > 1 && (
                    <button
                      onClick={() => removeContainer(containerIndex)}
                      className="inline-flex items-center px-2 py-2 lg:px-4 lg:py-3 text-xs lg:text-sm font-medium text-white bg-slate-700 border  rounded-md lg:rounded-lg hover:bg-slate-800  focus:outline-none focus:ring-2  transition-all duration-200 shadow-sm hover:shadow-md w-full sm:w-auto justify-center sm:justify-start"
                    >
                      <HiTrash className="w-4 h-4 " />
                    </button>
                  )}
                </div>

                {/* Container Details */}
                <div className="space-y-4 lg:space-y-6 lg:grid lg:grid-cols-3 lg:gap-6 mb-4 lg:mb-8">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-3">
                      Container Number
                    </label>
                    <input
                      type="text"
                      value={container.containerNumber}
                      onChange={(e) =>
                        handleContainerChange(
                          containerIndex,
                          'containerNumber',
                          e.target.value
                        )
                      }
                      placeholder="Enter container number"
                      className="w-full px-4 py-3 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-slate-200 focus:border-slate-500 transition-all duration-300 shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-3">
                      Seal Type
                    </label>
                    <div className="relative">
                      <div
                        className="w-full px-4 py-3 border border-gray-300 bg-white rounded-lg cursor-pointer flex items-center justify-between transition-all duration-300 shadow-sm hover:border-slate-400"
                        onClick={() => {
                          console.log(
                            'Direct Seal Type click for container:',
                            containerIndex
                          );
                          console.log(
                            'Current showSealTypeDropdown state:',
                            showSealTypeDropdown
                          );
                          setShowSealTypeDropdown((prev) => {
                            const newState = {
                              ...prev,
                              [containerIndex]: !prev[containerIndex],
                            };
                            console.log('Setting new state:', newState);
                            return newState;
                          });
                        }}
                      >
                        <span className="text-sm text-slate-500">
                          {container.sealType || 'Select Seal Type'}
                        </span>
                        <HiChevronDown className="w-4 h-4 text-slate-400" />
                      </div>

                      {showSealTypeDropdown[containerIndex] && (
                        <div className="absolute z-[9999] w-full bg-white border border-gray-200 rounded-lg shadow-xl mt-1">
                          <div className="max-h-60 overflow-y-auto">
                            <div
                              className="px-4 py-3 hover:bg-slate-50 cursor-pointer text-sm transition-colors duration-150"
                              onClick={() => {
                                handleContainerChange(
                                  containerIndex,
                                  'sealType',
                                  'self seal'
                                );
                                setShowSealTypeDropdown((prev) => ({
                                  ...prev,
                                  [containerIndex]: false,
                                }));
                              }}
                            >
                              Self Seal
                            </div>
                            <div
                              className="px-4 py-3 hover:bg-slate-50 cursor-pointer text-sm transition-colors duration-150"
                              onClick={() => {
                                handleContainerChange(
                                  containerIndex,
                                  'sealType',
                                  'line seal'
                                );
                                setShowSealTypeDropdown((prev) => ({
                                  ...prev,
                                  [containerIndex]: false,
                                }));
                              }}
                            >
                              Line Seal
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-3">
                      Seal Number
                    </label>
                    <input
                      type="text"
                      value={container.sealNumber}
                      onChange={(e) =>
                        handleContainerChange(
                          containerIndex,
                          'sealNumber',
                          e.target.value
                        )
                      }
                      placeholder="Enter seal number"
                      className="w-full px-4 py-3 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-slate-200 focus:border-slate-500 transition-all duration-300 shadow-sm"
                    />
                  </div>
                </div>

                {/* Single Product Form */}
                <div
                  className="w-full p-4 lg:p-8 border border-slate-200 rounded-lg bg-white shadow-sm"
                  data-container={containerIndex}
                >
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-2 lg:gap-0 mb-3">
                    <div className="flex flex-col">
                      <span className="text-sm lg:text-base font-medium text-gray-900 dark:text-white">
                        {editMode.isEditing
                          ? 'Edit Product'
                          : `Add Product to Container ${containerIndex + 1}`}
                      </span>
                      {productForm.productName && (
                        <span className="text-xs lg:text-sm text-gray-500 mt-1">
                          ({productForm.productName})
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => clearProductForm()}
                        className="flex items-center justify-center
             text-white bg-slate-700
             w-10 h-10 px-10
             rounded-xl text-sm font-medium"
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4 lg:space-y-6">
                    {/* Row 1: Product Name, HSN Code, PI Quantity */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-3">
                          Product Name
                        </label>
                        <div
                          className="relative"
                          ref={(el) =>
                            (productNameRefs.current[containerIndex] = el)
                          }
                        >
                          <div
                            className="w-full px-4 py-3 border border-gray-300 bg-white rounded-lg cursor-pointer flex items-center justify-between transition-all duration-300 shadow-sm hover:border-slate-400"
                            onClick={() => {
                              console.log(
                                'Product Name dropdown toggle for container:',
                                containerIndex
                              );
                              console.log(
                                'Current state:',
                                showProductNameDropdown[containerIndex]
                              );
                              setShowProductNameDropdown((prev) => {
                                const newState = {
                                  ...prev,
                                  [containerIndex]: !prev[containerIndex],
                                };
                                console.log('New state:', newState);
                                return newState;
                              });
                            }}
                          >
                            <span className="text-sm text-slate-500">
                              {productForm.productName ||
                                'Select Product from PI'}
                            </span>
                            <HiChevronDown className="w-4 h-4 text-slate-400" />
                          </div>

                          {showProductNameDropdown[containerIndex] && (
                            <div className="absolute z-[9999] w-full bg-white border border-gray-200 rounded-lg shadow-xl mt-1">
                              <div className="max-h-60 overflow-y-auto">
                                {(() => {
                                  console.log(
                                    'Rendering product dropdown for container:',
                                    containerIndex
                                  );
                                  console.log('piProducts:', piProducts);
                                  console.log(
                                    'piProducts length:',
                                    piProducts.length
                                  );
                                  return null;
                                })()}
                                {piProducts.map((piProduct, idx) => {
                                  const productName =
                                    piProduct.name ||
                                    piProduct.productName ||
                                    `Product ${idx + 1}`;
                                  const quantity =
                                    piProduct.quantity || piProduct.qty || '';
                                  const unit = piProduct.unit || 'Box';

                                  return (
                                    <div
                                      key={idx}
                                      className="px-4 py-3 hover:bg-slate-50 cursor-pointer text-sm transition-colors duration-150"
                                      onClick={() => {
                                        const selectedProduct = piProducts.find(
                                          (p) =>
                                            (p.name || p.productName) ===
                                            productName
                                        );

                                        setProductForm((prev) => ({
                                          ...prev,
                                          productName,
                                          quantity:
                                            selectedProduct?.quantity ||
                                            selectedProduct?.qty ||
                                            '',
                                          unit: selectedProduct?.unit || 'Box',
                                          hsnCode:
                                            selectedProduct?.category
                                              ?.hsnCode ||
                                            selectedProduct?.subcategory
                                              ?.hsnCode ||
                                            '',
                                          productData: selectedProduct,
                                          packedQuantity: '',
                                        }));

                                        setShowProductNameDropdown((prev) => ({
                                          ...prev,
                                          [containerIndex]: false,
                                        }));
                                      }}
                                    >
                                      {productName} (Qty: {quantity} {unit})
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-3">
                          HSN Code
                        </label>
                        <input
                          type="text"
                          value={productForm.hsnCode || ''}
                          onChange={(e) =>
                            setProductForm((prev) => ({
                              ...prev,
                              hsnCode: e.target.value,
                            }))
                          }
                          placeholder="HSN Code"
                          className="w-full px-4 py-3 border border-gray-300 bg-gray-100 rounded-lg focus:ring-2 focus:ring-slate-200 focus:border-slate-500 transition-all duration-300 shadow-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-3">
                          PI Quantity ➡️ Packed
                        </label>
                        <div className="flex items-center gap-2">
                          <div className="flex-1">
                            <input
                              type="text"
                              value={`${productForm.quantity || ''} ${productForm.unit || 'Box'}`}
                              readOnly
                              className="w-full px-4 py-3 border border-gray-300 bg-gray-100 rounded-lg focus:ring-2 focus:ring-slate-200 focus:border-slate-500 transition-all duration-300 shadow-sm"
                              placeholder="PI Qty"
                            />
                          </div>
                          <span className="text-gray-500">➡️</span>
                          <div className="flex-1">
                            <input
                              type="number"
                              value={productForm.packedQuantity || ''}
                              onChange={(e) => {
                                const packedQty = e.target.value;
                                setProductForm((prev) => ({
                                  ...prev,
                                  packedQuantity: packedQty,
                                }));

                                // Auto-calculate based on packed quantity
                                if (packedQty && productForm.productData) {
                                  const qty = parseFloat(packedQty);
                                  const unit =
                                    productForm.productData.unit || 'Box';
                                  let boxesNeeded = 1;
                                  let netWeightKg = 0;
                                  let grossWeightKg = 0;
                                  let volumeM3 = 0;

                                  if (unit.toLowerCase() === 'box') {
                                    boxesNeeded = qty;
                                    const totalWeightFromPI =
                                      productForm.productData.totalWeight || 0;
                                    const piQuantity =
                                      productForm.productData.quantity || 1;
                                    const netWeightPerBox =
                                      totalWeightFromPI / piQuantity;
                                    netWeightKg = qty * netWeightPerBox;
                                    const product =
                                      productForm.productData.product ||
                                      productForm.productData;
                                    const boxWeightGrams =
                                      product.packagingMaterialWeight || 700;
                                    const boxWeightKg = boxWeightGrams / 1000;
                                    grossWeightKg =
                                      netWeightKg + qty * boxWeightKg;
                                  } else if (
                                    unit.toLowerCase() === 'square meter' ||
                                    unit.toLowerCase() === 'sqm'
                                  ) {
                                    // Tiles calculation logic - Box weight based
                                    const product =
                                      productForm.productData.product ||
                                      productForm.productData;
                                    const packagingData =
                                      product.packagingHierarchyData
                                        ?.dynamicFields || {};

                                    const sqmPerBox =
                                      packagingData['Square MeterPerBox'];
                                    const boxPerPallet =
                                      packagingData['BoxPerPallet'];
                                    const netWeightPerBox =
                                      packagingData['weightPerBox'] ||
                                      product.grossWeightPerBox -
                                        product.packagingMaterialWeight ||
                                      930; // Net weight per box in kg

                                    boxesNeeded = Math.ceil(qty / sqmPerBox);
                                    const palletsNeeded = Math.ceil(
                                      boxesNeeded / boxPerPallet
                                    );

                                    // Calculate net weight: boxes × per box weight (simple calculation)
                                    const totalWeightFromPI =
                                      productForm.productData.totalWeight || 0;
                                    const calculatedBoxes =
                                      productForm.productData.calculatedBoxes ||
                                      boxesNeeded;
                                    const perBoxWeightFromPI =
                                      calculatedBoxes > 0
                                        ? Math.round(
                                            totalWeightFromPI / calculatedBoxes
                                          )
                                        : 31;
                                    netWeightKg =
                                      boxesNeeded * perBoxWeightFromPI;

                                    // Calculate gross weight: net weight + (pallets × packaging weight)
                                    const packagingWeightPerPallet =
                                      product.packagingMaterialWeight; // kg per pallet
                                    grossWeightKg =
                                      netWeightKg +
                                      palletsNeeded * packagingWeightPerPallet;

                                    // Add pallet to form
                                    setProductForm((prev) => ({
                                      ...prev,
                                      noOfPallets: palletsNeeded.toString(),
                                    }));
                                  } else {
                                    const product =
                                      productForm.productData.product ||
                                      productForm.productData;
                                    const packagingData =
                                      product.packagingHierarchyData
                                        ?.dynamicFields || {};
                                    const piecesPerPack =
                                      packagingData.PiecesPerPack ||
                                      packagingData.PiecesPerPackage ||
                                      50;
                                    const packPerBox =
                                      packagingData.PackPerBox ||
                                      packagingData.PackagePerBox ||
                                      40;
                                    const unitWeight = product.unitWeight || 8;
                                    const piecesPerBox =
                                      piecesPerPack * packPerBox;
                                    boxesNeeded = Math.ceil(qty / piecesPerBox);
                                    const netWeightGrams = qty * unitWeight;
                                    netWeightKg = netWeightGrams / 1000;
                                    const boxWeightGrams =
                                      product.packagingMaterialWeight ||
                                      product.boxWeight ||
                                      700;
                                    const boxWeightKg = boxWeightGrams / 1000;
                                    grossWeightKg =
                                      netWeightKg + boxesNeeded * boxWeightKg;
                                  }

                                  const product =
                                    productForm.productData.product ||
                                    productForm.productData;
                                  if (product.packagingVolume) {
                                    volumeM3 =
                                      boxesNeeded * product.packagingVolume;
                                  } else {
                                    volumeM3 = boxesNeeded * 0.0055;
                                  }

                                  // Calculate correct per box weight for tiles using PI data
                                  let perBoxWeightValue = '';
                                  if (
                                    unit.toLowerCase() === 'square meter' ||
                                    unit.toLowerCase() === 'sqm'
                                  ) {
                                    // Use PI data for accurate per box weight
                                    const totalWeightFromPI =
                                      productForm.productData.totalWeight || 0;
                                    const calculatedBoxes =
                                      productForm.productData.calculatedBoxes ||
                                      boxesNeeded;
                                    perBoxWeightValue =
                                      calculatedBoxes > 0
                                        ? (
                                            totalWeightFromPI / calculatedBoxes
                                          ).toFixed(2)
                                        : '';
                                  } else {
                                    perBoxWeightValue =
                                      boxesNeeded > 0
                                        ? (netWeightKg / boxesNeeded).toFixed(2)
                                        : '';
                                  }

                                  setProductForm((prev) => ({
                                    ...prev,
                                    noOfBoxes: boxesNeeded.toString(),
                                    netWeight: netWeightKg.toFixed(2),
                                    grossWeight: grossWeightKg.toFixed(2),
                                    measurement: volumeM3.toFixed(4),
                                    perBoxWeight: perBoxWeightValue,
                                  }));
                                }
                              }}
                              placeholder="Packed"
                              className="w-full px-4 py-3 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-slate-200 focus:border-slate-500 transition-all duration-300 shadow-sm"
                            />
                            <div className="text-xs text-gray-500 mt-1">
                              Unit: {productForm.unit || 'Box'}
                            </div>
                          </div>
                        </div>
                        {productForm.quantity && productForm.packedQuantity && (
                          <div
                            className={`text-xs mt-1 ${
                              parseFloat(productForm.packedQuantity) >
                              parseFloat(productForm.quantity)
                                ? 'text-red-600'
                                : parseFloat(productForm.packedQuantity) ===
                                    parseFloat(productForm.quantity)
                                  ? 'text-green-600'
                                  : 'text-yellow-600'
                            }`}
                          >
                            {parseFloat(productForm.packedQuantity) >
                            parseFloat(productForm.quantity)
                              ? `⚠️ Over by ${(
                                  parseFloat(productForm.packedQuantity) -
                                  parseFloat(productForm.quantity)
                                ).toFixed(2)}`
                              : parseFloat(productForm.packedQuantity) ===
                                  parseFloat(productForm.quantity)
                                ? '✅ Complete'
                                : `📦 Remaining: ${(
                                    parseFloat(productForm.quantity) -
                                    parseFloat(productForm.packedQuantity)
                                  ).toFixed(2)}`}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Row 2: No. of Boxes, Per Box Weight, Net Weight */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-3">
                          No. of Boxes
                        </label>
                        <input
                          type="number"
                          value={productForm.noOfBoxes}
                          onChange={(e) => {
                            setProductForm((prev) => ({
                              ...prev,
                              noOfBoxes: e.target.value,
                            }));
                            // Auto-calculate pallets for tiles
                            if (productForm.productData && e.target.value) {
                              const unit =
                                productForm.productData.unit || 'Box';
                              if (
                                unit.toLowerCase() === 'square meter' ||
                                unit.toLowerCase() === 'sqm'
                              ) {
                                const product =
                                  productForm.productData.product ||
                                  productForm.productData;
                                const packagingData =
                                  product.packagingHierarchyData
                                    ?.dynamicFields || {};
                                const boxPerPallet =
                                  packagingData['BoxPerPallet'] || 30;
                                const palletsNeeded = Math.ceil(
                                  parseFloat(e.target.value) / boxPerPallet
                                );
                                setProductForm((prev) => ({
                                  ...prev,
                                  noOfPallets: palletsNeeded.toString(),
                                }));
                              }
                            }
                            // Auto-calculate net weight if per box weight is available
                            if (productForm.perBoxWeight && e.target.value) {
                              const totalNetWeight =
                                parseFloat(e.target.value) *
                                parseFloat(productForm.perBoxWeight);
                              setProductForm((prev) => ({
                                ...prev,
                                netWeight: totalNetWeight.toFixed(2),
                              }));
                              // Auto-calculate gross weight using box weight
                              const productInfo =
                                productForm.productData?.product ||
                                productForm.productData ||
                                {};
                              const boxWeightGrams =
                                productInfo.packagingMaterialWeight ||
                                productInfo.boxWeight ||
                                700;
                              const boxWeightKg = boxWeightGrams / 1000;
                              const totalGrossWeight =
                                totalNetWeight +
                                parseFloat(e.target.value) * boxWeightKg;
                              setProductForm((prev) => ({
                                ...prev,
                                grossWeight: totalGrossWeight.toFixed(2),
                              }));
                            }
                          }}
                          placeholder="Enter number of boxes"
                          step="1"
                          className="w-full px-4 py-3 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-slate-200 focus:border-slate-500 transition-all duration-300 shadow-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-3">
                          Per Box Weight (kg)
                        </label>
                        <input
                          type="number"
                          value={productForm.perBoxWeight}
                          onChange={(e) => {
                            setProductForm((prev) => ({
                              ...prev,
                              perBoxWeight: e.target.value,
                            }));
                            // Auto-calculate net weight if boxes count is available
                            if (productForm.noOfBoxes && e.target.value) {
                              const totalNetWeight =
                                parseFloat(productForm.noOfBoxes) *
                                parseFloat(e.target.value);
                              setProductForm((prev) => ({
                                ...prev,
                                netWeight: totalNetWeight.toFixed(2),
                              }));

                              // Auto-calculate gross weight - different logic for tiles vs other products
                              const productInfo =
                                productForm.productData?.product ||
                                productForm.productData ||
                                {};
                              const unit =
                                productForm.productData?.unit || 'Box';

                              let totalGrossWeight;
                              if (
                                unit.toLowerCase() === 'square meter' ||
                                unit.toLowerCase() === 'sqm'
                              ) {
                                // For tiles: use pallets × packaging weight
                                const pallets =
                                  parseFloat(productForm.noOfPallets) || 0;
                                const packagingWeightPerPallet =
                                  productInfo.packagingMaterialWeight || 20;
                                totalGrossWeight =
                                  totalNetWeight +
                                  pallets * packagingWeightPerPallet;
                              } else {
                                // For other products: use boxes × packaging weight
                                const boxWeightGrams =
                                  productInfo.packagingMaterialWeight ||
                                  productInfo.boxWeight ||
                                  700;
                                const boxWeightKg = boxWeightGrams / 1000;
                                totalGrossWeight =
                                  totalNetWeight +
                                  parseFloat(productForm.noOfBoxes) *
                                    boxWeightKg;
                              }

                              setProductForm((prev) => ({
                                ...prev,
                                grossWeight: totalGrossWeight.toFixed(2),
                              }));
                            }
                          }}
                          placeholder="Weight per box"
                          step="0.01"
                          className="w-full px-4 py-3 border border-green-300 bg-white rounded-lg focus:ring-2 focus:ring-green-200 focus:border-green-500 transition-all duration-300 shadow-sm"
                        />
                        <div className="text-xs text-green-600 mt-1">
                          Modify box weight
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-3">
                          Net Weight (kg)
                        </label>
                        <input
                          type="number"
                          value={productForm.netWeight}
                          onChange={(e) => {
                            setProductForm((prev) => ({
                              ...prev,
                              netWeight: e.target.value,
                            }));
                            // Auto-calculate gross weight using box weight
                            if (e.target.value && productForm.productData) {
                              const netWeight = parseFloat(e.target.value);
                              const boxes =
                                parseFloat(productForm.noOfBoxes) || 0;
                              const productInfo =
                                productForm.productData.product ||
                                productForm.productData;
                              const boxWeightGrams =
                                productInfo.packagingMaterialWeight ||
                                productInfo.boxWeight ||
                                700;
                              const boxWeightKg = boxWeightGrams / 1000;
                              const grossWeight =
                                netWeight + boxes * boxWeightKg;
                              setProductForm((prev) => ({
                                ...prev,
                                grossWeight: grossWeight.toFixed(2),
                              }));
                            }
                          }}
                          placeholder="Enter actual net weight"
                          step="0.01"
                          className="w-full px-4 py-3 border border-blue-300 bg-white rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 shadow-sm"
                        />
                        <div className="text-xs text-blue-600 mt-1">
                          Manual entry allowed
                        </div>
                      </div>
                    </div>

                    {/* Row 3: Pallets, Gross Weight, Measurement */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
                      {/* Show Pallets field only for tiles (Square Meter unit) */}
                      {productForm.productData &&
                        (productForm.productData.unit?.toLowerCase() ===
                          'square meter' ||
                          productForm.productData.unit?.toLowerCase() ===
                            'sqm') && (
                          <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-3">
                              No. of Pallets
                            </label>
                            <input
                              type="number"
                              value={productForm.noOfPallets}
                              onChange={(e) => {
                                setProductForm((prev) => ({
                                  ...prev,
                                  noOfPallets: e.target.value,
                                }));
                              }}
                              placeholder="Enter number of pallets"
                              step="1"
                              className="w-full px-4 py-3 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-slate-200 focus:border-slate-500 transition-all duration-300 shadow-sm"
                            />
                          </div>
                        )}
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-3">
                          Gross Weight (kg)
                        </label>
                        <input
                          type="number"
                          value={productForm.grossWeight}
                          onChange={(e) => {
                            setProductForm((prev) => ({
                              ...prev,
                              grossWeight: e.target.value,
                            }));
                          }}
                          placeholder="Enter actual gross weight"
                          step="0.01"
                          className="w-full px-4 py-3 border border-blue-300 bg-white rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 shadow-sm"
                        />
                        <div className="text-xs text-blue-600 mt-1">
                          Manual entry allowed
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-3">
                          Measurement (m³)
                        </label>
                        <input
                          type="number"
                          value={productForm.measurement}
                          onChange={(e) => {
                            setProductForm((prev) => ({
                              ...prev,
                              measurement: e.target.value,
                            }));
                          }}
                          placeholder="Enter actual measurement"
                          step="0.01"
                          className="w-full px-4 py-3 border border-blue-300 bg-white rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 shadow-sm"
                        />
                        <div className="text-xs text-blue-600 mt-1">
                          Manual entry allowed
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-col lg:flex-row justify-end gap-3 items-stretch lg:items-center">
                    {editMode.isEditing && (
                      <button
                        onClick={() => clearProductForm()}
                        className="px-4 py-3 lg:px-6 lg:py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all duration-300 font-medium shadow-md hover:shadow-lg text-sm lg:text-base"
                      >
                        <span className="lg:hidden">Cancel Edit</span>
                        <span className="hidden lg:inline">Cancel Edit</span>
                      </button>
                    )}
                    <button
                      onClick={() => addProductToContainer(containerIndex)}
                      className="px-4 py-3 lg:px-6 lg:py-3 bg-slate-700 text-white rounded-lg hover:bg-green-700 transition-all duration-300 font-medium shadow-md hover:shadow-lg text-sm lg:text-base"
                    >
                      <span className="lg:hidden">
                        {editMode.isEditing ? 'Update Product' : 'Add Product'}
                      </span>
                      <span className="hidden lg:inline">
                        {editMode.isEditing ? 'Update Product' : 'Add Product'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Container Totals */}
                {container.products.length > 0 && (
                  <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-600 rounded-lg">
                    <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                      Container Totals:
                    </h5>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">
                          Boxes:{' '}
                        </span>
                        <span className="font-medium">
                          {container.totalNoOfBoxes || 0}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">
                          Net Weight:{' '}
                        </span>
                        <span className="font-medium">
                          {container.totalNetWeight || 0} kg
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">
                          Gross Weight:{' '}
                        </span>
                        <span className="font-medium">
                          {container.totalGrossWeight || 0} kg
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">
                          Volume:{' '}
                        </span>
                        <span className="font-medium">
                          {container.totalMeasurement || 0} m³
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            <div className="space-y-4 lg:space-y-6">
              {/* Consignee Display Option */}
              <div>
                <label className="inline-flex items-start lg:items-center space-x-2 text-slate-700 font-semibold text-sm lg:text-base">
                  <input
                    type="checkbox"
                    checked={showToTheOrder}
                    onChange={(e) => setShowToTheOrder(e.target.checked)}
                    className="w-4 h-4 lg:w-5 lg:h-5 rounded border-2 border-gray-300 text-slate-600 focus:ring-slate-200 mt-0.5 lg:mt-0"
                  />
                  <span className="leading-tight">
                    Show "TO THE ORDER" in PDF instead of customer details
                  </span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Notes
                </label>
                <textarea
                  value={packagingList.notes}
                  onChange={(e) =>
                    setPackagingList((prev) => ({
                      ...prev,
                      notes: e.target.value,
                    }))
                  }
                  rows={3}
                  placeholder="Enter additional notes"
                  className="w-full px-4 py-3 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-slate-200 focus:border-slate-500 transition-all duration-300 shadow-sm"
                />
              </div>
            </div>

            {/* Table Preview */}
            <div className="w-full bg-slate-50 p-4 lg:p-8 rounded-lg border border-slate-200">
              <h4 className="text-lg lg:text-2xl font-semibold text-slate-700 mb-4 lg:mb-6">
                Packing List Preview
              </h4>
              <div className="w-full overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300 dark:border-gray-600">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-700">
                      <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left text-sm font-medium">
                        Container
                      </th>
                      <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left text-sm font-medium">
                        Product Name
                      </th>
                      <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left text-sm font-medium">
                        HSN Code
                      </th>
                      <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-right text-sm font-medium">
                        Unit
                      </th>
                      <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-right text-sm font-medium">
                        Quantity
                      </th>
                      {/* Show Square Meter column for tiles products */}
                      {packagingList.containers.some((container) =>
                        container.products.some(
                          (product) =>
                            product.unit?.toLowerCase() === 'square meter' ||
                            product.unit?.toLowerCase() === 'sqm'
                        )
                      ) && (
                        <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-right text-sm font-medium">
                          Square Meter
                        </th>
                      )}
                      {/* Show Pallets column for tiles products */}
                      {packagingList.containers.some((container) =>
                        container.products.some(
                          (product) =>
                            product.unit?.toLowerCase() === 'square meter' ||
                            product.unit?.toLowerCase() === 'sqm'
                        )
                      ) && (
                        <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-right text-sm font-medium">
                          Pallets
                        </th>
                      )}
                      <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-right text-sm font-medium">
                        Unit Wt (kg)
                      </th>
                      <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-right text-sm font-medium">
                        Net Wt (kg)
                      </th>
                      <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-right text-sm font-medium">
                        Gross Wt (kg)
                      </th>
                      <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-right text-sm font-medium">
                        Volume (m³)
                      </th>
                      <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-center text-sm font-medium">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {packagingList.containers.map((container, containerIndex) =>
                      container.products.map((product, productIndex) => (
                        <tr
                          key={`${containerIndex}-${productIndex}`}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm">
                            {productIndex === 0 ? (
                              <div>
                                <div className="font-medium">
                                  {container.containerNumber ||
                                    `Container ${containerIndex + 1}`}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {container.sealType} - {container.sealNumber}
                                </div>
                              </div>
                            ) : (
                              ''
                            )}
                          </td>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm">
                            {product.productName || '-'}
                          </td>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm">
                            {product.hsnCode || '-'}
                          </td>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-right">
                            {product.unit &&
                            product.unit.toLowerCase() === 'box'
                              ? product.unit
                              : 'Box'}
                          </td>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-right">
                            {product.unit &&
                            product.unit.toLowerCase() === 'box'
                              ? product.packedQuantity ||
                                product.quantity ||
                                '-'
                              : product.noOfBoxes || '-'}
                          </td>
                          {/* Show Square Meter column for tiles products */}
                          {packagingList.containers.some((container) =>
                            container.products.some(
                              (p) =>
                                p.unit?.toLowerCase() === 'square meter' ||
                                p.unit?.toLowerCase() === 'sqm'
                            )
                          ) && (
                            <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-right">
                              {product.unit?.toLowerCase() === 'square meter' ||
                              product.unit?.toLowerCase() === 'sqm'
                                ? product.packedQuantity || '-'
                                : '-'}
                            </td>
                          )}
                          {/* Show Pallets column for tiles products */}
                          {packagingList.containers.some((container) =>
                            container.products.some(
                              (p) =>
                                p.unit?.toLowerCase() === 'square meter' ||
                                p.unit?.toLowerCase() === 'sqm'
                            )
                          ) && (
                            <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-right">
                              {product.unit?.toLowerCase() === 'square meter' ||
                              product.unit?.toLowerCase() === 'sqm'
                                ? product.noOfPallets || '-'
                                : '-'}
                            </td>
                          )}
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-right">
                            {(() => {
                              const boxes = parseFloat(
                                product.noOfBoxes ||
                                  (product.unit &&
                                  product.unit.toLowerCase() === 'box'
                                    ? product.packedQuantity || product.quantity
                                    : 0)
                              );
                              const netWeight = parseFloat(
                                product.netWeight || 0
                              );
                              return boxes > 0 && netWeight > 0
                                ? (netWeight / boxes).toFixed(2)
                                : '-';
                            })()}
                          </td>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-right">
                            {product.netWeight || '-'}
                          </td>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-right">
                            {product.grossWeight || '-'}
                          </td>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-right">
                            {product.measurement || '-'}
                          </td>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-center">
                            <div className="flex gap-2 justify-center items-center">
                              <button
                                onClick={() => {
                                  // Find which container this product belongs to
                                  let targetContainerIndex = -1;
                                  let targetProductIndex = -1;

                                  packagingList.containers.forEach(
                                    (cont, contIdx) => {
                                      cont.products.forEach((prod, prodIdx) => {
                                        if (
                                          cont === container &&
                                          prod === product
                                        ) {
                                          targetContainerIndex = contIdx;
                                          targetProductIndex = prodIdx;
                                        }
                                      });
                                    }
                                  );

                                  if (
                                    targetContainerIndex !== -1 &&
                                    targetProductIndex !== -1
                                  ) {
                                    // Set product form with current product data for editing
                                    setProductForm({
                                      productName: product.productName || '',
                                      hsnCode: product.hsnCode || '',
                                      quantity: product.quantity || '',
                                      quantityUnit:
                                        product.quantityUnit || 'Pcs',
                                      noOfBoxes: product.noOfBoxes || '',
                                      noOfPallets: product.noOfPallets || '',
                                      netWeight: product.netWeight || '',
                                      grossWeight: product.grossWeight || '',
                                      measurement: product.measurement || '',
                                      packedQuantity:
                                        product.packedQuantity || '',
                                      unit: product.unit || 'Box',
                                      perBoxWeight: product.perBoxWeight || '',
                                      productData: product.productData || null,
                                    });

                                    // Set edit mode
                                    setEditMode({
                                      isEditing: true,
                                      containerIndex: targetContainerIndex,
                                      productIndex: targetProductIndex,
                                    });

                                    // Scroll to form
                                    setTimeout(() => {
                                      const formElement =
                                        document.querySelector(
                                          `[data-container="${targetContainerIndex}"]`
                                        );
                                      if (formElement) {
                                        formElement.scrollIntoView({
                                          behavior: 'smooth',
                                          block: 'center',
                                        });
                                      }
                                    }, 100);
                                  }
                                }}
                                className="inline-flex items-center px-2 py-1.5 text-xs font-medium text-white bg-slate-700 border border-slate-300 rounded-md hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-1 transition-all duration-200 shadow-sm hover:shadow-md"
                                title="Edit Product"
                              >
                                <svg
                                  className="w-3 h-3"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                  />
                                </svg>
                              </button>
                              <button
                                onClick={() => {
                                  // Find which container this product belongs to
                                  let targetContainerIndex = -1;
                                  let targetProductIndex = -1;

                                  packagingList.containers.forEach(
                                    (cont, contIdx) => {
                                      cont.products.forEach((prod, prodIdx) => {
                                        if (
                                          cont === container &&
                                          prod === product
                                        ) {
                                          targetContainerIndex = contIdx;
                                          targetProductIndex = prodIdx;
                                        }
                                      });
                                    }
                                  );

                                  if (
                                    targetContainerIndex !== -1 &&
                                    targetProductIndex !== -1
                                  ) {
                                    removeProductFromContainer(
                                      targetContainerIndex,
                                      targetProductIndex
                                    );
                                  }
                                }}
                                className="inline-flex items-center px-2 py-1.5 text-xs font-medium text-white bg-slate-700 border border-slate-300 rounded-md hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-1 transition-all duration-200 shadow-sm hover:shadow-md"
                                title="Edit Product"
                              >
                                <svg
                                  className="w-3 h-3"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                    {packagingList.containers.every(
                      (c) => c.products.length === 0
                    ) && (
                      <tr>
                        <td
                          colSpan={
                            packagingList.containers.some((container) =>
                              container.products.some(
                                (product) =>
                                  product.unit?.toLowerCase() ===
                                    'square meter' ||
                                  product.unit?.toLowerCase() === 'sqm'
                              )
                            )
                              ? 12
                              : 10
                          }
                          className="border border-gray-300 dark:border-gray-600 px-3 py-8 text-center text-gray-500"
                        >
                          No products added yet. Add products to containers to
                          see preview.
                        </td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-100 dark:bg-gray-600 font-medium">
                      <td
                        colSpan={4}
                        className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm font-semibold"
                      >
                        TOTAL
                      </td>
                      <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-right font-semibold">
                        {packagingList.totalBoxes}
                      </td>
                      {/* Show Square Meter total for tiles products */}
                      {packagingList.containers.some((container) =>
                        container.products.some(
                          (product) =>
                            product.unit?.toLowerCase() === 'square meter' ||
                            product.unit?.toLowerCase() === 'sqm'
                        )
                      ) && (
                        <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-right font-semibold">
                          {(() => {
                            let totalSqm = 0;
                            packagingList.containers.forEach((container) => {
                              container.products.forEach((product) => {
                                if (
                                  product.unit?.toLowerCase() ===
                                    'square meter' ||
                                  product.unit?.toLowerCase() === 'sqm'
                                ) {
                                  totalSqm +=
                                    parseFloat(product.packedQuantity) || 0;
                                }
                              });
                            });
                            return totalSqm > 0 ? totalSqm : '-';
                          })()}
                        </td>
                      )}
                      {/* Show Pallets total for tiles products */}
                      {packagingList.containers.some((container) =>
                        container.products.some(
                          (product) =>
                            product.unit?.toLowerCase() === 'square meter' ||
                            product.unit?.toLowerCase() === 'sqm'
                        )
                      ) && (
                        <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-right font-semibold">
                          {(() => {
                            let totalPallets = 0;
                            packagingList.containers.forEach((container) => {
                              container.products.forEach((product) => {
                                if (
                                  product.unit?.toLowerCase() ===
                                    'square meter' ||
                                  product.unit?.toLowerCase() === 'sqm'
                                ) {
                                  totalPallets +=
                                    parseFloat(product.noOfPallets) || 0;
                                }
                              });
                            });
                            return totalPallets > 0 ? totalPallets : '-';
                          })()}
                        </td>
                      )}
                      <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-right font-semibold">
                        {(() => {
                          const avgUnitWeight =
                            packagingList.totalBoxes > 0 &&
                            packagingList.totalNetWeight > 0
                              ? (
                                  packagingList.totalNetWeight /
                                  packagingList.totalBoxes
                                ).toFixed(2)
                              : '-';
                          return avgUnitWeight;
                        })()}
                      </td>
                      <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-right font-semibold">
                        {packagingList.totalNetWeight}
                      </td>
                      <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-right font-semibold">
                        {packagingList.totalGrossWeight}
                      </td>
                      <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-right font-semibold">
                        {packagingList.totalVolume}
                      </td>
                      <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-center font-semibold">
                        -
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-end space-y-3 lg:space-y-0 lg:space-x-4 pt-4 lg:pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/orders/packing-lists')}
                className="px-4 py-3 lg:px-6 lg:py-3 rounded-lg border border-gray-300 text-slate-600 hover:bg-gray-50 transition-all duration-300 text-sm lg:text-base"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={savePackagingList}
                disabled={saving || (!orderDetails && !selectedOrder)}
                className="px-4 py-3 lg:px-6 lg:py-3 rounded-lg font-semibold text-white bg-slate-700 hover:bg-slate-800 transition-all duration-300 hover:shadow-xl disabled:opacity-50 shadow-lg text-sm lg:text-base"
              >
                {saving ? (
                  <div className="flex items-center gap-2 justify-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span className="lg:hidden">
                      {isEdit ? 'Updating...' : 'Creating...'}
                    </span>
                    <span className="hidden lg:inline">
                      {isEdit ? 'Updating...' : 'Creating...'}
                    </span>
                  </div>
                ) : (
                  <>
                    <HiCheckCircle className="w-4 h-4 lg:w-5 lg:h-5 mr-2 inline" />
                    <span className="lg:hidden">
                      {isEdit ? 'Update Packing List' : 'Create Packing List'}
                    </span>
                    <span className="hidden lg:inline">
                      {isEdit ? 'Update Packing List' : 'Create Packing List'}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddEditPackingList;
