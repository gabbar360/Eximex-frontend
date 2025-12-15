import React, { useRef, useEffect, useCallback, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import Label from '../form/Label';

interface ProductAdded {
  productId: string;
  quantity: string;
  rate: string;
  unit: string;
  categoryId?: string;
  subcategoryId?: string;
  quantityByWeight?: string;
}

interface ProductRowProps {
  idx: number;
  data: ProductAdded;
  onChange: (idx: number, field: keyof ProductAdded, value: string) => void;
  onRemove: (idx: number) => void;
  categories: any[];
  products: any[];
  selectedCategory: string;
  selectedSubcategory: string;
  setSelectedCategory: (value: string) => void;
  setSelectedSubcategory: (value: string) => void;
  calculateTotalWeight: (
    productId: string,
    quantity: string,
    unit: string
  ) => number;
  calculateQuantityFromWeight: (productId: string, weightKg: string) => string;
}

const ProductRow: React.FC<ProductRowProps> = ({
  idx,
  data,
  onChange,
  onRemove,
  categories,
  products,
  selectedCategory,
  selectedSubcategory,
  setSelectedCategory,
  setSelectedSubcategory,
  calculateTotalWeight,
  calculateQuantityFromWeight,
}) => {
  const prod = products.find(
    (p) => p.id.toString() === data.productId.toString()
  );
  const currentCategoryId = data.categoryId || selectedCategory;
  const currentSubcategoryId = data.subcategoryId || selectedSubcategory;

  const quantityRef = useRef<HTMLInputElement>(null);
  const rateRef = useRef<HTMLInputElement>(null);
  const weightRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (quantityRef.current) {
      quantityRef.current.value = data.quantity || '';
    }
    if (rateRef.current) {
      rateRef.current.value = data.rate || '';
    }
    if (weightRef.current) {
      weightRef.current.value = data.quantityByWeight || '';
    }
  }, [data.productId]);

  const selectedCategoryData = categories.find(
    (c) => c.id.toString() === currentCategoryId
  );
  const filteredSubcategories = selectedCategoryData?.subcategories || [];

  const filteredProducts = products.filter((p) => {
    const productCategoryId = p.categoryId || p.category?.id;
    const productSubCategoryId =
      p.subCategoryId || p.subcategoryId || p.subCategory?.id;

    const categoryMatch =
      !currentCategoryId ||
      String(productCategoryId) === String(currentCategoryId);
    const subcategoryMatch =
      !currentSubcategoryId ||
      String(productSubCategoryId) === String(currentSubcategoryId);

    return categoryMatch && subcategoryMatch;
  });

  const handleQuantityByWeightChange = useCallback(
    (weight: string) => {
      onChange(idx, 'quantityByWeight', weight);
      if (data.productId && weight && !isNaN(parseFloat(weight))) {
        const calculatedQty = calculateQuantityFromWeight(
          data.productId,
          weight
        );
        if (calculatedQty && quantityRef.current) {
          quantityRef.current.value = calculatedQty;
          onChange(idx, 'quantity', calculatedQty);
        }
      }
    },
    [onChange, idx, data.productId, calculateQuantityFromWeight]
  );

  const getCalculationDetails = () => {
    if (!data.quantityByWeight || !prod?.packingConfig) return null;
    const weight = parseFloat(data.quantityByWeight);
    const boxes = weight / prod.packingConfig.weightPerBox;
    const totalUnits = boxes * prod.packingConfig.unitsPerBox;
    return {
      boxes: boxes.toFixed(2),
      totalUnits: totalUnits.toFixed(2),
      unitType: data.unit || prod.units[0],
    };
  };

  const totalWeight = useMemo(() => {
    return data.productId && data.quantity && data.unit
      ? calculateTotalWeight(data.productId, data.quantity, data.unit)
      : 0;
  }, [data.productId, data.quantity, data.unit, calculateTotalWeight]);

  const packagingCalculation = useMemo(() => {
    if (
      !data.productId ||
      !data.quantity ||
      !data.unit ||
      data.unit.toLowerCase() !== 'square meter' ||
      !prod?.packagingHierarchyData?.dynamicFields
    ) {
      return null;
    }

    const quantity = parseFloat(data.quantity);
    if (isNaN(quantity) || quantity <= 0) return null;

    const packagingData = prod.packagingHierarchyData.dynamicFields;
    const sqmPerBox = packagingData['Square MeterPerBox'] || 0;
    const boxesPerPallet = packagingData['BoxPerPallet'] || 0;

    if (!sqmPerBox || !boxesPerPallet) return null;

    const totalBoxes = Math.ceil(quantity / sqmPerBox);
    const totalPallets = Math.ceil(totalBoxes / boxesPerPallet);

    return {
      totalBoxes,
      totalPallets,
      sqmPerBox,
      boxesPerPallet,
      calculatedFor: quantity,
    };
  }, [
    data.productId,
    data.quantity,
    data.unit,
    prod?.packagingHierarchyData?.dynamicFields,
  ]);

  useEffect(() => {
    if (packagingCalculation) {
      onChange(idx, 'packagingCalculation', packagingCalculation);
    }
  }, [packagingCalculation, onChange, idx]);

  return (
    <div className="border border-gray-300 dark:border-gray-700 rounded-md p-4 space-y-4 relative bg-gray-50 dark:bg-gray-800">
   

      {/* Category Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <Label>Category *</Label>
          <select
            className="block w-full rounded-lg border border-gray-300 dark:border-gray-700 shadow-sm py-2 px-3 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            value={data.categoryId || ''}
            onChange={(e) => {
              const newCategoryId = e.target.value;
              onChange(idx, 'categoryId', newCategoryId);
              onChange(idx, 'subcategoryId', '');
              onChange(idx, 'productId', '');
              onChange(idx, 'unit', '');
              setSelectedCategory(newCategoryId);
              setSelectedSubcategory('');
            }}
            required
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id.toString()}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label>Subcategory</Label>
          <select
            className="block w-full rounded-lg border border-gray-300 dark:border-gray-700 shadow-sm py-2 px-3 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            value={data.subcategoryId || ''}
            onChange={(e) => {
              onChange(idx, 'subcategoryId', e.target.value);
              onChange(idx, 'productId', '');
              onChange(idx, 'unit', '');
              setSelectedSubcategory(e.target.value);
            }}
            disabled={!data.categoryId}
          >
            <option value="">Select Subcategory</option>
            {filteredSubcategories.map((sub) => (
              <option key={sub.id} value={sub.id.toString()}>
                {sub.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label>Product *</Label>
          <select
            className="block w-full rounded-lg border border-gray-300 dark:border-gray-700 shadow-sm py-2 px-3 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            value={data.productId}
            onChange={(e) => {
              const selectedProductId = e.target.value;
              onChange(idx, 'productId', selectedProductId);
              onChange(idx, 'unit', '');

              if (selectedProductId) {
                const selectedProduct = products.find(
                  (p) => p.id.toString() === selectedProductId.toString()
                );
                if (selectedProduct) {
                  const productRate =
                    selectedProduct.rate ||
                    selectedProduct.price ||
                    selectedProduct.unitPrice ||
                    selectedProduct.sellingPrice ||
                    '';
                  if (productRate) {
                    onChange(idx, 'rate', productRate.toString());
                  }
                }
              }
            }}
            disabled={!data.categoryId}
            required
          >
            <option value="">Choose product</option>
            {filteredProducts.map((prod) => {
              const displayName =
                prod.name ||
                prod.productName ||
                prod.title ||
                `Product ${prod.id}`;
              return (
                <option key={prod.id} value={prod.id}>
                  {displayName}
                </option>
              );
            })}
            {filteredProducts.length === 0 && (
              <option value="custom" disabled>
                No products found for this category
              </option>
            )}
          </select>
        </div>
      </div>

      {/* Product Description */}
      {prod && (
        <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-900 rounded">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            <strong>Product:</strong> {prod.name || prod.productName || 'N/A'} |{' '}
            <strong>HS Code:</strong>{' '}
            {prod.category?.hsnCode || prod.hsCode || 'N/A'} |{' '}
            <strong>Description:</strong> {prod.description || 'N/A'}
          </div>

          {/* Dynamic Product Weight Information */}
          {(prod.packagingHierarchyData?.dynamicFields || prod.unitWeight) && (
            <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900 rounded border border-blue-200 dark:border-blue-700">
              <div className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">
                Product Weight Information:
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                {/* Show unit weight from main product data - dynamic */}
                {prod.unitWeight && (
                  <div className="text-center p-1 bg-white dark:bg-gray-800 rounded">
                    <div className="font-bold text-gray-900 dark:text-gray-100">
                      {prod.unitWeight} {prod.unitWeightUnit || 'g'}
                    </div>
                    <div className="text-gray-600 dark:text-gray-400">
                      per {prod.weightUnitType?.toLowerCase() || 'unit'}
                    </div>
                  </div>
                )}

                {/* Show packaging hierarchy weights - completely dynamic */}
                {prod.packagingHierarchyData?.dynamicFields &&
                  Object.entries(prod.packagingHierarchyData.dynamicFields)
                    .filter(
                      ([key, value]) =>
                        key.startsWith('weight') &&
                        value &&
                        key !== 'weightUnitType' &&
                        !key.endsWith('Unit')
                    )
                    .map(([key, value]) => {
                      let unitName = key
                        .replace('weightPer', '')
                        .replace(/([A-Z])/g, ' $1')
                        .trim()
                        .toLowerCase();

                      // Special handling for square meter
                      if (unitName === 'square meter') {
                        unitName = 'square meter';
                      }

                      const unitField = key + 'Unit';
                      const unit =
                        prod.packagingHierarchyData.dynamicFields[unitField] ||
                        'kg';

                      return (
                        <div
                          key={key}
                          className="text-center p-1 bg-white dark:bg-gray-800 rounded"
                        >
                          <div className="font-bold text-gray-900 dark:text-gray-100">
                            {value} {unit}
                          </div>
                          <div className="text-gray-600 dark:text-gray-400">
                            per {unitName}
                          </div>
                        </div>
                      );
                    })}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <Label>Unit *</Label>
          <select
            key={`unit-dropdown-${data.categoryId}-${idx}`}
            className="block w-full rounded-lg border border-gray-300 dark:border-gray-700 shadow-sm py-2 px-3 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            value={data.unit || ''}
            onChange={(e) => {
              onChange(idx, 'unit', e.target.value);
            }}
            required
          >
            <option value="">Choose unit</option>
            {(() => {
              const category = categories.find(
                (c) => c.id.toString() === data.categoryId
              );

              const packagingHierarchy = category?.packagingHierarchy || [];
              const availableUnits = [];

              if (packagingHierarchy.length > 0) {
                packagingHierarchy.forEach((level, levelIdx) => {
                  availableUnits.push(
                    <option key={`from-${levelIdx}`} value={level.from}>
                      {level.from}
                    </option>
                  );
                });

                const lastLevel =
                  packagingHierarchy[packagingHierarchy.length - 1];
                if (lastLevel?.to) {
                  availableUnits.push(
                    <option key={`to-final`} value={lastLevel.to}>
                      {lastLevel.to}
                    </option>
                  );
                }
              } else {
                const subcategory = category?.subcategories?.find(
                  (s) => s.id.toString() === data.subcategoryId
                );

                const unitSet = new Set();

                if (category?.primary_unit) {
                  unitSet.add(category.primary_unit);
                }
                if (category?.secondary_unit) {
                  unitSet.add(category.secondary_unit);
                }

                if (subcategory?.primary_unit) {
                  unitSet.add(subcategory.primary_unit);
                }
                if (subcategory?.secondary_unit) {
                  unitSet.add(subcategory.secondary_unit);
                }

                if (unitSet.size === 0) {
                  ['pcs', 'box', 'kg'].forEach((unit) => unitSet.add(unit));
                }

                Array.from(unitSet).forEach((unit) => {
                  availableUnits.push(
                    <option key={unit} value={unit}>
                      {unit.charAt(0).toUpperCase() + unit.slice(1)}
                    </option>
                  );
                });
              }

              return availableUnits;
            })()}
          </select>
          {/* Unit Weight Helper */}
          {data.unit && data.productId && prod && (
            <div className="text-xs mt-1 p-2 bg-gray-50 dark:bg-gray-800 rounded border">
              <span className="text-gray-600 dark:text-gray-400">
                Weight per {data.unit}:
              </span>
              <span className="font-mono font-bold text-gray-900 dark:text-gray-100 ml-1">
                {(() => {
                  const weightPer1Unit = calculateTotalWeight(
                    data.productId,
                    '1',
                    data.unit
                  );

                  // For square meter, show the exact weight from product data if available
                  if (
                    data.unit.toLowerCase() === 'square meter' &&
                    prod?.packagingHierarchyData?.dynamicFields
                      ?.weightPerSquareMeter
                  ) {
                    return `${prod.packagingHierarchyData.dynamicFields.weightPerSquareMeter.toFixed(4)} KG`;
                  }

                  return `${weightPer1Unit.toFixed(4)} KG`;
                })()}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Quantity Input */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <Label>Quantity *</Label>
          <input
            ref={quantityRef}
            type="number"
            step="any"
            defaultValue={data.quantity || ''}
            onBlur={(e) => {
              onChange(idx, 'quantity', e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onChange(idx, 'quantity', e.currentTarget.value);
              }
            }}
            placeholder="Enter quantity"
            required
            className="block w-full rounded-lg border border-gray-300 dark:border-gray-700 shadow-sm py-2 px-3 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          />
          {/* Real-time weight calculation display */}
          {data.productId && data.quantity && data.unit && (
            <div className="text-xs bg-slate-50 dark:bg-slate-900 p-2 rounded mt-2 border border-slate-200 dark:border-slate-700">
              <div className="text-slate-700 dark:text-slate-300">
                <strong>📊 Weight Calculation:</strong>
                <br />
                <span className="font-mono">
                  {data.quantity} {data.unit} ={' '}
                  <strong>{totalWeight.toFixed(3)} KG</strong>
                </span>
                <br />
                <span className="text-xs opacity-75">
                  Rate:{' '}
                  {(() => {
                    const packagingData =
                      prod.packagingHierarchyData?.dynamicFields;

                    if (
                      data.unit.toLowerCase() === 'pack' &&
                      packagingData?.weightPerPack
                    ) {
                      const weightKg = packagingData.weightPerPack / 1000;
                      return `${weightKg.toFixed(4)} KG per ${data.unit}`;
                    }

                    return totalWeight > 0
                      ? `${(totalWeight / parseFloat(data.quantity || '1')).toFixed(4)} KG per ${data.unit}`
                      : `0 KG per ${data.unit}`;
                  })()}
                </span>
              </div>
            </div>
          )}

          {/* Dynamic Tiles Box/Pallet Calculation */}
          {packagingCalculation && (
            <div className="text-xs bg-blue-50 dark:bg-blue-900 p-3 rounded mt-2 border border-blue-200 dark:border-blue-700">
              <div className="text-blue-800 dark:text-blue-200">
                <strong>🔢 Packaging Calculation:</strong>
                <br />
                <div className="space-y-1">
                  <div className="font-mono font-bold">
                    {packagingCalculation.calculatedFor} SQM ={' '}
                    <span className="text-green-600 dark:text-green-400">
                      {packagingCalculation.totalBoxes} BOXES
                    </span>{' '}
                    /{' '}
                    <span className="text-purple-600 dark:text-purple-400">
                      {packagingCalculation.totalPallets} PALLETS
                    </span>
                  </div>
                  <div className="text-xs opacity-75">
                    Calculation: {packagingCalculation.sqmPerBox.toFixed(2)}{' '}
                    SQM/Box, {packagingCalculation.boxesPerPallet} Boxes/Pallet
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Rate per Unit */}
        <div>
          <Label>Rate per Unit *</Label>
          <input
            ref={rateRef}
            type="number"
            min={0}
            step="any"
            defaultValue={data.rate || ''}
            onBlur={(e) => {
              onChange(idx, 'rate', e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onChange(idx, 'rate', e.currentTarget.value);
              }
            }}
            placeholder="Enter rate per unit"
            required
            className="block w-full rounded-lg border border-gray-300 dark:border-gray-700 shadow-sm py-2 px-3 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          />
        </div>
      </div>
    </div>
  );
};

export default ProductRow;
