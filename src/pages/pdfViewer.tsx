import { useState, useEffect, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import type { RoomData } from "./PresentationRoom";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useAuthStore } from "../store/authStore";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfViewerProps {
  roomData: RoomData | undefined;
  roomId?: string;
}

export const PdfViewer = ({ roomData, roomId }: PdfViewerProps) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [pdfError, setPdfError] = useState<string | null>(null);

  const [currentEmojiCount, setCurrentEmojiCount] = useState<number>(
    roomData?.emojiCount || 0
  );
  const stompClientRef = useRef<Client | null>(null);
  const { user } = useAuthStore();

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
    setPdfError(null);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error("PDF 로드 오류:", error);
    setPdfError("PDF 파일을 로드할 수 없습니다.");
  };

  const goToPrevPage = () => {
    setPageNumber((prev) => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setPageNumber((prev) => Math.min(prev + 1, numPages || 1));
  };

  const zoomIn = () => {
    setScale((prev) => Math.min(prev + 0.2, 3.0));
  };

  const zoomOut = () => {
    setScale((prev) => Math.max(prev - 0.2, 0.5));
  };

  const sendEmoji = () => {
    console.log("stompClientRef", stompClientRef.current);
    console.log("user", user);
    console.log("roomId", roomId);
    if (!stompClientRef.current || !user?.id || !roomId) {
      return;
    }

    const emojiData = {
      targetType: "ROOM",
      targetId: parseInt(roomId),
      memberId: user.id,
    };

    try {
      stompClientRef.current.publish({
        destination: `/app/rooms/${roomId}/emojis/create`,
        body: JSON.stringify(emojiData),
      });
    } catch (error) {
      console.error("[PDF Viewer] 이모지 전송 실패:", error);
    }
  };

  useEffect(() => {
    if (!roomId) return;

    const client = new Client({
      webSocketFactory: () => new SockJS("/ws"),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        client.subscribe(`/topic/rooms/${roomId}/emojis`, (message) => {
          try {
            const emojiEvent = JSON.parse(message.body);

            if (
              emojiEvent.targetType === "ROOM" &&
              emojiEvent.targetId === parseInt(roomId)
            ) {
              setCurrentEmojiCount(emojiEvent.emojiCount);
            }
          } catch {
            alert("[PDF Viewer] 이모지 이벤트 파싱 실패");
          }
        });
      },

      onStompError: (frame) => {
        try {
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

    stompClientRef.current = client;
    client.activate();

    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
        stompClientRef.current = null;
      }
    };
  }, [roomId]);

  useEffect(() => {
    if (roomData?.emojiCount !== undefined) {
      setCurrentEmojiCount(roomData.emojiCount);
    }
  }, [roomData?.emojiCount]);

  return (
    <div className="w-2/3 p-4 flex flex-col overflow-hidden">
      <div className="flex-1 bg-white rounded-lg shadow-md p-4 flex flex-col min-h-0">
        <div className="flex-1 flex flex-col border-2 border-gray-100 rounded-lg bg-gray-50 relative overflow-hidden min-h-0">
          <div className="flex items-center justify-between p-3 bg-white border-b border-gray-200">
            <div className="flex items-center gap-2">
              <button
                onClick={goToPrevPage}
                disabled={pageNumber <= 1}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-3 py-1 rounded text-sm"
              >
                이전
              </button>
              <span className="text-sm text-gray-600">
                {pageNumber} / {numPages || 0}
              </span>
              <button
                onClick={goToNextPage}
                disabled={pageNumber >= (numPages || 0)}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-3 py-1 rounded text-sm"
              >
                다음
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={zoomOut}
                className="bg-gray-500 hover:bg-gray-600 text-white px-2 py-1 rounded text-sm"
              >
                -
              </button>
              <span className="text-sm text-gray-600 min-w-[60px] text-center">
                {Math.round(scale * 100)}%
              </span>
              <button
                onClick={zoomIn}
                className="bg-gray-500 hover:bg-gray-600 text-white px-2 py-1 rounded text-sm"
              >
                +
              </button>
            </div>
          </div>

          {/* PDF 내용 */}
          <div className="flex-grow flex items-center justify-center p-4 overflow-auto">
            {pdfError ? (
              <div className="text-center text-red-500">
                <p>{pdfError}</p>
                <p className="text-sm text-gray-500 mt-2">
                  PDF URL: {roomData?.presignedUrl}
                </p>
              </div>
            ) : roomData?.presignedUrl ? (
              <Document
                file={roomData.presignedUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                loading={
                  <div className="flex items-center justify-center">
                    <div className="text-gray-500">PDF 로딩 중...</div>
                  </div>
                }
              >
                <Page
                  pageNumber={pageNumber}
                  scale={scale}
                  loading={
                    <div className="flex items-center justify-center">
                      <div className="text-gray-500">페이지 로딩 중...</div>
                    </div>
                  }
                />
              </Document>
            ) : (
              <div className="text-center text-gray-500">
                <p>PDF 파일이 없습니다.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between bg-white p-3 mt-3 shadow-md rounded-lg flex-shrink-0">
        <div className="flex flex-col gap-1 flex-1 min-w-0">
          <span className="font-bold text-sm">발표자 : {roomData?.name}</span>
          <span className="text-xs text-gray-500 truncate">
            팀원 : {roomData?.team.join(", ")}
          </span>
          <span className="text-xs text-gray-500 truncate">
            발표 설명 : {roomData?.description}
          </span>
        </div>
        <button
          onClick={sendEmoji}
          className={`px-3 py-2 rounded-lg flex items-center gap-2 transition-colors flex-shrink-0 bg-red-500 hover:bg-red-600 text-white cursor-pointer`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="white"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-5 h-5"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          <span className="text-lg font-bold">{currentEmojiCount}</span>
        </button>
      </div>
    </div>
  );
};
