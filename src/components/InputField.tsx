// components/InputField.tsx - With password toggle
'use client';

import { InputHTMLAttributes, useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  type?: 'text' | 'password' | 'email' | 'number';
  required?: boolean;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
  error?: string;
  isPassword?: boolean;
}

export default function InputField({
  label,
  type = 'text',
  required = false,
  value,
  onChange,
  placeholder,
  className = '',
  error,
  isPassword = false,
  ...props
}: InputFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="space-y-2">
      {/* Label */}
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      {/* Input Field with Password Toggle */}
      <div className="relative">
        <input
          type={inputType}
          required={required}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all duration-200 pr-12
            ${error 
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
              : 'border-gray-300 focus:border-primary'
            }
            ${className}`}
          {...props}
        />
        
        {/* Password Toggle Button */}
        {isPassword && (
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 rounded-full p-1"
          >
            {showPassword ? (
              <FaEyeSlash className="w-5 h-5" />
            ) : (
              <FaEye className="w-5 h-5" />
            )}
          </button>
        )}
      </div>
      
      {/* Error Message */}
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
}