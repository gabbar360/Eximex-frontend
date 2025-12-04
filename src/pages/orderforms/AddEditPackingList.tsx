import { useDispatch, useSelector } from 'react-redux';
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HiCheckCircle, HiArrowLeft, HiPlus, HiTrash } from 'react-icons/hi';
import { toast } from 'react-toastify';
import { getOrderById, updateOrder } from '../../features/orderSlice';
import { getPiInvoiceById } from '../../features/piSlice';
import {
  getPackingListById,
  updatePackingList,
  createPackingList,
} from '../../features/packingListSlice';

import PageBreadCrumb from '../../components/common/PageBreadCrumb';
import InputField from '../../components/form/input/InputField';
import TextArea from '../../components/form/input/TextArea';
import Label from '../../components/form/Label';
import DatePicker from '../../components/form/DatePicker';
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
    if (id && id !== 'create') {
      fetchOrderDetails();
    } else {
      setLoading(false);
    }
  }, [id]);

  const handleOrderSelect = async (orderId, orderData) => {
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

  // Product form state
  const [productForm, setProductForm] = useState({
    productName: '',
    hsnCode: '',
    quantity: '',
    quantityUnit: 'Pcs',
    noOfBoxes: '',
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-3">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-3 lg:p-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate('/orders/packing-lists')}
                  className="p-3 rounded-lg bg-slate-700 text-white hover:bg-slate-800 transition-all duration-300 hover:shadow-lg"
                >
                  <HiArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 mb-1">
                    {isEdit ? 'Edit Packing List' : 'Create Packing List'}
                  </h1>
                  {orderDetails && (
                    <p className="text-slate-600 mt-1">
                      Order: {orderDetails.orderNumber} | PI:{' '}
                      {orderDetails.piNumber}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-xl shadow-xl border border-slate-200">
          <div className="p-8">
            <div className="space-y-8">
              {/* Order Selection for new packing lists */}
              {!isEdit && (
                <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-700 mb-4">
                    Select Order
                  </h3>
                  <OrderSelector
                    selectedOrderId={selectedOrder?.id || null}
                    onOrderSelect={handleOrderSelect}
                    placeholder="Select Order for Packing List"
                    filterType="packingList"
                  />
                  {selectedOrder && (
                    <div className="mt-4 p-4 bg-slate-100 rounded-lg border border-slate-300">
                      <p className="text-sm text-slate-700">
                        Selected:{' '}
                        <strong className="text-slate-800">
                          {selectedOrder.orderNumber}
                        </strong>{' '}
                        - {selectedOrder.piNumber} ({selectedOrder.buyerName})
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Packaging List Header */}
              <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                <div className="flex flex-col gap-4">
                  <div>
                    <h3 className="text-xl font-semibold text-slate-700">
                      Packaging List Details
                    </h3>
                    <div className="text-sm text-slate-600 mt-2">
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
                        <div className="text-sm text-orange-600 mt-2 p-2 bg-orange-50 rounded border border-orange-200">
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
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-all duration-300 shadow-md hover:shadow-lg font-medium"
                    >
                      <HiPlus className="w-5 h-5" />
                      Add Container
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

              {/* Containers */}
              {packagingList.containers.map((container, containerIndex) => (
                <div
                  key={containerIndex}
                  className="border border-slate-200 rounded-lg p-6 bg-slate-50"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-6">
                    <h4 className="text-lg font-semibold text-slate-700">
                      Container {containerIndex + 1}
                    </h4>
                    {packagingList.containers.length > 1 && (
                      <button
                        onClick={() => removeContainer(containerIndex)}
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 hover:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 transition-all duration-200 shadow-sm hover:shadow-md"
                      >
                        <HiTrash className="w-4 h-4 mr-2" />
                        Remove Container
                      </button>
                    )}
                  </div>

                  {/* Container Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-300"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Seal Type
                      </label>
                      <select
                        value={container.sealType}
                        onChange={(e) =>
                          handleContainerChange(
                            containerIndex,
                            'sealType',
                            e.target.value
                          )
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-300"
                      >
                        <option value="">Select Seal Type</option>
                        <option value="self seal">Self Seal</option>
                        <option value="line seal">Line Seal</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-300"
                      />
                    </div>
                  </div>

                  {/* Single Product Form */}
                  <div
                    className="p-6 border border-slate-200 rounded-lg bg-white shadow-sm"
                    data-container={containerIndex}
                  >
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {editMode.isEditing
                          ? 'Edit Product'
                          : `Add Product to Container ${containerIndex + 1}`}
                        {productForm.productName && (
                          <span className="text-sm text-gray-500 ml-2">
                            ({productForm.productName})
                          </span>
                        )}
                      </span>
                      <div className="flex gap-2">
                        {productForm.productData &&
                          productForm.packedQuantity && (
                            <button
                              type="button"
                              onClick={() => {
                                const qty = parseFloat(
                                  productForm.packedQuantity
                                );
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
                                } else {
                                  const product =
                                    productForm.productData.product ||
                                    productForm.productData;
                                  const packagingData =
                                    product.packagingHierarchyData
                                      ?.dynamicFields || {};
                                  const piecesPerPack =
                                    packagingData.PiecesPerPack || 50;
                                  const packPerBox =
                                    packagingData.PackPerBox || 40;
                                  const unitWeight = product.unitWeight || 8;
                                  const piecesPerBox =
                                    piecesPerPack * packPerBox;
                                  boxesNeeded = Math.ceil(qty / piecesPerBox);
                                  const netWeightGrams = qty * unitWeight;
                                  netWeightKg = netWeightGrams / 1000;
                                  const boxWeightGrams =
                                    product.packagingMaterialWeight || 700;
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

                                setProductForm((prev) => ({
                                  ...prev,
                                  noOfBoxes: boxesNeeded.toString(),
                                  netWeight: netWeightKg.toFixed(2),
                                  grossWeight: grossWeightKg.toFixed(2),
                                  measurement: volumeM3.toFixed(4),
                                  perBoxWeight:
                                    boxesNeeded > 0
                                      ? (netWeightKg / boxesNeeded).toFixed(2)
                                      : '',
                                }));
                              }}
                              className="text-blue-600 hover:text-blue-800 text-xs font-medium px-2 py-1 rounded border border-blue-600 hover:bg-blue-50"
                            >
                              🧮 Calculate
                            </button>
                          )}
                        <button
                          onClick={() => clearProductForm()}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          {editMode.isEditing ? 'Cancel Edit' : 'Clear'}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <Label>Product Name</Label>
                        <select
                          value={productForm.productName}
                          onChange={(e) => {
                            const selectedProduct = piProducts.find(
                              (p) =>
                                (p.name || p.productName || p.description) ===
                                e.target.value
                            );
                            setProductForm((prev) => ({
                              ...prev,
                              productName: e.target.value,
                            }));
                            if (selectedProduct) {
                              setProductForm((prev) => ({
                                ...prev,
                                quantity:
                                  selectedProduct.quantity ||
                                  selectedProduct.qty ||
                                  '',
                                unit: selectedProduct.unit || 'Box',
                                hsnCode:
                                  selectedProduct.category?.hsnCode ||
                                  selectedProduct.subcategory?.hsnCode ||
                                  selectedProduct.hsCode ||
                                  '',
                                productData: selectedProduct,
                                packedQuantity: '',
                              }));
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
                                {productName} (Qty: {quantity} {unit},{' '}
                                {unitWeight}
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
                          value={productForm.hsnCode || ''}
                          onChange={(e) =>
                            setProductForm((prev) => ({
                              ...prev,
                              hsnCode: e.target.value,
                            }))
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
                              value={`${productForm.quantity || ''} ${productForm.unit || 'Box'}`}
                              readOnly
                              className="bg-gray-100 dark:bg-gray-800"
                              placeholder="PI Qty"
                            />
                          </div>
                          <span className="text-gray-500">➡️</span>
                          <div className="flex-1">
                            <InputField
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

                                  setProductForm((prev) => ({
                                    ...prev,
                                    noOfBoxes: boxesNeeded.toString(),
                                    netWeight: netWeightKg.toFixed(2),
                                    grossWeight: grossWeightKg.toFixed(2),
                                    measurement: volumeM3.toFixed(4),
                                    perBoxWeight:
                                      boxesNeeded > 0
                                        ? (netWeightKg / boxesNeeded).toFixed(2)
                                        : '',
                                  }));
                                }
                              }}
                              placeholder="Packed"
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

                      <div>
                        <Label>No. of Boxes</Label>
                        <InputField
                          type="number"
                          value={productForm.noOfBoxes}
                          onChange={(e) => {
                            setProductForm((prev) => ({
                              ...prev,
                              noOfBoxes: e.target.value,
                            }));
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
                        />
                      </div>
                      <div>
                        <Label>Per Box Weight (kg) ✏️</Label>
                        <InputField
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
                                parseFloat(productForm.noOfBoxes) * boxWeightKg;
                              setProductForm((prev) => ({
                                ...prev,
                                grossWeight: totalGrossWeight.toFixed(2),
                              }));
                            }
                          }}
                          placeholder="Weight per box"
                          step="0.01"
                          className="border-green-300 focus:border-green-500"
                        />
                        <div className="text-xs text-green-600 mt-1">
                          Modify box weight
                        </div>
                      </div>
                      <div>
                        <Label>Net Weight (kg) ✏️</Label>
                        <InputField
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
                          className="border-blue-300 focus:border-blue-500"
                        />
                        <div className="text-xs text-blue-600 mt-1">
                          Manual entry allowed
                        </div>
                      </div>
                      <div>
                        <Label>Gross Weight (kg) ✏️</Label>
                        <InputField
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
                          className="border-blue-300 focus:border-blue-500"
                        />
                        <div className="text-xs text-blue-600 mt-1">
                          Manual entry allowed
                        </div>
                      </div>
                      <div>
                        <Label>Measurement (m³) ✏️</Label>
                        <InputField
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
                          className="border-blue-300 focus:border-blue-500"
                        />
                        <div className="text-xs text-blue-600 mt-1">
                          Manual entry allowed
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end gap-3">
                      {editMode.isEditing && (
                        <button
                          onClick={() => clearProductForm()}
                          className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all duration-300 font-medium shadow-md hover:shadow-lg"
                        >
                          Cancel Edit
                        </button>
                      )}
                      <button
                        onClick={() => addProductToContainer(containerIndex)}
                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-300 font-medium shadow-md hover:shadow-lg"
                      >
                        {editMode.isEditing ? 'Update Product' : 'Add Product'}
                      </button>
                    </div>
                  </div>

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

              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-slate-700 border-b border-slate-200 pb-3">
                  Additional Information
                </h3>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-300"
                  />
                </div>
              </div>

              {/* Table Preview */}
              <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                <h4 className="text-xl font-semibold text-slate-700 mb-6">
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
                          Unit
                        </th>
                        <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-right text-sm font-medium">
                          Quantity
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
                        <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-center text-sm font-medium">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {packagingList.containers.map(
                        (container, containerIndex) =>
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
                                      {container.sealType} -{' '}
                                      {container.sealNumber}
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
                              <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-right">
                                {(() => {
                                  const boxes = parseFloat(
                                    product.noOfBoxes ||
                                      (product.unit &&
                                      product.unit.toLowerCase() === 'box'
                                        ? product.packedQuantity ||
                                          product.quantity
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
                                          cont.products.forEach(
                                            (prod, prodIdx) => {
                                              if (
                                                cont === container &&
                                                prod === product
                                              ) {
                                                targetContainerIndex = contIdx;
                                                targetProductIndex = prodIdx;
                                              }
                                            }
                                          );
                                        }
                                      );

                                      if (
                                        targetContainerIndex !== -1 &&
                                        targetProductIndex !== -1
                                      ) {
                                        // Set product form with current product data for editing
                                        setProductForm({
                                          productName:
                                            product.productName || '',
                                          hsnCode: product.hsnCode || '',
                                          quantity: product.quantity || '',
                                          quantityUnit:
                                            product.quantityUnit || 'Pcs',
                                          noOfBoxes: product.noOfBoxes || '',
                                          netWeight: product.netWeight || '',
                                          grossWeight:
                                            product.grossWeight || '',
                                          measurement:
                                            product.measurement || '',
                                          packedQuantity:
                                            product.packedQuantity || '',
                                          unit: product.unit || 'Box',
                                          perBoxWeight:
                                            product.perBoxWeight || '',
                                          productData:
                                            product.productData || null,
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
                                    className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 border border-slate-300 rounded-md hover:bg-slate-200 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-1 transition-all duration-200 shadow-sm hover:shadow-md"
                                    title="Edit Product"
                                  >
                                    <svg
                                      className="w-3 h-3 mr-1"
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
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => {
                                      // Find which container this product belongs to
                                      let targetContainerIndex = -1;
                                      let targetProductIndex = -1;

                                      packagingList.containers.forEach(
                                        (cont, contIdx) => {
                                          cont.products.forEach(
                                            (prod, prodIdx) => {
                                              if (
                                                cont === container &&
                                                prod === product
                                              ) {
                                                targetContainerIndex = contIdx;
                                                targetProductIndex = prodIdx;
                                              }
                                            }
                                          );
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
                                    className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 hover:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 transition-all duration-200 shadow-sm hover:shadow-md"
                                    title="Remove Product"
                                  >
                                    <svg
                                      className="w-3 h-3 mr-1"
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
                                    Remove
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
                            colSpan={10}
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
              <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => navigate('/orders/packing-lists')}
                  className="px-6 py-3 rounded-lg border border-gray-300 text-slate-600 hover:bg-gray-50 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={savePackagingList}
                  disabled={saving || (!orderDetails && !selectedOrder)}
                  className="px-6 py-3 rounded-lg font-semibold text-white bg-slate-700 hover:bg-slate-800 transition-all duration-300 hover:shadow-xl disabled:opacity-50 shadow-lg"
                >
                  {saving ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      {isEdit ? 'Updating...' : 'Creating...'}
                    </div>
                  ) : (
                    <>
                      <HiCheckCircle className="w-5 h-5 mr-2 inline" />
                      {isEdit ? 'Update Packing List' : 'Create Packing List'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddEditPackingList;
