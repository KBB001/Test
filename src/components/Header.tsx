import React from 'react';
import { Globe, Flame, BookOpen, Award } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../utils/language.ts';
import { LanguageCode } from '../types/index.ts';

interface HeaderProps {
  currentLanguage: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  streakDays: number;
  totalWordsLearned: number;
  globalRank: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentLanguage,
  onLanguageChange,
  streakDays,
  totalWordsLearned,
  globalRank,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-slate-200/80 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 p-[1px] shadow-xs">
            <div className="w-full h-full bg-emerald-50 rounded-[7px] flex items-center justify-center">
              <Globe className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-bold tracking-tight text-slate-900 font-sans">
              LinguaGlobus
            </span>
            <span className="hidden sm:inline-block font-mono text-[10px] tracking-wider uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 font-medium">
              Global v2.4
            </span>
          </div>
        </div>

        {/* Micro Stats Bar */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Daily Streak */}
          <div 
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 border border-amber-200/70 text-amber-800 text-xs font-medium"
            title="Дни непрерывной языковой практики"
          >
            <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span className="font-mono text-[11px] font-bold">{streakDays}d</span>
          </div>

          {/* Words Count */}
          <div 
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-slate-800 text-xs font-medium"
            title="Всего освоено слов"
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
            <span className="font-mono text-[11px] font-bold">{totalWordsLearned}</span>
            <span className="hidden md:inline text-slate-500 text-[11px]">слов</span>
          </div>

          {/* Rank */}
          <div 
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-50 border border-indigo-200/70 text-indigo-900 text-xs font-medium"
            title="Мировой рейтинг"
          >
            <Award className="w-3.5 h-3.5 text-indigo-600" />
            <span className="font-mono text-[11px] font-semibold">#{globalRank.toLocaleString()}</span>
          </div>

          {/* Language Selector */}
          <div className="relative">
            <select
              aria-label="Выбрать изучаемый язык"
              value={currentLanguage}
              onChange={(e) => onLanguageChange(e.target.value as LanguageCode)}
              className="bg-slate-100 hover:bg-slate-200/80 text-slate-800 text-xs font-semibold pl-2.5 pr-7 py-1 rounded-md border border-slate-200 focus:outline-none focus:border-emerald-600 cursor-pointer transition-colors"
            >
              {Object.values(SUPPORTED_LANGUAGES).map((lang) => (
                <option key={lang.code} value={lang.code} className="bg-white text-slate-800">
                  {lang.flag} {lang.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </header>
  );
};
