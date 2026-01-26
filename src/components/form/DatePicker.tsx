import React from 'react';
import { DatePicker as AntDatePicker } from 'antd';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';

interface DatePickerProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  placeholder = 'Select date',
  disabled = false,
  className = '',
}) => {
  const handleChange = (date: Dayjs | null) => {
    if (onChange) {
      onChange(date ? date.format('YYYY-MM-DD') : '');
    }
  };

  const dayjsValue = value ? dayjs(value) : null;

  return (
    <AntDatePicker
      value={dayjsValue}
      onChange={handleChange}
      placeholder={placeholder}
      disabled={disabled}
      className={`h-11 w-full rounded-lg border bg-transparent text-gray-800 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:text-white dark:bg-gray-900 dark:focus:border-blue-400 shadow-sm ${className}`}
      style={{
        width: '100%',
        height: '44px',
      }}
      format="YYYY-MM-DD"
      allowClear
    />
  );
};

export default DatePicker;
