import React, { useEffect } from 'react';
import { HiEye, HiScale, HiCube } from 'react-icons/hi2';

interface PackagingPreviewProps {
  values: any;
  packagingHierarchy: any[];
  convertToKg: (weight: number, unit: string) => number;
  convertFromKg: (weight: number, unit: string) => number;
  setFieldValue: (field: string, value: any) => void;
}

const PackagingPreview: React.FC<PackagingPreviewProps> = ({
  values,
  packagingHierarchy,
  convertToKg,
  convertFromKg,
  setFieldValue,
}) => {
  // Calculate and save weight values whenever relevant fields change
  useEffect(() => {
    if (
      packagingHierarchy.length === 0 ||
      !values.unitWeight ||
      !values.weightUnitType
    )
      return;

    // Calculate weights for all packaging levels
    let currentWeight = parseFloat(values.unitWeight) || 0;

    // Set base unit weight
    if (packagingHierarchy[0]) {
      const baseWeightField = `weightPer${packagingHierarchy[0].from}`;
      setFieldValue(baseWeightField, currentWeight);
    }

    // Calculate weights for each packaging level
    packagingHierarchy.forEach((level, index) => {
      const quantityField = `${level.from}Per${level.to}`;
      const quantity = parseFloat(values[quantityField]) || 0;
      const weightField = `weightPer${level.to}`;

      if (quantity > 0) {
        currentWeight = currentWeight * quantity;
        setFieldValue(weightField, parseFloat(currentWeight.toFixed(2)));
      }
    });

    // Calculate gross weight per box
    if (packagingHierarchy.length > 0) {
      const lastLevel = packagingHierarchy[packagingHierarchy.length - 1];
      const netWeightFieldName = `weightPer${lastLevel?.to || 'Box'}`;
      const netWeight = parseFloat(values[netWeightFieldName]) || 0;
      const packWeight = parseFloat(values.packagingMaterialWeight) || 0;

      if (packWeight > 0) {
        const packWeightInKg = convertToKg(
          packWeight,
          values.packagingMaterialWeightUnit || 'g'
        );
        const packWeightInDisplayUnit = convertFromKg(
          packWeightInKg,
          values.unitWeightUnit
        );
        const grossWeight = netWeight + packWeightInDisplayUnit;
        setFieldValue('grossWeightPerBox', parseFloat(grossWeight.toFixed(2)));
      }
    }
  }, [
    values.unitWeight,
    values.weightUnitType,
    values.packagingMaterialWeight,
    values.packagingMaterialWeightUnit,
    ...packagingHierarchy.map((level) => values[`${level.from}Per${level.to}`]),
    packagingHierarchy,
    setFieldValue,
    convertToKg,
    convertFromKg,
  ]);

  if (packagingHierarchy.length === 0) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 shadow-md">
          <HiEye className="w-5 h-5 text-white" />
        </div>
        <h4 className="text-lg font-semibold text-slate-800">
          Packaging Preview
        </h4>
      </div>
      
      <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200">

        {/* Visual representation */}
        <div className="flex items-center mb-6 overflow-x-auto pb-2">
          {packagingHierarchy.map((level, index) => (
            <React.Fragment key={index}>
              <div className="flex-shrink-0 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl text-white text-sm font-semibold shadow-md">
                {level.from}
              </div>
              {index < packagingHierarchy.length - 1 && (
                <div className="flex-shrink-0 mx-3 text-blue-600 font-bold text-lg">
                  →
                </div>
              )}
            </React.Fragment>
          ))}
          <div className="flex-shrink-0 mx-3 text-blue-600 font-bold text-lg">
            →
          </div>
          <div className="flex-shrink-0 px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl text-white text-sm font-semibold shadow-md">
            {packagingHierarchy.length > 0
              ? packagingHierarchy[packagingHierarchy.length - 1].to
              : 'box'}
          </div>
        </div>

        <div className="space-y-4">
          {/* Packaging calculations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {packagingHierarchy.map((level, index) => {
              const quantityField = `${level.from}Per${level.to}`;
              const quantity = values[quantityField] || 0;

              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-white/70 backdrop-blur-sm rounded-xl border border-white/50 shadow-sm"
                >
                  <div className="flex items-center gap-2">
                    <HiCube className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-slate-700">
                      1 {level.to} = {quantity} {level.from}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Dynamic weight calculations */}
          {values.unitWeight && values.weightUnitType && (
            <div className="space-y-3">
              <h6 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                <HiScale className="w-4 h-4 text-blue-600" />
                Weight Calculations
              </h6>
              
              {/* Weight per selected unit type */}
              <div className="flex items-center justify-between p-3 bg-white/70 backdrop-blur-sm rounded-xl border border-white/50 shadow-sm">
                <span className="text-sm font-medium text-slate-700">
                  Weight per {values.weightUnitType}
                </span>
                <span className="text-sm font-semibold text-blue-600">
                  {values.unitWeight} {values.unitWeightUnit}
                </span>
              </div>

              {/* Dynamic weight display for all levels */}
              {packagingHierarchy.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Base unit weight */}
                  {values[`weightPer${packagingHierarchy[0].from}`] && (
                    <div className="flex items-center justify-between p-3 bg-white/70 backdrop-blur-sm rounded-xl border border-white/50 shadow-sm">
                      <span className="text-sm text-slate-600">
                        Weight per {packagingHierarchy[0].from}
                      </span>
                      <span className="text-sm font-medium text-slate-700">
                        {values[`weightPer${packagingHierarchy[0].from}`]}{' '}
                        {values.unitWeightUnit}
                      </span>
                    </div>
                  )}

                  {/* All packaging level weights */}
                  {packagingHierarchy.map((level, index) => {
                    const weightFieldName = `weightPer${level.to}`;
                    const weightValue = values[weightFieldName];

                    if (!weightValue) return null;

                    return (
                      <div
                        key={`weight-${level.to}`}
                        className="flex items-center justify-between p-3 bg-white/70 backdrop-blur-sm rounded-xl border border-white/50 shadow-sm"
                      >
                        <span className="text-sm text-slate-600">
                          Weight per {level.to}
                        </span>
                        <span className="text-sm font-medium text-slate-700">
                          {weightValue} {values.unitWeightUnit}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Gross weight per box */}
              <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-emerald-800">
                    Gross weight per{' '}
                    {packagingHierarchy[packagingHierarchy.length - 1]?.to ||
                      'Box'}
                  </span>
                  <div className="text-right">
                    <div className="text-sm font-bold text-emerald-700">
                      {(() => {
                        const lastLevel =
                          packagingHierarchy[packagingHierarchy.length - 1];
                        const netWeightFieldName = `weightPer${lastLevel?.to || 'Box'}`;
                        const netWeight =
                          parseFloat(values[netWeightFieldName]) || 0;
                        const packWeight =
                          parseFloat(values.packagingMaterialWeight) || 0;
                        const packWeightInKg = convertToKg(
                          packWeight,
                          values.packagingMaterialWeightUnit || 'g'
                        );
                        const packWeightInDisplayUnit = convertFromKg(
                          packWeightInKg,
                          values.unitWeightUnit
                        );
                        const grossWeight = netWeight + packWeightInDisplayUnit;

                        return `${grossWeight.toFixed(2)} ${values.unitWeightUnit}`;
                      })()}
                    </div>
                    {parseFloat(values.packagingMaterialWeight) > 0 && (
                      <div className="text-xs text-emerald-600 mt-1">
                        (Net + {values.packagingMaterialWeight}{' '}
                        {values.packagingMaterialWeightUnit} box weight)
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Summary section */}
          <div className="space-y-3">
            <h6 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <HiCube className="w-4 h-4 text-blue-600" />
              Summary
            </h6>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Total boxes */}
              <div className="flex items-center justify-between p-3 bg-white/70 backdrop-blur-sm rounded-xl border border-white/50 shadow-sm">
                <span className="text-sm font-medium text-slate-700">
                  Total {packagingHierarchy[packagingHierarchy.length - 1].to} count
                </span>
                <span className="text-sm font-bold text-blue-600">
                  {values.totalBoxes || 0}
                </span>
              </div>

              {/* Total pieces */}
              {packagingHierarchy[0].from === 'pcs' && (
                <div className="flex items-center justify-between p-3 bg-white/70 backdrop-blur-sm rounded-xl border border-white/50 shadow-sm">
                  <span className="text-sm font-medium text-slate-700">
                    Total pieces
                  </span>
                  <span className="text-sm font-bold text-blue-600">
                    {values.totalPieces || 0}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackagingPreview;
