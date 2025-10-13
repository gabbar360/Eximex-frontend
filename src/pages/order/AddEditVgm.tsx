import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import vgmService from '../../service/vgmService';
import DatePicker from '../../components/form/DatePicker';

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
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { id } = useParams();
  const isEdit = !!id;

  const [formData, setFormData] = useState<VgmFormData>({
    piInvoiceId: parseInt(searchParams.get('piInvoiceId') || '0'),
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

  useEffect(() => {
    if (isEdit) {
      fetchVgmData();
    }
  }, [id, isEdit]);

  const fetchVgmData = async () => {
    try {
      setLoading(true);
      const data = await vgmService.getVgmById(id);

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
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof VgmFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // 🔥 Auto-calc for Method 2
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

    if (!formData.piInvoiceId) {
      toast.error('PI Invoice ID is required');
      return;
    }

    try {
      setLoading(true);

      const submitData = {
        ...formData,
        piInvoiceId: formData.piInvoiceId,
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
        data = await vgmService.updateVgm(id, submitData);
      } else {
        data = await vgmService.createVgm(submitData);
      }

      if (data.success) {
        toast.success(data.message);
        navigate('/orders');
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error saving VGM:', error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/orders');
  };

  if (loading && isEdit) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-3 sm:p-6">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
          {isEdit ? 'Edit VGM Document' : 'Create VGM Document'}
        </h1>
        <p className="text-gray-600 mt-2 text-sm sm:text-base">
          {isEdit
            ? 'Update VGM document details'
            : 'Create a new Verified Gross Mass document'}
        </p>
      </div>

      <div className="w-full max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-4 sm:p-6">
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* VGM Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="verifiedGrossMass"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Verified Gross Mass (KG) *
              </label>
              <input
                id="verifiedGrossMass"
                type="number"
                step="0.01"
                value={formData.verifiedGrossMass}
                onChange={(e) =>
                  handleInputChange('verifiedGrossMass', e.target.value)
                }
                placeholder="e.g., 25000.50"
                required
                disabled={formData.method === 'METHOD_2'} // 🔥 Disable when Method 2
                className="w-full px-3 py-2 border border-gray-300 rounded-md 
                           focus:outline-none focus:ring-2 focus:ring-blue-500 
                           disabled:bg-gray-100"
              />
            </div>
          </div>

          {/* Weighing Method */}
          <div>
            <label
              htmlFor="method"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Weighing Method *
            </label>
            <select
              id="method"
              value={formData.method}
              onChange={(e) => handleInputChange('method', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="METHOD_1">
                Method 1 - Weigh packed container
              </option>
              <option value="METHOD_2">
                Method 2 - Weigh contents + tare weight
              </option>
            </select>
          </div>

          {/* Method 2 Weight Breakdown */}
          {formData.method === 'METHOD_2' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-blue-50 rounded-lg">
              <div>
                <label
                  htmlFor="cargoWeight"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Cargo Weight (KG) *
                </label>
                <input
                  id="cargoWeight"
                  type="number"
                  step="0.01"
                  value={formData.cargoWeight}
                  onChange={(e) =>
                    handleInputChange('cargoWeight', e.target.value)
                  }
                  required={formData.method === 'METHOD_2'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label
                  htmlFor="packagingWeight"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Packaging Weight (KG) *
                </label>
                <input
                  id="packagingWeight"
                  type="number"
                  step="0.01"
                  value={formData.packagingWeight}
                  onChange={(e) =>
                    handleInputChange('packagingWeight', e.target.value)
                  }
                  required={formData.method === 'METHOD_2'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label
                  htmlFor="containerTareWeight"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Container Tare Weight (KG) *
                </label>
                <input
                  id="containerTareWeight"
                  type="number"
                  step="0.01"
                  value={formData.containerTareWeight}
                  onChange={(e) =>
                    handleInputChange('containerTareWeight', e.target.value)
                  }
                  required={formData.method === 'METHOD_2'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* Verification Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="verifiedBy"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Verified By *
              </label>
              <input
                id="verifiedBy"
                type="text"
                value={formData.verifiedBy}
                onChange={(e) =>
                  handleInputChange('verifiedBy', e.target.value)
                }
                placeholder="Name of authorized person"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label
                htmlFor="verifierPosition"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Position
              </label>
              <input
                id="verifierPosition"
                type="text"
                value={formData.verifierPosition}
                onChange={(e) =>
                  handleInputChange('verifierPosition', e.target.value)
                }
                placeholder="e.g., Export Manager"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="verificationDate"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Verification Date *
              </label>
              <DatePicker
                value={formData.verificationDate}
                onChange={(value) =>
                  handleInputChange('verificationDate', value)
                }
                placeholder="Select verification date"
                required
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label
                htmlFor="weighingLocation"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Weighing Location
              </label>
              <input
                id="weighingLocation"
                type="text"
                value={formData.weighingLocation}
                onChange={(e) =>
                  handleInputChange('weighingLocation', e.target.value)
                }
                placeholder="e.g., Factory Premises"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Container Type and Hazardous Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label
                htmlFor="containerType"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Container Type *
              </label>
              <select
                id="containerType"
                value={formData.containerType}
                onChange={(e) =>
                  handleInputChange('containerType', e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="NORMAL">Normal</option>
                <option value="REEFER">Reefer</option>
                <option value="HAZARDOUS">Hazardous</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="hazardousUnNo"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                UN Number {formData.containerType === 'HAZARDOUS' ? '*' : ''}
              </label>
              <input
                id="hazardousUnNo"
                type="text"
                value={formData.hazardousUnNo}
                onChange={(e) =>
                  handleInputChange('hazardousUnNo', e.target.value)
                }
                placeholder="e.g., UN1234"
                disabled={formData.containerType !== 'HAZARDOUS'}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>
            <div>
              <label
                htmlFor="imdgClass"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                IMDG Class {formData.containerType === 'HAZARDOUS' ? '*' : ''}
              </label>
              <input
                id="imdgClass"
                type="text"
                value={formData.imdgClass}
                onChange={(e) => handleInputChange('imdgClass', e.target.value)}
                placeholder="e.g., Class 3"
                disabled={formData.containerType !== 'HAZARDOUS'}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label
              htmlFor="remarks"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Remarks
            </label>
            <textarea
              id="remarks"
              value={formData.remarks}
              onChange={(e) => handleInputChange('remarks', e.target.value)}
              placeholder="Additional notes or comments"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 order-2 sm:order-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 order-1 sm:order-2"
            >
              {loading
                ? 'Saving...'
                : isEdit
                  ? 'Update VGM Document'
                  : 'Create VGM Document'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEditVgm;
