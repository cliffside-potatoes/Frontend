import React, { useState } from 'react';
import SearchBar from '../../components/Search/SearchBar';
import RecentSearches from '../../components/Search/RecentSearches';
import RecommendedSearches from '../../components/Search/RecommendedSearches';
import SearchResultsList from '../../components/Search/SearchResultsList';
import './SearchPage.css';

const DUMMY_RECENT_SEARCHES = ['비빔밥', '김치찌개', '파스타'];
const DUMMY_RECOMMENDED_SEARCHES = ['간단 요리', '샐러드', '한식', '중식', '양식'];
const DUMMY_SEARCH_RESULTS = [
  { id: 1, title: '맛있는 비빔밥', description: '신선한 채소와 고기가 어우러진 비빔밥', imageUrl: 'https://via.placeholder.com/100', time: '30분', difficulty: '중', rating: 4.5, reviews: 120 },
  { id: 2, title: '얼큰한 김치찌개', description: '한국인의 소울푸드 김치찌개', imageUrl: 'https://via.placeholder.com/100', time: '40분', difficulty: '하', rating: 4.8, reviews: 200 },
  { id: 3, title: '크림 파스타', description: '부드러운 크림 소스의 풍미', imageUrl: 'https://via.placeholder.com/100', time: '25분', difficulty: '상', rating: 4.2, reviews: 80 },
];

const SearchPage = () => {
  const [searchText, setSearchText] = useState('');
  const [recentSearches, setRecentSearches] = useState(DUMMY_RECENT_SEARCHES);
  const [searchResults, setSearchResults] = useState([]);

  const handleSearch = (text) => {
    setSearchText(text);
    // 실제 API 호출 로직은 여기에 구현됩니다.
    // 지금은 더미 데이터로 대체합니다.
    console.log(`Searching for: ${text}`);
    setSearchResults(DUMMY_SEARCH_RESULTS); // 검색 시 더미 결과 표시

    if (text && !recentSearches.includes(text)) {
      setRecentSearches((prev) => [text, ...prev.slice(0, 4)]); // 최대 5개 유지
    }
  };

  const handleRemoveRecentSearch = (itemToRemove) => {
    setRecentSearches((prev) => prev.filter((item) => item !== itemToRemove));
  };

  return (
    <div className="search-page-container">
      <SearchBar onSearch={handleSearch} />
      <div className="search-content">
        {searchResults.length === 0 ? (
          <>
            <RecentSearches searches={recentSearches} onRemove={handleRemoveRecentSearch} />
            <RecommendedSearches searches={DUMMY_RECOMMENDED_SEARCHES} />
          </>
        ) : (
          <SearchResultsList results={searchResults} />
        )}
      </div>
    </div>
  );
};

export default SearchPage;
