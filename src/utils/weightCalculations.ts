export const calculateTotalWeight = (
  productId: string,
  quantity: string,
  unit: string,
  products: any[]
) => {
  const product = products.find(
    (p) => p.id.toString() === productId.toString()
  );
  if (!quantity || !product) return 0;

  const qty = parseFloat(quantity);
  if (isNaN(qty) || qty <= 0) return 0;

  // If unit is already kg, return quantity directly
  if (unit === 'kg') {
    return qty;
  }

  // Get packaging hierarchy data from product
  const packagingData = product.packagingHierarchyData?.dynamicFields;

  // Use the stored weight values from packagingHierarchyData - check units before converting
  const weightPerPiecesUnit = packagingData?.weightPerPiecesUnit || 'g';
  const weightPerPackageUnit = packagingData?.weightPerPackageUnit || 'g';
  const weightPerBoxUnit = packagingData?.weightPerBoxUnit || 'kg';
  const weightPerPalletUnit = packagingData?.weightPerPalletUnit || 'kg';

  const weightPerPieces = packagingData?.weightPerPieces
    ? weightPerPiecesUnit === 'kg'
      ? packagingData.weightPerPieces
      : packagingData.weightPerPieces / 1000
    : 0;
  const weightPerPackage = packagingData?.weightPerPackage
    ? weightPerPackageUnit === 'kg'
      ? packagingData.weightPerPackage
      : packagingData.weightPerPackage / 1000
    : packagingData?.weightPerPack
    ? packagingData.weightPerPack / 1000  // Convert grams to kg
    : 0;
  const weightPerBox = packagingData?.weightPerBox
    ? weightPerBoxUnit === 'kg'
      ? packagingData.weightPerBox
      : packagingData.weightPerBox / 1000
    : 0;
  const weightPerPallet = packagingData?.weightPerPallet
    ? weightPerPalletUnit === 'kg'
      ? packagingData.weightPerPallet
      : packagingData.weightPerPallet / 1000
    : 0;

  // Get packaging conversion factors
  const piecesPerPackage = packagingData?.PiecesPerPack || packagingData?.PiecesPerPackage || 1;
  const packagePerBox = packagingData?.PackPerBox || packagingData?.PackagePerBox || 1;
  const boxPerPallet =
    packagingData?.BoxPerPallet || packagingData?.boxesPerPallet || 1;

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
      // Check for weight per square meter in packaging data
      const weightPerSqmUnit = packagingData?.weightPerSquareMeterUnit || 'kg';
      const weightPerSqm = packagingData?.weightPerSquareMeter;
      
      if (weightPerSqm > 0) {
        const weightPerSqmKg = weightPerSqmUnit === 'kg' ? weightPerSqm : weightPerSqm / 1000;
        return qty * weightPerSqmKg;
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

  // Final fallback: use minimal default weights
  const defaultWeights = {
    pcs: 0.014, // 14g per piece in kg
    pieces: 0.014,
    package: 0.7, // 700g per package in kg
    pack: 0.7,
    box: 31.0, // 31kg per box for tiles
    pallet: 992.0, // 992kg per pallet for tiles
    'square meter': 43.06, // 43.06kg per square meter for tiles
    'sqm': 43.06,
    'm²': 43.06,
  };

  const defaultWeight = defaultWeights[unit.toLowerCase()] || 0.014;
  return qty * defaultWeight;
};

export const calculateQuantityFromWeight = (
  productId: string,
  weightKg: string,
  products: any[]
) => {
  const product = products.find(
    (p) => p.id.toString() === productId.toString()
  );
  if (!product?.packingConfig || !weightKg) return '';

  const weight = parseFloat(weightKg);
  const boxes = weight / product.packingConfig.weightPerBox;
  const totalUnits = boxes * product.packingConfig.unitsPerBox;
  return totalUnits.toFixed(2);
};

export const calculateGrossWeight = (productList: any[], products: any[]) => {
  return productList.reduce((sum, product) => {
    if (!product.productId) return sum;

    // Get net weight
    const netWeight =
      product.totalWeight ||
      calculateTotalWeight(
        product.productId,
        product.quantity.toString(),
        product.unit,
        products
      );

    // Get product data for packaging weight
    const prod = products.find(
      (p) => p.id.toString() === product.productId.toString()
    );

    if (!prod) return sum + netWeight;

    // Calculate packaging weight based on quantity and unit
    let packagingWeight = 0;
    const packagingData = prod.packagingHierarchyData?.dynamicFields;

    // Get packaging material weight from product data
    const packagingMaterialWeight = prod.packagingMaterialWeight || 0;
    const packagingUnit = prod.packagingMaterialWeightUnit || 'g';

    if (packagingMaterialWeight > 0) {
      // Convert packaging weight to KG if needed
      const packagingWeightKg =
        packagingUnit === 'kg'
          ? packagingMaterialWeight
          : packagingMaterialWeight / 1000;

      // Calculate how many boxes based on unit and quantity
      let boxes = 0;

      if (product.unit.toLowerCase() === 'box') {
        boxes = product.quantity;
      } else if (
        product.unit.toLowerCase() === 'pcs' ||
        product.unit.toLowerCase() === 'pieces'
      ) {
        const piecesPerPack =
          packagingData?.PiecesPerPack ||
          packagingData?.PiecesPerPackage ||
          1;
        const packPerBox =
          packagingData?.PackPerBox || packagingData?.PackagePerBox || 1;
        boxes = Math.ceil(product.quantity / (piecesPerPack * packPerBox));
      } else if (
        product.unit.toLowerCase() === 'pack' ||
        product.unit.toLowerCase() === 'package'
      ) {
        const packPerBox =
          packagingData?.PackPerBox || packagingData?.PackagePerBox || 1;
        boxes = Math.ceil(product.quantity / packPerBox);
      } else if (product.unit.toLowerCase() === 'pallet') {
        const boxPerPallet =
          packagingData?.BoxPerPallet || packagingData?.boxesPerPallet || 32;
        boxes = product.quantity * boxPerPallet;
      } else {
        boxes = product.quantity;
      }

      // For tiles, if unit is pallet and packagingMaterialWeight is in kg,
      // it might be per pallet, not per box
      if (product.unit.toLowerCase() === 'pallet' && packagingUnit === 'kg') {
        // Use packaging weight per pallet directly
        packagingWeight = product.quantity * packagingWeightKg;
      } else {
        // Use packaging weight per box
        packagingWeight = boxes * packagingWeightKg;
      }
    }

    return sum + netWeight + packagingWeight;
  }, 0);
};