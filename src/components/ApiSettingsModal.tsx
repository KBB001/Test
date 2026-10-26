import React, { useState, useEffect } from 'react';
import { X, Key, Check, ShieldCheck, Sparkles, HelpCircle, ExternalLink } from 'lucide-react';
import { getCustomApiKey, setCustomApiKey } from '../services/geminiClient.ts';

interface ApiSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiSettingsModal: React.FC<ApiSettingsModalProps> = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setApiKey(getCustomApiKey());
      setIsSaved(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setCustomApiKey(apiKey);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1200);
  };

  const handleClear = () => {
    setApiKey('');
    setCustomApiKey('');
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Настройки для GitHub Pages</h3>
              <p className="text-xs text-slate-500">Автономный режим и подключение Gemini AI</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSave} className="mt-5 space-y-4">
          <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/60 rounded-xl flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-900 space-y-1">
              <p className="font-semibold">Готово к статической публикации</p>
              <p className="text-emerald-700 leading-relaxed">
                Сайт полностью подготовлен для GitHub Pages! Все интерактивные вкладки, карточки со Spaced Repetition, озвучка и диалоги наставника работают автоматически даже без ввода ключа.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                Собственный ключ Gemini API (опционально)
              </span>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-normal underline"
              >
                Получить бесплатный ключ
                <ExternalLink className="w-3 h-3" />
              </a>
            </label>
            <input
              type="password"
              placeholder="AIzaSy..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-800 font-mono transition-all"
            />
            <p className="text-[11px] text-slate-500 mt-1.5 flex items-center gap-1">
              <HelpCircle className="w-3 h-3 text-slate-400 shrink-0" />
              Ключ хранится только в вашем браузере (localStorage) и не передается третьим лицам.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2">
            {apiKey ? (
              <button
                type="button"
                onClick={handleClear}
                className="text-xs font-medium text-rose-600 hover:text-rose-700 px-3 py-2 rounded-lg hover:bg-rose-50 transition-colors"
              >
                Удалить ключ
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Отмена
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              >
                {isSaved ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-200" />
                    Сохранено!
                  </>
                ) : (
                  'Сохранить'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
