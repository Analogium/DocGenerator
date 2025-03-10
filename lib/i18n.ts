"use client";

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translations
import translationFR from '../locales/fr/translation.json';
import translationEN from '../locales/en/translation.json';

// Translation resources
const resources = {
  fr: {
    translation: translationFR
  },
  en: {
    translation: translationEN
  }
};

// Initialize i18n instance
i18n
  // Detect browser language
  .use(LanguageDetector)
  // Pass i18n instance to react-i18next
  .use(initReactI18next)
  // Initialize i18n
  .init({
    resources,
    fallbackLng: 'fr', // Default language if detected language is not available
    debug: process.env.NODE_ENV === 'development',
    
    interpolation: {
      escapeValue: false, // Not needed for React
    },
    
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    }
  });

export default i18n;