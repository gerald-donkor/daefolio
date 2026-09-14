# Gerald Donkor Portfolio — Unified Design System

## 1. Purpose

This document merges two visual references into one system for Gerald Donkor’s portfolio:

1. The existing dark editorial portfolio brief: a cool near-black canvas, delicate serif display type, lavender accents, sparse stars, and a fluid luminous pointer wake.
2. The supplied Canal Club page: oversized grotesk typography, warm off-white and taupe surfaces, clipped paper-like geometry, image mosaics, coral annotations, and bold alternation between light and dark sections.

The result is not a literal copy of either reference. It is a design-engineer portfolio with its own point of view: **night studio meets urban field notes**. The system should feel precise enough to be engineered, tactile enough to feel designed, and lively enough to invite exploration.

All colors and measurements extracted from reference imagery are approximate. The values below are the adopted implementation tokens, not claims about either source’s original CSS.

## 2. Creative direction

### Core idea

The page moves between two modes:

- **Studio mode:** cool, dark, spacious, luminous, and reflective. Use it for identity, hero content, transition moments, and contact.
- **Field-note mode:** warm, bright, graphic, image-led, and information-dense. Use it for projects, process, capabilities, and supporting proof.

The contrast should feel intentional, like moving between thinking in the studio and observing work in the world. Lavender connects both modes. Coral marks decisive actions. Project imagery supplies the remaining color.

### Design principles

1. **One atmosphere, two surfaces.** Dark and light sections are chapters of one story, not separate themes.
2. **Type creates the architecture.** Large statements establish rhythm before cards or decoration do.
3. **Images behave like evidence.** Use real work at generous scale, cropped into editorial sequences rather than generic product cards.
4. **Geometry carries meaning.** Angled edges, tabs, overlaps, and offsets suggest sketches, plans, and assembled ideas. Use them to group or direct content.
5. **Motion reveals craft.** Motion should clarify a transition, expose a relationship, or reward an action. Ambient effects remain quiet.
6. **Tension over symmetry.** Balance clean alignment with one controlled disruption: an offset panel, clipped edge, oversized word, or luminous wake.

### The memorable move

Spend the visual boldness on the transition between the dark atmospheric canvas and the warm editorial project field. A project image or section plane may appear to cut into the darkness with an angled paper edge. Everything around that moment stays disciplined.

## 3. What each reference contributes

| Design concern | Dark editorial reference | Canal Club reference | Unified decision |
| --- | --- | --- | --- |
| Mood | Nocturnal, refined, digital | Social, tactile, urban, energetic | A crafted night studio with warm field-note chapters |
| Typography | High-contrast serif statements and quiet sans support | Large uppercase grotesk headlines | Serif for expressive voice; grotesk for structure and action; mono for data |
| Color | Cool near-black, white, lavender, cyan/violet light | Off-white, black, taupe, mocha, lavender, coral | Dark and warm surfaces joined by lavender; coral only for actions and annotations |
| Layout | Spacious, staggered editorial columns | Full-bleed bands, mosaics, angled collage | Large breathing room punctuated by dense image assemblies |
| Imagery | Rectangular project images with quiet captions | Cropped grids, overlaps, rotated editorial matter | Real project imagery shown as hero frames, mosaic evidence, and small artifacts |
| Shape | Thin rules and restrained rounded controls | Clipped polygons and paper-like panels | Mostly square geometry; pills only for controls; clipped edges only at chapter transitions |
| Motion | Fluid cursor wake and subtle atmospheric drift | Implied carousel, reveal, and layered movement | One global ambient effect plus direct, tactile component responses |

## 4. Color system

### Core tokens

| Token | Value | Role |
| --- | --- | --- |
| `--ink` | `#101215` | Primary dark canvas |
| `--ink-deep` | `#080A0C` | Full-bleed dark bands and media interludes |
| `--paper` | `#F7F4F0` | Primary light canvas; warm rather than pure white |
| `--paper-soft` | `#E2DCD3` | Secondary light panels and clipped paper planes |
| `--stone` | `#AAA397` | Large muted feature fields |
| `--mocha` | `#55463F` | Warm dark footer or grounded supporting band |
| `--text-on-dark` | `#F5F5F3` | Primary text on dark surfaces |
| `--text-on-light` | `#171817` | Primary text on light surfaces |
| `--text-muted-dark` | `#A6AAAC` | Supporting copy on dark surfaces |
| `--text-muted-light` | `#66635F` | Supporting copy on light surfaces |
| `--lavender` | `#B8AFE2` | Brand bridge, selected display text, active state |
| `--lavender-soft` | `#D9D2ED` | Large low-contrast planes and hover fills |
| `--coral` | `#F28E6F` | Primary action, tabs, underlines, directional marks |
| `--signal` | `#72D978` | Tiny status marks only; never a large fill |
| `--line-dark` | `#303438` | Hairlines on dark surfaces |
| `--line-light` | `#C9C3BB` | Hairlines on light surfaces |

