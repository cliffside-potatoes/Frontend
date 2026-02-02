import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MainPage from './pages/Main/MainPage'
import RefrigeratorPage from './pages/Refrigerator/RefrigeratorPage'
import CategoryRegistrationPage from './pages/Refrigerator/CategoryRegistrationPage'
import CategorySettingsPage from './pages/Refrigerator/CategorySettingsPage'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/refrigerator" element={<RefrigeratorPage />} />
        <Route path="/refrigerator/category" element={<CategoryRegistrationPage />} />
        <Route path="/refrigerator/category/settings" element={<CategorySettingsPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
