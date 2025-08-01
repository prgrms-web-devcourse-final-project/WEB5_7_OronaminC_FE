import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";

type FilterType = "전체" | "생성한 방" | "참여한 방";
type RoomStatus = "BEFORE_START" | "STARTED" | "ENDED";
type ParticipationType = "CREATED" | "JOINED";

interface Room {
  emojiCount: number;
  participationType: ParticipationType;
  questions: number;
  roomId: number;
  startedAt: string;
  status: RoomStatus;
  title: string;
}

const MyPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeFilter, setActiveFilter] = useState<FilterType>("전체");
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState<number | null>(null);
  const pageSize = 10;

  const { data: userInfo } = useQuery({
    queryKey: ["userInfo"],
    queryFn: async () => {
      const response = await fetch("/api/members/me", {
        credentials: "include",
      });
      if (!response.ok) throw new Error("회원 정보 조회 실패");
      return response.json();
    },
    staleTime: 0,
    gcTime: 0,
  });

  console.log(activeFilter);

  const { data: roomsData } = useQuery({
    queryKey: ["rooms", activeFilter, currentPage],
    queryFn: async () => {
      const typeParam =
        activeFilter === "전체"
          ? "ALL"
          : activeFilter === "생성한 방"
          ? "CREATED"
          : "JOINED";

      const response = await fetch(
        `/api/members/rooms?type=${typeParam}&page=${currentPage}&size=${pageSize}`,
        {
          credentials: "include",
        }
      );
      if (!response.ok) throw new Error("발표방 목록 조회 실패");
      return response.json();
    },
    staleTime: 0,
    gcTime: 0,
  });

  const rooms = roomsData?.content || [];
  const totalPages = roomsData?.totalPages || 0;
  const totalElements = roomsData?.totalElements || 0;

  const handleFilterChange = (filter: FilterType) => {
    setActiveFilter(filter);
    setCurrentPage(0);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getStatusClassName = (status: RoomStatus) => {
    switch (status) {
      case "BEFORE_START":
        return "bg-green-100 text-green-800";
      case "STARTED":
        return "bg-blue-100 text-blue-800";
      case "ENDED":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex justify-center mt-6 gap-2">
        {Array.from({ length: totalPages }, (_, i) => i).map((page) => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={`w-8 h-8 flex items-center cursor-pointer justify-center rounded-md ${
              page === currentPage
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {page + 1}
          </button>
        ))}
      </div>
    );
  };

  const createNewRoom = () => {
    navigate("/create-room");
  };

  const handleDeleteClick = (roomId: number) => {
    setRoomToDelete(roomId);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!roomToDelete) return;

    try {
      const response = await fetch(`/api/rooms/${roomToDelete}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.status === 204) {
        // 성공 시 방 목록 다시 조회
        queryClient.invalidateQueries({ queryKey: ["rooms"] });
        setShowDeleteModal(false);
        setRoomToDelete(null);
      } else {
        alert("방 삭제에 실패했습니다.");
      }
    } catch (error) {
      console.error("방 삭제 오류:", error);
      alert("방 삭제 중 오류가 발생했습니다.");
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setRoomToDelete(null);
  };

  if (!userInfo) return null;

  return (
    <div className="w-full mx-auto p-6">
      <div className="flex gap-6">
        <div className="w-1/5">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="rounded-md mb-8">
              <span className="text-lg font-bold">
                {userInfo.nickname}님의 활동
              </span>
              <div className="flex justify-between mt-4 gap-2">
                <div className="text-center w-1/2">
                  <div className="flex flex-col bg-blue-100 text-blue-700 h-20 rounded-md flex items-center justify-center text-xl font-semibold">
                    <span className="text-xl font-semibold">
                      {userInfo.joinedRoomCount}
                    </span>
                    <span className="text-xs font-medium">참여한 방</span>
                  </div>
                </div>
                <div className="text-center w-1/2">
                  <div className="flex flex-col bg-green-100 text-green-700 h-20 rounded-md flex items-center justify-center text-xl font-semibold">
                    <span className="text-xl font-semibold">
                      {userInfo.createdRoomCount}
                    </span>
                    <span className="text-xs font-medium">만든 방</span>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={createNewRoom}
              className="w-full bg-blue-500 text-white rounded-md px-4 py-2 flex justify-center items-center mt-4 cursor-pointer hover:bg-blue-600"
            >
              <span className="mr-2">+</span>
              새로운 발표방 생성하기
            </button>
          </div>
        </div>
        <div className="w-4/5 p-4 bg-white rounded-lg shadow-sm h-[calc(100vh-200px)] overflow-y-auto">
          <div className="flex justify-between items-center mb-2 w-full">
            <div>
              <h1 className="text-2xl font-bold mb-1">마이페이지</h1>
              <div className="text-sm text-gray-600 mb-4">
                총 {totalElements}개의 발표방이 있습니다.
              </div>
            </div>
          </div>

          {/* 좌측 사이드바 */}
          <div className=" gap-6 mt-6 w-full">
            {/* 메인 콘텐츠 */}
            <div className="col-span-3">
              <div className="mb-4 flex space-x-2">
                {(["전체", "생성한 방", "참여한 방"] as FilterType[]).map(
                  (filter) => (
                    <button
                      key={filter}
                      onClick={() => handleFilterChange(filter)}
                      className={`px-4 py-2 rounded-md cursor-pointer ${
                        activeFilter === filter
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {filter}
                    </button>
                  )
                )}
              </div>

              {rooms.map((room: Room) => (
                <div
                  key={room.roomId}
                  className="bg-white p-4 rounded-lg shadow-sm mb-4 flex justify-between items-center"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-xs px-2 py-1 rounded ${getStatusClassName(
                          room.status
                        )}`}
                      >
                        {room.status === "BEFORE_START"
                          ? "예정"
                          : room.status === "STARTED"
                          ? "진행중"
                          : "종료"}
                      </span>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          room.participationType === "CREATED"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {room.participationType === "CREATED" ? "생성" : "참여"}
                      </span>
                    </div>
                    <h3 className="font-semibold text-lg">{room.title}</h3>
                    <div className="flex gap-2">
                      <p className="text-gray-500 text-sm">
                        좋아요: {room.emojiCount}
                      </p>
                      <p className="text-gray-500 text-sm">
                        질문: {room.questions}
                      </p>
                      <p className="text-gray-500 text-sm">
                        {room.participationType === "CREATED"
                          ? "생성일"
                          : "참여일"}
                        : {room.startedAt}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {room.status === "ENDED" &&
                      room.participationType === "CREATED" && (
                        <>
                          <button
                            onClick={() =>
                              navigate(`/room/${room.roomId}/report`)
                            }
                            className="border border-gray-300 text-blue-700 bg-blue-100 hover:bg-blue-200 border-blue-200 cursor-pointer px-4 py-1 rounded-md"
                          >
                            리포트
                          </button>
                          <button
                            onClick={() => handleDeleteClick(room.roomId)}
                            className="border border-gray-300 text-red-700 bg-red-100 hover:bg-red-200 border-red-200 cursor-pointer px-4 py-1 rounded-md"
                          >
                            삭제
                          </button>
                        </>
                      )}
                    {(room.status === "BEFORE_START" ||
                      room.status === "STARTED") && (
                      <Link
                        to={`/room/${room.roomId}`}
                        className={`px-4 py-1 rounded-md ${
                          room.status === "BEFORE_START"
                            ? "bg-gray-200 text-gray-700 hover:bg-gray-300 cursor-pointer"
                            : "bg-blue-500 text-white hover:bg-blue-600 cursor-pointer"
                        }`}
                      >
                        입장하기
                      </Link>
                    )}
                  </div>
                </div>
              ))}

              {renderPagination()}
            </div>
          </div>
        </div>
      </div>

      {/* 삭제 확인 모달 */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 shadow-lg border-gray-200">
            <h3 className="text-lg font-semibold mb-4">방 삭제 확인</h3>
            <p className="text-gray-600 mb-6">
              정말로 이 방을 삭제하시겠습니까?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleDeleteCancel}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 cursor-pointer"
              >
                취소
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 cursor-pointer"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyPage;
