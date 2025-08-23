import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

const OAuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setUser } = useAuthStore();

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
          const userData = await response.json();
          console.log("✅ 받아온 토큰 정보:", userData); 
          setUser(userData);
          navigate("/mypage");
        }
      } catch {
        alert("로그인 처리 중 오류가 발생했습니다.");
        navigate("/");
      }
    };

    handleOAuthCallback();
  }, [searchParams, setUser, navigate]);

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
