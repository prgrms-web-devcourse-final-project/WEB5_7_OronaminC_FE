import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../styles/datepicker-custom.css";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";

interface FormData {
  roomName: string;
  roomDescription: string;
  presentationDate: Date;
  maxParticipants: number;
  emails: string[];
  presentationFiles: FileList | null;
}

interface CreateRoomRequest {
  title: string;
  description: string;
  endDate: string;
  participantLimit: number;
  teamEmail: string[];
}

interface PresignedUrlRequest {
  fileName: string;
  fileType: string;
  fileSize: number;
}

interface PresignedUrlResponse {
  presignedUrl: string;
  objectKey: string;
}

const CreateRoom = () => {
  const navigate = useNavigate();

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [emails, setEmails] = useState<string[]>([]);
  const [currentEmail, setCurrentEmail] = useState<string>("");
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      roomName: "",
      roomDescription: "",
      presentationDate: new Date(),
      maxParticipants: 25,
      emails: [],
      presentationFiles: null,
    },
  });

  // 발표방 생성 mutation
  const createRoomMutation = useMutation({
    mutationFn: async (requestData: CreateRoomRequest) => {
      const response = await fetch("/api/rooms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error("발표방 생성에 실패했습니다");
      }

      return await response.json();
    },
  });

  // Presigned URL 요청 mutation
  const getPresignedUrlMutation = useMutation({
    mutationFn: async (fileData: PresignedUrlRequest) => {
      const response = await fetch("/api/documents/presigned-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(fileData),
      });

      if (response.status === 400) {
        const errorData = await response.json();
        throw new Error(errorData.message || "파일 형식 오류 또는 파일 최대 크기 초과");
      }

      if (!response.ok) {
        throw new Error("파일 업로드 URL 생성에 실패했습니다");
      }

      return await response.json() as PresignedUrlResponse;
    },
  });

  // 실제 파일 업로드 함수
  const uploadFileToS3 = async (presignedUrl: string, file: File) => {
    const response = await fetch(presignedUrl, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": file.type,
      },
    });

    if (!response.ok) {
      throw new Error("파일 업로드에 실패했습니다");
    }

    return true;
  };

  // 날짜를 yyyy-MM-dd 형식으로 포맷팅하는 함수
  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // 폼 제출 핸들러
  const onSubmit = async (data: FormData) => {
    try {
      // 1. 파일 업로드 처리
      if (uploadedFiles.length > 0) {
        for (const file of uploadedFiles) {
          try {
            // Presigned URL 요청
            const presignedUrlData = await getPresignedUrlMutation.mutateAsync({
              fileName: file.name,
              fileType: file.type,
              fileSize: file.size
            });
            
            // S3에 파일 업로드
            await uploadFileToS3(presignedUrlData.presignedUrl, file);
            
            console.log(`파일 업로드 완료: ${file.name}, 키: ${presignedUrlData.objectKey}`);
          } catch (fileError: any) {
            console.error(`파일 업로드 실패 (${file.name}):`, fileError);
            alert(`파일 업로드 실패: ${file.name}\n${fileError.message}`);
            return;
          }
        }
      }
      
      // 2. 발표방 생성 API 호출
      const formattedDate = formatDate(selectedDate);
      
      const roomData: CreateRoomRequest = {
        title: data.roomName,
        description: data.roomDescription,
        endDate: formattedDate,
        participantLimit: data.maxParticipants,
        teamEmail: emails,
      };
      
      const result = await createRoomMutation.mutateAsync(roomData);
      
      // 3. 성공 시 생성된 방으로 이동
      navigate(`/room/${result.roomId}`);
    } catch (error: any) {
      console.error("발표방 생성 중 오류:", error);
      alert(`발표방 생성에 실패했습니다.\n${error.message || '다시 시도해 주세요.'}`);
    }
  };

  // 파일 드래그 이벤트 핸들러
  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // 파일 드롭 핸들러
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  // 파일 입력 변경 핸들러
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();

    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  // 파일 처리 함수
  const handleFiles = (files: FileList) => {
    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(
      (file) =>
        file.type === "application/pdf" ||
        file.type === "application/vnd.ms-powerpoint" ||
        file.type ===
          "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    );

    if (validFiles.length !== fileArray.length) {
      alert("PPT, PDF 파일만 업로드 가능합니다.");
    }

    if (validFiles.some((file) => file.size > 200 * 1024 * 1024)) {
      alert("파일 크기는 200MB 이하만 가능합니다.");
      return;
    }

    setUploadedFiles((prevFiles) => [...prevFiles, ...validFiles]);
  };

  // 파일 삭제
  const removeFile = (index: number) => {
    setUploadedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const addEmail = () => {
    if (currentEmail && !emails.includes(currentEmail)) {
      setEmails([...emails, currentEmail]);
      setCurrentEmail("");
    }
  };

  const removeEmail = (emailToRemove: string) => {
    setEmails(emails.filter((email) => email !== emailToRemove));
  };

  return (
    <div className="mx-auto p-6 bg-gray-50 w-[100%] ">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">새로운 발표방 생성</h1>
        <p className="text-gray-500 text-sm mb-8">
          발표 정보를 입력하고 진행하실 수 있습니다
        </p>
      </div>

      <div className="flex gap-6">
        <div className="w-1/6">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="mb-6">
              <h2 className="text-md font-semibold mb-2">제목 작성 팁</h2>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• 정해지면 넣어주세요</li>
                <li>• 정해지면 넣어주세요</li>
                <li>• 정해지면 넣어주세요</li>
              </ul>
            </div>

            <div className="mb-6">
              <h2 className="text-md font-semibold mb-2">파일 업로드 설정</h2>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• 정해지면 넣어주세요</li>
                <li>• 정해지면 넣어주세요</li>
                <li>• 정해지면 넣어주세요</li>
              </ul>
            </div>

            <div>
              <h2 className="text-md font-semibold mb-2">참여인원 설정</h2>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• 정해지면 넣어주세요</li>
                <li>• 정해지면 넣어주세요</li>
                <li>• 정해지면 넣어주세요</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="w-5/6">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="bg-white p-6 rounded-lg shadow-sm"
          >
            <div className="mb-6">
              <label
                htmlFor="roomName"
                className="block text-sm font-medium mb-2"
              >
                발표 제목 <span className="text-red-500">*</span>
              </label>
              <input
                id="roomName"
                type="text"
                placeholder="발표 제목을 입력해주세요"
                {...register("roomName", {
                  required: "발표방 이름은 필수입니다",
                })}
                className="w-full border border-gray-200 rounded p-2"
              />
              {errors.roomName && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.roomName.message}
                </p>
              )}
            </div>

            <div className="mb-6">
              <label
                htmlFor="roomDescription"
                className="block text-sm font-medium mb-2"
              >
                발표 설명
              </label>
              <textarea
                id="roomDescription"
                placeholder="발표에 대한 간략한 설명을 입력해주세요"
                {...register("roomDescription")}
                className="w-full border border-gray-200 rounded p-2 h-24"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium">
                종료 날짜 <span className="text-red-500">*</span>
              </label>
              <span className="text-xs text-gray-400">
                날짜와 달력은 설정하신 날짜로 표시됩니다.
              </span>
              <div className="flex gap-4 w-full mt-2">
                <div className="flex-1 w-full max-w-md mx-auto">
                  <Controller
                    control={control}
                    name="presentationDate"
                    render={({ field }) => (
                      <DatePicker
                        selected={selectedDate}
                        onChange={(date: Date | null) => {
                          if (date) {
                            setSelectedDate(date);
                            field.onChange(date);
                          }
                        }}
                        dateFormat="MMMM yyyy"
                        inline
                        showMonthYearPicker={false}
                        showMonthDropdown={false}
                        showYearDropdown={false}
                        className="w-full border border-gray-200 rounded p-2"
                        calendarClassName="w-full"
                        dayClassName={(date) =>
                          date.getDate() === selectedDate.getDate() &&
                          date.getMonth() === selectedDate.getMonth() &&
                          date.getFullYear() === selectedDate.getFullYear()
                            ? "bg-blue-600 text-white rounded-lg"
                            : ""
                        }
                      />
                    )}
                  />
                </div>
                <div className="flex-1 flex-col">
                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-2">
                      참여인원 설정 <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center border border-gray-200 rounded-lg w-[30%]">
                        <button
                          type="button"
                          onClick={() => {
                            const currentValue = watch("maxParticipants");
                            if (currentValue > 1) {
                              setValue("maxParticipants", currentValue - 1);
                            }
                          }}
                          className="flex-none w-8 h-8 rounded-full text-center flex items-center justify-center text-gray-500 cursor-pointer"
                        >
                          <span className="text-lg">-</span>
                        </button>
                        <div className="flex-grow">
                          <input
                            type="number"
                            {...register("maxParticipants", {
                              min: 1,
                              max: 50,
                            })}
                            className="w-full text-center border-none focus:outline-none py-2 "
                            min="1"
                            max="50"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const currentValue = watch("maxParticipants");
                            if (currentValue < 50) {
                              setValue("maxParticipants", currentValue + 1);
                            }
                          }}
                          className="flex-none w-8 h-8 rounded-full text-center flex items-center justify-center text-gray-500 hover:text-gray-700 cursor-pointer"
                        >
                          <span className="text-lg">+</span>
                        </button>
                      </div>
                      <div className="text-sm">
                        <span>/</span>
                        <span className="ml-1">50명 (최대인원)</span>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-2">
                      발표자료 업로드 <span className="text-red-500">*</span>
                    </label>
                    <div
                      className={`border-2 border-dashed ${
                        dragActive
                          ? "border-blue-400 bg-blue-50"
                          : "border-gray-300"
                      } rounded-lg p-6 text-center relative`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                    >
                      <input
                        type="file"
                        id="file-upload"
                        multiple
                        accept=".pdf,.ppt,.pptx"
                        className="hidden"
                        {...register("presentationFiles")}
                        onChange={handleChange}
                      />

                      <label
                        htmlFor="file-upload"
                        className="w-full h-full cursor-pointer"
                      >
                        <div className="flex flex-col items-center justify-center p-4">
                          <svg
                            width="48"
                            height="48"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="mx-auto text-gray-400 mb-4"
                          >
                            <path d="M3 15v4c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2v-4M17 8l-5-5-5 5M12 4v12"></path>
                          </svg>
                          <p className="text-sm text-gray-500 mb-1">
                            파일을 드래그하거나{" "}
                            <span className="text-blue-500 font-medium">
                              클릭
                            </span>
                            하여 업로드해주세요
                          </p>
                          <p className="text-xs text-gray-400">
                            최대 파일 크기: 200MB, 지원 형식: PPT, PDF
                          </p>
                        </div>
                      </label>
                    </div>

                    {uploadedFiles.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium mb-2">
                          업로드된 파일 ({uploadedFiles.length})
                        </h4>
                        <ul className="space-y-2">
                          {uploadedFiles.map((file, index) => (
                            <li
                              key={index}
                              className="flex justify-between items-center bg-gray-50 p-2 rounded"
                            >
                              <div className="flex items-center">
                                <svg
                                  className="w-5 h-5 text-gray-500 mr-2"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                                  />
                                </svg>
                                <span className="text-sm truncate max-w-xs">
                                  {file.name}
                                </span>
                                <span className="text-xs text-gray-500 ml-2">
                                  ({Math.round(file.size / 1024)} KB)
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeFile(index)}
                                className="text-red-500 hover:text-red-700 cursor-pointer"
                              >
                                <svg
                                  className="w-5 h-5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M6 18L18 6M6 6l12 12"
                                  />
                                </svg>
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium">팀원 추가</label>
              <span className="mt-1 text-xs text-gray-400">
                팀원들도 발표방을 관리할 수 있습니다.
              </span>
              <section className="w-full mt-2">
                <div className="border rounded-lg overflow-hidden flex border-gray-200">
                  <div className="flex-1 px-3 py-2 flex items-center bg-white">
                    <input
                      type="email"
                      value={currentEmail}
                      onChange={(e) => setCurrentEmail(e.target.value)}
                      placeholder="이메일 아이디를 입력해주세요"
                      className="w-full focus:outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={addEmail}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 font-medium transition-colors m-1 rounded-lg cursor-pointer"
                  >
                    추가
                  </button>
                </div>

                {emails.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {emails.map((email, index) => (
                      <div
                        key={index}
                        className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full flex items-center gap-2 text-sm border border-blue-100"
                      >
                        <span>{email}</span>
                        <button
                          type="button"
                          onClick={() => removeEmail(email)}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>

            <div className="flex justify-between">
              <button
                type="button"
                className="px-6 py-2 border border-gray-300 rounded cursor-pointer"
                onClick={() => navigate("/")}
              >
                취소
              </button>
              <button
                type="submit"
                disabled={createRoomMutation.isPending || getPresignedUrlMutation.isPending}
                className={`px-6 py-2 ${createRoomMutation.isPending || getPresignedUrlMutation.isPending ? "bg-green-400" : "bg-green-600"} text-white rounded cursor-pointer`}
              >
                <div className="flex items-center">
                  {createRoomMutation.isPending || getPresignedUrlMutation.isPending ? (
                    <>
                      <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      처리 중...
                    </>
                  ) : (
                    <>
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mr-2"
                      >
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                      발표방 생성
                    </>
                  )}
                </div>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateRoom;
