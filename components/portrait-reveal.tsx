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

  // Distinguish a tap (toggles reveal) from a drag (explores tilt / scratches).
  // Horizontal drags don't scroll the page, so the browser still fires a click —
  // without this the card would accidentally reveal after every tilt gesture.
  useEffect(() => {
    const button = root.current;
    if (!button) return;
    let start: { x: number; y: number; id: number } | null = null;
    let clearTimer = 0;
    const down = (event: PointerEvent) => {
      if (event.pointerType !== 'touch') return;
      if (start !== null) return;
      start = { x: event.clientX, y: event.clientY, id: event.pointerId };
      suppressTap.current = false;
      window.clearTimeout(clearTimer);
    };
    const move = (event: PointerEvent) => {
      if (event.pointerType !== 'touch' || !start || event.pointerId !== start.id) return;
      if (Math.hypot(event.clientX - start.x, event.clientY - start.y) > 12) {
        suppressTap.current = true;
      }
    };
    const end = (event: PointerEvent) => {
      if (event.pointerType !== 'touch' || !start || event.pointerId !== start.id) return;
      start = null;
      // If the gesture scrolled, no click follows — clear the flag so the next
      // tap isn't swallowed. If a click does follow it consumes the flag first.
      if (suppressTap.current) {
        window.clearTimeout(clearTimer);
        clearTimer = window.setTimeout(() => { suppressTap.current = false; }, 600);
      }
    };
    button.addEventListener('pointerdown', down, { passive: true });
    button.addEventListener('pointermove', move, { passive: true });
    button.addEventListener('pointerup', end, { passive: true });
    button.addEventListener('pointercancel', end, { passive: true });
    return () => {
      window.clearTimeout(clearTimer);
      button.removeEventListener('pointerdown', down);
      button.removeEventListener('pointermove', move);
      button.removeEventListener('pointerup', end);
      button.removeEventListener('pointercancel', end);
    };
  }, []);

  useEffect(() => {
    if (paused) return;
    let visible = false;
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; });
    observer.observe(stage.current!);
    const timer = window.setInterval(() => {
      if (!visible || document.hidden || !timecode.current) return;
      elapsed.current += 1;
      const seconds = elapsed.current;
      timecode.current.textContent = [Math.floor(seconds / 3600), Math.floor(seconds / 60) % 60, seconds % 60]
        .map(value => String(value).padStart(2, '0')).join(':');
    }, 1000);
    return () => { observer.disconnect(); window.clearInterval(timer); };
  }, [paused]);

  useGSAP(() => {
    if (paused) return;
    const area = stage.current!;
    const button = root.current!;
    const options = { duration: .5, ease: 'power3.out' };
    const light = gsap.quickTo(button, '--light-x', { duration: .34, ease: 'power3.out' });
    const lightY = gsap.quickTo(button, '--light-y', { duration: .34, ease: 'power3.out' });
    const glare = gsap.quickTo(button, '--glare-strength', { duration: .28, ease: 'power2.out' });
    const tiltX = gsap.quickTo(button, 'rotationX', options);
    const tiltY = gsap.quickTo(button, 'rotationY', options);
    const turn = gsap.quickTo(button, 'rotation', options);

    const move = (clientX: number, clientY: number) => {
      // Measure the stationary wrapper so the card's own tilt cannot feed back
      // into the pointer position and make it wobble under a stationary cursor.
      const bounds = area.getBoundingClientRect();
      const x = Math.max(-1, Math.min(1, (clientX - bounds.left) / bounds.width * 2 - 1));
      const y = Math.max(-1, Math.min(1, (clientY - bounds.top) / bounds.height * 2 - 1));
      light(50 + x * 30);
      lightY(20 + y * 16);
      // Keep the reflection legible without lifting the dark portrait grade.
      glare(.62);
      tiltX(4 - y * 9);
      tiltY(-8 + x * 11);
      turn(5 + x * 3);
    };
    const settle = () => { tiltX(4); tiltY(-8); turn(5); light(35); lightY(18); glare(.16); };
    // Touch has no hover: only follow an active finger (down → move → up),
    // while mouse/pen keep the hover behaviour.
    let touchId: number | null = null;
    const onMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') {
        if (event.pointerId !== touchId) return;
        move(event.clientX, event.clientY);
        return;
      }
      move(event.clientX, event.clientY);
    };
    const onDown = (event: PointerEvent) => {
      if (event.pointerType !== 'touch' || touchId !== null) return;
      touchId = event.pointerId;
      move(event.clientX, event.clientY);
    };
    const endTouch = (event: PointerEvent) => {
      if (event.pointerId !== touchId) return;
      touchId = null;
      settle();
    };
    const onLeave = (event: PointerEvent) => {
      // pointerleave fires for touch after pointerup — the touch end above
      // already settled, so only settle hover pointers here.
      if (event.pointerType === 'touch') return;
      settle();
    };
    area.addEventListener('pointermove', onMove, { passive: true });
    area.addEventListener('pointerdown', onDown, { passive: true });
    area.addEventListener('pointerup', endTouch);
    area.addEventListener('pointerleave', onLeave);
    area.addEventListener('pointercancel', endTouch);
    window.addEventListener('pointerup', endTouch);
    window.addEventListener('pointercancel', endTouch);
    window.addEventListener('blur', settle);
    return () => {
      area.removeEventListener('pointermove', onMove);
      area.removeEventListener('pointerdown', onDown);
      area.removeEventListener('pointerup', endTouch);
      area.removeEventListener('pointerleave', onLeave);
      area.removeEventListener('pointercancel', endTouch);
      window.removeEventListener('pointerup', endTouch);
      window.removeEventListener('pointercancel', endTouch);
      window.removeEventListener('blur', settle);
    };
  }, { scope: stage, dependencies: [paused], revertOnUpdate: true });

  useGSAP(() => {
    const button = root.current!;
    const canvas = veil.current!;
    const image = photo.current!;
    const context = canvas.getContext('2d');
    if (paused || !context) return;

    let disposed = false;
    let previous: { x: number; y: number } | null = null;
    const paint = () => {
      if (disposed || !image.naturalWidth) return;
      const resolution = Math.max(SIZE, Math.ceil(canvas.clientWidth * Math.min(window.devicePixelRatio || 1, 3)));
      canvas.width = resolution;
      canvas.height = resolution;
      context.setTransform(resolution / SIZE, 0, 0, resolution / SIZE, 0, 0);
      context.imageSmoothingQuality = 'high';
      context.globalCompositeOperation = 'source-over';
      context.clearRect(0, 0, SIZE, SIZE);
      context.filter = 'grayscale(1) blur(9px) brightness(.66) contrast(1.08)';
      // Keep the unrevealed veil dark, but leave enough shadow detail for the
      // hair and beard to read naturally instead of becoming solid black.
      context.drawImage(image, -18, -18, SIZE + 36, SIZE + 36);
      context.filter = 'none';
      context.clearRect(SIZE * .12, SIZE * .31, SIZE * .76, SIZE * .17);
      canvas.dataset.ready = 'true';
      previous = null;
    };
    reset.current = paint;

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
    const toPoint = (clientX: number, clientY: number) => {
      // offsetX follows the rotated card but is unreliable for touch, so use
      // the bounding rect corrected for rotation-induced growth instead.
      const rect = button.getBoundingClientRect();
      const scale = SIZE / (button.clientWidth - FRAME * 2);
      const layoutX = clientX - rect.left - (rect.width - button.clientWidth) / 2;
      const layoutY = clientY - rect.top - (rect.height - button.clientHeight) / 2;
      return { x: (layoutX - FRAME) * scale, y: (layoutY - FRAME) * scale };
    };
    let touchId: number | null = null;
    const scratch = (event: PointerEvent) => {
      if (event.pointerType === 'touch') {
        if (event.pointerId !== touchId) return;
        eraseAt(toPoint(event.clientX, event.clientY));
        return;
      }
      // offset coordinates follow the rotated card, unlike its bounding rectangle.
      const scale = SIZE / (button.clientWidth - FRAME * 2);
      eraseAt({ x: (event.offsetX - FRAME) * scale, y: (event.offsetY - FRAME) * scale });
    };
    const press = (event: PointerEvent) => {
      if (event.pointerType !== 'touch' || touchId !== null) return;
      touchId = event.pointerId;
      eraseAt(toPoint(event.clientX, event.clientY));
    };
    const endTouch = (event: PointerEvent) => {
      if (event.pointerId !== touchId) return;
      touchId = null;
      previous = null;
    };
    const leave = (event: PointerEvent) => {
      // Touch pointerleave follows pointerup; touch state is cleared above.
      if ((event as PointerEvent).pointerType === 'touch') return;
      previous = null;
    };
    if (image.complete) paint();
    image.addEventListener('load', paint);
    button.addEventListener('pointermove', scratch, { passive: true });
    button.addEventListener('pointerdown', press, { passive: true });
    button.addEventListener('pointerup', endTouch);
    button.addEventListener('pointerleave', leave);
    button.addEventListener('pointercancel', endTouch);
    window.addEventListener('pointerup', endTouch);
    window.addEventListener('pointercancel', endTouch);
    return () => {
      disposed = true;
      reset.current = () => {};
      delete canvas.dataset.ready;
      image.removeEventListener('load', paint);
      button.removeEventListener('pointermove', scratch);
      button.removeEventListener('pointerdown', press);
      button.removeEventListener('pointerup', endTouch);
      button.removeEventListener('pointerleave', leave);
      button.removeEventListener('pointercancel', endTouch);
      window.removeEventListener('pointerup', endTouch);
      window.removeEventListener('pointercancel', endTouch);
    };
  }, { scope: root, dependencies: [paused], revertOnUpdate: true });

  useGSAP(() => {
    if (paused) return;
    gsap.to(veil.current, { opacity: revealed ? 0 : 1, duration: .55, ease: 'power2.out' });
  }, { scope: root, dependencies: [revealed, paused], revertOnUpdate: true });

  useGSAP(() => {
    if (paused) return;
    const button = root.current!;
    const tracking = button.querySelector(`.${styles.focusTracking}`)!;
    const followX = gsap.quickTo(tracking, 'xPercent', { duration: .7, ease: 'power3.out' });
    const followY = gsap.quickTo(tracking, 'yPercent', { duration: .7, ease: 'power3.out' });
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

    const follow = (clientX: number, clientY: number) => {
      const rect = button.getBoundingClientRect();
      followX(Math.max(-6, Math.min(6, ((clientX - rect.left) / rect.width - .5) * 12)));
      followY(Math.max(-6, Math.min(6, ((clientY - rect.top) / rect.height - .5) * 12)));
    };
    const settle = () => { followX(0); followY(0); };
    // Touch has no hover: only follow an active finger, mouse/pen hover freely.
    let touchId: number | null = null;
    const move = (event: PointerEvent) => {
      if (event.pointerType === 'touch') {
        if (event.pointerId !== touchId) return;
        follow(event.clientX, event.clientY);
        return;
      }
      follow(event.clientX, event.clientY);
    };
    const press = (event: PointerEvent) => {
      if (event.pointerType !== 'touch' || touchId !== null) return;
      touchId = event.pointerId;
      follow(event.clientX, event.clientY);
    };
    const endTouch = (event: PointerEvent) => {
      if (event.pointerId !== touchId) return;
      touchId = null;
      settle();
    };
    const leave = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      settle();
    };
    let visible = false;
    const syncPlayback = () => { sequence.paused(!visible || document.hidden); };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      syncPlayback();
    });
    observer.observe(button);
    button.addEventListener('pointermove', move, { passive: true });
    button.addEventListener('pointerdown', press, { passive: true });
    button.addEventListener('pointerup', endTouch);
    button.addEventListener('pointerleave', leave);
    button.addEventListener('pointercancel', endTouch);
    window.addEventListener('pointerup', endTouch);
    window.addEventListener('pointercancel', endTouch);
    document.addEventListener('visibilitychange', syncPlayback);
    return () => {
      observer.disconnect();
      button.removeEventListener('pointermove', move);
      button.removeEventListener('pointerdown', press);
      button.removeEventListener('pointerup', endTouch);
      button.removeEventListener('pointerleave', leave);
      button.removeEventListener('pointercancel', endTouch);
      window.removeEventListener('pointerup', endTouch);
      window.removeEventListener('pointercancel', endTouch);
      document.removeEventListener('visibilitychange', syncPlayback);
    };
  }, { scope: root, dependencies: [paused], revertOnUpdate: true });

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
