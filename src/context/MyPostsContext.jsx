import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const MyPostsContext = createContext(null);

const STORAGE_KEY = 'myPosts';

const safeParseJSON = (value, fallback) => {
  try {
    const parsed = JSON.parse(value);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
};

export const MyPostsProvider = ({ children }) => {
  const [posts, setPosts] = useState(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    const initial = raw ? safeParseJSON(raw, []) : [];
    return Array.isArray(initial) ? initial : [];
  });

  //  다른 페이지 갔다 와도 안 사라지도록 localStorage에 저장
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
    } catch {
      // storage 실패해도 앱은 계속 동작해야 함
    }
  }, [posts]);

  const value = useMemo(() => ({ posts, setPosts }), [posts]);

  return <MyPostsContext.Provider value={value}>{children}</MyPostsContext.Provider>;
};

export const useMyPosts = () => {
  const ctx = useContext(MyPostsContext);
  if (!ctx) throw new Error('useMyPosts must be used within a MyPostsProvider');
  return ctx;
};
