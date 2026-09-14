'use client';
import { useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Plus, ArrowUpRight } from 'lucide-react';
import { useMotionPreference } from './motion-provider';

gsap.registerPlugin(useGSAP, ScrollTrigger);
const capabilities = [
  { title: 'Interface design', copy: 'Clear hierarchy, considered layouts, and components that work together. I turn complex requirements into interfaces people can navigate with confidence.', tags: ['Figma', 'Prototyping', 'Design systems'] },
  { title: 'Frontend engineering', copy: 'Responsive interfaces and reusable components, built with TypeScript and a careful approach to architecture. Good design deserves equally thoughtful implementation.', tags: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS'] },
  { title: 'Motion & interaction', copy: 'Motion gives an interface rhythm and helps every action feel connected. From a tiny hover state to a choreographed page, I care about how it feels to use.', tags: ['GSAP', 'Motion', 'Creative development'] },
  { title: 'The final 10%', copy: 'Refining performance, keyboard access, responsive behavior, and the details that make an experience hold together across screens.', tags: ['Accessibility', 'Performance', 'Design QA'] },
];

function Capability({ capability, index, open, onToggle }: { capability: typeof capabilities[number]; index: number; open: boolean; onToggle: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const initial = useRef(true);
  const initialStyle = useRef({ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }).current;
  const { paused } = useMotionPreference();
  useGSAP(() => {
    const panel = content.current!;
    const immediate = initial.current || paused;
    initial.current = false;
    // Height is intentional for disclosure layout; all ornamental motion uses transforms.
    if (open) panel.hidden = false;
    gsap.to(panel, { height: open ? 'auto' : 0, opacity: open ? 1 : 0, duration: immediate ? 0 : .32, ease: 'power2.inOut', overwrite: true,
      onComplete: () => { panel.hidden = !open; ScrollTrigger.refresh(); } });
    gsap.to('.capability-icon', { rotation: open ? 45 : 0, duration: immediate ? 0 : .32, overwrite: true });
  }, { scope: root, dependencies: [open, paused] });
  return <div ref={root} className={'capability ' + (open ? 'is-open' : '')}>
    <button id={'cap-trigger-' + index} onClick={onToggle} aria-expanded={open} aria-controls={'cap-' + index}><span className="cap-number">0{index + 1}</span><h3>{capability.title}</h3><Plus className="capability-icon" size={20} /></button>
    <div ref={content} id={'cap-' + index} role="region" aria-labelledby={'cap-trigger-' + index} className="cap-content" inert={!open} style={initialStyle}>
      <p>{capability.copy}</p><div className="tag-list">{capability.tags.map(tag => <span key={tag}>{tag}</span>)}</div>
    </div>
  </div>;
}

export function About() {
  const [open, setOpen] = useState(0);
  return <div className="about-grid">
    <div className="about-bio"><span className="eyebrow">02 / The person behind the pixels</span><h2>A designer’s eye.<br /><em>An engineer’s mind.</em></h2>
      <p>I’m Gerald Donkor, a design engineer based in Ghana. I work in the space between how something looks and how it works.</p>
      <p>I design and build polished, interactive web experiences—bringing thoughtful interfaces, expressive motion, and strong frontend engineering together.</p>
      <a href="https://github.com/gerald-donkor" target="_blank" rel="noreferrer">A little more about me on GitHub <ArrowUpRight size={17} /></a>
      <div className="bio-note"><span>My default setting</span><strong>Building with taste :)</strong></div>
    </div>
    <div className="capabilities">{capabilities.map((capability, index) => <Capability key={capability.title} capability={capability} index={index} open={open === index} onToggle={() => setOpen(open === index ? -1 : index)} />)}</div>
  </div>;
}
