import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface UserRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginModal = ({ isOpen, onClose }: UserRoomModalProps) => {
  const navigate = useNavigate();

  const [roomCode, setRoomCode] = useState("");

  const handleRoomEntry = async (inviteCode: string) => {
    if (!inviteCode.trim()) return;

    try {
      const response = await fetch("/api/rooms/code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ secretCode: inviteCode.trim() }),
      });

      if (response.ok) {
        const data = await response.json();
        const roomId = data.roomId;
        onClose();
        navigate(`/room/${roomId}`);
      } else {
        alert("존재하지 않는 방입니다.");
      }
    } catch (error) {
      console.error("API 요청 중 오류 발생:", error);
      alert("방 입장에 실패했습니다. 다시 시도해 주세요.");
    }
  };

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
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold">방 입장하기</h2>
            <p className="text-gray-600 text-sm mt-2">방 코드를 입력해주세요</p>

            <form className="mt-8 space-y-4">
              <div>
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
                disabled={roomCode.trim() === ""}
                onClick={() => {
                  handleRoomEntry(roomCode);
                }}
              >
                방 입장하기
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
