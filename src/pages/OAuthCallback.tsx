import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutate } from "../hooks/useFetch";

interface KakaoLoginResponse {
  token: string;
}

interface UserSession {
  id: number;
  name: string;
  nickname: string;
  role: string;
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
      onSuccess: async (data) => {
        localStorage.setItem("authToken", data.token);
        
        // 세션 정보 가져오기
        try {
          const sessionData = await fetch("/api/auth/session", {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${data.token}`,
            },
          });
          
          if (sessionData.ok) {
            const userSession: UserSession = await sessionData.json();
            localStorage.setItem("userSession", JSON.stringify(userSession));
            console.log("사용자 세션 정보 저장 완료:", userSession);
          } else {
            console.error("세션 정보 가져오기 실패:", sessionData.status);
          }
        } catch (error) {
          console.error("세션 정보 요청 오류:", error);
        }
        
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
