'use client';

import { useRef, type RefObject } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { useMotionPreference } from './motion-provider';
import styles from './portfolio-motion.module.css';

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

export function CursorFollower() {
  const ring = useRef<HTMLDivElement>(null);
  const { paused } = useMotionPreference();
  useGSAP(() => {
    if (paused) return;
    const mm = gsap.matchMedia();
    mm.add('(pointer: fine) and (min-width: 701px) and (prefers-reduced-motion: no-preference)', () => {
      const element = ring.current!;
      const xTo = gsap.quickTo(element, 'x', { duration: 0.35, ease: 'expo.out' });
      const yTo = gsap.quickTo(element, 'y', { duration: 0.35, ease: 'expo.out' });
      const scaleTo = gsap.quickTo(element, 'scale', { duration: 0.45, ease: 'expo.out' });
      let visible = false;
      const hide = () => { visible = false; element.style.visibility = 'hidden'; element.dataset.pressed = 'false'; };
      const move = (event: PointerEvent) => {
        if (event.pointerType === 'touch') return hide();
        if (!visible) { gsap.set(element, { x: event.clientX, y: event.clientY }); }
        xTo(event.clientX); yTo(event.clientY);
        const target = event.target instanceof Element ? event.target : null;
        const link = !!target?.closest('.project-preview, [data-cursor="link"]');
        const control = !!target?.closest('button,a,input,[role="slider"]');
        element.dataset.link = String(link);
        scaleTo(link ? 2.7 : control ? 1.5 : 1);
        element.style.visibility = 'visible'; visible = true;
      };
      const press = () => { element.dataset.pressed = 'true'; };
      const release = () => { element.dataset.pressed = 'false'; };
      document.addEventListener('pointermove', move, { passive: true });
      document.addEventListener('pointerdown', press, { passive: true });
      document.addEventListener('pointerup', release, { passive: true });
      document.addEventListener('pointercancel', release, { passive: true });
      document.addEventListener('pointerleave', hide);
      window.addEventListener('blur', hide);
      window.addEventListener('scroll', hide, { passive: true });
      return () => {
        hide(); document.removeEventListener('pointermove', move); document.removeEventListener('pointerdown', press); document.removeEventListener('pointerup', release);
        document.removeEventListener('pointercancel', release); document.removeEventListener('pointerleave', hide); window.removeEventListener('blur', hide); window.removeEventListener('scroll', hide);
      };
    });
    return () => mm.revert();
  }, { scope: ring, dependencies: [paused], revertOnUpdate: true });
  return <div ref={ring} className={styles.cursor} aria-hidden="true"><span><svg viewBox="0 0 24 24" fill="none"><path d="M6 18 18 6M6 6h12v12" /></svg></span></div>;
}

