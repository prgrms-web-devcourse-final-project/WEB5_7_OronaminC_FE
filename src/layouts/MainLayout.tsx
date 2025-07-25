import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import LoginModal from "../components/LoginModal";
import { useState, useEffect } from "react";
import { useAuthStore } from "../store/authStore";

const MainLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, guestUser, isAuthenticated, isGuest, logout, checkAuthStatus } =
    useAuthStore();

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

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  console.log("user", user);
  console.log("guestUser", guestUser);
  console.log("isAuthenticated", isAuthenticated);
  console.log("isGuest", isGuest);

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

  return (
    <div className="min-h-screen flex flex-col">
      <header className="py-4 px-6 border-b border-gray-100 flex justify-between items-center">
        {location.pathname.startsWith("/room/") ? (
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold">프론트엔드 아키텍처 발표</h1>
          </div>
        ) : (
          <Link to="/" className="text-xl font-bold">
            Join.in
          </Link>
        )}

        {!location.pathname.endsWith("/report") &&
        location.pathname.startsWith("/room/") ? (
          <div className="flex items-center gap-2">
            <span className="mr-2 text-sm">참가자: 41 / 50</span>

            <Link
              to="/"
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded-full text-sm font-medium transition-colors"
            >
              나가기
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            {location.pathname === "/mypage" && (
              <Link
                to="/room/13"
                className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-2 rounded-md text-sm font-medium transition-colors"
              >
                초대 코드로 입장
              </Link>
            )}
            {isAuthenticated || isGuest ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {user?.nickname || guestUser?.nickname || "사용자"} 님
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
