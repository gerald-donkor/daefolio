'use client';

import { useRef, type RefObject } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useMotionPreference } from './motion-provider';
import { useTheme } from './theme-provider';

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function CursorFollower() {
  const ring = useRef<HTMLDivElement>(null);
  const { paused } = useMotionPreference();
  const { theme } = useTheme();
  useGSAP(() => {
    if (paused || theme !== 'dark') return;
    const mm = gsap.matchMedia();
    mm.add('(pointer: fine) and (min-width: 701px) and (prefers-reduced-motion: no-preference)', () => {
      const element = ring.current!;
      const xTo = gsap.quickTo(element, 'x', { duration: .12, ease: 'power2.out' });
      const yTo = gsap.quickTo(element, 'y', { duration: .12, ease: 'power2.out' });
      let visible = false;
      const hide = () => { visible = false; element.style.visibility = 'hidden'; };
      const move = (event: PointerEvent) => {
        const target = event.target;
        if (!(target instanceof Element) || !target.closest('.studio-chapter') || event.pointerType === 'touch') { hide(); return; }
        if (!visible) { xTo(event.clientX - 13, event.clientX - 13); yTo(event.clientY - 13, event.clientY - 13); }
        else { xTo(event.clientX - 13); yTo(event.clientY - 13); }
        element.style.visibility = 'visible';
        visible = true;
      };
      document.addEventListener('pointermove', move, { passive: true });
      document.addEventListener('pointerleave', hide);
      window.addEventListener('scroll', hide, { passive: true });
      window.addEventListener('blur', hide);
      return () => {
        hide(); document.removeEventListener('pointermove', move); document.removeEventListener('pointerleave', hide);
        window.removeEventListener('scroll', hide); window.removeEventListener('blur', hide);
      };
    });
    return () => mm.revert();
  }, { scope: ring, dependencies: [paused, theme], revertOnUpdate: true });
  return <div ref={ring} className="cursor-ring" aria-hidden="true" />;
}

export function usePortfolioMotion(root: RefObject<HTMLDivElement | null>) {
  const { paused } = useMotionPreference();
  const entered = useRef(false);
  useGSAP(() => {
    if (paused) return;
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      if (!entered.current) {
        entered.current = true;
        gsap.timeline({ defaults: { ease: 'power3.out', duration: 1 } })
          .addLabel('arrive')
          .from('.hero-line > span', { yPercent: 105, rotation: 2, stagger: .11, clearProps: 'transform' }, 'arrive')
          .from('.hero-detail', { opacity: 0, y: 12, stagger: .08, duration: .75, clearProps: 'opacity,transform' }, 'arrive+=.3');
      }
      gsap.to('.page-progress', { scaleX: 1, ease: 'none', scrollTrigger: { trigger: document.documentElement, start: 'top top', end: 'bottom bottom', scrub: true } });
      gsap.from('.chapter-cut', { scaleX: .78, transformOrigin: 'left bottom', ease: 'power2.out', scrollTrigger: { trigger: '#work', start: 'top bottom', end: 'top 50%', scrub: 1 } });
      gsap.from('.project-aetherfield .project-visual', { scale: 1.055, ease: 'none', scrollTrigger: { trigger: '.project-aetherfield', start: 'top bottom', end: 'center center', scrub: 1 } });
      gsap.from('.contact-title', { opacity: .4, y: 20, duration: 1, scrollTrigger: { trigger: '#contact', start: 'top 75%', once: true }, clearProps: 'opacity,transform' });
      const ribbon = root.current!.querySelector<HTMLElement>('.tech-ribbon')!;
      const marquee = gsap.to('.tech-track', { xPercent: -50, duration: 42, repeat: -1, ease: 'none', paused: true });
      let hovering = false;
      const sync = () => { marquee.paused(hovering || document.hidden || !ScrollTrigger.isInViewport(ribbon)); };
      const enter = () => { hovering = true; sync(); };
      const leave = () => { hovering = false; sync(); };
      ScrollTrigger.create({ trigger: ribbon, start: 'top bottom', end: 'bottom top', onToggle: sync });
      ribbon.addEventListener('pointerenter', enter); ribbon.addEventListener('pointerleave', leave);
      ribbon.addEventListener('focusin', enter); ribbon.addEventListener('focusout', leave);
      document.addEventListener('visibilitychange', sync);
      sync();
      let active = true;
      document.fonts.ready.then(() => { if (active) ScrollTrigger.refresh(); });
      return () => {
        active = false;
        ribbon.removeEventListener('pointerenter', enter); ribbon.removeEventListener('pointerleave', leave);
        ribbon.removeEventListener('focusin', enter); ribbon.removeEventListener('focusout', leave);
        document.removeEventListener('visibilitychange', sync);
      };
    });
    return () => mm.revert();
  }, { scope: root, dependencies: [paused], revertOnUpdate: true });
}
