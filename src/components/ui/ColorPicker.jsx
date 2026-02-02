import React from 'react';
import './ColorPicker.css';

const DEFAULT_COLORS = [
  '#90caf9', '#ce93d8', '#a5d6a7', '#fff59d', '#ffab91',
  '#b0bec5', '#80cbc4', '#f48fb1', '#e1bee7', '#c5e1a5',
  '#ffe082', '#ffcc80', '#b39ddb', '#81d4fa', '#f8bbd0',
  '#d7ccc8', '#cfd8dc', '#ffcdd2', '#c8e6c9', '#bbdefb',
];

const ColorPicker = ({ isOpen, onClose, value, onChange }) => {
  if (!isOpen) return null;

  return (
    <div className="color-picker-overlay" onClick={onClose}>
      <div className="color-picker" onClick={(e) => e.stopPropagation()}>
        <div className="color-picker__header">
          <span className="color-picker__preview" style={{ backgroundColor: value || '#90caf9' }} />
          <span className="color-picker__title">색상</span>
        </div>
        <div className="color-picker__grid">
          {DEFAULT_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              className={`color-picker__swatch ${value === color ? 'color-picker__swatch--selected' : ''}`}
              style={{ backgroundColor: color }}
              onClick={() => onChange?.(color)}
              aria-label={`색상 ${color}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ColorPicker;
export { DEFAULT_COLORS };
