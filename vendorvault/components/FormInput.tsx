"use client";

import { FieldError, UseFormRegisterReturn } from "react-hook-form";

/**
 * FormInput Component
 *
 * A reusable, accessible input component designed for React Hook Form integration.
 * Handles label rendering, input registration, and error display with proper accessibility attributes.
 *
 * Features:
 * - 📋 Works seamlessly with React Hook Form's register function
 * - ♿ Fully accessible with aria-invalid for screen readers
 * - 🎨 Tailwind-based styling for consistent design
 * - 📱 Responsive and mobile-friendly
 * - ✅ Error message display below input
 */

interface FormInputProps {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  register: UseFormRegisterReturn;
  error?: FieldError;
  required?: boolean;
  disabled?: boolean;
  helperText?: string;
}

export default function FormInput({
  label,
  name,
  type = "text",
  placeholder,
  register,
  error,
  required = false,
  disabled = false,
  helperText,
}: FormInputProps) {
  return (
    <div className="mb-4">
      <label htmlFor={name} className="block mb-2 font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        id={name}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={error ? `${name}-error` : undefined}
        {...register}
        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
          error
            ? "border-red-500 focus:ring-red-500 bg-red-50"
            : "border-gray-300 focus:ring-blue-500 bg-white"
        } ${disabled ? "bg-gray-100 cursor-not-allowed" : ""}`}
      />
      {error && (
        <p
          id={`${name}-error`}
          className="text-red-500 text-sm mt-1 font-medium"
        >
          {error.message}
        </p>
      )}
      {helperText && !error && (
        <p className="text-gray-500 text-sm mt-1">{helperText}</p>
      )}
    </div>
  );
}
