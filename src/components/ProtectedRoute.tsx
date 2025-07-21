import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingFallback from './LoadingFallback';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean; // true면 로그인 필요, false면 비로그인만 접근 가능
}

const ProtectedRoute = ({ children, requireAuth = true }: ProtectedRouteProps) => {
  const { user, guestUser, isLoading, isAuthenticated, isGuest } = useAuth();

  if (isLoading) {
    return <LoadingFallback />;
  }

  // 로그인이 필요한 페이지
  if (requireAuth) {
    if (!isAuthenticated && !isGuest) {
      return <Navigate to="/" replace />;
    }
    return <>{children}</>;
  }

  // 비로그인만 접근 가능한 페이지 (홈페이지)
  if (!requireAuth) {
    // 소셜 로그인 사용자는 mypage로 리다이렉트
    if (isAuthenticated && user) {
      return <Navigate to="/mypage" replace />;
    }
    
    // 게스트 로그인 사용자는 해당 방으로 리다이렉트
    if (isGuest && guestUser) {
      return <Navigate to={`/room/${guestUser.roomCode}`} replace />;
    }
    
    // 로그인하지 않은 사용자만 접근 가능
    return <>{children}</>;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
