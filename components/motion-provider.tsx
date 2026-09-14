'use client';

import { createContext, useContext, useEffect, useState } from 'react';

const MotionContext = createContext({ paused: true, ready: false, reduced: false, toggleMotion: () => {} });

export function MotionProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [userPaused, setUserPaused] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(query.matches);
    update();
    try { setUserPaused(localStorage.getItem('portfolio-motion') === 'paused'); } catch { /* Storage is optional. */ }
    setReady(true);
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  const paused = !ready || reduced || userPaused;
  useEffect(() => {
    document.documentElement.dataset.motion = paused ? 'paused' : 'running';
    return () => { delete document.documentElement.dataset.motion; };
  }, [paused]);

  function toggleMotion() {
    if (reduced) return;
    const next = !userPaused;
    setUserPaused(next);
    try { localStorage.setItem('portfolio-motion', next ? 'paused' : 'running'); } catch { /* Storage is optional. */ }
  }

  return <MotionContext.Provider value={{ paused, ready, reduced, toggleMotion }}>{children}</MotionContext.Provider>;
}

export const useMotionPreference = () => useContext(MotionContext);
