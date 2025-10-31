import { useDispatch, useSelector } from 'react-redux';
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faSave,
  faPlus,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import { getOrderById, updateOrder } from '../../features/orderSlice';
import { getPiInvoiceById } from '../../features/piSlice';
import { getPackingListById, updatePackingList, createPackingList } from '../../features/packingListSlice';



import PageBreadCrumb from '../../components/common/PageBreadCrumb';
import InputField from '../../components/form/input/InputField';
import TextArea from '../../components/form/input/TextArea';
import Label from '../../components/form/Label';
import DatePicker from '../../components/form/DatePicker';

const AddEditPackingList = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [orderDetails, setOrderDetails] = useState(null);
  const [piProducts, setPiProducts] = useState([]);
  const [piData, setPiData] = useState(null);

  // Packaging List State
  const [packagingList, setPackagingList] = useState({
    exportInvoiceNo: '',
    exportInvoiceDate: '',
    buyerReference: '',
    buyerDetails: '',
    sellerInfo: '',
    vesselVoyageNo: '',
    dateOfDeparture: '',
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
      },
    ],
    notes: '',
    totalBoxes: 0,
    totalNetWeight: 0,
    totalGrossWeight: 0,
    totalVolume: 0,
    totalContainers: 0,
    dateOfIssue: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  useEffect(() => {
    if (orderDetails) {
      loadPackagingData();
    }
  }, [orderDetails]);

  const fetchOrderDetails = async () => {
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
      toast.error(error.message);
      navigate('/orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchPIProducts = async (piId) => {
    try {
      const response = await dispatch(getPiInvoiceById(piId)).unwrap();
      const piDataResponse = response.data || response;
      setPiData(piDataResponse);

      const products =
        piDataResponse.products ||
        piDataResponse.piProducts ||
        piDataResponse.items ||
        piDataResponse.lineItems ||
        [];
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

      const rawPackingResponse =
        await dispatch(getPackingListById(packingId)).unwrap();
      const rawPackingData = rawPackingResponse.data || rawPackingResponse;

      let containerData = [];
      let detailedPackingData = {};

      if (
        rawPackingData.pi &&
        rawPackingData.pi.packagingSteps &&
        rawPackingData.pi.packagingSteps.length > 0
      ) {
        const packagingStep = rawPackingData.pi.packagingSteps[0];
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
          vesselVoyageNo:
            detailedPackingData.vesselVoyageNo ||
            rawPackingData.vesselVoyageNo ||
            '',
          dateOfDeparture: detailedPackingData.dateOfDeparture
            ? new Date(detailedPackingData.dateOfDeparture)
                .toISOString()
                .split('T')[0]
            : rawPackingData.dateOfDeparture
              ? new Date(rawPackingData.dateOfDeparture)
                  .toISOString()
                  .split('T')[0]
              : '',
          containers:
            containerData.length > 0
              ? containerData.map((container) => ({
                  containerNumber: container.containerNumber || '',
                  sealType: container.sealType || '',
                  sealNumber: container.sealNumber || '',
                  products: container.products || [],
                  totalNoOfBoxes: (container.totalNoOfBoxes || '').toString(),
                  totalNetWeight: (container.totalNetWeight || '').toString(),
                  totalGrossWeight: (
                    container.totalGrossWeight || ''
                  ).toString(),
                  totalMeasurement: (
                    container.totalMeasurement || ''
                  ).toString(),
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
          totalContainers:
            detailedPackingData.totalContainers ||
            rawPackingData.totalContainers ||
            0,
          dateOfIssue: rawPackingData.dateOfIssue
            ? new Date(rawPackingData.dateOfIssue).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0],
          isExisting: true,
        };

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

  const addProductToContainer = (containerIndex) => {
    const updatedContainers = [...packagingList.containers];
    updatedContainers[containerIndex].products.push({
      productName: '',
      hsnCode: '',
      quantity: '',
      quantityUnit: 'Pcs',
      noOfBoxes: '',
      netWeight: '',
      grossWeight: '',
      measurement: '',
    });

    const calculatedData = calculateTotals({
      ...packagingList,
      containers: updatedContainers,
    });
    setPackagingList(calculatedData);
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
    updatedContainers[containerIndex].products[productIndex][field] = value;

    const calculatedData = calculateTotals({
      ...packagingList,
      containers: updatedContainers,
    });

    setPackagingList(calculatedData);
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
    const currentProduct = packagingList.containers[containerIndex].products[productIndex];
    
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
      
      // Get gross weight from product data (in grams, convert to kg)
      const product = productData.product || productData;
      const grossWeightPerBoxGrams = product.grossWeightPerBox || product.totalGrossWeight || 0;
      const grossWeightPerBoxKg = grossWeightPerBoxGrams / 1000; // Convert grams to kg
      
      if (grossWeightPerBoxKg > 0) {
        grossWeightKg = qty * grossWeightPerBoxKg;
      } else {
        // Fallback: use net weight + 10% packaging
        grossWeightKg = netWeightKg * 1.1;
      }
      
    } else {
      // If unit is Pcs, calculate boxes needed
      const product = productData.product || productData;
      const packagingData = product.packagingHierarchyData?.dynamicFields || {};
      const piecesPerPackage = packagingData.PiecesPerPackage || 50;
      const packagePerBox = packagingData.PackagePerBox || 40;
      const unitWeight = product.unitWeight || 8; // Weight per piece in grams
      
      const piecesPerBox = piecesPerPackage * packagePerBox;
      boxesNeeded = Math.ceil(qty / piecesPerBox);
      
      // Calculate net weight (product weight only)
      const netWeightGrams = qty * unitWeight;
      netWeightKg = netWeightGrams / 1000;
      
      // Calculate gross weight (net weight + packaging)
      const packagingWeightPerBox = 700; // grams
      const packagingWeightTotal = boxesNeeded * packagingWeightPerBox;
      const grossWeightGrams = netWeightGrams + packagingWeightTotal;
      grossWeightKg = grossWeightGrams / 1000;
    }

    // Calculate volume if available
    const product = productData.product || productData;
    if (product.packagingVolume) {
      volumeM3 = boxesNeeded * product.packagingVolume;
    } else {
      // Default volume calculation (0.0055 m³ per box as shown in your data)
      volumeM3 = boxesNeeded * 0.0055;
    }

    console.log('📊 Auto-calculation for', productData.productName || productData.name, ':', {
      packedQuantity: qty,
      unit: unit,
      boxesNeeded,
      piTotalWeight: productData.totalWeight,
      piTotalGrossWeight: productData.totalGrossWeight,
      productData: productData,
      netWeightKg: netWeightKg.toFixed(2) + 'kg',
      grossWeightKg: grossWeightKg.toFixed(2) + 'kg',
      volumeM3: volumeM3.toFixed(4) + 'm³',
    });

    // Update the product with calculated values
    const updatedContainers = [...packagingList.containers];
    const productToUpdate =
      updatedContainers[containerIndex].products[productIndex];

    productToUpdate.noOfBoxes = boxesNeeded.toString();
    productToUpdate.netWeight = netWeightKg.toFixed(2);
    productToUpdate.grossWeight = grossWeightKg.toFixed(2);
    productToUpdate.measurement = volumeM3.toFixed(4);

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
    const totalContainers = data.containers.length;

    const updatedContainers = data.containers.map((container) => {
      let containerBoxes = 0;
      let containerNetWeight = 0;
      let containerGrossWeight = 0;
      let containerMeasurement = 0;

      container.products.forEach((product) => {
        const boxes = parseFloat(product.noOfBoxes) || 0;
        const netWeight = parseFloat(product.netWeight) || 0;
        const grossWeight = parseFloat(product.grossWeight) || 0;
        const measurement = parseFloat(product.measurement) || 0;

        containerBoxes += boxes;
        containerNetWeight += netWeight;
        containerGrossWeight += grossWeight;
        containerMeasurement += measurement;
      });

      totalBoxes += containerBoxes;
      totalNetWeight += containerNetWeight;
      totalGrossWeight += containerGrossWeight;
      totalVolume += containerMeasurement;

      return {
        ...container,
        totalNoOfBoxes: containerBoxes.toString(),
        totalNetWeight: containerNetWeight.toFixed(2),
        totalGrossWeight: containerGrossWeight.toFixed(2),
        totalMeasurement: containerMeasurement.toFixed(2),
      };
    });

    return {
      ...data,
      containers: updatedContainers,
      totalBoxes,
      totalNetWeight: parseFloat(totalNetWeight.toFixed(2)),
      totalGrossWeight: parseFloat(totalGrossWeight.toFixed(2)),
      totalVolume: parseFloat(totalVolume.toFixed(2)),
      totalContainers,
    };
  };

  const savePackagingList = async () => {
    try {
      if (!orderDetails?.piInvoiceId) {
        toast.error('No PI Invoice associated with this order');
        return;
      }

      const packagingData = {
        ...packagingList,
        piId: orderDetails.piInvoiceId,
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
        const updateId = packagingList.id || orderDetails.piInvoiceId;
        const result = await dispatch(updatePackingList({
          id: updateId,
          packingData: packagingData
        })).unwrap();
        toast.success(result.message);
      } else {
        try {
          const result =
            await dispatch(createPackingList(packagingData)).unwrap();
          const createdId = result.data?.id || result.data;

          setPackagingList((prev) => ({
            ...prev,
            id: createdId,
            isExisting: true,
          }));

          // Update order with packingListId for future updates
          if (createdId && orderDetails?.id) {
            try {
              await dispatch(updateOrder({
                id: orderDetails.id,
                data: { packingListId: createdId }
              })).unwrap();
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
            const updateResult = await dispatch(updatePackingList({
              id: existingId,
              packingData: packagingData
            })).unwrap();
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
        navigate('/orders');
      }, 1500);
    } catch (error) {
      console.error('Error saving packaging list:', error);
      toast.error(error.message);
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
    <div className="p-3 sm:p-6">
      <PageBreadCrumb pageTitle="Packaging List" />

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => navigate('/orders')}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 flex-shrink-0"
            >
              <FontAwesomeIcon icon={faArrowLeft} />
            </button>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
              Packaging List
            </h2>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          <div className="space-y-4 sm:space-y-6">
            {/* Packaging List Header */}
            <div className="flex flex-col gap-4">
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                  Packaging List
                </h3>
                <div className="text-xs text-gray-500 mt-1">
                  PI Containers:{' '}
                  {piData?.numberOfContainers ||
                    piData?.containerCount ||
                    'N/A'}{' '}
                  | Current: {packagingList.containers.length} | Boxes:{' '}
                  {packagingList.totalBoxes}
                </div>
                {piData?.numberOfContainers &&
                  packagingList.containers.length !==
                    piData.numberOfContainers && (
                    <div className="text-xs text-orange-600 mt-1">
                      ⚠️ Container count mismatch! PI has{' '}
                      {piData.numberOfContainers} containers, but form has{' '}
                      {packagingList.containers.length}
                    </div>
                  )}
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={savePackagingList}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm sm:text-base"
                >
                  <FontAwesomeIcon icon={faSave} />
                  <span className="hidden sm:inline">Save Packaging List</span>
                  <span className="sm:hidden">Save</span>
                </button>
                <button
                  onClick={addContainer}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm sm:text-base"
                >
                  <FontAwesomeIcon icon={faPlus} />
                  <span className="hidden sm:inline">Add Container</span>
                  <span className="sm:hidden">Add</span>
                  {piData?.numberOfContainers && (
                    <span className="text-xs">
                      ({packagingList.containers.length}/
                      {piData.numberOfContainers})
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Basic Packaging Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <Label>Vessel/Voyage No</Label>
                <InputField
                  type="text"
                  name="vesselVoyageNo"
                  value={packagingList.vesselVoyageNo}
                  onChange={handlePackagingInputChange}
                  placeholder="Enter vessel/voyage number"
                />
              </div>
              <div>
                <Label>Date</Label>
                <DatePicker
                  value={packagingList.dateOfDeparture}
                  onChange={(value) =>
                    setPackagingList((prev) => ({
                      ...prev,
                      dateOfDeparture: value,
                    }))
                  }
                  placeholder="Select departure date"
                />
              </div>
            </div>

            {/* Containers */}
            {packagingList.containers.map((container, containerIndex) => (
              <div
                key={containerIndex}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4">
                  <h4 className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">
                    Container {containerIndex + 1}
                  </h4>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => addProductToContainer(containerIndex)}
                      className="text-green-600 hover:text-green-800 text-xs sm:text-sm font-medium px-2 sm:px-3 py-1 rounded border border-green-600 hover:bg-green-50 flex-1 sm:flex-none"
                    >
                      + Add Product
                    </button>
                    {packagingList.containers.length > 1 && (
                      <button
                        onClick={() => removeContainer(containerIndex)}
                        className="text-red-600 hover:text-red-800 text-xs sm:text-sm font-medium px-2 sm:px-3 py-1 rounded border border-red-600 hover:bg-red-50 flex-1 sm:flex-none"
                      >
                        <FontAwesomeIcon icon={faTrash} />{' '}
                        <span className="hidden sm:inline">Remove</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Container Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                  <div>
                    <Label>Container Number</Label>
                    <InputField
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
                    />
                  </div>
                  <div>
                    <Label>Select Seal Type</Label>
                    <select
                      value={container.sealType}
                      onChange={(e) =>
                        handleContainerChange(
                          containerIndex,
                          'sealType',
                          e.target.value
                        )
                      }
                      className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-4 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    >
                      <option value="">Select Seal Type</option>
                      <option value="self seal">Self Seal</option>
                      <option value="line seal">Line Seal</option>
                    </select>
                  </div>
                  <div>
                    <Label>Seal Number</Label>
                    <InputField
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
                    />
                  </div>
                </div>

                {/* Products in Container */}
                {container.products.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No products added to this container..</p>
                    <button
                      onClick={() => addProductToContainer(containerIndex)}
                      className="mt-2 text-blue-600 hover:text-blue-800 font-medium"
                    >
                      + Add First Product
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {container.products.map((product, productIndex) => (
                      <div
                        key={productIndex}
                        className="p-4 border border-gray-300 rounded-lg bg-white dark:bg-gray-700"
                      >
                        <div className="flex justify-between items-center mb-3">
                          <span className="font-medium text-gray-900 dark:text-white">
                            Product {productIndex + 1}
                            {product.productName && (
                              <span className="text-sm text-gray-500 ml-2">
                                ({product.productName})
                              </span>
                            )}
                          </span>
                          <div className="flex gap-2">
                            {product.productData && product.packedQuantity && (
                              <button
                                type="button"
                                onClick={() =>
                                  calculateProductValues(
                                    containerIndex,
                                    productIndex,
                                    product.packedQuantity,
                                    product.productData
                                  )
                                }
                                className="text-blue-600 hover:text-blue-800 text-xs font-medium px-2 py-1 rounded border border-blue-600 hover:bg-blue-50"
                              >
                                🧮 Calculate
                              </button>
                            )}
                            <button
                              onClick={() =>
                                removeProductFromContainer(
                                  containerIndex,
                                  productIndex
                                )
                              }
                              className="text-red-600 hover:text-red-800 text-sm font-medium"
                            >
                              Remove
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div>
                            <Label>Product Name</Label>
                            <select
                              value={product.productName}
                              onChange={(e) => {
                                const selectedProduct = piProducts.find(
                                  (p) =>
                                    (p.name ||
                                      p.productName ||
                                      p.description) === e.target.value
                                );
                                updateProductInContainer(
                                  containerIndex,
                                  productIndex,
                                  'productName',
                                  e.target.value
                                );
                                if (selectedProduct) {
                                  updateProductInContainer(
                                    containerIndex,
                                    productIndex,
                                    'quantity',
                                    selectedProduct.quantity ||
                                      selectedProduct.qty ||
                                      ''
                                  );
                                  // Store unit information
                                  updateProductInContainer(
                                    containerIndex,
                                    productIndex,
                                    'unit',
                                    selectedProduct.unit || 'Box'
                                  );
                                  // Auto-populate HSN code
                                  const hsnCode =
                                    selectedProduct.category?.hsnCode ||
                                    selectedProduct.subcategory?.hsnCode ||
                                    selectedProduct.hsCode ||
                                    '';
                                  updateProductInContainer(
                                    containerIndex,
                                    productIndex,
                                    'hsnCode',
                                    hsnCode
                                  );
                                  // Store product data for calculations
                                  updateProductInContainer(
                                    containerIndex,
                                    productIndex,
                                    'productData',
                                    selectedProduct
                                  );
                                  // Initialize packed quantity as 0
                                  updateProductInContainer(
                                    containerIndex,
                                    productIndex,
                                    'packedQuantity',
                                    ''
                                  );
                                }
                              }}
                              className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-4 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                            >
                              <option value="">Select Product from PI</option>
                              {piProducts.map((piProduct, idx) => {
                                const productName =
                                  piProduct.name ||
                                  piProduct.productName ||
                                  piProduct.description ||
                                  `Product ${idx + 1}`;
                                const quantity =
                                  piProduct.quantity || piProduct.qty || '';
                                const unit = piProduct.unit || 'Box';
                                const unitWeight =
                                  piProduct.product?.unitWeight || 0;
                                const hsnCode =
                                  piProduct.category?.hsnCode ||
                                  piProduct.subcategory?.hsnCode ||
                                  '';
                                return (
                                  <option key={idx} value={productName}>
                                    {productName} (Qty: {quantity} {unit}, {unitWeight}
                                    g/pc, HSN: {hsnCode})
                                  </option>
                                );
                              })}
                            </select>
                          </div>
                          <div>
                            <Label>HSN Code</Label>
                            <InputField
                              type="text"
                              value={product.hsnCode || ''}
                              onChange={(e) =>
                                updateProductInContainer(
                                  containerIndex,
                                  productIndex,
                                  'hsnCode',
                                  e.target.value
                                )
                              }
                              placeholder="HSN Code"
                              className="bg-gray-100 dark:bg-gray-800"
                            />
                          </div>
                          <div>
                            <Label>PI Quantity ➡️ Packed</Label>
                            <div className="flex items-center gap-2">
                              <div className="flex-1">
                                <InputField
                                  type="text"
                                  value={`${product.quantity || ''} ${product.unit || 'Box'}`}
                                  readOnly
                                  className="bg-gray-100 dark:bg-gray-800"
                                  placeholder="PI Qty"
                                />
                              </div>
                              <span className="text-gray-500">➡️</span>
                              <div className="flex-1">
                                <InputField
                                  type="number"
                                  value={product.packedQuantity || ''}
                                  onChange={(e) => {
                                    const packedQty = e.target.value;
                                    updateProductInContainer(
                                      containerIndex,
                                      productIndex,
                                      'packedQuantity',
                                      packedQty
                                    );
                                    // Auto-calculate based on packed quantity
                                    calculateProductValues(
                                      containerIndex,
                                      productIndex,
                                      packedQty,
                                      product.productData
                                    );
                                  }}
                                  placeholder="Packed"
                                />
                                <div className="text-xs text-gray-500 mt-1">
                                  Unit: {product.unit || 'Box'}
                                </div>
                              </div>
                            </div>
                            {product.quantity && product.packedQuantity && (
                              <div
                                className={`text-xs mt-1 ${
                                  parseFloat(product.packedQuantity) >
                                  parseFloat(product.quantity)
                                    ? 'text-red-600'
                                    : parseFloat(product.packedQuantity) ===
                                        parseFloat(product.quantity)
                                      ? 'text-green-600'
                                      : 'text-yellow-600'
                                }`}
                              >
                                {parseFloat(product.packedQuantity) >
                                parseFloat(product.quantity)
                                  ? `⚠️ Over by ${(
                                      parseFloat(product.packedQuantity) -
                                      parseFloat(product.quantity)
                                    ).toFixed(2)}`
                                  : parseFloat(product.packedQuantity) ===
                                      parseFloat(product.quantity)
                                    ? '✅ Complete'
                                    : `📦 Remaining: ${(
                                        parseFloat(product.quantity) -
                                        parseFloat(product.packedQuantity)
                                      ).toFixed(2)}`}
                              </div>
                            )}
                          </div>

                          <div>
                            <Label>Net Weight (kg)</Label>
                            <InputField
                              type="number"
                              value={product.netWeight}
                              onChange={(e) =>
                                updateProductInContainer(
                                  containerIndex,
                                  productIndex,
                                  'netWeight',
                                  e.target.value
                                )
                              }
                              placeholder="Enter net weight"
                              step="0.01"
                            />
                          </div>
                          <div>
                            <Label>Gross Weight (kg)</Label>
                            <InputField
                              type="number"
                              value={product.grossWeight}
                              onChange={(e) =>
                                updateProductInContainer(
                                  containerIndex,
                                  productIndex,
                                  'grossWeight',
                                  e.target.value
                                )
                              }
                              placeholder="Enter gross weight"
                              step="0.01"
                            />
                          </div>
                          <div>
                            <Label>Measurement (m³)</Label>
                            <InputField
                              type="number"
                              value={product.measurement}
                              onChange={(e) =>
                                updateProductInContainer(
                                  containerIndex,
                                  productIndex,
                                  'measurement',
                                  e.target.value
                                )
                              }
                              placeholder="Enter measurement"
                              step="0.01"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Container Totals */}
                {container.products.length > 0 && (
                  <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-600 rounded-lg">
                    <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                      Container Totals:
                    </h5>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
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

            <div>
              <Label>Notes</Label>
              <TextArea
                value={packagingList.notes}
                onChange={(value) =>
                  setPackagingList((prev) => ({ ...prev, notes: value }))
                }
                rows={3}
                placeholder="Enter additional notes"
              />
            </div>

            {/* Table Preview */}
            <div className="mt-6 p-4 bg-white dark:bg-gray-800 rounded-lg border">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Packing List Preview
              </h4>
              <div className="overflow-x-auto">
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
                        Quantity
                      </th>
                      <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-right text-sm font-medium">
                        Boxes
                      </th>
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
                            {product.packedQuantity ? `${product.packedQuantity} ${product.unit || 'Box'}` : (product.quantity ? `${product.quantity} ${product.unit || 'Box'}` : '-')}
                          </td>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-right">
                            {product.unit && product.unit.toLowerCase() === 'box' 
                              ? (product.packedQuantity || product.quantity || '-')
                              : (product.noOfBoxes || '-')
                            }
                          </td>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-right">
                            {(() => {
                              const boxes = parseFloat(product.noOfBoxes || (product.unit && product.unit.toLowerCase() === 'box' ? (product.packedQuantity || product.quantity) : 0));
                              const netWeight = parseFloat(product.netWeight || 0);
                              return boxes > 0 && netWeight > 0 ? (netWeight / boxes).toFixed(2) : '-';
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
                        </tr>
                      ))
                    )}
                    {packagingList.containers.every(
                      (c) => c.products.length === 0
                    ) && (
                      <tr>
                        <td
                          colSpan={9}
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
                      <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-right font-semibold">
                        {(() => {
                          const avgUnitWeight = packagingList.totalBoxes > 0 && packagingList.totalNetWeight > 0 
                            ? (packagingList.totalNetWeight / packagingList.totalBoxes).toFixed(2) 
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
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddEditPackingList;
