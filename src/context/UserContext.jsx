import React, { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const STORAGE_KEY = 'user';

const getInitialUser = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const navigate = useNavigate();
  const [user, setUserState] = useState(getInitialUser);
  const [isInitializing] = useState(false);

  const setUser = (nextUser) => {
    setUserState(nextUser);

    if (nextUser) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('token');
    localStorage.removeItem(STORAGE_KEY);
    setUserState(null);
    navigate('/main', { replace: true });
  };

  const value = {
    user,
    setUser,
    isLoggedIn: Boolean(user),
    logout,
    isInitializing,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const ctx = useContext(UserContext);

  if (!ctx) {
    throw new Error('useUser must be used within UserProvider');
  }

  return ctx;
}