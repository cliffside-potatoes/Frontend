import React, { useState, useEffect, useRef, useCallback } from 'react';
import SearchBar from '../../components/Search/SearchBar';
import RecentSearches from '../../components/Search/RecentSearches';
import RecommendedSearches from '../../components/Search/RecommendedSearches';
import SearchResultsList from '../../components/Search/SearchResultsList';
import { 
  searchRecipes, 
  getRecentSearches, 
  getRecommendedSearches,
  saveRecentSearch,
  deleteRecentSearch 
} from '../../api/searchApi';
import './SearchPage.css';

const SearchPage = () => {
  const [searchText, setSearchText] = useState('');
  const [recentSearches, setRecentSearches] = useState([]);
  const [recommendedSearches, setRecommendedSearches] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  
  // 무한 스크롤 관련 상태
  const [hasNext, setHasNext] = useState(false);
  const [nextCursor, setNextCursor] = useState(null);
  const observerRef = useRef(null);
  const loadMoreTriggerRef = useRef(null);

  // 다음 페이지 로드 (무한 스크롤) - useEffect보다 위에 정의해야 함
  const loadMore = useCallback(async () => {
    if (!hasNext || loadingMore || !nextCursor || !searchText) return;

    setLoadingMore(true);

    try {
      const result = await searchRecipes(searchText, {
        size: 20,
        sort: 'LATEST',
        cursorCreatedAt: nextCursor?.cursorCreatedAt,
        cursorId: nextCursor?.cursorId
      });

      const data = result?.data;
      const newRecipes = Array.isArray(data?.Recipes) ? data.Recipes : [];
      setSearchResults(prev => [...prev, ...newRecipes]);
      setHasNext(Boolean(data?.hasNext));
      setNextCursor(data?.nextCursor ?? null);
    } catch (err) {
      console.error('추가 로딩 실패:', err);
    } finally {
      setLoadingMore(false);
    }
  }, [hasNext, loadingMore, nextCursor, searchText]);

  // 초기 데이터 로드
  useEffect(() => {
    loadInitialData();
  }, []);

  // 무한 스크롤 구현 (Intersection Observer)
  useEffect(() => {
    if (!loadMoreTriggerRef.current) return;

    const options = {
      root: null,
      rootMargin: '100px',
      threshold: 0.1
    };

    observerRef.current = new IntersectionObserver((entries) => {
      const target = entries[0];
      if (target.isIntersecting && hasNext && !loadingMore) {
        loadMore();
      }
    }, options);

    observerRef.current.observe(loadMoreTriggerRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasNext, loadingMore, loadMore]);

  const loadInitialData = async () => {
    try {
      const [recentData, recommendedData] = await Promise.all([
        getRecentSearches(),
        getRecommendedSearches()
      ]);
      
      setRecentSearches(Array.isArray(recentData?.data) ? recentData.data : []);
      setRecommendedSearches(Array.isArray(recommendedData?.data) ? recommendedData.data : []);
    } catch (err) {
      console.error('초기 데이터 로드 실패:', err);
      setRecentSearches([]);
      setRecommendedSearches([]);
    }
  };

  const handleSearch = async (text) => {
    if (!text || !text.trim()) return;

    setSearchText(text);
    setLoading(true);
    setError(null);
    setSearchResults([]); // 새 검색 시 이전 결과 초기화
    setNextCursor(null);
    setHasNext(false);

    try {
      // 첫 검색 API 호출 (커서 없이)
      const result = await searchRecipes(text, { size: 20, sort: 'LATEST' });
      
      const data = result?.data;
      const recipes = Array.isArray(data?.Recipes) ? data.Recipes : [];
      setSearchResults(recipes);
      setHasNext(Boolean(data?.hasNext));
      setNextCursor(data?.nextCursor ?? null);

      // 최근 검색어에 추가
      if (!recentSearches.includes(text)) {
        await saveRecentSearch(text);
        setRecentSearches((prev) => [text, ...prev.slice(0, 4)]); // 최대 5개 유지
      }
    } catch (err) {
      console.error('검색 실패:', err);
      setError('검색 중 오류가 발생했습니다. 다시 시도해주세요.');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveRecentSearch = async (itemToRemove) => {
    try {
      await deleteRecentSearch(itemToRemove);
      setRecentSearches((prev) => prev.filter((item) => item !== itemToRemove));
    } catch (err) {
      console.error('검색어 삭제 실패:', err);
    }
  };

  return (
    <div className="search-page-container">
      <SearchBar onSearch={handleSearch} />
      
      <div className="search-content">
        {/* 에러 메시지 */}
        {error && (
          <div className="error-message" style={{
            padding: '16px',
            margin: '16px',
            backgroundColor: '#fee',
            color: '#c33',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        {/* 로딩 상태 */}
        {loading && (
          <div className="loading-spinner" style={{
            textAlign: 'center',
            padding: '40px',
            fontSize: '16px',
            color: '#666'
          }}>
            검색 중...
          </div>
        )}

        {/* 검색 결과가 없을 때 */}
        {!loading && searchResults.length === 0 && !searchText ? (
          <>
            <RecentSearches searches={recentSearches} onRemove={handleRemoveRecentSearch} />
            <RecommendedSearches searches={recommendedSearches} />
          </>
        ) : null}

        {/* 검색했지만 결과가 없을 때 */}
        {!loading && searchText && searchResults.length === 0 && !error ? (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: '#666'
          }}>
            <p style={{ fontSize: '18px', marginBottom: '8px' }}>검색 결과가 없습니다</p>
            <p style={{ fontSize: '14px' }}>다른 검색어를 입력해보세요</p>
          </div>
        ) : null}

        {/* 검색 결과 표시 */}
        {!loading && searchResults.length > 0 ? (
          <>
            <SearchResultsList results={searchResults} />
            
            {/* 무한 스크롤 트리거 */}
            {hasNext && (
              <div 
                ref={loadMoreTriggerRef}
                style={{
                  height: '50px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '20px'
                }}
              >
                {loadingMore && (
                  <div style={{ color: '#666', fontSize: '14px' }}>
                    더 불러오는 중...
                  </div>
                )}
              </div>
            )}

            {/* 더 이상 결과가 없을 때 */}
            {!hasNext && searchResults.length > 0 && (
              <div style={{
                textAlign: 'center',
                padding: '20px',
                color: '#999',
                fontSize: '14px'
              }}>
                모든 검색 결과를 불러왔습니다
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
};

export default SearchPage;
