import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../store/authStore";
import type { Client, StompSubscription } from "@stomp/stompjs";

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

interface Answer {
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

interface AnswersResponse {
  answers: Answer[];
}

interface QuestionItemProps {
  question: QuestionItem;
  roomId: string;
  stompClient: Client | null;
}

export const QuestionItem = ({
  question,
  roomId,
  stompClient,
}: QuestionItemProps) => {
  const [showAnswers, setShowAnswers] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [isReplying, setIsReplying] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(question);
  const [currentAnswers, setCurrentAnswers] = useState<Answer[]>([]);
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const formattedTime = new Date(question.createdAt).toLocaleString();

  const {
    data: answersData,
    isLoading: isAnswersLoading,
    isError: isAnswersError,
  } = useQuery<AnswersResponse>({
    queryKey: ["answers", roomId, question.questionId],
    queryFn: async () => {
      const response = await fetch(
        `/api/rooms/${roomId}/questions/${question.questionId}/answers`,
        {
          credentials: "include",
        }
      );
      if (!response.ok) {
        if (response.status === 404) {
          return { answers: [] };
        }
        throw new Error("답변 조회 실패");
      }
      return response.json();
    },
    enabled: showAnswers,
  });

  const toggleAnswers = () => {
    setShowAnswers(!showAnswers);
  };

  const sendAnswer = () => {
    if (!replyContent.trim() || !stompClient || !user?.id) {
      return;
    }

    const answerData = {
      content: replyContent.trim(),
      memberId: user.id,
    };

    try {
      stompClient.publish({
        destination: `/app/rooms/${roomId}/question/${question.questionId}/answers/create`,
        body: JSON.stringify(answerData),
      });

      setReplyContent("");
      setIsReplying(false);

      queryClient.invalidateQueries({
        queryKey: ["answers", roomId, question.questionId],
      });
    } catch (error) {
      console.error("[Question Item] 답변 전송 실패:", error);
    }
  };

  const handleAnswerKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendAnswer();
    }
  };

  const toggleQuestionEmoji = () => {
    if (!stompClient || !user?.id) {
      return;
    }

    const emojiData = {
      targetType: "QUESTION",
      targetId: currentQuestion.questionId,
      memberId: user.id,
    };

    // 현재 상태에 따라 create 또는 delete 결정
    const destination = currentQuestion.isEmojied
      ? `/app/rooms/${roomId}/emojis/delete`
      : `/app/rooms/${roomId}/emojis/create`;

    try {
      stompClient.publish({
        destination,
        body: JSON.stringify(emojiData),
      });
      
      // 이모지 전송 성공 시 즉시 로컬 상태 업데이트
      setCurrentQuestion((prev) => ({
        ...prev,
        isEmojied: !prev.isEmojied,
      }));
    } catch (error) {
      console.error("[Question Item] 질문 공감 처리 실패:", error);
      alert("공감 처리에 실패했습니다.");
    }
  };

  const toggleAnswerEmoji = (answer: Answer) => {
    if (!stompClient || !user?.id) {
      return;
    }

    const emojiData = {
      targetType: "ANSWER",
      targetId: answer.answerId,
      memberId: user.id,
    };

    // 현재 상태에 따라 create 또는 delete 결정
    const destination = answer.isEmojied
      ? `/app/rooms/${roomId}/emojis/delete`
      : `/app/rooms/${roomId}/emojis/create`;

    try {
      stompClient.publish({
        destination,
        body: JSON.stringify(emojiData),
      });
      
      // 이모지 전송 성공 시 즉시 로컬 상태 업데이트
      setCurrentAnswers((prev) =>
        prev.map((ans) =>
          ans.answerId === answer.answerId
            ? { ...ans, isEmojied: !ans.isEmojied }
            : ans
        )
      );
    } catch (error) {
      console.error("[Question Item] 답변 공감 처리 실패:", error);
      alert("공감 처리에 실패했습니다.");
    }
  };

  useEffect(() => {
    if (!stompClient) return;

    const subscriptions: StompSubscription[] = [];

    const emojiSubscription = stompClient.subscribe(
      `/topic/rooms/${roomId}/emojis`,
      (message) => {
        try {
          const emojiEvent = JSON.parse(message.body);

          if (
            emojiEvent.targetType === "QUESTION" &&
            emojiEvent.targetId === currentQuestion.questionId
          ) {
            // 이모지 카운트만 업데이트 (isEmojied는 전송 시점에 이미 업데이트됨)
            setCurrentQuestion((prev) => ({
              ...prev,
              emojiCount: emojiEvent.emojiCount,
            }));
          } else if (emojiEvent.targetType === "ANSWER") {
            // 이모지 카운트만 업데이트 (isEmojied는 전송 시점에 이미 업데이트됨)
            setCurrentAnswers((prev) =>
              prev.map((answer) =>
                answer.answerId === emojiEvent.targetId
                  ? {
                      ...answer,
                      emojiCount: emojiEvent.emojiCount,
                    }
                  : answer
              )
            );
          }
        } catch (error) {
          console.error("[Question Item] 이모지 이벤트 파싱 실패:", error);
        }
      }
    );
    subscriptions.push(emojiSubscription);

    const answerSubscription = stompClient.subscribe(
      `/topic/rooms/${roomId}/answers`,
      (message) => {
        try {
          const answerEvent = JSON.parse(message.body);

          if (
            answerEvent.event === "CREATE" &&
            answerEvent.questionId === currentQuestion.questionId
          ) {
            const newAnswer: Answer = {
              answerId: answerEvent.answerId,
              questionId: answerEvent.questionId,
              content: answerEvent.content,
              emojiCount: answerEvent.emojiCount,
              isEmojied: answerEvent.isEmojied,
              writer: answerEvent.writer,
              createdAt: answerEvent.createdAt,
            };

            setCurrentAnswers((prev) => [...prev, newAnswer]);

            setCurrentQuestion((prev) => ({
              ...prev,
              hasAnswer: true,
            }));
          }
        } catch (error) {
          console.error("[Question Item] 답변 이벤트 파싱 실패:", error);
        }
      }
    );
    subscriptions.push(answerSubscription);

    return () => {
      subscriptions.forEach((subscription) => subscription.unsubscribe());
    };
  }, [stompClient, roomId, currentQuestion.questionId, user?.id]);

  useEffect(() => {
    if (answersData?.answers) {
      setCurrentAnswers(answersData.answers);
    }
  }, [answersData]);

  useEffect(() => {
    setCurrentQuestion(question);
  }, [question]);

  // 사용자 로그인 상태가 변경될 때 답변 상태 초기화
  useEffect(() => {
    if (!user?.id) {
      setCurrentAnswers([]);
    }
  }, [user?.id]);

  return (
    <div className="border rounded-lg p-4 bg-white">
      {/* 질문 헤더 */}
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <span className="font-medium">{question.writer.nickname}</span>
          <span className="text-xs text-gray-500">{formattedTime}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleQuestionEmoji}
            className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
              currentQuestion.isEmojied
                ? "bg-blue-100 text-blue-600"
                : "text-gray-500 hover:text-blue-500 hover:bg-blue-50"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill={currentQuestion.isEmojied ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            <span className="text-sm">{currentQuestion.emojiCount}</span>
          </button>
        </div>
      </div>

      {/* 질문 내용 */}
      <div className="mb-3 text-gray-800">{question.content}</div>

      {/* 답변 토글 버튼 */}
      <div className="mt-2 mb-1">
        <button
          className="text-sm text-blue-500 hover:text-blue-700 flex items-center"
          onClick={toggleAnswers}
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
            className={`mr-1 transform ${showAnswers ? "rotate-180" : ""}`}
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
          답변보기
        </button>
      </div>

      {/* 답변 리스트 */}
      {showAnswers && (
        <div className="pl-4 border-l-2 border-gray-200 mt-3 space-y-2">
          {isAnswersLoading ? (
            <div className="text-center text-gray-500 py-2">
              답변 로딩 중...
            </div>
          ) : isAnswersError ? (
            <div className="text-center text-red-500 py-2">
              답변을 불러오는데 실패했습니다.
            </div>
          ) : currentAnswers && currentAnswers.length > 0 ? (
            currentAnswers.map((answer) => (
              <div
                key={answer.answerId}
                className="bg-white p-2 rounded border-l-4 border-blue-200"
              >
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">
                      {answer.writer.nickname}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(answer.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <button
                    onClick={() => toggleAnswerEmoji(answer)}
                    className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
                      answer.isEmojied
                        ? "bg-blue-100 text-blue-600"
                        : "text-gray-500 hover:text-blue-500 hover:bg-blue-50"
                    }`}
                  >
                    <span className="text-xs">{answer.emojiCount}</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill={answer.isEmojied ? "currentColor" : "none"}
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                  </button>
                </div>
                <div className="text-gray-800 text-sm">{answer.content}</div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 py-2">
              아직 답변이 없습니다.
            </div>
          )}

          {/* 답변 작성 버튼 */}
          {!isReplying ? (
            <button
              className="text-sm text-blue-500 hover:text-blue-700 mt-2"
              onClick={() => setIsReplying(true)}
            >
              답변 작성하기
            </button>
          ) : (
            <div className="mt-3">
              <div className="border rounded-lg overflow-hidden flex border-gray-200">
                <div className="flex-1 px-3 py-2 flex items-center bg-white">
                  <input
                    type="text"
                    placeholder="답변을 입력해주세요"
                    className="w-full focus:outline-none"
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    onKeyPress={handleAnswerKeyPress}
                  />
                </div>
                <button
                  type="button"
                  onClick={sendAnswer}
                  disabled={!replyContent.trim()}
                  className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-4 py-2 font-medium transition-colors m-2 rounded-lg cursor-pointer"
                >
                  답변
                </button>
              </div>
              <button
                onClick={() => {
                  setIsReplying(false);
                  setReplyContent("");
                }}
                className="text-sm text-gray-500 mt-1 hover:text-gray-700"
              >
                취소
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
