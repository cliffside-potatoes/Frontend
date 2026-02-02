import React from 'react';
import './PrimaryButton.css';

const PrimaryButton = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  disabled = false,
  fullWidth = false,
  className = '',
}) => {
  return (
    <button
      type={type}
      className={`primary-btn primary-btn--${variant} ${fullWidth ? 'primary-btn--full' : ''} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default PrimaryButton;
