import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainPage from './pages/Main/MainPage';
import ErrorBoundary from './components/common/ErrorBoundary';
import './App.css';

// SearchPage lazy 로드 (import 에러 시 흰 화면 대신 fallback 표시)
const SearchPage = lazy(() =>
  import('./pages/Search/SearchPage').catch((err) => {
    console.error('SearchPage 로드 실패:', err);
    return { default: () => <div style={{ padding: 24 }}>검색 페이지를 불러올 수 없습니다. 콘솔을 확인하세요.</div> };
  })
);

function App() {
  return (
    <Router>
      <ErrorBoundary>
        <Suspense fallback={<div style={{ padding: 24, textAlign: 'center' }}>검색 페이지 로딩 중...</div>}>
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/search" element={<SearchPage />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </Router>
  );
}

export default App;

