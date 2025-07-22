import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const OAuthCallback = () => {
  const navigate = useNavigate();
  const { checkAuth, isAuthenticated, isGuest, user, guestUser } = useAuth();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        // 백엔드에서 OAuth 처리 완료 후 세션 확인
        await checkAuth();

        setAuthChecked(true);
      } catch (error) {
        console.error("OAuth 로그인 실패:", error);
        alert("로그인에 실패했습니다. 다시 시도해주세요.");
        navigate("/");
      }
    };

    // 약간의 지연 후 처리 (백엔드 세션 설정 완료 대기)
    const timer = setTimeout(handleOAuthCallback, 1000);

    return () => clearTimeout(timer);
  }, [navigate, checkAuth]);

  // 인증 상태 확인 후 리다이렉트
  useEffect(() => {
    if (authChecked) {
      if (isAuthenticated) {
        navigate("/mypage");
      } else if (isGuest) {
        navigate("/");
      } else {
        alert("로그인에 실패했습니다. 다시 시도해주세요.");
        navigate("/");
      }
    }
  }, [authChecked, isAuthenticated, isGuest, user, guestUser, navigate]);

  return (
    <div className="h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-bold mb-2">로그인 처리 중...</h2>
        <p className="text-gray-600">잠시만 기다려 주세요.</p>
      </div>
    </div>
  );
};

export default OAuthCallback;
