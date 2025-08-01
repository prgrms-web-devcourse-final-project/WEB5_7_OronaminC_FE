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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import UserRoomModal from "../components/UserRoomModal";

const MainLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { roomId } = useParams<{ roomId: string }>();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
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

  const openUserModal = () => {
    setIsUserModalOpen(true);
  };

  const closeUserModal = () => {
    setIsUserModalOpen(false);
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

  const startRoomMutation = useMutation({
    mutationFn: async (roomId: string) => {
      const response = await fetch(`/api/rooms/${roomId}/status`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ roomStatus: "STARTED" }),
      });

      if (response.status === 204) {
        queryClient.invalidateQueries({ queryKey: ["room", roomId] });
      }

      if (!response.ok) {
        throw new Error("방 시작 실패");
      }

      return response.json();
    },
    onSuccess: () => {
      console.log("성공");
    },
    onError: (error: Error) => {
      console.error("방 시작 실패:", error);
    },
  });

  const handleLogout = async () => {
    if (
      location.pathname.startsWith("/room") &&
      !location.pathname.endsWith("/report") &&
      roomData?.isHost
    ) {
      try {
        // 발표방 종료 API 호출
        const response = await fetch(`/api/rooms/${roomId}/status`, {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            roomStatus: "ENDED",
          }),
        });

        if (response.ok) {
          navigate(`/room/${roomId}/report`);
        }
      } catch {
        navigate(`/room/${roomId}/report`);
      }
    } else {
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
    }
  };

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
            {roomData?.isHost && roomData?.roomStatus === "BEFORE_START" ? (
              <>
                <button
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer"
                  onClick={() => navigate("/mypage")}
                >
                  나가기
                </button>
                <button
                  onClick={() => {
                    if (roomId) {
                      startRoomMutation.mutate(roomId);
                    }
                  }}
                  disabled={startRoomMutation.isPending}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded-full text-sm font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {startRoomMutation.isPending ? "시작 중..." : "시작하기"}
                </button>
              </>
            ) : (
              <button
                onClick={handleLogout}
                className="bg-red-500 cursor-pointer hover:bg-red-600 text-white px-4 py-1 rounded-full text-sm font-medium transition-colors"
              >
                {roomData?.isHost ? "종료하기" : "나가기"}
              </button>
            )}
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
              <button
                onClick={openUserModal}
                className="bg-blue-500 cursor-pointer hover:bg-blue-600 text-white px-2 py-2 rounded-md text-sm font-medium transition-colors"
              >
                초대 코드로 입장
              </button>
            )}
            {location.pathname.endsWith("/report") && (
              <button
                onClick={() => navigate("/mypage")}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer"
              >
                마이페이지
              </button>
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
      <UserRoomModal isOpen={isUserModalOpen} onClose={closeUserModal} />
    </div>
  );
};

export default MainLayout;
