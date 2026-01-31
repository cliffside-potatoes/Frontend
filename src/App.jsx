import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainPage from './pages/Main/MainPage';
import MyPage from './pages/Profile/MyPage';
import SignUpPage from './pages/Auth/SignUpPage';
import SignInPage from './pages/Auth/SignInPage';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/main" replace />} />
        <Route path="/main" element={<MainPage />} />
        <Route path="/profile" element={<MyPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/signin" element={<SignInPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
