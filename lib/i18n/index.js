import fr from './fr.json';
import ar from './ar.json';
import en from './en.json';

const dictionaries = { fr, ar, en };
export const locales = ['en', 'ar', 'fr'];
export const defaultLocale = 'en';
export const rtlLocales = ['ar'];

export function getDictionary(locale) {
  return dictionaries[locale] || dictionaries[defaultLocale];
}

export function isRTL(locale) {
  return rtlLocales.includes(locale);
}
