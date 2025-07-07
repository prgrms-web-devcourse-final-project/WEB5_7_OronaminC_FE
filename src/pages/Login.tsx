import { useState } from 'react';
import { Link } from 'react-router-dom';

const Login = () => {
  const [activeTab, setActiveTab] = useState<'member' | 'guest'>('member');
  const [nickname, setNickname] = useState('');

  return (
    <div className="min-h-screen flex flex-col">
      <header className="py-4 px-6 border-b border-gray-100 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">
          Join.in
        </Link>
      </header>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* 탭 버튼 */}
          <div className="flex mb-6 bg-gray-100 rounded-lg">
            <button
              type="button"
              className={`flex-1 py-3 text-center rounded-lg ${
                activeTab === 'member'
                  ? 'bg-white text-gray-900 shadow'
                  : 'text-gray-500'
              }`}
              onClick={() => setActiveTab('member')}
            >
              회원 로그인
            </button>
            <button
              type="button"
              className={`flex-1 py-3 text-center rounded-lg ${
                activeTab === 'guest'
                  ? 'bg-white text-gray-900 shadow'
                  : 'text-gray-500'
              }`}
              onClick={() => setActiveTab('guest')}
            >
              비회원 로그인
            </button>
          </div>

          {/* 폼 컨테이너 */}
          <div className="bg-gray-50 p-8 rounded-lg">
            {activeTab === 'member' ? (
              <>
                <h2 className="text-2xl font-bold text-center mb-6">회원 로그인</h2>
                <p className="text-gray-600 text-center text-sm mb-8">
                  소셜 계정으로 로그인하세요
                </p>

                <div className="mb-10">
                  <button
                    type="button"
                    className="w-full py-3 px-4 bg-yellow-400 hover:bg-yellow-500 text-black font-medium rounded flex items-center justify-center gap-2"
                  >
                    <span className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center font-bold text-xs">K</span>
                    카카오로 로그인
                  </button>
                </div>

                <div className="mt-12 space-y-2 text-gray-500 text-sm">
                  <p className="font-medium">회원가입 시 혜택:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>발표방 생성 및 관리</li>
                    <li>참여 기록 저장</li>
                    <li>발표 리포트 확인</li>
                  </ul>
                </div>
              </>
            ) : (
              <>
                <div className="text-center mb-6">
                  <div className="inline-block w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-gray-500">
                      <title>사용자 아이콘</title>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold">비회원으로 시작</h2>
                  <p className="text-gray-600 text-sm mt-2">
                    1회성 참여라면 경우<br />
                    비회원으로 간편하게 이용하세요
                  </p>
                </div>

                <form className="mt-8 space-y-4">
                  <div>
                    <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 mb-1">닉네임</label>
                    <input
                      id="nickname"
                      type="text"
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="사용할 닉네임을 입력하세요"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                    />
                  </div>
                  
                  <button
                    type="button"
                    className="w-full py-3 px-4 bg-gray-700 hover:bg-gray-800 text-white font-medium rounded-lg mt-6"
                  >
                    비회원으로 입장하기
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
