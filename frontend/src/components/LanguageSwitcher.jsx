import React, { useState, useEffect } from 'react';
import { languages, getStoredLanguage, setStoredLanguage } from '../i18n/config';

const LanguageSwitcher = ({ onLanguageChange }) => {
  const [currentLang, setCurrentLang] = useState(getStoredLanguage());
  const [isOpen, setIsOpen] = useState(false);

  const handleLanguageChange = (langCode) => {
    setCurrentLang(langCode);
    setStoredLanguage(langCode);
    setIsOpen(false);
    
    if (onLanguageChange) {
      onLanguageChange(langCode);
    }
    
    // Reload page to apply translations
    window.location.reload();
  };

  const currentLanguage = languages[currentLang];

  return (
    <div className="relative">
      {/* Language Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 backdrop-blur-md px-4 py-2 rounded-lg transition"
      >
        <span className="text-2xl">{currentLanguage.flag}</span>
        <span className="text-white font-medium hidden md:inline">
          {currentLanguage.nativeName}
        </span>
        <svg
          className={`w-4 h-4 text-white transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl z-50 overflow-hidden">
          {Object.values(languages).map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-100 transition ${
                currentLang === lang.code ? 'bg-green-50' : ''
              }`}
            >
              <span className="text-2xl">{lang.flag}</span>
              <div className="flex-1 text-left">
                <div className="font-medium text-gray-900">{lang.nativeName}</div>
                <div className="text-xs text-gray-500">{lang.name}</div>
              </div>
              {currentLang === lang.code && (
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Overlay to close dropdown */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default LanguageSwitcher;
