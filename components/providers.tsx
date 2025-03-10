"use client";

import { ReactNode } from 'react';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/components/auth-provider';
import { Toaster } from '@/components/ui/toaster';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/lib/i18n';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <I18nextProvider i18n={i18n}>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </I18nextProvider>
    </ThemeProvider>
  );
}