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
const CLOTH_DIAMETER = SIZE * .13;
const DRY_TIME = 1800;
type WipeState = 'dirty' | 'wet' | 'dry';

export function PortraitReveal() {
  const stage = useRef<HTMLDivElement>(null);
  const root = useRef<HTMLButtonElement>(null);
  const photo = useRef<HTMLImageElement>(null);
  const veil = useRef<HTMLCanvasElement>(null);
  const residue = useRef<HTMLCanvasElement>(null);
  const cloth = useRef<HTMLSpanElement>(null);
  const timecode = useRef<HTMLSpanElement>(null);
  const elapsed = useRef(0);
  const reset = useRef<() => void>(() => {});
  const playRevealWipe = useRef<() => void>(() => {});
  const playResetWipe = useRef<() => void>(() => {});
  // Set when a touch drag exceeds the tap slop so the trailing click is ignored.
  const suppressTap = useRef(false);
  const [revealed, setRevealed] = useState(false);
  const revealedRef = useRef(revealed);
  useEffect(() => {
    revealedRef.current = revealed;
  }, [revealed]);
  const isFirstRender = useRef(true);
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
    const residueCanvas = residue.current;
    const clothElement = cloth.current;
    const image = photo.current;
    if (!area || !button || !canvas || !residueCanvas || !clothElement || !image) return;

    const context = canvas.getContext('2d');
    const residueContext = residueCanvas.getContext('2d');
    if (paused || !context || !residueContext) return;

    let disposed = false;
    let previous: { x: number; y: number } | null = null;
    let wipeAudio: {
      context: AudioContext;
      oscillator: OscillatorNode;
      squeakFilter: BiquadFilterNode;
      squeakGain: GainNode;
      textureFilter: BiquadFilterNode;
      textureGain: GainNode;
      stop: () => void;
    } | null = null;
    let audioPointer: { x: number; y: number; time: number } | null = null;
    let quietTimer = 0;

    // A continuous oscillator and a filtered-noise bed avoid loop seams. Both
    // layers are kept silent until a live wipe supplies velocity and surface state.
    const startWipeAudio = () => {
      if (wipeAudio) return wipeAudio;
      const AudioContextClass = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return null;
      const audioContext = new AudioContextClass();
      const master = audioContext.createGain();
      const compressor = audioContext.createDynamicsCompressor();
      const oscillator = audioContext.createOscillator();
      const squeakFilter = audioContext.createBiquadFilter();
      const squeakGain = audioContext.createGain();
      const textureFilter = audioContext.createBiquadFilter();
      const textureGain = audioContext.createGain();
      const buffer = audioContext.createBuffer(1, audioContext.sampleRate * 2, audioContext.sampleRate);
      const samples = buffer.getChannelData(0);
      let pink = 0;
      for (let index = 0; index < samples.length; index += 1) {
        pink = pink * .985 + (Math.random() * 2 - 1) * .15;
        samples[index] = pink;
      }
      const noise = audioContext.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      oscillator.type = 'triangle';
      oscillator.frequency.value = 1050;
      squeakFilter.type = 'lowpass';
      squeakFilter.frequency.value = 2400;
      squeakFilter.Q.value = 1.2;
      textureFilter.type = 'bandpass';
      textureFilter.frequency.value = 520;
      textureFilter.Q.value = .65;
      squeakGain.gain.value = 0;
      textureGain.gain.value = 0;
      master.gain.value = .72;
      compressor.threshold.value = -22;
      compressor.knee.value = 18;
      compressor.ratio.value = 5;
      compressor.attack.value = .006;
      compressor.release.value = .08;

      oscillator.connect(squeakFilter).connect(squeakGain).connect(master);
      noise.connect(textureFilter).connect(textureGain).connect(master);
      master.connect(compressor).connect(audioContext.destination);
      oscillator.start();
      noise.start();

      const stop = () => {
        try { oscillator.stop(); } catch {}
        try { noise.stop(); } catch {}
        void audioContext.close().catch(() => {});
      };

      wipeAudio = { context: audioContext, oscillator, squeakFilter, squeakGain, textureFilter, textureGain, stop };
      return wipeAudio;
    };

    const unlockAudio = () => {
      const current = startWipeAudio();
      if (!current) return;
      if (current.context.state === 'suspended') {
        void current.context.resume().catch(() => {});
      }
    };

    const quietWipeAudio = () => {
      if (!wipeAudio || wipeAudio.context.state !== 'running') return;
      const now = wipeAudio.context.currentTime;
      wipeAudio.squeakGain.gain.cancelScheduledValues(now);
      wipeAudio.textureGain.gain.cancelScheduledValues(now);
      wipeAudio.squeakGain.gain.setTargetAtTime(0, now, .018);
      wipeAudio.textureGain.gain.setTargetAtTime(0, now, .018);
    };

    const updateWipeAudio = (clientX: number, clientY: number, state: WipeState) => {
      const current = startWipeAudio();
      if (!current) return;
      if (current.context.state === 'suspended') {
        void current.context.resume().catch(() => {});
      }
      const now = performance.now();
      const last = audioPointer;
      audioPointer = { x: clientX, y: clientY, time: now };
      const speed = last ? Math.hypot(clientX - last.x, clientY - last.y) / Math.max(now - last.time, 8) : .22;
      const intensity = Math.max(.08, Math.min(1, speed / 1.25));
      if (current.context.state === 'running') {
        const audioNow = current.context.currentTime;
        const jitter = (Math.random() - .5) * (90 + intensity * 320);
        const basePitch = state === 'dirty' ? 980 : state === 'wet' ? 1260 : 2050;
        const squeakLevel = state === 'dirty' ? .045 : state === 'wet' ? .022 : .009;
        const textureLevel = state === 'dirty' ? .11 : state === 'wet' ? .065 : .002;
        current.oscillator.frequency.setTargetAtTime(basePitch + intensity * 620 + jitter, audioNow, .018);
        current.squeakFilter.frequency.setTargetAtTime(state === 'dry' ? 4100 : 2150 + intensity * 650, audioNow, .025);
        current.textureFilter.frequency.setTargetAtTime(360 + intensity * 720, audioNow, .025);
        current.textureFilter.Q.setTargetAtTime(state === 'wet' ? .45 : .72 + intensity * .35, audioNow, .03);
        current.squeakGain.gain.setTargetAtTime(squeakLevel * (.45 + intensity), audioNow, .014);
        current.textureGain.gain.setTargetAtTime(textureLevel * (.35 + intensity * .8), audioNow, .018);
        window.clearTimeout(quietTimer);
        quietTimer = window.setTimeout(quietWipeAudio, 82);
      }
    };

    const revealWipeSound = () => {
      const current = startWipeAudio();
      if (!current) return;
      const playRamp = () => {
        const now = current.context.currentTime;
        const duration = .55;
        current.oscillator.frequency.cancelScheduledValues(now);
        current.oscillator.frequency.setValueAtTime(760, now);
        current.oscillator.frequency.exponentialRampToValueAtTime(2450, now + duration * .72);
        current.squeakGain.gain.cancelScheduledValues(now);
        current.squeakGain.gain.setValueAtTime(.012, now);
        current.squeakGain.gain.linearRampToValueAtTime(.055, now + .07);
        current.squeakGain.gain.exponentialRampToValueAtTime(.001, now + duration);
        current.textureGain.gain.setValueAtTime(.08, now);
        current.textureGain.gain.exponentialRampToValueAtTime(.001, now + duration);
      };
      if (current.context.state === 'suspended') {
        void current.context.resume().then(playRamp).catch(() => {});
      } else {
        playRamp();
      }
    };
    playRevealWipe.current = revealWipeSound;

    const resetWipeSound = () => {
      const current = startWipeAudio();
      if (!current) return;
      const playRamp = () => {
        const now = current.context.currentTime;
        const duration = .45;
        current.oscillator.frequency.cancelScheduledValues(now);
        current.oscillator.frequency.setValueAtTime(2200, now);
        current.oscillator.frequency.exponentialRampToValueAtTime(720, now + duration);
        current.squeakGain.gain.cancelScheduledValues(now);
        current.squeakGain.gain.setValueAtTime(.042, now);
        current.squeakGain.gain.exponentialRampToValueAtTime(.001, now + duration);
        current.textureGain.gain.setValueAtTime(.055, now);
        current.textureGain.gain.exponentialRampToValueAtTime(.001, now + duration);
      };
      if (current.context.state === 'suspended') {
        void current.context.resume().then(playRamp).catch(() => {});
      } else {
        playRamp();
      }
    };
    playResetWipe.current = resetWipeSound;

    const STATE_SIZE = 64;
    const cleanedAt = new Float64Array(STATE_SIZE * STATE_SIZE);
    const passes = new Uint8Array(STATE_SIZE * STATE_SIZE);
    let residueFrame = 0;
    type WipeMark = {
      from: { x: number; y: number };
      to: { x: number; y: number };
      born: number;
      pass: number;
      finalized: boolean;
    };
    let wetMarks: WipeMark[] = [];

    const drawStroke = (
      target: CanvasRenderingContext2D,
      from: { x: number; y: number },
      to: { x: number; y: number },
      width: number,
    ) => {
      target.lineWidth = width;
      target.lineCap = 'round';
      target.lineJoin = 'round';
      target.beginPath();
      target.moveTo(from.x, from.y);
      target.lineTo(to.x, to.y);
      target.stroke();
    };

    const finishMark = (mark: WipeMark) => {
      context.save();
      context.globalCompositeOperation = 'destination-out';
      context.globalAlpha = 1;
      drawStroke(context, mark.from, mark.to, CLOTH_DIAMETER * .86);
      context.restore();
      mark.finalized = true;
    };

    const renderResidue = () => {
      residueFrame = 0;
      if (disposed) return;
      const now = performance.now();
      residueContext.clearRect(0, 0, SIZE, SIZE);
      residueContext.save();
      residueContext.globalCompositeOperation = 'source-over';
      for (const mark of wetMarks) {
        const age = now - mark.born;
        if (age >= DRY_TIME && !mark.finalized) finishMark(mark);
        if (age >= DRY_TIME) continue;
        const life = 1 - age / DRY_TIME;
        const passFade = 1 / (1 + Math.max(0, mark.pass - 1) * .58);
        const dx = mark.to.x - mark.from.x;
        const dy = mark.to.y - mark.from.y;
        const length = Math.max(1, Math.hypot(dx, dy));
        const nx = -dy / length;
        const ny = dx / length;

        residueContext.globalAlpha = life * .13 * passFade;
        residueContext.strokeStyle = '#bfeaf1';
        drawStroke(residueContext, mark.from, mark.to, CLOTH_DIAMETER * .88);
        residueContext.globalAlpha = life * .2 * passFade;
        residueContext.strokeStyle = '#f5ffff';
        for (const offset of [-.22, .06, .27]) {
          const drift = CLOTH_DIAMETER * offset;
          drawStroke(
            residueContext,
            { x: mark.from.x + nx * drift, y: mark.from.y + ny * drift },
            { x: mark.to.x + nx * drift, y: mark.to.y + ny * drift },
            Math.max(1.2, CLOTH_DIAMETER * .035),
          );
        }
      }
      residueContext.restore();
      wetMarks = wetMarks.filter(mark => now - mark.born < DRY_TIME + 34);
      if (wetMarks.length) residueFrame = window.requestAnimationFrame(renderResidue);
    };

    const scheduleResidue = () => {
      if (!residueFrame) residueFrame = window.requestAnimationFrame(renderResidue);
    };

    const stateIndex = (point: { x: number; y: number }) => {
      const x = Math.max(0, Math.min(STATE_SIZE - 1, Math.floor(point.x / SIZE * STATE_SIZE)));
      const y = Math.max(0, Math.min(STATE_SIZE - 1, Math.floor(point.y / SIZE * STATE_SIZE)));
      return y * STATE_SIZE + x;
    };

    const readState = (point: { x: number; y: number }, now: number): WipeState => {
      const timestamp = cleanedAt[stateIndex(point)];
      if (timestamp === 0) return 'dirty';
      if (timestamp < 0 || now - timestamp >= DRY_TIME) return 'dry';
      return 'wet';
    };

    const stampState = (point: { x: number; y: number }, now: number) => {
      const radius = CLOTH_DIAMETER * .5;
      const minX = Math.max(0, Math.floor((point.x - radius) / SIZE * STATE_SIZE));
      const maxX = Math.min(STATE_SIZE - 1, Math.ceil((point.x + radius) / SIZE * STATE_SIZE));
      const minY = Math.max(0, Math.floor((point.y - radius) / SIZE * STATE_SIZE));
      const maxY = Math.min(STATE_SIZE - 1, Math.ceil((point.y + radius) / SIZE * STATE_SIZE));
      for (let y = minY; y <= maxY; y += 1) {
        for (let x = minX; x <= maxX; x += 1) {
          const centerX = (x + .5) / STATE_SIZE * SIZE;
          const centerY = (y + .5) / STATE_SIZE * SIZE;
          if (Math.hypot(centerX - point.x, centerY - point.y) > radius) continue;
          const index = y * STATE_SIZE + x;
          cleanedAt[index] = now;
          passes[index] = Math.min(255, passes[index] + 1);
        }
      }
    };

    // High-performance canvas paint with instant GPU texture blit
    const paint = () => {
      if (disposed) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const resolution = Math.min(1200, Math.max(SIZE, Math.ceil(canvas.clientWidth * dpr)));
      canvas.width = resolution;
      canvas.height = resolution;
      context.setTransform(resolution / SIZE, 0, 0, resolution / SIZE, 0, 0);
      context.imageSmoothingQuality = 'high';
      residueCanvas.width = resolution;
      residueCanvas.height = resolution;
      residueContext.setTransform(resolution / SIZE, 0, 0, resolution / SIZE, 0, 0);
      residueContext.imageSmoothingQuality = 'high';
      residueContext.clearRect(0, 0, SIZE, SIZE);
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
      wetMarks = [];
      cleanedAt.fill(0);
      passes.fill(0);

      const cleanLeft = Math.floor(STATE_SIZE * .12);
      const cleanRight = Math.ceil(STATE_SIZE * .88);
      const cleanTop = Math.floor(STATE_SIZE * .31);
      const cleanBottom = Math.ceil(STATE_SIZE * .48);
      for (let y = cleanTop; y < cleanBottom; y += 1) {
        for (let x = cleanLeft; x < cleanRight; x += 1) cleanedAt[y * STATE_SIZE + x] = -1;
      }

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

    const eraseAt = (point: { x: number; y: number }): WipeState => {
      if (canvas.dataset.ready !== 'true') return 'dirty';
      const from = previous ?? point;
      const now = performance.now();
      const surfaceState = readState(point, now);
      const currentPass = passes[stateIndex(point)] + 1;

      // The full cloth footprint loosens grime first; the smaller core clears
      // more strongly. Overlap compounds naturally, avoiding a cut-out edge.
      context.save();
      context.globalCompositeOperation = 'destination-out';
      context.globalAlpha = .24;
      drawStroke(context, from, point, CLOTH_DIAMETER);
      context.globalAlpha = Math.min(.9, .58 + currentPass * .1);
      drawStroke(context, from, point, CLOTH_DIAMETER * .7);
      context.restore();

      wetMarks.push({ from: { ...from }, to: { ...point }, born: now, pass: currentPass, finalized: false });
      if (wetMarks.length > 220) wetMarks.splice(0, wetMarks.length - 220);
      stampState(point, now);
      scheduleResidue();

      previous = point;
      return surfaceState;
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
      button.dataset.wiping = 'false';
    };

    let activePointerId: number | null = null;
    let pointerStart: { x: number; y: number } | null = null;
    let didDrag = false;
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

    const handlePointerMove = (
      clientX: number,
      clientY: number,
      pointerType: string,
      pointerId: number,
      offsetX?: number,
      offsetY?: number,
    ) => {
      measureBoundsIfNeeded();
      const b = bounds.current;
      const x = Math.max(-1, Math.min(1, ((clientX - b.left) / b.width) * 2 - 1));
      const y = Math.max(-1, Math.min(1, ((clientY - b.top) / b.height) * 2 - 1));
      const surfaceWidth = Math.max(1, button.clientWidth - FRAME * 2);
      const surfaceHeight = Math.max(1, button.clientHeight - FRAME * 2);
      const hasLocalOffset = typeof offsetX === 'number' && typeof offsetY === 'number';
      const localX = Math.max(0, Math.min(surfaceWidth, hasLocalOffset ? offsetX - FRAME : (clientX - b.left - FRAME) / b.width * button.clientWidth));
      const localY = Math.max(0, Math.min(surfaceHeight, hasLocalOffset ? offsetY - FRAME : (clientY - b.top - FRAME) / b.height * button.clientHeight));

      clothElement.style.setProperty('--cloth-x', `${localX}px`);
      clothElement.style.setProperty('--cloth-y', `${localY}px`);
      if (pointerType !== 'touch' || activePointerId === pointerId) button.dataset.clothVisible = 'true';

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

      // The visual cloth and the canvas point share this exact coordinate map.
      if (activePointerId === pointerId && !revealedRef.current) {
        const point = { x: localX / surfaceWidth * SIZE, y: localY / surfaceHeight * SIZE };
        const state = eraseAt(point);
        button.dataset.wipeState = state;
        updateWipeAudio(clientX, clientY, state);
      }
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch' && event.pointerId !== activePointerId) return;
      if (activePointerId === event.pointerId && pointerStart && !revealedRef.current) {
        const dist = Math.hypot(event.clientX - pointerStart.x, event.clientY - pointerStart.y);
        if (dist > 8) {
          didDrag = true;
          suppressTap.current = true;
        }
      }
      handlePointerMove(
        event.clientX,
        event.clientY,
        event.pointerType,
        event.pointerId,
        event.target === button ? event.offsetX : undefined,
        event.target === button ? event.offsetY : undefined,
      );
    };

    const onPointerDown = (event: PointerEvent) => {
      measureBoundsIfNeeded();
      unlockAudio();
      if (activePointerId !== null) return;
      pointerStart = { x: event.clientX, y: event.clientY };
      didDrag = false;
      suppressTap.current = false;
      window.clearTimeout(clearTimer);
      audioPointer = { x: event.clientX, y: event.clientY, time: performance.now() };
      handlePointerMove(
        event.clientX,
        event.clientY,
        event.pointerType,
        event.pointerId,
        event.target === button ? event.offsetX : undefined,
        event.target === button ? event.offsetY : undefined,
      );
      activePointerId = event.pointerId;
      button.dataset.wiping = 'true';
      button.dataset.clothVisible = 'true';
      try { button.setPointerCapture(event.pointerId); } catch {}
    };

    const onPointerUp = (event: PointerEvent) => {
      if (event.pointerId === activePointerId) {
        activePointerId = null;
        pointerStart = null;
        if (didDrag) {
          window.clearTimeout(clearTimer);
          clearTimer = window.setTimeout(() => {
            suppressTap.current = false;
          }, 150);
        } else {
          suppressTap.current = false;
        }
        didDrag = false;
        try {
          if (button.hasPointerCapture(event.pointerId)) button.releasePointerCapture(event.pointerId);
        } catch {}
      }
      button.dataset.wiping = 'false';
      if (event.pointerType === 'touch') {
        button.dataset.clothVisible = 'false';
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
      if (activePointerId !== null) return;
      button.dataset.clothVisible = 'false';
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
      playResetWipe.current = () => {};
      delete canvas.dataset.ready;
      delete button.dataset.clothVisible;
      delete button.dataset.wiping;
      delete button.dataset.wipeState;
      image.removeEventListener('load', onImgLoad);
      veilImage?.removeEventListener('load', onVeilLoad);
      visObserver.disconnect();
      document.removeEventListener('visibilitychange', syncPlayback);
      window.clearTimeout(clearTimer);
      window.clearTimeout(quietTimer);
      window.cancelAnimationFrame(residueFrame);
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
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    gsap.to([veil.current, residue.current], {
      opacity: revealed ? 0 : 1,
      duration: .55,
      ease: 'power2.out',
      overwrite: 'auto',
    });
  }, { scope: root, dependencies: [revealed, paused] });

  const toggleReveal = () => {
    if (revealed) {
      playResetWipe.current();
      reset.current();
      setRevealed(false);
    } else {
      playRevealWipe.current();
      setRevealed(true);
    }
  };

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
        toggleReveal();
      }}
    >
      <span className={styles.surface}>
        <Image ref={photo} className={styles.photo} src="/gerald-donkor.jpg" alt="Portrait of Gerald Donkor" width={600} height={600} unoptimized />
        <canvas ref={veil} className={styles.veil} width={SIZE} height={SIZE} aria-hidden="true" />
        <canvas ref={residue} className={styles.residue} width={SIZE} height={SIZE} aria-hidden="true" />
        {!paused && (
          <span ref={cloth} className={styles.cloth} data-wipe-cloth="" aria-hidden="true">
            <span className={styles.clothWeave} />
            <span className={styles.clothSheen} />
          </span>
        )}
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
    {!paused && (
      <button
        type="button"
        className={styles.hint}
        onClick={toggleReveal}
        aria-label={revealed ? 'Clean the glass again' : 'Show the full portrait'}
      >
        <span className={styles.desktopHint}>{revealed ? 'Click to reset' : 'Move to explore · click to reveal'}</span>
        <span className={styles.touchHint}>{revealed ? 'Tap to reset' : 'Drag to explore · tap to reveal'}</span>
      </button>
    )}
  </div>;
}
