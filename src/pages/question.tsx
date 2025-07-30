
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../store/authStore";
import type { Client } from "@stomp/stompjs";

// 실제 API에서 사용하는 Question 타입
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

// 답변 타입
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
  isSubscribed: boolean;
}

export const QuestionItem = ({
  question,
  roomId,
  stompClient,
  isSubscribed,
}: QuestionItemProps) => {
  const [showAnswers, setShowAnswers] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [isReplying, setIsReplying] = useState(false);
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const formattedTime = new Date(question.createdAt).toLocaleString();

  // 답변 조회 쿼리
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

  // 답변 보기/숨기기 토글
  const toggleAnswers = () => {
    setShowAnswers(!showAnswers);
  };

  // 답변 전송
  const sendAnswer = () => {
    if (!replyContent.trim() || !stompClient || !isSubscribed || !user?.id) {
      console.log("답변 전송 조건 미충족:", {
        content: replyContent.trim(),
        stompClient: !!stompClient,
        isSubscribed,
        userId: user?.id,
      });
      return;
    }

    const answerData = {
      content: replyContent.trim(),
      memberId: user.id,
    };

    console.log(
      `[Question Item] 답변 전송: /app/rooms/${roomId}/question/${question.questionId}/answers/create`,
      answerData
    );

    try {
      stompClient.publish({
        destination: `/app/rooms/${roomId}/question/${question.questionId}/answers/create`,
        body: JSON.stringify(answerData),
      });

      // 답변 전송 후 상태 초기화
      setReplyContent("");
      setIsReplying(false);

      // 답변 목록 새로고침
      queryClient.invalidateQueries({
        queryKey: ["answers", roomId, question.questionId],
      });
    } catch (error) {
      console.error("[Question Item] 답변 전송 실패:", error);
    }
  };

  // 답변 입력 키 이벤트
  const handleAnswerKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendAnswer();
    }
  };

  return (
    <div className="border rounded-lg p-4 bg-white">
      {/* 질문 헤더 */}
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <span className="font-medium">{question.writer.nickname}</span>
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
            {question.emojiCount}
          </span>
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
            className={`mr-1 transform ${
              showAnswers ? "rotate-180" : ""
            }`}
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
          답변보기 ({answersData?.answers?.length || 0})
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
          ) : answersData?.answers && answersData.answers.length > 0 ? (
            answersData.answers.map((answer) => (
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
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-blue-500">
                      {answer.emojiCount}
                    </span>
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
                    disabled={!isSubscribed}
                  />
                </div>
                <button
                  type="button"
                  onClick={sendAnswer}
                  disabled={!isSubscribed || !replyContent.trim()}
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
