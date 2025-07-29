import type { Dispatch, SetStateAction } from "react";
import type { Question } from "./PresentationRoom";

interface QuestionItemProps {
  question: Question;
  toggleReplies: (questionId: number) => void;
  setReplyingTo: Dispatch<SetStateAction<number | null>>;
}

export const QuestionItem = ({
  question,
  toggleReplies,
  setReplyingTo,
}: QuestionItemProps) => {
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
