import { useQuery } from '@tanstack/react-query';

interface FetchOptions {
  headers?: HeadersInit;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: BodyInit;
}

async function fetchData<T>(url: string, options?: FetchOptions): Promise<T> {
  const response = await fetch(url, {
    method: options?.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    body: options?.body,
  });

  if (!response.ok) {
    throw new Error(`API 요청 오류: ${response.status}`);
  }

  return await response.json();
}

export function useFetch<T>(
  queryKey: string | string[],
  url: string,
  options?: FetchOptions,
) {
  const queryKeyArray = Array.isArray(queryKey) ? queryKey : [queryKey];

  return useQuery({
    queryKey: queryKeyArray,
    queryFn: () => fetchData<T>(url, options),
  });
}
