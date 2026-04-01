import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchBar from '../../components/Search/SearchBar';
import RecentSearches from '../../components/Search/RecentSearches';
import RecommendedSearches from '../../components/Search/RecommendedSearches';
import SearchResultsList from '../../components/Search/SearchResultsList';
import {
  deleteRecentSearch,
  getRecentSearches,
  getRecommendedSearches,
  saveRecentSearch,
  searchRecipes,
} from '../../api/searchApi';
import './SearchPage.css';

const SearchPage = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [recentSearches, setRecentSearches] = useState([]);
  const [recommendedSearches, setRecommendedSearches] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [hasNext, setHasNext] = useState(false);
  const [nextCursor, setNextCursor] = useState(null);
  const observerRef = useRef(null);
  const loadMoreTriggerRef = useRef(null);

  const loadMore = useCallback(async () => {
    if (!hasNext || loadingMore || !nextCursor || !searchText) return;

    setLoadingMore(true);

    try {
      const result = await searchRecipes(searchText, {
        size: 20,
        sort: 'LATEST',
        cursorCreatedAt: nextCursor?.cursorCreatedAt,
        cursorId: nextCursor?.cursorId,
      });

      const data = result?.data;
      const newRecipes = Array.isArray(data?.Recipes) ? data.Recipes : [];

      setSearchResults((prev) => [...prev, ...newRecipes]);
      setHasNext(Boolean(data?.hasNext));
      setNextCursor(data?.nextCursor ?? null);
    } catch (err) {
      console.error('Failed to load more search results:', err);
    } finally {
      setLoadingMore(false);
    }
  }, [hasNext, loadingMore, nextCursor, searchText]);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [recentData, recommendedData] = await Promise.all([
          getRecentSearches(),
          getRecommendedSearches(),
        ]);

        setRecentSearches(Array.isArray(recentData?.data) ? recentData.data : []);
        setRecommendedSearches(
          Array.isArray(recommendedData?.data) ? recommendedData.data : []
        );
      } catch (err) {
        console.error('Failed to load search page data:', err);
        setRecentSearches([]);
        setRecommendedSearches([]);
      }
    };

    void loadInitialData();
  }, []);

  useEffect(() => {
    if (!loadMoreTriggerRef.current) return undefined;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && hasNext && !loadingMore) {
          void loadMore();
        }
      },
      {
        root: null,
        rootMargin: '100px',
        threshold: 0.1,
      }
    );

    observerRef.current.observe(loadMoreTriggerRef.current);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [hasNext, loadMore, loadingMore]);

  const handleSearch = async (text) => {
    const keyword = text?.trim();
    if (!keyword) return;

    setSearchText(keyword);
    setLoading(true);
    setError(null);
    setSearchResults([]);
    setNextCursor(null);
    setHasNext(false);

    try {
      const result = await searchRecipes(keyword, { size: 20, sort: 'LATEST' });
      const data = result?.data;
      const recipes = Array.isArray(data?.Recipes) ? data.Recipes : [];

      setSearchResults(recipes);
      setHasNext(Boolean(data?.hasNext));
      setNextCursor(data?.nextCursor ?? null);

      const saved = await saveRecentSearch(keyword);
      const nextRecentSearches = Array.isArray(saved?.data)
        ? saved.data
        : [keyword, ...recentSearches.filter((item) => item !== keyword)].slice(0, 10);
      setRecentSearches(nextRecentSearches);
    } catch (err) {
      console.error('Search failed:', err);
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
      console.error('Failed to remove recent search:', err);
    }
  };

  return (
    <div className="search-page-container">
      <header className="search-page-header">
        <button
          type="button"
          className="search-back-button"
          aria-label="뒤로가기"
          onClick={() => navigate(-1)}
        >
          &lt;
        </button>
        <div className="search-bar-wrapper">
          <SearchBar onSearch={handleSearch} />
        </div>
      </header>

      <div className="search-content">
        {error && (
          <div
            className="error-message"
            style={{
              padding: '16px',
              margin: '16px',
              backgroundColor: '#fee',
              color: '#c33',
              borderRadius: '8px',
              textAlign: 'center',
            }}
          >
            {error}
          </div>
        )}

        {loading && (
          <div
            className="loading-spinner"
            style={{
              textAlign: 'center',
              padding: '40px',
              fontSize: '16px',
              color: '#666',
            }}
          >
            검색 중...
          </div>
        )}

        {!loading && searchResults.length === 0 && !searchText ? (
          <>
            <RecentSearches searches={recentSearches} onRemove={handleRemoveRecentSearch} />
            <RecommendedSearches searches={recommendedSearches} />
          </>
        ) : null}

        {!loading && searchText && searchResults.length === 0 && !error ? (
          <div
            style={{
              textAlign: 'center',
              padding: '40px',
              color: '#666',
            }}
          >
            <p style={{ fontSize: '18px', marginBottom: '8px' }}>검색 결과가 없습니다</p>
            <p style={{ fontSize: '14px' }}>다른 검색어를 입력해보세요</p>
          </div>
        ) : null}

        {!loading && searchResults.length > 0 ? (
          <>
            <SearchResultsList results={searchResults} />

            {hasNext && (
              <div
                ref={loadMoreTriggerRef}
                style={{
                  height: '50px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '20px',
                }}
              >
                {loadingMore && (
                  <div style={{ color: '#666', fontSize: '14px' }}>추가 결과를 불러오는 중...</div>
                )}
              </div>
            )}

            {!hasNext && searchResults.length > 0 && (
              <div
                style={{
                  textAlign: 'center',
                  padding: '20px',
                  color: '#999',
                  fontSize: '14px',
                }}
              >
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
