import React, { useEffect } from 'react';
import { useFormikContext } from 'formik';

interface PackagingCalculationsProps {
  packagingHierarchy: any[];
  trackVolume: boolean;
  convertToKg: (weight: number, unit: string) => number;
  convertFromKg: (weight: number, unit: string) => number;
}

const PackagingCalculations: React.FC<PackagingCalculationsProps> = React.memo(
  ({ packagingHierarchy, trackVolume, convertToKg, convertFromKg }) => {
    const { values, setFieldValue } = useFormikContext<any>();

    useEffect(() => {
      if (!packagingHierarchy.length) return;

      const timeoutId = setTimeout(() => {
        // Calculate total units based on packaging hierarchy
        let totalUnits = 1;
        const totalBoxes = parseInt(values.totalBoxes) || 1;

        packagingHierarchy.forEach((level) => {
          const quantityField = `${level.from}Per${level.to}`;
          const quantity = parseInt(values[quantityField]) || 0;
          if (quantity > 0) {
            totalUnits *= quantity;
          }
        });

        // Calculate total pieces
        const totalPieces = totalUnits * totalBoxes;
        setFieldValue('totalPieces', totalPieces || 0);

        // Calculate total weight
        let totalWeightInKg = 0;

        if (packagingHierarchy.length > 0) {
          const smallestLevel = packagingHierarchy[0];
          const smallestWeightField = `weightPer${
            smallestLevel.from.charAt(0).toUpperCase() +
            smallestLevel.from.slice(1)
          }`;
          const smallestWeightUnitField = `${smallestWeightField}Unit`;

          const smallestWeight = parseFloat(values[smallestWeightField]) || 0;
          const smallestUnit = values[smallestWeightUnitField] || 'kg';

          if (smallestWeight > 0) {
            const weightInKg = convertToKg(smallestWeight, smallestUnit);
            const netWeightInKg = weightInKg * totalPieces;

            // Add packaging material weight
            const packWeight = parseFloat(values.packagingMaterialWeight) || 0;
            const packUnit = values.packagingMaterialWeightUnit || 'kg';
            const packWeightInKg =
              convertToKg(packWeight, packUnit) * totalBoxes;

            totalWeightInKg = netWeightInKg + packWeightInKg;
          } else {
            // Use gross weight
            const grossWeight = parseFloat(values.grossWeightPerBox) || 0;
            const grossUnit = values.grossWeightUnit || 'kg';
            totalWeightInKg = convertToKg(grossWeight, grossUnit) * totalBoxes;
          }
        } else {
          // Fallback to gross weight
          const grossWeight = parseFloat(values.grossWeightPerBox) || 0;
          const grossUnit = values.grossWeightUnit || 'kg';
          totalWeightInKg = convertToKg(grossWeight, grossUnit) * totalBoxes;
        }

        // Convert total weight to display unit
        const outputUnit = 'kg';
        const totalWeightInSelectedUnit = convertFromKg(
          totalWeightInKg,
          outputUnit
        );

        setFieldValue('totalGrossWeight', totalWeightInSelectedUnit.toFixed(2));
        setFieldValue('totalGrossWeightUnit', outputUnit);

        // Calculate CBM if volume tracking is enabled
        if (trackVolume) {
          const length = parseFloat(values.volumeLength) || 0;
          const width = parseFloat(values.volumeWidth) || 0;
          const height = parseFloat(values.volumeHeight) || 0;

          const volumePerBox = (length * width * height) / 1000000;
          setFieldValue('volumePerBox', volumePerBox.toFixed(6));

          const totalVolume = volumePerBox * totalBoxes;
          setFieldValue('totalVolume', totalVolume.toFixed(6));
        }
      }, 0);

      return () => clearTimeout(timeoutId);
    }, [
      values,
      packagingHierarchy,
      trackVolume,
      setFieldValue,
      convertToKg,
      convertFromKg,
    ]);

    return null;
  }
);

export default PackagingCalculations;
