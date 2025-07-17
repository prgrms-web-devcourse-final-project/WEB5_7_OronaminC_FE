import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutate } from "../hooks/useFetch";

interface KakaoLoginResponse {
  token: string;
}

const OAuthCallback = () => {
  const navigate = useNavigate();

  const getAuthorizationCode = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get("code");
  };

  const loginMutation = useMutate<KakaoLoginResponse, { code: string }>(
    "/api/auth/kakao/callback",
    "POST",
    {
      onSuccess: (data) => {
        localStorage.setItem("authToken", data.token);
        navigate("/");
      },
      onError: (error) => {
        console.error("로그인 오류:", error);
        navigate("/");
      },
    }
  );

  useEffect(() => {
    const code = getAuthorizationCode();
    if (code) {
      loginMutation.mutate({ code });
    } else {
      navigate("/");
    }
  }, [loginMutation, navigate]);

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
