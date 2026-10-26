import React, { useState, useEffect, useRef } from 'react';
import { 
  Languages, 
  Send, 
  Volume2, 
  BookmarkPlus, 
  Check, 
  Globe2, 
  Search, 
  Smile, 
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { ChatContact, ChatMessage, VocabularyWord, LanguageCode } from '../types/index.ts';
import { SUPPORTED_LANGUAGES } from '../utils/language.ts';
import { playTextToSpeech } from '../utils/audio.ts';
import { translateTextClient } from '../services/geminiClient.ts';

interface ChatsTabProps {
  contacts: ChatContact[];
  onAddWordToVocabulary: (word: Partial<VocabularyWord>) => void;
  savedWordIds: Set<string>;
}

export const ChatsTab: React.FC<ChatsTabProps> = ({
  contacts,
  onAddWordToVocabulary,
  savedWordIds,
}) => {
  const [activeContactId, setActiveContactId] = useState<string>(contacts[0]?.id || 'chat-kenji');
  const [activeContacts, setActiveContacts] = useState<ChatContact[]>(contacts);
  const [messageInput, setMessageInput] = useState<string>('');
  
  // Segmented control state for translations
  const [translationMode, setTranslationMode] = useState<'both' | 'translated' | 'original'>('both');
  const [messageViewModes, setMessageViewModes] = useState<Record<string, 'original' | 'translated'>>({});

  const [playingMsgId, setPlayingMsgId] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [isPartnerTyping, setIsPartnerTyping] = useState<boolean>(false);
  const [showMobileChatList, setShowMobileChatList] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const activeContact = activeContacts.find(c => c.id === activeContactId) || activeContacts[0];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeContact?.messages, isPartnerTyping]);

  const handleAudioPlay = async (msgId: string, text: string, lang: LanguageCode) => {
    setPlayingMsgId(msgId);
    await playTextToSpeech(text, lang);
    setTimeout(() => {
      setPlayingMsgId(null);
    }, 1500);
  };

  const handleSaveWord = (word: string, translation: string, lang: LanguageCode) => {
    onAddWordToVocabulary({
      word,
      translation,
      language: lang,
      cefrLevel: 'B1',
      tags: ['Из чата', activeContact.name],
    });
    setFeedbackMsg(`«${word}» сохранено в карточки`);
    setTimeout(() => setFeedbackMsg(null), 2500);
  };

  const toggleMessageMode = (msgId: string) => {
    setMessageViewModes(prev => ({
      ...prev,
      [msgId]: prev[msgId] === 'translated' ? 'original' : 'translated'
    }));
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    const userText = messageInput.trim();
    setMessageInput('');

    let translated = '';
    try {
      const data = await translateTextClient(userText, activeContact.nativeLanguage, 'ru');
      translated = data.translatedText;
    } catch (e) {
      translated = `[Перевод на ${activeContact.nativeLanguage}]: ${userText}`;
    }

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: 'me',
      senderName: 'Александр',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      text: userText,
      translatedText: translated || undefined,
      language: 'ru',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
    };

    setActiveContacts(prev =>
      prev.map(c => {
        if (c.id === activeContactId) {
          return {
            ...c,
            messages: [...c.messages, newMsg],
          };
        }
        return c;
      })
    );

    // Partner Response simulation
    setIsPartnerTyping(true);
    setTimeout(async () => {
      let partnerReplyText = '';
      let partnerReplyTrans = '';
      let partnerWords: Array<{ word: string; translation: string }> = [];

      if (activeContact.nativeLanguage === 'ja') {
        partnerReplyText = '教えてくれてありがとう！とても勉強になります。日本語でも使ってみてくださいね！';
        partnerReplyTrans = 'Спасибо за ответ! Это очень познавательно. Обязательно попробуйте использовать это и на японском!';
        partnerWords = [
          { word: '教えてくれてありがとう', translation: 'Спасибо за подсказку' },
          { word: '勉強になります', translation: 'Это очень полезно' },
        ];
      } else if (activeContact.nativeLanguage === 'es') {
        partnerReplyText = '¡Qué bien explicado! Me encanta cómo suena esa frase. Por cierto, ¿conoces la palabra «Tertulia»?';
        partnerReplyTrans = 'Как здорово объяснено! Мне нравится, как звучит эта фраза. Кстати, знаешь ли ты слово «Tertulia»?';
        partnerWords = [
          { word: 'Tertulia', translation: 'Дружеская беседа за столом' },
          { word: 'Por cierto', translation: 'Кстати' },
        ];
      } else {
        partnerReplyText = 'C\'est fantastique! Merci pour cette belle conversation en direct.';
        partnerReplyTrans = 'Это потрясающе! Спасибо за этот приятный живой разговор.';
        partnerWords = [
          { word: 'Fantastique', translation: 'Фантастический' },
        ];
      }

      const partnerMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        senderId: activeContact.id,
        senderName: activeContact.name,
        avatar: activeContact.avatar,
        text: partnerReplyText,
        translatedText: partnerReplyTrans,
        language: activeContact.nativeLanguage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isMe: false,
        keyWords: partnerWords,
      };

      setIsPartnerTyping(false);
      setActiveContacts(prev =>
        prev.map(c => {
          if (c.id === activeContactId) {
            return {
              ...c,
              messages: [...c.messages, partnerMsg],
            };
          }
          return c;
        })
      );
    }, 1600);
  };

  const quickPhrases = [
    'Какая сейчас погода в твоем городе?',
    'Порекомендуй популярную книгу или песню!',
    'Как звучит эта фраза более естественно?',
    'У нас в России сейчас золотая осень 🍂',
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 h-[calc(100vh-8.5rem)] min-h-[580px]">
      {/* Toast Feedback */}
      {feedbackMsg && (
        <div className="fixed bottom-20 md:bottom-6 right-6 z-50 bg-white border border-emerald-300 text-emerald-800 px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold backdrop-blur-md">
          <Check className="w-3.5 h-3.5 text-emerald-600" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs hover:shadow-sm h-full flex flex-col md:flex-row overflow-hidden">
        {/* Left Contacts Sidebar (Hidden on mobile if chat is active and showMobileChatList is false) */}
        <div className={`w-full md:w-80 shrink-0 border-b md:border-b-0 md:border-r border-slate-200 flex flex-col bg-slate-50/70 ${
          showMobileChatList ? 'flex' : 'hidden md:flex'
        }`}>
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Globe2 className="w-4 h-4 text-emerald-600" />
              <span>Собеседники</span>
            </h2>
            <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Live</span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {activeContacts.map(contact => {
              const isSelected = contact.id === activeContactId;
              const lastMsg = contact.messages[contact.messages.length - 1];

              return (
                <button
                  key={contact.id}
                  onClick={() => {
                    setActiveContactId(contact.id);
                    setShowMobileChatList(false);
                  }}
                  className={`w-full p-3.5 text-left flex items-start gap-3 transition-colors cursor-pointer select-none ${
                    isSelected
                      ? 'bg-white border-l-3 border-emerald-600 shadow-xs'
                      : 'hover:bg-slate-100/80'
                  }`}
                >
                  <div className="relative">
                    <img
                      src={contact.avatar}
                      alt={contact.name}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-200"
                    />
                    {contact.isOnline && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                        {contact.name}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 font-medium">
                        {contact.flag} {contact.city}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                      <span className="text-emerald-700 font-semibold font-mono">
                        {SUPPORTED_LANGUAGES[contact.nativeLanguage]?.name || contact.nativeLanguage}
                      </span>
                      <span>↔</span>
                      <span>Русский</span>
                    </div>

                    {lastMsg && (
                      <p className="text-[11px] text-slate-600 truncate mt-1">
                        {lastMsg.text}
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Active Chat Pane */}
        <div className={`flex-1 flex flex-col bg-white min-h-0 ${
          showMobileChatList ? 'hidden md:flex' : 'flex'
        }`}>
          {/* Top Bar with Micro-Interface: Aesthetic Translation Segmented Pill */}
          <div className="p-3 sm:p-4 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3 min-w-0">
              {/* Mobile Back Button to Contacts */}
              <button
                onClick={() => setShowMobileChatList(true)}
                className="md:hidden p-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                ← Чаты
              </button>

              <div className="relative">
                <img
                  src={activeContact.avatar}
                  alt={activeContact.name}
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-200"
                />
                {activeContact.isOnline && (
                  <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-slate-900">
                    {activeContact.name}
                  </h3>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-medium">
                    {activeContact.flag} {activeContact.city}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500">
                  <span className="text-emerald-700 font-semibold">{activeContact.lastActive}</span>
                  <span> • </span>
                  <span>Родной: {SUPPORTED_LANGUAGES[activeContact.nativeLanguage]?.name}</span>
                </div>
              </div>
            </div>

            {/* AESTHETIC SEGMENTED TRANSLATION TOGGLE PILL (Linear style with smooth transition) */}
            <div className="flex items-center bg-slate-200/70 p-0.5 rounded-lg border border-slate-200 text-xs">
              <button
                onClick={() => setTranslationMode('original')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                  translationMode === 'original'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Оригинал
              </button>
              <button
                onClick={() => setTranslationMode('both')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                  translationMode === 'both'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Оригинал + Перевод
              </button>
              <button
                onClick={() => setTranslationMode('translated')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                  translationMode === 'translated'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Только перевод
              </button>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30">
            {activeContact.messages.map(msg => {
              const isAudioPlaying = playingMsgId === msg.id;
              const individualView = messageViewModes[msg.id];

              const showOriginal = translationMode === 'both' || translationMode === 'original' || individualView === 'original';
              const showTranslated = (translationMode === 'both' || translationMode === 'translated' || individualView === 'translated') && msg.translatedText;

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.isMe ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[88%] sm:max-w-[75%] rounded-2xl p-4 space-y-2.5 border shadow-xs transition-all ${
                      msg.isMe
                        ? 'bg-indigo-600 border-indigo-500 text-white rounded-br-none'
                        : 'bg-white border-slate-200/90 text-slate-900 rounded-bl-none'
                    }`}
                  >
                    {/* Header line with individual Micro-toggle */}
                    <div className="flex items-center justify-between gap-3 text-[11px]">
                      <span className={`font-bold ${msg.isMe ? 'text-white' : 'text-slate-900'}`}>
                        {msg.senderName}
                      </span>
                      <div className="flex items-center gap-2">
                        {/* Micro toggle tab (original vs translated) with transition */}
                        {msg.translatedText && (
                          <button
                            onClick={() => toggleMessageMode(msg.id)}
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold transition-colors cursor-pointer border ${
                              msg.isMe
                                ? 'bg-indigo-500 hover:bg-indigo-400 text-white border-indigo-400'
                                : 'bg-slate-100 hover:bg-slate-200 text-emerald-800 border-slate-200'
                            }`}
                            title="Переключить вид сообщения"
                          >
                            {individualView === 'translated' ? 'Оригинал' : 'Перевод ⇄'}
                          </button>
                        )}
                        <span className={`font-mono text-[10px] ${msg.isMe ? 'text-indigo-200' : 'text-slate-400'}`}>
                          {msg.timestamp}
                        </span>
                      </div>
                    </div>

                    {/* Original Text */}
                    {showOriginal && (
                      <p className={`text-xs sm:text-sm leading-relaxed font-normal ${msg.isMe ? 'text-white' : 'text-slate-800'}`}>
                        {msg.text}
                      </p>
                    )}

                    {/* Aesthetic In-line Translated View */}
                    {showTranslated && (
                      <div className={`p-2.5 rounded-xl border text-xs leading-relaxed transition-all ${
                        msg.isMe
                          ? 'bg-indigo-700/60 border-indigo-400 text-indigo-50'
                          : 'bg-emerald-50 border-emerald-200 text-slate-800'
                      }`}>
                        <div className={`flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider font-bold mb-0.5 ${
                          msg.isMe ? 'text-indigo-200' : 'text-emerald-800'
                        }`}>
                          <Languages className="w-3 h-3" />
                          <span>Синхронный перевод:</span>
                        </div>
                        <p className={msg.isMe ? 'text-indigo-50' : 'text-slate-700'}>{msg.translatedText}</p>
                      </div>
                    )}

                    {/* Key Vocabulary Chips */}
                    {msg.keyWords && msg.keyWords.length > 0 && (
                      <div className={`pt-2 border-t ${msg.isMe ? 'border-indigo-500/50' : 'border-slate-100'}`}>
                        <div className={`text-[10px] font-mono uppercase font-semibold mb-1 ${msg.isMe ? 'text-indigo-200' : 'text-slate-500'}`}>
                          Новая лексика:
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {msg.keyWords.map((item, idx) => {
                            const isSaved = savedWordIds.has(item.word);
                            return (
                              <button
                                key={idx}
                                onClick={() => handleSaveWord(item.word, item.translation, msg.language)}
                                className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] border transition-colors cursor-pointer group ${
                                  msg.isMe
                                    ? 'bg-indigo-700 hover:bg-indigo-800 border-indigo-400 text-white'
                                    : 'bg-slate-50 hover:bg-emerald-50 border-slate-200 hover:border-emerald-300 text-slate-800'
                                }`}
                              >
                                <span className={`font-bold ${msg.isMe ? 'text-white' : 'text-emerald-800'}`}>{item.word}</span>
                                <span className="opacity-50 text-[10px]">→</span>
                                <span className={msg.isMe ? 'text-indigo-100' : 'text-slate-600'}>{item.translation}</span>
                                <BookmarkPlus className={`w-3 h-3 ml-0.5 ${isSaved ? (msg.isMe ? 'text-amber-300 fill-amber-300' : 'text-emerald-600 fill-emerald-600') : 'opacity-60'}`} />
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Audio pronunciation button */}
                    <div className="flex items-center justify-end pt-0.5">
                      <button
                        onClick={() => handleAudioPlay(msg.id, msg.text, msg.language)}
                        disabled={isAudioPlaying}
                        className={`flex items-center gap-1 text-[11px] font-medium transition-colors cursor-pointer ${
                          msg.isMe ? 'text-indigo-200 hover:text-white' : 'text-slate-500 hover:text-slate-800'
                        }`}
                        title="Прослушать"
                      >
                        <Volume2 className={`w-3.5 h-3.5 ${isAudioPlaying ? (msg.isMe ? 'text-amber-300 animate-pulse' : 'text-emerald-600 animate-pulse') : ''}`} />
                        <span>{isAudioPlaying ? '...' : 'Озвучить'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Typing Indicator */}
            {isPartnerTyping && (
              <div className="flex items-center gap-2 text-xs text-slate-600 bg-white border border-slate-200 shadow-xs w-fit px-3 py-1.5 rounded-lg">
                <span>{activeContact.name} печатает...</span>
                <span className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.4s]" />
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Prompt chips */}
          <div className="px-4 py-2 bg-slate-50/90 border-t border-slate-200 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <span className="text-[10px] font-mono text-slate-500 uppercase font-semibold whitespace-nowrap">
              Подсказки:
            </span>
            {quickPhrases.map((phrase, idx) => (
              <button
                key={idx}
                onClick={() => setMessageInput(phrase)}
                className="px-2.5 py-1 rounded bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 text-xs font-medium whitespace-nowrap border border-slate-200 transition-colors cursor-pointer shadow-2xs"
              >
                {phrase}
              </button>
            ))}
          </div>

          {/* Send Input Bar */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder={`Сообщение для ${activeContact.name} с автопереводом...`}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-600"
            />
            <button
              type="submit"
              disabled={!messageInput.trim()}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-lg text-xs cursor-pointer transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Отправить</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
