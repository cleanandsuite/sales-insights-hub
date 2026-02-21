

# Clari Copilot-Style Landing Page Redesign

## Overview

Rebuild the SellSig landing page to mirror the Clari Copilot page structure: dark background, bold typography, alternating content blocks with product screenshots, logo bar, testimonial, and a strong final CTA -- all using SellSig's own content and optimized for "AI Sales Coaching" SEO dominance.

## Visual Direction

- **Dark theme**: Near-black background (#0A0A0A / #111111) with white/light text, matching Clari's aesthetic
- **Accent color**: Teal/green (#00D4AA) for CTAs and highlights (similar to Clari's green), or keep SellSig blue (#3B82F6) -- adapting to feel premium on dark
- **Typography**: Large, bold serif-style or heavy sans-serif headlines (Inter 800/900), generous whitespace
- **Layout**: Full-width sections, alternating left-right content blocks (text + image), centered hero

## Page Structure (Mapping Clari to SellSig)

```text
+-----------------------------------------------+
| Announcement Bar (teal/green accent)           |
+-----------------------------------------------+
| Header (dark, logo + nav + CTA)                |
+-----------------------------------------------+
| Hero: Split layout                             |
|   Left: Tagline + H1 + subtitle + 2 CTAs      |
|   Right: Dashboard screenshot                  |
+-----------------------------------------------+
| Logo Bar: "Trusted by leading sales teams"     |
+-----------------------------------------------+
| "Why SellSig?" centered intro                  |
|   + product laptop mockup                      |
+-----------------------------------------------+
| Alternating Feature Blocks (3-4):              |
|   1. Real-time coaching (text L, image R)      |
|   2. Buyer signal detection (image L, text R)  |
|   3. CRM auto-capture (text L, image R)        |
|   4. Scalable coaching (image L, text R)        |
+-----------------------------------------------+
| Testimonial Quote (full-width, dark bg)         |
+-----------------------------------------------+
| "Full Platform" section                         |
+-----------------------------------------------+
| Blog/Resource Cards (2-col)                    |
+-----------------------------------------------+
| Final CTA: Big headline + button               |
+-----------------------------------------------+
| Footer                                          |
+-----------------------------------------------+
```

## AI-Generated Corporate Photos

Use the Lovable AI image generation (Gemini) to create 4-5 inspiring corporate/sales team photos:
1. **Hero image**: Diverse sales professional on a call, looking confident, modern office
2. **Coaching scene**: Manager coaching a rep at a screen showing analytics
3. **Team celebration**: Sales team celebrating a closed deal
4. **Solo focus**: Rep using laptop with AI coaching overlay visible
5. **Leadership meeting**: Revenue leaders reviewing pipeline data

These will be generated as base64 images and saved to `public/` or `src/assets/`.

## SEO Strategy for "AI Sales" and "AI Coaching"

### Primary Target Keywords
- "AI sales coaching" (title, H1, meta)
- "AI coaching for sales calls" (H1 variation)
- "real-time AI sales coaching" (subheadline)
- "AI sales call coaching software" (meta description)
- "conversation intelligence AI" (body copy)

### On-Page SEO Changes

**index.html updates:**
- Title: "AI Sales Coaching Software | Real-Time Call Coaching | SellSig"
- Meta description: "AI sales coaching that coaches reps in real-time during live calls. Detect buyer signals, handle objections, and close 30% more deals with SellSig."
- Keywords meta: "AI sales coaching, AI coaching, real-time sales coaching, conversation intelligence, AI sales software, sales call coaching"
- Updated OpenGraph and Twitter tags
- Updated JSON-LD structured data with richer keywords

**sitemap.xml:** Update lastmod dates

**New content sections** will naturally include keyword-rich copy about AI coaching, real-time coaching, buyer signals, and sales intelligence.

## Files to Create/Modify

### New Files
- `src/components/landing/CopilotHero.tsx` -- Dark hero with split layout
- `src/components/landing/LogoBar.tsx` -- Trusted-by logo strip
- `src/components/landing/WhySellSig.tsx` -- "Why SellSig?" intro section
- `src/components/landing/FeatureShowcase.tsx` -- Alternating feature blocks
- `src/components/landing/TestimonialBanner.tsx` -- Full-width quote
- `src/components/landing/ResourceCards.tsx` -- Blog/resource teasers
- `src/components/landing/FinalCTA.tsx` -- Dark final CTA section

### Modified Files
- `src/pages/Landing.tsx` -- Swap in new sections, remove old ones
- `src/components/landing/LandingHeader.tsx` -- Dark theme variant
- `src/components/landing/LandingFooter.tsx` -- Dark theme variant
- `index.html` -- SEO meta tags overhaul
- `public/sitemap.xml` -- Updated dates

### AI-Generated Images
- Generate 4-5 corporate photos via edge function using Gemini image model
- Save to `src/assets/` for use across sections

## Technical Details

### Color Tokens (Dark Theme)
- Background: `#0A0A0A` (near black)
- Surface: `#1A1A1A` (card backgrounds)
- Border: `#2A2A2A`
- Text primary: `#FFFFFF`
- Text secondary: `#A0A0A0`
- Accent: `#00D4AA` (teal-green) or `#3B82F6` (keep blue)

### Component Architecture
All new components are stateless/presentational, receiving `onStartTrialClick` as a prop. The existing Stripe checkout link and auth routing remain unchanged.

### Image Strategy
- Product screenshots: Reuse `dashboard-preview.jpg` and `hero-dashboard.png`
- Corporate photos: AI-generated via Gemini image model, placed strategically in hero, feature blocks, and testimonial areas
- Optimized with `loading="lazy"` on below-fold images

### SEO Schema Markup
Enhanced JSON-LD with:
- `SoftwareApplication` type with "AI Sales Coaching" keywords
- `FAQPage` schema for common questions
- `Organization` schema with updated description

