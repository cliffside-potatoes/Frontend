import React from 'react';
import './Dropdown.css';

const Dropdown = ({ isOpen, onClose, options, onSelect }) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="dropdown-backdrop" onClick={onClose} aria-hidden="true" />
      <div className="dropdown" role="menu">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            className={`dropdown__item ${opt.danger ? 'dropdown__item--danger' : ''}`}
            onClick={() => {
              onSelect?.(opt.value);
              onClose?.();
            }}
            role="menuitem"
          >
            {opt.label}
          </button>
        ))}
      </div>
    </>
  );
};

export default Dropdown;
