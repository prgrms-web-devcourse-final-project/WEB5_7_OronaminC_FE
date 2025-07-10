import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

type FilterType = '전체' | '생성한 방' | '참여한 방';
type RoomStatus = '완료됨' | '진행 중' | '예정됨';

interface Room {
  id: string;
  title: string;
  status: RoomStatus;
  date: string;
  time: string;
  isCreator: boolean;
}

const MyPage = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<FilterType>('전체');
  
  // 가상의 발표방 데이터
  const [rooms] = useState<Room[]>([
    {
      id: '1',
      title: 'React 훅스 알아가기',
      status: '완료됨',
      date: '2024.07.02',
      time: '오전',
      isCreator: true,
    },
    {
      id: '2',
      title: '테이블메이어 실제 원칙',
      status: '진행 중',
      date: '2024.07.01',
      time: '저녁',
      isCreator: false,
    },
    {
      id: '3',
      title: 'JavaScript ES6+ 난개념',
      status: '예정됨',
      date: '2024.06.28',
      time: '오전',
      isCreator: true,
    }
  ]);

  const handleFilterChange = (filter: FilterType) => {
    setActiveFilter(filter);
  };

  const filteredRooms = rooms.filter(room => {
    if (activeFilter === '전체') return true;
    if (activeFilter === '생성한 방') return room.isCreator;
    if (activeFilter === '참여한 방') return !room.isCreator;
    return true;
  });

  const getStatusClassName = (status: RoomStatus) => {
    switch (status) {
      case '완료됨':
        return 'bg-green-100 text-green-800';
      case '진행 중':
        return 'bg-blue-100 text-blue-800';
      case '예정됨':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderPagination = () => {
    return (
      <div className="flex justify-center mt-6 gap-2">
        <button className="w-8 h-8 flex items-center justify-center bg-blue-500 text-white rounded-md">
          1
        </button>
        <button className="w-8 h-8 flex items-center justify-center bg-gray-200 text-gray-700 rounded-md">
          2
        </button>
        <button className="w-8 h-8 flex items-center justify-center bg-gray-200 text-gray-700 rounded-md">
          3
        </button>
      </div>
    );
  };

  const createNewRoom = () => {
    navigate('/create-room');
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h1 className="text-2xl font-bold mb-1">마이페이지</h1>
          <p className="text-gray-500 text-sm">
            사용자님의 회원님의 모든 발표방을 관리하세요
          </p>
        </div>
        <button
          onClick={createNewRoom}
          className="bg-teal-600 text-white rounded-md px-4 py-2 flex items-center"
        >
          <span className="mr-2">+</span>
          새로운 발표방 생성하기
        </button>
      </div>

      {/* 좌측 사이드바 */}
      <div className="grid grid-cols-4 gap-6 mt-6">
        <div className="col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h2 className="font-bold text-lg mb-4">참발표자</h2>
            <div className="bg-gray-100 p-4 rounded-md mb-6">
              <span className="text-sm text-gray-500">나의 발표</span>
              <div className="flex justify-between mt-2">
                <div className="text-center">
                  <div className="bg-blue-100 text-blue-700 w-16 h-16 rounded-md flex items-center justify-center text-xl font-semibold">
                    12
                  </div>
                  <div className="text-xs mt-1 text-gray-600">참여한 방</div>
                </div>
                <div className="text-center">
                  <div className="bg-green-100 text-green-700 w-16 h-16 rounded-md flex items-center justify-center text-xl font-semibold">
                    28
                  </div>
                  <div className="text-xs mt-1 text-gray-600">만든 방</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 메인 콘텐츠 */}
        <div className="col-span-3">
          <div className="mb-4 flex space-x-2">
            {(['전체', '생성한 방', '참여한 방'] as FilterType[]).map((filter) => (
              <button
                key={filter}
                onClick={() => handleFilterChange(filter)}
                className={`px-4 py-2 rounded-md ${
                  activeFilter === filter
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {filteredRooms.map((room) => (
            <div
              key={room.id}
              className="bg-white p-4 rounded-lg shadow-sm mb-4 flex justify-between items-center"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span 
                    className={`text-xs px-2 py-1 rounded ${getStatusClassName(room.status)}`}
                  >
                    {room.status}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded ${room.isCreator ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {room.isCreator ? '내가 만듦' : '참여'}
                  </span>
                </div>
                <h3 className="font-semibold text-lg">{room.title}</h3>
                <p className="text-gray-500 text-sm">
                  발표일: {room.date} • {room.time}
                </p>
              </div>
              <div className="flex gap-2">
                {room.status === '예정됨' && (
                  <button className="border border-gray-300 text-gray-700 px-4 py-1 rounded-md">
                    리포트
                  </button>
                )}
                <Link
                  to={`/room/${room.id}`}
                  className={`px-4 py-1 rounded-md ${
                    room.status === '완료됨'
                      ? 'bg-gray-200 text-gray-700'
                      : room.status === '진행 중'
                      ? 'bg-blue-500 text-white'
                      : 'border border-gray-300 text-gray-700'
                  }`}
                >
                  {room.status === '완료됨' ? '입장하기' : room.status === '진행 중' ? '입장하기' : '확인하기'}
                </Link>
              </div>
            </div>
          ))}

          {renderPagination()}
        </div>
      </div>
    </div>
  );
};

export default MyPage;
