export const calculateTotalWeight = (
  productId: string,
  quantity: string,
  unit: string,
  products: Record<string, unknown>[]
) => {
  if (!products || !Array.isArray(products)) return 0;

  const product = products.find(
    (p) => (p.id as string).toString() === productId.toString()
  );
  if (!quantity || !product) return 0;

  const qty = parseFloat(quantity);
  if (isNaN(qty) || qty <= 0) return 0;

  // If unit is already kg, return quantity directly
  if (unit === 'kg') {
    return qty;
  }

  // Get packaging hierarchy data from product
  const packagingData = (
    product.packagingHierarchyData as Record<string, unknown>
  )?.dynamicFields as Record<string, unknown>;

  // Use the stored weight values from packagingHierarchyData - check units before converting
  const weightPerPiecesUnit =
    (packagingData?.weightPerPiecesUnit as string) || 'g';
  const weightPerPackageUnit =
    (packagingData?.weightPerPackageUnit as string) || 'g';
  const weightPerBoxUnit = (packagingData?.weightPerBoxUnit as string) || 'kg';
  const weightPerPalletUnit =
    (packagingData?.weightPerPalletUnit as string) || 'kg';

  const weightPerPieces = (packagingData?.weightPerPieces as number)
    ? weightPerPiecesUnit === 'kg'
      ? (packagingData.weightPerPieces as number)
      : (packagingData.weightPerPieces as number) / 1000
    : 0;
  const weightPerPackage = (packagingData?.weightPerPackage as number)
    ? weightPerPackageUnit === 'kg'
      ? (packagingData.weightPerPackage as number)
      : (packagingData.weightPerPackage as number) / 1000
    : (packagingData?.weightPerPack as number)
      ? (packagingData.weightPerPack as number) / 1000 // Convert grams to kg
      : 0;
  const weightPerBox = (packagingData?.weightPerBox as number)
    ? weightPerBoxUnit === 'kg'
      ? (packagingData.weightPerBox as number)
      : (packagingData.weightPerBox as number) / 1000
    : 0;
  const weightPerPallet = (packagingData?.weightPerPallet as number)
    ? weightPerPalletUnit === 'kg'
      ? (packagingData.weightPerPallet as number)
      : (packagingData.weightPerPallet as number) / 1000
    : 0;

  // Get packaging conversion factors
  const piecesPerPackage =
    (packagingData?.PiecesPerPack as number) ||
    (packagingData?.PiecesPerPackage as number) ||
    1;
  const packagePerBox =
    (packagingData?.PackPerBox as number) ||
    (packagingData?.PackagePerBox as number) ||
    1;
  const boxPerPallet =
    (packagingData?.BoxPerPallet as number) ||
    (packagingData?.boxesPerPallet as number) ||
    1;

  // Calculate weight based on selected unit using stored values
  switch (unit.toLowerCase()) {
    case 'pcs':
    case 'pieces':
      if (weightPerPieces > 0) {
        return qty * weightPerPieces;
      }
      break;

    case 'package':
    case 'pack':
      // First try weightPerPackage
      if (weightPerPackage > 0) {
        return qty * weightPerPackage;
      }
      // Try weightPerPack from packagingData
      if (packagingData?.weightPerPack) {
        const weightPerPackKg = packagingData.weightPerPack / 1000; // Convert g to kg
        return qty * weightPerPackKg;
      }
      // Fallback: calculate from pieces
      if (weightPerPieces > 0 && piecesPerPackage > 0) {
        return qty * weightPerPieces * piecesPerPackage;
      }
      break;

    case 'box':
      if (weightPerBox > 0) {
        return qty * weightPerBox;
      }

      // Check for weightPerBox in different possible fields
      if (packagingData?.weightPerBox) {
        return qty * packagingData.weightPerBox;
      }
      if (product.weightPerBox) {
        return qty * product.weightPerBox;
      }

      // For tiles, use unitWeight if weightUnitType is Box
      if (
        product.unitWeight &&
        product.weightUnitType?.toLowerCase() === 'box'
      ) {
        const unitWeightKg =
          product.unitWeightUnit === 'kg'
            ? product.unitWeight
            : product.unitWeight / 1000;
        return qty * unitWeightKg;
      }

      // Fallback: calculate from packages
      if (weightPerPackage > 0 && packagePerBox > 0) {
        return qty * weightPerPackage * packagePerBox;
      }
      // Fallback: calculate from pieces
      if (weightPerPieces > 0 && piecesPerPackage > 0 && packagePerBox > 0) {
        return qty * weightPerPieces * piecesPerPackage * packagePerBox;
      }
      break;

    case 'pallet':
      if (weightPerPallet > 0) {
        return qty * weightPerPallet;
      }

      // Check for weightPerPallet in different possible fields
      if (packagingData?.weightPerPallet) {
        return qty * packagingData.weightPerPallet;
      }
      if (product.weightPerPallet) {
        return qty * product.weightPerPallet;
      }

      // Fallback: calculate from boxes
      if (weightPerBox > 0 && boxPerPallet > 0) {
        return qty * weightPerBox * boxPerPallet;
      }
      // Fallback: calculate from packages
      if (weightPerPackage > 0 && packagePerBox > 0 && boxPerPallet > 0) {
        return qty * weightPerPackage * packagePerBox * boxPerPallet;
      }
      // Fallback: calculate from pieces
      if (
        weightPerPieces > 0 &&
        piecesPerPackage > 0 &&
        packagePerBox > 0 &&
        boxPerPallet > 0
      ) {
        return (
          qty *
          weightPerPieces *
          piecesPerPackage *
          packagePerBox *
          boxPerPallet
        );
      }
      break;

    case 'square meter':
    case 'sqm':
    case 'm²':
      // Check for weight per square meter with space in field name
      if (packagingData?.['weightPerSquare Meter']) {
        const weightPerSqmUnit =
          packagingData?.['weightPerSquare MeterUnit'] || 'kg';
        const weightPerSqm = packagingData['weightPerSquare Meter'];
        const weightPerSqmKg =
          weightPerSqmUnit === 'kg' ? weightPerSqm : weightPerSqm / 1000;
        return qty * weightPerSqmKg;
      }

      // Check for standard field name without space
      if (packagingData?.weightPerSquareMeter) {
        const weightPerSqmUnit =
          packagingData?.weightPerSquareMeterUnit || 'kg';
        const weightPerSqm = packagingData.weightPerSquareMeter;
        const weightPerSqmKg =
          weightPerSqmUnit === 'kg' ? weightPerSqm : weightPerSqm / 1000;
        return qty * weightPerSqmKg;
      }

      // Check if product has direct weight per square meter field
      if (product.weightPerSquareMeter) {
        return qty * product.weightPerSquareMeter;
      }
      break;

    case 'kg':
      return qty;

    default:
      // For any other unit, try to match with stored weights
      if (weightPerPieces > 0) {
        return qty * weightPerPieces;
      }
      break;
  }

  // No weight data found in product - return 0
  return 0;
};

