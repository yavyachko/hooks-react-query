import { useQuery } from "@/shared/hooks";
import { fetchUser } from "@/shared/api/posts-api";

const UserProfile = ({ userId }: { userId: number }) => {
  const {
    data: user,
    isLoading,
    isError,
    error,
    isFetching
  } = useQuery(
    ['user', userId],
    () => fetchUser(userId),
    {
      enabled: !!userId,
      staleTime: 5000,
      onError: (err) => console.error('User load failed:', err)
    }
  );

  return (
    <div style={{ border: '1px solid #ccc', padding: '1rem' }}>
      <h2>User Profile</h2>
      {isLoading ? (
        <p>Loading user...</p>
      ) : isError ? (
        <p>Error: {error.message}</p>
      ) : (
        <>
          <h3>{user.firstName} {user.lastName}</h3>
          <p>Email: {user.email}</p>
          <p>Phone: {user.phone}</p>
          <button onClick={() => window.location.href = `mailto:${user.email}`}>
            Contact
          </button>
          <div style={{ marginTop: '1rem' }}>
            <small>
              {isFetching ? 'Updating...' : `Last updated: ${new Date().toLocaleTimeString()}`}
            </small>
          </div>
        </>
      )}
    </div>
  );
};

export default UserProfile;