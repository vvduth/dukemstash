# Homepage

## Overview

Convert the static prototype at `prototypes/homepage/` into a real Next.js page at `/` (root route). Replicate the design faithfully using Tailwind CSS and shadcn/ui components, split into server and client components appropriately.

## Sections

1. **Navbar** — Fixed top, glassmorphism backdrop blur, logo + nav links (Features, Pricing, AI as anchor links) + Sign In / Get Started buttons. Mobile hamburger menu.
2. **Hero** — Headline, subtext, CTA buttons (Start Free → `/register`, Watch Demo → `#features`), trust tags. Chaos-to-order visual with canvas animation (left) → arrow → dashboard mockup (right).
3. **Features** — 6-card grid (Code Snippets, AI Prompts, Instant Search, Commands, Files & Docs, Collections). Each card has icon, title, description, code preview.
4. **AI Section** — Two-column: left has Pro badge, heading, description, checklist. Right has code editor mockup with AI-generated tags.
5. **Pricing** — Monthly/yearly toggle. Free vs Pro cards with feature lists. Free "Get Started" → `/register`, Pro "Start Free Trial" → `/register`.
6. **Final CTA** — Gradient border card with heading + CTA button → `/register`.
7. **Footer** — 4-column grid: brand, Product links, Resources links, Connect links. Copyright with dynamic year.

## Component Breakdown

### Server Components (no interactivity)
- `src/app/page.tsx` — Root page, composes all sections
- `FeaturesSection` — Static 6-card grid
- `AiSection` — Static two-column layout with code editor mockup
- `CtaSection` — Static CTA card
- `Footer` — Static footer with links

### Client Components (`'use client'`)
- `HomepageNavbar` — Scroll-based background change, hamburger toggle, smooth scroll
- `HeroSection` — Contains `ChaosCanvas` (requestAnimationFrame, mouse events)
- `ChaosCanvas` — Canvas animation with floating icons and mouse repulsion (port `script.js` logic)
- `PricingSection` — Billing toggle (monthly/yearly) with dynamic price display

## File Structure

```
src/
  app/
    page.tsx                        # Root page, imports all sections
  components/
    homepage/
      HomepageNavbar.tsx            # Client - scroll + hamburger
      HeroSection.tsx               # Client - contains ChaosCanvas
      ChaosCanvas.tsx               # Client - canvas animation
      DashboardPreview.tsx          # Server - static dashboard mockup
      FeaturesSection.tsx           # Server - feature cards grid
      AiSection.tsx                 # Server - AI info + code editor mock
      PricingSection.tsx            # Client - billing toggle
      CtaSection.tsx                # Server - final CTA
      HomepageFooter.tsx            # Server - footer
```

## Styling

- Use Tailwind classes exclusively (no custom CSS file)
- Match the prototype's dark theme colors using existing Tailwind palette (slate-900, slate-800, etc.)
- Gradient text: `bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent`
- Glassmorphism navbar: `bg-slate-900/60 backdrop-blur-xl`
- Use Lucide icons for feature cards (Code, Sparkles, Search, Terminal, File, FolderOpen)
- Font: use project's existing font setup (Space Grotesk for headings via font-family class, JetBrains Mono for code/monospace)
- Responsive: 3-col → 2-col → 1-col for feature grid, stack hero visual vertically on mobile

## Links & Navigation

| Button / Link | Destination |
|---|---|
| Logo | `/` |
| Sign In | `/sign-in` |
| Get Started (navbar) | `/register` |
| Start Free (hero) | `/register` |
| Watch Demo (hero) | `#features` (smooth scroll) |
| Free "Get Started" (pricing) | `/register` |
| Pro "Start Free Trial" (pricing) | `/register` |
| Final CTA button | `/register` |
| Features / Pricing / AI nav links | `#features` / `#pricing` / `#ai` (anchor scroll) |
| Footer Product links | Anchor scroll to sections |
| Footer Resources/Connect links | `#` placeholder |

## Technical Notes

- Root `page.tsx` is a server component; it imports client sections as needed
- ChaosCanvas: port the `requestAnimationFrame` loop, particle system, and mouse repulsion from `prototypes/homepage/script.js`. Use `useRef` for canvas, `useEffect` for animation lifecycle. Clean up on unmount.
- Billing toggle: local `useState` for monthly/yearly. Monthly: $8/mo. Yearly: $72/yr (show "Save 25%" badge).
- Scroll fade-in: use IntersectionObserver in a small `useFadeIn` hook or apply via a lightweight client wrapper
- Navbar scroll effect: `useEffect` with scroll listener, toggle background opacity class
- No data fetching required — entirely static/presentational page
- Page should NOT use the dashboard layout — it's a standalone marketing page
