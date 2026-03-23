import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { hasStoredAccessToken } from '../../utils/authStorage';

const RequireAuth = () => {
  const location = useLocation();
  const { isLoggedIn, isInitializing } = useUser();

  if (isInitializing) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>로그인 확인 중...</h2>
      </div>
    );
  }

  if (!isLoggedIn && !hasStoredAccessToken()) {
    return <Navigate to="/signin" replace state={{ from: location }} />;
  }

  return <Outlet />;
};

export default RequireAuth;