export const calculateQuantityFromWeight = (
  productId: string,
  weightKg: string,
  products: Record<string, unknown>[]
) => {
  if (!products || !Array.isArray(products)) return '';

  const product = products.find(
    (p) => (p.id as string).toString() === productId.toString()
  );
  if (!(product?.packingConfig as Record<string, unknown>) || !weightKg)
    return '';

  const weight = parseFloat(weightKg);
  const boxes =
    weight /
    ((product.packingConfig as Record<string, unknown>).weightPerBox as number);
  const totalUnits =
    boxes *
    ((product.packingConfig as Record<string, unknown>).unitsPerBox as number);
  return totalUnits.toFixed(2);
};

export const calculateGrossWeight = (
  productList: Record<string, unknown>[],
  products: Record<string, unknown>[]
) => {
  if (
    !products ||
    !Array.isArray(products) ||
    !productList ||
    !Array.isArray(productList)
  )
    return 0;

  return productList.reduce((sum, product) => {
    if (!(product.productId as string)) return sum;

    // Get net weight
    const netWeight =
      (product.totalWeight as number) ||
      calculateTotalWeight(
        product.productId as string,
        (product.quantity as number).toString(),
        product.unit as string,
        products
      );

    // Get product data for packaging weight
    const prod = products.find(
      (p: Record<string, unknown>) =>
        (p.id as string).toString() === (product.productId as string).toString()
    );

    if (!prod) return sum + netWeight;

    // Calculate packaging weight based on quantity and unit
    let packagingWeight = 0;
    const packagingData = prod.packagingHierarchyData?.dynamicFields;

    // Get packaging material weight from product data
    const packagingMaterialWeight =
      (prod.packagingMaterialWeight as number) || 0;
    const packagingUnit = (prod.packagingMaterialWeightUnit as string) || 'g';

    if (packagingMaterialWeight > 0) {
      // Convert packaging weight to KG if needed
      const packagingWeightKg =
        packagingUnit === 'kg'
          ? packagingMaterialWeight
          : packagingMaterialWeight / 1000;

      // Calculate how many boxes based on unit and quantity
      let boxes = 0;

      if ((product.unit as string).toLowerCase() === 'box') {
        boxes = product.quantity as number;
      } else if (
        (product.unit as string).toLowerCase() === 'pcs' ||
        (product.unit as string).toLowerCase() === 'pieces'
      ) {
        const piecesPerPack =
          packagingData?.PiecesPerPack || packagingData?.PiecesPerPackage || 1;
        const packPerBox =
          packagingData?.PackPerBox || packagingData?.PackagePerBox || 1;
        boxes = Math.ceil(
          (product.quantity as number) / (piecesPerPack * packPerBox)
        );
      } else if (
        (product.unit as string).toLowerCase() === 'pack' ||
        (product.unit as string).toLowerCase() === 'package'
      ) {
        const packPerBox =
          (packagingData?.PackPerBox as number) ||
          (packagingData?.PackagePerBox as number) ||
          1;
        boxes = Math.ceil((product.quantity as number) / packPerBox);
      } else if ((product.unit as string).toLowerCase() === 'pallet') {
        // For pallets, calculate packaging weight directly based on number of pallets
        // Don't convert to boxes for packaging calculation
        const pallets = product.quantity as number;

        // If packaging weight is per pallet (usually in kg for pallets)
        if (packagingUnit === 'kg') {
          packagingWeight = pallets * packagingWeightKg;
        } else {
          // If packaging weight is in grams, convert to kg
          packagingWeight = pallets * (packagingMaterialWeight / 1000);
        }

        return sum + netWeight + packagingWeight;
      } else if (
        (product.unit as string).toLowerCase() === 'square meter' ||
        (product.unit as string).toLowerCase() === 'sqm' ||
        (product.unit as string).toLowerCase() === 'm²'
      ) {
        // For square meter units, calculate pallets from packaging data
        const sqmPerBox = (packagingData?.sqmPerBox as number) || 0.72; // Default from your example
        const boxesPerPallet =
          (packagingData?.BoxPerPallet as number) ||
          (packagingData?.boxesPerPallet as number) ||
          30;

        const totalBoxes = Math.ceil((product.quantity as number) / sqmPerBox);
        const totalPallets = Math.ceil(totalBoxes / boxesPerPallet);

        // Calculate packaging weight based on pallets
        if (packagingUnit === 'kg') {
          packagingWeight = totalPallets * packagingWeightKg;
        } else {
          packagingWeight = totalPallets * (packagingMaterialWeight / 1000);
        }

        return sum + netWeight + packagingWeight;
      } else {
        boxes = product.quantity as number;
      }

      // Use packaging weight per box for other units
      packagingWeight = boxes * packagingWeightKg;
    }

    return sum + netWeight + packagingWeight;
  }, 0);
};
