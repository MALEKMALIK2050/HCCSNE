import '@/styles/globals.css';
import { useState, useEffect, createContext, useContext } from 'react';
import { getDictionary, isRTL, defaultLocale } from '@/lib/i18n';

export const LocaleContext = createContext();
export const useLocale = () => useContext(LocaleContext);

export default function App({ Component, pageProps }) {
  const [locale, setLocale] = useState(defaultLocale);
  const t = getDictionary(locale);
  const dir = isRTL(locale) ? 'rtl' : 'ltr';

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.dir = dir;
      document.documentElement.lang = locale;
      document.body.dir = dir;
    }
  }, [dir, locale]);

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t, dir }}>
      <div dir={dir} lang={locale}>
        <Component {...pageProps} />
      </div>
    </LocaleContext.Provider>
  );
}

