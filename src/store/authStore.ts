import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: number;
  name: string;
  nickname: string;
  role: string;
}

// 백엔드 로그인/토큰 재발급 응답 (AuthTokenResponse)
export interface AuthTokenResponse {
  accessToken: string;
  accessTokenExpiresIn: number;
  memberId: number;
  nickname: string;
  role: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  accessToken: string | null;
  accessTokenExpiresAt: number | null;

  setAuth: (token: AuthTokenResponse) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      accessToken: null,
      accessTokenExpiresAt: null,

      setAuth: (token) => {
        set({
          user: {
            id: token.memberId,
            name: token.nickname,
            nickname: token.nickname,
            role: token.role,
          },
          isAuthenticated: true,
          accessToken: token.accessToken,
          accessTokenExpiresAt: Date.now() + token.accessTokenExpiresIn,
        });
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          accessToken: null,
          accessTokenExpiresAt: null,
        });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        accessToken: state.accessToken,
        accessTokenExpiresAt: state.accessTokenExpiresAt,
      }),
    }
  )
);