export function usePortfolioMotion(root: RefObject<HTMLDivElement | null>) {
  const { paused } = useMotionPreference();
  const entered = useRef(false);
  useGSAP(() => {
    if (paused || !root.current) return;
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const splits: SplitText[] = [];
      let heroSplit: SplitText | null = null;

      // — Hero entrance: SplitText chars rising with blur, exquisite and buttery.
      if (!entered.current) {
        entered.current = true;
        const heroTargets = root.current!.querySelectorAll('.hero-line > span');
        if (heroTargets.length) {
          heroSplit = SplitText.create(heroTargets, { type: 'chars', charsClass: 'split-char' });
          splits.push(heroSplit);
          gsap.timeline({ defaults: { ease: 'expo.out' } })
            .from(heroSplit.chars, { yPercent: 115, rotation: 4, filter: 'blur(12px)', opacity: 0, duration: 1.5, stagger: 0.028, clearProps: 'transform,filter,opacity' }, 0)
            .from('.hero-detail', { opacity: 0, y: 18, filter: 'blur(6px)', duration: 1.1, stagger: 0.09, clearProps: 'opacity,transform,filter' }, 0.5);
        } else {
          gsap.timeline({ defaults: { ease: 'expo.out' } })
            .from('.hero-line > span', { yPercent: 105, rotation: 3, duration: 1.35, clearProps: 'transform' }, 0)
            .from('.hero-detail', { opacity: 0, y: 18, filter: 'blur(6px)', duration: 1.1, stagger: 0.09, clearProps: 'opacity,transform,filter' }, 0.45);
        }
      }

      // — Scroll headings: SplitText lines/words with blur rise.
      // CSS-module class names are hashed, so match by substring.
      const headTargets = root.current!.querySelectorAll<HTMLElement>(
        '[class*="sectionHeading"] h2, [class*="aboutSide"] h2, [class*="statement"]',
      );
      headTargets.forEach((el) => {
        const split = SplitText.create(el, {
          type: 'lines,words',
          mask: 'lines',
          autoSplit: true,
          linesClass: 'split-line',
          wordsClass: 'split-word',
        });
        splits.push(split);
        gsap.from(split.words, {
          yPercent: 70,
          opacity: 0,
          filter: 'blur(10px)',
          duration: 1.15,
          ease: 'expo.out',
          stagger: 0.06,
          clearProps: 'transform,filter,opacity',
          scrollTrigger: { trigger: el, start: 'top 87%', once: true },
        });
      });

      // Contact title has an inline SVG arrow — SplitText would swallow it, so blur-rise it whole.
      const contactTitle = root.current!.querySelector<HTMLElement>('[class*="contactTitle"]');
      if (contactTitle) {
        gsap.from(contactTitle, {
          y: 44,
          opacity: 0,
          filter: 'blur(12px)',
          duration: 1.3,
          ease: 'expo.out',
          clearProps: 'transform,filter,opacity',
          scrollTrigger: { trigger: contactTitle, start: 'top 88%', once: true },
        });
      }

      // — Selected work: each card lifts with blur + a soft clip reveal on its preview.
      root.current!.querySelectorAll<HTMLElement>('.project-card').forEach((card, i) => {
        gsap.from(card, {
          y: 56,
          opacity: 0,
          filter: 'blur(10px)',
          scale: 0.985,
          duration: 1.25,
          ease: 'expo.out',
          delay: (i % 2) * 0.08,
          clearProps: 'transform,filter,opacity',
          scrollTrigger: { trigger: card, start: 'top 88%', once: true },
        });
        const preview = card.querySelector('.project-preview');
        if (preview) {
          gsap.from(preview, {
            clipPath: 'inset(6% 3% 6% 3% round 8px)',
            duration: 1.4,
            ease: 'expo.out',
            clearProps: 'clipPath',
            scrollTrigger: { trigger: card, start: 'top 88%', once: true },
          });
        }
      });

      // — Quiet supporting reveals, all sharing the same expo + blur language.
      root.current!.querySelectorAll<HTMLElement>(
        '[class*="aboutContent"] > p, [class*="capabilities"] > div, .play-card, [class*="sectionHeading"] p, [class*="heroPrelude"], [class*="heroBottom"], [class*="contactPrelude"], [class*="emailRow"], [class*="contactCard"], [class*="footer"]',
      ).forEach((el) => {
        gsap.from(el, {
          y: 28,
          opacity: 0,
          filter: 'blur(8px)',
          duration: 1.05,
          ease: 'expo.out',
          clearProps: 'transform,filter,opacity',
          scrollTrigger: { trigger: el, start: 'top 92%', once: true },
        });
      });

      // — Full-bleed photographs drift gently. Hover zoom lives on the CSS `scale`
      // property so it composes with this GSAP `transform` parallax instead of fighting it.
      root.current!.querySelectorAll<HTMLElement>('.project-preview').forEach((preview) => {
        const photo = preview.querySelector('.aether-photo, .ether-photo');
        if (!photo) return;
        gsap.set(photo, { scale: 1.12 });
        gsap.fromTo(photo, { yPercent: -5 }, {
          yPercent: 5,
          ease: 'none',
          scrollTrigger: { trigger: preview, start: 'top bottom', end: 'bottom top', scrub: 1 },
        });
      });

      let active = true;
      document.fonts.ready.then(() => { if (active) ScrollTrigger.refresh(); });
      return () => {
        active = false;
        splits.forEach((s) => { try { s.revert(); } catch { /* split already reverted */ } });
      };
    });
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const spinCleanups = Array.from(root.current!.querySelectorAll<HTMLElement>('[data-spin]')).map(element => {
        const spin = gsap.to(element.firstElementChild, { rotation: 360, duration: 6, repeat: -1, ease: 'none' });
        const slowdown = gsap.to(spin, { timeScale: 0.2, duration: 0.8, ease: 'power2.inOut', paused: true });
        const enter = (event: PointerEvent) => { if (event.pointerType !== 'touch') slowdown.play(); };
        const leave = () => { slowdown.reverse(); };
        const visibility = () => {
          if (document.hidden) {
            spin.pause();
            slowdown.pause(0);
          } else {
            spin.play();
          }
        };
        visibility();
        element.addEventListener('pointerenter', enter);
        element.addEventListener('pointerleave', leave);
        element.addEventListener('pointercancel', leave);
        window.addEventListener('blur', leave);
        document.addEventListener('visibilitychange', visibility);
        return () => {
          element.removeEventListener('pointerenter', enter);
          element.removeEventListener('pointerleave', leave);
          element.removeEventListener('pointercancel', leave);
          window.removeEventListener('blur', leave);
          document.removeEventListener('visibilitychange', visibility);
        };
      });
      return () => spinCleanups.forEach(cleanup => cleanup());
    });
    mm.add('(pointer: fine) and (prefers-reduced-motion: no-preference)', () => {
      const cleanups = Array.from(root.current!.querySelectorAll<HTMLElement>('[data-magnetic]')).map(element => {
        const xTo = gsap.quickTo(element, 'x', { duration: 0.6, ease: 'expo.out' });
        const yTo = gsap.quickTo(element, 'y', { duration: 0.6, ease: 'expo.out' });
        let rect: DOMRect;
        const enter = () => { rect = element.getBoundingClientRect(); };
        const move = (event: PointerEvent) => { if (!rect) return; xTo((event.clientX - rect.left - rect.width / 2) * 0.18); yTo((event.clientY - rect.top - rect.height / 2) * 0.22); };
        const leave = () => { xTo(0); yTo(0); };
        element.addEventListener('pointerenter', enter); element.addEventListener('pointermove', move); element.addEventListener('pointerleave', leave);
        return () => { element.removeEventListener('pointerenter', enter); element.removeEventListener('pointermove', move); element.removeEventListener('pointerleave', leave); };
      });
      // Project previews: cursor-following hover pill, same expo language, touch-safe.
      const hoverCleanups = Array.from(root.current!.querySelectorAll<HTMLElement>('.project-preview')).map((preview) => {
        const pill = preview.querySelector<HTMLElement>('.project-hover');
        if (!pill) return () => {};
        gsap.set(pill, { x: 0, y: 0 });
        const xTo = gsap.quickTo(pill, 'x', { duration: 0.5, ease: 'expo.out' });
        const yTo = gsap.quickTo(pill, 'y', { duration: 0.5, ease: 'expo.out' });
        const move = (event: PointerEvent) => {
          const r = preview.getBoundingClientRect();
          xTo((event.clientX - r.left - r.width / 2) * 0.35);
          yTo((event.clientY - r.top - r.height / 2) * 0.35);
        };
        const leave = () => { xTo(0); yTo(0); };
        preview.addEventListener('pointermove', move);
        preview.addEventListener('pointerleave', leave);
        return () => { preview.removeEventListener('pointermove', move); preview.removeEventListener('pointerleave', leave); };
      });
      return () => [...cleanups, ...hoverCleanups].forEach(cleanup => cleanup());
    });
    return () => mm.revert();
  }, { scope: root, dependencies: [paused], revertOnUpdate: true });
}
