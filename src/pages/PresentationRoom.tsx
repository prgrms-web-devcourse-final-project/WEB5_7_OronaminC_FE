import { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";

interface Message {
  id: number;
  content: string;
  sender: string;
  timestamp: Date;
  isMyMessage: boolean;
}

interface Participant {
  id: number;
  name: string;
}

const PresentationRoom = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      content: "React의 Vite.js 주요 기능은 무엇인가요?",
      sender: "Guest123",
      timestamp: new Date(),
      isMyMessage: false,
    },
    {
      id: 2,
      content: "빠른 개발과 핫 리로딩 기능 때문이라고 생각합니다!",
      sender: "나",
      timestamp: new Date(),
      isMyMessage: true,
    },
    {
      id: 3,
      content: "또한 번들링 없이 개발 서버를 실행할 수 있어요.",
      sender: "Guest456",
      timestamp: new Date(),
      isMyMessage: false,
    },
  ]);

  const [currentMessage, setCurrentMessage] = useState<string>("");
  const [participants, setParticipants] = useState<Participant[]>([
    { id: 1, name: "발표자" },
    { id: 2, name: "참가자1" },
    { id: 3, name: "참가자2" },
    { id: 4, name: "참가자3" },
  ]);

  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const slides = [
    {
      title: "목차 안내",
      content: [
        { number: "01", text: "프로젝트 소개" },
        { number: "02", text: "프로젝트 구조" },
        { number: "03", text: "주요 기능 설명" },
        { number: "04", text: "서비스 시연" },
        { number: "05", text: "학습 분석" },
        { number: "06", text: "개선점과 향후 가능성" },
        { number: "07", text: "토의/질문" },
      ],
      image: "기타와 악보가 있는 이미지",
    },
    {
      title: "프로젝트 소개",
      content: "프로젝트에 대한 상세한 설명입니다...",
    },
    {
      title: "프로젝트 구조",
      content: "프로젝트의 구조와 아키텍처에 대한 설명입니다...",
    },
  ];

  const sendMessage = () => {
    if (currentMessage.trim() === "") return;

    const newMessage: Message = {
      id: messages.length + 1,
      content: currentMessage,
      sender: "나",
      timestamp: new Date(),
      isMyMessage: true,
    };

    setMessages([...messages, newMessage]);
    setCurrentMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const nextSlide = () => {
    if (activeSlideIndex < slides.length - 1) {
      setActiveSlideIndex(activeSlideIndex + 1);
    }
  };

  const prevSlide = () => {
    if (activeSlideIndex > 0) {
      setActiveSlideIndex(activeSlideIndex - 1);
    }
  };

  useEffect(() => {
    // 메시지가 추가될 때마다 스크롤을 아래로 이동
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* 발표 영역 - 왼쪽 2/3 */}
      <div className="w-2/3 h-full p-4 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold">프론트엔드 아키텍처 발표</h1>
          <div className="flex items-center">
            <span className="mr-2 text-sm">참가자: 41 / 50</span>
            <button className="bg-red-500 text-white px-3 py-1 rounded text-sm">
              나가기
            </button>
          </div>
        </div>

        <div className="flex-grow bg-white rounded-lg shadow-md p-6 flex flex-col">
          <div className="mb-4 flex justify-between items-center">
            <div className="text-sm text-gray-500">발표: {roomId}</div>
            <div className="text-sm">
              슬라이드 {activeSlideIndex + 1} / {slides.length}
            </div>
          </div>

          <div className="flex-grow flex items-center justify-center border-2 border-gray-100 rounded-lg p-4 bg-gray-50 relative">
            {activeSlideIndex === 0 && (
              <div className="w-full h-full flex flex-col items-center justify-center relative">
                <div className="absolute top-0 left-0 w-full h-full">
                  <div className="absolute top-0 left-0 w-1/3 h-full bg-orange-400 rounded-br-[200px]"></div>
                  <div className="absolute bottom-0 right-0 w-1/3 h-1/2 bg-blue-400 rounded-tl-[100px]"></div>
                </div>

                <div className="z-10 w-full max-w-2xl">
                  <h2 className="text-3xl font-bold mb-10 text-center">
                    목차 안내
                  </h2>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      {slides[0].content
                        .slice(0, 4)
                        .map((item: { number: string; text: string }) => (
                          <div
                            key={item.number}
                            className="mb-4 flex items-center"
                          >
                            <div className="text-blue-500 font-semibold mr-3">
                              {item.number}.
                            </div>
                            <div className="text-gray-800">{item.text}</div>
                          </div>
                        ))}
                    </div>
                    <div>
                      {slides[0].content
                        .slice(4)
                        .map((item: { number: string; text: string }) => (
                          <div
                            key={item.number}
                            className="mb-4 flex items-center"
                          >
                            <div className="text-blue-500 font-semibold mr-3">
                              {item.number}.
                            </div>
                            <div className="text-gray-800">{item.text}</div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>

                {/* 이미지 요소 (기타와 악보) */}
                <div className="absolute bottom-0 right-0 w-1/3">
                  <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                    <circle
                      cx="150"
                      cy="100"
                      r="50"
                      fill="#3B82F6"
                      opacity="0.7"
                    />
                  </svg>
                </div>
              </div>
            )}

            {activeSlideIndex === 1 && (
              <div className="w-full h-full flex flex-col items-center justify-center">
                <h2 className="text-3xl font-bold mb-6">{slides[1].title}</h2>
                {/* <p className="text-center max-w-xl">{slides[1].content}</p> */}
              </div>
            )}

            {activeSlideIndex === 2 && (
              <div className="w-full h-full flex flex-col items-center justify-center">
                <h2 className="text-3xl font-bold mb-6">{slides[2].title}</h2>
                {/* <p className="text-center max-w-xl">{slides[2].content}</p> */}
              </div>
            )}

            {/* 슬라이드 네비게이션 버튼 */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
              <button
                onClick={prevSlide}
                className="bg-gray-200 hover:bg-gray-300 rounded-full p-2"
                disabled={activeSlideIndex === 0}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <button
                onClick={nextSlide}
                className="bg-gray-200 hover:bg-gray-300 rounded-full p-2"
                disabled={activeSlideIndex === slides.length - 1}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div className="mt-4 flex justify-between">
            <div className="flex gap-2">
              <button className="bg-gray-200 hover:bg-gray-300 rounded px-3 py-1 text-sm flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                화면 공유
              </button>
              <button className="bg-gray-200 hover:bg-gray-300 rounded px-3 py-1 text-sm flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                  />
                </svg>
                음소거
              </button>
              <button className="bg-gray-200 hover:bg-gray-300 rounded px-3 py-1 text-sm flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                카메라
              </button>
            </div>
            <div>
              <button className="bg-blue-500 text-white rounded px-3 py-1 text-sm">
                발표자 모드
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 채팅 영역 - 오른쪽 1/3 */}
      <div className="w-1/3 h-full p-4 flex flex-col">
        <div className="mb-4 flex gap-2">
          <button className="flex-1 bg-gray-200 text-gray-700 rounded py-2 text-sm">
            참석자
          </button>
          <button className="flex-1 bg-blue-500 text-white rounded py-2 text-sm">
            채팅
          </button>
          <button className="flex-1 bg-gray-200 text-gray-700 rounded py-2 text-sm">
            내 화면
          </button>
          <div className="flex items-center justify-center px-2">
            <span className="font-mono text-sm">Q/A</span>
          </div>
        </div>

        <div className="flex-grow bg-white rounded-lg shadow-md p-4 flex flex-col">
          <div className="flex-grow overflow-auto mb-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`mb-3 ${
                  message.isMyMessage
                    ? "flex flex-col items-end"
                    : "flex flex-col items-start"
                }`}
              >
                <div className="flex items-center mb-1">
                  {!message.isMyMessage && (
                    <span className="font-medium text-sm mr-2">
                      {message.sender}
                    </span>
                  )}
                  <span className="text-xs text-gray-500">
                    {message.timestamp.getHours()}:
                    {message.timestamp.getMinutes().toString().padStart(2, "0")}
                  </span>
                </div>
                <div
                  className={`rounded-lg px-3 py-2 max-w-xs ${
                    message.isMyMessage
                      ? "bg-blue-100 text-blue-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="relative">
            <textarea
              className="w-full border border-gray-300 rounded-lg pl-3 pr-10 py-2 focus:outline-none focus:border-blue-400 resize-none"
              placeholder="메시지 입력..."
              rows={2}
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <button
              className="absolute right-2 bottom-2 text-blue-500 hover:text-blue-700"
              onClick={sendMessage}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PresentationRoom;