### Atmospheric light palette

These colors belong to the cursor wake and rare motion studies, not static brand decoration:

- Cyan core: `#7FE7FF`
- Ice bloom: `#A4EEFF`
- Violet: `#A795FF`
- Pink-violet: `#D9A2EF`

### Color rules

- Dark surfaces should occupy approximately 55–65% of the long page; warm light surfaces occupy the rest.
- Lavender is the only accent allowed to appear prominently in both modes.
- Coral is for action and editorial annotation, not paragraph text or ambient gradients.
- Signal green appears only as a 4–8px marker for availability, live status, or a tiny point of emphasis.
- Project-specific colors stay inside project imagery and project visualizations.
- Avoid gradients as static decoration. The only soft multicolor blend is the moving luminous wake.
- Maintain at least WCAG AA contrast for all functional text and controls.

### Suggested CSS foundation

```css
:root {
  --ink: #101215;
  --ink-deep: #080a0c;
  --paper: #f7f4f0;
  --paper-soft: #e2dcd3;
  --stone: #aaa397;
  --mocha: #55463f;
  --text-on-dark: #f5f5f3;
  --text-on-light: #171817;
  --text-muted-dark: #a6aaac;
  --text-muted-light: #66635f;
  --lavender: #b8afe2;
  --lavender-soft: #d9d2ed;
  --coral: #f28e6f;
  --signal: #72d978;
  --line-dark: #303438;
  --line-light: #c9c3bb;
}
```

## 5. Typography

Use three clearly defined voices. Do not blend their responsibilities casually.

### A. Expressive serif

Use a refined high-contrast serif for personal, reflective, or emotionally weighted statements:

- Hero statement
- One key phrase within an about section
- Selected project pull quotes
- Oversized contact line

The serif should feel editorial and contemporary, with a useful italic. Keep its use scarce so it remains special.

### B. Structural grotesk

Use a neutral-to-grotesk sans serif for the interface and the page’s bold public voice:

- Navigation
- Section titles
- Project titles
- Capability and process headings
- Buttons and links
- Body copy

For large structural headings, use uppercase only when the phrase is short and architectural. Body copy and ordinary controls remain sentence case.

### C. Technical mono

Use a restrained monospace for genuine metadata:

- Project numbers and years
- Coordinates and system labels
- Code samples
- Availability and motion state
- Image captions when they describe source or status

Do not put every eyebrow or decorative phrase in monospace. It must signal data or system behavior.

### Recommended scale

| Style | Desktop | Mobile | Leading | Notes |
| --- | --- | --- | --- | --- |
| Hero serif | `clamp(64px, 8.5vw, 132px)` | `clamp(46px, 13vw, 72px)` | `0.92–0.98` | Tight tracking; 2–4 lines |
| Structural display | `clamp(52px, 7vw, 104px)` | `clamp(38px, 11vw, 60px)` | `0.92–1.0` | Grotesk; optional uppercase |
| Section title | `clamp(38px, 4.5vw, 68px)` | `34–42px` | `1.0–1.08` | Mostly sentence case |
| Card/project title | `24–34px` | `22–28px` | `1.1–1.2` | Medium weight |
| Lead copy | `20–26px` | `18–21px` | `1.4–1.55` | Maximum 55–65 characters |
| Body | `15–17px` | `15–16px` | `1.55–1.7` | Maximum 70–75 characters |
| Metadata | `10–12px` | `10–11px` | `1.3–1.5` | Mono; tracked modestly |

### Typography rules

- Default to left alignment. Center alignment is reserved for a short transition title above a visual assembly.
- Do not highlight a single arbitrary word in a headline. A change of face, color, or italic must correspond to a real shift in voice or meaning.
- Avoid long all-caps paragraphs and excessive letter spacing.
- Keep punctuation visible and intentional; periods may carry lavender in a repeated heading system.
- Use line breaks to form graphic shapes, but never at the cost of comprehension on smaller screens.

## 6. Layout system

### Container and grid

