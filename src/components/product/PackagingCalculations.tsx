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

          // Calculate multiplier dynamically based on unit type and hierarchy
          let multiplier = 1;
          const lastLevel = packagingHierarchy[packagingHierarchy.length - 1];

          if (weightUnitType === packagingHierarchy[0].from) {
            // Base unit selected - multiply by total units
            multiplier = totalPieces;
          } else if (weightUnitType === lastLevel.to) {
            // Last level selected - multiply by total boxes
            multiplier = totalBoxes;
          } else {
            // Find the selected unit in hierarchy and calculate multiplier
            let foundUnit = false;
            for (let i = 0; i < packagingHierarchy.length; i++) {
              const level = packagingHierarchy[i];
              if (
                level.from === weightUnitType ||
                level.to === weightUnitType
              ) {
                // Calculate how many of this unit type per box
                let unitsPerBox = 1;
                for (let j = i; j < packagingHierarchy.length; j++) {
                  const nextLevel = packagingHierarchy[j];
                  const quantityField = `${nextLevel.from}Per${nextLevel.to}`;
                  const quantity = parseInt(values[quantityField]) || 1;
                  if (nextLevel.from === weightUnitType) {
                    unitsPerBox *= quantity;
                  }
                }
                multiplier = unitsPerBox * totalBoxes;
                foundUnit = true;
                break;
              }
            }
            if (!foundUnit) {
              multiplier = totalPieces; // fallback
            }
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

        // Calculate weights for all levels dynamically
        if (unitWeight > 0 && weightUnitType && packagingHierarchy.length > 0) {
          const baseWeightInKg = convertToKg(unitWeight, unitWeightUnit);

          // Find the base unit (first level)
          const baseUnit = packagingHierarchy[0].from;

          // Calculate weight per base unit
          let weightPerBaseUnitInKg = baseWeightInKg;

          // If selected unit type is not the base unit, calculate base unit weight
          if (weightUnitType !== baseUnit) {
            let divisionFactor = 1;

            // Find the selected unit in hierarchy and calculate division factor
            for (let i = 0; i < packagingHierarchy.length; i++) {
              const level = packagingHierarchy[i];
              const quantityField = `${level.from}Per${level.to}`;
              const quantity = parseInt(values[quantityField]) || 1;

              if (level.from === weightUnitType) {
                // Found the selected unit, calculate how many base units it contains
                break;
              } else if (level.to === weightUnitType) {
                // Selected unit is the 'to' unit, include this level's quantity
                divisionFactor *= quantity;
                break;
              } else {
                // Keep multiplying until we reach the selected unit
                divisionFactor *= quantity;
              }
            }

            weightPerBaseUnitInKg = baseWeightInKg / divisionFactor;
          }

          // Calculate and store weight for each level
          let cumulativeMultiplier = 1;

          // Store base unit weight
          const weightPerBaseUnit = convertFromKg(
            weightPerBaseUnitInKg,
            outputUnit
          );
          setFieldValue(`weightPer${baseUnit}`, weightPerBaseUnit.toFixed(2));

          // Calculate weights for each packaging level
          packagingHierarchy.forEach((level, index) => {
            const quantityField = `${level.from}Per${level.to}`;
            const quantity = parseInt(values[quantityField]) || 1;
            cumulativeMultiplier *= quantity;

            const weightForThisLevelInKg =
              weightPerBaseUnitInKg * cumulativeMultiplier;
            const weightForThisLevel = convertFromKg(
              weightForThisLevelInKg,
              outputUnit
            );
            setFieldValue(
              `weightPer${level.to}`,
              weightForThisLevel.toFixed(2)
            );
          });
        }

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
