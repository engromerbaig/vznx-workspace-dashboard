// src/components/TextAreaField.tsx
'use client';

import { TextareaHTMLAttributes } from 'react';

interface TextAreaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  required?: boolean;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  className?: string;
  error?: string;
}

export default function TextAreaField({
  label,
  required = false,
  value,
  onChange,
  placeholder,
  className = '',
  error,
  ...props
}: TextAreaFieldProps) {
  return (
    <div className="space-y-2">
      {/* Label */}
      <label className="block text-sm font-medium text-white">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* Textarea */}
     <textarea
  required={required}
  value={value}
  onChange={onChange}
  placeholder={placeholder}
  className={`w-full px-4 py-3 border rounded-lg  text-white 
    focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all duration-200
    resize-none  /* Disables resizing */
    [appearance:textfield] [&::-webkit-resizer]:hidden  /* Hides the grip in WebKit */
    ${error
      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
      : 'border-gray-600 focus:border-primary'
    }
    ${className}`}
  {...props}
/>

      {/* Error Message */}
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
}
