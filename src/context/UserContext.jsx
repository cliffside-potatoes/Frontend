import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { refreshAccessToken } from '../api/tokenApi';

const STORAGE_KEY = 'user';

const getInitialUser = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // ignore
  }
  return null;
};

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const navigate = useNavigate();
  const [user, setUserState] = useState(getInitialUser);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initializeUser = async () => {
      const storedUser = getInitialUser();

      // 이미 user가 있으면 그대로 사용
      if (storedUser) {
        setIsInitializing(false);
        return;
      }

      // refreshToken으로 accessToken 재발급 시도
      try {
        const payload = await refreshAccessToken();

        if (payload) {
          const newUser = {
            id: String(payload.id ?? ''),
            nickname: payload.nickname ?? '사용자',
            profileImage: '',
            triedCount: 0,
            bio: '아직 자기소개가 없어요😊',
          };

          setUserState(newUser);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
        }
      } catch (error) {
        console.error('Silent refresh failed:', error);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeUser();
  }, []);

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