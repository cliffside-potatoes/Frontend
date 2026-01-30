import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainPage from './pages/Main/MainPage';
import MyPage from './pages/Profile/MyPage';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/main" replace />} />
        <Route path="/main" element={<MainPage />} />
        <Route path="/profile" element={<MyPage />} />
        {/* TODO: 추가 페이지 라우트 */}
        {/* <Route path="/feed" element={<FeedPage />} /> */}
        {/* <Route path="/recipe-saved" element={<RecipeSavedPage />} /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
