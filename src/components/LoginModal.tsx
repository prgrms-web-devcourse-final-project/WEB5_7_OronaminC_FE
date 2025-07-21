import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutate } from "../hooks/useFetch";
import { useAuth } from "../contexts/AuthContext";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRoomCode?: string;
  type?: "user" | "guest";
}

const LoginModal = ({
  isOpen,
  onClose,
  initialRoomCode = "",
  type,
}: LoginModalProps) => {
  const navigate = useNavigate();
  const { setGuestUser, checkAuth } = useAuth();

  const [nickname, setNickname] = useState("");
  const [roomCode, setRoomCode] = useState(initialRoomCode);
  const [showTooltip, setShowTooltip] = useState(false);

  const guestLoginMutation = useMutate("/api/auth/guest", "POST", {
    onSuccess: (data) => {
      console.log("data", data);
      const userData = data as { id: string };

      // AuthContext를 통해 게스트 사용자 정보 설정
      setGuestUser({
        id: userData.id,
        nickname: nickname,
        roomCode: roomCode,
      });

      navigate(`/room/${roomCode}`);
      onClose();
    },
    onError: (error) => {
      console.error("게스트 로그인 오류:", error);
      alert("게스트 로그인에 실패했습니다. 다시 시도해 주세요.");
    },
  });

  useEffect(() => {
    setRoomCode(initialRoomCode);
  }, [initialRoomCode]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-50 opacity-100 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md relative shadow-lg">
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 cursor-pointer"
          onClick={onClose}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div className="bg-gray-50 p-8 rounded-lg">
          {type === "user" ? (
            <div>
              <div className="flex items-center justify-center relative">
                <h2 className="text-2xl font-bold">회원 로그인</h2>

                <div
                  className="ml-2 cursor-pointer relative"
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                >
                  <img
                    src="/help-circle.svg"
                    alt="도움말"
                    className="w-5 h-5"
                  />
                  {showTooltip && (
                    <div className="absolute z-10 w-64 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-left -right-9 top-8">
                      <h3 className="font-medium text-lg mb-2 text-gray-700">
                        회원가입 시 혜택
                      </h3>
                      <ul className="space-y-1 text-gray-600 text-sm">
                        <li className="flex items-center">
                          • 발표방을 생성, 관리
                        </li>
                        <li className="flex items-center">
                          • 참여 기록을 저장
                        </li>
                        <li className="flex items-center">
                          • 발표 리포트를 확인할 수 있습니다
                        </li>
                      </ul>
                      <div className="absolute -top-2 right-10 w-3 h-3 bg-white border-t border-l border-gray-200 transform rotate-45"></div>
                    </div>
                  )}
                </div>
              </div>
              <p className="text-center text-gray-600 text-sm mt-2">
                회원으로 다양한 서비스를 사용해보세요
              </p>

              <div className="mb-10 mt-6">
                <button
                  type="button"
                  className="w-full py-3 px-4 bg-[#FEE500] hover:bg-[#FFDE00] text-[#3C1E1E] font-medium rounded-md flex items-center justify-center gap-2 transition-all duration-200 shadow hover:shadow-md relative overflow-hidden hover:opacity-90 cursor-pointer"
                  onClick={() => {
                    // 새 창으로 OAuth 처리
                    const oauthWindow = window.open(
                      "http://15.165.241.81:8080/oauth2/authorization/kakao",
                      "kakaoLogin",
                      "width=500,height=600,scrollbars=yes,resizable=yes"
                    );

                    // 새 창 모니터링
                    const checkClosed = setInterval(() => {
                      if (oauthWindow?.closed) {
                        clearInterval(checkClosed);

                        // 잠시 후 로그인 상태 확인
                        setTimeout(async () => {
                          try {
                            // AuthContext를 통해 인증 상태 업데이트
                            await checkAuth();
                            
                            console.log("로그인 성공 - mypage로 이동");
                            onClose();
                            navigate("/mypage");
                          } catch (error) {
                            console.error("세션 확인 오류:", error);
                            alert("로그인 확인 중 오류가 발생했습니다.");
                          }
                        }, 1000);
                      }
                    }, 1000);
                  }}
                >
                  <img
                    src="/kakao.svg"
                    alt="카카오 로고"
                    className="w-5 h-5"
                    aria-hidden="true"
                  />
                  <span className="font-medium">카카오로 로그인</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold">비회원으로 시작</h2>
                <p className="text-gray-600 text-sm mt-2">
                  1회성 참여라면 경우
                  <br />
                  비회원으로 간편하게 이용하세요
                </p>

                <form className="mt-8 space-y-4">
                  <div>
                    <input
                      id="nickname"
                      type="text"
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="사용할 닉네임을 입력하세요"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                    />
                    <input
                      id="roomCode"
                      type="text"
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mt-2"
                      placeholder="발표방 코드를 입력하세요"
                      value={roomCode}
                      onChange={(e) => setRoomCode(e.target.value)}
                    />
                  </div>

                  <button
                    type="button"
                    className="w-full py-3 px-4 bg-gray-700 hover:bg-gray-800 text-white font-medium rounded-lg mt-6 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-700"
                    disabled={
                      nickname.trim() === "" ||
                      roomCode.trim() === "" ||
                      guestLoginMutation.isPending
                    }
                    onClick={() => {
                      if (nickname.trim().length > 7) {
                        alert("닉네임은 6자 이하로 입력해주세요");
                        return;
                      }

                      if (nickname.trim() === "") {
                        alert("닉네임을 입력해주세요");
                        return;
                      }
                      guestLoginMutation.mutate({ nickname });
                    }}
                  >
                    {guestLoginMutation.isPending
                      ? "처리 중..."
                      : "비회원으로 입장하기"}
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
