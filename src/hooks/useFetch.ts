import { useState, useEffect } from 'react';

type FetchMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface FetchOptions {
  method?: FetchMethod;
  headers?: Record<string, string>;
  body?: any;
}

export function useFetch<T>(url: string, options?: FetchOptions) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(url, {
          method: options?.method || 'GET',
          headers: options?.headers || { 'Content-Type': 'application/json' },
          body: options?.body ? JSON.stringify(options.body) : undefined,
        });

        const responseData = await response.json();

        if (response.ok) {
          setData(responseData);
        } else {
          setError(responseData.message || 'Request failed');
        }
      } catch (err) {
        setError('Error fetching data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url, options?.method, options?.headers, options?.body]);

  return { data, loading, error };
}