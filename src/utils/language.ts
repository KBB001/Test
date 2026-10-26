import { LanguageCode, LanguageInfo } from '../types/index.ts';

export const SUPPORTED_LANGUAGES: Record<LanguageCode, LanguageInfo> = {
  ru: { code: 'ru', name: 'Русский', nativeName: 'Русский', flag: '🇷🇺', country: 'Россия' },
  en: { code: 'en', name: 'Английский', nativeName: 'English', flag: '🇬🇧', country: 'Великобритания' },
  es: { code: 'es', name: 'Испанский', nativeName: 'Español', flag: '🇪🇸', country: 'Испания' },
  ja: { code: 'ja', name: 'Японский', nativeName: '日本語', flag: '🇯🇵', country: 'Япония' },
  fr: { code: 'fr', name: 'Французский', nativeName: 'Français', flag: '🇫🇷', country: 'Франция' },
  de: { code: 'de', name: 'Немецкий', nativeName: 'Deutsch', flag: '🇩🇪', country: 'Германия' },
  zh: { code: 'zh', name: 'Китайский', nativeName: '中文', flag: '🇨🇳', country: 'Китай' },
  it: { code: 'it', name: 'Итальянский', nativeName: 'Italiano', flag: '🇮🇹', country: 'Италия' },
  ko: { code: 'ko', name: 'Корейский', nativeName: '한국어', flag: '🇰🇷', country: 'Южная Корея' },
};

export const CEFR_DESCRIPTIONS: Record<'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2', { title: string; badge: string; points: number }> = {
  A1: { title: 'Начальный (Beginner)', badge: 'A1 • Elementary', points: 100 },
  A2: { title: 'Элементарный (Pre-Intermediate)', badge: 'A2 • Waystage', points: 250 },
  B1: { title: 'Пороговый (Intermediate)', badge: 'B1 • Threshold', points: 500 },
  B2: { title: 'Продвинутый (Upper-Intermediate)', badge: 'B2 • Vantage', points: 800 },
  C1: { title: 'Профессиональный (Advanced)', badge: 'C1 • Effective', points: 1200 },
  C2: { title: 'В совершенстве (Mastery)', badge: 'C2 • Mastery', points: 2000 },
};

/**
 * Extracts potential keywords or vocabulary tokens from text
 */
export function extractVocabularyCandidates(text: string): string[] {
  if (!text || typeof text !== 'string') return [];
  // Clean punctuation and split
  const words = text
    .replace(/[.,/#!$%^&*;:{}=\-_`~()?"'«»[\]]/g, ' ')
    .split(/\s+/)
    .map(w => w.trim().toLowerCase())
    .filter(w => w.length > 3);
  
  // Return unique words
  return Array.from(new Set(words));
}

/**
 * Calculates language proficiency percentage based on words learned and CEFR scale
 */
export function calculateProficiencyScore(wordsLearned: number, practiceHours: number): {
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  progressPercent: number;
} {
  const effectiveScore = wordsLearned * 1.5 + practiceHours * 10;
  
  if (effectiveScore < 200) {
    return { level: 'A1', progressPercent: Math.min(100, Math.round((effectiveScore / 200) * 100)) };
  } else if (effectiveScore < 500) {
    return { level: 'A2', progressPercent: Math.min(100, Math.round(((effectiveScore - 200) / 300) * 100)) };
  } else if (effectiveScore < 1000) {
    return { level: 'B1', progressPercent: Math.min(100, Math.round(((effectiveScore - 500) / 500) * 100)) };
  } else if (effectiveScore < 2000) {
    return { level: 'B2', progressPercent: Math.min(100, Math.round(((effectiveScore - 1000) / 1000) * 100)) };
  } else if (effectiveScore < 3500) {
    return { level: 'C1', progressPercent: Math.min(100, Math.round(((effectiveScore - 2000) / 1500) * 100)) };
  } else {
    return { level: 'C2', progressPercent: 100 };
  }
}
