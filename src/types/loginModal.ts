export interface LoginModalContextType {
  isModalOpen: boolean;
  roomCode: string;
  openModal: (roomCode?: string, type?: "user" | "guest") => void;
  closeModal: () => void;
}
