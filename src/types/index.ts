export type LanguageCode = 'en' | 'es' | 'ja' | 'fr' | 'de' | 'zh' | 'ru' | 'it' | 'ko';

export interface LanguageInfo {
  code: LanguageCode;
  name: string;
  nativeName: string;
  flag: string;
  country: string;
}

export interface VocabularyWord {
  id: string;
  word: string;
  translation: string;
  language: LanguageCode;
  transcription?: string;
  partOfSpeech?: string;
  exampleSentence?: string;
  exampleTranslation?: string;
  cefrLevel: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  tags: string[];
  easeFactor: number; // For spaced repetition (default ~2.5)
  intervalDays: number;
  repetitions: number;
  nextReviewDate: string; // ISO date string
  isMastered: boolean;
  createdAt: string;
}

export interface FeedPost {
  id: string;
  author: {
    name: string;
    handle: string;
    avatar: string;
    country: string;
    flag: string;
    nativeLang: LanguageCode;
    learningLang: LanguageCode;
    fluencyLevel: string;
  };
  content: string;
  translatedContent?: string;
  originalLanguage: LanguageCode;
  image?: string;
  audioVoice?: string;
  tags: string[];
  likesCount: number;
  commentsCount: number;
  timestamp: string;
  keyWords: Array<{ word: string; translation: string }>;
  isLiked?: boolean;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  avatar: string;
  text: string;
  translatedText?: string;
  language: LanguageCode;
  timestamp: string;
  isMe: boolean;
  keyWords?: Array<{ word: string; translation: string }>;
}

export interface ChatContact {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  country: string;
  flag: string;
  city: string;
  nativeLanguage: LanguageCode;
  learningLanguage: LanguageCode;
  isOnline: boolean;
  lastActive: string;
  unreadCount: number;
  messages: ChatMessage[];
}

export interface AIMentorMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  thinkingProcess?: string;
  vocabulary: Array<{
    word: string;
    translation: string;
    cefrLevel: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
    nuance: string;
  }>;
  audioUrl?: string;
  timestamp: string;
}

export interface PassportStamp {
  id: string;
  language: LanguageCode;
  city: string;
  country: string;
  title: string;
  description: string;
  cefrLevel: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  dateAwarded: string;
  stampDesign: 'circular' | 'hexagonal' | 'crest' | 'oval';
  primaryColor: string;
  iconName: string;
}

export interface LanguageProgress {
  language: LanguageCode;
  name: string;
  flag: string;
  cefrLevel: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  wordsLearned: number;
  targetWords: number;
  fluencyPercent: number;
  practiceHours: number;
  activeStreak: number;
}

export interface UserPassport {
  passportNumber: string;
  holderName: string;
  holderHandle: string;
  avatarUrl: string;
  nationality: string;
  countryCode: string;
  issuedCity: string;
  issuedDate: string;
  expiryDate: string;
  stamps: PassportStamp[];
  languages: LanguageProgress[];
  totalWordsLearned: number;
  totalConversations: number;
  globalRank: number;
  streakDays: number;
}
