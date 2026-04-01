import React from 'react';
import './RecommendedSearches.css';

const RecommendedSearches = ({ searches, onSelect }) => {
  const list = Array.isArray(searches) ? searches : [];

  return (
    <section className="recommended-searches-container">
      <h2>추천 검색어</h2>
      <div className="search-tags">
        {list.map((item, index) => (
          <button
            key={`${item}-${index}`}
            type="button"
            className="search-tag search-tag-button"
            onClick={() => onSelect?.(item)}
          >
            {item}
          </button>
        ))}
      </div>
    </section>
  );
};

export default RecommendedSearches;
