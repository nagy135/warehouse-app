import { createInstance } from 'i18next';
import { DateTime } from 'luxon';
import { initReactI18next } from 'react-i18next';
import en from './en.json';
import sk from './sk.json';

import { Languages } from './languages';

export const LANGUAGE_STORE_KEY = 'i18nLang';

export const initializeI18nInstance = () => {
  const i18nInstance = createInstance();

  const resources = {
    en: { translation: en },
    sk: { translation: sk },
  };

  i18nInstance.use(initReactI18next).init({
    compatibilityJSON: 'v3',
    resources,
    fallbackLng: Languages.SLOVAK,
    debug: true,
    keySeparator: '.',
    interpolation: {
      escapeValue: false,
      formatSeparator: ',',
    },
    react: {
      useSuspense: true,
    },
    returnNull: false,
  });

  i18nInstance.services.formatter?.add('DATE_SHORT', (value, lng) => {
    try {
      if (!lng) return value;
      if (value && DateTime.fromJSDate(new Date(value)).isValid) {
        return DateTime.fromJSDate(new Date(value))
          .setLocale(lng)
          .toLocaleString(DateTime.DATE_SHORT);
      }
      return '';
    } catch {
      return value;
    }
  });

  i18nInstance.services.formatter?.add(
    'DATETIME_SHORT_WITH_SECONDS',
    (value, lng) => {
      try {
        if (!lng) return value;
        if (value && DateTime.fromJSDate(new Date(value)).isValid) {
          return DateTime.fromJSDate(new Date(value))
            .setLocale(lng)
            .toLocaleString(DateTime.DATETIME_SHORT_WITH_SECONDS);
        }
        return '';
      } catch {
        return value;
      }
    },
  );

  return i18nInstance;
};
