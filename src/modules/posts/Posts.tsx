import { useState } from 'react';
import { useQuery, useMutation } from '@/shared/hooks';
import { fetchPosts, createPost, deletePost } from '@/shared/api/posts-api';
import UserProfile from '../user/UserProfile';

const Posts = () => {
  const [selectedUserId, setSelectedUserId] = useState<number | null>(1);

  const {
    data: postsData,
    isLoading: isPostsLoading,
    isError: isPostsError,
    error: postsError,
    refetch: refetchPosts
  } = useQuery(
    'posts', 
    fetchPosts, 
    {
      staleTime: 3000,
      onSuccess: () => console.log('Posts loaded successfully'),
      onError: (err) => console.error('Posts load failed:', err)
    }
  );

  const { 
    mutate: createPostMutate,
    isLoading: isCreating,
    error: createError,
    reset: resetCreate
  } = useMutation(createPost, {
    onSuccess: () => {
      console.log('Post created!');
      refetchPosts();
    },
    onError: (err) => console.error('Creation failed:', err),
    retry: 2
  });

  const { mutate: deletePostMutate } = useMutation(deletePost, {
    onSuccess: () => refetchPosts()
  });

  return (
    <div style={{ display: 'flex', gap: '2rem' }}>
      <div style={{ flex: 2 }}>
        <h2>Posts</h2>
        <button onClick={() => refetchPosts()} disabled={isPostsLoading}>
          Refresh Posts
        </button>

        {isPostsLoading && <p>Loading posts...</p>}
        {isPostsError && <p>Error: {postsError.message}</p>}

        <ul>
          {postsData?.posts.map((post: any) => (
            <li key={post.id} style={{ marginBottom: '1rem' }}>
              <h3>{post.title}</h3>
              <p>{post.body}</p>
              <button onClick={() => setSelectedUserId(post.userId)}>
                View Author
              </button>
              <button 
                onClick={() => deletePostMutate(post.id)}
                style={{ marginLeft: '0.5rem' }}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>

        <div>
          <h3>Create New Post</h3>
          <button
            onClick={() => createPostMutate({
              title: 'New Post Title',
              body: 'This is post content',
              userId: 1
            })}
            disabled={isCreating}
          >
          {isCreating ? 'Creating...' : 'Create Post'}
          </button>
          {createError ?
            (<div>
              <p style={{ color: 'red' }}>{createError.message}</p>
              <button onClick={resetCreate}>Dismiss</button>
            </div>)
            : 
            null
          }
        </div>
      </div>

      {/* Блок пользователя */}
      <div style={{ flex: 1 }}>
        {selectedUserId && (
          <UserProfile userId={selectedUserId} />
        )}
      </div>
    </div>
  );
};


export default Posts;