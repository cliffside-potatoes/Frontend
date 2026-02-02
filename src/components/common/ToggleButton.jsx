import React from 'react';
import './ToggleButton.css';

const ToggleButton = ({ options, value, onChange }) => {
  return (
    <div className="toggle-button" role="group" aria-label="선택">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          className={`toggle-button__option ${value === opt.value ? 'toggle-button__option--active' : ''}`}
          onClick={() => onChange?.(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
};

export default ToggleButton;
