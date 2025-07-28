import {
  Link,
  Outlet,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import LoginModal from "../components/LoginModal";
import { useState } from "react";
import { useAuthStore } from "../store/authStore";
import { useQuery } from "@tanstack/react-query";

const MainLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { roomId } = useParams<{ roomId: string }>();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [roomCode, setRoomCode] = useState("");
  const [type, setType] = useState<"user" | "guest">("user");

  const openModal = (code: string, modalType: "user" | "guest") => {
    setRoomCode(code);
    setType(modalType);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setRoomCode("");
  };

  const handleLogout = async () => {
    try {
      if (isAuthenticated) {
        const response = await fetch("/api/auth/logout", {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.status === 204) {
          logout();
          navigate("/");
        }
      } else {
        logout();
        navigate("/");
      }
    } catch {
      logout();
      navigate("/");
    }
  };

  const { data: roomData } = useQuery({
    queryKey: ["room", roomId],
    queryFn: async () => {
      if (!roomId) return null;
      const response = await fetch(`/api/rooms/${roomId}`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("방 정보 조회 실패");
      return response.json();
    },
    enabled: !!roomId,
  });

  console.log(user, roomData);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="py-4 px-6 border-b border-gray-100 flex justify-between items-center">
        {location.pathname.startsWith("/room/") ? (
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold">{roomData?.title || "발표실"}</h1>
          </div>
        ) : (
          <Link to="/" className="text-xl font-bold">
            Join.in
          </Link>
        )}

        {!location.pathname.endsWith("/report") &&
        location.pathname.startsWith("/room/") ? (
          <div className="flex items-center gap-2">
            <span className="mr-2 text-sm">
              참가자: {roomData?.participantCount} /{" "}
              {roomData?.participantLimit}
            </span>

            <Link
              to="/"
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded-full text-sm font-medium transition-colors"
            >
              나가기
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {user?.nickname || "사용자"} 님
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-red-100 hover:bg-red-200 text-red-700 px-2 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer"
                >
                  로그아웃
                </button>
              </div>
            ) : (
              <button
                onClick={() => openModal("", "user")}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer"
              >
                회원 로그인
              </button>
            )}
            {location.pathname === "/mypage" && (
              <Link
                to="/room/13"
                className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-2 rounded-md text-sm font-medium transition-colors"
              >
                초대 코드로 입장
              </Link>
            )}
          </div>
        )}
      </header>

      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>

      <footer className="py-4 text-center text-xs text-gray-400">
        © 2025 OronaminC. 실시간 발표 질의응답 서비스
      </footer>

      <LoginModal
        isOpen={isModalOpen}
        onClose={closeModal}
        initialRoomCode={roomCode}
        type={type}
      />
    </div>
  );
};

export default MainLayout;
