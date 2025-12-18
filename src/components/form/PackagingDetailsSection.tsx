import React, { useState, useEffect, useRef } from 'react';
import Label from './Label';
import Select from './Select';
import Input from './input/InputField';
import { fetchAllPackagingUnits } from '../../features/packagingSlice';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';

interface PackagingLevel {
  parentUnitId: number | string;
  childUnitId: number | string;
  conversionQuantity: number | string;
}

interface PackagingUnit {
  id: number;
  name: string;
  abbreviation: string;
  description?: string;
}

interface PackagingDetailsSectionProps {
  packagingLevels: PackagingLevel[];
  onPackagingLevelsChange: (levels: PackagingLevel[]) => void;
  primaryUnit?: string;
}

// Unit Dropdown Component for Packaging
const PackagingUnitDropdown: React.FC<{
  id: string;
  value: string;
  onChange: (value: string) => void;
  options: PackagingUnit[];
  placeholder?: string;
}> = ({ id, value, onChange, options, placeholder = 'Select unit' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredOptions = options.filter(
    (option) =>
      option.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      option.abbreviation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedOption = options.find(
    (option) => option.id.toString() === value
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        id={id}
        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm shadow-sm text-left focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200 transition-all duration-300"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={selectedOption ? 'text-slate-800' : 'text-slate-400'}>
          {selectedOption
            ? `${selectedOption.name} (${selectedOption.abbreviation})`
            : placeholder}
        </span>
        <svg
          className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-hidden">
          <div className="p-2 border-b border-gray-200">
            <input
              type="text"
              placeholder="Search units..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-500 transition-all duration-300"
              autoFocus
            />
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-slate-50 transition-colors ${
                    value === option.id.toString()
                      ? 'bg-slate-50 text-slate-700'
                      : 'text-slate-700'
                  }`}
                  onClick={() => handleSelect(option.id.toString())}
                >
                  {option.name} ({option.abbreviation})
                </button>
              ))
            ) : (
              <div className="px-4 py-2 text-sm text-slate-500">
                No units found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const PackagingDetailsSection: React.FC<PackagingDetailsSectionProps> = ({
  packagingLevels,
  onPackagingLevelsChange,
  primaryUnit,
}) => {
  const dispatch = useDispatch();
  const [packagingUnits, setPackagingUnits] = useState<PackagingUnit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPackagingUnits = async () => {
      try {
        setLoading(true);
        const response = await dispatch(fetchAllPackagingUnits()).unwrap();
        setPackagingUnits(response.data || response || []);
      } catch (error: any) {
        console.error('Failed to fetch packaging units:', error);
        toast.error('Failed to load packaging units');
      } finally {
        setLoading(false);
      }
    };

    fetchPackagingUnits();
  }, []);

  const addPackagingLevel = () => {
    // Find primary unit ID if it's the first level
    let parentUnitId = '';
    if (packagingLevels.length === 0 && primaryUnit) {
      // Get the available parent units for the first level
      const availableParentUnits = getAvailableParentUnits(0);

      if (availableParentUnits.length > 0) {
        parentUnitId = availableParentUnits[0].id.toString();
      } else if (packagingUnits.length > 0) {
        // If no specific unit found, use the first available unit
        parentUnitId = packagingUnits[0].id.toString();
        console.warn(
          `Primary unit ${primaryUnit} not found, using ${packagingUnits[0].name} instead`
        );
      }
    } else if (packagingLevels.length > 0) {
      // For subsequent levels, use the previous level's child unit as parent
      const previousLevel = packagingLevels[packagingLevels.length - 1];
      if (previousLevel?.childUnitId) {
        parentUnitId = previousLevel.childUnitId.toString();
      }
    }

    const newLevel: PackagingLevel = {
      parentUnitId,
      childUnitId: '',
      conversionQuantity: 1, // Default to 1
    };
    onPackagingLevelsChange([...packagingLevels, newLevel]);
  };

  const removePackagingLevel = (index: number) => {
    const updatedLevels = packagingLevels.filter((_, i) => i !== index);
    onPackagingLevelsChange(updatedLevels);
  };

  const updatePackagingLevel = (
    index: number,
    field: keyof PackagingLevel,
    value: string | number
  ) => {
    const updatedLevels = [...packagingLevels];
    updatedLevels[index] = {
      ...updatedLevels[index],
      [field]: value,
    };

    // Automatically set conversionQuantity to 1 when both parent and child units are selected
    if (
      (field === 'parentUnitId' || field === 'childUnitId') &&
      updatedLevels[index].parentUnitId &&
      updatedLevels[index].childUnitId &&
      !updatedLevels[index].conversionQuantity
    ) {
      updatedLevels[index].conversionQuantity = 1;
    }

    onPackagingLevelsChange(updatedLevels);
  };

  const getAvailableParentUnits = (levelIndex: number) => {
    if (levelIndex === 0) {
      // First level: primary unit should be the parent
      if (!primaryUnit) {
        return packagingUnits;
      }

      // Special handling for Square Meter variations
      if (
        primaryUnit.toLowerCase() === 'sqm' ||
        primaryUnit.toLowerCase() === 'sqmt'
      ) {
        const sqmtUnit = packagingUnits.find(
          (unit) =>
            unit.name === 'Square Meter' ||
            unit.abbreviation === 'SQMT' ||
            unit.abbreviation === 'SQM' ||
            unit.abbreviation === 'sqm'
        );

        if (sqmtUnit) {
          return [sqmtUnit];
        }
      }

      // Special handling for other unit variations
      const unitMappings: { [key: string]: string[] } = {
        sqft: ['Square Feet', 'SQFT', 'sqft'],
        kg: ['Kilogram', 'KG', 'kg'],
        gram: ['Gram', 'GM', 'g'],
        mt: ['Metric Ton', 'MT', 'mt'],
        pcs: ['Pieces', 'PCS', 'pcs'],
        ltr: ['Liter', 'LTR', 'ltr'],
      };

      const primaryUnitLower = primaryUnit.toLowerCase();
      if (unitMappings[primaryUnitLower]) {
        const matchingUnit = packagingUnits.find(
          (unit) =>
            unitMappings[primaryUnitLower].includes(unit.name) ||
            unitMappings[primaryUnitLower].includes(unit.abbreviation)
        );

        if (matchingUnit) {
          return [matchingUnit];
        }
      }

      // Fallback: try direct matching
      const filteredUnits = packagingUnits.filter(
        (unit) =>
          unit.name.toLowerCase() === primaryUnit.toLowerCase() ||
          unit.abbreviation.toLowerCase() === primaryUnit.toLowerCase()
      );

      return filteredUnits.length > 0 ? filteredUnits : packagingUnits;
    } else {
      // Subsequent levels: previous level's child unit becomes parent
      const previousLevel = packagingLevels[levelIndex - 1];
      if (previousLevel?.childUnitId) {
        return packagingUnits.filter(
          (unit) => unit.id === Number(previousLevel.childUnitId)
        );
      }
    }
    return packagingUnits;
  };

  const getAvailableChildUnits = (levelIndex: number) => {
    return packagingUnits;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-200 border-t-slate-600"></div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-800">
            Packaging Details
          </h3>
          <p className="text-sm text-slate-600 mt-1">
            Define packaging hierarchy for unit conversions (e.g., PCS → Box →
            Package → Pallet)
          </p>
        </div>
        <button
          type="button"
          onClick={addPackagingLevel}
          className="px-3 sm:px-4 py-2 bg-slate-700 text-white rounded-lg text-sm hover:bg-slate-800 transition-all duration-300 shadow-lg whitespace-nowrap"
        >
          <span className="hidden sm:inline">Add Level</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      {packagingLevels.length === 0 && (
        <div className="text-center py-8 text-slate-500">
          <p>No packaging levels defined.</p>
          <p className="text-sm mt-1">
            Click "Add Level" to create packaging hierarchy.
          </p>
        </div>
      )}

      {packagingLevels.map((level, index) => (
        <div
          key={index}
          className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-4 p-4 border border-gray-200 rounded-lg shadow-sm"
        >
          <div className="md:col-span-1 flex items-center">
            <span className="text-sm font-medium text-slate-600">
              Level {index + 1}
            </span>
          </div>

          <div className="md:col-span-3">
            <Label htmlFor={`packaging-parent-${index}`}>From Unit</Label>
            <PackagingUnitDropdown
              id={`packaging-parent-${index}`}
              value={level.parentUnitId.toString()}
              onChange={(value) =>
                updatePackagingLevel(index, 'parentUnitId', value)
              }
              options={getAvailableParentUnits(index)}
              placeholder="Select parent unit"
            />
          </div>

          <div className="md:col-span-4 flex items-center justify-center">
            <span className="text-slate-500">→</span>
          </div>

          <div className="md:col-span-3">
            <Label htmlFor={`packaging-child-${index}`}>To Unit</Label>
            <PackagingUnitDropdown
              id={`packaging-child-${index}`}
              value={level.childUnitId.toString()}
              onChange={(value) =>
                updatePackagingLevel(index, 'childUnitId', value)
              }
              options={getAvailableChildUnits(index)}
              placeholder="Select child unit"
            />
          </div>

          <div className="md:col-span-1 flex items-end justify-center">
            {packagingLevels.length > 1 && (
              <button
                type="button"
                onClick={() => removePackagingLevel(index)}
                className="px-2 py-2 bg-slate-500 text-white rounded-lg text-sm hover:bg-slate-800 transition-all duration-300 shadow-lg w-full"
              >
                X
              </button>
            )}
          </div>
        </div>
      ))}

      {packagingLevels.length > 0 && (
        <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-gray-200">
          <h4 className="text-sm font-medium text-slate-800 mb-2">
            Conversion Chain Preview:
          </h4>
          <div className="text-sm text-slate-600">
            {packagingLevels
              .map((level, index) => {
                const parentUnit = packagingUnits.find(
                  (u) => u.id === Number(level.parentUnitId)
                );
                const childUnit = packagingUnits.find(
                  (u) => u.id === Number(level.childUnitId)
                );

                if (parentUnit && childUnit) {
                  return (
                    <span key={index}>
                      {parentUnit.abbreviation.toLowerCase()} per{' '}
                      {childUnit.abbreviation.toLowerCase()}
                      {index < packagingLevels.length - 1 ? ' → ' : ''}
                    </span>
                  );
                }
                return null;
              })
              .filter(Boolean)}
          </div>
        </div>
      )}
    </div>
  );
};

export default PackagingDetailsSection;
