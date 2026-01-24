import React from 'react';
import './RecentSearches.css';

const RecentSearches = ({ searches, onRemove }) => {
  return (
    <section className="recent-searches-container">
      <h2>최근 검색어</h2>
      <div className="search-tags">
        {searches.map((item, index) => (
          <span key={index} className="search-tag">
            {item}
            <button onClick={() => onRemove(item)}>x</button>
          </span>
        ))}
      </div>
    </section>
  );
};

export default RecentSearches;
