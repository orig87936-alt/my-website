import { useState, useCallback } from 'react';
import { useToast } from '../contexts/ToastContext';
import { useLoading } from '../contexts/LoadingContext';

interface ApiError {
  detail: string;
  status: number;
}

interface UseApiCallOptions {
  showSuccessToast?: boolean;
  successMessage?: string;
  showErrorToast?: boolean;
  showLoading?: boolean;
  loadingMessage?: string;
  onSuccess?: (data: any) => void;
  onError?: (error: ApiError) => void;
}

interface UseApiCallResult<T> {
  data: T | null;
  error: ApiError | null;
  isLoading: boolean;
  execute: (...args: any[]) => Promise<T | null>;
  reset: () => void;
}

/**
 * Custom hook for making API calls with automatic loading and error handling
 * 
 * @param apiFunction - The API function to call
 * @param options - Configuration options
 * @returns Object with data, error, isLoading state and execute function
 * 
 * @example
 * const { data, error, isLoading, execute } = useApiCall(
 *   articlesAPI.list,
 *   { showLoading: true, showErrorToast: true }
 * );
 * 
 * // Call the API
 * await execute({ page: 1, page_size: 10 });
 */
export function useApiCall<T>(
  apiFunction: (...args: any[]) => Promise<T>,
  options: UseApiCallOptions = {}
): UseApiCallResult<T> {
  const {
    showSuccessToast = false,
    successMessage = 'Operation completed successfully',
    showErrorToast = true,
    showLoading = false,
    loadingMessage = 'Loading...',
    onSuccess,
    onError,
  } = options;

  const { showSuccess, showError } = useToast();
  const { startLoading, stopLoading } = useLoading();

  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const execute = useCallback(
    async (...args: any[]): Promise<T | null> => {
      setIsLoading(true);
      setError(null);

      if (showLoading) {
        startLoading(loadingMessage);
      }

      try {
        const result = await apiFunction(...args);
        setData(result);

        if (showSuccessToast) {
          showSuccess(successMessage);
        }

        if (onSuccess) {
          onSuccess(result);
        }

        return result;
      } catch (err) {
        const apiError = err as ApiError;
        setError(apiError);

        if (showErrorToast) {
          showError(apiError.detail || 'An error occurred');
        }

        if (onError) {
          onError(apiError);
        }

        return null;
      } finally {
        setIsLoading(false);
        if (showLoading) {
          stopLoading();
        }
      }
    },
    [
      apiFunction,
      showLoading,
      loadingMessage,
      showSuccessToast,
      successMessage,
      showErrorToast,
      onSuccess,
      onError,
      startLoading,
      stopLoading,
      showSuccess,
      showError,
    ]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    data,
    error,
    isLoading,
    execute,
    reset,
  };
}

/**
 * Simplified hook for one-time API calls (e.g., form submissions)
 * Automatically shows loading overlay and error toasts
 * 
 * @example
 * const { execute, isLoading } = useApiMutation(articlesAPI.create);
 * 
 * const handleSubmit = async () => {
 *   const result = await execute(articleData);
 *   if (result) {
 *     // Success
 *   }
 * };
 */
export function useApiMutation<T>(
  apiFunction: (...args: any[]) => Promise<T>,
  options: UseApiCallOptions = {}
) {
  return useApiCall(apiFunction, {
    showLoading: true,
    showErrorToast: true,
    ...options,
  });
}

/**
 * Simplified hook for data fetching (e.g., loading lists)
 * Shows error toasts but no loading overlay
 * 
 * @example
 * const { data, isLoading, execute } = useApiQuery(articlesAPI.list);
 * 
 * useEffect(() => {
 *   execute({ page: 1 });
 * }, []);
 */
export function useApiQuery<T>(
  apiFunction: (...args: any[]) => Promise<T>,
  options: UseApiCallOptions = {}
) {
  return useApiCall(apiFunction, {
    showErrorToast: true,
    showLoading: false,
    ...options,
  });
}

