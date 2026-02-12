import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { MyPostsProvider } from './context/MyPostsContext';
import MainPage from './pages/Main/MainPage';
import MyPage from './pages/Profile/MyPage';
import Feed from './pages/Feed/Feed';
import SignUpPage from './pages/Auth/SignUpPage';
import SignInPage from './pages/Auth/SignInPage';
import KakaoCallback from './pages/Auth/KakaoCallback';
import RefrigeratorPage from './pages/Refrigerator/RefrigeratorPage';
import CategoryRegistrationPage from './pages/Refrigerator/CategoryRegistrationPage';
import CategorySettingsPage from './pages/Refrigerator/CategorySettingsPage';
import ErrorBoundary from './components/common/ErrorBoundary';
import './App.css';

const SearchPage = lazy(() =>
  import('./pages/Search/SearchPage').catch((err) => {
    console.error('SearchPage 로드 실패:', err);
    return { default: () => <div style={{ padding: 24 }}>검색 페이지를 불러올 수 없습니다. 콘솔을 확인하세요.</div> };
  })
);

function App() {
  return (
    <MyPostsProvider>
      <Router>
        <ErrorBoundary>
          <Suspense fallback={<div style={{ padding: 24, textAlign: 'center' }}>검색 페이지 로딩 중...</div>}>
            <Routes>
              <Route path="/" element={<Navigate to="/main" replace />} />
              <Route path="/main" element={<MainPage />} />
              <Route path="/feed" element={<Feed />} />
              <Route path="/profile" element={<MyPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/signin" element={<SignInPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/refrigerator" element={<RefrigeratorPage />} />
            <Route path="/refrigerator/category" element={<CategoryRegistrationPage />} />
            <Route path="/refrigerator/category/settings" element={<CategorySettingsPage />} />
            <Route path="/oauth/callback/kakao" element={<KakaoCallback />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </Router>
    </MyPostsProvider>
  );
}

export default App;