- Maximum content width: `1440px`.
- Desktop gutters: `clamp(32px, 4.5vw, 72px)`.
- Tablet gutters: `28–40px`.
- Mobile gutters: `20–24px`.
- Base desktop grid: 12 columns with `24–32px` gutters.
- Dense editorial assemblies may use an internal 6-column grid.
- Body copy should occupy 4–6 desktop columns, not the entire container.

### Spacing scale

Use: `4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96 / 144 / 192 / 224px`.

- Control interiors: `8–16px`.
- Component gaps: `16–32px`.
- Project-grid gaps: `32–48px`.
- Section padding: `96–160px` desktop, `64–96px` tablet, `52–72px` mobile.
- Major atmospheric pauses: `160–224px` when content density allows.

### Page rhythm

```text
┌──────────────────────────────────────────────────────────────┐
│ DARK / HERO                                                 │
│ wordmark      navigation                         contact     │
│                                                              │
│ expressive serif statement        interactive studio object │
│ short introduction                                           │
└──────────────────────── clipped transition ──────────────────┘
┌──────────────────────────────────────────────────────────────┐
│ PAPER / SELECTED WORK                                       │
│ structural heading                                           │
│ ┌────────────── wide project evidence ─────────────────────┐ │
│ └───────────────────────────────────────────────────────────┘ │
│      ┌──────── project ───────┐ ┌──── offset project ─────┐  │
│      └────────────────────────┘ └──────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
┌──────────────── DARK MEDIA INTERLUDE ────────────────────────┐
│                       concise action                          │
└──────────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────────┐
│ STONE / ABOUT + CAPABILITIES                                 │
│ statement                    clipped portrait/artifact stack  │
└──────────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────────┐
│ PAPER / PROCESS + PLAYGROUND                                 │
│ ruled information grid, interactive studies, small captions  │
└──────────────────────── clipped transition ──────────────────┘
┌──────────────────────────────────────────────────────────────┐
│ DARK / CONTACT                                               │
│ oversized serif invitation + practical contact links          │
└──────────────────────────────────────────────────────────────┘
```

### Alignment and asymmetry

- Establish a strong left edge and reuse it across headings, descriptions, and captions.
- Use offsets inside the grid, not arbitrary pixel nudges.
- At desktop, one project may span all 12 columns; subsequent projects occupy 5–7 columns with a controlled vertical offset.
- On mobile, remove decorative offsets and use a clear single-column reading order.

## 7. Surfaces, edges, and shape language

### Surface roles

- `ink`: identity, hero, immersive media, contact.
- `paper`: selected work and long-form reading.
- `stone`: about, services, or a single featured capability.
- `mocha`: footer utility zone or one grounding transition.
- `lavender-soft`: a small callout panel, never a whole page chapter.

### Clipped paper geometry

Use shallow angular cuts that resemble assembled layouts or architectural plans:

- Section transition depth: approximately `24–72px` depending on viewport.
- Content cards may use one clipped corner or a slightly skewed backing plane.
- Overlap two or three planes at most.
- Keep the actual text container level and readable; transform decorative wrappers, not text.
- Remove or simplify clipping below `700px` when it creates awkward empty wedges.

### Corners and borders

- Default content geometry: square or `2–4px` radius.
- Dialogs: `8–12px` radius where containment helps.
- Pills and circles: only controls, status, or explicit tactile interaction.
- Use 1px rules to separate structured information.
- Avoid applying the same rounded card treatment to every section.

## 8. Imagery and project presentation

### Image behavior

- Use actual project work, portraits, sketches, maps, screenshots, and process artifacts.
- Prefer natural or slightly muted color; avoid imposing one global duotone.
- Let image crops feel editorial: details, partial interfaces, and contextual shots may sit together.
- Preserve focal points through explicit `object-position` values.
- Supply correct intrinsic dimensions and responsive image sizes.

### Three approved project compositions

1. **Hero evidence:** one wide, nearly full-bleed frame followed by a quiet caption.
2. **Mosaic evidence:** a 3–6 image grid mixing one anchor image with smaller details.
3. **Artifact stack:** 2–4 screenshots or cards with slight rotation and overlap, used to show process or collateral.

Do not use artifact rotation on every project. One occurrence per page chapter is enough.

### Captions

- Project title: grotesk, `24–34px`.
- Description: muted body text, no more than two short lines when possible.
- Category/year: mono, aligned to an outer edge.
- Captions sit outside the image unless the label describes something within the image.

## 9. Components

### Header

- Sticky, compact, and visually quiet.
- Dark mode uses a translucent ink fill with blur; light chapters may retain the dark header for continuity.
- Wordmark on the left; navigation and contact action on the right.
- The contact control may use a coral underline/tab rather than a large filled pill.
- Mobile navigation opens as a full-height panel with large, clear links and visible close control.

