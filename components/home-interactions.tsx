'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import dynamic from 'next/dynamic';
import { ArrowUpRight, ArrowUp, ArrowDown, Menu, Copy, Check } from 'lucide-react';
import { AmbientField } from './ambient-field';
import { CursorFollower, usePortfolioMotion } from './portfolio-motion';
import { useMotionPreference } from './motion-provider';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogClose, DialogTrigger } from './ui/dialog';
import { GmailIcon } from './contact-icons';
import styles from '@/app/home.module.css';

export const PortraitReveal = dynamic(() => import('./portrait-reveal').then(m => m.PortraitReveal), { ssr: true });

gsap.registerPlugin(useGSAP);

// Static page content stays outside the client module graph and local state updates.
export function HomeMotion({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const { paused } = useMotionPreference();
  usePortfolioMotion(root);
  // Hero scroll cue: gentle idle bob + hover/focus dip-and-return.
  // Scoped to this page, disabled when motion is paused or reduced.
  useGSAP(() => {
    if (paused) return;
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const link = root.current?.querySelector(`.${styles.heroBottom} > a`);
      const pill = root.current?.querySelector(`.${styles.scrollButton}`);
      const arrow = pill?.querySelector('svg');
      if (!link || !pill || !arrow) return;
      const bob = gsap.to(arrow, { y: 5, duration: .85, ease: 'sine.inOut', repeat: -1, yoyo: true });
      let cueing = false;
      const cue = () => {
        if (cueing) return;
        cueing = true;
        bob.pause();
        gsap.timeline({ onComplete: () => { cueing = false; bob.play(); } })
          .to(arrow, { y: 10, autoAlpha: 0, duration: .24, ease: 'power2.in', overwrite: 'auto' })
          .set(arrow, { y: -10 })
          .to(arrow, { y: 0, autoAlpha: 1, duration: .5, ease: 'power3.out' })
          .to(pill, { y: -2, duration: .16, ease: 'power2.out', yoyo: true, repeat: 1 }, 0);
      };
      link.addEventListener('pointerenter', cue);
      link.addEventListener('focusin', cue);
      return () => {
        link.removeEventListener('pointerenter', cue);
        link.removeEventListener('focusin', cue);
        bob.kill();
        gsap.set([arrow, pill], { clearProps: 'all' });
      };
    });
    return () => mm.revert();
  }, { scope: root, dependencies: [paused], revertOnUpdate: true });

  return <div ref={root} className={`${styles.page}${paused ? ' motion-paused' : ''}`}>
    {children}
  </div>;
}

export function HomeAtmosphere() {
  return <><AmbientField /><CursorFollower /></>;
}

export function MobileMenu() {
  const { paused } = useMotionPreference();
  const [menu, setMenu] = useState(false);
  const menuTarget = useRef<string | null>(null);
  return <Dialog open={menu} onOpenChange={setMenu}>
    <DialogTrigger asChild><button className={styles.menuButton} aria-label="Open menu"><Menu /></button></DialogTrigger>
    <DialogContent className="mobile-dialog" onCloseAutoFocus={event => {
      const target = menuTarget.current ? document.getElementById(menuTarget.current) : null;
      menuTarget.current = null;
      if (target) { event.preventDefault(); target.focus({ preventScroll: true }); target.scrollIntoView({ behavior: paused ? 'instant' : 'smooth' }); }
    }}>
      <DialogTitle className="sr-only">Navigation</DialogTitle><DialogDescription className="sr-only">Explore Gerald’s portfolio.</DialogDescription>
      <span className="menu-wordmark">Gerald Donkor</span>
      <nav aria-label="Mobile navigation">{['Work', 'About', 'Playground', 'Contact'].map(item => <DialogClose asChild key={item}><a href={`#${item.toLowerCase()}`} onClick={() => { menuTarget.current = item.toLowerCase(); }}>{item}<ArrowUpRight /></a></DialogClose>)}</nav>
    </DialogContent>
  </Dialog>;
}

export function ExploreWorkLink() {
  const { paused } = useMotionPreference();
  return <a href="#work" onClick={event => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const work = document.getElementById('work');
    if (!work) return;
    event.preventDefault();
    work.focus({ preventScroll: true });
    work.scrollIntoView({ behavior: paused ? 'instant' : 'smooth', block: 'start' });
    window.history.replaceState(null, '', '#work');
  }}>Explore the work <span className={styles.scrollButton}><ArrowDown size={20} aria-hidden="true" /></span></a>;
}

export function EmailCard() {
  const [copyStatus, setCopyStatus] = useState('');
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (copyTimer.current) clearTimeout(copyTimer.current); }, []);
  async function copyEmail() {
    try {
      await navigator.clipboard.writeText('geralddonkor1@gmail.com');
      setCopyStatus('Email copied');
      if (copyTimer.current) clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopyStatus(''), 2500);
    } catch { setCopyStatus('Select the email address to copy it.'); }
  }
  return <div className={`${styles.contactCard} ${styles.contactCardGmail}`}>
    <a
      href="mailto:geralddonkor1@gmail.com"
      className={styles.cardLink}
      data-cursor="link"
    >
      <span className={styles.cardIcon}>
        <GmailIcon />
      </span>
      <div className={styles.cardDetails}>
        <span className={styles.cardPlatform}>Email</span>
        <span className={styles.cardHandle}>geralddonkor1@gmail.com</span>
      </div>
    </a>
    <div className={styles.cardActions}>
      <button
        type="button"
        onClick={copyEmail}
        className={`${styles.cardActionBtn} ${copyStatus ? styles.copied : ''}`}
        aria-label="Copy email address"
        title={copyStatus ? 'Email copied' : 'Copy email address'}
        data-magnetic
      >
        {copyStatus === 'Email copied' ? (
          <Check size={14} aria-hidden="true" />
        ) : (
          <Copy size={14} aria-hidden="true" />
        )}
      </button>
      <a
        href="mailto:geralddonkor1@gmail.com"
        className={styles.cardActionBtn}
        aria-label="Send email to geralddonkor1@gmail.com"
        title="Send email"
        data-magnetic
      >
        <ArrowUpRight size={14} aria-hidden="true" />
      </a>
    </div>
    {copyStatus && (
      <span className={styles.copyToast} role="status">
        <Check size={11} aria-hidden="true" /> Copied
      </span>
    )}
  </div>;
}

export function BackToTop() {
  const { paused } = useMotionPreference();
  return <button
    type="button"
    className={styles.backToTop}
    aria-label="Back to top"
    title="Back to top"
    onClick={() => {
      document.querySelector<HTMLAnchorElement>('header a')?.focus({ preventScroll: true });
      window.scrollTo({ top: 0, behavior: paused ? 'instant' : 'smooth' });
    }}
  >
    <ArrowUp size={21} strokeWidth={1.5} aria-hidden="true" />
  </button>;
}
