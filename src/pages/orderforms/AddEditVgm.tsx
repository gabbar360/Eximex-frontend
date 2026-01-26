import { useDispatch } from 'react-redux';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { fetchVgmById, createVgm, updateVgm } from '../../features/vgmSlice';
import {
  HiArrowLeft,
  HiCheckCircle,
  HiChevronDown,
  HiMagnifyingGlass,
} from 'react-icons/hi2';

import DatePicker from '../../components/form/DatePicker';
import OrderSelector from '../../components/order/OrderSelector';

interface VgmFormData {
  piInvoiceId: number;
  productPackagingStepId: string;
  verifiedGrossMass: string;
  method: string;
  cargoWeight: string;
  packagingWeight: string;
  containerTareWeight: string;
  verifiedBy: string;
  verifierPosition: string;
  verificationDate: string;
  weighingLocation: string;
  containerType: string;
  hazardousUnNo: string;
  imdgClass: string;
  remarks: string;
}

const AddEditVgm: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { id } = useParams();
  const isEdit = !!id && id !== 'create';
  const [selectedOrder, setSelectedOrder] = useState<Record<string, unknown> | null>(null);

  const [formData, setFormData] = useState<VgmFormData>({
    piInvoiceId: parseInt(searchParams.get('piInvoiceId') || '0') || 0,
    productPackagingStepId: '',
    verifiedGrossMass: '',
    method: 'METHOD_1',
    cargoWeight: '',
    packagingWeight: '',
    containerTareWeight: '',
    verifiedBy: '',
    verifierPosition: '',
    verificationDate: new Date().toISOString().split('T')[0],
    weighingLocation: '',
    containerType: 'NORMAL',
    hazardousUnNo: '',
    imdgClass: '',
    remarks: '',
  });

  const [loading, setLoading] = useState(false);

  // Dropdown states
  const [methodSearch, setMethodSearch] = useState('');
  const [containerTypeSearch, setContainerTypeSearch] = useState('');
  const [showMethodDropdown, setShowMethodDropdown] = useState(false);
  const [showContainerTypeDropdown, setShowContainerTypeDropdown] =
    useState(false);

  const methodRef = useRef(null);
  const containerTypeRef = useRef(null);

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

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (methodRef.current && !methodRef.current.contains(event.target)) {
        setShowMethodDropdown(false);
      }
      if (
        containerTypeRef.current &&
        !containerTypeRef.current.contains(event.target)
      ) {
        setShowContainerTypeDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOrderSelect = (orderId: number, orderData: Record<string, unknown>) => {
    setSelectedOrder(orderData);
    setFormData((prev) => ({
      ...prev,
      piInvoiceId: orderData.piInvoiceId || orderData.id,
    }));
  };

  const fetchVgmData = useCallback(async () => {
    if (!id || id === 'create') {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await dispatch(fetchVgmById(id)).unwrap();

      if (data.success) {
        const vgm = data.data;
        setFormData({
          piInvoiceId: vgm.piInvoiceId,
          productPackagingStepId: vgm.productPackagingStepId?.toString() || '',
          verifiedGrossMass: vgm.verifiedGrossMass.toString(),
          method: vgm.method,
          cargoWeight: vgm.cargoWeight?.toString() || '',
          packagingWeight: vgm.packagingWeight?.toString() || '',
          containerTareWeight: vgm.containerTareWeight?.toString() || '',
          verifiedBy: vgm.verifiedBy,
          verifierPosition: vgm.verifierPosition || '',
          verificationDate: vgm.verificationDate.split('T')[0],
          weighingLocation: vgm.weighingLocation || '',
          containerType: vgm.containerType || 'NORMAL',
          hazardousUnNo: vgm.hazardousUnNo || '',
          imdgClass: vgm.imdgClass || '',
          remarks: vgm.remarks || '',
        });
      }
    } catch (error) {
      console.error('Error fetching VGM data:', error);
      toast.error(error || 'Failed to load VGM data');
    } finally {
      setLoading(false);
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (isEdit && id && id !== 'create') {
      fetchVgmData();
    }
  }, [id, isEdit, fetchVgmData]);

  const handleInputChange = (field: keyof VgmFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Auto-calc for Method 2
  useEffect(() => {
    if (formData.method === 'METHOD_2') {
      const cargo = parseFloat(formData.cargoWeight) || 0;
      const packaging = parseFloat(formData.packagingWeight) || 0;
      const tare = parseFloat(formData.containerTareWeight) || 0;

      const total = cargo + packaging + tare;

      setFormData((prev) => ({
        ...prev,
        verifiedGrossMass: total ? total.toFixed(2) : '',
      }));
    }
  }, [
    formData.method,
    formData.cargoWeight,
    formData.packagingWeight,
    formData.containerTareWeight,
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isEdit && !selectedOrder) {
      toast.error('Please select an order');
      return;
    }

    if (!formData.piInvoiceId) {
      toast.error('PI Invoice ID is required');
      return;
    }

    if (!formData.verifiedGrossMass) {
      toast.error('Verified Gross Mass is required');
      return;
    }

    if (!formData.verifiedBy) {
      toast.error('Verified By is required');
      return;
    }

    if (formData.method === 'METHOD_2') {
      if (
        !formData.cargoWeight ||
        !formData.packagingWeight ||
        !formData.containerTareWeight
      ) {
        toast.error('All weight fields are required for Method 2');
        return;
      }
    }

    if (formData.containerType === 'HAZARDOUS') {
      if (!formData.hazardousUnNo || !formData.imdgClass) {
        toast.error(
          'UN Number and IMDG Class are required for hazardous containers'
        );
        return;
      }
    }

    try {
      setLoading(true);

      const submitData = {
        ...formData,
        piInvoiceId: parseInt(formData.piInvoiceId.toString()),
        productPackagingStepId: formData.productPackagingStepId
          ? parseInt(formData.productPackagingStepId)
          : null,
        verifiedGrossMass: parseFloat(formData.verifiedGrossMass),
        cargoWeight: formData.cargoWeight
          ? parseFloat(formData.cargoWeight)
          : null,
        packagingWeight: formData.packagingWeight
          ? parseFloat(formData.packagingWeight)
          : null,
        containerTareWeight: formData.containerTareWeight
          ? parseFloat(formData.containerTareWeight)
          : null,
      };

      let data;
      if (isEdit) {
        data = await dispatch(updateVgm({ id, vgmData: submitData })).unwrap();
      } else {
        data = await dispatch(createVgm(submitData)).unwrap();
      }

      if (data.success) {
        toast.success(data.message);
        navigate('/orders/vgm');
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error saving VGM:', error);
      toast.error(error || 'Failed to save VGM document');
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEdit) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-slate-600 mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading...</p>
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
                  onClick={() => navigate('/orders/vgm')}
                  className="p-3 rounded-lg bg-slate-700 text-white hover:bg-slate-800 transition-all duration-300 hover:shadow-lg"
                >
                  <HiArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 mb-1">
                    {isEdit ? 'Edit VGM Document' : 'Create VGM Document'}
                  </h1>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 lg:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Order Selection */}
            {!isEdit && (
              <OrderSelector
                selectedOrderId={selectedOrder?.id || null}
                onOrderSelect={handleOrderSelect}
                placeholder="Select Order for VGM"
                filterType="vgm"
              />
            )}

            {selectedOrder && (
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-sm text-slate-700">
                  Selected: <strong>{selectedOrder.orderNumber}</strong> -{' '}
                  {selectedOrder.piNumber} ({selectedOrder.buyerName})
                </p>
              </div>
            )}

            {/* VGM Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Verified Gross Mass (KG) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.verifiedGrossMass}
                  onChange={(e) =>
                    handleInputChange('verifiedGrossMass', e.target.value)
                  }
                  placeholder="e.g., 25000.50"
                  required
                  disabled={formData.method === 'METHOD_2'}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 disabled:bg-gray-100 transition-all duration-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Weighing Method *
                </label>
                <SearchableDropdown
                  label="Weighing Method"
                  value={formData.method}
                  options={[
                    {
                      id: 'METHOD_1',
                      name: 'Method 1 - Weigh packed container',
                    },
                    {
                      id: 'METHOD_2',
                      name: 'Method 2 - Weigh contents + tare weight',
                    },
                  ].filter((method) =>
                    method.name
                      .toLowerCase()
                      .includes(methodSearch.toLowerCase())
                  )}
                  onSelect={(method) => {
                    handleInputChange('method', method);
                    setMethodSearch('');
                  }}
                  searchValue={methodSearch}
                  onSearchChange={setMethodSearch}
                  isOpen={showMethodDropdown}
                  onToggle={() => setShowMethodDropdown(!showMethodDropdown)}
                  placeholder="Select Weighing Method"
                  dropdownRef={methodRef}
                />
              </div>
            </div>

            {/* Method 2 Weight Breakdown */}
            {formData.method === 'METHOD_2' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6 bg-slate-50 rounded-lg border border-slate-200">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Cargo Weight (KG) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.cargoWeight}
                    onChange={(e) =>
                      handleInputChange('cargoWeight', e.target.value)
                    }
                    required={formData.method === 'METHOD_2'}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Packaging Weight (KG) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.packagingWeight}
                    onChange={(e) =>
                      handleInputChange('packagingWeight', e.target.value)
                    }
                    required={formData.method === 'METHOD_2'}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Container Tare Weight (KG) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.containerTareWeight}
                    onChange={(e) =>
                      handleInputChange('containerTareWeight', e.target.value)
                    }
                    required={formData.method === 'METHOD_2'}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-300"
                  />
                </div>
              </div>
            )}

            {/* Verification Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Verified By *
                </label>
                <input
                  type="text"
                  value={formData.verifiedBy}
                  onChange={(e) =>
                    handleInputChange('verifiedBy', e.target.value)
                  }
                  placeholder="Name of authorized person"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Position
                </label>
                <input
                  type="text"
                  value={formData.verifierPosition}
                  onChange={(e) =>
                    handleInputChange('verifierPosition', e.target.value)
                  }
                  placeholder="e.g., Export Manager"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-300"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Verification Date *
                </label>
                <DatePicker
                  value={formData.verificationDate}
                  onChange={(value) =>
                    handleInputChange('verificationDate', value)
                  }
                  placeholder="Select verification date"
                  required
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Weighing Location
                </label>
                <input
                  type="text"
                  value={formData.weighingLocation}
                  onChange={(e) =>
                    handleInputChange('weighingLocation', e.target.value)
                  }
                  placeholder="e.g., Factory Premises"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-300"
                />
              </div>
            </div>

            {/* Container Type and Hazardous Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Container Type *
                </label>
                <SearchableDropdown
                  label="Container Type"
                  value={formData.containerType}
                  options={[
                    { id: 'NORMAL', name: 'Normal' },
                    { id: 'REEFER', name: 'Reefer' },
                    { id: 'HAZARDOUS', name: 'Hazardous' },
                    { id: 'OTHER', name: 'Other' },
                  ].filter((type) =>
                    type.name
                      .toLowerCase()
                      .includes(containerTypeSearch.toLowerCase())
                  )}
                  onSelect={(type) => {
                    handleInputChange('containerType', type);
                    setContainerTypeSearch('');
                  }}
                  searchValue={containerTypeSearch}
                  onSearchChange={setContainerTypeSearch}
                  isOpen={showContainerTypeDropdown}
                  onToggle={() =>
                    setShowContainerTypeDropdown(!showContainerTypeDropdown)
                  }
                  placeholder="Select Container Type"
                  dropdownRef={containerTypeRef}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  UN Number {formData.containerType === 'HAZARDOUS' ? '*' : ''}
                </label>
                <input
                  type="text"
                  value={formData.hazardousUnNo}
                  onChange={(e) =>
                    handleInputChange('hazardousUnNo', e.target.value)
                  }
                  placeholder="e.g., UN1234"
                  disabled={formData.containerType !== 'HAZARDOUS'}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 disabled:bg-gray-100 transition-all duration-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  IMDG Class {formData.containerType === 'HAZARDOUS' ? '*' : ''}
                </label>
                <input
                  type="text"
                  value={formData.imdgClass}
                  onChange={(e) =>
                    handleInputChange('imdgClass', e.target.value)
                  }
                  placeholder="e.g., Class 3"
                  disabled={formData.containerType !== 'HAZARDOUS'}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 disabled:bg-gray-100 transition-all duration-300"
                />
              </div>
            </div>

            {/* Remarks */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Remarks
              </label>
              <textarea
                value={formData.remarks}
                onChange={(e) => handleInputChange('remarks', e.target.value)}
                placeholder="Additional notes or comments"
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-300"
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-end space-y-3 lg:space-y-0 lg:space-x-4 pt-4 lg:pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/orders/vgm')}
                className="px-4 py-3 lg:px-6 lg:py-3 rounded-lg border border-gray-300 text-slate-600 hover:bg-gray-50 transition-all duration-300 text-sm lg:text-base"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-3 lg:px-6 lg:py-3 rounded-lg font-semibold text-white bg-slate-700 hover:bg-slate-800 transition-all duration-300 hover:shadow-xl disabled:opacity-50 shadow-lg text-sm lg:text-base"
              >
                {loading ? (
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
                      {isEdit ? 'Update VGM' : 'Create VGM'}
                    </span>
                    <span className="hidden lg:inline">
                      {isEdit ? 'Update VGM Document' : 'Create VGM Document'}
                    </span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddEditVgm;
