/**
 * FarmOracle i18n Configuration
 * Multi-language support for African farmers
 */

import en from '../locales/en.json';
import sw from '../locales/sw.json';
import fr from '../locales/fr.json';

// Available languages
export const languages = {
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇬🇧'
  },
  sw: {
    code: 'sw',
    name: 'Swahili',
    nativeName: 'Kiswahili',
    flag: '🇰🇪'
  },
  fr: {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷'
  }
};

// Translation resources
export const translations = {
  en,
  sw,
  fr
};

// Default language
export const defaultLanguage = 'en';

// Get browser language
export const getBrowserLanguage = () => {
  const browserLang = navigator.language || navigator.userLanguage;
  const langCode = browserLang.split('-')[0];
  
  // Return if supported, otherwise default
  return languages[langCode] ? langCode : defaultLanguage;
};

// Get stored language preference
export const getStoredLanguage = () => {
  return localStorage.getItem('farmoracle_language') || getBrowserLanguage();
};

// Store language preference
export const setStoredLanguage = (langCode) => {
  localStorage.setItem('farmoracle_language', langCode);
};

// Simple translation function
export const translate = (key, lang = defaultLanguage, params = {}) => {
  try {
    const keys = key.split('.');
    let value = translations[lang];
    
    // Navigate through nested keys
    for (const k of keys) {
      value = value[k];
      if (value === undefined) {
        console.warn(`Translation key not found: ${key} for language: ${lang}`);
        return key;
      }
    }
    
    // Replace parameters
    if (typeof value === 'string' && Object.keys(params).length > 0) {
      Object.keys(params).forEach(param => {
        value = value.replace(`{${param}}`, params[param]);
      });
    }
    
    return value;
  } catch (error) {
    console.error(`Translation error for key: ${key}`, error);
    return key;
  }
};

// Hook for React components
export const useTranslation = (initialLang = null) => {
  const [currentLang, setCurrentLang] = React.useState(
    initialLang || getStoredLanguage()
  );
  
  const t = (key, params = {}) => translate(key, currentLang, params);
  
  const changeLanguage = (langCode) => {
    if (languages[langCode]) {
      setCurrentLang(langCode);
      setStoredLanguage(langCode);
    }
  };
  
  return { t, currentLang, changeLanguage, languages };
};

export default {
  languages,
  translations,
  defaultLanguage,
  translate,
  useTranslation,
  getBrowserLanguage,
  getStoredLanguage,
  setStoredLanguage
};
