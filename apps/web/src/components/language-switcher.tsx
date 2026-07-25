'use client';

import { useI18n } from '@/i18n';
import { Globe } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const LOCALES = [
  { code: 'fr' as const, label: 'Français', flag: '🇫🇷' },
  { code: 'ar' as const, label: 'العربية', flag: '🇹🇳' },
  { code: 'en' as const, label: 'English', flag: '🇬🇧' },
];

export function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const current = LOCALES.find((l) => l.code === locale) || LOCALES[0];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground rounded-lg hover:bg-brand-teal-soft/50 dark:hover:bg-brand-teal-soft/20 transition-colors"
        aria-label="Change language"
      >
        <Globe className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">{current.flag} {current.label}</span>
        <span className="sm:hidden">{current.flag}</span>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-40 rounded-xl border border-border bg-card shadow-lg py-1 z-50">
          {LOCALES.map((l) => (
            <button
              key={l.code}
              onClick={() => { setLocale(l.code); setOpen(false); }}
              className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 transition-colors ${
                l.code === locale
                  ? 'bg-brand-teal-soft/60 dark:bg-brand-teal-soft/20 text-brand-teal dark:text-brand-cyan font-medium'
                  : 'text-foreground hover:bg-muted'
              }`}
            >
              <span>{l.flag}</span>
              <span>{l.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
