import React from 'react';
import {
  CATEGORY_COLOR_OPTIONS,
  DEFAULT_CATEGORY_COLOR_HEX,
  DEFAULT_CATEGORY_COLOR_ENUM,
  toCategoryColorEnum,
  toCategoryColorHex,
} from '../../utils/categoryColors';
import './ColorPicker.css';

const ColorPicker = ({ isOpen, onClose, value, onChange }) => {
  if (!isOpen) return null;

  const normalizedValue = toCategoryColorHex(value);

  return (
    <div className="color-picker-overlay" onClick={onClose}>
      <div className="color-picker" onClick={(e) => e.stopPropagation()}>
        <div className="color-picker__header">
          <span
            className="color-picker__preview"
            style={{ backgroundColor: normalizedValue }}
          />
          <span className="color-picker__title">색상</span>
        </div>
        <div className="color-picker__grid">
          {CATEGORY_COLOR_OPTIONS.map((option) => (
            <button
              key={option.enumValue}
              type="button"
              className={`color-picker__swatch ${normalizedValue === option.hex.toUpperCase() ? 'color-picker__swatch--selected' : ''}`}
              style={{ backgroundColor: option.hex }}
              onClick={() => onChange?.(option.hex.toUpperCase())}
              aria-label={`색상 ${option.enumValue}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ColorPicker;
export {
  CATEGORY_COLOR_OPTIONS,
  DEFAULT_CATEGORY_COLOR_HEX,
  DEFAULT_CATEGORY_COLOR_ENUM,
  toCategoryColorEnum,
  toCategoryColorHex,
};
