import React from 'react';
import Label from './Label';
import Select from './Select';

interface PricingLogicPair {
  key: string;
  value: string;
}

interface PricingConfigSectionProps {
  pricingModel: string;
  pricingLogicConfig: PricingLogicPair[];
  onPricingModelChange: (value: string) => void;
  onPricingLogicConfigChange: (config: PricingLogicPair[]) => void;
}

const PricingConfigSection: React.FC<PricingConfigSectionProps> = ({
  pricingModel,
  pricingLogicConfig,
  onPricingModelChange,
  onPricingLogicConfigChange,
}) => {
  const pricingModelOptions = [
    { value: '', label: 'Select Pricing Model' },
    { value: 'UNIT', label: 'Unit Based' },
    { value: 'AREA', label: 'Area Based' },
    { value: 'LENGTH', label: 'Length Based' },
    { value: 'WEIGHT', label: 'Weight Based' },
    { value: 'VOLUME', label: 'Volume Based' },
  ];

  const addConfigPair = () => {
    onPricingLogicConfigChange([...pricingLogicConfig, { key: '', value: '' }]);
  };

  const removeConfigPair = (index: number) => {
    const updated = [...pricingLogicConfig];
    updated.splice(index, 1);
    onPricingLogicConfigChange(updated);
  };

  const updateConfigPair = (
    index: number,
    field: 'key' | 'value',
    newValue: string
  ) => {
    const updated = [...pricingLogicConfig];
    updated[index] = { ...updated[index], [field]: newValue };
    onPricingLogicConfigChange(updated);
  };

  return (
    <div className="space-y-6">
      {/* Pricing Model */}
      <div className="col-span-1">
        <Label htmlFor="pricing_model">Pricing Model</Label>
        <Select
          options={pricingModelOptions}
          defaultValue={pricingModel}
          onChange={onPricingModelChange}
          className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
        />
      </div>

      {/* Pricing Logic Config */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Pricing Logic Configuration</Label>
          <button
            type="button"
            onClick={addConfigPair}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add Config
          </button>
        </div>

        <div className="space-y-3">
          {pricingLogicConfig.map((pair, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50"
            >
              <div className="flex-1">
                <input
                  type="text"
                  value={pair.key}
                  onChange={(e) =>
                    updateConfigPair(index, 'key', e.target.value)
                  }
                  placeholder="Configuration key (e.g., unit, multiplier)"
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                />
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  value={pair.value}
                  onChange={(e) =>
                    updateConfigPair(index, 'value', e.target.value)
                  }
                  placeholder="Configuration value (e.g., sqm, 1.5)"
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                />
              </div>
              {pricingLogicConfig.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeConfigPair(index)}
                  className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-red-300 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 dark:border-red-700 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
                  title="Remove configuration"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>

        {pricingLogicConfig.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p className="text-sm">No pricing configuration added yet.</p>
            <p className="text-xs mt-1">
              Click "Add Config" to add pricing logic parameters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PricingConfigSection;
