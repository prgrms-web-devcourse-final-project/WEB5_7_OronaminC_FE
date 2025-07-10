import { Link, Outlet } from "react-router-dom";

const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="py-4 px-6 border-b border-gray-100 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">
          Join.in
        </Link>
        <Link
          to="/login"
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-1 rounded-full text-sm font-medium transition-colors"
        >
          로그인 / 회원가입
        </Link>
      </header>

      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>

      <footer className="py-4 text-center text-xs text-gray-400">
        © 2025 OronaminC. 실시간 발표 질의응답 서비스
      </footer>
    </div>
  );
};

export default MainLayout;
