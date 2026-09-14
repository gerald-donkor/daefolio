'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';
export type ThemePreference = Theme | 'system';
const storageKey = 'portfolio-theme-v1';
const ThemeContext = createContext({ preference: 'dark' as ThemePreference, theme: 'dark' as Theme, ready: false, setPreference: (_value: ThemePreference) => {} });
const parsePreference = (value: string | null): ThemePreference => value === 'light' || value === 'dark' || value === 'system' ? value : 'dark';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>('dark');
  const [theme, setTheme] = useState<Theme>('dark');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(prefers-color-scheme: dark)');
    let current: ThemePreference = 'dark';
    try { current = parsePreference(localStorage.getItem(storageKey)); } catch { /* Storage is optional. */ }
    const apply = () => {
      const resolved = current === 'system' ? (query.matches ? 'dark' : 'light') : current;
      document.documentElement.dataset.theme = resolved;
      setPreferenceState(current);
      setTheme(resolved);
    };
    const onPreference = (event: Event) => { current = (event as CustomEvent<ThemePreference>).detail; apply(); };
    const onStorage = (event: StorageEvent) => {
      if (event.key === storageKey || event.key === null) { current = parsePreference(event.newValue); apply(); }
    };
    apply();
    setReady(true);
    query.addEventListener('change', apply);
    window.addEventListener('portfolio-theme-change', onPreference);
    window.addEventListener('storage', onStorage);
    return () => {
      query.removeEventListener('change', apply);
      window.removeEventListener('portfolio-theme-change', onPreference);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  function setPreference(value: ThemePreference) {
    try { localStorage.setItem(storageKey, value); } catch { /* Keep the choice for this visit. */ }
    window.dispatchEvent(new CustomEvent('portfolio-theme-change', { detail: value }));
  }

  return <ThemeContext.Provider value={{ preference, theme, ready, setPreference }}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
