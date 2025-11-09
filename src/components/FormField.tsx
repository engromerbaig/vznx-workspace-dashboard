'use client';

import React from 'react';
import { BASE_CURRENCY } from '@/lib/currency';

interface FormFieldProps {
  label: string;
  name: string;
  value: string | number | undefined;
  isEditing: boolean;
  type?: 'text' | 'number' | 'textarea' | 'select';
  options?: { value: string; label: string }[];
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  className?: string;
  readonly?: boolean;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  value,
  isEditing,
  type = 'text',
  options = [],
  onChange,
  className = '',
  readonly = false,
}) => {
  const baseClass = 'w-full border border-gray-200 px-4 py-2 rounded-lg text-sm text-gray-800';
  const textareaClass = type === 'textarea' ? 'min-h-[120px]' : '';

  // Format value for display when not editing
  const displayValue = () => {
    if (value === undefined || value === null) {
      return type === 'textarea' ? 'No description provided' : 'N/A';
    }
    if (type === 'number') {
      return `${BASE_CURRENCY} ${Number(value).toFixed(0)}`;
    }
    return value;
  };

  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1">{label}</label>
      {isEditing && !readonly ? (
        type === 'select' ? (
          <select
            name={name}
            className={`${baseClass} ${className}`}
            value={value ?? ''}
            onChange={onChange}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : type === 'textarea' ? (
          <textarea
            name={name}
            className={`${baseClass} ${textareaClass} ${className}`}
            value={value ?? ''}
            onChange={onChange}
            rows={2}
          />
        ) : type === 'number' ? (
          <input
            type="number"
            name={name}
            className={`${baseClass} ${className}`}
            value={value ?? ''}
            onChange={onChange}
            min="0"
            step="1"
          />
        ) : (
          <input
            type="text"
            name={name}
            className={`${baseClass} ${className}`}
            value={value ?? ''}
            onChange={onChange}
          />
        )
      ) : (
        <p
          className={`border border-gray-200 bg-gray-50 px-4 py-2 rounded-lg text-gray-800 ${textareaClass} ${className} ${
            readonly && name === 'passportNumber' ? 'uppercase' : ''
          }`}
        >
          {displayValue()}
        </p>
      )}
    </div>
  );
};

export default FormField;