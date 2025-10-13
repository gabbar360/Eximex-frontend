import React, { useState, useEffect } from 'react';
import { userService } from '../service/userService';
import { toast } from 'react-toastify';

interface AssignableData {
  id: number;
  name?: string;
  companyName?: string;
  piNumber?: string;
  orderNumber?: string;
  createdAt: string;
}

interface Staff {
  id: number;
  name: string;
  email: string;
}

const DataAssignment: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [selectedFromUser, setSelectedFromUser] = useState<number | null>(null);
  const [selectedToUser, setSelectedToUser] = useState<number | null>(null);
  const [entityType, setEntityType] = useState<string>('party');
  const [assignableData, setAssignableData] = useState<AssignableData[]>([]);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  const entityTypes = [
    { value: 'party', label: 'Parties' },
    { value: 'product', label: 'Products' },
    { value: 'piInvoice', label: 'PI Invoices' },
    { value: 'order', label: 'Orders' },
    { value: 'vgmDocument', label: 'VGM Documents' },
  ];

  useEffect(() => {
    if (isOpen) {
      fetchStaff();
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedFromUser && entityType) {
      fetchAssignableData();
    }
  }, [selectedFromUser, entityType]);

  const fetchStaff = async () => {
    try {
      const data = await userService.getCompanyStaff();
      setStaff(data.data || []);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const fetchAssignableData = async () => {
    if (!selectedFromUser) return;

    try {
      const data = await userService.getAssignableData(
        selectedFromUser,
        entityType
      );
      setAssignableData(data.data || []);
      setSelectedItems([]);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleAssign = async () => {
    if (!selectedFromUser || !selectedToUser || selectedItems.length === 0) {
      toast.error('Please select users and items to assign');
      return;
    }

    setLoading(true);
    try {
      const result = await userService.assignData(
        entityType,
        selectedItems,
        selectedFromUser,
        selectedToUser
      );

      toast.success(result.message);
      fetchAssignableData();
      setSelectedItems([]);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleItemSelection = (id: number) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const getDisplayName = (item: AssignableData) => {
    return (
      item.companyName ||
      item.name ||
      item.piNumber ||
      item.orderNumber ||
      `Item ${item.id}`
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Assign Data to Staff
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* From User */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              From Staff
            </label>
            <select
              value={selectedFromUser || ''}
              onChange={(e) => setSelectedFromUser(Number(e.target.value))}
              className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="">Select staff</option>
              {staff.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name} ({member.email})
                </option>
              ))}
            </select>
          </div>

          {/* Entity Type */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Data Type
            </label>
            <select
              value={entityType}
              onChange={(e) => setEntityType(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              {entityTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* To User */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              To Staff
            </label>
            <select
              value={selectedToUser || ''}
              onChange={(e) => setSelectedToUser(Number(e.target.value))}
              className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="">Select staff</option>
              {staff
                .filter((s) => s.id !== selectedFromUser)
                .map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name} ({member.email})
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* Assignable Data */}
        {assignableData.length > 0 && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium text-gray-900 dark:text-gray-100">
                Select Items to Assign ({assignableData.length})
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    setSelectedItems(assignableData.map((item) => item.id))
                  }
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                >
                  Select All
                </button>
                <button
                  onClick={() => setSelectedItems([])}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  Clear All
                </button>
              </div>
            </div>

            <div className="max-h-60 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded">
              {assignableData.map((item) => (
                <div
                  key={item.id}
                  className={`p-3 border-b border-gray-200 dark:border-gray-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${
                    selectedItems.includes(item.id)
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700'
                      : ''
                  }`}
                  onClick={() => toggleItemSelection(item.id)}
                >
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.id)}
                      onChange={() => toggleItemSelection(item.id)}
                      className="mr-3"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {getDisplayName(item)}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Created: {new Date(item.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {assignableData.length === 0 && selectedFromUser && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No{' '}
            {entityTypes
              .find((t) => t.value === entityType)
              ?.label.toLowerCase()}{' '}
            found for selected staff
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleAssign}
            disabled={
              loading ||
              !selectedFromUser ||
              !selectedToUser ||
              selectedItems.length === 0
            }
            className="px-4 py-2 bg-blue-500 dark:bg-blue-600 text-white rounded hover:bg-blue-600 dark:hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Assigning...' : `Assign ${selectedItems.length} Items`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataAssignment;
