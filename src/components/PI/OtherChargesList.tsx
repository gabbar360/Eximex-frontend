import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTimes } from '@fortawesome/free-solid-svg-icons';
import Label from '../form/Label';

interface OtherChargesListProps {
  value: any[];
  onChange: (list: any[]) => void;
}

const OtherChargesList: React.FC<OtherChargesListProps> = ({
  value,
  onChange,
}) => {
  const handleAdd = () => {
    const newList = [...value, { name: '', amount: '' }];
    onChange(newList);
  };

  const handleRemove = (idx: number) => {
    const newList = value.filter((_, i) => i !== idx);
    onChange(newList);
  };

  const handleChange = (idx: number, field: string, val: string) => {
    const newList = value.map((item, i) =>
      i === idx ? { ...item, [field]: val } : item
    );
    onChange(newList);
  };

  return (
    <div className="flex flex-col">
      <Label>Other Charges</Label>
      <div className="space-y-3 mb-2">
        {value.map((item, idx) => (
          <div key={`charge-${idx}`} className="flex space-x-2">
            <input
              type="text"
              placeholder="Charge name"
              defaultValue={item.name || ''}
              onBlur={(e) => handleChange(idx, 'name', e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleChange(idx, 'name', e.currentTarget.value);
                }
              }}
              className="flex-1 block w-full rounded-lg border border-gray-300 dark:border-gray-700 shadow-sm py-2 px-3 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            />
            <input
              type="number"
              min={0}
              step="any"
              placeholder="Amount"
              defaultValue={item.amount || ''}
              onBlur={(e) => handleChange(idx, 'amount', e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleChange(idx, 'amount', e.currentTarget.value);
                }
              }}
              className="w-40 block rounded-lg border border-gray-300 dark:border-gray-700 shadow-sm py-2 px-3 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            />
            <button
              type="button"
              className="text-red-600 hover:text-red-800 focus:outline-none dark:text-red-400 dark:hover:text-red-300"
              onClick={() => handleRemove(idx)}
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-md text-brand-500 hover:text-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500"
        onClick={handleAdd}
      >
        <FontAwesomeIcon icon={faPlus} className="mr-1" /> Add Other Charge
      </button>
    </div>
  );
};

export default OtherChargesList;