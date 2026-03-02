

# Pricing Cards — Visual Upgrade

## Overview
Make all three pricing cards more visually distinctive with bolder typography, hover animations, and a premium dark silver/gold theme for the Enterprise card. Move the "Minimum 10 seats" text under the price as a requirement line.

## Changes (all in `src/components/landing/CinematicPricing.tsx`)

### 1. Bigger, Bolder Plan Names
- Increase plan name `h3` from `text-lg` to `text-2xl font-bold` so each tier title commands attention.
- Increase description text from `text-sm` to `text-base`.

### 2. Starter Plan — Stand Out More
- Add a subtle teal border glow: `border border-[hsl(var(--cin-teal))]/20 shadow-[0_0_30px_rgba(20,184,166,0.08)]`.
- Add a "Best Value" or promo ribbon/badge at the top of the card to draw the eye.

### 3. Move "Minimum 10 seats" Under Price
- Remove `subheadline` from the Enterprise tier data.
- Render "Minimum 10 seats · Custom pricing & contract terms" directly below the "Custom" price text as a smaller requirement line (e.g., `text-xs text-white/40 mt-1`), not in the description area.

### 4. Hover Animation — Color Inverse + Pop
- Add a CSS hover effect to each card: `hover:scale-[1.03] hover:-translate-y-1` with a transition.
- On hover, invert the card style slightly: background brightens, text gets a subtle color shift.
- Use GSAP or CSS transition for a smooth "pop" feel.

### 5. Enterprise Card — Dark Silver & Gold Premium Theme
- Replace the default `bg-white/[0.03]` with a dark gradient: `bg-gradient-to-b from-[#1a1a2e] to-[#16213e]`.
- Plan name rendered in a gold gradient text: `bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400` with `bg-clip-text text-transparent`.
- Feature checkmarks in gold (`text-amber-400`).
- Border in silver: `border border-white/[0.12]` with a subtle gold glow `shadow-[0_0_40px_rgba(251,191,36,0.08)]`.
- CTA button styled with gold: `bg-gradient-to-r from-amber-500 to-yellow-600 text-black`.
- Price text ("Custom") in silver-white.

### Technical Details

**Data change** — Enterprise tier object:
- Remove `subheadline` field
- Add `premium: true` flag

**Rendering logic:**
- If `tier.premium`, apply gold/silver classes instead of default
- Render "Minimum 10 seats · Custom pricing & contract terms" right after the price `div` when `tier.premium` is true
- Hover classes applied to all cards via Tailwind: `transition-all duration-300 hover:scale-[1.03] hover:-translate-y-1`
- Starter card gets a special border/glow class when `tier.promo && !tier.highlighted`

