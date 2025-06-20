const API_URL = 'https://dummyjson.com';

export const fetchPosts = async () => {
  const response = await fetch(`${API_URL}/posts?limit=5`);
  if (!response.ok) throw new Error('Network error');
  return response.json();
};

export const fetchUser = async (userId: number) => {
  const response = await fetch(`${API_URL}/users/${userId}`);
  if (!response.ok) throw new Error('User not found');
  return response.json();
};

export const createPost = async (post: { title: string; body: string; userId: number }) => {
  const response = await fetch(`${API_URL}/posts/add`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(post)
  });
  if (!response.ok) throw new Error('Failed to create post');
  return response.json();
};

export const deletePost = async (id: number) => {
  const response = await fetch(`${API_URL}/posts/${id}`, {
    method: 'DELETE'
  });
  if (!response.ok) throw new Error('Failed to delete post');
  return response.json();
};