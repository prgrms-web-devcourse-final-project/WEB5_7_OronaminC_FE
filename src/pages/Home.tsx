import { useState } from "react";
import LoginModal from "../components/LoginModal";

const Home = () => {
  const [roomCode, setRoomCode] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"user" | "guest">("guest");
  const [modalRoomCode, setModalRoomCode] = useState("");

  const openModal = (code: string, type: "user" | "guest") => {
    setModalRoomCode(code);
    setModalType(type);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalRoomCode("");
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 gap-20">
      <section className="text-center max-w-md">
        <h1 className="text-3xl font-bold mb-3">실시간 발표 질의응답</h1>
        <p className="text-gray-600">
          발표 중 실시간으로 질문을 받고 답변하세요
        </p>
      </section>

      <section className="w-full max-w-md">
        <div className="border rounded-lg overflow-hidden flex border-gray-200">
          <div className="flex-1 px-3 py-2 flex items-center bg-white">
            <input
              type="text"
              placeholder="발표방 코드를 입력하세요"
              className="w-full focus:outline-none"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
            />
          </div>
          <button
            type="button"
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 font-medium transition-colors m-2 rounded-lg cursor-pointer disabled:bg-gray-200 disabled:cursor-not-allowed"
            disabled={!roomCode.trim()}
            onClick={() => roomCode.trim() && openModal(roomCode, "guest")}
          >
            입장
          </button>
        </div>
      </section>

      <section className="w-full max-w-3xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          <div className="hidden md:block absolute top-[20px] left-[calc(16.7%+20px)] right-[calc(55%)] h-[2px] bg-gray-300 z-0">
            <div className="absolute -right-[8px] -top-[4px] w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-l-[8px] border-l-gray-300"></div>
          </div>

          <div className="hidden md:block absolute top-[20px] left-[calc(50%+30px)] right-[calc(16.7%+30px)] h-[2px] bg-gray-300 z-0">
            <div className="absolute -right-[8px] -top-[4px] w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-l-[8px] border-l-gray-300"></div>
          </div>

          <div className="text-center relative z-10">
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold mx-auto mb-4">
              1
            </div>
            <h3 className="font-bold mb-2">발표방 생성</h3>
            <p className="text-sm text-gray-500">
              새로운 발표자용을
              <br />
              개설하세요
            </p>
          </div>

          <div className="text-center relative z-10">
            <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-bold mx-auto mb-4">
              2
            </div>
            <h3 className="font-bold mb-2">코드 공유</h3>
            <p className="text-sm text-gray-500">
              생성된 코드를
              <br />
              참여자분들께 공유
            </p>
          </div>

          <div className="text-center relative z-10">
            <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center text-white font-bold mx-auto mb-4">
              3
            </div>
            <h3 className="font-bold mb-2">실시간 소통</h3>
            <p className="text-sm text-gray-500">
              손쉽게 질문으로
              <br />
              활발한 소통
            </p>
          </div>
        </div>
      </section>

      <LoginModal
        isOpen={isModalOpen}
        onClose={closeModal}
        initialRoomCode={modalRoomCode}
        type={modalType}
      />
    </div>
  );
};

export default Home;
