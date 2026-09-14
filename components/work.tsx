'use client';
import Link from 'next/link';
import { ArrowUpRight, ArrowRight, Code2 } from 'lucide-react';
import { projects } from '@/content/projects';
import { ProjectVisual } from './project-visual';
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';

export function Work() {
  return <div className="project-grid">{projects.map(project => <article className={'project-card project-' + project.slug} key={project.slug}>
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
