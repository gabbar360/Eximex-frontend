import React, { useEffect } from 'react';
import { Field } from 'formik';
import { HiCube, HiScale, HiRectangleGroup } from 'react-icons/hi2';

interface PackagingDetailsProps {
  values: any;
  setFieldValue: (field: string, value: any) => void;
  packagingHierarchy: any[];
  trackVolume: boolean;
  loadingCategory: boolean;
}

const PackagingDetails: React.FC<PackagingDetailsProps> = ({
  values,
  setFieldValue,
  packagingHierarchy,
  trackVolume,
  loadingCategory,
}) => {
  // Auto-calculate packaging volume when dimensions change
  useEffect(() => {
    const length = parseFloat(values.packagingLength) || 0;
    const width = parseFloat(values.packagingWidth) || 0;
    const height = parseFloat(values.packagingHeight) || 0;
    const volume = length * width * height;

    if (volume !== (parseFloat(values.packagingVolume) || 0)) {
      setFieldValue('packagingVolume', volume);
    }
  }, [
    values.packagingLength,
    values.packagingWidth,
    values.packagingHeight,
    setFieldValue,
    values.packagingVolume,
  ]);

  if (packagingHierarchy.length === 0) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-slate-700 shadow-lg">
          <HiCube className="w-5 h-5 text-white" />
        </div>
        <h4 className="text-lg font-semibold text-slate-800">
          Packaging Details
        </h4>
      </div>

      {loadingCategory ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-slate-600 mx-auto mb-2"></div>
          <p className="text-slate-600">Loading packaging details...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Line 1: Packaging hierarchy fields (2 inputs) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {packagingHierarchy.slice(0, 2).map((level, index) => {
              const quantityField = `${level.from}Per${level.to}`;
              return (
                <div key={index}>
                  <label className="flex items-center text-sm font-semibold text-slate-700 mb-3">
                    <HiRectangleGroup className="w-4 h-4 mr-2 text-slate-600" />
                    {level.from} per {level.to}
                  </label>
                  <Field
                    type="number"
                    name={quantityField}
                    step="any"
                    placeholder={`Enter ${level.from} per ${level.to}`}
                    className="w-full px-4 py-3 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-slate-200 focus:border-slate-500 transition-all duration-300 shadow-sm"
                    onChange={(e) =>
                      setFieldValue(quantityField, e.target.value)
                    }
                  />
                </div>
              );
            })}
            {/* Fill remaining slots if less than 2 hierarchy levels */}
            {packagingHierarchy.length < 2 && <div></div>}
          </div>

          {/* Line 2: Weight input and Unit Type (2 inputs) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center text-sm font-semibold text-slate-700 mb-3">
                <HiScale className="w-4 h-4 mr-2 text-slate-600" />
                Weight per Unit
              </label>
              <div className="flex">
                <Field
                  type="number"
                  name="unitWeight"
                  step="any"
                  min="0"
                  placeholder="Enter weight"
                  className="w-full px-4 py-3 border border-white/50 bg-white/60 backdrop-blur-sm rounded-l-2xl focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-300 shadow-sm"
                />
                <Field
                  as="select"
                  name="unitWeightUnit"
                  className="px-3 py-3 border border-l-0 border-white/50 bg-white/60 backdrop-blur-sm rounded-r-2xl focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-300 shadow-sm"
                >
                  <option value="kg">kg</option>
                  <option value="g">g</option>
                  <option value="lb">lb</option>
                  <option value="oz">oz</option>
                </Field>
              </div>
            </div>
            <div>
              <label className="flex items-center text-sm font-semibold text-slate-700 mb-3">
                <HiRectangleGroup className="w-4 h-4 mr-2 text-slate-600" />
                Unit Type
              </label>
              <Field
                as="select"
                name="weightUnitType"
                className="w-full px-4 py-3 border border-white/50 bg-white/60 backdrop-blur-sm rounded-2xl focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-300 shadow-sm"
              >
                <option value="">Select unit</option>
                {packagingHierarchy.map((level, idx) => (
                  <option key={`from-${idx}`} value={level.from}>
                    {level.from}
                  </option>
                ))}
                {packagingHierarchy.length > 0 && (
                  <option
                    value={packagingHierarchy[packagingHierarchy.length - 1].to}
                  >
                    {packagingHierarchy[packagingHierarchy.length - 1].to}
                  </option>
                )}
              </Field>
            </div>
          </div>

          {/* Line 3: Packaging material weight and additional field (2 inputs) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center text-sm font-semibold text-slate-700 mb-3">
                <HiScale className="w-4 h-4 mr-2 text-slate-600" />
                {packagingHierarchy.length > 0
                  ? packagingHierarchy[packagingHierarchy.length - 1].to
                  : 'Box'}{' '}
                Material Weight
              </label>
              <div className="flex">
                <Field
                  type="number"
                  name="packagingMaterialWeight"
                  step="any"
                  min="0"
                  placeholder={`Enter empty ${
                    packagingHierarchy.length > 0
                      ? packagingHierarchy[packagingHierarchy.length - 1].to
                      : 'box'
                  } weight`}
                  className="w-full px-4 py-3 border border-white/50 bg-white/60 backdrop-blur-sm rounded-l-2xl focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-300 shadow-sm"
                  onChange={(e) =>
                    setFieldValue('packagingMaterialWeight', e.target.value)
                  }
                />
                <Field
                  as="select"
                  name="packagingMaterialWeightUnit"
                  className="px-3 py-3 border border-l-0 border-white/50 bg-white/60 backdrop-blur-sm rounded-r-2xl focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-300 shadow-sm"
                >
                  <option value="kg">kg</option>
                  <option value="g">g</option>
                  <option value="lb">lb</option>
                  <option value="oz">oz</option>
                </Field>
              </div>
            </div>
            <div>
              <label className="flex items-center text-sm font-semibold text-slate-700 mb-3">
                <HiCube className="w-4 h-4 mr-2 text-slate-600" />
                {packagingHierarchy.length > 0
                  ? packagingHierarchy[packagingHierarchy.length - 1].to
                  : 'Box'}{' '}
                Dimensions (L × W × H in meters)
              </label>
              <div className="grid grid-cols-3 gap-2">
                <Field
                  type="number"
                  name="packagingLength"
                  step="any"
                  min="0"
                  placeholder="Length (m)"
                  className="w-full px-3 py-2 border border-white/50 bg-white/60 backdrop-blur-sm rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-300 shadow-sm text-sm"
                  onChange={(e) =>
                    setFieldValue('packagingLength', e.target.value)
                  }
                />
                <Field
                  type="number"
                  name="packagingWidth"
                  step="any"
                  min="0"
                  placeholder="Width (m)"
                  className="w-full px-3 py-2 border border-white/50 bg-white/60 backdrop-blur-sm rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-300 shadow-sm text-sm"
                  onChange={(e) =>
                    setFieldValue('packagingWidth', e.target.value)
                  }
                />
                <Field
                  type="number"
                  name="packagingHeight"
                  step="any"
                  min="0"
                  placeholder="Height (m)"
                  className="w-full px-3 py-2 border border-white/50 bg-white/60 backdrop-blur-sm rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-300 shadow-sm text-sm"
                  onChange={(e) =>
                    setFieldValue('packagingHeight', e.target.value)
                  }
                />
              </div>
              <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-gray-200">
                <div className="text-sm font-medium text-slate-800">
                  Volume: {(
                    (values.packagingLength || 0) *
                    (values.packagingWidth || 0) *
                    (values.packagingHeight || 0)
                  ).toFixed(3)} m³
                </div>
              </div>
              <Field
                type="hidden"
                name="packagingVolume"
                value={
                  (values.packagingLength || 0) *
                  (values.packagingWidth || 0) *
                  (values.packagingHeight || 0)
                }
              />
            </div>
            {/* Additional packaging hierarchy fields if more than 2 */}
            {/* {packagingHierarchy.length > 2 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {packagingHierarchy[2].from} per {packagingHierarchy[2].to}
                </label>
                <Field
                  type="number"
                  name={`${packagingHierarchy[2].from}Per${packagingHierarchy[2].to}`}
                  min="1"
                  placeholder={`Enter ${packagingHierarchy[2].from} per ${packagingHierarchy[2].to}`}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  onChange={(e) => setFieldValue(`${packagingHierarchy[2].from}Per${packagingHierarchy[2].to}`, e.target.value)}
                />
              </div>
            )} */}
          </div>

          {/* Volume fields - Separate section if needed */}
          {trackVolume && (
            <div>
              <label className="flex items-center text-sm font-semibold text-slate-700 mb-3">
                <HiCube className="w-4 h-4 mr-2 text-slate-600" />
                {packagingHierarchy.length > 0
                  ? packagingHierarchy[packagingHierarchy.length - 1].to
                  : 'Box'}{' '}
                Dimensions (L × W × H in cm)
              </label>
              <div className="grid grid-cols-3 gap-3">
                <div className="flex items-center">
                  <span className="mr-2 text-sm font-medium text-slate-600">L</span>
                  <Field
                    type="number"
                    name="volumeLength"
                    step="any"
                    min="0"
                    placeholder="Length"
                    className="w-full px-3 py-2 border border-white/50 bg-white/60 backdrop-blur-sm rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-300 shadow-sm text-sm"
                    onChange={(e) =>
                      setFieldValue('volumeLength', e.target.value)
                    }
                  />
                </div>
                <div className="flex items-center">
                  <span className="mr-2 text-sm font-medium text-slate-600">W</span>
                  <Field
                    type="number"
                    name="volumeWidth"
                    step="any"
                    min="0"
                    placeholder="Width"
                    className="w-full px-3 py-2 border border-white/50 bg-white/60 backdrop-blur-sm rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-300 shadow-sm text-sm"
                    onChange={(e) =>
                      setFieldValue('volumeWidth', e.target.value)
                    }
                  />
                </div>
                <div className="flex items-center">
                  <span className="mr-2 text-sm font-medium text-slate-600">H</span>
                  <Field
                    type="number"
                    name="volumeHeight"
                    step="any"
                    min="0"
                    placeholder="Height"
                    className="w-full px-3 py-2 border border-white/50 bg-white/60 backdrop-blur-sm rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-300 shadow-sm text-sm"
                    onChange={(e) =>
                      setFieldValue('volumeHeight', e.target.value)
                    }
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PackagingDetails;
