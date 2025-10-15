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

        // Get unit weight and unit type
        const unitWeight = parseFloat(values.unitWeight) || 0;
        const unitWeightUnit = values.unitWeightUnit || 'kg';
        const weightUnitType = values.weightUnitType || '';

        if (unitWeight > 0 && weightUnitType) {
          // Convert unit weight to kg
          const weightInKg = convertToKg(unitWeight, unitWeightUnit);

          // Calculate multiplier based on unit type
          let multiplier = 1;

          if (weightUnitType === 'Pieces') {
            multiplier = totalPieces;
          } else if (weightUnitType === 'Package') {
            const packagesPerBox =
              parseInt(values.packagePerBox) ||
              parseInt(values.packagesPerBox) ||
              parseInt(values.PackagePerBox) ||
              1;
            multiplier = packagesPerBox * totalBoxes;
          } else if (weightUnitType === 'Box') {
            multiplier = totalBoxes;
          } else {
            multiplier = totalPieces;
          }

          const netWeightInKg = weightInKg * multiplier;

          // Add packaging material weight
          const packWeight = parseFloat(values.packagingMaterialWeight) || 0;
          const packUnit = values.packagingMaterialWeightUnit || 'kg';
          const packWeightInKg = convertToKg(packWeight, packUnit) * totalBoxes;

          totalWeightInKg = netWeightInKg + packWeightInKg;
        } else {
          // Fallback to gross weight if unit weight not provided
          const grossWeight = parseFloat(values.grossWeightPerBox) || 0;
          const grossUnit = values.grossWeightUnit || 'kg';
          totalWeightInKg = convertToKg(grossWeight, grossUnit) * totalBoxes;
        }

        // Convert total weight to display unit (use user's selected unit)
        const outputUnit = values.unitWeightUnit || 'g';
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
