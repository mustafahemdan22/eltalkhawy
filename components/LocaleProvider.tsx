"use client";

import React, { createContext, useContext } from 'react';
import type { Locale } from '@/i18n-config';
import type { Dict } from '@/lib/dictionaries';

import en from '@/dictionaries/en.json';

type LocaleContextType = {
  locale: Locale;
  dict: Dict;
};

const LocaleContext = createContext<LocaleContextType | null>(null);

export function LocaleProvider({
  children,
  locale,
  dict,
}: {
  children: React.ReactNode;
  locale: Locale;
  dict: Dict;
}) {
  return (
    <LocaleContext.Provider value={{ locale, dict }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale(): LocaleContextType {
  const context = useContext(LocaleContext);
  if (!context) {
    // Fallback for legacy routes during incremental migration
    return { locale: 'en' as Locale, dict: en };
  }
  return context;
}
