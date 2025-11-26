import { useDispatch, useSelector } from 'react-redux';
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { HiArrowLeft, HiCheckCircle } from 'react-icons/hi2';
import {
  getPurchaseOrderById,
  updatePurchaseOrder,
  createPurchaseOrder,
  getFormData,
} from '../../features/purchaseOrderSlice';
import { fetchProducts } from '../../features/productSlice';
import { getAllParties } from '../../features/partySlice';
import { fetchCategories } from '../../features/categorySlice';

import DatePicker from '../../components/form/DatePicker';
import SearchableDropdown from '../../components/SearchableDropdown';

interface PoItem {
  key?: string;
  productId?: number;
  itemDescription: string;
  hsnSac?: string;
  unit?: string;
  quantity: number;
  rate: number;
  amount?: number;
}

interface Product {
  id: number;
  name: string;
  description?: string;
  hsnCode?: string;
  price?: number;
}

interface Company {
  id: number;
  name: string;
  address: string;
  gstNumber: string;
  email: string;
  phoneNo: string;
  defaultCurrency: string;
}

interface Vendor {
  id: number;
  companyName: string;
  address: string;
  gstNumber: string;
  email: string;
  phone: string;
  contactPerson: string;
  role: string;
}

const AddEditPurchaseOrderForm: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<PoItem[]>([]);
  const [currency, setCurrency] = useState('INR');
  const [cgstRate, setCgstRate] = useState(0);
  const [sgstRate, setSgstRate] = useState(0);
  const [totals, setTotals] = useState({
    subTotal: 0,
    cgst: 0,
    sgst: 0,
    total: 0,
  });

  // Redux state
  const { parties } = useSelector((state: any) => state.party);

  // Company and vendor data
  const [company, setCompany] = useState<Company | null>(null);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [suppliers, setSuppliers] = useState<Vendor[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);

  // Product addition form state
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('');
  const [quantityMethod, setQuantityMethod] = useState('By Quantity');
  const [newItemQuantity, setNewItemQuantity] = useState('');
  const [newItemRate, setNewItemRate] = useState('');
  const [editingItemKey, setEditingItemKey] = useState<string | null>(null);

  // Redux state for categories
  const { categories } = useSelector((state: any) => state.category);

  const validationSchema = Yup.object().shape({
    poDate: Yup.date().required('PO date is required'),
    supplierName: Yup.string().required('Supplier name is required'),
  });

  const [formData, setFormData] = useState(null);

  const getInitialValues = () => ({
    poNumber: formData?.poNumber || '',
    poDate: formData?.poDate
      ? new Date(formData.poDate).toISOString().split('T')[0]
      : '',
    deliveryDate: formData?.deliveryDate
      ? new Date(formData.deliveryDate).toISOString().split('T')[0]
      : '',
    refNumber: formData?.refNumber || '',
    placeOfSupply: formData?.placeOfSupply || '',
    supplierName: formData?.vendorName || '',
    supplierAddress: formData?.vendorAddress || '',
    supplierGstNumber: formData?.vendorGstin || '',
    notes: formData?.notes || '',
    termsConditions: formData?.termsConditions || '',
    deliverToAddress: formData?.deliverToAddress || '',
  });

  // Load vendor and product data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Fetch categories and products
        console.log('Fetching categories...');
        await dispatch(fetchCategories()).unwrap();
        
        console.log('Fetching products...');
        const productsResponse = await dispatch(fetchProducts({ limit: 1000 })).unwrap();
        console.log('Products response:', productsResponse);

        // Handle different response structures
        let productsData = [];
        if (productsResponse?.data?.data) {
          productsData = productsResponse.data.data;
        } else if (productsResponse?.data) {
          productsData = productsResponse.data;
        } else if (Array.isArray(productsResponse)) {
          productsData = productsResponse;
        }

        console.log('Processed products data:', productsData);
        setProducts(Array.isArray(productsData) ? productsData : []);

        if (productsData.length === 0) {
          toast.warning('No products available. Please add products first.');
        }
      } catch (error: any) {
        console.error('Error loading products:', error);
        toast.error(`Failed to load products: ${error.message || error}`);
        setProducts([]);
      }

      // Fetch parties separately
      try {
        console.log('Fetching parties...');
        const partiesResponse = await dispatch(getAllParties()).unwrap();
        console.log('Parties response:', partiesResponse);
      } catch (error: any) {
        console.error('Error loading parties:', error);
        toast.error(`Failed to load suppliers: ${error.message || error}`);
      }

      try {
        if (isEdit && id) {
          const { data: poData } = await dispatch(
            getPurchaseOrderById(id)
          ).unwrap();
          setFormData(poData);
          setItems(
            poData.items?.map((item) => ({
              ...item,
              key: item.id?.toString() || Date.now().toString(),
            })) || []
          );
          setCurrency(poData.currency || 'INR');
          setCgstRate(poData.cgstRate || 6);
          setSgstRate(poData.sgstRate || 6);

          // Vendor selection will be handled by the separate useEffect
        }
      } catch (error: any) {
        console.error('Error loading PO data:', error);
        toast.error(`Failed to load purchase order: ${error.message || error}`);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, isEdit, dispatch]);

  // Update suppliers when parties data changes
  useEffect(() => {
    if (Array.isArray(parties)) {
      console.log('All parties:', parties);
      console.log(
        'Party roles:',
        parties.map((p) => ({
          id: p.id,
          name: p.companyName || p.name,
          role: p.role,
        }))
      );
      const supplierList = parties.filter((party) => party.role === 'Supplier');
      console.log('Filtered suppliers:', supplierList);
      setSuppliers(supplierList);
      setVendors(supplierList);
    }
  }, [parties]);

  // Set selected vendor when both formData and suppliers are available
  useEffect(() => {
    if (isEdit && formData && suppliers.length > 0 && formData.vendorId) {
      const vendor = suppliers.find((v) => v.id === formData.vendorId);
      if (vendor) {
        setSelectedVendor(vendor);
      }
    }
  }, [isEdit, formData, suppliers]);

  useEffect(() => {
    calculateTotals();
  }, [items]);

  const addNewItem = () => {
    const newItem: PoItem = {
      key: Date.now().toString(),
      itemDescription: '',
      quantity: 0,
      rate: 0,
    };
    setItems([...items, newItem]);
  };

  const addProductToItems = () => {
    if (!selectedCategory || !selectedProduct || !selectedUnit || !newItemQuantity || !newItemRate) {
      toast.error('Please fill all required fields');
      return;
    }

    const product = products.find(p => p.id.toString() === selectedProduct);
    if (!product) {
      toast.error('Selected product not found');
      return;
    }

    if (editingItemKey) {
      // Update existing item
      const updatedItems = items.map(item => {
        if (item.key === editingItemKey) {
          return {
            ...item,
            productId: product.id,
            itemDescription: product.name || product.productName || `Product ${product.id}`,
            hsnSac: product.hsnCode || product.category?.hsnCode || '',
            unit: selectedUnit,
            quantity: Number(newItemQuantity),
            rate: Number(newItemRate),
            amount: Number(newItemQuantity) * Number(newItemRate)
          };
        }
        return item;
      });
      setItems(updatedItems);
      setEditingItemKey(null);
      toast.success('Product updated successfully');
    } else {
      // Add new item
      const newItem: PoItem = {
        key: Date.now().toString(),
        productId: product.id,
        itemDescription: product.name || product.productName || `Product ${product.id}`,
        hsnSac: product.hsnCode || product.category?.hsnCode || '',
        unit: selectedUnit,
        quantity: Number(newItemQuantity),
        rate: Number(newItemRate),
        amount: Number(newItemQuantity) * Number(newItemRate)
      };
      setItems([...items, newItem]);
      toast.success('Product added successfully');
    }
    
    // Reset form
    setSelectedCategory('');
    setSelectedSubcategory('');
    setSelectedProduct('');
    setSelectedUnit('');
    setQuantityMethod('By Quantity');
    setNewItemQuantity('');
    setNewItemRate('');
  };

  const removeItem = (key: string) => {
    setItems(items.filter((item) => item.key !== key));
  };

  const updateItem = (key: string, field: string, value: any) => {
    setItems(
      items.map((item) => {
        if (item.key === key) {
          const updatedItem = { ...item, [field]: value };
          if (field === 'quantity' || field === 'rate') {
            updatedItem.amount = updatedItem.quantity * updatedItem.rate;
          }
          return updatedItem;
        }
        return item;
      })
    );
  };

  const handleProductSelect = (key: string, productId: string) => {
    const product = products.find((p) => p.id.toString() === productId);
    if (product) {
      setItems(
        items.map((item) => {
          if (item.key === key) {
            return {
              ...item,
              productId: product.id,
              itemDescription: product.name,
              hsnSac: product.category?.hsnCode || '',
              rate: product.price || 0,
              amount: item.quantity * (product.price || 0),
            };
          }
          return item;
        })
      );
    }
  };

  const getCurrencySymbol = () => {
    const symbols = { INR: '₹', USD: '$', EUR: '€', GBP: '£' };
    return symbols[currency] || '₹';
  };

  const calculateTotals = () => {
    const subTotal = items.reduce((sum, item) => sum + (item.amount || 0), 0);
    const cgst = subTotal * (cgstRate / 100);
    const sgst = subTotal * (sgstRate / 100);
    const total = subTotal + cgst + sgst;
    setTotals({ subTotal, cgst, sgst, total });
  };

  const handleCompanyFieldChange = (field: keyof Company, value: string) => {
    if (company) {
      setCompany((prev) => (prev ? { ...prev, [field]: value } : null));
    }
  };

  const handleVendorFieldChange = (field: keyof Vendor, value: string) => {
    if (selectedVendor) {
      setSelectedVendor((prev) => (prev ? { ...prev, [field]: value } : null));
    }
  };

  const handleSubmit = async (values: any, { setSubmitting }) => {
    if (items.length === 0) {
      toast.error('Please add at least one item');
      setSubmitting(false);
      return;
    }

    // Check required fields
    if (!values.poDate) {
      toast.error('PO date is required');
      setSubmitting(false);
      return;
    }

    if (!values.supplierName) {
      toast.error('Supplier name is required');
      setSubmitting(false);
      return;
    }

    setLoading(true);
    setSubmitting(true);

    try {
      const submitData = {
        companyName: values.companyName,
        companyAddress: values.companyAddress,
        ...(isEdit ? {} : { poNumber: values.poNumber }), // Only include poNumber for creation
        poDate: values.poDate ? new Date(values.poDate).toISOString() : null,
        deliveryDate: values.deliveryDate
          ? new Date(values.deliveryDate).toISOString()
          : null,
        refNumber: values.refNumber,
        placeOfSupply: values.placeOfSupply,
        vendorId: selectedVendor?.id,
        vendorName: values.supplierName,
        vendorAddress: values.supplierAddress,
        vendorGstin: values.supplierGstNumber,
        deliverToAddress: values.deliverToAddress,
        notes: values.notes,
        termsConditions: values.termsConditions,
        currency,
        cgstRate,
        sgstRate,
        items: items.map((item) => ({
          itemDescription: item.itemDescription,
          hsnSac: item.hsnSac,
          quantity: item.quantity,
          rate: item.rate,
          amount: item.quantity * item.rate,
        })),
        gstin: values.gstin,
      };

      if (isEdit) {
        await dispatch(updatePurchaseOrder({ id, data: submitData })).unwrap();
        toast.success('Purchase order updated successfully');
      } else {
        await dispatch(createPurchaseOrder(submitData)).unwrap();
        toast.success('Purchase order created successfully');
      }

      navigate('/purchase-orders');
    } catch (error: any) {
      console.error('Purchase Order Save Error:', error);

      // Error is already the message string from Redux
      toast.error(error);
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  // Removed itemColumns as we're now using native HTML table

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-3">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-3 lg:p-4">
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={() => navigate('/purchase-orders')}
                className="p-3 rounded-lg bg-white shadow-md hover:shadow-lg transition-all duration-300 text-slate-600 hover:text-slate-800"
              >
                <HiArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-slate-800">
                  {isEdit ? 'Edit Purchase Order' : 'Create Purchase Order'}
                </h1>
              </div>
            </div>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-xl shadow-xl border border-slate-200">
          <div className="p-8">
            <Formik
              initialValues={getInitialValues()}
              enableReinitialize={true}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ values, errors, touched, setFieldValue, isSubmitting }) => {
                return (
                  <Form className="space-y-6">
                    {/* Vendor Information */}
                    <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                      <h3 className="text-xl font-semibold text-slate-700 mb-6">
                        Vendor Information
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="mb-2 block text-sm font-medium text-gray-700">
                            Select Vendor{' '}
                            <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={selectedVendor?.id || ''}
                            onChange={(e) => {
                              const vendorId = e.target.value;
                              const vendor = vendors.find(
                                (v) =>
                                  v.id === parseInt(vendorId) &&
                                  v.role === 'Supplier'
                              );
                              setSelectedVendor(vendor || null);

                              if (vendor) {
                                setFieldValue(
                                  'supplierName',
                                  vendor.companyName
                                );
                                setFieldValue(
                                  'supplierAddress',
                                  vendor.address
                                );
                                setFieldValue(
                                  'supplierGstNumber',
                                  vendor.gstNumber
                                );
                              } else {
                                setFieldValue('supplierName', '');
                                setFieldValue('supplierAddress', '');
                                setFieldValue('supplierGstNumber', '');
                              }
                            }}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-300"
                          >
                            <option value="">Choose Vendor</option>
                            {vendors
                              .filter((v) => v.role === 'Supplier')
                              .map((vendor) => (
                                <option key={vendor.id} value={vendor.id}>
                                  {vendor.companyName} -{' '}
                                  {vendor.contactPerson || 'No Contact'}
                                </option>
                              ))}
                          </select>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                              Company Name{' '}
                              <span className="text-red-500">*</span>
                            </label>
                            <Field
                              type="text"
                              name="supplierName"
                              placeholder="Company Name"
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-300"
                            />
                            {touched.supplierName && errors.supplierName && (
                              <div className="mt-1 text-sm text-red-600">
                                {errors.supplierName}
                              </div>
                            )}
                          </div>
                          <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                              GSTIN
                            </label>
                            <Field
                              type="text"
                              name="supplierGstNumber"
                              placeholder="GSTIN"
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-300"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="mb-2 block text-sm font-medium text-gray-700">
                            Address
                          </label>
                          <Field
                            as="textarea"
                            name="supplierAddress"
                            rows={3}
                            placeholder="Address"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-300"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Currency and Tax Settings */}
                    <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                      <h3 className="text-xl font-semibold text-slate-700 mb-6">
                        Currency & Tax Settings
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="mb-2 block text-sm font-medium text-gray-700">
                            Currency
                          </label>
                          <select
                            value={currency}
                            onChange={(e) => setCurrency(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-300"
                          >
                            <option value="INR">INR (₹)</option>
                            <option value="USD">USD ($)</option>
                            <option value="EUR">EUR (€)</option>
                            <option value="GBP">GBP (£)</option>
                          </select>
                        </div>
                        <div>
                          <label className="mb-2 block text-sm font-medium text-gray-700">
                            CGST %
                          </label>
                          <input
                            type="number"
                            min={0}
                            max={50}
                            step="0.01"
                            value={cgstRate || ''}
                            onChange={(e) =>
                              setCgstRate(Number(e.target.value) || 0)
                            }
                            placeholder="Enter CGST %"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-300"
                          />
                        </div>
                        <div>
                          <label className="mb-2 block text-sm font-medium text-gray-700">
                            SGST %
                          </label>
                          <input
                            type="number"
                            min={0}
                            max={50}
                            step="0.01"
                            value={sgstRate || ''}
                            onChange={(e) =>
                              setSgstRate(Number(e.target.value) || 0)
                            }
                            placeholder="Enter SGST %"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-300"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Purchase Order Details */}
                    <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
                      <h4 className="text-base font-medium text-gray-800 dark:text-gray-200 mb-4">
                        Purchase Order Details
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            PO Number
                          </label>
                          <Field
                            type="text"
                            name="poNumber"
                            placeholder="PO Number"
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            PO Date <span className="text-red-500">*</span>
                          </label>
                          <DatePicker
                            value={values.poDate}
                            onChange={(value) => setFieldValue('poDate', value)}
                            placeholder="Select PO date"
                          />
                          {touched.poDate && errors.poDate && (
                            <div className="mt-1 text-sm text-red-600">
                              {errors.poDate}
                            </div>
                          )}
                        </div>
                        <div>
                          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Delivery Date
                          </label>
                          <DatePicker
                            value={values.deliveryDate}
                            onChange={(value) =>
                              setFieldValue('deliveryDate', value)
                            }
                            placeholder="Select delivery date"
                          />
                        </div>
                        <div>
                          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Reference Number
                          </label>
                          <Field
                            type="text"
                            name="refNumber"
                            placeholder="Reference Number"
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Place of Supply
                          </label>
                          <Field
                            type="text"
                            name="placeOfSupply"
                            placeholder="Place of Supply"
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Deliver To Section */}
                    <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                      <h3 className="text-xl font-semibold text-slate-700 mb-6">
                        Deliver To
                      </h3>
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                          Delivery Address
                        </label>
                        <Field
                          as="textarea"
                          name="deliverToAddress"
                          rows={4}
                          placeholder="Enter complete delivery address."
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-300"
                        />
                      </div>
                    </div>

                    {/* Product Addition Section */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6 dark:border-gray-700 dark:bg-gray-800">
                      <h4 className="text-base font-medium text-gray-800 dark:text-gray-200 mb-4">
                        Add Product
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Category <span className="text-red-500">*</span>
                          </label>
                          <select
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                            value={selectedCategory}
                            onChange={(e) => {
                              setSelectedCategory(e.target.value);
                              setSelectedSubcategory('');
                              setSelectedProduct('');
                              setSelectedUnit('');
                            }}
                          >
                            <option value="">Select Category</option>
                            {Array.isArray(categories) && categories.map((cat) => (
                              <option key={cat.id} value={cat.id}>
                                {cat.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Subcategory
                          </label>
                          <select
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                            value={selectedSubcategory}
                            onChange={(e) => {
                              setSelectedSubcategory(e.target.value);
                              setSelectedProduct('');
                              setSelectedUnit('');
                            }}
                            disabled={!selectedCategory}
                          >
                            <option value="">Select Subcategory</option>
                            {selectedCategory && (() => {
                              const category = categories.find(c => c.id.toString() === selectedCategory);
                              return category?.subcategories?.map((subcat) => (
                                <option key={subcat.id} value={subcat.id}>
                                  {subcat.name}
                                </option>
                              ));
                            })()}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Product <span className="text-red-500">*</span>
                          </label>
                          <select
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                            value={selectedProduct}
                            onChange={(e) => {
                              setSelectedProduct(e.target.value);
                              setSelectedUnit('');
                              
                              if (e.target.value) {
                                const product = products.find(p => p.id.toString() === e.target.value);
                                if (product && (product.rate || product.price || product.unitPrice)) {
                                  setNewItemRate((product.rate || product.price || product.unitPrice).toString());
                                }
                              }
                            }}
                            disabled={!selectedCategory}
                          >
                            <option value="">Choose product</option>
                            {(() => {
                              const filteredProducts = products.filter(product => {
                                const categoryMatch = !selectedCategory || 
                                  product.categoryId?.toString() === selectedCategory ||
                                  product.category?.id?.toString() === selectedCategory;
                                const subcategoryMatch = !selectedSubcategory || 
                                  product.subcategoryId?.toString() === selectedSubcategory ||
                                  product.subCategory?.id?.toString() === selectedSubcategory;
                                return categoryMatch && subcategoryMatch;
                              });
                              
                              return filteredProducts.map((product) => (
                                <option key={product.id} value={product.id}>
                                  {product.name || product.productName || `Product ${product.id}`}
                                </option>
                              ));
                            })()}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Unit <span className="text-red-500">*</span>
                          </label>
                          <select
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                            value={selectedUnit}
                            onChange={(e) => setSelectedUnit(e.target.value)}
                            disabled={!selectedCategory}
                          >
                            <option value="">Choose unit</option>
                            {(() => {
                              const category = categories.find(c => c.id.toString() === selectedCategory);
                              const packagingHierarchy = category?.packagingHierarchy || [];
                              const availableUnits = [];

                              if (packagingHierarchy.length > 0) {
                                packagingHierarchy.forEach((level, levelIdx) => {
                                  availableUnits.push(
                                    <option key={`from-${levelIdx}`} value={level.from}>
                                      {level.from}
                                    </option>
                                  );
                                });

                                const lastLevel = packagingHierarchy[packagingHierarchy.length - 1];
                                if (lastLevel?.to) {
                                  availableUnits.push(
                                    <option key={`to-final`} value={lastLevel.to}>
                                      {lastLevel.to}
                                    </option>
                                  );
                                }
                              } else {
                                const subcategory = category?.subcategories?.find(
                                  s => s.id.toString() === selectedSubcategory
                                );

                                const unitSet = new Set();
                                if (category?.primary_unit) unitSet.add(category.primary_unit);
                                if (category?.secondary_unit) unitSet.add(category.secondary_unit);
                                if (subcategory?.primary_unit) unitSet.add(subcategory.primary_unit);
                                if (subcategory?.secondary_unit) unitSet.add(subcategory.secondary_unit);

                                if (unitSet.size === 0) {
                                  ['pcs', 'box', 'kg', 'pieces', 'cartons'].forEach(unit => unitSet.add(unit));
                                }

                                Array.from(unitSet).forEach(unit => {
                                  availableUnits.push(
                                    <option key={unit} value={unit}>
                                      {unit.charAt(0).toUpperCase() + unit.slice(1)}
                                    </option>
                                  );
                                });
                              }

                              return availableUnits;
                            })()}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Quantity Input Method
                          </label>
                          <div className="flex gap-4 pt-2">
                            <label className="flex items-center">
                              <input
                                type="radio"
                                value="By Quantity"
                                checked={quantityMethod === 'By Quantity'}
                                onChange={(e) => setQuantityMethod(e.target.value)}
                                className="mr-2 text-blue-600"
                              />
                              By Quantity
                            </label>
                            <label className="flex items-center">
                              <input
                                type="radio"
                                value="By Weight (KG)"
                                checked={quantityMethod === 'By Weight (KG)'}
                                onChange={(e) => setQuantityMethod(e.target.value)}
                                className="mr-2 text-blue-600"
                              />
                              By Weight (KG)
                            </label>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Quantity <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            value={newItemQuantity}
                            min={0}
                            step="0.01"
                            placeholder="Enter quantity"
                            onChange={(e) => setNewItemQuantity(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Rate per Unit <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            value={newItemRate}
                            min={0}
                            step="0.01"
                            placeholder="Enter rate per unit"
                            onChange={(e) => setNewItemRate(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                          />
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={addProductToItems}
                          className="px-6 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 inline-flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          {editingItemKey ? 'Update Product' : 'Add Product'}
                        </button>
                        {editingItemKey && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingItemKey(null);
                              setSelectedCategory('');
                              setSelectedSubcategory('');
                              setSelectedProduct('');
                              setSelectedUnit('');
                              setNewItemQuantity('');
                              setNewItemRate('');
                            }}
                            className="px-6 py-2 bg-gray-500 text-white font-medium rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 inline-flex items-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Cancel Edit
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Items Table */}
                    {items.length > 0 && (
                      <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                        <h4 className="text-base font-medium text-gray-800 dark:text-gray-200 mb-4">
                          Added Items
                        </h4>
                        
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                  #
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                  Item Description
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                  HSN/SAC
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                  Unit
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                  Quantity
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                  Rate
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                  Amount
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                              {items.map((item, index) => (
                                <tr key={item.key} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                  <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                                    {index + 1}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                                    {item.itemDescription}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                                    {item.hsnSac || ''}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                                    {item.unit || 'pcs'}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                                    {item.quantity || 0}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                                    {item.rate || 0}
                                  </td>
                                  <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                                    {getCurrencySymbol()}{((item.quantity || 0) * (item.rate || 0)).toFixed(2)}
                                  </td>
                                  <td className="px-4 py-3 text-sm">
                                    <div className="flex gap-2">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const product = products.find(p => p.id === item.productId);
                                          if (product) {
                                            setEditingItemKey(item.key!);
                                            setSelectedCategory(product.categoryId?.toString() || '');
                                            setSelectedSubcategory(product.subcategoryId?.toString() || '');
                                            setSelectedProduct(product.id.toString());
                                            setSelectedUnit(item.unit || 'pcs');
                                            setNewItemQuantity(item.quantity.toString());
                                            setNewItemRate(item.rate.toString());
                                          }
                                        }}
                                        className="text-blue-600 hover:text-blue-800 focus:outline-none dark:text-blue-400 dark:hover:text-blue-300"
                                        title="Edit item"
                                      >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => removeItem(item.key!)}
                                        className="text-red-600 hover:text-red-800 focus:outline-none dark:text-red-400 dark:hover:text-red-300"
                                        title="Delete item"
                                      >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Order Summary */}
                    <div className="rounded-lg border border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 dark:border-gray-700 dark:from-gray-800 dark:to-gray-700">
                      <h4 className="text-base font-medium text-gray-800 dark:text-gray-200 mb-4">
                        Order Summary
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-3 bg-white rounded-lg shadow-sm dark:bg-gray-800">
                          <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                            {getCurrencySymbol()}
                            {totals.subTotal.toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            Sub Total
                          </div>
                        </div>
                        <div className="text-center p-3 bg-white rounded-lg shadow-sm dark:bg-gray-800">
                          <div className="text-xl font-bold text-green-600 dark:text-green-400">
                            {getCurrencySymbol()}
                            {totals.cgst.toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            CGST ({cgstRate}%)
                          </div>
                        </div>
                        <div className="text-center p-3 bg-white rounded-lg shadow-sm dark:bg-gray-800">
                          <div className="text-xl font-bold text-green-600 dark:text-green-400">
                            {getCurrencySymbol()}
                            {totals.sgst.toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            SGST ({sgstRate}%)
                          </div>
                        </div>
                        <div className="text-center p-3 bg-white rounded-lg shadow-sm border-2 border-blue-200 dark:bg-gray-800 dark:border-blue-600">
                          <div className="text-xl font-bold text-blue-700 dark:text-blue-300">
                            {getCurrencySymbol()}
                            {totals.total.toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 font-medium">
                            Total Amount
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Additional Information */}
                    <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
                      <h4 className="text-base font-medium text-gray-800 dark:text-gray-200 mb-4">
                        Additional Information
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Notes
                          </label>
                          <Field
                            as="textarea"
                            name="notes"
                            rows={4}
                            placeholder="Notes"
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Terms & Conditions
                          </label>
                          <Field
                            as="textarea"
                            name="termsConditions"
                            rows={4}
                            placeholder="Terms & Conditions"
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                          />
                        </div>
                      </div>
                    </div>



                    {/* Submit Buttons */}
                    <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={() => navigate('/purchase-orders')}
                        className="px-6 py-3 rounded-lg border border-gray-300 text-slate-600 hover:bg-gray-50 transition-all duration-300"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={loading || isSubmitting}
                        className="px-6 py-3 rounded-lg font-semibold text-white bg-slate-700 hover:bg-slate-800 transition-all duration-300 hover:shadow-xl disabled:opacity-50 shadow-lg"
                      >
                        {loading || isSubmitting ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            {isEdit ? 'Updating...' : 'Creating...'}
                          </div>
                        ) : (
                          <>
                            <HiCheckCircle className="w-5 h-5 mr-2 inline" />
                            {isEdit
                              ? 'Update Purchase Order'
                              : 'Create Purchase Order'}
                          </>
                        )}
                      </button>
                    </div>
                  </Form>
                );
              }}
            </Formik>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddEditPurchaseOrderForm;
