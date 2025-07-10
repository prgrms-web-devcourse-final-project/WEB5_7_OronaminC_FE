import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';

type Question = {
  id: number;
  rank: number;
  content: string;
  likes: number;
  answers: {
    id: number;
    content: string;
  }[];
}

const PresentationReport = () => {
  // roomId를 사용하여 실제 API 호출 시 사용할 수 있습니다.
  const { roomId } = useParams<{ roomId: string }>();
  console.log(`Report for presentation room: ${roomId}`);

  
  const [reportData] = useState<{
    title: string;
    subtitle: string;
    date: string;
    time: string;
    presenter: string;
    stats: {
      participants: number;
      questions: number;
      satisfaction: number;
      likes: number;
    };
    topQuestions: Question[];
  }>({
    title: '발표 리포트',
    subtitle: '프론트엔드 개발 트렌드 2025',
    date: '2025.07.01',
    time: '오후 2:17',
    presenter: '김개발',
    stats: {
      participants: 41,
      questions: 29,
      satisfaction: 78,
      likes: 19,
    },
    topQuestions: [
      {
        id: 1,
        rank: 1,
        content: 'React 18의 새로운 기능 중에서 가장 주목할 만한 것은 무엇인가요?',
        likes: 47,
        answers: [
          {
            id: 1,
            content: '답변 1:\n새로운 18에서 가장 주목할 만한 기능은 Concurrent Features입니다. 특히 Suspense의 확장과 Automatic Batching 기능이 많은 향상이 될 것 같습니다.'
          },
          {
            id: 2,
            content: '답변 2:\nuseTransition과 useDeferredValue 등도 매우 유용합니다. 사용자 경험을 크게 개선시킬 수 있어요.'
          }
        ]
      },
      {
        id: 2,
        rank: 2,
        content: 'Next.js 13의 App Router와 기존 Pages Router의 차이점을 설명해주세요.',
        likes: 34,
        answers: [
          {
            id: 1,
            content: '답변 1:\nApp Router는 React Server Components를 활용하여 더 나은 성능과 개발자 경험을 제공합니다.'
          },
          {
            id: 2,
            content: '답변 2:\n파일 기반 라우팅이 더욱 직관적으로 개선되었고, 레이아웃 시스템이 발전되었습니다.'
          },
          {
            id: 3,
            content: '답변 3:\n서버와 클라이언트 컴포넌트를 자연스럽게 쉽게 구분하였고, Server Actions도 매우 유용합니다.'
          }
        ]
      },
      {
        id: 3,
        rank: 3,
        content: 'TypeScript와 JavaScript 중 어떤 것을 선택해야 하나요?',
        likes: 28,
        answers: [
          {
            id: 1,
            content: '답변:\n팀의 규모와 구조에 달려있어 간단히 말하긴 힘들지만, 큰 규모 프로젝트라면 TypeScript를 추천합니다.\n디버그 단계에서 재질지 않고, 공식화 코드 작성에서 강점이 있습니다.'
          }
        ]
      }
    ]
  });

  return (
    <div className="max-w-5xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* 상단 헤더 */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">{reportData.title}</h1>
          <div className="text-sm text-gray-500">
            {reportData.subtitle} • {reportData.date} • {reportData.time} • {reportData.presenter}
          </div>
        </div>
        <Link to="/mypage" className="flex items-center text-gray-500 text-sm">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          돌아가기
        </Link>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm flex items-center">
          <div className="bg-blue-100 p-2 rounded-full mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <div>
            <div className="text-sm text-gray-500">총 참여자</div>
            <div className="text-2xl font-bold text-blue-600">{reportData.stats.participants}</div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm flex items-center">
          <div className="bg-amber-100 p-2 rounded-full mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <div className="text-sm text-gray-500">발표 질의</div>
            <div className="text-2xl font-bold text-amber-600">{reportData.stats.questions}</div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm flex items-center">
          <div className="bg-green-100 p-2 rounded-full mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <div className="text-sm text-gray-500">만족도</div>
            <div className="text-2xl font-bold text-green-600">{reportData.stats.satisfaction}%</div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm flex items-center">
          <div className="bg-pink-100 p-2 rounded-full mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <div>
            <div className="text-sm text-gray-500">좋아요</div>
            <div className="text-2xl font-bold text-pink-600">{reportData.stats.likes}</div>
          </div>
        </div>
      </div>

      {/* 공감 많은 질문 */}
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-4">공감 많은 질문 TOP 3</h2>
        <div className="space-y-4">
          {reportData.topQuestions.map((question) => (
            <div key={question.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="flex items-start p-4 border-b">
                <div className="bg-amber-100 rounded-full h-10 w-10 flex items-center justify-center text-amber-600 font-bold mr-3">
                  {question.rank}
                </div>
                <div className="flex-grow">
                  <div className="font-medium">{question.content}</div>
                  <div className="text-sm text-gray-500">공감 {question.likes}</div>
                </div>
              </div>
              <div className="p-4 bg-gray-50">
                {question.answers.map((answer) => (
                  <div key={answer.id} className="mb-3 whitespace-pre-wrap text-sm">
                    {answer.content}
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
