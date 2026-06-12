import 'server-only';
import type { Locale } from '@/i18n-config';
import en from '@/dictionaries/en.json';

export type Dict = typeof en;

const dictionaries: Record<Locale, () => Promise<Dict>> = {
  en: () => import('@/dictionaries/en.json').then((module) => module.default),
  ar: () => import('@/dictionaries/ar.json').then((module) => module.default),
};

export const getDictionary = async (locale: Locale): Promise<Dict> => {
  return dictionaries[locale]?.() ?? dictionaries.en();
};
