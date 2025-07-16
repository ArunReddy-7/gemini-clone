'use client';
import { create } from 'zustand';

interface ThemeStore {
  dark: boolean;
  toggle: () => void;
}

export const useThemeStore = create<ThemeStore>((set) => ({
  dark: false,
  toggle: () => set((state) => ({ dark: !state.dark })),
}));