### Hero

- Use an expressive serif statement as the primary identity moment.
- Pair it with one compact interactive studio object or cropped visual, not several floating decorations.
- A small lavender paper tab may hold availability or a concise introduction, echoing Canal Club’s offset callout.
- Maintain a generous dark field around the headline.

### Section introduction

- Structural grotesk title plus one concise explanatory line.
- Optional mono index only when the index communicates the page sequence.
- Avoid automatic eyebrow labels above every heading.

### Project collection

- Begin with one dominant project.
- Follow with a staggered two-column sequence on desktop.
- Use a mosaic inside a project only when multiple views materially improve understanding.
- Hover reveals a specific action; keyboard focus provides the same information.

### Capability/service grid

- Use rules and spacing instead of separate rounded cards.
- Each item contains a title, short explanation, and optional tool tags.
- Expand/collapse interactions must expose state with `aria-expanded` and remain usable without motion.

### Editorial callout

- A lavender-soft or paper panel may overlap an image edge.
- Use for a short fact, testimonial, project constraint, or availability note.
- Add one coral edge or underline; do not combine coral, green, and glow in the same callout.

### Buttons and links

- Primary action: coral fill with ink text, or text with a coral tab/underline depending on context.
- Secondary action on dark: transparent with a subtle light border.
- Secondary action on light: transparent with an ink hairline.
- Circular controls are reserved for icon-only actions and directional prompts.
- Link language names the result: “View project,” “Open case study,” “Copy email.”

### Contact and footer

- Return fully to the dark studio atmosphere.
- Use an oversized serif invitation in lavender or off-white.
- Keep the email and social links practical and legible beneath it.
- A mocha utility band may carry copyright, availability, and a motion toggle.
- Do not reproduce Canal Club’s giant name treatment literally; keep Gerald’s wordmark distinct.

## 10. Atmospheric background and cursor light

### Starfield

- Base: `--ink` with a very low-contrast cool radial wash.
- Points: irregular 1–2px blue-gray cores; a few 3px points with faint 4–10px halos.
- Starting density: about one point per `8,000–14,000px²`, tuned visually.
- Use deterministic placement to prevent visible reshuffling.
- Stars appear only on dark chapters. They never continue over paper or stone surfaces.

### Luminous pointer wake

Use a cursor-driven fluid light trail plus a separate fine outlined cursor follower.

| State | Response |
| --- | --- |
| Pointer enters | Establish position without drawing a line from the origin |
| Slow movement | Faint, compact emission |
| Fast movement | Brighter, slightly stretched wake |
| Direction change | Soft curl or crescent residue |
| Pointer stops | Stop emission and dissipate existing light |
| Pointer exits | Fade residual light |
| Touch or reduced motion | Disable the trail and retain the static dark atmosphere |

Starting values:

- Cursor ring: `26px`, 1px low-opacity light border.
- Apparent follower lag: `80–140ms`.
- Core: `8–20px`.
- Bloom: `60–140px`.
- Dissipation: approximately `0.6–1.2s`.
- Keep the effect behind content and cap brightness so text contrast is never compromised.

Layer order on dark chapters:

1. Ink base
2. Sparse starfield
3. Pointer-light field
4. Content and imagery
5. Sticky navigation and controls
6. Optional cursor ring

All decorative layers use `pointer-events: none` and remain outside the accessibility tree.

## 11. Motion language

### Ambient motion

- One slow atmospheric behavior at a time: star drift, a rotating studio object, or the cursor wake.
- Do not animate all three strongly at once.
- Marquees pause on hover and become horizontally scrollable or static under reduced motion.

### Triggered motion

- Hover/focus: small image scale or crop shift, `300–700ms`.
- Expand/collapse: direct height and opacity response, roughly `240–360ms`.
- Artifact stack: slight separation or reordering, no more than `6–12px` travel and `2–4°` rotation.
- Section transition: one coordinated reveal, not a fade-and-slide on every child.

### Motion tokens

```css
:root {
  --ease-out: cubic-bezier(.22, 1, .36, 1);
  --ease-in-out: cubic-bezier(.65, 0, .35, 1);
  --duration-fast: 160ms;
  --duration-medium: 320ms;
  --duration-slow: 700ms;
}
```

Respect `prefers-reduced-motion`, provide a persistent pause/resume control for continuous movement, and never make content discovery depend on animation.

## 12. Responsive behavior

### Desktop: `1200px+`

