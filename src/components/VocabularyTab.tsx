import React, { useState } from 'react';
import { 
  BookMarked, 
  RotateCw, 
  Volume2, 
  Plus, 
  Sparkles, 
  Check, 
  Search, 
  Layers 
} from 'lucide-react';
import { VocabularyWord, LanguageCode } from '../types/index.ts';
import { SUPPORTED_LANGUAGES, CEFR_DESCRIPTIONS } from '../utils/language.ts';
import { calculateNextReview, isCardDueForReview, ReviewRating } from '../utils/spacedRepetition.ts';
import { playTextToSpeech } from '../utils/audio.ts';

interface VocabularyTabProps {
  words: VocabularyWord[];
  onUpdateWord: (word: VocabularyWord) => void;
  onAddWord: (word: VocabularyWord) => void;
}

export const VocabularyTab: React.FC<VocabularyTabProps> = ({
  words,
  onUpdateWord,
  onAddWord,
}) => {
  const [selectedLang, setSelectedLang] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCardIndex, setActiveCardIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);

  // New Word Modal
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [newWord, setNewWord] = useState<string>('');
  const [newTrans, setNewTrans] = useState<string>('');
  const [newLang, setNewLang] = useState<LanguageCode>('ja');
  const [newExample, setNewExample] = useState<string>('');
  const [newCefr, setNewCefr] = useState<'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'>('B1');
  const [isAiGenerating, setIsAiGenerating] = useState<boolean>(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const filteredWords = words.filter(w => {
    if (selectedLang !== 'all' && w.language !== selectedLang) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return w.word.toLowerCase().includes(q) || w.translation.toLowerCase().includes(q);
    }
    return true;
  });

  const currentCard = filteredWords[activeCardIndex] || filteredWords[0];

  const handleAudioPlay = async (text: string, lang: LanguageCode) => {
    setIsPlayingAudio(true);
    await playTextToSpeech(text, lang);
    setTimeout(() => {
      setIsPlayingAudio(false);
    }, 1500);
  };

  const handleRateCard = (rating: ReviewRating) => {
    if (!currentCard) return;

    const nextState = calculateNextReview(
      {
        repetitions: currentCard.repetitions,
        intervalDays: currentCard.intervalDays,
        easeFactor: currentCard.easeFactor,
      },
      rating
    );

    const updated: VocabularyWord = {
      ...currentCard,
      ...nextState,
    };

    onUpdateWord(updated);
    setIsFlipped(false);

    if (activeCardIndex < filteredWords.length - 1) {
      setActiveCardIndex(prev => prev + 1);
    } else {
      setActiveCardIndex(0);
      setFeedbackMsg('Сессия повторения карточек завершена!');
      setTimeout(() => setFeedbackMsg(null), 3000);
    }
  };

  const handleAiFillWord = async () => {
    if (!newWord.trim()) return;
    setIsAiGenerating(true);
    try {
      const res = await fetch('/api/gemini/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: newWord,
          targetLanguage: 'ru',
          sourceLanguage: newLang,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setNewTrans(data.translatedText);
        setNewExample(`Пример: ${newWord} употребляется в живой речи.`);
      }
    } catch (e) {
      setNewTrans(`[Перевод]: ${newWord}`);
    } finally {
      setIsAiGenerating(false);
    }
  };

  const handleCreateWord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWord.trim() || !newTrans.trim()) return;

    const created: VocabularyWord = {
      id: `word-${Date.now()}`,
      word: newWord.trim(),
      translation: newTrans.trim(),
      language: newLang,
      exampleSentence: newExample.trim() || undefined,
      cefrLevel: newCefr,
      tags: ['Пользовательское'],
      easeFactor: 2.5,
      intervalDays: 1,
      repetitions: 0,
      nextReviewDate: new Date().toISOString(),
      isMastered: false,
      createdAt: new Date().toISOString().split('T')[0],
    };

    onAddWord(created);
    setNewWord('');
    setNewTrans('');
    setNewExample('');
    setIsModalOpen(false);
    setFeedbackMsg(`«${created.word}» добавлено в карточки`);
    setTimeout(() => setFeedbackMsg(null), 2500);
  };

  const dueCount = words.filter(w => isCardDueForReview(w.nextReviewDate)).length;
  const masteredCount = words.filter(w => w.isMastered).length;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Toast Feedback */}
      {feedbackMsg && (
        <div className="fixed bottom-20 md:bottom-6 right-6 z-50 bg-white border border-emerald-300 text-emerald-800 px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold backdrop-blur-md">
          <Check className="w-3.5 h-3.5 text-emerald-600" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-emerald-800 font-bold mb-1">
            <BookMarked className="w-3.5 h-3.5 text-emerald-600" />
            <span>Spaced Repetition System</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Словарный запас & Карточки
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Интервальное повторение по алгоритму SuperMemo SM-2 для долговременной памяти
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Новая карточка</span>
        </button>
      </div>

      {/* Micro-Metrics Bar */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 text-center shadow-xs">
          <div className="text-lg sm:text-2xl font-bold font-mono text-slate-900">{words.length}</div>
          <div className="text-[11px] text-slate-500 font-medium mt-0.5">Всего карточек</div>
        </div>
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 text-center shadow-xs">
          <div className="text-lg sm:text-2xl font-bold font-mono text-emerald-600">{dueCount}</div>
          <div className="text-[11px] text-slate-500 font-medium mt-0.5">К повторению</div>
        </div>
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 text-center shadow-xs">
          <div className="text-lg sm:text-2xl font-bold font-mono text-blue-600">{masteredCount}</div>
          <div className="text-[11px] text-slate-500 font-medium mt-0.5">Освоено</div>
        </div>
      </div>

      {/* Filter Chips & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <button
            onClick={() => setSelectedLang('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              selectedLang === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Все
          </button>
          {Object.values(SUPPORTED_LANGUAGES).map(lang => (
            <button
              key={lang.code}
              onClick={() => setSelectedLang(lang.code)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                selectedLang === lang.code
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span>{lang.flag}</span>
              <span>{lang.name}</span>
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск по карточкам..."
            className="w-full sm:w-56 bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-600"
          />
        </div>
      </div>

      {/* 3D Flashcard Stage */}
      {currentCard ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 font-mono font-medium">
            <span>
              Карточка {activeCardIndex + 1} из {filteredWords.length}
            </span>
            <span className="text-[11px] text-slate-500">
              Нажмите для переворота ↷
            </span>
          </div>

          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="cursor-pointer perspective-1000 min-h-[260px] sm:min-h-[280px]"
          >
            <div
              className={`relative w-full h-full min-h-[260px] sm:min-h-[280px] rounded-3xl transition-transform duration-500 transform-style-3d border shadow-sm hover:shadow-md p-6 sm:p-8 flex flex-col justify-between select-none ${
                isFlipped
                  ? 'rotate-y-180 bg-white border-2 border-indigo-300'
                  : 'bg-white border-slate-200/90 hover:border-slate-300'
              }`}
            >
              {/* Front */}
              {!isFlipped ? (
                <div className="space-y-4 h-full flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1.5 font-medium">
                      <span>{SUPPORTED_LANGUAGES[currentCard.language]?.flag}</span>
                      <span>{SUPPORTED_LANGUAGES[currentCard.language]?.name}</span>
                    </span>
                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {currentCard.cefrLevel}
                    </span>
                  </div>

                  <div className="text-center py-4">
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                      {currentCard.word}
                    </h2>
                    {currentCard.transcription && (
                      <p className="text-xs font-mono text-emerald-700 mt-2 font-bold">
                        [{currentCard.transcription}]
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAudioPlay(currentCard.word, currentCard.language);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold border border-slate-200 cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{isPlayingAudio ? '...' : 'Озвучить'}</span>
                    </button>
                    <span className="flex items-center gap-1 font-mono text-[11px] text-slate-500 font-medium">
                      <RotateCw className="w-3 h-3" />
                      <span>Перевернуть</span>
                    </span>
                  </div>
                </div>
              ) : (
                /* Back */
                <div className="space-y-4 h-full flex flex-col justify-between rotate-y-180">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-indigo-700 font-bold uppercase">
                      Значение & Контекст
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 font-medium">
                      Интервал: {currentCard.intervalDays} дн.
                    </span>
                  </div>

                  <div className="text-center py-2">
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-indigo-900">
                      {currentCard.translation}
                    </h3>
                    {currentCard.exampleSentence && (
                      <div className="mt-3 p-3 rounded-xl bg-indigo-50/70 border border-indigo-100 text-left">
                        <p className="text-xs text-slate-800">
                          «{currentCard.exampleSentence}»
                        </p>
                        {currentCard.exampleTranslation && (
                          <p className="text-[11px] text-slate-500 mt-0.5 italic">
                            — {currentCard.exampleTranslation}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="text-center text-[11px] font-mono text-slate-500 font-medium">
                    Оцените легкость ответа для следующего интервала:
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* SuperMemo Action Buttons */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-3 grid grid-cols-2 sm:grid-cols-4 gap-2 shadow-xs">
            <button
              onClick={() => handleRateCard(0)}
              className="py-2.5 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 font-bold text-xs cursor-pointer transition-all flex flex-col items-center"
            >
              <span>Снова</span>
              <span className="text-[10px] font-mono text-rose-600 font-normal">Сброс • 1 день</span>
            </button>

            <button
              onClick={() => handleRateCard(1)}
              className="py-2.5 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 font-bold text-xs cursor-pointer transition-all flex flex-col items-center"
            >
              <span>Трудно</span>
              <span className="text-[10px] font-mono text-amber-700 font-normal">+3 дня</span>
            </button>

            <button
              onClick={() => handleRateCard(2)}
              className="py-2.5 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-900 font-bold text-xs cursor-pointer transition-all flex flex-col items-center"
            >
              <span>Хорошо</span>
              <span className="text-[10px] font-mono text-blue-700 font-normal">+6..14 дней</span>
            </button>

            <button
              onClick={() => handleRateCard(3)}
              className="py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 font-bold text-xs cursor-pointer transition-all flex flex-col items-center"
            >
              <span>Легко</span>
              <span className="text-[10px] font-mono text-emerald-700 font-normal">Долгий интервал</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center bg-white border border-slate-200/90 rounded-2xl text-slate-500 text-xs shadow-xs">
          Нет карточек в этой выборке.
        </div>
      )}

      {/* Modal: Add New Flashcard */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <BookMarked className="w-4 h-4 text-emerald-600" />
                Новая карточка запоминания
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer text-base"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateWord} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Язык:
                  </label>
                  <select
                    value={newLang}
                    onChange={(e) => setNewLang(e.target.value as LanguageCode)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-600"
                  >
                    {Object.values(SUPPORTED_LANGUAGES).map(lang => (
                      <option key={lang.code} value={lang.code}>
                        {lang.flag} {lang.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Уровень (CEFR):
                  </label>
                  <select
                    value={newCefr}
                    onChange={(e) => setNewCefr(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-600"
                  >
                    {Object.keys(CEFR_DESCRIPTIONS).map(lvl => (
                      <option key={lvl} value={lvl}>
                        {lvl}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Слово или идиома:
                  </label>
                  <button
                    type="button"
                    onClick={handleAiFillWord}
                    disabled={isAiGenerating || !newWord.trim()}
                    className="text-[11px] text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 font-mono cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3 text-emerald-600" />
                    <span>{isAiGenerating ? '...' : 'Автозаполнить'}</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={newWord}
                  onChange={(e) => setNewWord(e.target.value)}
                  placeholder="Komorebi, Sobremesa..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Перевод на русский:
                </label>
                <input
                  type="text"
                  value={newTrans}
                  onChange={(e) => setNewTrans(e.target.value)}
                  placeholder="Толкование..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Пример (контекст):
                </label>
                <textarea
                  rows={2}
                  value={newExample}
                  onChange={(e) => setNewExample(e.target.value)}
                  placeholder="Пример употребления в предложении..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs cursor-pointer shadow-xs"
                >
                  Создать
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
