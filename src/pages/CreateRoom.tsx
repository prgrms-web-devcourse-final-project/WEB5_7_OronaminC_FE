import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../styles/datepicker-custom.css";

interface FormData {
  roomName: string;
  roomDescription: string;
  presentationDate: Date;
  maxParticipants: number;
  emails: string[];
  presentationFiles: FileList | null;
}

const CreateRoom = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [emails, setEmails] = useState<string[]>([]);
  const [currentEmail, setCurrentEmail] = useState<string>("");
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const {
    register,
    handleSubmit,
    control,
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

  const onSubmit = (data: FormData) => {
    console.log({
      ...data,
      presentationDate: selectedDate,
      emails,
      files: uploadedFiles,
    });
    // API 호출 코드 추가
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
                    <div className="flex items-center">
                      <input
                        type="number"
                        {...register("maxParticipants", { min: 1, max: 50 })}
                        className="border border-gray-200 rounded p-2 w-24"
                      />
                      <span className="mx-2">/</span>
                      <span>50명</span>
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
                                className="text-red-500 hover:text-red-700"
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
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 font-medium transition-colors m-1 rounded-lg cursor-pointer"
                  >
                    입장
                  </button>
                </div>
              </section>

              <div className="flex flex-wrap gap-2 mt-2">
                {emails.map((email, index) => (
                  <div
                    key={index}
                    className="flex items-center bg-gray-100 rounded-full px-3 py-1"
                  >
                    <span className="text-xs mr-2">{email}</span>
                    <button
                      type="button"
                      onClick={() => removeEmail(email)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </div>
                ))}
                {emails.length > 0 && (
                  <div className="flex items-center text-gray-400 text-xs">
                    <span>총 {emails.length}명</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between">
              <button
                type="button"
                className="px-6 py-2 border border-gray-300 rounded"
              >
                취소
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-green-600 text-white rounded"
              >
                <div className="flex items-center">
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
                    <path d="M12 5v14M5 12h14"></path>
                  </svg>
                  발표방 생성
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
