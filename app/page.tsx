'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { ArrowUpRight, ArrowDown, Menu, Copy, Check, Asterisk } from 'lucide-react';
import { Work } from '@/components/work';
import { Playground } from '@/components/playground';
import { AmbientField } from '@/components/ambient-field';
import { useMotionPreference } from '@/components/motion-provider';
import { CursorFollower, usePortfolioMotion } from '@/components/portfolio-motion';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogClose, DialogTrigger } from '@/components/ui/dialog';
import styles from './home.module.css';

export default function Home() {
  const root = useRef<HTMLDivElement>(null);
  const { paused } = useMotionPreference();
  const [menu, setMenu] = useState(false);
  const menuTarget = useRef<string | null>(null);
  const [copyStatus, setCopyStatus] = useState('');
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  usePortfolioMotion(root);
  useEffect(() => () => { if (copyTimer.current) clearTimeout(copyTimer.current); }, []);
  async function copyEmail() {
    try {
      await navigator.clipboard.writeText('geralddonkor1@gmail.com');
      setCopyStatus('Email copied');
      if (copyTimer.current) clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopyStatus(''), 2500);
    } catch { setCopyStatus('Select the email address to copy it.'); }
  }

  return <div ref={root} className={`${styles.page}${paused ? ' motion-paused' : ''}`}>
    <a className="skip-link" href="#main">Skip to content</a>
    <AmbientField /><CursorFollower />
    <header className={styles.navbar}>
      <a href="#main" className={styles.wordmark} aria-label="Gerald Donkor, back to top">gd<span>↗</span></a>
      <span className={styles.navRole}>Independent design engineer</span>
      <nav aria-label="Main navigation"><a href="#work">Work<sup>5</sup></a><a href="#about">About</a><a href="#playground">Play</a></nav>
      <a className={styles.navContact} href="#contact" data-magnetic>Let’s talk <ArrowUpRight size={15} aria-hidden="true" /></a>
      <Dialog open={menu} onOpenChange={setMenu}>
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
      </Dialog>
    </header>
    <main id="main" tabIndex={-1}>
      <section className={styles.hero} aria-labelledby="hero-title">
        <div className={`${styles.heroPrelude} hero-detail`}><span>Interfaces. Interactions. A little intuition.</span><span>Ghana / Working everywhere</span></div>
        <div className={styles.identity}>
          <h1 id="hero-title"><span className="hero-line"><span>Gerald</span></span><span className="hero-line"><span>Donkor.</span></span></h1>
          <div className={`${styles.intro} hero-detail`}><span className={styles.handmark} data-spin aria-hidden="true"><span><Asterisk strokeWidth={1} /></span></span><p>I design the interface.<br />I write the code.<br />I care how it feels.</p><span>Independent design engineer<br />based in Ghana.</span></div>
        </div>
        <div className={`${styles.heroBottom} hero-detail`}><p>A place for the things I make<br />and the details I get lost in.</p><a href="#work" data-magnetic>Explore the work <span className={styles.scrollButton}><ArrowDown size={20} aria-hidden="true" /></span></a></div>
      </section>
      <section id="work" tabIndex={-1} className={styles.work}>
        <div className={styles.sectionHeading}><h2>Selected work<span> (5)</span></h2><p>From the first sketch<br />to the last interaction.</p></div>
        <Work />
        <a className={styles.textLink} href="https://github.com/gerald-donkor" target="_blank" rel="noreferrer">More things I’m building on GitHub <ArrowUpRight size={18} aria-hidden="true" /></a>
      </section>
      <section id="about" tabIndex={-1} className={styles.about}>
        <div className={styles.aboutSide}>
          <h2>A little<br />about me.</h2>
          <Image
            className={styles.portrait}
            src="/gerald-donkor.jpg"
            alt="Portrait of Gerald Donkor"
            width={600}
            height={600}
            quality={100}
            unoptimized
          />
          <span>Gerald Donkor<br />Design & development</span>
        </div>
        <div className={styles.aboutContent}><p className={styles.statement}>The interesting part is where design meets code.</p><p>I’m a design engineer based in Ghana. I like being close to the whole thing: figuring out an interface, building it, then tuning the small details that make it feel natural.</p><p>A useful product can have personality. A beautiful website can work beautifully, too. That’s the space I like working in.</p><div className={styles.capabilities}>{[['Interface design', 'Visual direction, prototypes, design systems'], ['Frontend development', 'React, Next.js, TypeScript'], ['Motion & interaction', 'GSAP, creative coding, the details']].map(([title, description]) => <div key={title}><h3>{title}</h3><span>{description}</span></div>)}</div></div>
      </section>
      <section id="playground" tabIndex={-1} className={styles.playground}>
        <div className={styles.sectionHeading}><h2>Made out of curiosity.</h2><p>A few small experiments.<br />Go on, play with them.</p></div>
        <Playground />
      </section>
      <section id="contact" tabIndex={-1} className={styles.contact}>
        <div className={styles.contactPrelude}><span>Have something in mind?</span><span>Good things start with a conversation.</span></div>
        <a className={styles.contactTitle} href="mailto:geralddonkor1@gmail.com" data-cursor="link">Let’s make<br />it happen.<ArrowUpRight aria-hidden="true" /></a>
        <div className={styles.emailRow}><a href="mailto:geralddonkor1@gmail.com">geralddonkor1@gmail.com</a><button onClick={copyEmail} aria-label="Copy email address">{copyStatus === 'Email copied' ? <Check size={18} /> : <Copy size={18} />}</button><span role="status">{copyStatus}</span></div>
        <footer className={styles.footer}><a href="#main">Gerald Donkor</a><span>From Ghana, with care.</span><div><a href="https://github.com/gerald-donkor" target="_blank" rel="noreferrer">GitHub</a><a href="https://www.linkedin.com/in/gerald-donkor-46814a379" target="_blank" rel="noreferrer">LinkedIn</a><a href="https://x.com/gerald_daedalus" target="_blank" rel="noreferrer">X</a></div><span>© {new Date().getFullYear()}</span></footer>
      </section>
    </main>
  </div>;
}
