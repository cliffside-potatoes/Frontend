import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { MyPostsProvider } from './context/MyPostsContext';
import { UserProvider } from './context/UserContext';
import MainPage from './pages/Main/MainPage';
import MyPage from './pages/Profile/MyPage';
import SettingsPage from './pages/Profile/SettingsPage';
import NotificationSettingsPage from './pages/Profile/NotificationSettingsPage';
import MyRecipesPage from './pages/Profile/MyRecipesPage';
import MyReviewsPage from './pages/Profile/MyReviewsPage';
import RecipeSavedPage from './pages/Profile/RecipeSavedPage';
import Feed from './pages/Feed/Feed';
import SignUpPage from './pages/Auth/SignUpPage';
import SignInPage from './pages/Auth/SignInPage';
import KakaoCallback from './pages/Auth/KakaoCallback';
import RefrigeratorPage from './pages/Refrigerator/RefrigeratorPage';
import CategoryRegistrationPage from './pages/Refrigerator/CategoryRegistrationPage';
import CategorySettingsPage from './pages/Refrigerator/CategorySettingsPage';
import RecipeDetailPage from './pages/Recipe/RecipeDetailPage';
import ReviewListPage from './pages/Recipe/ReviewListPage';
import ReviewWritePage from './pages/Recipe/ReviewWritePage';
import ErrorBoundary from './components/common/ErrorBoundary';
import RequireAuth from './components/common/RequireAuth';
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
        <UserProvider>
          <ErrorBoundary>
            <Suspense fallback={<div style={{ padding: 24, textAlign: 'center' }}>검색 페이지 로딩 중...</div>}>
              <Routes>
                <Route path="/" element={<Navigate to="/main" replace />} />
                <Route path="/main" element={<MainPage />} />
                <Route path="/feed" element={<Feed />} />
                <Route path="/signin" element={<SignInPage />} />
                <Route path="/oauth/callback/kakao" element={<KakaoCallback />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/recipe/:recipeId" element={<RecipeDetailPage />} />
                <Route path="/recipe/:recipeId/reviews" element={<ReviewListPage />} />
                <Route element={<RequireAuth />}>
                  <Route path="/signup" element={<SignUpPage />} />
                  <Route path="/new-info" element={<SignUpPage />} />
                  <Route path="/profile" element={<MyPage />} />
                  <Route path="/profile/edit" element={<SignUpPage />} />
                  <Route path="/profile/settings" element={<SettingsPage />} />
                  <Route path="/profile/settings/notifications" element={<NotificationSettingsPage />} />
                  <Route path="/profile/my-recipes" element={<MyRecipesPage />} />
                  <Route path="/profile/my-reviews" element={<MyReviewsPage />} />
                  <Route path="/recipe-saved" element={<RecipeSavedPage />} />
                  <Route path="/refrigerator" element={<RefrigeratorPage />} />
                  <Route path="/refrigerator/category" element={<CategoryRegistrationPage />} />
                  <Route path="/refrigerator/category/settings" element={<CategorySettingsPage />} />
                  <Route path="/recipe/:recipeId/reviews/write" element={<ReviewWritePage />} />
                </Route>
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </UserProvider>
      </Router>
    </MyPostsProvider>
  );
}

export default App;
