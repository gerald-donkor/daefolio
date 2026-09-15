'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { ArrowUpRight, ArrowUp, ArrowDown, Menu, Copy, Check, Asterisk } from 'lucide-react';
import { Work } from '@/components/work';
import { Playground } from '@/components/playground';
import { AmbientField } from '@/components/ambient-field';
import { ContactVideo } from '@/components/contact-video';
import { PortraitReveal } from '@/components/portrait-reveal';
import { useMotionPreference } from '@/components/motion-provider';
import { CursorFollower, usePortfolioMotion } from '@/components/portfolio-motion';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogClose, DialogTrigger } from '@/components/ui/dialog';
import { GmailIcon, LinkedinIcon, GithubIcon, XIcon } from '@/components/contact-icons';
import styles from './home.module.css';

const toolGroups = [
  { label: 'Design', tools: [['Figma', 'figma'], ['Framer', 'framer'], ['Spline', 'spline']] },
  { label: 'Build', tools: [['React', 'react'], ['Next.js', 'nextdotjs'], ['TypeScript', 'typescript']] },
  { label: 'Motion & ship', tools: [['GSAP', 'greensock'], ['GitHub', 'github'], ['Vercel', 'vercel']] },
] as const;

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
      <section data-preferences-hero className={styles.hero} aria-labelledby="hero-title">
        <div className={styles.heroBackdrop} aria-hidden="true">
          <picture>
            <source
              type="image/webp"
              srcSet="/images/hero-wireframes-1600.webp 1600w, /images/hero-wireframes-2560.webp 2560w, /images/hero-wireframes-3840.webp 3840w"
              sizes="(max-width: 860px) 150svh, 100vw"
            />
            <Image
              className={styles.heroPhoto}
              src="/images/hero-wireframes-2560.webp"
              alt=""
              fill
              sizes="(max-width: 860px) 150svh, 100vw"
              quality={100}
              unoptimized
              loading="eager"
              fetchPriority="high"
            />
          </picture>
          <div className={styles.heroInterface}>
            <picture>
              <source
                type="image/webp"
                srcSet="/images/hero-onboarding-960.webp 960w, /images/hero-onboarding-1600.webp 1600w, /images/hero-onboarding-2400.webp 2400w"
                sizes="(max-width: 600px) 113vw, (max-width: 860px) 92vw, 60vw"
              />
              <Image
                className={styles.heroInterfacePhoto}
                src="/images/hero-onboarding-1600.webp"
                alt=""
                fill
                sizes="(max-width: 600px) 113vw, (max-width: 860px) 92vw, 60vw"
                unoptimized
                loading="eager"
              />
            </picture>
          </div>
        </div>
        <div className={`${styles.heroPrelude} hero-detail`}><span>Interfaces. Interactions. A little intuition.</span><span>Ghana / Working everywhere</span></div>
        <div className={styles.identity}>
          <h1 id="hero-title"><span className="hero-line"><span>Gerald</span></span><span className="hero-line"><span>Donkor</span></span></h1>
          <div className={`${styles.intro} hero-detail`}><span className={styles.handmark} data-spin aria-hidden="true"><span><Asterisk strokeWidth={1} /></span></span><p>I design the interface.<br />I write the code.<br />I care how it feels.</p><span>Independent design engineer<br />based in Ghana.</span></div>
        </div>
        <div className={`${styles.heroBottom} hero-detail`}><p>A place for the things I make<br />and the details I get lost in.</p><a href="#work" onClick={event => {
          if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
          const work = document.getElementById('work');
          if (!work) return;
          event.preventDefault();
          work.focus({ preventScroll: true });
          work.scrollIntoView({ behavior: paused ? 'instant' : 'smooth', block: 'start' });
          window.history.replaceState(null, '', '#work');
        }}>Explore the work <span className={styles.scrollButton}><ArrowDown size={20} aria-hidden="true" /></span></a></div>
      </section>
      <section id="work" tabIndex={-1} className={styles.work}>
        <div className={styles.sectionHeading}><h2>Selected work<span> (5)</span></h2><p>From the first sketch<br />to the last interaction.</p></div>
        <Work />
        <a className={styles.textLink} href="https://github.com/gerald-donkor" target="_blank" rel="noreferrer">More things I’m building on GitHub <ArrowUpRight size={18} aria-hidden="true" /></a>
      </section>
      <section id="about" tabIndex={-1} className={styles.about}>
        <div className={styles.aboutSide}>
          <h2>A little<br />about me.</h2>
          <PortraitReveal />
          <span>Gerald Donkor<br />Design & development</span>
        </div>
        <div className={styles.aboutContent}><p className={styles.statement}>The interesting part is where design meets code.</p><p>I’m a design engineer based in Ghana. I like being close to the whole thing: figuring out an interface, building it, then tuning the small details that make it feel natural.</p><p>A useful product can have personality. A beautiful website can work beautifully, too. That’s the space I like working in.</p><div className={styles.capabilities}>{[['Interface design', 'Visual direction, prototypes, design systems'], ['Frontend development', 'React, Next.js, TypeScript'], ['Motion & interaction', 'GSAP, creative coding, the details']].map(([title, description]) => <div key={title}><h3>{title}</h3><span>{description}</span></div>)}</div><div className={styles.toolbox} aria-labelledby="toolbox-title"><div className={styles.toolboxHeading}><h3 id="toolbox-title">The tools behind the work.</h3><p>From first frame to final deploy.</p></div><div className={styles.toolGroups}>{toolGroups.map(group => <div className={styles.toolGroup} key={group.label}><span>{group.label}</span><ul>{group.tools.map(([name, icon]) => <li key={name}><Image src={`/logos/${icon}.svg`} alt="" width={28} height={28} aria-hidden="true" /><span>{name}</span></li>)}</ul></div>)}</div></div></div>
      </section>
      <section id="playground" tabIndex={-1} className={styles.playground}>
        <div className={styles.sectionHeading}><h2>Made out of curiosity.</h2><p>A few small experiments.<br />Go on, play with them.</p></div>
        <Playground />
      </section>
      <section id="contact" tabIndex={-1} className={styles.contact}>
        <ContactVideo />
        <div className={styles.contactPrelude}><span>Have something in mind?</span><span>Good things start with a conversation.</span></div>
        <a className={styles.contactTitle} href="mailto:geralddonkor1@gmail.com" data-cursor="link">Let’s make<br />it happen.<ArrowUpRight aria-hidden="true" /></a>
        <div className={styles.contactChannels} aria-label="Contact channels and social profiles">
          {/* Email Card */}
          <div className={`${styles.contactCard} ${styles.contactCardGmail}`}>
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
          </div>

          {/* GitHub Card */}
          <a
            href="https://github.com/gerald-donkor"
            target="_blank"
            rel="noreferrer"
            className={`${styles.contactCard} ${styles.contactCardGithub}`}
            data-cursor="link"
          >
            <span className={styles.cardIcon}>
              <GithubIcon />
            </span>
            <div className={styles.cardDetails}>
              <span className={styles.cardPlatform}>GitHub</span>
              <span className={styles.cardHandle}>gerald-donkor</span>
            </div>
            <span className={styles.cardActionIcon} aria-hidden="true">
              <ArrowUpRight size={15} />
            </span>
          </a>

          {/* LinkedIn Card */}
          <a
            href="https://www.linkedin.com/in/gerald-donkor-46814a379"
            target="_blank"
            rel="noreferrer"
            className={`${styles.contactCard} ${styles.contactCardLinkedin}`}
            data-cursor="link"
          >
            <span className={styles.cardIcon}>
              <LinkedinIcon />
            </span>
            <div className={styles.cardDetails}>
              <span className={styles.cardPlatform}>LinkedIn</span>
              <span className={styles.cardHandle}>Gerald Donkor</span>
            </div>
            <span className={styles.cardActionIcon} aria-hidden="true">
              <ArrowUpRight size={15} />
            </span>
          </a>

          {/* X / Twitter Card */}
          <a
            href="https://x.com/gerald_daedalus"
            target="_blank"
            rel="noreferrer"
            className={`${styles.contactCard} ${styles.contactCardX}`}
            data-cursor="link"
          >
            <span className={styles.cardIcon}>
              <XIcon />
            </span>
            <div className={styles.cardDetails}>
              <span className={styles.cardPlatform}>X</span>
              <span className={styles.cardHandle}>@gerald_daedalus</span>
            </div>
            <span className={styles.cardActionIcon} aria-hidden="true">
              <ArrowUpRight size={15} />
            </span>
          </a>
        </div>

        <footer className={styles.footer}>
          <a href="#main">Gerald Donkor</a>
          <span>From Ghana, with care.</span>
          <div className={styles.footerLinks}>
            <a href="https://github.com/gerald-donkor" target="_blank" rel="noreferrer">
              <GithubIcon className={styles.footerIcon} />
              <span>GitHub</span>
            </a>
            <a href="https://www.linkedin.com/in/gerald-donkor-46814a379" target="_blank" rel="noreferrer">
              <LinkedinIcon className={styles.footerIcon} />
              <span>LinkedIn</span>
            </a>
            <a href="https://x.com/gerald_daedalus" target="_blank" rel="noreferrer">
              <XIcon className={styles.footerIcon} />
              <span>X</span>
            </a>
          </div>
          <span>© {new Date().getFullYear()}</span>
          <button
            type="button"
            className={styles.backToTop}
            aria-label="Back to top"
            title="Back to top"
            onClick={() => {
              root.current?.querySelector<HTMLAnchorElement>('header a')?.focus({ preventScroll: true });
              window.scrollTo({ top: 0, behavior: paused ? 'instant' : 'smooth' });
            }}
          >
            <ArrowUp size={21} strokeWidth={1.5} aria-hidden="true" />
          </button>
        </footer>
      </section>
    </main>
  </div>;
}
