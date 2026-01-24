import React, { useState } from 'react';
import './SearchBar.css';

const SearchBar = ({ onSearch }) => {
  const [searchText, setSearchText] = useState('');

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      onSearch(searchText);
    }
  };

  return (
    <div className="search-bar-container">
      <input
        type="text"
        placeholder="음식 이름을 검색해 보세요"
        className="search-input"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        onKeyPress={handleKeyPress}
      />
      <button className="search-button" onClick={() => onSearch(searchText)}>🔍</button>
    </div>
  );
};

export default SearchBar;
