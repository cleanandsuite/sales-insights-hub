
# Cinematic Landing Page Rebuild — "Enterprise Precision" Aesthetic

## Overview

Complete rebuild of the SellSig landing page from the current light/clean corporate style to a cinematic, dark "Enterprise Precision" aesthetic with GSAP-powered animations, interactive feature cards, sticky stacking sections, and a noise-textured premium feel. Every section is reimagined as a "digital instrument" — weighted animations, magnetic buttons, and functional micro-UI cards.

## Design Tokens

| Token | Value |
|---|---|
| Primary / Background | `#0A1428` (deep navy) |
| Accent 1 | `#14B8A6` (vibrant teal) |
| Accent 2 | `#7C3AED` (electric purple) |
| Text | `#FFFFFF` / `rgba(255,255,255,0.6)` |
| Surface | `rgba(255,255,255,0.04)` |
| Border | `rgba(255,255,255,0.08)` |
| Radius | `2rem` to `3rem` everywhere |
| Headings | Inter (already loaded) |
| Body | Inter (already loaded) |
| Noise | SVG feTurbulence at 0.05 opacity global overlay |

## Section Architecture (7 sections)

### A. Navbar — "The Floating Island"
- Pill-shaped, fixed, horizontally centered (`max-w-[800px] mx-auto top-4`)
- Transparent at top, morphs to `bg-[#0A1428]/60 backdrop-blur-xl border border-white/8` on scroll
- Uses `IntersectionObserver` on hero section to trigger morph
- Logo (text "SellSig"), 4 nav links, teal CTA button
- All buttons have magnetic `scale(1.03)` hover with custom cubic-bezier

### B. Hero — "The Opening Shot"
- `100dvh` height, full dark background with teal radial gradient glow
- Content at bottom-left third
- Large headline: "Revenue" (Inter bold) / "Intelligence." (Inter italic, massive)
- GSAP staggered fade-up entrance (y:40 to 0, opacity 0 to 1, stagger 0.08)
- Two CTAs: "Book a Demo" (teal, magnetic) + "Start 14-Day Free Trial" (ghost)
- Animated waveform visualization on the right (reuse existing waveform concept but in teal)

### C. Features — "Interactive Functional Artifacts" (3 cards)
- **Card 1 — "Diagnostic Shuffler"**: 3 overlapping cards cycling vertically every 3s with spring-bounce. Labels: "Signal Detection", "Objection Counter", "Close Probability" (from value prop 1: real-time whisper coaching)
- **Card 2 — "Telemetry Typewriter"**: Monospace live-text feed typing out coaching messages character-by-character with blinking teal cursor. "Live Feed" label with pulsing dot. Content from value prop 2 (signal-powered prep)
- **Card 3 — "Cursor Protocol Scheduler"**: Weekly grid (S M T W T F S) with animated SVG cursor clicking days, activating teal highlights. Labels from value prop 3 (dashboard/quota)
- All cards: `bg-[#0A1428]` surface, subtle border, `rounded-[2rem]`, drop shadow

### D. Philosophy — "The Manifesto"
- Full-width dark section with parallax texture at low opacity
- Two contrasting statements:
  - "Most sales tools focus on: recording calls and generating reports."
  - "We focus on: winning the next 30 seconds." (massive, "Intelligence" in teal)
- GSAP word-by-word fade-up reveal on scroll

### E. Protocol — "Sticky Stacking Archive"
- 3 full-screen cards that stack on scroll using GSAP ScrollTrigger `pin: true`
- As new card enters, previous scales to 0.9, blurs 20px, fades to 0.5
- Each card has unique SVG animation:
  1. Slowly rotating concentric circles (Pre-Call Intelligence)
  2. Scanning horizontal laser-line across dot grid (Live Coaching)
  3. Pulsing EKG-style waveform via stroke-dashoffset (Post-Call Analysis)
- Card content: step number (monospace), title, 2-line description

### F. Pricing
- Three-tier grid: "Essential" ($99/mo), "Performance" ($250/mo, highlighted), "Enterprise" (Contact Sales)
- Middle card: teal background with purple CTA, slightly larger scale
- Feature lists per tier, derived from existing pricing data
- Annual/monthly toggle preserved

### G. Footer
- Deep `#0A1428` background, `rounded-t-[4rem]`
- Grid: brand + tagline, nav columns, legal
- "System Operational" status indicator with pulsing green dot + monospace label
- Existing link structure preserved (Privacy, Terms, Support routes)

## Technical Implementation

### New/Modified Files

| # | File | Action |
|---|---|---|
| 1 | `src/pages/Landing.tsx` | Rewrite — new section composition |
| 2 | `src/components/landing/CinematicHero.tsx` | Create — full-bleed hero with GSAP entrance |
| 3 | `src/components/landing/CinematicNavbar.tsx` | Create — floating pill navbar with scroll morph |
| 4 | `src/components/landing/CinematicFeatures.tsx` | Create — 3 interactive artifact cards |
| 5 | `src/components/landing/CinematicPhilosophy.tsx` | Create — manifesto section with word reveal |
| 6 | `src/components/landing/CinematicProtocol.tsx` | Create — sticky stacking cards |
| 7 | `src/components/landing/CinematicPricing.tsx` | Create — 3-tier dark pricing |
| 8 | `src/components/landing/CinematicFooter.tsx` | Create — dark footer with status indicator |
| 9 | `src/components/landing/gsap/useGSAPAnimations.ts` | Extend — add new hooks for stacking, typewriter, word reveal |
| 10 | `src/index.css` | Add — noise overlay, magnetic button utilities, cinematic CSS vars |
| 11 | `index.html` | No font changes needed (Inter already loaded) |

### Preserved Routing
- `Index.tsx` stays as-is (auth gate to Landing)
- `App.tsx` unchanged
- All existing routes and navigation (`/auth`, `/support`, `/privacy`, `/terms`) preserved
- Stripe checkout link preserved for CTA buttons

### GSAP Animation Hooks (added to useGSAPAnimations.ts)
- `useStickyStack()` — ScrollTrigger pin for Protocol section
- `useWordReveal()` — word-by-word fade-up for Philosophy
- `useTypewriter()` — character-by-character typing for Feature Card 2
- `useMagneticButton()` — subtle scale(1.03) with custom easing
- `useNavbarMorph()` — IntersectionObserver-driven navbar state

### Global CSS Additions
- SVG noise overlay: `::before` pseudo-element on body using inline SVG feTurbulence filter at 0.05 opacity
- `.magnetic-btn` — hover scale with `cubic-bezier(0.25, 0.46, 0.45, 0.94)` and overflow-hidden sliding background span
- CSS custom properties for the Enterprise Precision palette

### What Gets Removed
- Old landing components (`HeroSection.tsx`, `LandingHeader.tsx`, `LogoBarSection.tsx`, `StatsSection.tsx`, `PlatformSection.tsx`, `FeaturesSection.tsx`, `PhoneLineSection.tsx`, `SocialProofSection.tsx`, `PricingSection.tsx`, `FAQSection.tsx`, `CTASection.tsx`, `BuiltBySalesSection.tsx`, `LandingFooter.tsx`) will no longer be imported from `Landing.tsx` but files are kept to avoid breaking any other imports

### Responsive Strategy
- Mobile: stack all cards vertically, reduce hero font sizes, collapse navbar to minimal hamburger
- Protocol section: disable sticky stacking on mobile (simple vertical scroll instead)
- Feature cards: single column on mobile

### Performance
- All GSAP animations use `gsap.context()` with proper cleanup
- Hero section renders immediately (no lazy loading)
- SVG animations are lightweight (no canvas/WebGL)
