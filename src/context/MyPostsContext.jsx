import React, { createContext, useContext, useState } from 'react';

const defaultUser = { nickname: '사용자 닉네임' };

const defaultPosts = [
  {
    id: 1,
    author: defaultUser.nickname,
    date: '2025년 12월 23일',
    createdAt: new Date('2025-12-23').getTime(),
    content: '오늘은 이걸 먹었다~ 너무 맛있었다!',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&h=600&fit=crop',
    likeCount: 5,
    liked: false,
    hideLikeCount: false,
    pinned: false,
  },
  {
    id: 2,
    author: defaultUser.nickname,
    date: '2025년 12월 20일',
    createdAt: new Date('2025-12-20').getTime(),
    content: '주말에 파스타 만들어봤어요 🍝',
    image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=600&h=600&fit=crop',
    likeCount: 3,
    liked: true,
    hideLikeCount: false,
    pinned: false,
  },
  {
    id: 3,
    author: defaultUser.nickname,
    date: '2025년 12월 15일',
    createdAt: new Date('2025-12-15').getTime(),
    content: '간단한 볶음밥 레시피~',
    image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600&h=600&fit=crop',
    likeCount: 8,
    liked: false,
    hideLikeCount: false,
    pinned: false,
  },
];

const MyPostsContext = createContext(null);

export function MyPostsProvider({ children }) {
  const [posts, setPosts] = useState(defaultPosts);

  const value = {
    posts,
    setPosts,
  };

  return (
    <MyPostsContext.Provider value={value}>
      {children}
    </MyPostsContext.Provider>
  );
}

export function useMyPosts() {
  const ctx = useContext(MyPostsContext);
  if (!ctx) {
    throw new Error('useMyPosts must be used within MyPostsProvider');
  }
  return ctx;
}
