import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

type ReportData = {
  roomId: number;
  title: string;
  totalView: number;
  totalQuestions: number;
  answerRate: number;
  totalEmojis: number;
  topQnA: {
    question: string;
    emojiCount: number;
    answers: string[];
  }[];
};

const PresentationReport = () => {
  const { roomId } = useParams<{ roomId: string }>();

  const {
    data: reportData,
    isLoading,
    error,
  } = useQuery<ReportData>({
    queryKey: ["presentationReport", roomId],
    queryFn: async () => {
      const response = await fetch(`/api/rooms/${roomId}/report`, {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("리포트 데이터를 가져오는데 실패했습니다");
      }
      return response.json();
    },
    enabled: !!roomId,
  });

  if (isLoading) {
    return (
      <div className="py-8 px-20 bg-gray-50 flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">리포트를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8 px-20 bg-gray-50 flex justify-center items-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">리포트를 불러오는데 실패했습니다.</p>
          <Link
            to="/mypage"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            마이페이지로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  if (!reportData) {
    return null;
  }

  return (
    <div className="py-8 px-20 bg-gray-50">
      <div className="flex flex-col mb-6">
        <div className="text-3xl font-bold mb-2">{reportData.title}</div>
        <div>
          <div className="text-sm text-gray-500">
            발표 리포트 • Room ID: {reportData.roomId}
          </div>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm flex items-center">
          <div className="bg-blue-100 p-2 rounded-full mr-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-blue-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          </div>
          <div>
            <div className="text-sm text-gray-500">총 조회수</div>
            <div className="text-2xl font-bold text-blue-600">
              {reportData.totalView}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm flex items-center">
          <div className="bg-amber-100 p-2 rounded-full mr-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-amber-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <div className="text-sm text-gray-500">총 질문수</div>
            <div className="text-2xl font-bold text-amber-600">
              {reportData.totalQuestions}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm flex items-center">
          <div className="bg-green-100 p-2 rounded-full mr-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <div className="text-sm text-gray-500">답변률</div>
            <div className="text-2xl font-bold text-green-600">
              {reportData.answerRate}%
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm flex items-center">
          <div className="bg-pink-100 p-2 rounded-full mr-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-pink-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </div>
          <div>
            <div className="text-sm text-gray-500">총 이모지</div>
            <div className="text-2xl font-bold text-pink-600">
              {reportData.totalEmojis}
            </div>
          </div>
        </div>
      </div>

      {/* 공감 많은 질문 */}
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-4">공감 많은 질문 TOP 3</h2>
        <div className="space-y-4">
          {reportData.topQnA.map((qna, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-sm overflow-hidden"
            >
              <div className="flex items-start p-4 border-b">
                <div className="bg-amber-100 rounded-full h-10 w-10 flex items-center justify-center text-amber-600 font-bold mr-3">
                  {index + 1}
                </div>
                <div className="flex-grow">
                  <div className="font-medium">{qna.question}</div>
                  <div className="text-sm text-gray-500">
                    이모지 {qna.emojiCount}
                  </div>
                </div>
              </div>
              <div className="p-4 bg-gray-50">
                {qna.answers.map((answer, answerIndex) => (
                  <div
                    key={answerIndex}
                    className="mb-3 whitespace-pre-wrap text-sm"
                  >
                    답변 {answerIndex + 1}: {answer}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center text-gray-400 text-sm mt-10 mb-4">
        이 리포트는 Q&A Live 기능에서 자동 생성되었습니다.
      </div>
    </div>
  );
};

export default PresentationReport;
