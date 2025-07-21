import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

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
    throw new Error('useAuth must be used within an AuthProvider');
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

  const checkAuth = async () => {
    console.log('=== checkAuth 시작 ===');
    setIsLoading(true);
    try {
      // 먼저 소셜 로그인 세션 확인
      console.log('세션 확인 요청 시작...');
      const response = await fetch('http://15.165.241.81:8080/api/auth/session', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('세션 응답 상태:', response.status);
      if (response.ok) {
        const userData = await response.json();
        console.log('소셜 로그인 사용자 데이터:', userData);
        setUser(userData);
        localStorage.setItem('userSession', JSON.stringify(userData));
        setGuestUserState(null); // 소셜 로그인 시 게스트 정보 초기화
      } else {
        console.log('소셜 로그인 실패, 게스트 로그인 확인');
        setUser(null);
        localStorage.removeItem('userSession');
        
        // 게스트 로그인 정보 확인
        const guestId = sessionStorage.getItem('userId');
        const guestNickname = sessionStorage.getItem('userNickname');
        const isLoggedIn = sessionStorage.getItem('isLoggedIn');
        
        console.log('게스트 로그인 정보:', { guestId, guestNickname, isLoggedIn });
        
        if (guestId && guestNickname && isLoggedIn === 'true') {
          const roomCode = sessionStorage.getItem('roomCode') || '';
          console.log('게스트 사용자 설정:', { guestId, guestNickname, roomCode });
          setGuestUserState({
            id: guestId,
            nickname: guestNickname,
            roomCode: roomCode,
          });
        } else {
          console.log('게스트 로그인 정보 없음');
          setGuestUserState(null);
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
      localStorage.removeItem('userSession');
      
      // 게스트 로그인 정보 확인
      const guestId = sessionStorage.getItem('userId');
      const guestNickname = sessionStorage.getItem('userNickname');
      const isLoggedIn = sessionStorage.getItem('isLoggedIn');
      
      if (guestId && guestNickname && isLoggedIn === 'true') {
        const roomCode = sessionStorage.getItem('roomCode') || '';
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
  };

  const logout = () => {
    setUser(null);
    setGuestUserState(null);
    localStorage.removeItem('userSession');
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('userNickname');
    sessionStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('roomCode');
  };

  const setGuestUser = (guestUser: GuestUser) => {
    setGuestUserState(guestUser);
    sessionStorage.setItem('userId', guestUser.id);
    sessionStorage.setItem('userNickname', guestUser.nickname);
    sessionStorage.setItem('isLoggedIn', 'true');
    sessionStorage.setItem('roomCode', guestUser.roomCode);
  };

  useEffect(() => {
    checkAuth();
  }, []);

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
