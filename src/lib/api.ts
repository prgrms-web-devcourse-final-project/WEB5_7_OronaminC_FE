import { useAuthStore, type AuthTokenResponse } from "../store/authStore";

const REFRESH_URL = "/api/auth/token/refresh";
// 만료 직전 토큰으로 WebSocket CONNECT가 거부되지 않도록 여유를 둔다
const EXPIRY_MARGIN_MS = 30_000;

let refreshPromise: Promise<string | null> | null = null;

// refresh token(HttpOnly 쿠키)으로 access token을 재발급한다.
// 동시에 여러 요청이 401을 받아도 재발급은 한 번만 한다 (refresh token 로테이션 때문에 중복 호출 시 실패)
export function refreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const response = await fetch(REFRESH_URL, {
          method: "POST",
          credentials: "include",
        });
        if (!response.ok) {
          useAuthStore.getState().logout();
          return null;
        }
        const token: AuthTokenResponse = await response.json();
        useAuthStore.getState().setAuth(token);
        return token.accessToken;
      } catch {
        return null;
      } finally {
        refreshPromise = null;
      }
    })();
  }
  return refreshPromise;
}

// 유효한 access token을 반환한다. 만료(임박)면 재발급을 시도한다
export async function getValidAccessToken(): Promise<string | null> {
  const { accessToken, accessTokenExpiresAt } = useAuthStore.getState();
  if (!accessToken) return null;
  if (accessTokenExpiresAt && accessTokenExpiresAt - EXPIRY_MARGIN_MS < Date.now()) {
    return refreshAccessToken();
  }
  return accessToken;
}

function withAuth(init: RequestInit, token: string | null): RequestInit {
  const headers = new Headers(init.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  return { ...init, headers, credentials: "include" };
}

// Authorization 헤더를 붙여 요청하고, 401이면 토큰을 재발급받아 한 번 재시도한다
export async function apiFetch(url: string, init: RequestInit = {}): Promise<Response> {
  const token = await getValidAccessToken();
  const response = await fetch(url, withAuth(init, token));

  if (response.status !== 401 || !token) {
    return response;
  }

  const newToken = await refreshAccessToken();
  if (!newToken) {
    return response;
  }
  return fetch(url, withAuth(init, newToken));
}
