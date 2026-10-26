import React from 'react';
import { Home, Compass, MessageSquare, Bot, BookMarked, User } from 'lucide-react';

export type TabKey = 'feed' | 'explore' | 'chats' | 'mentor' | 'vocabulary' | 'profile';

interface NavigationProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  unreadChatsCount?: number;
  dueCardsCount?: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  unreadChatsCount = 1,
  dueCardsCount = 4,
}) => {
  const tabs = [
    { id: 'feed' as TabKey, label: 'Главная', icon: Home },
    { id: 'explore' as TabKey, label: 'Обзор', icon: Compass },
    { 
      id: 'chats' as TabKey, 
      label: 'Чаты', 
      icon: MessageSquare,
      badge: unreadChatsCount > 0 ? unreadChatsCount : null,
    },
    { id: 'mentor' as TabKey, label: 'ИИ-наставник', icon: Bot },
    { 
      id: 'vocabulary' as TabKey, 
      label: 'Словарь', 
      icon: BookMarked,
      badge: dueCardsCount > 0 ? dueCardsCount : null,
    },
    { id: 'profile' as TabKey, label: 'Паспорт', icon: User },
  ];

  return (
    <>
      {/* Desktop Navigation Bar (Sticky under Header) */}
      <nav 
        aria-label="Основная навигация десктоп" 
        className="hidden md:block bg-white/95 backdrop-blur-xl border-b border-slate-200/80 sticky top-14 z-30 px-4 sm:px-6 shadow-xs"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-start gap-1.5 py-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`relative flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer select-none ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 border border-transparent'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 transition-colors ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                <span>{tab.id === 'vocabulary' ? 'Словарный запас' : tab.id === 'profile' ? 'Всемирный паспорт' : tab.label}</span>

                {/* Notification Badges */}
                {tab.badge && (
                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full leading-none ${
                    isActive ? 'bg-emerald-400 text-slate-950' : 'bg-slate-200 text-slate-800'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Mobile Bottom Navigation Bar (Sticky bottom for screens < 768px) */}
      <nav
        aria-label="Основная мобильная навигация"
        className="md:hidden sticky bottom-0 inset-x-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-2xl px-2 py-1.5"
      >
        <div className="flex items-center justify-around">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`relative flex flex-col items-center justify-center min-w-[48px] min-h-[48px] py-1 px-1 rounded-xl transition-all cursor-pointer select-none ${
                  isActive
                    ? 'text-slate-900 font-bold'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <div className={`relative p-1 rounded-lg ${isActive ? 'bg-slate-100 text-emerald-600' : ''}`}>
                  <Icon className="w-5 h-5" />
                  {tab.badge && (
                    <span className="absolute -top-1 -right-1.5 min-w-[16px] h-4 bg-emerald-500 text-white text-[9px] font-mono font-bold rounded-full flex items-center justify-center px-0.5">
                      {tab.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] tracking-tight mt-0.5 leading-tight">
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
