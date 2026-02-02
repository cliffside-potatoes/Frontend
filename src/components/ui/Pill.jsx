import React from 'react';
import './Pill.css';

const Pill = ({ children, color, onClick, asButton = false, className = '' }) => {
  const style = color ? { backgroundColor: color } : undefined;
  const classNames = `pill ${className}`.trim();

  if (asButton) {
    return (
      <button type="button" className={classNames} style={style} onClick={onClick}>
        {children}
      </button>
    );
  }

  return (
    <span className={classNames} style={style}>
      {children}
    </span>
  );
};

export default Pill;
