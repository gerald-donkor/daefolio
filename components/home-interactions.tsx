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
  const [panelNode, setPanelNode] = useState<HTMLDivElement | null>(null);
  const [overlayNode, setOverlayNode] = useState<HTMLDivElement | null>(null);
  const menuTrigger = useRef<HTMLButtonElement>(null);
  const menuTarget = useRef<string | null>(null);
  const menuTimeline = useRef<gsap.core.Timeline | null>(null);
  const isClosing = useRef(false);

  useGSAP(() => {
    const menuPanel = panelNode;
    const menuOverlay = overlayNode;
    if (!menu || !menuPanel || !menuOverlay) return;

    const wordmark = menuPanel.querySelector('.menu-wordmark');
    const closeButton = menuPanel.querySelector('.dialog-close');
    const links = menuPanel.querySelectorAll('nav a');
    const triggerBounds = menuTrigger.current?.getBoundingClientRect();
    const panelBounds = menuPanel.getBoundingClientRect();
    const transformOrigin = triggerBounds
      ? `${triggerBounds.left + triggerBounds.width / 2 - panelBounds.left}px ${triggerBounds.top + triggerBounds.height / 2 - panelBounds.top}px`
      : '100% 0%';

    if (paused) {
      gsap.set([menuOverlay, menuPanel, wordmark, closeButton, links], { clearProps: 'all' });
      menuTimeline.current = null;
      return;
    }

    const timeline = gsap.timeline({
      paused: true,
      defaults: { ease: 'power3.out' },
    });
    timeline
      .addLabel('summon', 0)
      .fromTo(menuOverlay, { autoAlpha: 0 }, { autoAlpha: 1, duration: .36 }, 'summon')
      .fromTo(menuPanel, {
        autoAlpha: 0,
        x: 0,
        y: 0,
        scaleX: .012,
        scaleY: .012,
        skewX: 0,
        skewY: 0,
        borderRadius: '50%',
        transformOrigin,
      }, {
        autoAlpha: 1,
        x: 4,
        y: -2,
        scaleX: .2,
        scaleY: .24,
        skewX: -7,
        skewY: 2,
        borderRadius: '46% 0 38% 52%',
        duration: .1,
        ease: 'power2.out',
      }, 'summon+=.02')
      .addLabel('plume')
      .to(menuPanel, {
        x: 6,
        y: -3,
        scaleX: .42,
        scaleY: .96,
        skewX: -5,
        skewY: 1,
        borderRadius: '28% 0 20% 34%',
        duration: .24,
        ease: 'sine.inOut',
      }, 'plume')
      .addLabel('bloom')
      .to(menuPanel, {
        x: 0,
        y: 0,
        scaleX: 1.02,
        scaleY: .99,
        skewX: .7,
        skewY: 0,
        borderRadius: '2% 0 1% 3%',
        duration: .54,
        ease: 'power4.out',
      }, 'bloom')
      .to(menuPanel, {
        scaleX: 1,
        scaleY: 1,
        skewX: 0,
        borderRadius: 0,
        duration: .15,
        ease: 'sine.out',
      })
      .fromTo([wordmark, closeButton], { autoAlpha: 0, y: -12 }, {
        autoAlpha: 1,
        y: 0,
        duration: .32,
        stagger: .05,
      }, 'bloom+=.13')
      .fromTo(links, { autoAlpha: 0, x: 24, y: 34, skewY: 4 }, {
        autoAlpha: 1,
        x: 0,
        y: 0,
        skewY: 0,
        duration: .42,
        stagger: .06,
        ease: 'power4.out',
      }, 'bloom+=.18');

    menuTimeline.current = timeline;
    timeline.timeScale(2.1).play(0);
    return () => {
      menuTimeline.current = null;
      timeline.kill();
    };
  }, { dependencies: [menu, paused, panelNode, overlayNode], revertOnUpdate: true });

  const changeMenu = (nextOpen: boolean) => {
    if (nextOpen) {
      isClosing.current = false;
      setMenu(true);
      return;
    }
    const timeline = menuTimeline.current;
    if (paused || !timeline) {
      setMenu(false);
      return;
    }
    if (isClosing.current) return;
    isClosing.current = true;
    timeline.eventCallback('onReverseComplete', () => {
      isClosing.current = false;
      setMenu(false);
    });
    timeline.timeScale(1.65).reverse();
  };

  return <Dialog open={menu} onOpenChange={changeMenu}>
    <DialogTrigger asChild><button ref={menuTrigger} className={styles.menuButton} aria-label="Open menu"><Menu /></button></DialogTrigger>
    <DialogContent ref={setPanelNode} overlayRef={setOverlayNode} overlayClassName="mobile-menu-overlay" className="mobile-dialog" onCloseAutoFocus={event => {
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
