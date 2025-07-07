import { useState, useEffect } from 'react';
import { useCounterStore } from '../store/useCounterStore';
import { socketService } from '../api/socket';

const Home = () => {
  const { count, increment, decrement, reset } = useCounterStore();

  const [message, setMessage] = useState<string>('');
  const [receivedMessages, setReceivedMessages] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socket = socketService.connect();
    setIsConnected(true);

    socket.on('message', (data: string) => {
      setReceivedMessages((prev) => [...prev, data]);
    });

    return () => {
      socketService.disconnect();
      setIsConnected(false);
    };
  }, []);

  const handleSendMessage = () => {
    if (message.trim()) {
      socketService.emit('message', message);
      setMessage('');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-8 text-center">홈 페이지</h1>
      <p className="text-lg mb-6 text-center">
        Vite + React + TypeScript + TailwindCSS + React Router + Zustand +
        TanStack Query + WebSocket
      </p>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md mb-6">
        <h2 className="text-xl font-semibold mb-4 text-center">
          Zustand 상태 관리
        </h2>
        <div className="flex justify-center items-center gap-4">
          <button
            type="button"
            onClick={decrement}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md transition-colors"
          >
            -
          </button>
          <span className="text-2xl font-bold">{count}</span>
          <button
            type="button"
            onClick={increment}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md transition-colors"
          >
            +
          </button>
        </div>
        <div className="mt-2 text-center">
          <button
            type="button"
            onClick={reset}
            className="mt-2 bg-gray-500 hover:bg-gray-600 text-white font-bold py-1 px-2 rounded-md text-sm transition-colors"
          >
            초기화
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4 text-center">
          WebSocket 테스트
        </h2>
        <div className="mb-4">
          <p className="text-sm mb-2">
            상태:
            {isConnected ? (
              <span className="text-green-500 font-semibold">연결됨</span>
            ) : (
              <span className="text-red-500 font-semibold">연결 안됨</span>
            )}
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-1 border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              placeholder="메시지 입력"
              disabled={!isConnected}
            />
            <button
              type="button"
              onClick={handleSendMessage}
              disabled={!isConnected || !message.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              전송
            </button>
          </div>
        </div>

        <div className="border rounded-md p-3 max-h-32 overflow-y-auto bg-gray-50 dark:bg-gray-700">
          {receivedMessages.length > 0 ? (
            <ul>
              {receivedMessages.map((msg, index) => (
                <li
                  key={`msg-${index}-${msg.substring(0, 10)}`}
                  className="text-sm py-1 border-b last:border-b-0 dark:border-gray-600"
                >
                  {msg}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">
              수신된 메시지가 없습니다.
              <br />
              <span className="text-xs">(백엔드 웹소켓 서버가 필요합니다)</span>
            </p>
          )}
        </div>
      </div>

      <p className="mt-6 text-sm text-gray-500 dark:text-gray-400 text-center">
        환경 설정이 완료되었습니다.
        <code className="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded">
          src/pages
        </code>
        디렉토리에서 개발을 시작하세요.
      </p>
    </div>
  );
};

export default Home;
