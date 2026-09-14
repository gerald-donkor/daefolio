'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, ArrowDown, Asterisk, Menu, MousePointer2, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Work } from '@/components/work';
import { About } from '@/components/about';
import { Playground } from '@/components/playground';
import { StudioObject } from '@/components/studio-object';
import { StudioAtmosphere } from '@/components/studio-atmosphere';
import { useMotionPreference } from '@/components/motion-provider';
import { CursorFollower, usePortfolioMotion } from '@/components/portfolio-motion';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogClose, DialogTrigger } from '@/components/ui/dialog';

const process = [
  { title: 'Understand', description: 'Start with the people, the problem, and what matters.' },
  { title: 'Shape', description: 'Explore the flows, the visual language, and the possibilities.' },
  { title: 'Build', description: 'Bring the idea to life, one thoughtful component at a time.' },
  { title: 'Refine', description: 'Test it. Tune it. Care about the details.' },
];
const stack = ['TypeScript', 'React', 'Next.js', 'Tailwind CSS', 'GSAP', 'Motion', 'Figma', 'Node.js', 'Supabase', 'Git'];

export default function Home() {
  const root = useRef<HTMLDivElement>(null);
  const { paused } = useMotionPreference();
  const [menu, setMenu] = useState(false);
  const menuTarget = useRef<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  usePortfolioMotion(root);
  useEffect(() => () => { if (copyTimer.current) clearTimeout(copyTimer.current); }, []);

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText('geralddonkor1@gmail.com');
      setCopied(true); setCopyError(false);
      if (copyTimer.current) clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(false), 2500);
    } catch { setCopyError(true); }
  }

  return <div ref={root} className={`portfolio${paused ? ' motion-paused' : ''}`}>
    <a className="skip-link" href="#main">Skip to content</a><div className="page-progress" aria-hidden="true" /><CursorFollower />
    <header className="header">
      <a href="#" className="wordmark">gerald donkor<span>®</span></a>
      <nav aria-label="Main navigation"><a href="#work">Work <sup>05</sup></a><a href="#about">About</a><a href="#playground">Playground</a></nav>
      <a className="header-contact" href="mailto:geralddonkor1@gmail.com">Let’s talk <ArrowUpRight size={16} /></a>
      <Dialog open={menu} onOpenChange={setMenu}>
        <DialogTrigger asChild><button className="mobile-menu" aria-label="Open menu"><Menu /></button></DialogTrigger>
        <DialogContent className="mobile-dialog" onCloseAutoFocus={event => {
          const target = menuTarget.current ? document.getElementById(menuTarget.current) : null;
          menuTarget.current = null;
          if (target) { event.preventDefault(); target.focus({ preventScroll: true }); target.scrollIntoView({ behavior: paused ? 'instant' : 'smooth' }); }
        }}>
          <DialogTitle className="sr-only">Navigation</DialogTitle><DialogDescription className="sr-only">Explore Gerald’s portfolio.</DialogDescription>
          <span className="menu-wordmark">gerald donkor®</span>
          <nav aria-label="Mobile navigation">{['Work', 'About', 'Playground', 'Contact'].map(item => <DialogClose asChild key={item}><a href={`#${item.toLowerCase()}`} onClick={() => { menuTarget.current = item.toLowerCase(); }}>{item}<ArrowUpRight /></a></DialogClose>)}</nav>
          <span className="menu-foot">Based in Ghana. Working everywhere.</span>
        </DialogContent>
      </Dialog>
    </header>
    <main id="main">
      <section className="hero studio-chapter" aria-labelledby="hero-title">
        <StudioAtmosphere />
        <div className="hero-eyebrow hero-detail"><span className="eyebrow">Design engineer / Creative developer</span><span className="hero-location">Based in Ghana · Working everywhere</span></div>
        <div className="hero-grid">
          <div className="hero-copy">
            <h1 id="hero-title"><span className="hero-line"><span>Thoughtfully</span></span><span className="hero-line"><span>designed.</span></span><span className="hero-line hero-resolution"><span>Precisely built.</span></span></h1>
            <div className="hero-bottom hero-detail"><p>I’m Gerald. I turn complex ideas into intuitive<br className="desktop-break" /> interfaces—with a little motion and a lot of care.</p><a className="round-link" href="#work" aria-label="Explore selected work"><ArrowDown size={22} /></a></div>
          </div><StudioObject />
        </div>
        <div className="hero-foot hero-detail"><span>Good design is how it works. Great design is how it feels.</span><span>Scroll to explore <ArrowDown size={13} /></span></div>
      </section>
      <section id="work" tabIndex={-1} className="section work-section paper-chapter">
        <div className="chapter-cut" aria-hidden="true" />
        <div className="section-top"><span className="eyebrow">01 / Selected work</span><span className="small-muted">A few things I’ve put into the world.</span></div>
        <div className="section-title"><h2>Ideas, made real<span className="accent">.</span></h2><a href="https://github.com/gerald-donkor" target="_blank" rel="noreferrer">Explore my GitHub <ArrowUpRight size={17} /></a></div>
        <Work />
      </section>
      <div className="tech-ribbon" role="region" aria-label="Technology stack" tabIndex={0}><div className="tech-track">{[0, 1].map(copy => <div key={copy} aria-hidden={copy === 1}>{stack.map(technology => <span key={technology}>{technology}<Asterisk size={20} /></span>)}</div>)}</div></div>
      <section id="about" tabIndex={-1} className="section stone-chapter"><About /></section>
      <section className="process-section section paper-chapter">
        <div className="section-top"><span className="eyebrow">From the first question to the final detail</span></div>
        <div className="process-grid">{process.map((step, i) => <div className="process-step" key={step.title}><span>0{i + 1}</span><h3>{step.title}</h3><p>{step.description}</p></div>)}</div>
      </section>
      <section id="playground" tabIndex={-1} className="section playground-section studio-chapter">
        <div className="section-top"><span className="eyebrow">03 / Off the clock, on the canvas</span><span className="small-muted">Less explaining. More playing.</span></div>
        <div className="section-title"><h2>Serious about play<span className="accent">.</span></h2><span className="play-hint"><MousePointer2 size={15} /> Go on. Touch something.</span></div>
        <Playground />
      </section>
      <section id="contact" tabIndex={-1} className="section contact studio-chapter">
        <StudioAtmosphere /><span className="eyebrow">Have something in mind?</span>
        <a className="contact-title" href="mailto:geralddonkor1@gmail.com">Let’s make<br /><em>it feel right.</em><ArrowUpRight /></a>
        <div className="contact-email"><a className="email-link" href="mailto:geralddonkor1@gmail.com">geralddonkor1@gmail.com <ArrowUpRight size={18} /></a><Button variant="ghost" size="icon" onClick={copyEmail} aria-label="Copy email address">{copied ? <Check size={18} /> : <Copy size={18} />}</Button><span role="status" className="copy-status">{copied ? 'Email copied' : copyError ? 'Select the email to copy it.' : ''}</span></div>
        <div className="contact-socials"><span>Find me elsewhere</span><a href="https://github.com/gerald-donkor" target="_blank" rel="noreferrer">GitHub <ArrowUpRight size={16} /></a><a href="https://www.linkedin.com/in/gerald-donkor-46814a379" target="_blank" rel="noreferrer">LinkedIn <ArrowUpRight size={16} /></a><a href="https://x.com/gerald_daedalus" target="_blank" rel="noreferrer">X <ArrowUpRight size={16} /></a></div>
      </section>
    </main>
    <footer><a href="#" className="wordmark">gerald donkor<span>®</span></a><span>Designed & engineered with care.</span><a href="https://github.com/gerald-donkor" target="_blank" rel="noreferrer">GitHub <ArrowUpRight size={15} /></a><span>© {new Date().getFullYear()}</span></footer>
  </div>;
}
