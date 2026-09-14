# Gerald Donkor — Design Engineer

A responsive Next.js portfolio with Tailwind CSS, GSAP, and customized shadcn-style Radix components. Its visual language follows `design.md`: a dark studio atmosphere with warm editorial chapters.

## Run locally

```sh
npm ci
npm run dev
```

Open http://localhost:3000. Use `npm run build` for a static export in `out/`, and `npm run typecheck` to check TypeScript.

## Content

- Five projects and their live/source links are in `content/projects.ts`.
- Homepage, email, and social links are in `app/page.tsx`.
- Shared color, type, surface, control, and motion tokens are in `app/design-system.css`, layered over the existing layout in `app/globals.css` and `app/portfolio.css`.
- Cormorant Garamond carries expressive statements, Manrope carries structure and body text, and Geist Mono carries technical metadata. All fonts are self-hosted with `next/font/local`.
- Each project has a static overview route at `/work/[slug]`.
- Inquiry email: geralddonkor1@gmail.com. Contact links open the visitor’s mail application; there is no form backend.
- No fictional employers, testimonials, measured outcomes, or project dates are included. Project overviews describe observed public interfaces; they are not fabricated case studies.

## Interactions

GSAP choreographs the hero entrance, clipped project transition, reading progress, pointer-responsive studio object, project action followers, capability disclosures, kinetic type, and spring study. GSAP Flip animates the layout study. The luminous canvas wake is clipped behind dark-chapter content, runs only while light is dissipating, and is disabled on touch devices and under reduced motion.

`components/motion-provider.tsx` shares the motion preference across the site. The persistent pause control remembers its setting in local storage; system reduced-motion preferences always take precedence. Continuous animations stop offscreen and when the document is hidden. Dialogs support keyboard focus management and Escape. The tempo slider supports arrow keys, and every playground control remains functional without animation.

Main motion modules: `portfolio-motion.tsx`, `studio-object.tsx`, `studio-atmosphere.tsx`, and `playground.tsx` under `components/`. GSAP lifecycles use scoped `useGSAP` cleanup. If your environment blocks Turbopack’s worker port, `npm run build -- --webpack` produces the same static-export routes using Next.js’s alternate bundler.

## Original project imagery

Images were sourced from the user’s live projects, not generated stock visuals:

- `aetherfield.webp`: the fabric/sky image used by Aetherfield, `/assets/images/Image-3.png` on https://aetherfield-rho.vercel.app/.
- `antenix.webp`: Studio Antenix’s first journal image, `/images/blog-img-1.png` on https://studio-antenix.vercel.app/.
- `jobbiton.webp`: the actual dashboard preview, `/images/dashboard-demo.png` on https://jobbiton.vercel.app/.
- `ether.webp`: Ether’s macaw hero image, `/assets/ui/img/macaw.jpg` on https://ether-bay.vercel.app/.
- `pixca.jpg`: an article image displayed in Pixca’s news feed, from https://ichef.bbci.co.uk/news/1024/branded_news/555e/live/7e207690-8b4f-11f1-b8ee-9b3c26ad07bb.jpg. It is a source-publisher image, not a photograph by Gerald. The card labels its origin as Pixca’s feed.

Project cards are designed portfolio compositions using these original assets; only Jobbiton’s embedded image is a dashboard screenshot. Source images retain their respective ownership. The metric on Aetherfield’s card is sample product UI data visible on its site, not a claim about project impact.

Public biography and social links were verified at https://github.com/gerald-donkor. Fonts are served locally through next/font.
