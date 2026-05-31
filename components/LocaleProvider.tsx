"use client";

import React, { createContext, useContext } from 'react';
import type { Locale } from '@/i18n-config';

type LocaleContextType = {
  locale: Locale;
  dict: any;
};

const LocaleContext = createContext<LocaleContextType | null>(null);

export function LocaleProvider({
  children,
  locale,
  dict,
}: {
  children: React.ReactNode;
  locale: Locale;
  dict: any;
}) {
  return (
    <LocaleContext.Provider value={{ locale, dict }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    // Fallback for legacy routes during incremental migration
    return { locale: 'en' as Locale, dict: {} };
  }
  return context;
}
