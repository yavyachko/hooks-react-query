import { useState, useCallback, useRef } from "react";
import type { MutationOptions, MutationResult, MutationState } from "./types";

const useMutation = <
  TData = unknown,
  TError = unknown,
  TVariables = void,
  TContext = unknown
>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: MutationOptions<TData, TError, TVariables, TContext>
): MutationResult<TData, TError, TVariables, TContext> => {
  const [state, setState] = useState<
    MutationState<TData, TError, TVariables, TContext>
  >({
    status: "idle",
    data: undefined,
    error: null,
    variables: undefined,
    context: undefined,
    isIdle: true,
    isLoading: false,
    isError: false,
    isSuccess: false,
    failureCount: 0,
  });

  // ссылки для предотвращения ререндеров
  const mutationFnRef = useRef(mutationFn);
  mutationFnRef.current = mutationFn;

  const optionsRef = useRef(options);
  optionsRef.current = options;

  const mutate = useCallback(
    async (variables: TVariables): Promise<TData> => {
      let context: TContext | undefined;

      try {
        // optimistic update
        context = optionsRef.current?.onMutate
          ? await optionsRef.current.onMutate(variables)
          : undefined;

        // загрузка
        setState((prev) => ({
          ...prev,
          status: "loading",
          isLoading: true,
          isIdle: false,
          variables,
          context,
          failureCount: 0,
        }));

        const data = await mutationFnRef.current(variables);

        // успех
        setState((prev) => ({
          ...prev,
          status: "success",
          isSuccess: true,
          isLoading: false,
          data,
          error: null,
        }));

        optionsRef.current?.onSuccess?.(data, variables, context);
        optionsRef.current?.onSettled?.(data, null, variables, context);

        return data;
      } catch (error) {
        const err = error as TError;
        const failureCount = state.failureCount + 1;
        // ошибка
        setState((prev) => ({
          ...prev,
          status: "error",
          isError: true,
          isLoading: false,
          error: err,
          failureCount,
        }));

        optionsRef.current?.onError?.(err, variables, context);
        optionsRef.current?.onSettled?.(undefined, err, variables, context);

        // повторение при неудаче
        const retry = optionsRef.current?.retry ?? 0;
        const shouldRetry =
          typeof retry === "boolean"
            ? retry
            : typeof retry === "number"
            ? failureCount <= retry
            : retry(failureCount, err);

        if (shouldRetry) {
          const retryDelay =
            optionsRef.current?.retryDelay ??
            ((attempt) => Math.min(1000 * 2 ** attempt, 30000));
          const delay =
            typeof retryDelay === "number"
              ? retryDelay
              : retryDelay(failureCount, err);

          await new Promise((resolve) => setTimeout(resolve, delay));
          return mutate(variables);
        }

        throw err;
      }
    },
    [state.failureCount]
  );

  // mutate, но возвращает промис
  const mutateAsync = useCallback(
    async (variables: TVariables) => {
      return mutate(variables);
    },
    [mutate]
  );

  // сбрасываем состояние мутации
  const reset = useCallback(() => {
    setState({
      status: "idle",
      data: undefined,
      error: null,
      variables: undefined,
      context: undefined,
      isIdle: true,
      isLoading: false,
      isError: false,
      isSuccess: false,
      failureCount: 0,
    });
  }, []);

  return {
    ...state,
    mutate,
    mutateAsync,
    reset,
  };
};

export { useMutation };
