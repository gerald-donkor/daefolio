'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useMotionPreference } from './motion-provider';
import styles from './portrait-reveal.module.css';

gsap.registerPlugin(useGSAP);

const SIZE = 600;
const FRAME = 10;

export function PortraitReveal() {
  const stage = useRef<HTMLDivElement>(null);
  const root = useRef<HTMLButtonElement>(null);
  const photo = useRef<HTMLImageElement>(null);
  const veil = useRef<HTMLCanvasElement>(null);
  const timecode = useRef<HTMLSpanElement>(null);
  const elapsed = useRef(0);
  const reset = useRef<() => void>(() => {});
  // Set when a touch drag exceeds the tap slop so the trailing click is ignored.
  const suppressTap = useRef(false);
  const [revealed, setRevealed] = useState(false);
  const { paused } = useMotionPreference();

  // Cached stationary bounds to completely eliminate layout thrashing during pointer movement
  const bounds = useRef({ left: 0, top: 0, width: 0, height: 0 });
  const hasPainted = useRef(false);
  const veilImageRef = useRef<HTMLImageElement | null>(null);

  // Preload optimized pre-rendered veil image on client mount
  useEffect(() => {
    const isRetina = typeof window !== 'undefined' && (window.devicePixelRatio || 1) > 1.5;
    const veilImg = new window.Image();
    veilImg.src = isRetina ? '/images/gerald-donkor-veil-1200.webp' : '/images/gerald-donkor-veil.webp';
    veilImageRef.current = veilImg;
  }, []);

  // Timecode and unified IntersectionObserver for visibility-based resource pausing
  useEffect(() => {
    if (paused) return;
    const area = stage.current;
    if (!area) return;

    const measure = () => {
      if (!stage.current) return;
      const rect = stage.current.getBoundingClientRect();
      bounds.current = {
        left: rect.left,
        top: rect.top,
        width: rect.width || 1,
        height: rect.height || 1,
      };
    };

    let visible = false;
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) {
        measure();
        if (!hasPainted.current) {
          hasPainted.current = true;
          reset.current();
        }
      }
    }, { rootMargin: '250px' });
    observer.observe(area);

    const timer = window.setInterval(() => {
      if (!visible || document.hidden || !timecode.current) return;
      elapsed.current += 1;
      const seconds = elapsed.current;
      timecode.current.textContent = [Math.floor(seconds / 3600), Math.floor(seconds / 60) % 60, seconds % 60]
        .map(value => String(value).padStart(2, '0')).join(':');
    }, 1000);

    window.addEventListener('resize', measure, { passive: true });
    window.addEventListener('scroll', measure, { passive: true });

    return () => {
      observer.disconnect();
      window.clearInterval(timer);
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure);
    };
  }, [paused]);

  // Unified GSAP interactions & canvas scratching
  useGSAP(() => {
    const area = stage.current;
    const button = root.current;
    const canvas = veil.current;
    const image = photo.current;
    if (!area || !button || !canvas || !image) return;

    const context = canvas.getContext('2d');
    if (paused || !context) return;

    let disposed = false;
    let previous: { x: number; y: number } | null = null;

    // High-performance canvas paint with instant GPU texture blit
    const paint = () => {
      if (disposed) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const resolution = Math.min(1200, Math.max(SIZE, Math.ceil(canvas.clientWidth * dpr)));
      canvas.width = resolution;
      canvas.height = resolution;
      context.setTransform(resolution / SIZE, 0, 0, resolution / SIZE, 0, 0);
      context.imageSmoothingQuality = 'high';
      context.globalCompositeOperation = 'source-over';
      context.clearRect(0, 0, SIZE, SIZE);

      const veilImg = veilImageRef.current;
      if (veilImg && veilImg.complete && veilImg.naturalWidth > 0) {
        context.drawImage(veilImg, 0, 0, SIZE, SIZE);
      } else if (image.complete && image.naturalWidth > 0) {
        context.filter = 'grayscale(1) blur(9px) brightness(.66) contrast(1.08)';
        context.drawImage(image, -18, -18, SIZE + 36, SIZE + 36);
        context.filter = 'none';
      }
      context.clearRect(SIZE * .12, SIZE * .31, SIZE * .76, SIZE * .17);
      canvas.dataset.ready = 'true';
      previous = null;
    };
    reset.current = paint;

    // If already in view or image ready, render
    if (image.complete && !hasPainted.current) {
      paint();
      hasPainted.current = true;
    }
    const onImgLoad = () => {
      if (!hasPainted.current) {
        paint();
        hasPainted.current = true;
      }
    };
    image.addEventListener('load', onImgLoad);
    if (veilImageRef.current) {
      veilImageRef.current.addEventListener('load', () => {
        if (!revealed) paint();
      });
    }

    const eraseAt = (point: { x: number; y: number }) => {
      if (canvas.dataset.ready !== 'true') return;
      context.globalCompositeOperation = 'destination-out';
      context.lineWidth = SIZE * .28;
      context.lineCap = 'round';
      context.lineJoin = 'round';
      context.beginPath();
      context.moveTo(previous?.x ?? point.x, previous?.y ?? point.y);
      context.lineTo(point.x, point.y);
      context.stroke();
      context.beginPath();
      context.arc(point.x, point.y, SIZE * .14, 0, Math.PI * 2);
      context.fill();
      previous = point;
    };

    // GSAP quickTo tweens for 3D tilt, light, glare and viewfinder reticle
    const options = { duration: .5, ease: 'power3.out' };
    const light = gsap.quickTo(button, '--light-x', { duration: .34, ease: 'power3.out' });
    const lightY = gsap.quickTo(button, '--light-y', { duration: .34, ease: 'power3.out' });
    const glare = gsap.quickTo(button, '--glare-strength', { duration: .28, ease: 'power2.out' });
    const tiltX = gsap.quickTo(button, 'rotationX', options);
    const tiltY = gsap.quickTo(button, 'rotationY', options);
    const turn = gsap.quickTo(button, 'rotation', options);

    const tracking = button.querySelector(`.${styles.focusTracking}`)!;
    const followX = gsap.quickTo(tracking, 'xPercent', { duration: .7, ease: 'power3.out' });
    const followY = gsap.quickTo(tracking, 'yPercent', { duration: .7, ease: 'power3.out' });

    // Background scan & focus animation sequence
    const sweep = `.${styles.focusSweep}`;
    const scan = `.${styles.scanLine}`;
    const sequence = gsap.timeline({ paused: true, repeat: -1, defaults: { ease: 'sine.inOut' } });
    sequence
      .to(sweep, { xPercent: -5, yPercent: -6, scale: .78, duration: 2 }, 0)
      .to(sweep, { xPercent: 7, yPercent: 3, scale: .88, duration: 2.5 }, 2)
      .to(sweep, { xPercent: -3, yPercent: 7, scale: .74, duration: 1.8 }, 4.5)
      .to(sweep, { xPercent: 0, yPercent: 0, scale: 1, duration: 2.2 }, 6.3)
      .fromTo(scan, { yPercent: 0, opacity: 0 }, { yPercent: 100, opacity: .65, duration: 4.25 }, 0)
      .to(scan, { yPercent: 0, opacity: 0, duration: 4.25 }, 4.25)
      .to(`.${styles.exposure} b`, { x: 16, duration: 2 }, 0)
      .to(`.${styles.exposure} b`, { x: -16, duration: 4.5 }, 2)
      .to(`.${styles.exposure} b`, { x: 0, duration: 2 }, 6.5);

    let isVisible = false;
    const syncPlayback = () => { sequence.paused(!isVisible || document.hidden); };
    const visObserver = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
      syncPlayback();
    });
    visObserver.observe(button);
    document.addEventListener('visibilitychange', syncPlayback);

    const settle = () => {
      tiltX(4);
      tiltY(-8);
      turn(5);
      light(35);
      lightY(18);
      glare(.16);
      followX(0);
      followY(0);
      previous = null;
    };

    let touchId: number | null = null;
    let touchStart: { x: number; y: number } | null = null;
    let clearTimer = 0;

    const measureBoundsIfNeeded = () => {
      if (bounds.current.width === 0) {
        const rect = area.getBoundingClientRect();
        bounds.current = {
          left: rect.left,
          top: rect.top,
          width: rect.width || 1,
          height: rect.height || 1,
        };
      }
    };

    const handlePointerMove = (clientX: number, clientY: number, isTouchDrag: boolean) => {
      measureBoundsIfNeeded();
      const b = bounds.current;
      const x = Math.max(-1, Math.min(1, ((clientX - b.left) / b.width) * 2 - 1));
      const y = Math.max(-1, Math.min(1, ((clientY - b.top) / b.height) * 2 - 1));

      // Update 3D card tilt and reflection glare
      light(50 + x * 30);
      lightY(20 + y * 16);
      glare(.62);
      tiltX(4 - y * 9);
      tiltY(-8 + x * 11);
      turn(5 + x * 3);

      // Update viewfinder reticle
      followX(Math.max(-6, Math.min(6, x * 6)));
      followY(Math.max(-6, Math.min(6, y * 6)));

      // Scratch veil on mouse hover or active touch drag
      const scale = SIZE / (b.width - FRAME * 2);
      const scratchX = (clientX - b.left - FRAME) * scale;
      const scratchY = (clientY - b.top - FRAME) * scale;
      eraseAt({ x: scratchX, y: scratchY });

      // Tap suppression detection for touch
      if (isTouchDrag && touchStart) {
        if (Math.hypot(clientX - touchStart.x, clientY - touchStart.y) > 12) {
          suppressTap.current = true;
        }
      }
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') {
        if (event.pointerId !== touchId) return;
        handlePointerMove(event.clientX, event.clientY, true);
        return;
      }
      handlePointerMove(event.clientX, event.clientY, false);
    };

    const onPointerDown = (event: PointerEvent) => {
      measureBoundsIfNeeded();
      if (event.pointerType === 'touch') {
        if (touchId !== null) return;
        touchId = event.pointerId;
        touchStart = { x: event.clientX, y: event.clientY };
        suppressTap.current = false;
        window.clearTimeout(clearTimer);
        handlePointerMove(event.clientX, event.clientY, true);
        return;
      }
      const b = bounds.current;
      const scale = SIZE / (b.width - FRAME * 2);
      eraseAt({ x: (event.clientX - b.left - FRAME) * scale, y: (event.clientY - b.top - FRAME) * scale });
    };

    const onPointerUp = (event: PointerEvent) => {
      if (event.pointerType === 'touch') {
        if (event.pointerId !== touchId) return;
        touchId = null;
        touchStart = null;
        previous = null;
        settle();
        if (suppressTap.current) {
          window.clearTimeout(clearTimer);
          clearTimer = window.setTimeout(() => { suppressTap.current = false; }, 600);
        }
        return;
      }
      previous = null;
    };

    const onPointerLeave = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      previous = null;
      settle();
    };

    area.addEventListener('pointermove', onPointerMove, { passive: true });
    area.addEventListener('pointerdown', onPointerDown, { passive: true });
    area.addEventListener('pointerup', onPointerUp, { passive: true });
    area.addEventListener('pointerleave', onPointerLeave, { passive: true });
    area.addEventListener('pointercancel', onPointerUp, { passive: true });
    window.addEventListener('pointerup', onPointerUp, { passive: true });
    window.addEventListener('pointercancel', onPointerUp, { passive: true });
    window.addEventListener('blur', settle);

    return () => {
      disposed = true;
      reset.current = () => {};
      delete canvas.dataset.ready;
      image.removeEventListener('load', onImgLoad);
      visObserver.disconnect();
      document.removeEventListener('visibilitychange', syncPlayback);
      window.clearTimeout(clearTimer);
      area.removeEventListener('pointermove', onPointerMove);
      area.removeEventListener('pointerdown', onPointerDown);
      area.removeEventListener('pointerup', onPointerUp);
      area.removeEventListener('pointerleave', onPointerLeave);
      area.removeEventListener('pointercancel', onPointerUp);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
      window.removeEventListener('blur', settle);
    };
  }, { scope: stage, dependencies: [paused], revertOnUpdate: true });

  // Fade veil opacity on reveal toggle
  useGSAP(() => {
    if (paused) return;
    gsap.to(veil.current, { opacity: revealed ? 0 : 1, duration: .55, ease: 'power2.out' });
  }, { scope: root, dependencies: [revealed, paused], revertOnUpdate: true });

  return <div className={styles.portrait} data-paused={paused}>
    <div ref={stage} className={styles.stage}>
    <button
      ref={root}
      type="button"
      className={styles.card}
      data-revealed={revealed}
      disabled={paused}
      aria-label={revealed ? 'Reset portrait reveal' : 'Reveal full portrait of Gerald Donkor'}
      aria-pressed={revealed}
      onClickCapture={(event) => {
        if (suppressTap.current) {
          event.preventDefault();
          event.stopPropagation();
          suppressTap.current = false;
        }
      }}
      onClick={() => {
        if (suppressTap.current) {
          suppressTap.current = false;
          return;
        }
        if (revealed) reset.current();
        setRevealed(!revealed);
      }}
    >
      <span className={styles.surface}>
        <Image ref={photo} className={styles.photo} src="/gerald-donkor.jpg" alt="Portrait of Gerald Donkor" width={600} height={600} unoptimized />
        <canvas ref={veil} className={styles.veil} width={SIZE} height={SIZE} aria-hidden="true" />
        {!paused && <span className={styles.eyeWindow} aria-hidden="true" />}
        <span className={styles.viewfinder} aria-hidden="true">
          <span className={styles.topReadout}>
            <span className={styles.recording}><span className={styles.recordLight} />REC</span>
            <span ref={timecode} className={styles.timecode}>00:00:00</span>
            <span className={styles.battery}><span /></span>
          </span>
          <span className={styles.scanLine} />
          <span className={styles.focusTracking}>
            <span className={styles.focusSweep}>
              <span className={styles.frameCorners}><i /><i /><i /><i /></span>
              <span className={styles.focusMark} />
            </span>
          </span>
          <span className={styles.bottomReadout}>
            <span className={styles.cameraFormat}>4K <span>25 FPS</span></span>
            <span className={styles.exposure}>−<span>Ⅰ Ⅰ Ⅰ <b>Ⅰ</b> Ⅰ Ⅰ Ⅰ</span>+</span>
            <span className={styles.autoFocus}>AF<span>ON</span></span>
          </span>
          <span className={styles.takeLabel}>GD — PORTRAIT 01</span>
        </span>
      </span>
    </button>
    </div>
    {!paused && <span className={styles.hint} aria-hidden="true">
      <span className={styles.desktopHint}>{revealed ? 'Click to reset' : 'Move to explore · click to reveal'}</span><span className={styles.touchHint}>{revealed ? 'Tap to reset' : 'Drag to explore · tap to reveal'}</span>
    </span>}
  </div>;
}
