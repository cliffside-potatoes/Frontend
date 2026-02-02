import React from 'react';
import './TextInput.css';

const TextInput = ({
  value,
  onChange,
  placeholder = '',
  label,
  id,
  disabled = false,
  className = '',
  ...rest
}) => {
  const inputId = id || `text-input-${Math.random().toString(36).slice(2, 9)}`;

  return (
    <div className={`text-input ${className}`}>
      {label && (
        <label htmlFor={inputId} className="text-input__label">
          {label}
        </label>
      )}
      <input
        id={inputId}
        type="text"
        className="text-input__field"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        {...rest}
      />
    </div>
  );
};

export default TextInput;
