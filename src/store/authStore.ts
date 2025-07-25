import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: number;
  name: string;
  nickname: string;
  role: string;
}

interface GuestUser {
  id: string;
  nickname: string;
  roomCode: string;
}

interface AuthState {
  user: User | null;
  guestUser: GuestUser | null;
  isAuthenticated: boolean;
  isGuest: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setGuestUser: (guestUser: GuestUser | null) => void;
  logout: () => void;
  checkAuthStatus: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      guestUser: null,
      isAuthenticated: false,
      isGuest: false,

      setUser: (user) => {
        set({
          user,
          isAuthenticated: !!user,
          isGuest: false,
          guestUser: null,
        });
      },

      setGuestUser: (guestUser) => {
        set({
          guestUser,
          isGuest: !!guestUser,
          isAuthenticated: false,
          user: null,
        });
      },

      logout: () => {
        set({
          user: null,
          guestUser: null,
          isAuthenticated: false,
          isGuest: false,
        });
        localStorage.removeItem("userSession");
        sessionStorage.removeItem("userId");
        sessionStorage.removeItem("userNickname");
        sessionStorage.removeItem("isLoggedIn");
        sessionStorage.removeItem("roomCode");
      },

      checkAuthStatus: () => {
        // localStorage에서 사용자 정보 확인
        const savedSession = localStorage.getItem("userSession");
        if (savedSession) {
          try {
            const user = JSON.parse(savedSession);
            set({
              user,
              isAuthenticated: true,
              isGuest: false,
              guestUser: null,
            });
            return;
          } catch {
            localStorage.removeItem("userSession");
          }
        }

        // sessionStorage에서 게스트 정보 확인
        const guestId = sessionStorage.getItem("userId");
        const guestNickname = sessionStorage.getItem("userNickname");
        const isLoggedIn = sessionStorage.getItem("isLoggedIn");
        const roomCode = sessionStorage.getItem("roomCode");

        if (guestId && guestNickname && isLoggedIn === "true") {
          set({
            guestUser: {
              id: guestId,
              nickname: guestNickname,
              roomCode: roomCode || "",
            },
            isGuest: true,
            isAuthenticated: false,
            user: null,
          });
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
      }),
    }
  )
);
