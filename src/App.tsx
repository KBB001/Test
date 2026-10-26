/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header.tsx';
import { Navigation, TabKey } from './components/Navigation.tsx';
import { FeedTab } from './components/FeedTab.tsx';
import { ExploreTab } from './components/ExploreTab.tsx';
import { ChatsTab } from './components/ChatsTab.tsx';
import { MentorTab } from './components/MentorTab.tsx';
import { VocabularyTab } from './components/VocabularyTab.tsx';
import { ProfileTab } from './components/ProfileTab.tsx';

import {
  INITIAL_USER_PASSPORT,
  INITIAL_VOCABULARY,
  INITIAL_FEED_POSTS,
  INITIAL_CHAT_CONTACTS,
} from './data/mockData.ts';
import { VocabularyWord, FeedPost, LanguageCode, UserPassport } from './types/index.ts';
import { isCardDueForReview } from './utils/spacedRepetition.ts';
import { evaluateUnlockedStamps } from './utils/passport.ts';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('feed');
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>('ja');

  // Scroll to top on tab change for clean mobile & desktop UX
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [activeTab]);

  // Application Data States
  const [vocabulary, setVocabulary] = useState<VocabularyWord[]>(INITIAL_VOCABULARY);
  const [feedPosts, setFeedPosts] = useState<FeedPost[]>(INITIAL_FEED_POSTS);
  const [chatContacts] = useState(INITIAL_CHAT_CONTACTS);
  const [passport, setPassport] = useState<UserPassport>(INITIAL_USER_PASSPORT);

  // Set of saved word tokens for immediate UI reactivity
  const savedWordSet = new Set(vocabulary.map((w) => w.word));

  const handleAddWordToVocabulary = (partialWord: Partial<VocabularyWord>) => {
    if (!partialWord.word) return;

    // Check if word already exists
    if (vocabulary.some((w) => w.word.toLowerCase() === partialWord.word?.toLowerCase())) {
      return;
    }

    const newWord: VocabularyWord = {
      id: `word-${Date.now()}`,
      word: partialWord.word,
      translation: partialWord.translation || 'Перевод',
      language: partialWord.language || currentLanguage,
      cefrLevel: partialWord.cefrLevel || 'B1',
      tags: partialWord.tags || ['Новое'],
      exampleSentence: partialWord.exampleSentence,
      easeFactor: 2.5,
      intervalDays: 1,
      repetitions: 0,
      nextReviewDate: new Date().toISOString(),
      isMastered: false,
      createdAt: new Date().toISOString().split('T')[0],
    };

    const updatedVocab = [newWord, ...vocabulary];
    setVocabulary(updatedVocab);

    // Update passport stats and check for new stamp unlocks
    const totalWords = updatedVocab.length;
    const jaWords = updatedVocab.filter((w) => w.language === 'ja').length;
    const esWords = updatedVocab.filter((w) => w.language === 'es').length;
    const frWords = updatedVocab.filter((w) => w.language === 'fr').length;

    const milestones = [
      { language: 'ja' as const, wordsLearned: jaWords, conversationsHeld: 6, streakDays: passport.streakDays },
      { language: 'es' as const, wordsLearned: esWords, conversationsHeld: 4, streakDays: passport.streakDays },
      { language: 'fr' as const, wordsLearned: frWords, conversationsHeld: 2, streakDays: passport.streakDays },
    ];

    const newStamps = evaluateUnlockedStamps(
      milestones,
      passport.stamps.map((s) => s.id)
    );

    setPassport((prev) => ({
      ...prev,
      totalWordsLearned: prev.totalWordsLearned + 1,
      stamps: [...prev.stamps, ...newStamps],
    }));
  };

  const handleUpdateWord = (updatedWord: VocabularyWord) => {
    setVocabulary((prev) =>
      prev.map((w) => (w.id === updatedWord.id ? updatedWord : w))
    );
  };

  const handleAddNewPost = (newPost: FeedPost) => {
    setFeedPosts((prev) => [newPost, ...prev]);
  };

  const dueCardsCount = vocabulary.filter((w) => isCardDueForReview(w.nextReviewDate)).length;
  const unreadChatsCount = chatContacts.reduce((acc, c) => acc + (c.unreadCount || 0), 0);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Top Header */}
      <Header
        currentLanguage={currentLanguage}
        onLanguageChange={setCurrentLanguage}
        streakDays={passport.streakDays}
        totalWordsLearned={passport.totalWordsLearned}
        globalRank={passport.globalRank}
      />

      {/* Concise Tabs Navigation Bar (Desktop + Mobile) */}
      <Navigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        unreadChatsCount={unreadChatsCount}
        dueCardsCount={dueCardsCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-24 md:pb-12">
        {activeTab === 'feed' && (
          <FeedTab
            posts={feedPosts}
            onAddWordToVocabulary={handleAddWordToVocabulary}
            savedWordIds={savedWordSet}
            onAddNewPost={handleAddNewPost}
          />
        )}

        {activeTab === 'explore' && <ExploreTab />}

        {activeTab === 'chats' && (
          <ChatsTab
            contacts={chatContacts}
            onAddWordToVocabulary={handleAddWordToVocabulary}
            savedWordIds={savedWordSet}
          />
        )}

        {activeTab === 'mentor' && (
          <MentorTab
            currentLanguage={currentLanguage}
            onAddWordToVocabulary={handleAddWordToVocabulary}
            savedWordIds={savedWordSet}
          />
        )}

        {activeTab === 'vocabulary' && (
          <VocabularyTab
            words={vocabulary}
            onUpdateWord={handleUpdateWord}
            onAddWord={handleAddWordToVocabulary as any}
          />
        )}

        {activeTab === 'profile' && <ProfileTab passport={passport} />}
      </main>

      {/* Global Footer (Visible on desktop & mobile with appropriate margins) */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500 mb-16 md:mb-0">
        <p className="max-w-7xl mx-auto px-4 flex items-center justify-between flex-wrap gap-2">
          <span className="font-medium text-slate-700">LinguaGlobus — Международная платформа коммуникации & изучения языков</span>
          <span className="flex items-center gap-1 font-mono text-[11px] text-slate-500">
            Powered by Gemini Intelligence & Spaced Repetition
          </span>
        </p>
      </footer>
    </div>
  );
}
