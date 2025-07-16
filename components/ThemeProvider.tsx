// components/ThemeProvider.tsx
'use client';

import { useEffect } from 'react';
import { useThemeStore } from '@/store/theme';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const isDark = useThemeStore((s) => s.dark);

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDark]);

  return <>{children}</>;
}
