import React from 'react';
import './RecommendedSearches.css';

const RecommendedSearches = ({ searches }) => {
  return (
    <section className="recommended-searches-container">
      <h2>추천 검색어</h2>
      <div className="search-tags">
        {searches.map((item, index) => (
          <span key={index} className="search-tag">
            {item}
          </span>
        ))}
      </div>
    </section>
  );
};

export default RecommendedSearches;
