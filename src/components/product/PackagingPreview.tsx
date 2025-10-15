import React from 'react';

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
  if (packagingHierarchy.length === 0) return null;

  return (
    <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <h5 className="font-medium text-gray-900 dark:text-white mb-3">
        Packaging Preview
      </h5>

      {/* Visual representation */}
      <div className="flex items-center mb-4 overflow-x-auto pb-2">
        {packagingHierarchy.map((level, index) => (
          <React.Fragment key={index}>
            <div className="flex-shrink-0 px-3 py-1 bg-blue-100 dark:bg-blue-900 rounded-md text-blue-800 dark:text-blue-200 text-sm font-medium">
              {level.from}
            </div>
            {index < packagingHierarchy.length - 1 && (
              <div className="flex-shrink-0 mx-2 text-gray-500 dark:text-gray-400">
                →
              </div>
            )}
          </React.Fragment>
        ))}
        <div className="flex-shrink-0 mx-2 text-gray-500 dark:text-gray-400">
          →
        </div>
        <div className="flex-shrink-0 px-3 py-1 bg-green-100 dark:bg-green-900 rounded-md text-green-800 dark:text-green-200 text-sm font-medium">
          {packagingHierarchy.length > 0
            ? packagingHierarchy[packagingHierarchy.length - 1].to
            : 'box'}
        </div>
      </div>

      <div className="space-y-3 mb-4">
        {/* Packaging calculations */}
        {packagingHierarchy.map((level, index) => {
          const quantityField = `${level.from}Per${level.to}`;
          const quantity = values[quantityField] || 0;

          return (
            <div
              key={index}
              className="flex justify-between items-center py-1 border-b border-gray-200 dark:border-gray-700"
            >
              <span className="text-sm text-gray-700 dark:text-gray-300">
                1 {level.to} = {quantity} {level.from}
              </span>
            </div>
          );
        })}

        {/* Gross weight calculation */}
        <div className="flex flex-col py-1 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Gross weight per{' '}
              {packagingHierarchy[packagingHierarchy.length - 1].to}
            </span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {values.totalGrossWeight || '0.00'}{' '}
              {values.totalGrossWeightUnit || 'g'}
              {parseFloat(values.packagingMaterialWeight) > 0 && (
                <span className="text-xs text-gray-500 ml-2">
                  (Net + {values.packagingMaterialWeight}{' '}
                  {values.packagingMaterialWeightUnit} box weight)
                </span>
              )}
            </span>
          </div>
        </div>

        {/* Total boxes */}
        <div className="flex justify-between items-center py-1 border-b border-gray-200 dark:border-gray-700">
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Total {packagingHierarchy[packagingHierarchy.length - 1].to} count:{' '}
            {values.totalBoxes || 0}
          </span>
        </div>

        {/* Total pieces */}
        {packagingHierarchy[0].from === 'pcs' && (
          <div className="flex justify-between items-center py-1 border-b border-gray-200 dark:border-gray-700">
            <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
              Total pieces: {values.totalPieces || 0}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PackagingPreview;
