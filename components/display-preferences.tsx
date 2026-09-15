'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Monitor, Moon, Pause, Play, Sun } from 'lucide-react';
import { useTheme } from './theme-provider';
import { useMotionPreference } from './motion-provider';

const themes = [
  { value: 'light', label: 'Light', Icon: Sun },
  { value: 'dark', label: 'Dark', Icon: Moon },
  { value: 'system', label: 'System', Icon: Monitor },
] as const;

export function DisplayPreferences() {
  const { preference, ready, setPreference } = useTheme();
  const { paused, reduced, toggleMotion } = useMotionPreference();
  const pathname = usePathname();
  const [pastHero, setPastHero] = useState(false);
  const visible = pathname !== '/' || pastHero;

  useEffect(() => {
    const hero = document.querySelector('[data-preferences-hero]');
    if (!hero) return;
    // Reveal only after the entire hero (including its arrow) is above the viewport.
    const observer = new IntersectionObserver(([entry]) => {
      setPastHero(!entry.isIntersecting && entry.boundingClientRect.bottom <= 0);
    }, { threshold: 0 });
    observer.observe(hero);
    return () => observer.disconnect();
  }, [pathname]);

  const motionLabel = reduced ? 'Reduced motion' : paused ? 'Resume motion' : 'Pause motion';

  return <aside className="display-preferences" data-visible={visible} data-paused={paused} inert={!visible} aria-hidden={!visible} aria-label="Display preferences">
    <div className="theme-options" role="group" aria-label="Color theme">
      {themes.map(({ value, label, Icon }) => <button key={value} type="button" aria-label={`${label} theme`} title={value === 'system' ? 'Follow device appearance' : `${label} theme`} aria-pressed={ready && preference === value} aria-disabled={!ready} onClick={() => { if (ready) setPreference(value); }}>
        <Icon size={15} aria-hidden="true" /><span className="theme-label">{label}</span>
      </button>)}
    </div>
    <button type="button" className="preference-motion" onClick={toggleMotion} aria-label={motionLabel} aria-pressed={paused} disabled={reduced} title={reduced ? 'Reduced motion follows your device preference' : motionLabel}>
      {paused ? <Play size={14} aria-hidden="true" /> : <Pause size={14} aria-hidden="true" />}<span className="preference-motion-label">{motionLabel}</span>
    </button>
  </aside>;
}
