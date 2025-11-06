import { useState, useCallback, useEffect } from "react";

// A small reusable hook to call async API functions and track loading/error/data
export function useApi<T>(fn: () => Promise<T>, deps: any[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);

  const call = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fn();
      setData(res);
      return res;
    } catch (err) {
      setError(err);
      return null;
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    call();
  }, [call]);

  return { data, loading, error, refetch: call } as const;
}

export default useApi;
