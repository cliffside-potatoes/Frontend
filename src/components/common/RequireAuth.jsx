import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useUser } from '../../context/UserContext';

const RequireAuth = () => {
  const { isLoggedIn, isInitializing } = useUser();

  if (isInitializing) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>로그인 확인 중...</h2>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Navigate to="/main" replace />;
  }

  return <Outlet />;
};

export default RequireAuth;