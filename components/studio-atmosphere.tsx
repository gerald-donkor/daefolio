'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useMotionPreference } from './motion-provider';
import { useTheme } from './theme-provider';

gsap.registerPlugin(useGSAP);

type Light = { x: number; y: number; dx: number; dy: number; life: number; size: number };

/** Each canvas is clipped to its dark chapter, below the content. */
export function StudioAtmosphere() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const { paused } = useMotionPreference();
  const { theme } = useTheme();

  useGSAP(() => {
    if (paused || theme !== 'dark' || !canvas.current) return;
    const mm = gsap.matchMedia();
    mm.add('(pointer: fine) and (min-width: 701px) and (prefers-reduced-motion: no-preference)', () => {
      const element = canvas.current!;
      const chapter = element.parentElement!;
      const ctx = element.getContext('2d');
      if (!ctx) return;
      let width = 0, height = 0, previous: { x: number; y: number } | null = null;
      let lights: Light[] = [];
      let ticking = false;
      const resize = () => {
        width = chapter.clientWidth;
        height = chapter.clientHeight;
        const dpr = Math.min(window.devicePixelRatio, 1.5);
        element.width = width * dpr;
        element.height = height * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      };
      const stop = () => {
        gsap.ticker.remove(draw);
        ticking = false;
        lights = [];
        previous = null;
        ctx.clearRect(0, 0, width, height);
      };
      const draw = (_time: number, delta: number) => {
        ctx.clearRect(0, 0, width, height);
        ctx.globalCompositeOperation = 'screen';
        const dt = Math.min(delta / 1000, .05);
        lights = lights.filter(light => light.life > 0);
        lights.forEach(light => {
          light.life -= dt * 1.35;
          light.x += light.dx * dt;
          light.y += light.dy * dt;
          const alpha = Math.max(0, light.life) * .12;
          const bloom = ctx.createRadialGradient(light.x, light.y, 0, light.x, light.y, light.size);
          bloom.addColorStop(0, `rgba(164,238,255,${alpha})`);
          bloom.addColorStop(.18, `rgba(127,231,255,${alpha * .8})`);
          bloom.addColorStop(.48, `rgba(167,149,255,${alpha * .55})`);
          bloom.addColorStop(.72, `rgba(217,162,239,${alpha * .2})`);
          bloom.addColorStop(1, 'rgba(167,149,255,0)');
          ctx.fillStyle = bloom;
          ctx.beginPath();
          ctx.arc(light.x, light.y, light.size, 0, Math.PI * 2);
          ctx.fill();
        });
        if (!lights.length) stop();
      };
      const move = (event: PointerEvent) => {
        if (event.pointerType === 'touch' || document.hidden) return;
        const rect = chapter.getBoundingClientRect();
        const x = event.clientX - rect.left, y = event.clientY - rect.top;
        if (!previous) { previous = { x, y }; return; }
        const dx = x - previous.x, dy = y - previous.y;
        const speed = Math.hypot(dx, dy);
        if (speed < 2) return;
        lights.push({ x, y, dx: -dy * .35, dy: dx * .35, life: Math.min(.85, .3 + speed / 80), size: Math.min(95, 35 + speed) });
        if (lights.length > 36) lights.shift();
        previous = { x, y };
        if (!ticking) { ticking = true; gsap.ticker.add(draw); }
      };
      const leave = () => { previous = null; };
      const visibility = () => { if (document.hidden) stop(); };
      const observer = new ResizeObserver(resize);
      observer.observe(chapter);
      resize();
      chapter.addEventListener('pointermove', move, { passive: true });
      chapter.addEventListener('pointerleave', leave);
      document.addEventListener('visibilitychange', visibility);
      window.addEventListener('scroll', leave, { passive: true });
      return () => {
        stop();
        observer.disconnect();
        chapter.removeEventListener('pointermove', move);
        chapter.removeEventListener('pointerleave', leave);
        document.removeEventListener('visibilitychange', visibility);
        window.removeEventListener('scroll', leave);
      };
    });
    return () => mm.revert();
  }, { scope: canvas, dependencies: [paused, theme], revertOnUpdate: true });

  return <><div className="studio-stars" aria-hidden="true" /><canvas ref={canvas} className="studio-wake" aria-hidden="true" /></>;
}
