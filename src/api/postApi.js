/**
 * 게시글 CRUD API
 * - 게시글 생성 POST /posts
 * - 게시글 수정 PATCH /posts/{id}
 * - 게시글 삭제 DELETE /posts/{id}
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const getAuthHeader = () => {
  const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * 게시글 생성
 * POST /posts
 * @param {{ content: string, images: string[] }} data
 */
export const createPost = async (data) => {
  try {
    const base = (typeof API_BASE_URL === 'string' && API_BASE_URL.trim()) || '';
    if (!base) return { success: true, data: { id: Date.now() } };

    const res = await fetch(`${base}/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error('게시글 생성 실패');
    const result = await res.json();
    return { success: true, data: result?.data ?? result };
  } catch (error) {
    console.error('게시글 생성 실패:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 게시글 수정
 * PATCH /posts/{postId}
 * @param {number} postId
 * @param {{ content: string, images: string[] }} data
 */
export const updatePost = async (postId, data) => {
  try {
    const base = (typeof API_BASE_URL === 'string' && API_BASE_URL.trim()) || '';
    if (!base) return { success: true };

    const res = await fetch(`${base}/posts/${postId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error('게시글 수정 실패');
    return { success: true };
  } catch (error) {
    console.error('게시글 수정 실패:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 게시글 삭제
 * DELETE /posts/{postId}
 * @param {number} postId
 */
export const deletePost = async (postId) => {
  try {
    const base = (typeof API_BASE_URL === 'string' && API_BASE_URL.trim()) || '';
    if (!base) return { success: true };

    const res = await fetch(`${base}/posts/${postId}`, {
      method: 'DELETE',
      headers: getAuthHeader(),
    });

    if (!res.ok) throw new Error('게시글 삭제 실패');
    return { success: true };
  } catch (error) {
    console.error('게시글 삭제 실패:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 내가 좋아요한 게시글 목록
 * GET /me/liked/posts?size=&cursorLikedAt=&cursorId=
 */
export const getLikedPosts = async (params = {}) => {
  const { size = 20, cursorLikedAt, cursorId } = params;
  const base = (typeof API_BASE_URL === 'string' && API_BASE_URL.trim()) || '';
  if (!base) {
    return { items: [], hasNext: false, nextCursor: null };
  }

  const searchParams = new URLSearchParams({ size: String(size) });
  if (cursorLikedAt != null && cursorId != null) {
    searchParams.set('cursorLikedAt', cursorLikedAt);
    searchParams.set('cursorId', String(cursorId));
  }

  const res = await fetch(`${base}/me/liked/posts?${searchParams.toString()}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error(`좋아요 목록 조회 실패 (${res.status})`);
  }

  const json = await res.json();
  const data = json?.data ?? {};
  return {
    items: Array.isArray(data.items) ? data.items : [],
    hasNext: Boolean(data.hasNext),
    nextCursor: data.nextCursor ?? null,
  };
};

/**
 * 게시글 좋아요
 * POST /posts/{postId}/likes
 */
export const addPostLike = async (postId) => {
  const base = (typeof API_BASE_URL === 'string' && API_BASE_URL.trim()) || '';
  if (!base) return;

  const res = await fetch(`${base}/posts/${postId}/likes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error(`좋아요 실패 (${res.status})`);
  }
};

/**
 * 게시글 좋아요 취소
 * DELETE /posts/{postId}/likes
 */
export const removePostLike = async (postId) => {
  const base = (typeof API_BASE_URL === 'string' && API_BASE_URL.trim()) || '';
  if (!base) return;

  const res = await fetch(`${base}/posts/${postId}/likes`, {
    method: 'DELETE',
    headers: {
      ...getAuthHeader(),
    },
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error(`좋아요 취소 실패 (${res.status})`);
  }
};

export default { createPost, updatePost, deletePost, getLikedPosts, addPostLike, removePostLike };
