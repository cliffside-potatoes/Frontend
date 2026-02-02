import React from 'react';
import './SuggestionList.css';

const SuggestionList = ({ items, selectedIndex, onSelect, emptyMessage }) => {
  if (!items?.length && !emptyMessage) return null;

  if (items?.length === 0 && emptyMessage) {
    return <p className="suggestion-list__empty">{emptyMessage}</p>;
  }

  return (
    <ul className="suggestion-list" role="listbox">
      {items.map((item, index) => (
        <li key={item.id ?? item.label ?? index}>
          <button
            type="button"
            className={`suggestion-list__item ${index === selectedIndex ? 'suggestion-list__item--selected' : ''}`}
            onClick={() => onSelect?.(item, index)}
            role="option"
            aria-selected={index === selectedIndex}
          >
            {typeof item === 'string' ? item : item.label}
          </button>
        </li>
      ))}
    </ul>
  );
};

export default SuggestionList;
