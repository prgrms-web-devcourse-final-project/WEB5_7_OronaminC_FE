import { useQuery, useMutation } from "@tanstack/react-query";

const BASE_URL = "";

interface FetchOptions {
  headers?: HeadersInit;
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: BodyInit;
}

async function fetchData<T>(url: string, options?: FetchOptions): Promise<T> {
  const fullUrl = url.startsWith("http") ? url : `${BASE_URL}${url}`;
  const response = await fetch(fullUrl, {
    method: options?.method || "GET",
    headers: {
      "Content-Type": "application/json",
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
  options?: FetchOptions
) {
  const queryKeyArray = Array.isArray(queryKey) ? queryKey : [queryKey];

  return useQuery({
    queryKey: queryKeyArray,
    queryFn: () => fetchData<T>(url, options),
  });
}

type MutationParams<T> = {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
};

export function useMutate<T, D = unknown>(
  url: string,
  method: "POST" | "PUT" | "DELETE" | "PATCH" = "POST",
  params?: MutationParams<T>
) {
  return useMutation({
    mutationFn: async (data: D) => {
      return fetchData<T>(url, {
        method,
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
      });
    },
    onSuccess: params?.onSuccess,
    onError: params?.onError,
  });
}
