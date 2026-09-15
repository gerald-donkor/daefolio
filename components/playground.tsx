'use client';
import { useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Flip } from 'gsap/Flip';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Asterisk, RotateCcw, ArrowUpRight, ArrowLeftRight, MousePointer2 } from 'lucide-react';
import { Slider } from './ui/slider';
import { Button } from './ui/button';
import { useMotionPreference } from './motion-provider';

gsap.registerPlugin(useGSAP, Flip, ScrollTrigger);
export function Playground() {
  const root = useRef<HTMLDivElement>(null);
  const kinetic = useRef<gsap.core.Timeline | null>(null);
  const flipState = useRef<ReturnType<typeof Flip.getState> | null>(null);
  const flipTween = useRef<gsap.core.Timeline | null>(null);
  const { paused } = useMotionPreference();
  const [speed, setSpeed] = useState([55]);
  const [spring, setSpring] = useState(false);
  const [layout, setLayout] = useState(false);
  const initialSpring = useRef(true);

  useGSAP(() => {
    if (paused) return;
    const letters = root.current!.querySelectorAll('.kinetic-stage span');
    const timeline = gsap.timeline({ repeat: -1, paused: true });
    timeline.to(letters, { y: -22, rotation: i => i % 2 ? 6 : -6, duration: .55, stagger: .1, ease: 'sine.inOut' })
      .to(letters, { y: 0, rotation: 0, duration: .55, stagger: .1, ease: 'sine.inOut' }, .55);
    timeline.timeScale(.45 + speed[0] / 55);
    kinetic.current = timeline;
    const sync = () => { timeline.paused(document.hidden || !ScrollTrigger.isInViewport(root.current!)); };
    ScrollTrigger.create({ trigger: root.current, start: 'top bottom', end: 'bottom top', onToggle: sync });
    document.addEventListener('visibilitychange', sync);
    sync();
    return () => { kinetic.current = null; document.removeEventListener('visibilitychange', sync); };
  }, { scope: root, dependencies: [paused], revertOnUpdate: true });

  useGSAP(() => { kinetic.current?.timeScale(.45 + speed[0] / 55); }, { scope: root, dependencies: [speed[0]] });
  useGSAP(() => {
    gsap.to('.spring-knob', { x: spring ? 75 : -75, rotation: spring ? 180 : 0, duration: paused || initialSpring.current ? 0 : 1.1, ease: 'elastic.out(1, .38)', overwrite: true });
    initialSpring.current = false;
  }, { scope: root, dependencies: [spring, paused] });

  useGSAP(() => {
    if (flipState.current && !paused) flipTween.current = Flip.from(flipState.current, { duration: .65, ease: 'power3.inOut', scale: true });
    else flipTween.current?.progress(1);
    flipState.current = null;
  }, { scope: root, dependencies: [layout, paused] });

  const { contextSafe } = useGSAP({ scope: root });
  const changeLayout = contextSafe(() => {
    flipTween.current?.progress(1);
    flipState.current = Flip.getState(root.current!.querySelectorAll('.layout-piece'));
    setLayout(value => !value);
  });

  return <div ref={root} className="play-grid">
    <div className="play-card"><div className="play-meta"><span>001 / KINETIC TYPE</span><span className="play-marker" aria-hidden="true"><RotateCcw size={16} /></span></div>
      <div className="kinetic-stage" role="img" aria-label="The word FEEL, animated at your chosen tempo">{'FEEL'.split('').map((letter, i) => <span key={i} aria-hidden="true">{letter}</span>)}</div>
      <div className="play-control"><label id="tempo-label">Tempo</label><Slider aria-labelledby="tempo-label" value={speed} min={0} max={100} step={1} onValueChange={setSpeed} /><span>{speed[0]}%</span></div>
      <div className="play-caption"><h3>Type with a pulse</h3><p>Find your own rhythm. Adjust the tempo.</p></div>
    </div>
    <div className="play-card"><div className="play-meta"><span>002 / SPRING PHYSICS</span><span className="play-marker" aria-hidden="true"><MousePointer2 size={16} /></span></div>
      <div className="spring-stage"><div className="spring-track" /><button aria-label="Toggle spring position" aria-pressed={spring} className="spring-knob" onClick={() => setSpring(value => !value)}><Asterisk size={42} strokeWidth={1.2} /></button></div>
      <Button variant="outline" size="sm" className="play-trigger" onClick={() => setSpring(value => !value)}>Give it a nudge <ArrowUpRight size={14} /></Button>
      <div className="play-caption"><h3>A satisfying little spring</h3><p>Click the shape. Watch it find its balance.</p></div>
    </div>
    <div className="play-card"><div className="play-meta"><span>003 / FLUID LAYOUT</span><span className="play-marker" aria-hidden="true"><ArrowLeftRight size={16} /></span></div>
      <div className={'layout-stage ' + (layout ? 'layout-alternate' : '')} aria-hidden="true"><div className="layout-piece piece-one" /><div className="layout-piece piece-two" /><div className="layout-piece piece-three" /></div>
      <Button variant="outline" size="sm" className="play-trigger" onClick={changeLayout} aria-pressed={layout}>Change perspective <ArrowUpRight size={14} /></Button>
      <div className="play-caption"><h3>Same pieces. New possibilities.</h3><p>A small study in seamless state changes.</p></div>
    </div>
  </div>;
}
