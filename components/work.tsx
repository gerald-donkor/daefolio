'use client';
import { useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ArrowUpRight, ArrowRight, Code2 } from 'lucide-react';
import { projects } from '@/content/projects';
import { ProjectVisual } from './project-visual';
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { useMotionPreference } from './motion-provider';

gsap.registerPlugin(useGSAP);
export function Work() {
  const root = useRef<HTMLDivElement>(null);
  const { paused } = useMotionPreference();
  useGSAP(() => {
    if (paused) return;
    const mm = gsap.matchMedia();
    mm.add('(pointer: fine) and (min-width: 701px) and (prefers-reduced-motion: no-preference)', () => {
      const cleanups = Array.from(root.current!.querySelectorAll<HTMLElement>('.project-preview')).map(preview => {
        const action = preview.querySelector('.project-hover');
        const xTo = gsap.quickTo(action, 'x', { duration: .45, ease: 'power3.out' });
        const yTo = gsap.quickTo(action, 'y', { duration: .45, ease: 'power3.out' });
        const move = (event: PointerEvent) => {
          const rect = preview.getBoundingClientRect();
          xTo((event.clientX - rect.left - rect.width / 2) * .16);
          yTo((event.clientY - rect.top - rect.height / 2) * .16);
        };
        const reset = () => { xTo(0); yTo(0); };
        preview.addEventListener('pointermove', move, { passive: true });
        preview.addEventListener('pointerleave', reset);
        preview.addEventListener('focus', reset);
        return () => { preview.removeEventListener('pointermove', move); preview.removeEventListener('pointerleave', reset); preview.removeEventListener('focus', reset); };
      });
      return () => cleanups.forEach(cleanup => cleanup());
    });
    return () => mm.revert();
  }, { scope: root, dependencies: [paused], revertOnUpdate: true });

  return <div ref={root} className="project-grid">{projects.map(project => <article className={'project-card project-' + project.slug} key={project.slug}>
    <Dialog><DialogTrigger asChild><button className="project-preview" aria-label={'View ' + project.name + ' project details'}>
      <ProjectVisual slug={project.slug} /><span className="project-hover">Explore project <ArrowUpRight size={20} /></span><span className="project-no">/{project.number}</span>
    </button></DialogTrigger>
      <DialogContent>
        <span className="eyebrow">Selected work / {project.number}</span><DialogTitle className="dialog-title">{project.name}</DialogTitle>
        <DialogDescription className="dialog-description">{project.description}</DialogDescription><ProjectVisual slug={project.slug} />
        <p className="dialog-overview">{project.overview}</p><div className="tag-list">{project.focus.map(focus => <span key={focus}>{focus}</span>)}</div>
        <div className="dialog-actions"><Button asChild><a href={project.url} target="_blank" rel="noreferrer">Visit live site <ArrowUpRight size={16} /></a></Button><Button variant="outline" asChild><Link href={'/work/' + project.slug}>Project overview <ArrowRight size={16} /></Link></Button><a className="source-link" href={project.repo} target="_blank" rel="noreferrer" aria-label={'View ' + project.name + ' source on GitHub'}><Code2 size={20} /></a></div>
      </DialogContent>
    </Dialog>
    <div className="project-caption"><div><Link href={'/work/' + project.slug}><h3>{project.name}<ArrowUpRight size={22} /></h3></Link><p>{project.description}</p></div><span>{project.category}</span></div>
  </article>)}</div>;
}
