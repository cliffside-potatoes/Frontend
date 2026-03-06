import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { refreshAccessToken } from '../api/tokenApi';
import { getMyProfile } from '../api/profileApi';

const STORAGE_KEY = 'user';

const getStoredUser = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

const clearAuthStorage = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('token');
  localStorage.removeItem(STORAGE_KEY);
};

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const navigate = useNavigate();
  const [user, setUserState] = useState(getStoredUser);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initializeUser = async () => {
      const storedUser = getStoredUser();
      const hasAccessToken = Boolean(
        localStorage.getItem('accessToken') || localStorage.getItem('token')
      );

      if (storedUser && hasAccessToken) {
        setUserState(storedUser);
        setIsInitializing(false);
        return;
      }

      try {
        const payload = await refreshAccessToken();

        if (!payload?.accessToken) {
          clearAuthStorage();
          setUserState(null);
          setIsInitializing(false);
          return;
        }

        let nextUser = {
          id: String(payload?.id ?? ''),
          nickname: payload?.nickname ?? '사용자',
          profileImage: '',
          triedCount: 0,
          bio: '아직 자기소개가 없어요😊',
        };

        const profile = await getMyProfile();

        if (profile) {
          nextUser = {
            ...nextUser,
            nickname: profile?.nickname ?? nextUser.nickname,
            bio: profile?.bio ?? nextUser.bio,
            profileImage: profile?.profileImage?.s3Key ?? '',
          };
        }

        setUserState(nextUser);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
      } catch (error) {
        console.error('initializeUser 실패:', error);
        clearAuthStorage();
        setUserState(null);
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
    clearAuthStorage();
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