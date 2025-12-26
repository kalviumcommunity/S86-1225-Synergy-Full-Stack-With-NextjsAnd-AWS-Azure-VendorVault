interface InputFieldProps {
  label?: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export function InputField({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  className = "",
}: InputFieldProps) {
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full px-4 py-2 sm:py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 ${
          error
            ? "border-error focus:ring-error dark:border-error-light"
            : "border-gray-300 dark:border-gray-600 focus:ring-brand dark:focus:ring-brand-light hover:border-gray-400 dark:hover:border-gray-500"
        }`}
        aria-label={label}
        aria-invalid={!!error}
        aria-describedby={error ? `error-${label}` : undefined}
      />
      {error && (
        <p
          id={`error-${label}`}
          className="text-error dark:text-error-light text-sm mt-1 animate-fade-in"
        >
          {error}
        </p>
      )}
    </div>
  );
}

export default InputField;