- Full 12-column composition.
- Strong contrast between wide projects and staggered pairs.
- Large typographic scale and visible clipped section edges.
- Interactive atmospheric effects enabled when user preferences allow.

### Tablet: `701–1199px`

- Preserve the asymmetric project rhythm with simpler spans.
- Reduce rotations and overlaps.
- Keep hero text and studio object side by side only when both retain useful space.
- Reduce section padding before reducing type excessively.

### Mobile: `≤700px`

- Single-column content order.
- Horizontal image mosaics become a tidy two-column grid or scrollable strip.
- Flatten decorative overlaps that obscure reading order.
- Use full-width tap targets with a minimum interactive size of `44px`.
- Disable the custom cursor and luminous wake.
- Preserve the dark/light chapter rhythm; do not collapse the site into one uniform background.

## 13. Accessibility and content standards

- Meet WCAG AA contrast at minimum.
- Show visible `:focus-visible` states using lavender on dark and a dark outline plus coral offset on light.
- Keep DOM order aligned with visual reading order.
- Every meaningful image needs useful alternative text; decorative collage layers use empty alt text.
- Dialogs trap focus, provide a clear label, close with Escape, and return focus to the trigger.
- Never rely on color alone for active, selected, or error states.
- Motion controls expose their pressed state and use consistent language: “Pause motion” / “Resume motion.”
- Use active, specific copy. Each interface label should do one job.
- Preserve Gerald’s real identity, biography, project claims, links, imagery, and contact information. Do not borrow Canal Club’s copy, apartments, maps, logos, or brand assets.

## 14. Guardrails

### Do

- Alternate dark atmosphere with warm editorial surfaces.
- Let lavender connect the two worlds.
- Use coral sparingly to indicate action and direction.
- Make typography and imagery carry most of the visual interest.
- Use clipped planes to mark chapter transitions.
- Keep project captions quiet and project evidence large.
- Give the page long pauses between dense compositions.

### Do not

- Turn every section into an identical rounded card grid.
- Place stars or cursor glow over light sections.
- Use lavender, coral, signal green, and cyan glow at equal strength.
- Repeat angled cards, rotation, or collage treatment in every project.
- Use all caps for long copy or every interface label.
- Add decorative metadata that does not communicate actual information.
- Use broad static gradients as filler.
- Copy names, content, layouts, or brand assets literally from either reference.

## 15. Implementation priorities

Build the system in this order:

1. Establish semantic dark and light color tokens.
2. Install the serif, grotesk, and mono typography roles and responsive scale.
3. Set the container, 12-column grid, spacing rhythm, and chapter surfaces.
4. Reshape selected work into one wide feature plus staggered supporting projects.
5. Add clipped transition planes and one controlled artifact stack.
6. Standardize buttons, links, captions, rules, dialogs, and focus states.
7. Add the starfield and pointer wake after the static composition is strong.
8. Tune motion, reduced-motion behavior, performance, and responsive layouts.

## 16. Final visual brief

Create Gerald Donkor’s portfolio as a conversation between a nocturnal digital studio and tactile urban field notes. Open on a cool near-black canvas with sparse blue-gray stars, a restrained cyan-to-violet cursor wake, and a large high-contrast serif statement. Move into warm off-white and taupe project chapters shaped by oversized grotesk headings, clipped paper edges, image mosaics, and quiet technical captions. Use lavender as the shared brand color across both worlds, coral only for action and annotation, and tiny green marks only for live status. Keep project evidence large, body copy concise, alignment deliberate, and motion responsive to user intent. The experience should feel editorial, crafted, curious, and unmistakably the work of a design engineer.


## Appearance preferences

The Light / Dark / System control applies to the portfolio, project pages, dialogs,
and design preview. System is the default; explicit choices persist locally and
sync across tabs. Resolve appearance before first paint. Keep motion preference
independent and honor reduced motion in every appearance.

| Role | Light | Dark |
| --- | --- | --- |
| Studio | `#F7F4F0` paper | `#101215` ink |
| Work | `#EEEBE6` warm paper | `#1D1B20` warm charcoal |
| About | `#D7CFC2` stone | `#302B29` deep stone |
| Process | `#E3DCD2` parchment | `#252220` charcoal |
| Accent / text | `#6C558E` deep lavender | `#B8AFE2` lavender |
| Action / text | `#954A33` burnt coral | `#F28E6F` coral |

Use semantic surface tokens in `app/themes.css`, preserving brand primitives for
artwork and filled actions. Retain editorial typography, chapter cuts, project
imagery, and layout in both modes. Stars and pointer light belong only to dark
studio surfaces; light mode retains the interactive sculpture without a glow.
