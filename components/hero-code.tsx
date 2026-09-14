const lines = [
  <><span className="code-object">gsap</span>.<span className="code-function">to</span>(<span className="code-string">'.hero-star'</span>, {'{'}</>,
  <>  rotation: <span className="code-number">360</span>,</>,
  <>  duration: <span className="code-number">35</span>,</>,
  <>  repeat: <span className="code-number">-1</span>,</>,
  <>  ease: <span className="code-string">'none'</span></>,
  <>{'}'});</>,
];

/** The same GSAP rotation used by the hero, shown as readable source. */
export function HeroCode() {
  return (
    <section className="hero-code" aria-label="Hero rotation code">
      <div className="code-titlebar"><span>motion.ts</span><span>GSAP</span></div>
      <pre tabIndex={0} role="region" aria-label="GSAP animation source"><code>{lines.map((line, index) => (
        <span className="code-line" key={index}><span className="code-line-number" aria-hidden="true">{index + 1}</span><span>{line}{index < lines.length - 1 ? '\n' : ''}</span></span>
      ))}</code></pre>
      <div className="code-status"><span aria-hidden="true">↳</span> A little logic. A lot of feeling.</div>
    </section>
  );
}
