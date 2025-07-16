// store/useAuth.ts
import { create } from 'zustand';

interface AuthState {
  isLoggedIn: boolean;
  userPhone: string;
  login: (phone: string) => void;
  logout: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  isLoggedIn: false,
  userPhone: '',
  login: (phone) => set({ isLoggedIn: true, userPhone: phone }),
  logout: () => set({ isLoggedIn: false, userPhone: '' }),
}));
