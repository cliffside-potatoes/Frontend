import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getMyProfile } from '../api/profileApi';
import { logoutFromServer, refreshAccessToken } from '../api/tokenApi';
import {
  clearStoredAuth,
  consumePostLoginRedirect,
} from '../utils/authStorage';

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

const DEFAULT_BIO = '아직 자기소개가 없어요😊';

export function UserProvider({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const initialStoredUserRef = useRef(getInitialUser());
  const [user, setUserState] = useState(initialStoredUserRef.current);
  const [isInitializing, setIsInitializing] = useState(true);
  const initialPathRef = useRef(
    `${location.pathname}${location.search}${location.hash}`
  );

  const setUser = (nextUser) => {
    setUserState(nextUser);

    if (nextUser) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  useEffect(() => {
    const initialPath = initialPathRef.current;

    if (initialPath.startsWith('/oauth/callback/kakao')) {
      setIsInitializing(false);
      return;
    }

    let cancelled = false;
    const hadStoredUser = Boolean(initialStoredUserRef.current);

    const bootstrapUser = async () => {
      try {
        const payload = await refreshAccessToken();

        if (!payload?.accessToken) {
          if (!cancelled && !hadStoredUser) {
            clearStoredAuth();
            setUserState(null);
          }
          return;
        }

        const baseUser = {
          id: String(payload?.id ?? ''),
          email: payload?.email ?? '',
          nickname: payload?.nickname ?? '사용자',
          profileImage: '',
          triedCount: payload?.triedCount ?? 0,
          bio: DEFAULT_BIO,
        };

        if (payload?.newMember) {
          if (cancelled) return;

          setUser(baseUser);

          if (initialPath === '/main' || initialPath === '/signin') {
            navigate('/new-info', { replace: true });
          }
          return;
        }

        const profile = await getMyProfile();
        const nextUser = {
          ...baseUser,
          id: String(profile?.id ?? baseUser.id),
          email: profile?.email ?? baseUser.email,
          nickname: profile?.nickname ?? baseUser.nickname,
          profileImage:
            profile?.profileImage?.s3Key ??
            profile?.profileImageUrl ??
            baseUser.profileImage,
          triedCount:
            profile?.triedCount ??
            profile?.tryCount ??
            baseUser.triedCount,
          bio: profile?.bio ?? baseUser.bio,
        };

        if (cancelled) return;

        setUser(nextUser);

        const redirectPath = consumePostLoginRedirect();
        const initialPath = initialPathRef.current;
        const shouldRedirect =
          redirectPath &&
          redirectPath !== initialPath &&
          (initialPath === '/main' || initialPath === '/signin');

        if (shouldRedirect) {
          navigate(redirectPath, { replace: true });
        }
      } catch (error) {
        console.error('로그인 상태 복구 실패:', error);

        if (!cancelled && !hadStoredUser) {
          clearStoredAuth();
          setUserState(null);
        }
      } finally {
        if (!cancelled) {
          setIsInitializing(false);
        }
      }
    };

    bootstrapUser();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const logout = async () => {
    await logoutFromServer();
    clearStoredAuth();
    setUserState(null);

    if (typeof window !== 'undefined') {
      window.location.replace(`${window.location.origin}/main`);
      return;
    }

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
