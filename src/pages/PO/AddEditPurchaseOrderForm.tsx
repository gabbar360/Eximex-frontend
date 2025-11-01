import { useDispatch, useSelector } from 'react-redux';
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { getPurchaseOrderById, updatePurchaseOrder, createPurchaseOrder, getFormData } from '../../features/purchaseOrderSlice';
import { fetchProducts } from '../../features/productSlice';

import PageBreadCrumb from '../../components/common/PageBreadCrumb';


import DatePicker from '../../components/form/DatePicker';
import SearchableDropdown from '../../components/SearchableDropdown';

interface PoItem {
  key?: string;
  productId?: number;
  itemDescription: string;
  hsnSac?: string;
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
  const [cgstRate, setCgstRate] = useState(6);
  const [sgstRate, setSgstRate] = useState(6);
  const [totals, setTotals] = useState({
    subTotal: 0,
    cgst: 0,
    sgst: 0,
    total: 0,
  });

  // Company and vendor data
  const [company, setCompany] = useState<Company | null>(null);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [suppliers, setSuppliers] = useState<Vendor[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);

  const validationSchema = Yup.object().shape({
    companyName: Yup.string().required('Company name is required'),
    poDate: Yup.date().required('PO date is required'),
    supplierName: Yup.string().required('Supplier name is required'),
  });

  const [formData, setFormData] = useState(null);

  const getInitialValues = () => ({
    companyName: formData?.companyName || company?.name || 'vegnar-greens',
    companyAddress: formData?.companyAddress || company?.address || '',
    gstin:
      formData?.deliverToGstin ||
      formData?.companyGstin ||
      company?.gstNumber ||
      '',
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
    deliverToName: formData?.deliverToName || company?.name || 'vegnar-greens',
    deliverToAddress: formData?.deliverToAddress || company?.address || '',
    deliverToGstin: formData?.deliverToGstin || company?.gstNumber || '',
    deliverToContact: formData?.deliverToContact || company?.phoneNo || '',
    notes: formData?.notes || '',
    termsConditions: formData?.termsConditions || '',
    signatureCompany: formData?.signatureCompany || '',
    signatureTitle: formData?.signatureTitle || '',
    authorizedBy: formData?.authorizedBy || '',
  });

