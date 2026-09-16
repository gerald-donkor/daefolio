'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useMotionPreference } from './motion-provider';
import { useTheme } from './theme-provider';
import styles from './ambient-field.module.css';

gsap.registerPlugin(useGSAP);
type Wisp = { x: number; y: number; vx: number; vy: number; age: number; life: number; size: number; hue: number; spin: 1.2 | 2.4 };

/** A single viewport-sized field: bounded particles, time-based decay, no React pointer updates. */
export function AmbientField() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const { paused } = useMotionPreference();
  const { theme } = useTheme();
  useGSAP(() => {
    const element = canvas.current;
    const ctx = element?.getContext('2d');
    if (!element || !ctx) return;
    let width = 0, height = 0;
    let wisps: Wisp[] = [];
    let previous: { x: number; y: number; time: number } | null = null;
    let elapsed = 0;
    const fine = window.matchMedia('(pointer: fine)');
    const dust = Array.from({ length: 65 }, (_, i) => ({ x: ((i * 137.508) % 100) / 100, y: ((i * 73.31) % 100) / 100, size: .5 + (i % 4) * .25, phase: i * 1.71 }));
    const resize = () => {
      width = window.innerWidth; height = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      element.width = Math.round(width * dpr); element.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw(0, 0);
    };
    const draw = (_time: number, delta: number) => {
      const dt = Math.min(delta / 1000, .04);
      elapsed += dt;
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = 'source-over';
      for (const mote of dust) {
        const x = mote.x * width + Math.sin(elapsed * .12 + mote.phase) * 16;
        const y = (mote.y * height - elapsed * (2 + mote.size) + height * 100) % height;
        ctx.fillStyle = theme === 'dark' ? `rgba(181,205,207,${.13 + Math.sin(elapsed * .4 + mote.phase) * .065})` : 'rgba(57,82,78,.15)';
        ctx.beginPath(); ctx.ellipse(x, y, mote.size * .55, mote.size * 1.6, -.5, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalCompositeOperation = theme === 'dark' ? 'lighter' : 'source-over';
      // Compact in place so the animation does not allocate an array every frame.
      let liveCount = 0;
      const curl = 2.4 * dt;
      const curlCos = Math.cos(curl), curlSin = Math.sin(curl);
      const burstCurl = 1.2 * dt;
      const burstCos = Math.cos(burstCurl), burstSin = Math.sin(burstCurl);
      for (const wisp of wisps) {
        if (wisp.age >= wisp.life) continue;
        wisps[liveCount++] = wisp;
        wisp.age += dt;
        const progress = Math.min(1, wisp.age / wisp.life);
        const fade = (1 - progress) ** 2;
        const cos = wisp.spin === 2.4 ? curlCos : burstCos;
        const sin = wisp.spin === 2.4 ? curlSin : burstSin;
        const vx = wisp.vx * cos - wisp.vy * sin;
        wisp.vy = wisp.vx * sin + wisp.vy * cos; wisp.vx = vx;
        wisp.x += wisp.vx * dt; wisp.y += wisp.vy * dt;
        const size = wisp.size * (1 + progress * 1.6);
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size);
        gradient.addColorStop(0, `hsla(${wisp.hue},85%,96%,${fade * .85})`);
        gradient.addColorStop(.045, `hsla(${wisp.hue},95%,85%,${fade * .6})`);
        gradient.addColorStop(.13, `hsla(${wisp.hue},90%,70%,${fade * .3})`);
        gradient.addColorStop(.4, `hsla(${wisp.hue + 15},80%,62%,${fade * .075})`);
        gradient.addColorStop(1, `hsla(${wisp.hue + 30},70%,50%,0)`);
        ctx.save(); ctx.translate(wisp.x, wisp.y); ctx.rotate(Math.atan2(wisp.vy, wisp.vx)); ctx.scale(1.6, .75);
        ctx.fillStyle = gradient; ctx.fillRect(-size, -size, size * 2, size * 2); ctx.restore();
      }
      wisps.length = liveCount;
    };
    const move = (event: PointerEvent) => {
      if (paused || !fine.matches || event.pointerType === 'touch' || document.hidden) return;
      const now = performance.now();
      if (previous && now - previous.time < 12) return;
      if (previous && now - previous.time < 180) {
        const dx = event.clientX - previous.x, dy = event.clientY - previous.y;
        const distance = Math.hypot(dx, dy);
        if (distance > 2) {
          const count = Math.min(7, Math.ceil(distance / 9));
          for (let i = 0; i < count; i++) {
            const fraction = i / count;
            wisps.push({ x: previous.x + dx * fraction, y: previous.y + dy * fraction, vx: -dx * 1.8 + dy * .4, vy: -dy * 1.8 - dx * .4, age: 0, life: .65 + Math.random() * .6, size: 18 + Math.min(distance * .3, 22), hue: 145 + (Math.sin(elapsed * .7) + 1) * 12, spin: 2.4 });
          }
          if (wisps.length > 160) wisps.splice(0, wisps.length - 160);
        }
      }
      previous = { x: event.clientX, y: event.clientY, time: now };
    };
    const press = (event: PointerEvent) => {
      if (paused || !fine.matches || event.pointerType === 'touch') return;
      for (let i = 0; i < 14; i++) {
        const angle = i / 14 * Math.PI * 2;
        wisps.push({ x: event.clientX, y: event.clientY, vx: Math.cos(angle) * 80, vy: Math.sin(angle) * 80, age: 0, life: .7, size: 22, hue: 150 + i * 3, spin: 1.2 });
      }
      if (wisps.length > 160) wisps.splice(0, wisps.length - 160);
    };
    const leave = () => { previous = null; };
    const sync = () => {
      gsap.ticker.remove(draw);
      if (!paused && !document.hidden) gsap.ticker.add(draw);
      else { wisps = []; previous = null; draw(0, 0); }
    };
    resize(); sync();
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('pointerdown', press, { passive: true });
    window.addEventListener('blur', leave);
    document.addEventListener('pointerleave', leave);
    document.addEventListener('visibilitychange', sync);
    return () => {
      gsap.ticker.remove(draw); ctx.clearRect(0, 0, width, height);
      window.removeEventListener('resize', resize); window.removeEventListener('pointermove', move); window.removeEventListener('pointerdown', press);
      window.removeEventListener('blur', leave); document.removeEventListener('pointerleave', leave); document.removeEventListener('visibilitychange', sync);
    };
  }, { scope: canvas, dependencies: [paused, theme], revertOnUpdate: true });
  return <div className={styles.field} aria-hidden="true"><div className={styles.haze} /><canvas ref={canvas} /></div>;
}
