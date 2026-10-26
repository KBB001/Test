import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Volume2, 
  BookmarkPlus, 
  Check, 
  RotateCw, 
  ChevronDown, 
  ChevronUp, 
  Coffee, 
  Briefcase, 
  GraduationCap, 
  Compass,
  Layers
} from 'lucide-react';
import { AIMentorMessage, VocabularyWord, LanguageCode } from '../types/index.ts';
import { SUPPORTED_LANGUAGES } from '../utils/language.ts';
import { playTextToSpeech } from '../utils/audio.ts';
import { generateMentorResponseClient } from '../services/geminiClient.ts';

interface MentorTabProps {
  currentLanguage: LanguageCode;
  onAddWordToVocabulary: (word: Partial<VocabularyWord>) => void;
  savedWordIds: Set<string>;
}

export const MentorTab: React.FC<MentorTabProps> = ({
  currentLanguage,
  onAddWordToVocabulary,
  savedWordIds,
}) => {
  const [messages, setMessages] = useState<AIMentorMessage[]>([
    {
      id: 'mentor-welcome',
      role: 'model',
      text: `Здравствуйте! Я ваш ИИ-наставник по ${SUPPORTED_LANGUAGES[currentLanguage]?.name || 'языку'}. Задавайте любые вопросы или выберите сценарий для живой тренировки. Под каждым моим ответом вы увидите интерактивные карточки слов: кликните на них, чтобы перевернуть и сохранить!`,
      thinkingProcess: 'Педагогический фокус: создание интерактивного диалога и поддержка запоминания лексики через карточки с эффектом переворота.',
      vocabulary: [
        {
          word: currentLanguage === 'ja' ? '会話 (Kaiwa)' : currentLanguage === 'es' ? 'Conversación' : currentLanguage === 'fr' ? 'Dialogue' : 'Fluency',
          translation: 'Живая беседа / Беглость речи',
          cefrLevel: 'B1',
          nuance: 'Ключевой навык для преодоления языкового барьера при регулярной практике.',
        },
      ],
      timestamp: 'Только что',
    },
  ]);

  const [inputMessage, setInputMessage] = useState<string>('');
  const [selectedScenario, setSelectedScenario] = useState<string>('Разговорное кафе');
  const [enableThinking, setEnableThinking] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [expandedThoughts, setExpandedThoughts] = useState<Record<string, boolean>>({});
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const scenarios = [
    { title: 'Разговорное кафе', icon: Coffee },
    { title: 'Подготовка к собеседованию', icon: Briefcase },
    { title: 'Ориентирование в городе', icon: Compass },
    { title: 'Разбор грамматики', icon: GraduationCap },
  ];

  const handleAudioPlay = async (msgId: string, text: string) => {
    setPlayingAudioId(msgId);
    await playTextToSpeech(text, currentLanguage);
    setTimeout(() => {
      setPlayingAudioId(null);
    }, 1500);
  };

  const toggleFlip = (cardKey: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFlippedCards(prev => ({
      ...prev,
      [cardKey]: !prev[cardKey]
    }));
  };

  const handleSaveWord = (vocab: AIMentorMessage['vocabulary'][0], e: React.MouseEvent) => {
    e.stopPropagation();
    onAddWordToVocabulary({
      word: vocab.word,
      translation: vocab.translation,
      language: currentLanguage,
      cefrLevel: vocab.cefrLevel,
      exampleSentence: vocab.nuance,
      tags: ['ИИ-Наставник', selectedScenario],
    });
    setFeedbackMsg(`«${vocab.word}» сохранено в карточки`);
    setTimeout(() => setFeedbackMsg(null), 2500);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userText = inputMessage.trim();
    setInputMessage('');

    const userMsg: AIMentorMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: userText,
      vocabulary: [],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const history = messages.slice(-4).map(m => ({
        role: m.role,
        text: m.text,
      }));

      const data = await generateMentorResponseClient(
        userText,
        history,
        selectedScenario,
        currentLanguage,
        enableThinking
      );

      const modelMsg: AIMentorMessage = {
        id: `mentor-${Date.now()}`,
        role: 'model',
        text: data.reply,
        thinkingProcess: data.thinkingProcess,
        vocabulary: (data.vocabulary || []).map((v) => ({
          word: v.word,
          translation: v.translation,
          cefrLevel: (['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].includes(v.cefrLevel)
            ? v.cefrLevel
            : 'B1') as AIMentorMessage['vocabulary'][0]['cefrLevel'],
          nuance: v.nuance || '',
        })),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, modelMsg]);
    } catch (err) {
      console.error('Error fetching mentor response:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleThought = (id: string) => {
    setExpandedThoughts(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 h-[calc(100vh-8.5rem)] min-h-[580px] flex flex-col space-y-3">
      {/* Toast Feedback */}
      {feedbackMsg && (
        <div className="fixed bottom-20 md:bottom-6 right-6 z-50 bg-white border border-emerald-300 text-emerald-800 px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold backdrop-blur-md">
          <Check className="w-3.5 h-3.5 text-emerald-600" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Top Header & Scenario Selector Bar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-2xs">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>Globus Mentor</span>
              <span className="text-[10px] font-mono text-emerald-800 font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-50 border border-emerald-200">
                {SUPPORTED_LANGUAGES[currentLanguage]?.name}
              </span>
            </h1>
            <p className="text-[11px] text-slate-500">
              Диалоговый наставник с интерактивными Flip-карточками
            </p>
          </div>
        </div>

        {/* Minimalist Scenario & Thinking Pill Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {scenarios.map(s => {
              const Icon = s.icon;
              const isSelected = selectedScenario === s.title;
              return (
                <button
                  key={s.title}
                  onClick={() => setSelectedScenario(s.title)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/70 border border-slate-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{s.title}</span>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setEnableThinking(!enableThinking)}
            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-mono transition-all border cursor-pointer font-semibold ${
              enableThinking
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : 'bg-slate-100 border-slate-200 text-slate-600'
            }`}
            title="Глубокий анализ рассуждений модели"
          >
            Thinking: {enableThinking ? 'HIGH' : 'OFF'}
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto bg-slate-50/50 border border-slate-200/90 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xs">
        {messages.map(msg => {
          const isModel = msg.role === 'model';
          const isAudioPlaying = playingAudioId === msg.id;
          const isThoughtExpanded = expandedThoughts[msg.id];

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isModel ? 'items-start' : 'items-end'}`}
            >
              <div
                className={`max-w-[92%] sm:max-w-[85%] rounded-2xl p-4 space-y-3 border shadow-xs transition-all ${
                  isModel
                    ? 'bg-white border-slate-200 text-slate-900 rounded-bl-none'
                    : 'bg-indigo-600 border-indigo-500 text-white rounded-br-none'
                }`}
              >
                {/* Header */}
                <div className="flex items-center justify-between text-[11px]">
                  <span className={`font-bold ${isModel ? 'text-slate-900' : 'text-white'}`}>
                    {isModel ? 'Globus Mentor' : 'Вы'}
                  </span>
                  <span className={`font-mono text-[10px] ${isModel ? 'text-slate-400' : 'text-indigo-200'}`}>
                    {msg.timestamp}
                  </span>
                </div>

                {/* Minimalist Thinking Accordion (Linear Style) */}
                {isModel && msg.thinkingProcess && (
                  <div className="border border-slate-200 rounded-xl bg-slate-100/70 p-2.5 text-xs">
                    <button
                      onClick={() => toggleThought(msg.id)}
                      className="w-full flex items-center justify-between text-[11px] font-mono font-semibold text-slate-700 hover:text-slate-900 cursor-pointer"
                    >
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span>Рассуждение модели (High Thinking Analysis)</span>
                      </span>
                      {isThoughtExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                    {isThoughtExpanded && (
                      <p className="mt-2 text-slate-600 font-mono text-[11px] leading-relaxed pt-2 border-t border-slate-200">
                        {msg.thinkingProcess}
                      </p>
                    )}
                  </div>
                )}

                {/* Message Text */}
                <p className={`text-xs sm:text-sm leading-relaxed whitespace-pre-line font-normal ${isModel ? 'text-slate-800' : 'text-white'}`}>
                  {msg.text}
                </p>

                {/* INTERACTIVE FLIP-CARD FLASHCARDS (Микроинтерфейс запоминания) */}
                {isModel && msg.vocabulary && msg.vocabulary.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-800 font-bold flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Карточки запоминания (Flip-Cards)</span>
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium">
                        Кликните карточку для переворота ↷
                      </span>
                    </div>

                    {/* Flip Cards Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      {msg.vocabulary.map((vocab, vIdx) => {
                        const cardKey = `${msg.id}-${vIdx}`;
                        const isFlipped = flippedCards[cardKey];
                        const isSaved = savedWordIds.has(vocab.word);

                        return (
                          <div
                            key={vIdx}
                            onClick={(e) => toggleFlip(cardKey, e)}
                            className="perspective-1000 min-h-[145px] cursor-pointer"
                          >
                            <div
                              className={`relative w-full h-full min-h-[145px] rounded-xl transition-transform duration-500 transform-style-3d border shadow-xs p-3.5 flex flex-col justify-between ${
                                isFlipped
                                  ? 'rotate-y-180 bg-slate-900 border-slate-800 text-white'
                                  : 'bg-slate-50 hover:bg-white border-slate-200/90 hover:border-slate-300'
                              }`}
                            >
                              {/* Front Side */}
                              {!isFlipped ? (
                                <div className="space-y-2 h-full flex flex-col justify-between">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
                                      {vocab.cefrLevel}
                                    </span>
                                    <span className="text-[10px] text-slate-500 font-mono font-medium flex items-center gap-1">
                                      <RotateCw className="w-2.5 h-2.5" />
                                      <span>Перевернуть</span>
                                    </span>
                                  </div>

                                  <div className="text-center py-1">
                                    <h4 className="font-bold text-base sm:text-lg text-slate-900">
                                      {vocab.word}
                                    </h4>
                                    <p className="text-xs text-slate-600 font-medium mt-0.5">
                                      {vocab.translation}
                                    </p>
                                  </div>

                                  <div className="text-[10px] text-slate-400 text-center font-medium">
                                    Нажмите для просмотра контекста и сохранения
                                  </div>
                                </div>
                              ) : (
                                /* Back Side (Flipped) */
                                <div className="space-y-2 h-full flex flex-col justify-between rotate-y-180">
                                  <div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">
                                        Контекст & Нюанс
                                      </span>
                                      <span className="text-[10px] font-mono text-slate-400">
                                        CEFR {vocab.cefrLevel}
                                      </span>
                                    </div>
                                    <p className="text-xs text-slate-200 mt-1 leading-relaxed">
                                      {vocab.nuance}
                                    </p>
                                  </div>

                                  <button
                                    onClick={(e) => handleSaveWord(vocab, e)}
                                    disabled={isSaved}
                                    className={`w-full py-1.5 px-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                                      isSaved
                                        ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30'
                                        : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold'
                                    }`}
                                  >
                                    <BookmarkPlus className="w-3.5 h-3.5" />
                                    <span>{isSaved ? 'Сохранено в карточки' : '+ В личные карточки'}</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Audio voice trigger */}
                {isModel && (
                  <div className="flex items-center justify-end pt-1">
                    <button
                      onClick={() => handleAudioPlay(msg.id, msg.text)}
                      disabled={isAudioPlaying}
                      className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                    >
                      <Volume2 className={`w-3.5 h-3.5 ${isAudioPlaying ? 'text-emerald-600 animate-pulse' : ''}`} />
                      <span>{isAudioPlaying ? 'Озвучивание...' : 'Озвучить ответ'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 w-fit px-3 py-1.5 rounded-xl shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 animate-spin text-emerald-600" />
            <span>Наставник формирует ответ и карточки...</span>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input Message Form */}
      <form
        onSubmit={handleSendMessage}
        className="bg-white border border-slate-200/90 rounded-2xl p-2.5 flex items-center gap-2 shadow-xs"
      >
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder={`Задайте вопрос или продолжите диалог в сценарии «${selectedScenario}»...`}
          className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-600"
        />
        <button
          type="submit"
          disabled={!inputMessage.trim() || isLoading}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl text-xs cursor-pointer transition-colors flex items-center gap-1.5 shadow-xs"
        >
          <Send className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Отправить</span>
        </button>
      </form>
    </div>
  );
};