  // Load company and vendor data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [formResponse, productsResponse] = await Promise.all([
          dispatch(getFormData()).unwrap(),
          dispatch(fetchProducts()).unwrap(),
        ]);

        // Set company and vendors data (same as old working code)
        setCompany(formResponse.data.company);
        setVendors(formResponse.data.vendors);
        console.log('Form Data Response:', formResponse);
        console.log('Vendors Data:', formResponse.data.vendors);
        
        // Set products data
        console.log('Products API Response:', productsResponse);
        const productsData = productsResponse?.products || productsResponse?.data || [];
        setProducts(Array.isArray(productsData) ? productsData : []);
        
        // Filter only suppliers (same as old working code)
        const supplierList = formResponse.data.vendors.filter(
          (vendor) => vendor.role === 'Supplier'
        );
        setSuppliers(supplierList);
        console.log('Filtered Suppliers:', supplierList);


        if (isEdit && id) {
          const { data: poData } =
            await dispatch(getPurchaseOrderById(id)).unwrap();
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

          if (poData.vendorId) {
            const vendor = supplierList.find((v) => v.id === poData.vendorId);
            setSelectedVendor(vendor || null);
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();

    if (!isEdit) {
      addNewItem();
    }
  }, [id, isEdit]);

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
    if (!values.companyName) {
      toast.error('Company name is required');
      setSubmitting(false);
      return;
    }

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
        deliverToName: values.deliverToName,
        deliverToAddress: values.deliverToAddress,
        deliverToGstin: values.deliverToGstin,
        deliverToContact: values.deliverToContact,
        notes: values.notes,
        termsConditions: values.termsConditions,
        signatureCompany: values.signatureCompany,
        signatureTitle: values.signatureTitle,
        authorizedBy: values.authorizedBy,
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
    } catch (error) {
      console.error('Purchase Order Save Error:', error);
      console.error('Error response:', error.response);
      console.error('Error message:', error.message);
      console.error('Submit data:', submitData);
      
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save purchase order';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  // Removed itemColumns as we're now using native HTML table

  return (
    <>
      <PageBreadCrumb
        items={[
          { title: 'Dashboard', href: '/' },
          { title: 'Purchase Orders', href: '/purchase-orders' },
          { title: isEdit ? 'Edit Purchase Order' : 'Create Purchase Order' },
        ]}
      />

      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-6">
          {isEdit ? 'Edit Purchase Order' : 'Create Purchase Order'}
        </h3>

        <Formik
          initialValues={getInitialValues()}
          enableReinitialize={true}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ values, errors, touched, setFieldValue, isSubmitting }) => {
            return (
              <Form className="space-y-6">
                {/* Company Information */}
                <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-base font-medium text-gray-800 dark:text-gray-200">
                      Company Information
                    </h4>
                    <button
                      type="button"
                      onClick={() => {
                        if (company) {
                          setFieldValue('companyName', company.name, false);
                          setFieldValue(
                            'companyAddress',
                            company.address,
                            false
                          );
                          setFieldValue('gstin', company.gstNumber, false);
                          setFieldValue(
                            'deliverToGstin',
                            company.gstNumber,
                            false
                          );
                        }
                      }}
                      className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                    >
                      Load Company Data
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Company Name <span className="text-red-500">*</span>
                        </label>
                        <Field
                          name="companyName"
                          placeholder="Enter company name"
                          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                        />
                        {touched.companyName && errors.companyName && (
                          <div className="mt-1 text-sm text-red-600">
                            {errors.companyName}
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Currency
                        </label>
                        <select
                          value={currency}
                          onChange={(e) => setCurrency(e.target.value)}
                          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                        >
                          <option value="INR">INR (₹)</option>
                          <option value="USD">USD ($)</option>
                          <option value="EUR">EUR (€)</option>
                          <option value="GBP">GBP (£)</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Company Address
                        </label>
                        <Field
                          as="textarea"
                          name="companyAddress"
                          rows={3}
                          placeholder="Enter complete address"
                          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                          GSTIN Number
                        </label>
                        <input
                          type="text"
                          name="gstin"
                          value={values.gstin}
                          placeholder="Enter GSTIN"
                          onChange={(e) => {
                            setFieldValue('gstin', e.target.value);
                            setFieldValue('deliverToGstin', e.target.value);
                            if (company) {
                              setCompany((prev) =>
                                prev
                                  ? { ...prev, gstNumber: e.target.value }
                                  : null
                              );
                            }
                          }}
                          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                          CGST %
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={50}
                          value={cgstRate}
                          onChange={(e) => setCgstRate(Number(e.target.value))}
                          placeholder="0"
                          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                          SGST %
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={50}
                          value={sgstRate}
                          onChange={(e) => setSgstRate(Number(e.target.value))}
                          placeholder="0"
                          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                        />
                      </div>
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
                        placeholder="PO-00002"
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
                        placeholder="Enter reference"
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
                        placeholder="Gujarat (24)"
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Hidden Deliver To Fields - Auto-filled with company details */}
                <Field type="hidden" name="deliverToName" />
                <Field type="hidden" name="deliverToAddress" />
                <Field type="hidden" name="deliverToGstin" />
                <Field type="hidden" name="deliverToContact" />

                {/* Vendor Information */}
                <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
                  <h4 className="text-base font-medium text-gray-800 dark:text-gray-200 mb-4">
                    Vendor Information
                  </h4>
                  <div className="rounded-lg border border-gray-300 bg-white p-4 dark:border-gray-600 dark:bg-gray-700">
                    <div className="flex justify-between items-center mb-3">
                      <h5 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                        Vendor Details
                      </h5>
                      <button
                        type="button"
                        onClick={() => {
                          if (selectedVendor) {
                            setFieldValue(
                              'supplierName',
                              selectedVendor.companyName,
                              false
                            );
                            setFieldValue(
                              'supplierAddress',
                              selectedVendor.address,
                              false
                            );
                            setFieldValue(
                              'supplierGstNumber',
                              selectedVendor.gstNumber,
                              false
                            );
                          }
                        }}
                        className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                      >
                        Load Vendor Data
                      </button>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Select Vendor <span className="text-red-500">*</span>
                        </label>

                        <select
                          value={selectedVendor?.id || ''}
                          onChange={(e) => {
                            const vendorId = e.target.value;
                            const vendor = suppliers.find(
                              (v) => v.id === parseInt(vendorId)
                            );
                            setSelectedVendor(vendor || null);

                            if (vendor) {
                              console.log('Selected vendor:', vendor); // Debug log
                              setFieldValue('supplierName', vendor.companyName);
                              setFieldValue('supplierAddress', vendor.address);
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
                          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                        >
                          <option value="">
                            Choose Vendor ({suppliers.length} available)
                          </option>
                          {suppliers.map((vendor) => (
                            <option key={vendor.id} value={vendor.id}>
                              {vendor.companyName} -{' '}
                              {vendor.contactPerson || 'No Contact'}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Company Name <span className="text-red-500">*</span>
                        </label>
                        <Field
                          type="text"
                          name="supplierName"
                          placeholder="Enter vendor company name"
                          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                        />
                        {touched.supplierName && errors.supplierName && (
                          <div className="mt-1 text-sm text-red-600">
                            {errors.supplierName}
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Address
                        </label>
                        <Field
                          as="textarea"
                          name="supplierAddress"
                          rows={3}
                          placeholder="Enter vendor address"
                          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                          GSTIN
                        </label>
                        <Field
                          type="text"
                          name="supplierGstNumber"
                          placeholder="Enter GSTIN number"
                          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Items Section */}
                <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-base font-medium text-gray-800 dark:text-gray-200">
                      Purchase Order Items
                    </h4>
                    <button
                      type="button"
                      onClick={addNewItem}
                      className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      Add Item
                    </button>
                  </div>
                  <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-600 dark:bg-gray-700 overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          <th className="px-3 py-2 text-left font-medium text-gray-700 dark:text-gray-300">
                            #
                          </th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700 dark:text-gray-300">
                            Item & Description
                          </th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700 dark:text-gray-300">
                            HSN/SAC
                          </th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700 dark:text-gray-300">
                            Qty
                          </th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700 dark:text-gray-300">
                            Rate
                          </th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700 dark:text-gray-300">
                            Amount
                          </th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700 dark:text-gray-300"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                        {items.map((item, index) => (
                          <tr
                            key={item.key}
                            className="hover:bg-gray-50 dark:hover:bg-gray-800"
                          >
                            <td className="px-3 py-2 text-gray-900 dark:text-gray-100">
                              {index + 1}
                            </td>
                            <td className="px-3 py-2">
                              <div className="space-y-2">
                                <select
                                  value={item.productId?.toString() || ''}
                                  onChange={(e) =>
                                    handleProductSelect(
                                      item.key!,
                                      e.target.value
                                    )
                                  }
                                  className="w-full rounded border border-gray-300 bg-white px-2 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                >
                                  <option value="">Select product</option>
                                  {products.map((product) => (
                                    <option
                                      key={product.id}
                                      value={product.id.toString()}
                                    >
                                      {product.name}
                                    </option>
                                  ))}
                                </select>
                                <textarea
                                  value={item.itemDescription}
                                  placeholder="Enter item description"
                                  rows={2}
                                  onChange={(e) =>
                                    updateItem(
                                      item.key!,
                                      'itemDescription',
                                      e.target.value
                                    )
                                  }
                                  className="w-full rounded border border-gray-300 bg-white px-2 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                />
                              </div>
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="text"
                                value={item.hsnSac}
                                placeholder="HSN/SAC"
                                onChange={(e) =>
                                  updateItem(
                                    item.key!,
                                    'hsnSac',
                                    e.target.value
                                  )
                                }
                                className="w-full rounded border border-gray-300 bg-white px-2 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="number"
                                value={item.quantity || ''}
                                min={0}
                                placeholder="Qty"
                                onChange={(e) =>
                                  updateItem(
                                    item.key!,
                                    'quantity',
                                    Number(e.target.value) || 0
                                  )
                                }
                                className="w-full rounded border border-gray-300 bg-white px-2 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="number"
                                value={item.rate || ''}
                                min={0}
                                step="0.01"
                                placeholder="Rate"
                                onChange={(e) =>
                                  updateItem(
                                    item.key!,
                                    'rate',
                                    Number(e.target.value) || 0
                                  )
                                }
                                className="w-full rounded border border-gray-300 bg-white px-2 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                              />
                            </td>
                            <td className="px-3 py-2 font-medium text-gray-900 dark:text-gray-100">
                              {getCurrencySymbol()}
                              {(
                                (item.quantity || 0) * (item.rate || 0)
                              ).toFixed(2)}
                            </td>
                            <td className="px-3 py-2">
                              <button
                                type="button"
                                onClick={() => {
                                  if (window.confirm('Remove item?')) {
                                    removeItem(item.key!);
                                  }
                                }}
                                className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                              >
                                <svg
                                  className="w-4 h-4"
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
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

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
                        placeholder="Enter any special notes or instructions..."
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
                        placeholder="Enter terms and conditions..."
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Authorization Section */}
                <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
                  <h4 className="text-base font-medium text-gray-800 dark:text-gray-200 mb-4">
                    Authorization
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        For Company
                      </label>
                      <Field
                        type="text"
                        name="signatureCompany"
                        placeholder="Company Name"
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Title
                      </label>
                      <Field
                        type="text"
                        name="signatureTitle"
                        placeholder="Designation"
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Authorized By
                      </label>
                      <Field
                        type="text"
                        name="authorizedBy"
                        placeholder="Authorized Person Name"
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="submit"
                    disabled={loading || isSubmitting}
                    className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {loading || isSubmitting ? (
                      <>
                        <svg
                          className="animate-spin h-4 w-4"
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
                      </>
                    ) : (
                      <>
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                          />
                        </svg>
                        {isEdit
                          ? 'Update Purchase Order'
                          : 'Create Purchase Order'}
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/purchase-orders')}
                    className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    Cancel
                  </button>
                </div>
              </Form>
            );
          }}
        </Formik>
      </div>
    </>
  );
};

export default AddEditPurchaseOrderForm;
