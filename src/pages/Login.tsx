import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();

  const [nickname, setNickname] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-gray-50 p-8 rounded-lg h-[600px]">
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

            <div className="border-t border-gray-200 mt-6 pt-6" />

            <div className="text-center mb-6 h-[200px]">
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
                    id="nickname"
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
                  disabled={nickname.trim() === "" || roomCode.trim() === ""}
                  onClick={() => {
                    if (nickname.trim() === "") {
                      alert("닉네임을 입력해주세요");
                      return;
                    }
                    navigate("/room/13");
                  }}
                >
                  비회원으로 입장하기
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
