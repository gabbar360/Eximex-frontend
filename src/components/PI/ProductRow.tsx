import React, { useRef, useEffect, useCallback, useMemo, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import {
  HiChevronDown,
  HiMagnifyingGlass,
} from 'react-icons/hi2';
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

  // Dropdown states
  const [categorySearch, setCategorySearch] = useState('');
  const [subcategorySearch, setSubcategorySearch] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [unitSearch, setUnitSearch] = useState('');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showSubcategoryDropdown, setShowSubcategoryDropdown] = useState(false);
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [showUnitDropdown, setShowUnitDropdown] = useState(false);
  
  const categoryRef = useRef(null);
  const subcategoryRef = useRef(null);
  const productRef = useRef(null);
  const unitRef = useRef(null);

  // Custom Dropdown Component
  const SearchableDropdown = ({
    label,
    value,
    options,
    onSelect,
    searchValue,
    onSearchChange,
    isOpen,
    onToggle,
    placeholder,
    disabled = false,
    dropdownRef,
    displayKey = 'name',
    valueKey = 'id',
  }) => {
    const selectedOption = options.find((opt) => opt[valueKey]?.toString() === value?.toString());

    return (
      <div className="relative" ref={dropdownRef}>
        <div
          className={`w-full px-3 py-2 border border-gray-300 bg-white rounded-lg cursor-pointer flex items-center justify-between transition-all duration-300 shadow-sm ${
            disabled
              ? 'bg-gray-100 cursor-not-allowed'
              : 'hover:border-slate-400 focus-within:ring-2 focus-within:ring-slate-200 focus-within:border-slate-500'
          }`}
          onClick={() => !disabled && onToggle()}
        >
          <span
            className={`text-sm ${selectedOption ? 'text-slate-900' : 'text-slate-500'}`}
          >
            {selectedOption ? selectedOption[displayKey] : placeholder}
          </span>
          <HiChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
        </div>

        {isOpen && !disabled && (
          <div
            className="absolute z-50 w-full bg-white border border-gray-200 rounded-lg shadow-xl"
            style={{ top: '100%', marginTop: '4px' }}
          >
            <div className="p-3 border-b border-gray-100">
              <div className="relative">
                <HiMagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder={`Search ${label.toLowerCase()}...`}
                  value={searchValue}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                  onClick={(e) => e.stopPropagation()}
                  autoFocus
                />
              </div>
            </div>
            <div className="max-h-60 overflow-y-auto">
              {options.length === 0 ? (
                <div className="px-4 py-3 text-slate-500 text-sm text-center">
                  No {label.toLowerCase()} found
                </div>
              ) : (
                options.map((option) => (
                  <div
                    key={option[valueKey]}
                    className={`px-4 py-3 hover:bg-slate-50 cursor-pointer text-sm transition-colors duration-150 ${
                      option[valueKey]?.toString() === value?.toString()
                        ? 'bg-slate-100 text-slate-900 font-medium'
                        : 'text-slate-700'
                    }`}
                    onClick={() => {
                      onSelect(option[valueKey]);
                      onToggle();
                    }}
                  >
                    {option[displayKey]}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

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

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (categoryRef.current && !categoryRef.current.contains(event.target)) {
        setShowCategoryDropdown(false);
      }
      if (subcategoryRef.current && !subcategoryRef.current.contains(event.target)) {
        setShowSubcategoryDropdown(false);
      }
      if (productRef.current && !productRef.current.contains(event.target)) {
        setShowProductDropdown(false);
      }
      if (unitRef.current && !unitRef.current.contains(event.target)) {
        setShowUnitDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
          <SearchableDropdown
            label="Category"
            value={data.categoryId || ''}
            options={categories
              .filter((cat) =>
                cat.name
                  .toLowerCase()
                  .includes(categorySearch.toLowerCase())
              )
              .map((cat) => ({
                id: cat.id.toString(),
                name: cat.name,
              }))}
            onSelect={(categoryId) => {
              onChange(idx, 'categoryId', categoryId);
              onChange(idx, 'subcategoryId', '');
              onChange(idx, 'productId', '');
              onChange(idx, 'unit', '');
              setSelectedCategory(categoryId);
              setSelectedSubcategory('');
              setCategorySearch('');
            }}
            searchValue={categorySearch}
            onSearchChange={setCategorySearch}
            isOpen={showCategoryDropdown}
            onToggle={() => setShowCategoryDropdown(!showCategoryDropdown)}
            placeholder="Select Category"
            dropdownRef={categoryRef}
          />
        </div>

        <div>
          <Label>Subcategory</Label>
          <SearchableDropdown
            label="Subcategory"
            value={data.subcategoryId || ''}
            options={filteredSubcategories
              .filter((sub) =>
                sub.name
                  .toLowerCase()
                  .includes(subcategorySearch.toLowerCase())
              )
              .map((sub) => ({
                id: sub.id.toString(),
                name: sub.name,
              }))}
            onSelect={(subcategoryId) => {
              onChange(idx, 'subcategoryId', subcategoryId);
              onChange(idx, 'productId', '');
              onChange(idx, 'unit', '');
              setSelectedSubcategory(subcategoryId);
              setSubcategorySearch('');
            }}
            searchValue={subcategorySearch}
            onSearchChange={setSubcategorySearch}
            isOpen={showSubcategoryDropdown}
            onToggle={() => setShowSubcategoryDropdown(!showSubcategoryDropdown)}
            placeholder="Select Subcategory"
            disabled={!data.categoryId}
            dropdownRef={subcategoryRef}
          />
        </div>

        <div>
          <Label>Product *</Label>
          <SearchableDropdown
            label="Product"
            value={data.productId}
            options={filteredProducts
              .filter((prod) => {
                const displayName =
                  prod.name ||
                  prod.productName ||
                  prod.title ||
                  `Product ${prod.id}`;
                return displayName
                  .toLowerCase()
                  .includes(productSearch.toLowerCase());
              })
              .map((prod) => {
                const displayName =
                  prod.name ||
                  prod.productName ||
                  prod.title ||
                  `Product ${prod.id}`;
                return {
                  id: prod.id,
                  name: displayName,
                };
              })}
            onSelect={(selectedProductId) => {
              onChange(idx, 'productId', selectedProductId);
              onChange(idx, 'unit', '');
              setProductSearch('');

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
            searchValue={productSearch}
            onSearchChange={setProductSearch}
            isOpen={showProductDropdown}
            onToggle={() => setShowProductDropdown(!showProductDropdown)}
            placeholder={filteredProducts.length === 0 ? "No products found for this category" : "Choose product"}
            disabled={!data.categoryId}
            dropdownRef={productRef}
          />
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
          <SearchableDropdown
            label="Unit"
            value={data.unit || ''}
            options={(() => {
              const category = categories.find(
                (c) => c.id.toString() === data.categoryId
              );

              const packagingHierarchy = category?.packagingHierarchy || [];
              const availableUnits = [];

              if (packagingHierarchy.length > 0) {
                packagingHierarchy.forEach((level, levelIdx) => {
                  availableUnits.push({
                    id: level.from,
                    name: level.from,
                  });
                });

                const lastLevel =
                  packagingHierarchy[packagingHierarchy.length - 1];
                if (lastLevel?.to) {
                  availableUnits.push({
                    id: lastLevel.to,
                    name: lastLevel.to,
                  });
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
                  availableUnits.push({
                    id: unit,
                    name: unit.charAt(0).toUpperCase() + unit.slice(1),
                  });
                });
              }

              return availableUnits.filter((unit) =>
                unit.name.toLowerCase().includes(unitSearch.toLowerCase())
              );
            })()}
            onSelect={(unitValue) => {
              onChange(idx, 'unit', unitValue);
              setUnitSearch('');
            }}
            searchValue={unitSearch}
            onSearchChange={setUnitSearch}
            isOpen={showUnitDropdown}
            onToggle={() => setShowUnitDropdown(!showUnitDropdown)}
            placeholder="Choose unit"
            disabled={!data.categoryId}
            dropdownRef={unitRef}
          />
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
