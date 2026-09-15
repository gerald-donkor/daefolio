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

## Hero photography and media quality

The hero uses [Kelly Sikkema’s photograph of hands sketching UX wireframes](https://unsplash.com/photos/person-writing-on-white-paper-hLit2zL-Dhk), under the [Unsplash License](https://unsplash.com/license). Screen layouts and flow arrows introduce the interface-design process. This is illustrative stock photography, not Gerald’s own work.

The downloaded 3840 × 2560 photograph is served locally as `hero-wireframes-{1600,2560,3840}.webp`, encoded at quality 100. A responsive `picture` selects a suitable resolution, including the extra width needed for a portrait viewport’s cover crop. The image loads eagerly with high fetch priority. CSS overlays preserve text contrast in both themes; `object-fit: cover` crops without stretching.

Aetherfield, Antenix, Ether, and Jobbiton were refreshed from their original project files and encoded as lossless WebP without enlarging them. Aetherfield is now 768 × 768 and Jobbiton 4788 × 2416. Pixca’s source JPEG and Gerald’s portrait remain unchanged. Next.js serves all imagery without further recompression (`unoptimized: true`); source resolution still limits the detail available on very large or high-density displays.

## Contact background video

The contact section uses [Jakub Zerdzicki’s interface-design footage](https://www.pexels.com/video/modern-ui-design-on-digital-tablet-37116270/), available under the [Pexels License](https://www.pexels.com/license/). A stylus working on a tablet connects the closing invitation to the hero’s paper sketches. This is illustrative stock footage, not Gerald’s own work.

- Source: `https://videos.pexels.com/video-files/37116270/15723407_1080_1920_25fps.mp4`.
- Local asset: `public/videos/contact-interface.mp4`, 10 seconds starting at source second 1, 1080 × 1920, 25 fps, approximately 3.7 MB. Encoded as H.264 at CRF 18 with fast-start metadata and no audio.
- `contact-interface-poster.webp` is a full-resolution, lossless still extracted from its first frame.
- Video loading begins within 300 pixels of the section. Playback is muted, inline, and looped, and pauses when the section is offscreen, the tab is hidden, or the existing motion control is paused. Reduced-motion visitors see the still without downloading the video. The still also remains as a fallback if playback fails.
- Theme-specific overlays protect text contrast. On desktop the portrait footage occupies the right 65% of the section, fading into the text area; on mobile it fills the section. The crop focuses on the hand and tablet without stretching.

## Hero interface blend and accent palette

The wireframe photograph blends into [Balázs Kétyi’s mobile onboarding design photograph](https://unsplash.com/photos/turned-on-smartphone-OjhDFiVLrFQ), used under the [Unsplash License](https://unsplash.com/license). Its illustrated onboarding screen provides the finished-interface counterpart to the paper sketch. This is illustrative stock imagery, not Gerald’s project work.

The photo is self-hosted as `hero-onboarding-{960,1600,2400}.webp` at quality 95. A responsive picture and CSS mask blend it into the right side without stretching. Theme overlays preserve foreground readability. Sea-glass teal (`#9dcfc1` dark / `#28685f` light) replaces violet accents, with sage controls and a pale green work surface.
