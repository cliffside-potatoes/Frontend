import React, { createContext, useContext, useState, useEffect } from 'react';
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

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const navigate = useNavigate();

  const [user, setUserState] = useState(getStoredUser);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initializeUser = async () => {
      try {
        const payload = await refreshAccessToken();

        // 토큰 재발급 실패 → 로그인 안된 상태
        if (!payload?.accessToken) {
          setIsInitializing(false);
          return;
        }

        // 로그인된 기본 사용자 정보
        const baseUser = {
          id: String(payload?.id ?? ''),
          nickname: payload?.nickname ?? '사용자',
          profileImage: '',
          triedCount: 0,
          bio: '아직 자기소개가 없어요😊',
        };

        const profile = await getMyProfile();

        // ✅ 프로필 없는 경우
        if (!profile) {
          setUserState(baseUser);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(baseUser));

          // 프로필 생성 페이지로 이동
          navigate('/new-info', { replace: true });

          setIsInitializing(false);
          return;
        }

        // ✅ 프로필 있는 경우
        const nextUser = {
          ...baseUser,
          nickname: profile.nickname ?? baseUser.nickname,
          bio: profile.bio ?? baseUser.bio,
          profileImage: profile.profileImage?.s3Key ?? '',
        };

        setUserState(nextUser);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
      } catch (error) {
        console.error('initializeUser 실패:', error);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeUser();
  }, [navigate]);

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