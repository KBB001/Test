import React, { useState } from 'react';
import { 
  Award, 
  ShieldCheck, 
  Sparkles, 
  Globe, 
  BookOpen, 
  Share2, 
  Check, 
  Clock, 
  Flame, 
  ExternalLink,
  ChevronRight,
  Shield,
  Layers
} from 'lucide-react';
import { UserPassport, PassportStamp } from '../types/index.ts';
import { CEFR_DESCRIPTIONS, SUPPORTED_LANGUAGES } from '../utils/language.ts';

interface ProfileTabProps {
  passport: UserPassport;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({ passport }) => {
  const [selectedStamp, setSelectedStamp] = useState<PassportStamp | null>(passport.stamps[0] || null);
  const [copiedShare, setCopiedShare] = useState<boolean>(false);

  const handleSharePassport = () => {
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2500);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* Toast Feedback */}
      {copiedShare && (
        <div className="fixed bottom-20 md:bottom-6 right-6 z-50 bg-white border border-amber-300 text-amber-800 px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold backdrop-blur-md">
          <Check className="w-3.5 h-3.5 text-amber-600" />
          <span>Ссылка на Всемирный паспорт скопирована!</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-amber-800 font-bold mb-1">
            <Award className="w-3.5 h-3.5 text-amber-600" />
            <span>Официальный статус полиглота</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Всемирный паспорт языков
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Единый международный документ языковой компетенции, визовых штампов и активных достижений
          </p>
        </div>

        <button
          onClick={handleSharePassport}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-xs transition-all cursor-pointer"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Поделиться паспортом</span>
        </button>
      </div>

      {/* THE WORLD PASSPORT CARD (Dribbble/Linear Luxe Biometric Booklet Design in Light Aesthetic) */}
      <div className="relative rounded-3xl passport-pattern border-2 border-amber-300 shadow-xl p-6 sm:p-8 overflow-hidden">
        {/* Top Gold Leaf Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 opacity-90" />
        
        {/* Watermark Crest */}
        <div className="absolute right-4 bottom-4 opacity-[0.04] pointer-events-none select-none">
          <Globe className="w-96 h-96 text-amber-800" />
        </div>

        {/* Passport Booklet Header */}
        <div className="flex items-center justify-between pb-6 border-b border-amber-200 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border border-amber-300 flex items-center justify-center bg-amber-100 text-amber-800 shadow-2xs">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-mono tracking-[0.25em] text-amber-800 uppercase font-bold">
                COMMUNAUTÉ LINGUISTIQUE INTERNATIONALE
              </div>
              <h2 className="text-base sm:text-lg font-black tracking-wider text-slate-900">
                ВСЕМИРНЫЙ ПАСПОРТ ЯЗЫКОВ
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-amber-900 font-extrabold px-3 py-1 rounded-lg bg-amber-100 border border-amber-300 shadow-2xs">
              {passport.passportNumber}
            </span>
          </div>
        </div>

        {/* Passport Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6">
          {/* Left Page: Identity & Credentials */}
          <div className="lg:col-span-5 bg-white/95 border border-amber-200/80 rounded-2xl p-5 space-y-5 shadow-xs">
            <div className="flex items-start gap-4">
              {/* Photo with holographic seal */}
              <div className="relative shrink-0">
                <img
                  src={passport.avatarUrl}
                  alt={passport.holderName}
                  className="w-20 h-24 sm:w-24 sm:h-28 object-cover rounded-xl border-2 border-amber-300 shadow-sm"
                />
                <div className="absolute -bottom-2 -right-2 bg-white p-1 rounded-full border border-amber-400 shadow">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                </div>
              </div>

              {/* Data fields */}
              <div className="space-y-2 flex-1 min-w-0">
                <div>
                  <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider block font-semibold">
                    Владелец / Holder
                  </span>
                  <div className="font-extrabold text-slate-900 text-sm sm:text-base leading-tight">
                    {passport.holderName}
                  </div>
                  <div className="text-xs text-amber-800 font-mono font-bold">
                    {passport.holderHandle}
                  </div>
                </div>

                <div>
                  <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider block font-semibold">
                    Гражданство / Nationality
                  </span>
                  <div className="text-xs font-semibold text-slate-800">
                    🌍 {passport.nationality}
                  </div>
                </div>

                <div>
                  <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider block font-semibold">
                    Выдан / Authority
                  </span>
                  <div className="text-xs font-semibold text-slate-800">
                    {passport.issuedCity}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center">
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-xs font-mono font-bold text-amber-800">{passport.streakDays} дн.</div>
                <div className="text-[9px] font-mono text-slate-500 uppercase font-medium">Серия</div>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-xs font-mono font-bold text-emerald-700">{passport.totalWordsLearned}</div>
                <div className="text-[9px] font-mono text-slate-500 uppercase font-medium">Слов</div>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-xs font-mono font-bold text-indigo-700">#{passport.globalRank}</div>
                <div className="text-[9px] font-mono text-slate-500 uppercase font-medium">Рейтинг</div>
              </div>
            </div>

            {/* MRZ Zone */}
            <div className="p-2.5 rounded-lg bg-slate-100 border border-slate-200 font-mono text-[10px] text-slate-800 font-bold tracking-widest leading-none select-none overflow-x-auto no-scrollbar">
              <div>P&lt;GLDROMANOV&lt;&lt;ALEKSANDR&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;</div>
              <div className="mt-1">EU88241908GLD9501158M3501150&lt;&lt;&lt;&lt;&lt;&lt;&lt;04</div>
            </div>
          </div>

          {/* Right Page: Visa Stamps Grid */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-amber-600" />
                  <span>Визовые штампы & Языковые гильдии</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Нажмите на штамп для просмотра условий получения
                </p>
              </div>
              <span className="text-[10px] font-mono text-slate-600 font-semibold bg-amber-100 px-2 py-0.5 rounded border border-amber-200">
                VISA PAGES
              </span>
            </div>

            {/* Asymmetric Stamps Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-white/95 border border-amber-200 min-h-[220px] shadow-xs">
              {passport.stamps.map((stamp, idx) => {
                const isSelected = selectedStamp?.id === stamp.id;
                const rotations = ['rotate-1', '-rotate-2', 'rotate-2', '-rotate-1'];
                const rot = rotations[idx % rotations.length];

                return (
                  <button
                    key={stamp.id}
                    onClick={() => setSelectedStamp(stamp)}
                    className={`relative p-3 rounded-xl border transition-all cursor-pointer transform ${rot} hover:rotate-0 hover:scale-[1.03] text-left flex flex-col justify-between ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50/80 shadow-md ring-2 ring-amber-400'
                        : 'border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="text-[9px] font-mono uppercase font-bold tracking-wider text-slate-500">
                        {stamp.city}
                      </div>

                      <div 
                        className="font-black text-xs tracking-tight uppercase mt-0.5"
                        style={{ color: stamp.primaryColor }}
                      >
                        {stamp.title}
                      </div>
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-[10px] font-mono font-extrabold px-1.5 py-0.2 rounded bg-slate-900 text-white shadow-2xs">
                        {stamp.cefrLevel}
                      </span>
                      <span className="text-[9px] font-mono text-slate-500 font-medium">
                        {stamp.dateAwarded}
                      </span>
                    </div>
                  </button>
                );
              })}

              {/* Locked Stamps Preview */}
              <div className="p-3 rounded-xl border border-dashed border-slate-300 bg-slate-50/50 flex flex-col items-center justify-center text-center opacity-70">
                <span className="text-lg">🇩🇪</span>
                <span className="text-[11px] font-bold text-slate-600 mt-1">Берлин (B1)</span>
                <span className="text-[9px] font-mono text-slate-500">Осталось 40 слов</span>
              </div>

              <div className="p-3 rounded-xl border border-dashed border-slate-300 bg-slate-50/50 flex flex-col items-center justify-center text-center opacity-70">
                <span className="text-lg">🇬🇧</span>
                <span className="text-[11px] font-bold text-slate-600 mt-1">Лондон (C1)</span>
                <span className="text-[9px] font-mono text-slate-500">Осталось 12 бесед</span>
              </div>
            </div>

            {/* Stamp Inspector Micro-Widget */}
            {selectedStamp && (
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3 shadow-xs">
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-xs shrink-0 shadow-xs"
                  style={{ backgroundColor: selectedStamp.primaryColor }}
                >
                  {selectedStamp.cefrLevel}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900">
                      {selectedStamp.title} ({selectedStamp.city}, {selectedStamp.country})
                    </h4>
                    <span className="text-[10px] font-mono text-amber-800 font-bold">
                      {selectedStamp.dateAwarded}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    {selectedStamp.description}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Language Fluency & Mastery Statistics */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-emerald-600" />
            <span>Прогресс в изучаемых языках</span>
          </h3>
          <span className="text-[10px] font-mono text-slate-500 uppercase font-semibold">
            CEFR European Framework
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {passport.languages.map(lang => (
            <div key={lang.language} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{lang.flag}</span>
                  <div>
                    <span className="font-bold text-xs sm:text-sm text-slate-900 block">{lang.name}</span>
                    <span className="text-[10px] font-mono text-slate-500">{lang.practiceHours} ч. практики</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {lang.cefrLevel}
                </span>
              </div>

              {/* Progress bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-mono text-slate-600 font-medium">
                  <span>{lang.wordsLearned} / {lang.targetWords} слов</span>
                  <span className="font-bold text-slate-900">{lang.fluencyPercent}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-700"
                    style={{ width: `${lang.fluencyPercent}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1">
                <span>Серия: {lang.activeStreak} дн.</span>
                <span className="text-emerald-700 font-semibold">Активный</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
