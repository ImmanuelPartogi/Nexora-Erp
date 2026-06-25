// ============================================
// FILE: web-app/src/shared/hooks/useResource.ts
// Generic data-fetch hook with AbortController + refetch.
// ============================================
import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseResourceResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Generic data fetching hook.
 * @param fetcher async function returning T. MUST be stable (useCallback/memoized)
 * @param deps dependency array that re-triggers the fetch when changed
 */
export function useResource<T>(
  fetcher: () => Promise<T>,
  deps: unknown[] = []
): UseResourceResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  // bump to force refetch
  const [nonce, setNonce] = useState(0);
  // guard against stale state updates after unmount
  const isMounted = useRef(true);

  const refetch = useCallback(() => setNonce((n) => n + 1), []);

  useEffect(() => {
    isMounted.current = true;
    const controller = new AbortController();

    setLoading(true);
    setError(null);

    fetcher()
      .then((result) => {
        if (isMounted.current && !controller.signal.aborted) {
          setData(result);
        }
      })
      .catch((err: unknown) => {
        if (isMounted.current && !controller.signal.aborted) {
          const message =
            err instanceof Error ? err.message : 'Gagal memuat data';
          setError(message);
        }
      })
      .finally(() => {
        if (isMounted.current && !controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted.current = false;
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nonce, ...deps]);

  return { data, loading, error, refetch };
}