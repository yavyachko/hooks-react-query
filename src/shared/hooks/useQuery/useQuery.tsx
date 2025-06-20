import { useEffect, useState } from "react";
import type {
  QueryFunction,
  QueryKey,
  QueryOptions,
  QueryState,
  QueryResult,
  CacheEntry,
} from "./types.ts";

// cache store
// TODO: спросить у Егора можно ли обойтись без any
const queryCache = new Map<string, CacheEntry<any>>();

const serializeKey = (key: QueryKey): string => {
  return JSON.stringify(key);
};

const useQuery = <T,>(
  queryKey: QueryKey,
  queryFn: QueryFunction<T>,
  {
    enabled = true,
    staleTime = 0,
    cacheTime = 5 * 60 * 1000,
    refetchOnMount = true,
    retry = 3,
    retryDelay = 1000,
    onSuccess,
    onError,
    onSettled,
  }: QueryOptions<T> = {}
): QueryResult<T> => {
  const serializedKey = serializeKey(queryKey);
  const [state, setState] = useState<QueryState<T>>({
    data: null,
    error: null,
    status: enabled ? "loading" : "idle",
    isFetching: enabled,
  });

  const fetchData = async (
    signal?: AbortSignal,
    attempt = 1
  ): Promise<void> => {
    try {
      setState((prev) => ({
        ...prev,
        status: "loading",
        isFetching: true,
        error: null,
      }));

      const cached = queryCache.get(serializedKey);

      // ждем если уже есть промис
      if (cached?.promise) {
        const data = await cached.promise;
        setState({
          data,
          error: null,
          status: "success",
          isFetching: false,
        });
        return;
      }

      const promise = queryFn({ signal });

      // предотвращаем дупликацию запросов
      queryCache.set(serializedKey, {
        ...cached,
        promise,
        timestamp: Date.now(),
      });

      const data = await promise;

      // обновляем кэш, уже с данными
      queryCache.set(serializedKey, {
        value: data,
        timestamp: Date.now(),
      });

      setState({
        data,
        error: null,
        status: "success",
        isFetching: false,
      });

      onSuccess?.(data);
      onSettled?.(data, null);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));

      // повторение при неудаче
      const shouldRetry =
        typeof retry === "boolean"
          ? retry
          : attempt <= (typeof retry === "number" ? retry : 3);

      if (shouldRetry) {
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
        return fetchData(signal, attempt + 1);
      }

      // если не получилось, обновляем кэш с ошибкой
      queryCache.set(serializedKey, {
        error: err,
        timestamp: Date.now(),
      });

      setState({
        data: null,
        error: err,
        status: "error",
        isFetching: false,
      });

      onError?.(err);
      onSettled?.(null, err);
      throw err;
    }
  };

  // refetch, если надо обновить вручную
  const refetch = async () => {
    return fetchData();
  };

  // mount/update
  useEffect(() => {
    if (!enabled) {
      setState((prev) => ({
        ...prev,
        status: "idle",
        isFetching: false,
      }));
      return;
    }

    const cached = queryCache.get(serializedKey);
    const currentTime = Date.now();
    const isStale =
      !cached?.timestamp || currentTime - cached.timestamp > staleTime;
    const shouldRefetch =
      refetchOnMount === "always" ||
      (refetchOnMount && isStale) ||
      !cached?.value;

    if (!shouldRefetch && cached?.value) {
      setState({
        data: cached.value,
        error: null,
        status: "success",
        isFetching: false,
      });
      return;
    }

    const controller = new AbortController();
    fetchData(controller.signal);

    return () => {
      controller.abort();
    };

    //TODO: спросить у Егора почему ругается на fetchData, хотя функция между рендерами не меняется, и как это фиксить
  }, [serializedKey, enabled, staleTime, refetchOnMount]);

  // очистка кэша при старых данных
  useEffect(() => {
    if (cacheTime === Infinity) return;

    const cached = queryCache.get(serializedKey);
    if (!cached?.timestamp) return;

    const cleanupTime = cached.timestamp + cacheTime;
    const timeout = setTimeout(() => {
      if (Date.now() >= cleanupTime) {
        queryCache.delete(serializedKey);
      }
    }, cacheTime);

    return () => clearTimeout(timeout);
  }, [serializedKey, cacheTime]);

  return {
    ...state,
    isIdle: state.status === "idle",
    isLoading: state.status === "loading",
    isError: state.status === "error",
    isSuccess: state.status === "success",
    refetch,
  };
};

export { useQuery };
