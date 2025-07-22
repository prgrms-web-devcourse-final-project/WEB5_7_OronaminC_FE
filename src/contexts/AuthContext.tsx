import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import type { ReactNode } from "react";

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

interface AuthContextType {
  user: User | null;
  guestUser: GuestUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isGuest: boolean;
  checkAuth: () => Promise<void>;
  logout: () => void;
  setGuestUser: (guestUser: GuestUser) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [guestUser, setGuestUserState] = useState<GuestUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const hasJSessionId = () => {
    console.log(document);
    return document.cookie
      .split(";")
      .some((cookie) => cookie.trim().startsWith("JSESSIONID="));
  };

  const checkAuth = useCallback(async () => {
    setIsLoading(true);
    try {
      const hasSession = hasJSessionId();
      console.log("JSESSIONID 쿠키 존재:", hasSession);

      if (hasSession) {
        try {
          const response = await fetch(
            "http://15.165.241.81:8080/api/auth/session",
            {
              method: "GET",
              credentials: "include",
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
            localStorage.setItem("userSession", JSON.stringify(userData));
            setGuestUserState(null); // 소셜 로그인 시 게스트 정보 초기화
            return;
          }
        } catch {
          const tempUser = {
            id: 1,
            name: "소셜 로그인 사용자",
            nickname: "소셜 로그인 사용자",
            role: "USER",
          };
          setUser(tempUser);
          localStorage.setItem("userSession", JSON.stringify(tempUser));
          setGuestUserState(null);
          return;
        }
      }

      setUser(null);
      localStorage.removeItem("userSession");

      const guestId = sessionStorage.getItem("userId");
      const guestNickname = sessionStorage.getItem("userNickname");
      const isLoggedIn = sessionStorage.getItem("isLoggedIn");

      if (guestId && guestNickname && isLoggedIn === "true") {
        const roomCode = sessionStorage.getItem("roomCode") || "";

        setGuestUserState({
          id: guestId,
          nickname: guestNickname,
          roomCode: roomCode,
        });
      } else {
        setGuestUserState(null);
      }
    } catch {
      setUser(null);
      localStorage.removeItem("userSession");

      const guestId = sessionStorage.getItem("userId");
      const guestNickname = sessionStorage.getItem("userNickname");
      const isLoggedIn = sessionStorage.getItem("isLoggedIn");

      if (guestId && guestNickname && isLoggedIn === "true") {
        const roomCode = sessionStorage.getItem("roomCode") || "";
        setGuestUserState({
          id: guestId,
          nickname: guestNickname,
          roomCode: roomCode,
        });
      } else {
        setGuestUserState(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const logout = () => {
    setUser(null);
    setGuestUserState(null);
    localStorage.removeItem("userSession");
    sessionStorage.removeItem("userId");
    sessionStorage.removeItem("userNickname");
    sessionStorage.removeItem("isLoggedIn");
    sessionStorage.removeItem("roomCode");
  };

  const setGuestUser = (guestUser: GuestUser) => {
    setGuestUserState(guestUser);
    sessionStorage.setItem("userId", guestUser.id);
    sessionStorage.setItem("userNickname", guestUser.nickname);
    sessionStorage.setItem("isLoggedIn", "true");
    sessionStorage.setItem("roomCode", guestUser.roomCode);
  };

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const isAuthenticated = !!user;
  const isGuest = !!guestUser;

  return (
    <AuthContext.Provider
      value={{
        user,
        guestUser,
        isLoading,
        isAuthenticated,
        isGuest,
        checkAuth,
        logout,
        setGuestUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
