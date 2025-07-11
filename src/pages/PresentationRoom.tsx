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
  const [activeTab, setActiveTab] = useState<"recent" | "liked" | "mine">(
    "recent"
  );
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
        <div className="flex-grow bg-white rounded-lg shadow-md p-6 flex flex-col">
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
        </div>
        <div className="flex items-center justify-between bg-white p-4 mt-4 shadow-md rounded-lg">
          <div className="flex flex-col gap-1">
            <span className="font-bold">발표자 : 이지훈</span>
            <span className="text-sm text-gray-500">팀원 : 팀원1, 팀원2</span>
            <span className="text-sm text-gray-500">
              발표 주제 : 프론트엔드 아키텍처 발표
            </span>
          </div>
          <button className="bg-red-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors hover:bg-red-600 cursor-pointer">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="white"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            <span className="text-xl font-bold">100</span>
          </button>
        </div>
      </div>

      {/* 채팅 영역 - 오른쪽 1/3 */}
      <div className="w-1/3 h-full p-4 flex flex-col">
        <div className="mb-4 flex gap-2">
          <button
            onClick={() => setActiveTab("recent")}
            className={`flex-1 ${
              activeTab === "recent"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700"
            } rounded py-2 text-sm cursor-pointer`}
          >
            최신순
          </button>
          <button
            onClick={() => setActiveTab("liked")}
            className={`flex-1 ${
              activeTab === "liked"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700"
            } rounded py-2 text-sm cursor-pointer`}
          >
            공감순
          </button>
          <button
            onClick={() => setActiveTab("mine")}
            className={`flex-1 ${
              activeTab === "mine"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700"
            } rounded py-2 text-sm cursor-pointer`}
          >
            내 질문
          </button>
        </div>

        <div className="flex-grow bg-white rounded-lg shadow-md p-4 flex flex-col">
          <div className="flex-grow overflow-auto mb-4">
            {/* 최신순 탭 */}
            {activeTab === "recent" && (
              <>
                <h3 className="text-sm font-medium text-gray-600 mb-3">
                  최신 질문
                </h3>
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
                        {message.timestamp
                          .getMinutes()
                          .toString()
                          .padStart(2, "0")}
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
              </>
            )}

            {/* 공감순 탭 */}
            {activeTab === "liked" && (
              <>
                <h3 className="text-sm font-medium text-gray-600 mb-3">
                  공감 많은 질문
                </h3>
                {/* 임의로 좋아요 수를 정의하여 정렬 (실제로는 messages 객체에 likes 필드가 있어야 함) */}
                {[...messages]
                  .sort((a, b) => (b.id % 5) - (a.id % 5)) // 임시로 id를 이용한 정렬 (실제로는 likes 필드로 정렬해야 함)
                  .map((message) => (
                    <div
                      key={message.id}
                      className={`mb-3 flex flex-col items-start`}
                    >
                      <div className="flex items-center mb-1 justify-between w-full">
                        <div>
                          <span className="font-medium text-sm mr-2">
                            {message.sender}
                          </span>
                          <span className="text-xs text-gray-500">
                            {message.timestamp.getHours()}:
                            {message.timestamp
                              .getMinutes()
                              .toString()
                              .padStart(2, "0")}
                          </span>
                        </div>
                        <div className="text-xs text-blue-500 font-medium">
                          좋아요 {message.id % 5} {/* 임시 좋아요 수 */}
                        </div>
                      </div>
                      <div className="rounded-lg px-3 py-2 max-w-xs bg-gray-100 text-gray-800 w-full">
                        {message.content}
                      </div>
                    </div>
                  ))}
              </>
            )}

            {/* 내 질문 탭 */}
            {activeTab === "mine" && (
              <>
                <h3 className="text-sm font-medium text-gray-600 mb-3">
                  내가 작성한 질문
                </h3>
                {messages
                  .filter((message) => message.isMyMessage)
                  .map((message) => (
                    <div
                      key={message.id}
                      className="mb-3 flex flex-col items-end"
                    >
                      <div className="flex items-center mb-1">
                        <span className="text-xs text-gray-500">
                          {message.timestamp.getHours()}:
                          {message.timestamp
                            .getMinutes()
                            .toString()
                            .padStart(2, "0")}
                        </span>
                      </div>
                      <div className="rounded-lg px-3 py-2 max-w-xs bg-blue-100 text-blue-800">
                        {message.content}
                      </div>
                      <div className="flex gap-2 mt-1 text-xs">
                        <button className="text-blue-500 hover:text-blue-700">
                          수정하기
                        </button>
                        <button className="text-red-500 hover:text-red-700">
                          삭제하기
                        </button>
                      </div>
                    </div>
                  ))}
                {messages.filter((message) => message.isMyMessage).length ===
                  0 && (
                  <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-12 w-12 mb-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                    <p>작성한 질문이 없습니다</p>
                  </div>
                )}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="relative">
            <section className="w-full max-w-md">
              <div className="border rounded-lg overflow-hidden flex border-gray-200">
                <div className="flex-1 px-3 py-2 flex items-center bg-white">
                  <input
                    type="text"
                    placeholder="질문을 입력해주세요"
                    className="w-full focus:outline-none"
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                  />
                </div>
                <button
                  type="button"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 font-medium transition-colors m-2 rounded-lg cursor-pointer"
                >
                  전송
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PresentationRoom;
