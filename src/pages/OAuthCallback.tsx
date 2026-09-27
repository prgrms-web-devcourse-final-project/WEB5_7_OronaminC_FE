import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore, type AuthTokenResponse } from "../store/authStore";

const OAuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setAuth } = useAuthStore();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        const code = searchParams.get("code");
        const state = searchParams.get("state");
        const errorParam = searchParams.get("error");

        if (errorParam) {
          return;
        }

        if (!code) {
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
          const { token } = (await response.json()) as { token: AuthTokenResponse };
          setAuth(token);
          navigate("/mypage");
        }
      } catch {
        alert("로그인 처리 중 오류가 발생했습니다.");
        navigate("/");
      }
    };

    handleOAuthCallback();
  }, [searchParams, setAuth, navigate]);

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
