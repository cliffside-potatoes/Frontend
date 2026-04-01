import React from 'react';
import './RecentSearches.css';

const RecentSearches = ({ searches, onRemove, onSelect }) => {
  const list = Array.isArray(searches) ? searches : [];

  return (
    <section className="recent-searches-container">
      <h2>최근 검색어</h2>
      <div className="search-tags">
        {list.map((item, index) => (
          <div key={`${item}-${index}`} className="search-tag">
            <button
              type="button"
              className="search-tag-label"
              onClick={() => onSelect?.(item)}
            >
              {item}
            </button>
            <button
              type="button"
              className="search-tag-remove"
              aria-label={`${item} 삭제`}
              onClick={() => onRemove?.(item)}
            >
              x
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default RecentSearches;
