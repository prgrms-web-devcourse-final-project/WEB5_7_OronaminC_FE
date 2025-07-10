import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface FormData {
  roomName: string;
  roomDescription: string;
  presentationDate: Date;
  maxParticipants: number;
  emails: string[];
}

const CreateRoom = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [emails, setEmails] = useState<string[]>([]);
  const [currentEmail, setCurrentEmail] = useState<string>('');
  
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      roomName: '',
      roomDescription: '',
      presentationDate: new Date(),
      maxParticipants: 25,
      emails: [],
    },
  });

  const onSubmit = (data: FormData) => {
    console.log({
      ...data,
      presentationDate: selectedDate,
      emails,
    });
    // API 호출 코드 추가
  };

  const addEmail = () => {
    if (currentEmail && !emails.includes(currentEmail)) {
      setEmails([...emails, currentEmail]);
      setCurrentEmail('');
    }
  };

  const removeEmail = (emailToRemove: string) => {
    setEmails(emails.filter(email => email !== emailToRemove));
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">새로운 발표방 생성</h1>
      <p className="text-gray-500 text-sm mb-8">발표 정보를 입력하고 진행하실 수 있습니다</p>
      
      <div className="flex gap-6">
        <div className="w-1/4">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="mb-6">
              <h2 className="text-md font-semibold mb-2">세부 작성</h2>
              <ul className="text-sm space-y-2">
                <li className="flex items-center gap-2">
                  <span className="text-yellow-500">•</span> 세부 작성
                </li>
                <li className="text-gray-400 flex items-center gap-2">
                  <span>•</span> 날짜 설정
                </li>
                <li className="text-gray-400 flex items-center gap-2">
                  <span>•</span> 권한 설정
                </li>
                <li className="text-gray-400 flex items-center gap-2">
                  <span>•</span> 초대 기능
                </li>
              </ul>
            </div>
            
            <div className="mb-6">
              <h2 className="text-md font-semibold mb-2">참고 사항</h2>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• 30분 이상 무응답</li>
                <li>• 200MB 이하</li>
                <li>• 제목이 필요</li>
              </ul>
            </div>
            
            <div>
              <h2 className="text-md font-semibold mb-2">권한 설정</h2>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• 권한 부여하기</li>
                <li>• 다중 권한 설정</li>
                <li>• 일괄 권한 설정</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="w-3/4">
          <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-lg shadow-sm">
            <div className="mb-6">
              <label htmlFor="roomName" className="block text-sm font-medium mb-2">
                발표방 이름 <span className="text-red-500">*</span>
              </label>
              <input
                id="roomName"
                type="text"
                placeholder="발표 제목을 입력해주세요"
                {...register('roomName', { required: '발표방 이름은 필수입니다' })}
                className="w-full border border-gray-200 rounded p-2"
              />
              {errors.roomName && (
                <p className="text-red-500 text-xs mt-1">{errors.roomName.message}</p>
              )}
            </div>

            <div className="mb-6">
              <label htmlFor="roomDescription" className="block text-sm font-medium mb-2">
                발표 설명
              </label>
              <textarea
                id="roomDescription"
                placeholder="발표에 대한 간략한 설명을 입력해주세요"
                {...register('roomDescription')}
                className="w-full border border-gray-200 rounded p-2 h-24"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                출발 날짜 <span className="text-red-500">*</span> <span className="text-xs text-gray-400">날짜와 달력은 설정하신 날짜로 표시됩니다</span>
              </label>
              <div className="flex gap-4">
                <div className="flex-1">
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
                        dateFormat="yyyy년 MM월"
                        showMonthYearPicker
                        className="w-full border border-gray-200 rounded p-2"
                      />
                    )}
                  />
                </div>
                
                <div className="flex-2 flex-grow">
                  <div className="border border-gray-200 rounded p-4">
                    <div className="grid grid-cols-7 gap-2 text-center mb-2">
                      <div className="text-xs text-gray-500">일</div>
                      <div className="text-xs text-gray-500">월</div>
                      <div className="text-xs text-gray-500">화</div>
                      <div className="text-xs text-gray-500">수</div>
                      <div className="text-xs text-gray-500">목</div>
                      <div className="text-xs text-gray-500">금</div>
                      <div className="text-xs text-gray-500">토</div>
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                      {Array.from({ length: 31 }, (_, i) => i + 1).map(day => {
                        const isSelected = day === 4 || day === 5;
                        const isToday = day === 4;
                        return (
                          <div
                            key={day}
                            className={`
                              text-xs h-8 w-8 flex items-center justify-center rounded-full
                              ${isSelected ? 'bg-blue-100' : ''}
                              ${isToday ? 'bg-blue-500 text-white' : ''}
                            `}
                          >
                            {day}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                참여인원 설정 <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center">
                <input
                  type="number"
                  {...register('maxParticipants', { min: 1, max: 50 })}
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
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-10 text-center flex flex-col items-center justify-center">
                <div className="mb-4">
                  <svg
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mx-auto text-gray-400"
                  >
                    <path d="M3 15v4c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2v-4M17 8l-5-5-5 5M12 4v12"></path>
                  </svg>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-1">파일을 드래그하거나 클릭하여 업로드해주세요</p>
                  <p className="text-xs text-gray-400">최대 파일 크기: 200MB, 지원 형식: PPT, PDF</p>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                이메일 설정
              </label>
              <div className="flex mb-2">
                <input
                  type="email"
                  value={currentEmail}
                  onChange={(e) => setCurrentEmail(e.target.value)}
                  placeholder="이메일 아이디를 입력해주세요"
                  className="flex-grow border border-gray-200 rounded-l p-2"
                />
                <button
                  type="button"
                  onClick={addEmail}
                  className="bg-blue-500 text-white px-4 rounded-r"
                >
                  추가
                </button>
              </div>
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
