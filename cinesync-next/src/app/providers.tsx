'use client';

import ThemeRegistry from '@/providers/ThemeRegistry/ThemeRegistry';
import { AuthProvider } from '@/app/context/AuthContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeRegistry>
      <AuthProvider>
        {children}
      </AuthProvider>
    </ThemeRegistry>
  );
}
