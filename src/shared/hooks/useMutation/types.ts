interface MutationOptions<TData, TError, TVariables, TContext> {
  onMutate?: (variables: TVariables) => Promise<TContext> | TContext;
  onSuccess?: (data: TData, variables: TVariables, context?: TContext) => void;
  onError?: (error: TError, variables: TVariables, context?: TContext) => void;
  onSettled?: (
    data: TData | undefined,
    error: TError | null,
    variables: TVariables,
    context?: TContext
  ) => void;
  retry?: number | boolean | ((failureCount: number, error: TError) => boolean);
  retryDelay?: number | ((failureCount: number, error: TError) => number);
  networkMode?: "online" | "always" | "offlineFirst";
  useErrorBoundary?: boolean | ((error: TError) => boolean);
}

interface MutationState<TData, TError, TVariables, TContext> {
  status: "idle" | "loading" | "error" | "success";
  data: TData | undefined;
  error: TError | null;
  variables: TVariables | undefined;
  context: TContext | undefined;
  isIdle: boolean;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  failureCount: number;
}

interface MutationResult<TData, TError, TVariables, TContext>
  extends MutationState<TData, TError, TVariables, TContext> {
  mutate: (variables: TVariables) => Promise<TData>;
  mutateAsync: (variables: TVariables) => Promise<TData>;
  reset: () => void;
}


export type { MutationOptions, MutationState, MutationResult }