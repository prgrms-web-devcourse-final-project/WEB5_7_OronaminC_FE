import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const OAuthCallback = () => {
  const navigate = useNavigate();
  const { checkAuth } = useAuth();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const hasError = urlParams.has("error");

      if (hasError) {
        alert("로그인에 실패했습니다. 다시 시도해주세요.");
        navigate("/");
      } else {
        try {
          await checkAuth();
          navigate("/mypage");
        } catch {
          alert("로그인 처리 중 오류가 발생했습니다.");
          navigate("/");
        }
      }
    };

    const timer = setTimeout(handleOAuthCallback, 500);

    return () => clearTimeout(timer);
  }, [navigate, checkAuth]);

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
