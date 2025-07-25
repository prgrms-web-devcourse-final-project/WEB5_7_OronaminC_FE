import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const OAuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        const code = searchParams.get("code");
        const state = searchParams.get("state");
        const errorParam = searchParams.get("error");

        if (errorParam) {
          console.error("카카오 로그인 오류:", errorParam);
          setError("카카오 로그인에 실패했습니다.");
          setAuthChecked(true);
          return;
        }

        if (!code) {
          console.error("인증 코드가 없습니다.");
          setError("인증 코드가 없습니다.");
          setAuthChecked(true);
          return;
        }

        const response = await fetch("/api/auth/kakao", {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ code, state }),
        });

        if (response.ok) {
          const userData = await response.json();
          localStorage.setItem("userSession", JSON.stringify(userData));
          setIsAuthenticated(true);
        } else {
          const errorData = await response.json();
          console.error("로그인 실패:", errorData);
          setError(errorData.message || "로그인에 실패했습니다.");
        }

        setAuthChecked(true);
      } catch (error) {
        console.error("OAuth 로그인 실패:", error);
        setError("로그인 처리 중 오류가 발생했습니다.");
        setAuthChecked(true);
      }
    };

    handleOAuthCallback();
  }, [searchParams]);

  useEffect(() => {
    if (authChecked) {
      if (isAuthenticated) {
        navigate("/mypage");
      } else {
        alert(error || "로그인에 실패했습니다. 다시 시도해주세요.");
        navigate("/");
      }
    }
  }, [authChecked, isAuthenticated, error, navigate]);

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2 text-red-600">로그인 실패</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

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
