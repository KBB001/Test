import React, { useState } from 'react';
import { 
  Languages, 
  Volume2, 
  Heart, 
  MessageCircle, 
  BookmarkPlus, 
  Sparkles, 
  Plus, 
  Send, 
  Check, 
  Compass,
  ArrowUpRight,
  Flame,
  Globe2
} from 'lucide-react';
import { FeedPost, VocabularyWord, LanguageCode } from '../types/index.ts';
import { SUPPORTED_LANGUAGES } from '../utils/language.ts';
import { playTextToSpeech } from '../utils/audio.ts';
import { translateTextClient } from '../services/geminiClient.ts';

interface FeedTabProps {
  posts: FeedPost[];
  onAddWordToVocabulary: (word: Partial<VocabularyWord>) => void;
  savedWordIds: Set<string>;
  onAddNewPost: (post: FeedPost) => void;
}

export const FeedTab: React.FC<FeedTabProps> = ({
  posts,
  onAddWordToVocabulary,
  savedWordIds,
  onAddNewPost,
}) => {
  const [selectedLangFilter, setSelectedLangFilter] = useState<string>('all');
  const [showTranslations, setShowTranslations] = useState<Record<string, boolean>>({});
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [localPosts, setLocalPosts] = useState<FeedPost[]>(posts);
  const [isNewPostModalOpen, setIsNewPostModalOpen] = useState<boolean>(false);
  const [newPostContent, setNewPostContent] = useState<string>('');
  const [newPostLanguage, setNewPostLanguage] = useState<LanguageCode>('en');
  const [isTranslatingNewPost, setIsTranslatingNewPost] = useState<boolean>(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const toggleTranslation = (postId: string) => {
    setShowTranslations(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  const handleAudioPlay = async (postId: string, text: string, lang: LanguageCode) => {
    setPlayingAudioId(postId);
    await playTextToSpeech(text, lang);
    setTimeout(() => {
      setPlayingAudioId(null);
    }, 1500);
  };

  const handleLike = (postId: string) => {
    setLocalPosts(prev =>
      prev.map(p => {
        if (p.id === postId) {
          const isLiked = !p.isLiked;
          return {
            ...p,
            isLiked,
            likesCount: isLiked ? p.likesCount + 1 : p.likesCount - 1
          };
        }
        return p;
      })
    );
  };

  const handleSaveWord = (word: string, translation: string, lang: LanguageCode) => {
    onAddWordToVocabulary({
      word,
      translation,
      language: lang,
      cefrLevel: 'B1',
      tags: ['Из ленты'],
    });
    setFeedbackMsg(`«${word}» добавлено в ваш словарь`);
    setTimeout(() => setFeedbackMsg(null), 2500);
  };

  const filteredPosts = localPosts.filter(p => {
    if (selectedLangFilter === 'all') return true;
    return p.originalLanguage === selectedLangFilter;
  });

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    setIsTranslatingNewPost(true);

    let translated = '';
    let extractedWords: Array<{ word: string; translation: string }> = [];

    try {
      const data = await translateTextClient(newPostContent, 'ru', newPostLanguage);
      translated = data.translatedText;
      extractedWords = data.keyWords || [];
    } catch (err) {
      translated = `[Перевод]: ${newPostContent}`;
    }

    const newPost: FeedPost = {
      id: `post-${Date.now()}`,
      author: {
        name: 'Александр Романов',
        handle: '@alex_polyglot',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        country: 'Россия',
        flag: '🇷🇺',
        nativeLang: 'ru',
        learningLang: newPostLanguage,
        fluencyLevel: 'B2 Intermediate',
      },
      content: newPostContent,
      translatedContent: translated || `[Перевод]: ${newPostContent}`,
      originalLanguage: newPostLanguage,
      tags: ['КультурныйОбмен', SUPPORTED_LANGUAGES[newPostLanguage]?.name || 'Языки'],
      likesCount: 1,
      commentsCount: 0,
      timestamp: 'Только что',
      isLiked: true,
      keyWords: extractedWords.length > 0 ? extractedWords : [
        { word: newPostContent.split(' ')[0] || 'Hello', translation: 'Привет' }
      ]
    };

    setLocalPosts([newPost, ...localPosts]);
    onAddNewPost(newPost);
    setNewPostContent('');
    setIsTranslatingNewPost(false);
    setIsNewPostModalOpen(false);
  };

  // Distinct posts for Bento layout
  const featuredPost = filteredPosts[0];
  const sidePost = filteredPosts[1];
  const restPosts = filteredPosts.slice(2);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Toast Feedback */}
      {feedbackMsg && (
        <div className="fixed bottom-20 md:bottom-6 right-6 z-50 bg-white border border-emerald-300 text-emerald-800 px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold backdrop-blur-md">
          <Check className="w-3.5 h-3.5 text-emerald-600" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Top Bar with Language Filter & New Post Action */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        {/* Language Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <button
            onClick={() => setSelectedLangFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              selectedLangFilter === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Все языки
          </button>
          {Object.values(SUPPORTED_LANGUAGES).map(lang => (
            <button
              key={lang.code}
              onClick={() => setSelectedLangFilter(lang.code)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                selectedLangFilter === lang.code
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span>{lang.flag}</span>
              <span>{lang.name}</span>
            </button>
          ))}
        </div>

        {/* Create Post Button */}
        <button
          onClick={() => setIsNewPostModalOpen(true)}
          className="self-end sm:self-auto flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Поделиться мыслью</span>
        </button>
      </div>

      {/* ASYMMETRIC BENTO GRID (Главная) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Bento Hero Card: Featured Story (8 cols) */}
        {featuredPost && (
          <article className="lg:col-span-8 bg-white border border-slate-200/80 hover:border-slate-300 rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 shadow-xs hover:shadow-md group">
            <div className="space-y-4">
              {/* Card Header */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={featuredPost.author.avatar}
                    alt={featuredPost.author.name}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100"
                  />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900 text-sm">
                        {featuredPost.author.name}
                      </span>
                      <span className="text-xs text-slate-500">
                        {featuredPost.author.handle}
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-medium flex items-center gap-1">
                        <span>{featuredPost.author.flag}</span>
                        <span>{featuredPost.author.country}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                      <span>Изучает: {SUPPORTED_LANGUAGES[featuredPost.author.learningLang]?.name}</span>
                      <span>•</span>
                      <span className="text-emerald-700 font-semibold font-mono">{featuredPost.author.fluencyLevel}</span>
                      <span>•</span>
                      <span>{featuredPost.timestamp}</span>
                    </div>
                  </div>
                </div>

                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-600 bg-slate-100 px-2.5 py-1 rounded border border-slate-200 font-medium">
                  {SUPPORTED_LANGUAGES[featuredPost.originalLanguage]?.name}
                </span>
              </div>

              {/* Story Text */}
              <p className="text-slate-800 text-sm sm:text-base leading-relaxed font-normal">
                {featuredPost.content}
              </p>

              {/* Translation Accordion with smooth transition */}
              {showTranslations[featuredPost.id] && featuredPost.translatedContent && (
                <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200 text-slate-800 text-xs sm:text-sm leading-relaxed transition-all">
                  <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-emerald-800 font-bold mb-1">
                    <Languages className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Перевод на русский:</span>
                  </div>
                  <p className="text-slate-700">{featuredPost.translatedContent}</p>
                </div>
              )}

              {/* Hero Image */}
              {featuredPost.image && (
                <div className="rounded-xl overflow-hidden max-h-72 border border-slate-200 relative bg-slate-100">
                  <img
                    src={featuredPost.image}
                    alt="Иллюстрация"
                    className="w-full h-full object-cover group-hover:scale-[1.01] transition-transform duration-500"
                  />
                </div>
              )}

              {/* Key Vocabulary Chips */}
              {featuredPost.keyWords && featuredPost.keyWords.length > 0 && (
                <div className="pt-2">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold mb-2">
                    Лексика для запоминания:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {featuredPost.keyWords.map((item, idx) => {
                      const isSaved = savedWordIds.has(item.word);
                      return (
                        <button
                          key={idx}
                          onClick={() => handleSaveWord(item.word, item.translation, featuredPost.originalLanguage)}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-slate-800 transition-colors cursor-pointer group/btn"
                        >
                          <span className="font-bold text-emerald-800">{item.word}</span>
                          <span className="text-slate-400 text-[10px]">→</span>
                          <span className="text-slate-600 font-medium">{item.translation}</span>
                          <BookmarkPlus className={`w-3.5 h-3.5 ml-1 ${isSaved ? 'text-emerald-600 fill-emerald-600' : 'text-slate-400 group-hover/btn:text-emerald-600'}`} />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Footer Toolbar */}
            <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleTranslation(featuredPost.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-semibold text-xs transition-colors cursor-pointer ${
                    showTranslations[featuredPost.id]
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                  }`}
                >
                  <Languages className="w-3.5 h-3.5" />
                  <span>{showTranslations[featuredPost.id] ? 'Скрыть перевод' : 'Перевести'}</span>
                </button>

                <button
                  onClick={() => handleAudioPlay(featuredPost.id, featuredPost.content, featuredPost.originalLanguage)}
                  disabled={playingAudioId === featuredPost.id}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-md font-semibold text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
                >
                  <Volume2 className={`w-3.5 h-3.5 text-slate-500 ${playingAudioId === featuredPost.id ? 'animate-pulse text-emerald-600' : ''}`} />
                  <span>{playingAudioId === featuredPost.id ? 'Озвучивание...' : 'Озвучить'}</span>
                </button>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleLike(featuredPost.id)}
                  className={`flex items-center gap-1.5 transition-colors cursor-pointer font-medium ${
                    featuredPost.isLiked ? 'text-rose-600' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${featuredPost.isLiked ? 'fill-rose-600 text-rose-600' : ''}`} />
                  <span className="font-mono text-xs">{featuredPost.likesCount}</span>
                </button>
                <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span className="font-mono text-xs">{featuredPost.commentsCount}</span>
                </div>
              </div>
            </div>
          </article>
        )}

        {/* Bento Side Item: Daily Cultural Focus (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Daily Micro-Card */}
          <div className="bg-white border border-slate-200/80 hover:border-slate-300 rounded-2xl p-5 space-y-3 shadow-xs hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-amber-800 font-bold flex items-center gap-1.5 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                <Flame className="w-3.5 h-3.5 text-amber-600 fill-amber-600" />
                Идиома дня
              </span>
              <span className="text-[10px] font-mono text-slate-500 font-medium">Español</span>
            </div>

            <div className="space-y-1">
              <h3 className="font-bold text-slate-900 text-base">
                «Estar como pez en el agua»
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Дословно: «Быть как рыба в воде». Используется, когда человек чувствует себя максимально комфортно и уверенно в незнакомой обстановке.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                onClick={() => handleSaveWord('Estar como pez en el agua', 'Чувствовать себя как рыба в воде', 'es')}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
              >
                <BookmarkPlus className="w-3.5 h-3.5" />
                <span>В мои карточки</span>
              </button>
              <button
                onClick={() => handleAudioPlay('idiom-daily', 'Estar como pez en el agua', 'es')}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 cursor-pointer"
                title="Озвучить"
              >
                <Volume2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Side Community Post */}
          {sidePost && (
            <article className="bg-white border border-slate-200/80 hover:border-slate-300 rounded-2xl p-5 space-y-3 flex flex-col justify-between shadow-xs hover:shadow-md transition-all">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img
                      src={sidePost.author.avatar}
                      alt={sidePost.author.name}
                      className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200"
                    />
                    <div>
                      <div className="font-bold text-xs text-slate-900">
                        {sidePost.author.name}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {sidePost.author.flag} {sidePost.author.country}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    {sidePost.timestamp}
                  </span>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed font-normal">
                  {sidePost.content}
                </p>

                {showTranslations[sidePost.id] && sidePost.translatedContent && (
                  <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-slate-800">
                    {sidePost.translatedContent}
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <button
                  onClick={() => toggleTranslation(sidePost.id)}
                  className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 cursor-pointer"
                >
                  {showTranslations[sidePost.id] ? 'Оригинал' : 'Перевести'}
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleLike(sidePost.id)}
                    className="flex items-center gap-1 hover:text-rose-600 cursor-pointer"
                  >
                    <Heart className={`w-3 h-3 ${sidePost.isLiked ? 'text-rose-600 fill-rose-600' : ''}`} />
                    <span className="font-mono text-[11px]">{sidePost.likesCount}</span>
                  </button>
                </div>
              </div>
            </article>
          )}
        </div>

        {/* Secondary Bento Row (Cards for other languages) */}
        {restPosts.map(post => (
          <article
            key={post.id}
            className="lg:col-span-6 bg-white border border-slate-200/80 hover:border-slate-300 rounded-2xl p-5 space-y-3 flex flex-col justify-between transition-all shadow-xs hover:shadow-md"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img
                    src={post.author.avatar}
                    alt={post.author.name}
                    className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200"
                  />
                  <div>
                    <span className="font-bold text-xs text-slate-900 block">
                      {post.author.name}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {post.author.flag} {post.author.country} • {post.timestamp}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-mono uppercase text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 font-medium">
                  {SUPPORTED_LANGUAGES[post.originalLanguage]?.name}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                {post.content}
              </p>

              {showTranslations[post.id] && post.translatedContent && (
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-slate-800">
                  {post.translatedContent}
                </div>
              )}

              {post.image && (
                <div className="rounded-lg overflow-hidden max-h-48 border border-slate-200 bg-slate-100">
                  <img src={post.image} alt="Иллюстрация" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleTranslation(post.id)}
                  className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold border border-slate-200 cursor-pointer"
                >
                  {showTranslations[post.id] ? 'Оригинал' : 'Перевести'}
                </button>
                <button
                  onClick={() => handleAudioPlay(post.id, post.content, post.originalLanguage)}
                  className="p-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 cursor-pointer"
                  title="Озвучить"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                onClick={() => handleLike(post.id)}
                className="flex items-center gap-1 hover:text-rose-600 cursor-pointer"
              >
                <Heart className={`w-3.5 h-3.5 ${post.isLiked ? 'text-rose-600 fill-rose-600' : ''}`} />
                <span className="font-mono text-[11px]">{post.likesCount}</span>
              </button>
            </div>
          </article>
        ))}
      </div>

      {/* Modal: Create Post */}
      {isNewPostModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Globe2 className="w-4 h-4 text-emerald-600" />
                Новая публикация в ленту
              </h2>
              <button
                onClick={() => setIsNewPostModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer text-base"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Язык публикации:
                </label>
                <select
                  value={newPostLanguage}
                  onChange={(e) => setNewPostLanguage(e.target.value as LanguageCode)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 font-medium focus:bg-white focus:outline-none focus:border-emerald-600"
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
                  Текст:
                </label>
                <textarea
                  rows={4}
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder="Поделитесь культурным фактом, новой идиомой или мыслью..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-600"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewPostModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={isTranslatingNewPost}
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  {isTranslatingNewPost ? 'Обработка...' : 'Опубликовать'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
