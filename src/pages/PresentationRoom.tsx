import { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "../store/authStore";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { QuestionItem } from "./question";
import { PdfViewer } from "./pdfViewer";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

export interface Question {
  id: number;
  content: string;
  author: string;
  timestamp: Date;
  isMyQuestion: boolean;
  likes: number;
  replies: Reply[];
  showReplies: boolean;
}

interface QuestionItem {
  questionId: number;
  content: string;
  emojiCount: number;
  hasAnswer: boolean;
  isEmojied: boolean;
  writer: {
    memberId: number;
    nickname: string;
  };
  createdAt: string;
}

interface QuestionsResponse {
  questions: QuestionItem[];
}

interface Reply {
  id: number;
  content: string;
  author: string;
  timestamp: Date;
  isMyReply: boolean;
  likes: number;
}

const PresentationRoom = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [currentQuestion, setCurrentQuestion] = useState<string>("");
  const [currentReply, setCurrentReply] = useState<string>("");
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const { user } = useAuthStore();
  const [participantCount, setParticipantCount] = useState<number>(0);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const stompClientRef = useRef<Client | null>(null);

  const [activeTab, setActiveTab] = useState<
    "CREATEDAT" | "EMOJI" | "MYQUESTION"
  >("CREATEDAT");

  const {
    data: questionsData,
    isLoading: isQuestionsLoading,
    isError: isQuestionsError,
  } = useQuery<QuestionsResponse>({
    queryKey: ["questions", roomId, activeTab],
    queryFn: async () => {
      const params = new URLSearchParams({
        sort: activeTab.toUpperCase(),
        roomId: roomId || "",
        memberId: user?.id?.toString() || "", // TODO: 실제 memberId로 교체 필요
        size: "10",
      });

      const response = await fetch(`/api/rooms/${roomId}/questions?${params}`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("질문 조회 실패");
      return response.json();
    },
    enabled: !!roomId,
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const sendQuestion = () => {
    if (currentQuestion.trim() === "") return;
    // TODO: 질문 등록 API 호출
    setCurrentQuestion("");
  };

  const sendReply = () => {
    if (currentReply.trim() === "" || replyingTo === null) return;
    // TODO: 답변 등록 API 호출
    setCurrentReply("");
  };

  const toggleReplies = (questionId: number) => {
    // TODO: 답변 표시 토글 로직
    console.log('Toggle replies for question:', questionId);
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

  // 웹소켓 연결 및 방 참여
  useEffect(() => {
    if (!roomId) return;

    const connectWebSocket = () => {
      // SockJS 소켓 생성
      const socket = new SockJS("http://15.165.241.81:8080/ws", null, {
        withCredentials: true,
      });

      // STOMP 클라이언트 생성
      const stompClient = new Client({
        webSocketFactory: () => socket,
        debug: (str) => {
          console.log('STOMP Debug:', str);
        },
        onConnect: () => {
          console.log('STOMP 연결 성공');
          setIsConnected(true);

          // 발표방 참여 요청
          stompClient.publish({
            destination: `/app/rooms/${roomId}/join`,
            body: JSON.stringify({}),
          });

          // 발표방 참여자 수 구독
          stompClient.subscribe(`/topic/rooms/${roomId}/join`, (message) => {
            try {
              const data = JSON.parse(message.body);
              console.log('참여자 수 업데이트:', data);
              setParticipantCount(data.participantCount);
            } catch (error) {
              console.error('참여자 수 파싱 오류:', error);
            }
          });
        },
        onDisconnect: () => {
          console.log('STOMP 연결 해제');
          setIsConnected(false);
        },
        onStompError: (frame) => {
          console.error('STOMP 오류:', frame.headers['message']);
          console.error('세부사항:', frame.body);
        },
      });

      stompClientRef.current = stompClient;
      stompClient.activate();
    };

    connectWebSocket();

    // 컴포넌트 언마운트 시 연결 해제
    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
      }
    };
  }, [roomId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [questionsData]);

  if (isQuestionsLoading) {
    return <div>Loading...</div>;
  }

  if (isQuestionsError) {
    return <div>Error!</div>;
  }

  const filteredQuestions = questionsData?.questions || [];

  return (
    <div className="flex h-screen bg-gray-100">
      <PdfViewer roomId={roomId || ""} />

      <div className="w-1/3 h-full p-4 flex flex-col">
        {/* 연결 상태 및 참여자 수 표시 */}
        <div className="mb-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              isConnected ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            <span className="text-sm text-gray-600">
              {isConnected ? '연결됨' : '연결 중...'}
            </span>
            {participantCount > 0 && (
              <span className="text-sm text-gray-600">
                참여자: {participantCount}명
              </span>
            )}
          </div>
        </div>
        
        <div className="mb-4 flex gap-2">
          <button
            onClick={() => setActiveTab("CREATEDAT")}
            className={`flex-1 ${
              activeTab === "CREATEDAT"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700"
            } rounded py-2 text-sm cursor-pointer`}
          >
            최신순
          </button>
          <button
            onClick={() => setActiveTab("EMOJI")}
            className={`flex-1 ${
              activeTab === "EMOJI"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700"
            } rounded py-2 text-sm cursor-pointer`}
          >
            공감순
          </button>
          <button
            onClick={() => setActiveTab("MYQUESTION")}
            className={`flex-1 ${
              activeTab === "MYQUESTION"
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
              {filteredQuestions.map((question) => (
                <QuestionItem
                  key={question.questionId}
                  question={{
                    id: question.questionId,
                    content: question.content,
                    author: question.writer.nickname,
                    timestamp: new Date(question.createdAt),
                    isMyQuestion: false,
                    likes: question.emojiCount,
                    replies: [],
                    showReplies: false,
                  }}
                  toggleReplies={toggleReplies}
                  setReplyingTo={setReplyingTo}
                />
              ))}
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
