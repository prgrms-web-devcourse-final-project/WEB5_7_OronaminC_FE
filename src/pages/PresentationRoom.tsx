import { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";

// QuestionItem 컴포넌트: 질문 및 답변을 표시합니다
interface QuestionItemProps {
  question: Question;
  toggleReplies: (questionId: number) => void;
  setReplyingTo: React.Dispatch<React.SetStateAction<number | null>>;
}

const QuestionItem: React.FC<QuestionItemProps> = ({
  question,
  toggleReplies,
  setReplyingTo,
}) => {
  const formattedTime = `${question.timestamp.getHours()}:${question.timestamp
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;

  return (
    <div className="border rounded-lg p-4 bg-white">
      {/* 질문 헤더 */}
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <span className="font-medium">{question.author}</span>
          <span className="text-xs text-gray-500">{formattedTime}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-blue-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="inline mr-1"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            {question.likes}
          </span>
        </div>
      </div>

      {/* 질문 내용 */}
      <div className="mb-3 text-gray-800">{question.content}</div>

      {/* 답변 토글 버튼 */}
      <div className="mt-2 mb-1">
        <button
          className="text-sm text-blue-500 hover:text-blue-700 flex items-center"
          onClick={() => toggleReplies(question.id)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`mr-1 transform ${
              question.showReplies ? "rotate-180" : ""
            }`}
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
          답변보기 ({question.replies.length})
        </button>
      </div>

      {/* 답변 리스트 */}
      {question.showReplies && (
        <div className="pl-4 border-l-2 border-gray-200 mt-3 space-y-2">
          {question.replies.map((reply) => (
            <div key={reply.id} className="p-2 bg-gray-50 rounded-md">
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{reply.author}</span>
                  <span className="text-xs text-gray-500">
                    {`${reply.timestamp.getHours()}:${reply.timestamp
                      .getMinutes()
                      .toString()
                      .padStart(2, "0")}`}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-blue-500">{reply.likes}</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                </div>
              </div>
              <div className="text-gray-800 text-sm">{reply.content}</div>
            </div>
          ))}

          {/* 답변 작성 버튼 */}
          <button
            className="text-sm text-blue-500 hover:text-blue-700 mt-2"
            onClick={() => setReplyingTo(question.id)}
          >
            답변 작성하기
          </button>
        </div>
      )}
    </div>
  );
};

interface Reply {
  id: number;
  content: string;
  author: string;
  timestamp: Date;
  isMyReply: boolean;
  likes: number;
}

interface Question {
  id: number;
  content: string;
  author: string;
  timestamp: Date;
  isMyQuestion: boolean;
  likes: number;
  replies: Reply[];
  showReplies: boolean;
}

interface Participant {
  id: number;
  name: string;
}

const PresentationRoom = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: 1,
      content:
        "React와 Vue.js 중 어떤 것을 선택하는 기준이 있나요?\n프로젝트 규모나 팀 구성에 따라 달라지는지 궁금합니다.",
      author: "김개발자",
      timestamp: new Date("2024-07-04T15:30:00"),
      isMyQuestion: false,
      likes: 24,
      replies: [
        {
          id: 1,
          content:
            "팀의 경험과 프로젝트 복잡도를 고려해보세요.\nReact는 대규모 앱에, Vue는 빠른 프로토타이핑에 적합합니다.",
          author: "발표자_김발표",
          timestamp: new Date("2024-07-04T15:32:00"),
          isMyReply: false,
          likes: 12,
        },
      ],
      showReplies: false,
    },
    {
      id: 2,
      content: "상능 최적화 방법 중 가장 효과적인 것은 무엇인가요?",
      author: "박개발자",
      timestamp: new Date("2024-07-04T14:24:00"),
      isMyQuestion: false,
      likes: 12,
      replies: [],
      showReplies: false,
    },
    {
      id: 3,
      content:
        "프론트엔드와 백엔드 간의 API 설계 시\n주의해야 할 점들이 있을까요?",
      author: "Guest_이밸톤",
      timestamp: new Date("2024-07-04T16:48:00"),
      isMyQuestion: false,
      likes: 8,
      replies: [
        {
          id: 2,
          content: "명확한 API 문서화와 에러 처리 방식을 일관되게 유지하세요.",
          author: "발표자_김발표",
          timestamp: new Date("2024-07-04T16:50:00"),
          isMyReply: false,
          likes: 5,
        },
        {
          id: 3,
          content: "버전 관리와 하위 호환성도 중요합니다.",
          author: "최개발자",
          timestamp: new Date("2024-07-04T16:52:00"),
          isMyReply: false,
          likes: 3,
        },
      ],
      showReplies: false,
    },
  ]);

  const [currentQuestion, setCurrentQuestion] = useState<string>("");
  const [currentReply, setCurrentReply] = useState<string>("");
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
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

  const sendQuestion = () => {
    if (currentQuestion.trim() === "") return;

    const newQuestion: Question = {
      id: questions.length + 1,
      content: currentQuestion,
      author: "나",
      timestamp: new Date(),
      isMyQuestion: true,
      likes: 0,
      replies: [],
      showReplies: false,
    };

    setQuestions([...questions, newQuestion]);
    setCurrentQuestion("");
  };

  const sendReply = () => {
    if (currentReply.trim() === "" || replyingTo === null) return;

    const updatedQuestions = questions.map((question) => {
      if (question.id === replyingTo) {
        return {
          ...question,
          replies: [
            ...question.replies,
            {
              id: question.replies.length + 1,
              content: currentReply,
              author: "나",
              timestamp: new Date(),
              isMyReply: true,
              likes: 0,
            },
          ],
        };
      }
      return question;
    });

    setQuestions(updatedQuestions);
    setCurrentReply("");
  };

  const toggleReplies = (questionId: number) => {
    const updatedQuestions = questions.map((question) => {
      if (question.id === questionId) {
        return {
          ...question,
          showReplies: !question.showReplies,
        };
      }
      return question;
    });

    setQuestions(updatedQuestions);
  };

  const handleQuestionKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendQuestion();
    }
  };

  const handleReplyKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendReply();
    }
  };

  const prevSlide = () => {
    if (activeSlideIndex > 0) {
      setActiveSlideIndex(activeSlideIndex - 1);
    }
  };

  const nextSlide = () => {
    if (activeSlideIndex < slides.length - 1) {
      setActiveSlideIndex(activeSlideIndex + 1);
    }
  };

  const renderSlideContent = () => {
    const slide = slides[activeSlideIndex];
    if (Array.isArray(slide.content)) {
      return slide.content.map((item, index) => (
        <div key={index} className="flex items-center mb-2">
          <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-2">
            {item.number}
          </div>
          <div>{item.text}</div>
        </div>
      ));
    }
    return slide.content;
  };

  useEffect(() => {
    // 스크롤을 아래로 이동
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [questions]);

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
            {/* 질문 리스트 */}
            <div className="space-y-4">
              {/* 질문 필터링 */}
              {activeTab === "recent" &&
                questions
                  .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
                  .map((question) => (
                    <QuestionItem
                      key={question.id}
                      question={question}
                      toggleReplies={toggleReplies}
                      setReplyingTo={setReplyingTo}
                    />
                  ))}

              {activeTab === "liked" &&
                questions
                  .sort((a, b) => b.likes - a.likes)
                  .map((question) => (
                    <QuestionItem
                      key={question.id}
                      question={question}
                      toggleReplies={toggleReplies}
                      setReplyingTo={setReplyingTo}
                    />
                  ))}

              {activeTab === "mine" &&
                questions
                  .filter((q) => q.isMyQuestion)
                  .map((question) => (
                    <QuestionItem
                      key={question.id}
                      question={question}
                      toggleReplies={toggleReplies}
                      setReplyingTo={setReplyingTo}
                    />
                  ))}

              {activeTab === "mine" &&
                questions.filter((q) => q.isMyQuestion).length === 0 && (
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
            </div>
            <div ref={messagesEndRef} />
          </div>

          {/* 질문 입력 영역 */}
          <div className="relative">
            <section className="w-full">
              <div className="border rounded-lg overflow-hidden flex border-gray-200">
                <div className="flex-1 px-3 py-2 flex items-center bg-white">
                  <input
                    type="text"
                    placeholder="질문을 입력해주세요"
                    className="w-full focus:outline-none"
                    value={currentQuestion}
                    onChange={(e) => setCurrentQuestion(e.target.value)}
                    onKeyPress={handleQuestionKeyPress}
                  />
                </div>
                <button
                  type="button"
                  onClick={sendQuestion}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 font-medium transition-colors m-2 rounded-lg cursor-pointer"
                >
                  전송
                </button>
              </div>
            </section>
          </div>

          {/* 답변 입력 영역 - 질문에 답변할 때만 표시 */}
          {replyingTo !== null && (
            <div className="relative mt-3">
              <section className="w-full">
                <div className="border rounded-lg overflow-hidden flex border-gray-200">
                  <div className="flex-1 px-3 py-2 flex items-center bg-white">
                    <input
                      type="text"
                      placeholder="답변을 입력해주세요"
                      className="w-full focus:outline-none"
                      value={currentReply}
                      onChange={(e) => setCurrentReply(e.target.value)}
                      onKeyPress={handleReplyKeyPress}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={sendReply}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 font-medium transition-colors m-2 rounded-lg cursor-pointer"
                  >
                    답변
                  </button>
                </div>
                <button
                  onClick={() => setReplyingTo(null)}
                  className="text-sm text-gray-500 mt-1 hover:text-gray-700"
                >
                  취소
                </button>
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PresentationRoom;
