import { useState } from 'react';
import type { ReactNode } from 'react';
import { LoginModalContext } from './context';

type LoginModalProviderProps = {
  children: ReactNode;
};

const LoginModalProvider = ({ children }: LoginModalProviderProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [roomCode, setRoomCode] = useState('');
  const [type, setType] = useState<'user' | 'guest' | undefined>(undefined);

  const openModal = (code: string = '', modalType?: 'user' | 'guest') => {
    setRoomCode(code);
    setType(modalType);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <LoginModalContext.Provider value={{ isModalOpen, roomCode, type, openModal, closeModal }}>
      {children}
    </LoginModalContext.Provider>
  );
};

export default LoginModalProvider;
