import { useState } from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  const [roomCode, setRoomCode] = useState('');

  return (
    <div className="min-h-screen flex flex-col">
      {/* 헤더 */}
      <header className="py-4 px-6 border-b border-gray-100 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">
          Join.in
        </Link>
        <button
          type="button"
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-1 rounded-full text-sm font-medium transition-colors"
        >
          로그인 / 회원가입
        </button>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 gap-20">
        {/* 상단 제목 섹션 */}
        <section className="text-center max-w-md">
          <h1 className="text-3xl font-bold mb-3">실시간 발표 질의응답</h1>
          <p className="text-gray-600">
            발표 중 실시간으로 질문을 받고 답변하세요
          </p>
        </section>

        {/* 코드 입력 섹션 */}
        <section className="w-full max-w-md">
          <div className="border rounded-lg overflow-hidden flex">
            <div className="flex-1 px-3 py-2 flex items-center bg-white">
              <input
                type="text"
                placeholder="발표방 코드를 입력하세요"
                className="w-full focus:outline-none"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
              />
            </div>
            <button
              type="button"
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 font-medium transition-colors"
            >
              입장
            </button>
          </div>
        </section>

        {/* 사용법 섹션 */}
        <section className="w-full max-w-3xl">
          <h2 className="text-xl font-bold text-center mb-10">사용법</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* 1단계: 발표방 생성 */}
            <div className="text-center">
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="font-bold mb-2">발표방 생성</h3>
              <p className="text-sm text-gray-500">
                새로운 발표자용을
                <br />
                개설하세요
              </p>
            </div>

            {/* 2단계: 코드 공유 */}
            <div className="text-center">
              <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="font-bold mb-2">코드 공유</h3>
              <p className="text-sm text-gray-500">
                생성된 코드를
                <br />
                참여자분들께 공유
              </p>
            </div>

            {/* 3단계: 실시간 소통 */}
            <div className="text-center">
              <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center text-white font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="font-bold mb-2">실시간 소통</h3>
              <p className="text-sm text-gray-500">
                손쉽게 질문으로
                <br />
                활발한 소통
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* 푸터 */}
      <footer className="py-4 text-center text-xs text-gray-400">
        © 2025 OAA Live. 실시간 발표 질의응답 서비스
      </footer>
    </div>
  );
};

export default Home;
