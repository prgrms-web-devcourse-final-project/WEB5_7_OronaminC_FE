import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";

const OAuthCallback = () => {
  const navigate = useNavigate();

  // URL에서 인증 코드 추출
  const getAuthorizationCode = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get("code");
  };

  // 백엔드에 인증 코드 전송하여 로그인 처리
  const loginMutation = useMutation({
    mutationFn: async (code: string) => {
      const response = await fetch("/api/auth/kakao/callback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        throw new Error("카카오 로그인에 실패했습니다");
      }

      return await response.json();
    },
    onSuccess: (data) => {
      // 로그인 성공 시 토큰 저장
      localStorage.setItem("authToken", data.token);
      // 메인 페이지로 리다이렉트
      navigate("/");
    },
    onError: (error) => {
      console.error("로그인 오류:", error);
      navigate("/");
    },
  });

  useEffect(() => {
    const code = getAuthorizationCode();
    if (code) {
      loginMutation.mutate(code);
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
