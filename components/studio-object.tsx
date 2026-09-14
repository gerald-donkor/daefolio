'use client';

import { useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Asterisk, Code2, Layers, MousePointer2 } from 'lucide-react';
import { HeroCode } from './hero-code';
import { useMotionPreference } from './motion-provider';

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function StudioObject() {
  const root = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState('Design');
  const { paused } = useMotionPreference();

  useGSAP(() => {
    if (paused) return;
    const mm = gsap.matchMedia();
    mm.add('(pointer: fine) and (prefers-reduced-motion: no-preference)', () => {
      const stage = root.current!.querySelector<HTMLElement>('.lab-canvas')!;
      const sculpture = root.current!.querySelector('.studio-sculpture');
      const xTo = gsap.quickTo(sculpture, 'rotationY', { duration: .7, ease: 'power3.out' });
      const yTo = gsap.quickTo(sculpture, 'rotationX', { duration: .7, ease: 'power3.out' });
      const move = (event: PointerEvent) => {
        const rect = stage.getBoundingClientRect();
        xTo((event.clientX - rect.left - rect.width / 2) * .14);
        yTo(-(event.clientY - rect.top - rect.height / 2) * .14);
      };
      const leave = () => { xTo(0); yTo(0); };
      stage.addEventListener('pointermove', move, { passive: true });
      stage.addEventListener('pointerleave', leave);
      return () => { stage.removeEventListener('pointermove', move); stage.removeEventListener('pointerleave', leave); };
    });
    return () => mm.revert();
  }, { scope: root, dependencies: [paused], revertOnUpdate: true });

  useGSAP(() => {
    if (paused) return;
    gsap.fromTo('.studio-orbit', { scaleY: .7, rotation: -12 }, { scaleY: 1, rotation: 0, duration: .7, stagger: .025, ease: 'power3.out' });
    if (mode === 'Motion') {
      const rotation = gsap.to('.hero-star', { rotation: 360, duration: 35, repeat: -1, ease: 'none', paused: true });
      const sync = () => rotation.paused(document.hidden || !ScrollTrigger.isInViewport(root.current!));
      ScrollTrigger.create({ trigger: root.current, start: 'top bottom', end: 'bottom top', onToggle: sync });
      document.addEventListener('visibilitychange', sync);
      sync();
      return () => document.removeEventListener('visibilitychange', sync);
    }
  }, { scope: root, dependencies: [mode, paused], revertOnUpdate: true });

  return <div ref={root} className="hero-lab hero-detail">
    <div className="lab-heading"><span>The space between</span><span>001—∞</span></div>
    <div className={`lab-canvas mode-${mode.toLowerCase()}`}>
      {mode === 'Code' && <HeroCode />}
      <div className="lab-axis axis-x" /><div className="lab-axis axis-y" />
      <div className="studio-sculpture" aria-hidden="true"><div className="hero-star">
        {Array.from({ length: 12 }, (_, i) => <div className="studio-orbit" key={i} style={{ '--orbit-angle': `${i * 15}deg` } as React.CSSProperties}><i /></div>)}
        <div className="studio-core"><Asterisk strokeWidth={.7} /></div>
      </div></div>
      <span className="lab-coordinate">x: design<br />y: engineering</span>
      <span className="lab-note">{mode === 'Design' ? 'a feeling.' : mode === 'Code' ? 'a function.' : 'an experience.'}</span>
    </div>
    <div className="lab-tabs" role="group" aria-label="Hero visual mode">{['Design', 'Code', 'Motion'].map((item, i) => <button key={item} className={mode === item ? 'active' : ''} aria-pressed={mode === item} onClick={() => setMode(item)}>{[<Layers size={13} key="design" />, <Code2 size={13} key="code" />, <Asterisk size={13} key="motion" />][i]}{item}</button>)}</div>
    <div className="lab-footer"><MousePointer2 size={13} /><span>A little curious? Play around.</span></div>
  </div>;
}
