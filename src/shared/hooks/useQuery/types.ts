type QueryKey = string | readonly unknown[];
type QueryFunction<T> = (options?: { signal?: AbortSignal }) => Promise<T>;

interface QueryOptions<T> {
  enabled?: boolean;
  staleTime?: number;
  cacheTime?: number;
  refetchOnMount?: boolean | "always";
  retry?: number | boolean;
  retryDelay?: number;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  onSettled?: (data: T | null, error: Error | null) => void;
}

interface QueryState<T> {
  data: T | null;
  error: Error | null;
  status: "idle" | "loading" | "error" | "success";
  isFetching: boolean;
}

interface QueryResult<T> extends QueryState<T> {
  isIdle: boolean;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  refetch: () => Promise<void>;
}

interface CacheEntry<T> {
  value?: T;
  timestamp: number;
  promise?: Promise<T>;
  error?: Error;
}

export type { QueryFunction, QueryKey, QueryOptions, QueryState, QueryResult, CacheEntry }