import React from 'react';
import './SearchBar.css';

const SearchBar = ({ value, onChange, onSearch, inputRef }) => {
  const handleSearch = () => {
    onSearch?.(value ?? '');
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      onSearch?.(value ?? '');
    }
  };

  return (
    <div className="search-bar-container">
      <input
        ref={inputRef}
        type="text"
        placeholder="음식 이름을 검색해 보세요"
        className="search-input"
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        onKeyDown={handleKeyDown}
      />
      <button type="button" className="search-button" aria-label="검색" onClick={handleSearch}>
        🔍
      </button>
    </div>
  );
};

export default SearchBar;
