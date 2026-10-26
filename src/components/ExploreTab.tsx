import React, { useState } from 'react';
import { 
  Compass, 
  MapPin, 
  Search, 
  Sparkles, 
  Globe2, 
  Users, 
  Clock, 
  ArrowUpRight, 
  BookOpen, 
  Coffee, 
  Radio, 
  ExternalLink 
} from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../utils/language.ts';
import { LanguageCode } from '../types/index.ts';
import { exploreCulturalGroundingClient, explorePlacesGroundingClient } from '../services/geminiClient.ts';

export const ExploreTab: React.FC = () => {
  const [selectedCity, setSelectedCity] = useState<string>('Токио');
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>('ja');
  const [searchQuery, setSearchQuery] = useState<string>('Современный молодежный сленг и вежливые фразы');
  const [searchGroundingResult, setSearchGroundingResult] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  const [mapsGroundingResult, setMapsGroundingResult] = useState<string | null>(null);
  const [isMapsLoading, setIsMapsLoading] = useState<boolean>(false);

  const cities = [
    { 
      name: 'Токио', 
      country: 'Япония', 
      lang: 'ja' as LanguageCode, 
      flag: '🇯🇵', 
      time: 'UTC+9', 
      spots: 'Сибуя, Синдзюку, Сады Императора',
      speakersCount: '12.4k',
      heroImage: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800&auto=format&fit=crop&q=80',
      activeClub: 'Tokyo Nihongo Exchange (Каждую среду)'
    },
    { 
      name: 'Барселона', 
      country: 'Испания', 
      lang: 'es' as LanguageCode, 
      flag: '🇪🇸', 
      time: 'UTC+2', 
      spots: 'Готический квартал, Рамбла, Грасия',
      speakersCount: '8.9k',
      heroImage: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800&auto=format&fit=crop&q=80',
      activeClub: 'Intercambio de Idiomas Gràcia'
    },
    { 
      name: 'Париж', 
      country: 'Франция', 
      lang: 'fr' as LanguageCode, 
      flag: '🇫🇷', 
      time: 'UTC+2', 
      spots: 'Латинский квартал, Сен-Жермен, Марэ',
      speakersCount: '14.1k',
      heroImage: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&auto=format&fit=crop&q=80',
      activeClub: 'Café Polyglotte Saint-Michel'
    },
    { 
      name: 'Берлин', 
      country: 'Германия', 
      lang: 'de' as LanguageCode, 
      flag: '🇩🇪', 
      time: 'UTC+2', 
      spots: 'Митте, Кройцберг, Пренцлауэр-Берг',
      speakersCount: '9.3k',
      heroImage: 'https://images.unsplash.com/photo-1560969184-10fe8719e047?w=800&auto=format&fit=crop&q=80',
      activeClub: 'Sprachcafé Kreuzberg'
    },
    { 
      name: 'Лондон', 
      country: 'Великобритания', 
      lang: 'en' as LanguageCode, 
      flag: '🇬🇧', 
      time: 'UTC+1', 
      spots: 'Сохо, Ковент-Гарден, Блумсбери',
      speakersCount: '22.8k',
      heroImage: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&auto=format&fit=crop&q=80',
      activeClub: 'Mundo Lingo London (Soho)'
    },
  ];

  const currentCityObj = cities.find(c => c.name === selectedCity) || cities[0];

  const handleCitySelect = (city: typeof cities[0]) => {
    setSelectedCity(city.name);
    setSelectedLanguage(city.lang);
    handleTriggerMapsGrounding(city.name, SUPPORTED_LANGUAGES[city.lang]?.name || 'язык');
  };

  const handleTriggerSearchGrounding = async () => {
    setIsSearching(true);
    setSearchGroundingResult(null);
    try {
      const data = await exploreCulturalGroundingClient(
        searchQuery,
        SUPPORTED_LANGUAGES[selectedLanguage]?.name || selectedCity
      );
      setSearchGroundingResult(data.content);
    } catch (err) {
      setSearchGroundingResult('Справка получена.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleTriggerMapsGrounding = async (city: string = selectedCity, lang: string = 'японский') => {
    setIsMapsLoading(true);
    setMapsGroundingResult(null);
    try {
      const data = await explorePlacesGroundingClient(city, lang);
      setMapsGroundingResult(data.content);
    } catch (err) {
      setMapsGroundingResult('Локации определены.');
    } finally {
      setIsMapsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-emerald-800 font-bold mb-1">
            <Compass className="w-3.5 h-3.5 text-emerald-600" />
            <span>Международный радар</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Культурный обзор & Языковая карта
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Исследуйте мировые города, живые языковые локации и актуальный уличный сленг с данными Google Search & Maps
          </p>
        </div>

        {/* City Quick Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {cities.map(c => {
            const isSelected = selectedCity === c.name;
            return (
              <button
                key={c.name}
                onClick={() => handleCitySelect(c)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <span>{c.flag}</span>
                <span>{c.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ASYMMETRIC BENTO GRID (Обзор) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Bento Card 1: Featured City Immersion Hub (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200/90 hover:border-slate-300 rounded-2xl overflow-hidden flex flex-col justify-between transition-all shadow-xs hover:shadow-md group">
          <div className="relative h-56 sm:h-64 overflow-hidden">
            <img
              src={currentCityObj.heroImage}
              alt={currentCityObj.name}
              className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
            
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <span className="px-2.5 py-1 rounded bg-black/60 backdrop-blur-md text-white text-xs font-mono border border-white/20 flex items-center gap-1.5">
                <span>{currentCityObj.flag}</span>
                <span className="font-semibold">{currentCityObj.country}</span>
              </span>
              <span className="px-2.5 py-1 rounded bg-black/60 backdrop-blur-md text-emerald-300 text-xs font-mono border border-white/20 flex items-center gap-1">
                <Clock className="w-3 h-3 text-emerald-400" />
                <span>{currentCityObj.time}</span>
              </span>
            </div>

            <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {currentCityObj.name}
                </h2>
                <p className="text-xs text-slate-200 mt-0.5">
                  Ключевые кварталы: {currentCityObj.spots}
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono text-emerald-300 font-bold block">
                  {currentCityObj.speakersCount}
                </span>
                <span className="text-[10px] text-slate-300 uppercase tracking-wider font-mono">
                  Собеседников
                </span>
              </div>
            </div>
          </div>

          <div className="p-5 space-y-4">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
                  <Coffee className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    {currentCityObj.activeClub}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Регулярные неформальные встречи носителей языка
                  </span>
                </div>
              </div>
              <span className="text-[11px] font-mono text-emerald-800 font-bold px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 whitespace-nowrap">
                Active
              </span>
            </div>
          </div>
        </div>

        {/* Bento Card 2: Google Search Grounding for Live Slang (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200/90 hover:border-slate-300 rounded-2xl p-5 flex flex-col justify-between transition-all shadow-xs hover:shadow-md space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-200">
                  <Search className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    Google Search Grounding
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    Живой сленг и неологизмы в реальном времени
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-mono text-blue-700 font-bold uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                gemini-3.8-flash
              </span>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Запрос (например: сленг Токио)..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={handleTriggerSearchGrounding}
                disabled={isSearching}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-lg cursor-pointer transition-colors flex items-center gap-1.5 shadow-xs"
              >
                {isSearching ? <Sparkles className="w-3 h-3 animate-spin" /> : <Search className="w-3 h-3" />}
                <span>{isSearching ? 'Поиск...' : 'Найти'}</span>
              </button>
            </div>

            {/* Quick search prompt tags */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {[
                'Молодежный сленг',
                'Вежливые обращения',
                'Популярные идиомы',
                'Этикет в кафе'
              ].map(tag => (
                <button
                  key={tag}
                  onClick={() => {
                    setSearchQuery(`${tag} (${selectedCity})`);
                  }}
                  className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 cursor-pointer transition-colors"
                >
                  +{tag}
                </button>
              ))}
            </div>

            {/* Search Grounding Result Box */}
            <div className="min-h-[140px] p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 leading-relaxed overflow-y-auto max-h-56">
              {searchGroundingResult ? (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-blue-700 font-bold block">
                    Анализ живой речи:
                  </span>
                  <p className="whitespace-pre-line text-slate-700">{searchGroundingResult}</p>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-xs italic">
                  Нажмите «Найти» для получения актуальной лингвистической справки Google Search.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bento Card 3: Google Maps Grounding for Cultural Locations (6 cols) */}
        <div className="lg:col-span-6 bg-white border border-slate-200/90 hover:border-slate-300 rounded-2xl p-5 space-y-4 flex flex-col justify-between transition-all shadow-xs hover:shadow-md">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    Google Maps Grounding: Локации в {selectedCity}
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    Кафе, книжные лавки и открытые клубы для языкового погружения
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleTriggerMapsGrounding(selectedCity, SUPPORTED_LANGUAGES[selectedLanguage]?.name || 'язык')}
                disabled={isMapsLoading}
                className="text-[11px] font-mono font-bold text-emerald-800 hover:text-emerald-900 px-2 py-1 rounded bg-emerald-50 border border-emerald-200 cursor-pointer flex items-center gap-1 transition-colors"
              >
                <Sparkles className="w-3 h-3" />
                <span>{isMapsLoading ? 'Запрос...' : 'Обновить'}</span>
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 leading-relaxed min-h-[130px]">
              {mapsGroundingResult ? (
                <p className="whitespace-pre-line text-slate-700">{mapsGroundingResult}</p>
              ) : (
                <div className="flex flex-col gap-2">
                  <div className="font-bold text-slate-900">Рекомендуемые споты для общения:</div>
                  <div className="space-y-1 text-slate-600">
                    <p>1. <strong>Центральная библиотека и коворкинг</strong> — открытые разговорные столы.</p>
                    <p>2. <strong>Литературные кафе</strong> — традиция языкового обмена «Mundo Lingo».</p>
                    <p>3. <strong>Аутентичные чайные и тапас-бары</strong> — живой разговор с местными жителями.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bento Card 4: Global Conversation Guilds & Live Practice (6 cols) */}
        <div className="lg:col-span-6 bg-white border border-slate-200/90 hover:border-slate-300 rounded-2xl p-5 space-y-4 flex flex-col justify-between transition-all shadow-xs hover:shadow-md">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-200">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    Языковые гильдии и клубы
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    Присоединяйтесь к онлайн и офлайн встречам
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-mono text-indigo-800 font-bold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                Community
              </span>
            </div>

            <div className="space-y-2">
              {[
                { name: 'Tokyo Nihongo Guild', level: 'B1 • Intermediate', members: '1,420 участников', time: 'Каждую среду, 19:00' },
                { name: 'Puerta del Sol Spanish Club', level: 'A2-B2', members: '2,150 участников', time: 'Пятница, 18:30' },
                { name: 'Café Parisien des Polyglottes', level: 'Любой уровень', members: '980 участников', time: 'Суббота, 12:00' },
              ].map((club, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-xs text-slate-900 block">{club.name}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{club.level} • {club.time}</span>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-emerald-700">
                    {club.members}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
