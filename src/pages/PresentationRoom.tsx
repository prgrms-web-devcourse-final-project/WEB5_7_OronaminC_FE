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

interface Slide {
  title: string;
  content: Array<{
    number: string;
    text: string;
  }>;
}

export interface RoomData {
  title: string;
  description: string;
  name: string;
  team: string[];
  roomCode: string;
  presignedUrl: string;
  participantCount: number;
  participantLimit: number;
  emojiCount: number;
  isHost: boolean;
  isTeamMember: boolean;
  roomStatus: "BEFORE_START" | "STARTED" | "ENDED";
  createdAt: string;
  slides?: Slide[];
}

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

interface QuestionCreateEvent {
  event: "CREATE";
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

interface AnswerCreateEvent {
  event: "CREATE";
  answerId: number;
  questionId: number;
  content: string;
  emojiCount: number;
  isEmojied: boolean;
  writer: {
    memberId: number;
    nickname: string;
  };
  createdAt: string;
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

  const [participantCount, setParticipantCount] = useState<number>(0);
  const { user } = useAuthStore();
  const stompClientRef = useRef<Client | null>(null);
  const [realTimeQuestions, setRealTimeQuestions] = useState<QuestionItem[]>(
    []
  );

  const {
    data: roomData,
    isLoading: isLoadingRoom,
    isError: isErrorRoom,
  } = useQuery<RoomData>({
    queryKey: ["room", roomId],
    queryFn: async () => {
      const response = await fetch(`/api/rooms/${roomId}`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("방 정보 조회 실패");
      return response.json();
    },
    enabled: !!roomId,
  });

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
        memberId: user?.id?.toString() || "",
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
    if (currentQuestion.trim() === "" || !stompClientRef.current || !roomId)
      return;

    try {
      const questionContent = currentQuestion.trim();

      stompClientRef.current.publish({
        destination: `/app/rooms/${roomId}/questions/create`,
        body: JSON.stringify({
          content: questionContent,
          memberId: user?.id,
        }),
      });

      setCurrentQuestion("");
    } catch {
      alert("질문 전송에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const handleQuestionKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendQuestion();
    }
  };

  useEffect(() => {
    if (!roomId) return;

    const connectWebSocket = () => {
      const socket = new SockJS("http://15.165.241.81:8080/ws");

      const stompClient = new Client({
        webSocketFactory: () => socket,

        onConnect: () => {
          stompClient.publish({
            destination: `/app/rooms/${roomId}/join`,
            body: JSON.stringify({
              memberId: user?.id,
            }),
          });

          stompClient.subscribe(`/topic/rooms/${roomId}/join`, (message) => {
            try {
              const data = JSON.parse(message.body);
              setParticipantCount(data.participantCount);
            } catch {
              alert("참여자 수 파싱 오류");
            }
          });

          stompClient.subscribe(
            `/topic/rooms/${roomId}/questions`,
            (message) => {
              try {
                const questionEvent: QuestionCreateEvent = JSON.parse(
                  message.body
                );

                if (questionEvent.event === "CREATE") {
                  const newQuestion: QuestionItem = {
                    questionId: questionEvent.questionId,
                    content: questionEvent.content,
                    emojiCount: questionEvent.emojiCount,
                    hasAnswer: questionEvent.hasAnswer,
                    isEmojied: questionEvent.isEmojied,
                    writer: questionEvent.writer,
                    createdAt: questionEvent.createdAt,
                  };

                  setRealTimeQuestions((prev) => {
                    const filteredPrev = prev.filter(
                      (q) =>
                        q.questionId !== newQuestion.questionId &&
                        q.questionId < 10000000000000
                    );
                    const updated = [newQuestion, ...filteredPrev];
                    return updated;
                  });
                }
              } catch {
                alert("질문 이벤트 파싱 오류");
              }
            }
          );

          stompClient.subscribe(`/topic/rooms/${roomId}/answers`, (message) => {
            try {
              const answerEvent: AnswerCreateEvent = JSON.parse(message.body);

              if (answerEvent.event === "CREATE") {
                setRealTimeQuestions((prev) =>
                  prev.map((q) =>
                    q.questionId === answerEvent.questionId
                      ? { ...q, hasAnswer: true }
                      : q
                  )
                );
              }
            } catch {
              alert("답변 이벤트 파싱 오류");
            }
          });
        },
        onStompError: (frame) => {
          console.error("[PresentationRoom] STOMP 오류:", frame);

          try {
            // STOMP 오류 메시지에서 JSON 파싱 시도
            const errorBody = frame.body;
            if (errorBody) {
              const errorData = JSON.parse(errorBody);
              if (errorData.message) {
                alert(`오류: ${errorData.message}`);
              }
            }
          } catch {
            alert("연결 오류가 발생했습니다.");
          }
        },
      });

      stompClientRef.current = stompClient;
      stompClient.activate();
    };

    connectWebSocket();

    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
      }
    };
  }, [roomId, user?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [questionsData]);

  if (isQuestionsLoading || isLoadingRoom) {
    return <div>Loading...</div>;
  }

  if (isQuestionsError || isErrorRoom) {
    return <div>Error!</div>;
  }

  const allQuestions = [
    ...realTimeQuestions,
    ...(questionsData?.questions || []),
  ];

  const uniqueQuestions = allQuestions.filter(
    (question, index, self) =>
      index === self.findIndex((q) => q.questionId === question.questionId)
  );

  const filteredQuestions = uniqueQuestions;

  const sortedQuestions = [...filteredQuestions].sort((a, b) => {
    if (activeTab === "EMOJI") {
      return b.emojiCount - a.emojiCount;
    }

    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="flex w-full mx-auto bg-gray-100 overflow-hidden">
      <PdfViewer
        roomData={roomData || undefined}
        roomId={roomId}
        stompClient={stompClientRef.current}
      />

      <div className="w-1/3 h-screen p-4 flex flex-col overflow-hidden">
        {/* 연결 상태 및 참여자 수 표시 */}
        <div className="mb-3 flex justify-between items-center flex-shrink-0">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-600">
              참여자: {participantCount}명 / {roomData?.participantLimit}명
              (참가 코드 : {roomData?.roomCode})
            </span>
          </div>
        </div>

        <div className="mb-3 flex gap-2 flex-shrink-0">
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
        <div className="flex-1 bg-white rounded-lg shadow-md p-4 flex flex-col min-h-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto mb-4 min-h-0">
            {/* 질문 리스트 */}
            <div className="space-y-4">
              {sortedQuestions.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  아직 질문이 없습니다.
                  <br />
                  <small>질문을 입력해주세요!</small>
                </div>
              ) : (
                sortedQuestions.map((question) => (
                  <div key={question.questionId} className="space-y-2">
                    <QuestionItem
                      question={question}
                      roomId={roomId || ""}
                      stompClient={stompClientRef.current}
                    />
                  </div>
                ))
              )}
            </div>
            <div ref={messagesEndRef} />
          </div>

          {/* 질문 입력 영역 */}
          <div className="flex-shrink-0">
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
        </div>
      </div>
    </div>
  );
};

export default PresentationRoom;
