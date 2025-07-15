import { createContext } from 'react';
import type { LoginModalContextType } from '../types/loginModal';

export const LoginModalContext = createContext<LoginModalContextType | undefined>(undefined);
