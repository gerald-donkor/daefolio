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
  const playRevealWipe = useRef<() => void>(() => {});
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

    // Entering the observation margin measures again before interaction is possible.
    // Avoid reading off-screen layout on every scroll through the rest of the page.
    const measureVisible = () => { if (visible) measure(); };
    window.addEventListener('resize', measureVisible, { passive: true });
    window.addEventListener('scroll', measureVisible, { passive: true });

    return () => {
      observer.disconnect();
      window.clearInterval(timer);
      window.removeEventListener('resize', measureVisible);
      window.removeEventListener('scroll', measureVisible);
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
    let wipeAudio: {
      context: AudioContext;
      filter: BiquadFilterNode;
      gain: GainNode;
      ensureNoise: () => void;
      stop: () => void;
    } | null = null;
    let audioPointer: { x: number; y: number; time: number } | null = null;
    let quietTimer = 0;

    // The noise's volume and brightness map directly to pointer velocity, so
    // the sound follows the canvas wipe instead of playing as a detached clip.
    const startWipeAudio = () => {
      if (wipeAudio) return wipeAudio;
      const AudioContextClass = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return null;
      const audioContext = new AudioContextClass();
      const filter = audioContext.createBiquadFilter();
      const gain = audioContext.createGain();
      filter.type = 'bandpass';
      filter.frequency.value = 800;
      filter.Q.value = .9;
      gain.gain.value = 0;
      filter.connect(gain).connect(audioContext.destination);

      let noiseSource: AudioBufferSourceNode | null = null;
      const ensureNoise = () => {
        if (audioContext.state !== 'running' || noiseSource) return;
        const buffer = audioContext.createBuffer(1, audioContext.sampleRate, audioContext.sampleRate);
        const samples = buffer.getChannelData(0);
        for (let index = 0; index < samples.length; index += 1) samples[index] = Math.random() * 2 - 1;
        const noise = audioContext.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;
        noise.connect(filter);
        noise.onended = () => { if (noiseSource === noise) noiseSource = null; };
        noise.start();
        noiseSource = noise;
      };

      audioContext.onstatechange = () => {
        if (audioContext.state === 'running') {
          ensureNoise();
        }
      };
      if (audioContext.state === 'running') {
        ensureNoise();
      }

      const stop = () => {
        if (noiseSource) {
          try { noiseSource.stop(); } catch {}
          noiseSource = null;
        }
        void audioContext.close().catch(() => {});
      };

      wipeAudio = { context: audioContext, filter, gain, ensureNoise, stop };
      return wipeAudio;
    };

    const unlockAudio = () => {
      const current = startWipeAudio();
      if (!current) return;
      if (current.context.state === 'suspended') {
        void current.context.resume().then(() => current.ensureNoise()).catch(() => {});
      } else if (current.context.state === 'running') {
        current.ensureNoise();
      }
    };

    const quietWipeAudio = () => {
      if (!wipeAudio || wipeAudio.context.state !== 'running') return;
      wipeAudio.gain.gain.setTargetAtTime(0, wipeAudio.context.currentTime, .045);
    };

    const updateWipeAudio = (clientX: number, clientY: number) => {
      const current = startWipeAudio();
      if (!current) return;
      if (current.context.state === 'suspended') {
        void current.context.resume().then(() => current.ensureNoise()).catch(() => {});
      } else {
        current.ensureNoise();
      }
      const now = performance.now();
      const last = audioPointer;
      audioPointer = { x: clientX, y: clientY, time: now };
      if (!last) return;
      const speed = Math.hypot(clientX - last.x, clientY - last.y) / Math.max(now - last.time, 8);
      const intensity = Math.min(1, speed / 1.35);
      if (current.context.state === 'running') {
        const audioNow = current.context.currentTime;
        current.filter.frequency.setTargetAtTime(620 + intensity * 3200, audioNow, .025);
        current.filter.Q.setTargetAtTime(.75 + intensity * 1.45, audioNow, .03);
        current.gain.gain.setTargetAtTime(.025 + intensity * .16, audioNow, .02);
        window.clearTimeout(quietTimer);
        quietTimer = window.setTimeout(quietWipeAudio, 90);
      }
    };

    const revealWipeSound = () => {
      const current = startWipeAudio();
      if (!current) return;
      const playRamp = () => {
        current.ensureNoise();
        const now = current.context.currentTime;
        const duration = .55;
        current.filter.frequency.cancelScheduledValues(now);
        current.filter.frequency.setValueAtTime(680, now);
        current.filter.frequency.exponentialRampToValueAtTime(3400, now + duration * .72);
        current.filter.frequency.exponentialRampToValueAtTime(920, now + duration);
        current.gain.gain.cancelScheduledValues(now);
        current.gain.gain.setValueAtTime(.04, now);
        current.gain.gain.linearRampToValueAtTime(.18, now + .08);
        current.gain.gain.exponentialRampToValueAtTime(.001, now + duration);
      };
      if (current.context.state === 'suspended') {
        void current.context.resume().then(playRamp).catch(() => {});
      } else {
        playRamp();
      }
    };
    playRevealWipe.current = revealWipeSound;

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
    const veilImage = veilImageRef.current;
    const onVeilLoad = () => { if (!revealed) paint(); };
    veilImage?.addEventListener('load', onVeilLoad);

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
      audioPointer = null;
      quietWipeAudio();
    };

    let activePointerId: number | null = null;
    let pointerStart: { x: number; y: number } | null = null;
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

    const handlePointerMove = (clientX: number, clientY: number, isDragging: boolean) => {
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

      // Scratch veil on mouse hover or active touch/mouse drag
      const scale = SIZE / (b.width - FRAME * 2);
      const scratchX = (clientX - b.left - FRAME) * scale;
      const scratchY = (clientY - b.top - FRAME) * scale;
      eraseAt({ x: scratchX, y: scratchY });
      updateWipeAudio(clientX, clientY);

      // Tap suppression detection for dragging
      if (isDragging && pointerStart) {
        if (Math.hypot(clientX - pointerStart.x, clientY - pointerStart.y) > 12) {
          suppressTap.current = true;
        }
      }
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') {
        if (event.pointerId !== activePointerId) return;
        handlePointerMove(event.clientX, event.clientY, true);
        return;
      }
      handlePointerMove(event.clientX, event.clientY, activePointerId === event.pointerId);
    };

    const onPointerDown = (event: PointerEvent) => {
      measureBoundsIfNeeded();
      unlockAudio();
      if (activePointerId !== null) return;
      activePointerId = event.pointerId;
      pointerStart = { x: event.clientX, y: event.clientY };
      suppressTap.current = false;
      window.clearTimeout(clearTimer);
      try {
        (event.currentTarget as HTMLElement)?.setPointerCapture?.(event.pointerId);
      } catch {}
      if (event.pointerType === 'touch') {
        handlePointerMove(event.clientX, event.clientY, true);
        return;
      }
      const b = bounds.current;
      const scale = SIZE / (b.width - FRAME * 2);
      eraseAt({ x: (event.clientX - b.left - FRAME) * scale, y: (event.clientY - b.top - FRAME) * scale });
      updateWipeAudio(event.clientX, event.clientY);
    };

    const onPointerUp = (event: PointerEvent) => {
      if (event.pointerId === activePointerId) {
        activePointerId = null;
        pointerStart = null;
        try {
          if ((event.currentTarget as HTMLElement)?.hasPointerCapture?.(event.pointerId)) {
            (event.currentTarget as HTMLElement)?.releasePointerCapture?.(event.pointerId);
          }
        } catch {}
        if (suppressTap.current) {
          window.clearTimeout(clearTimer);
          clearTimer = window.setTimeout(() => { suppressTap.current = false; }, 400);
        }
      }
      if (event.pointerType === 'touch') {
        previous = null;
        settle();
        return;
      }
      previous = null;
      audioPointer = null;
      quietWipeAudio();
    };

    const onPointerLeave = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      previous = null;
      settle();
    };

    const unlockEvents = ['pointerdown', 'touchstart', 'keydown', 'click'] as const;
    const onWindowUnlock = () => { unlockAudio(); };
    unlockEvents.forEach((evt) => {
      window.addEventListener(evt, onWindowUnlock, { passive: true, capture: true });
    });

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
      playRevealWipe.current = () => {};
      delete canvas.dataset.ready;
      image.removeEventListener('load', onImgLoad);
      veilImage?.removeEventListener('load', onVeilLoad);
      visObserver.disconnect();
      document.removeEventListener('visibilitychange', syncPlayback);
      window.clearTimeout(clearTimer);
      window.clearTimeout(quietTimer);
      quietWipeAudio();
      if (wipeAudio) {
        wipeAudio.stop();
      }
      unlockEvents.forEach((evt) => {
        window.removeEventListener(evt, onWindowUnlock, { capture: true });
      });
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
        else playRevealWipe.current();
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
