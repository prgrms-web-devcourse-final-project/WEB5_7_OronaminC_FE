export interface LoginModalContextType {
  isModalOpen: boolean;
  roomCode: string;
  type?: "user" | "guest";
  openModal: (roomCode?: string, type?: "user" | "guest") => void;
  closeModal: () => void;
}
