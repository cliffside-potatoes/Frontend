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

export default { createPost, updatePost, deletePost };
