import { useState } from 'react';
import type { ReactNode } from 'react';
import { LoginModalContext } from './context';

type LoginModalProviderProps = {
  children: ReactNode;
};

const LoginModalProvider = ({ children }: LoginModalProviderProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [roomCode, setRoomCode] = useState('');

  const openModal = (code: string = '') => {
    setRoomCode(code);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <LoginModalContext.Provider value={{ isModalOpen, roomCode, openModal, closeModal }}>
      {children}
    </LoginModalContext.Provider>
  );
};

export default LoginModalProvider;
