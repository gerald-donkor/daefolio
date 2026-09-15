import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowDown, ArrowLeft, ArrowUpRight, Asterisk, Pause } from 'lucide-react';
import styles from './design-system.module.css';

export const metadata: Metadata = {
  title: 'Design System Preview — Gerald Donkor',
  description: 'A visual preview of Gerald Donkor’s unified portfolio design system.',
};

const colors = [
  { name: 'Ink', value: '#101215', className: styles.ink },
  { name: 'Paper', value: '#F7F4F0', className: styles.paper },
  { name: 'Stone', value: '#AAA397', className: styles.stone },
  { name: 'Mocha', value: '#55463F', className: styles.mocha },
  { name: 'Sea glass', value: '#9DCFC1', className: styles.lavender },
  { name: 'Coral', value: '#F28E6F', className: styles.coral },
];

const capabilities = [
  ['01', 'Interface design', 'Clear hierarchy, considered layouts, and components that work as one system.'],
  ['02', 'Frontend engineering', 'Responsive interfaces built with thoughtful architecture and precise implementation.'],
  ['03', 'Motion & interaction', 'Purposeful movement that gives each action rhythm, context, and a little delight.'],
];

export default function DesignSystemPreview() {
  return (
    <main className={styles.preview}>
      <section className={styles.hero}>
        <div className={styles.stars} aria-hidden="true" />
        <div className={styles.glow} aria-hidden="true" />
        <header className={styles.header}>
          <Link href="/" className={styles.back}><ArrowLeft size={15} /> Portfolio</Link>
          <span className={styles.wordmark}>gerald donkor<sup>®</sup></span>
          <span className={styles.systemLabel}>DESIGN SYSTEM / 01</span>
        </header>

        <div className={styles.heroInner}>
          <p className={styles.kicker}>NIGHT STUDIO × URBAN FIELD NOTES</p>
          <h1>Thoughtful ideas,<br /><em>made tangible.</em></h1>
          <div className={styles.heroFoot}>
            <p>A visual system for work that lives between<br />how something looks and how it works.</p>
            <a href="#system" aria-label="Explore the design system"><ArrowDown size={20} /></a>
          </div>
        </div>

        <aside className={styles.note}>
          <span>STATUS</span>
          <strong><i /> Open to thoughtful work</strong>
          <small>ACCRA, GH · 05°33′N</small>
        </aside>
      </section>

      <section id="system" className={`${styles.paperSection} ${styles.clippedTop}`}>
        <div className={styles.sectionIntro}>
          <p className={styles.index}>01 / THE FOUNDATION</p>
          <h2>One atmosphere.<br />Two surfaces.</h2>
          <p className={styles.lede}>A nocturnal studio for identity and reflection. A warm editorial field for the work, process, and proof.</p>
        </div>

        <div className={styles.palette}>
          {colors.map((color) => (
            <div className={styles.swatch} key={color.name}>
              <div className={`${styles.color} ${color.className}`} />
              <strong>{color.name}</strong>
              <span>{color.value}</span>
            </div>
          ))}
        </div>

        <div className={styles.typeSpecimen}>
          <div className={styles.typeMeta}>
            <span>VOICE 01</span>
            <strong>Expressive serif</strong>
            <p>Personal, reflective, and emotionally weighted.</p>
          </div>
          <p className={styles.serifSpecimen}>Design is how<br /><em>the idea feels.</em></p>
        </div>

        <div className={`${styles.typeSpecimen} ${styles.typeSpecimenDark}`}>
          <div className={styles.typeMeta}>
            <span>VOICE 02</span>
            <strong>Structural grotesk</strong>
            <p>Direct, architectural, and built for navigation.</p>
          </div>
          <p className={styles.groteskSpecimen}>CLEAR IDEAS<br />PRECISELY BUILT</p>
        </div>
      </section>

      <section className={styles.workSection}>
        <div className={styles.workHeading}>
          <p className={styles.index}>02 / IMAGE AS EVIDENCE</p>
          <h2>Selected work,<br />assembled with intent.</h2>
          <p>Large proof first. Quiet captions second. The work supplies its own color.</p>
        </div>

        <article className={styles.featureProject}>
          <div className={styles.featureImage}>
            <Image src="/projects/aetherfield.webp" alt="Aetherfield sustainability platform preview" fill sizes="(max-width: 700px) 100vw, 92vw" />
            <div className={styles.featureWash} />
            <span className={styles.featureBrand}><Asterisk size={20} /> Aetherfield</span>
            <strong>Sustainability insights,<br />built for business.</strong>
            <span className={styles.projectNumber}>/01</span>
          </div>
          <div className={styles.caption}>
            <div><h3>Aetherfield <ArrowUpRight size={20} /></h3><p>Data-rich product design with a calm, legible point of view.</p></div>
            <span>PRODUCT DESIGN · FRONTEND</span>
          </div>
        </article>

        <div className={styles.mosaic}>
          <article className={styles.mosaicLead}>
            <Image src="/projects/antenix.webp" alt="Studio Antenix project detail" fill sizes="(max-width: 700px) 100vw, 58vw" />
            <span>INDEPENDENT THINKING.<br />DISTINCTIVE DESIGN.</span>
          </article>
          <article className={styles.mosaicTop}>
            <Image src="/projects/jobbiton.webp" alt="Jobbiton dashboard detail" fill sizes="(max-width: 700px) 50vw, 32vw" />
          </article>
          <article className={styles.mosaicBottom}>
            <Image src="/projects/pixca.jpg" alt="Pixca editorial project detail" fill sizes="(max-width: 700px) 50vw, 32vw" />
          </article>
        </div>

        <div className={styles.artifactRow}>
          <div className={styles.artifactCopy}>
            <span className={styles.index}>COMPOSITION STUDY</span>
            <h3>Same evidence.<br />A more human rhythm.</h3>
            <p>Overlaps and rotations are used once, where they help a set of related artifacts read as a process.</p>
          </div>
          <div className={styles.artifactStack} aria-label="Example project artifact stack">
            <div className={styles.artifactLavender}>DISCOVER<br />THE SYSTEM<span>01</span></div>
            <div className={styles.artifactInk}>IDEAS<br />IN MOTION<span>02</span></div>
            <div className={styles.artifactCoral}>DETAIL<br />BY DETAIL<span>03</span></div>
          </div>
        </div>
      </section>

      <section className={styles.interlude}>
        <span>THE WORK SHOULD FEEL</span>
        <h2>Quietly expressive.<br />Seriously considered.</h2>
        <a href="#components">Explore the language <ArrowDown size={18} /></a>
      </section>

      <section id="components" className={styles.stoneSection}>
        <div className={styles.sectionIntroCompact}>
          <p className={styles.index}>03 / THE WORKING PARTS</p>
          <h2>A system with<br />something to say.</h2>
        </div>

        <div className={styles.capabilityGrid}>
          {capabilities.map(([number, title, copy]) => (
            <article key={number}>
              <span>{number}</span>
              <h3>{title}</h3>
              <p>{copy}</p>
              <Asterisk aria-hidden="true" />
            </article>
          ))}
        </div>

        <div className={styles.controls}>
          <div>
            <span className={styles.index}>ACTIONS</span>
            <div className={styles.buttonRow}>
              <button className={styles.primaryButton}>View project <ArrowUpRight size={16} /></button>
              <button className={styles.secondaryButton}>Open case study</button>
              <button className={styles.iconButton} aria-label="Pause motion"><Pause size={16} /></button>
            </div>
          </div>
          <aside className={styles.callout}>
            <span>THE FINAL 10%</span>
            <h3>Care is a feature.</h3>
            <p>Responsive behavior, keyboard access, performance, and the details that hold it all together.</p>
          </aside>
        </div>
      </section>

      <section className={`${styles.contact} ${styles.clippedTop}`}>
        <div className={styles.stars} aria-hidden="true" />
        <span className={styles.indexDark}>04 / CONTACT</span>
        <h2>Let’s make it<br /><em>feel right.</em></h2>
        <a href="mailto:geralddonkor1@gmail.com">geralddonkor1@gmail.com <ArrowUpRight size={18} /></a>
        <footer>
          <span>GERALD DONKOR®</span>
          <span>DESIGN SYSTEM PREVIEW</span>
          <Link href="/">Return to portfolio</Link>
        </footer>
      </section>
    </main>
  );
}
