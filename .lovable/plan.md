

# Landing Page Redesign — Velox AI Design System

## Overview

Complete redesign of the SellSig landing page to match the uploaded HTML template. This is a significant visual overhaul that introduces a new design language: Plus Jakarta Sans typography, blue brand (#0057FF), subtle grid background, interactive 3-phase platform tabs, a dedicated phone line section, FAQ accordion, and a polished pricing layout. The brand name stays "SellSig" (not "Velox AI").

---

## Design Tokens

The new design uses these core values:

```text
Brand Blue:    #0057FF
Brand Dark:    #003FBB  
Brand Light:   #EEF3FF
Navy:          #0A1628
Text Primary:  #0A1628
Text Secondary:#3B4A63
Text Muted:    #6B7A99
Border:        #E4E8F0
Background:    #FFFFFF
Background 2:  #F7F9FC
Green:         #00875A
Red:           #D92D20
Amber:         #B54708
Font:          Plus Jakarta Sans + Bricolage Grotesque
```

---

## Sections to Build (mapping HTML to React components)

### 1. LandingHeader.tsx — Full Rewrite
- Fixed nav bar with backdrop blur, 68px height
- SellSig logo with blue square mark + brand name (Bricolage Grotesque font)
- Nav links: Platform, Features, Phone Lines, Pricing, Enterprise (anchor scroll)
- Right side: Sign in link, "Book a demo" outline button, "Start free trial" blue CTA
- Mobile: hide nav links, show hamburger menu

### 2. HeroSection.tsx — Full Rewrite
- Two-column grid layout (text left, dashboard mockup right)
- Subtle grid background (60px lines at 35% opacity)
- Blue gradient blob (radial gradient, decorative)
- Eyebrow pill: blinking dot + "AI-Powered Sales Intelligence"
- Headline with Bricolage Grotesque: "Close more deals with **AI coaching** on every call" (blue highlight with underline)
- Subheadline describing the 3-phase value prop
- Two CTAs: "Start free trial" (primary blue) + "Watch 2-min demo" (outline)
- Social proof: avatar stack, 4.9/5 stars, "No credit card required"
- Right side: Interactive dashboard mockup card showing:
  - Browser chrome (3 dots + URL bar)
  - Live call header with recording indicator
  - Animated waveform bars
  - Emotion meters (Interest 84, Skepticism 32, Trust 71, Urgency 60)
  - AI coaching alert card
  - Script hint rows
- Two floating stat pills (Call Score 89%, Pro Plan 5,000 min)

### 3. LogoBarSection.tsx — New Component
- Horizontal strip with "Trusted by sales teams at leading companies"
- Row of company name logos (text-based, Bricolage Grotesque)

### 4. StatsSection.tsx — New Component
- Navy (#0A1628) background
- 4-column stat grid with large numbers (Bricolage Grotesque)
- Stats: 41% win rate increase, 2.8x faster onboarding, 18k+ reps coached, $2.1B pipeline
- Green delta indicators

### 5. PlatformSection.tsx — New Component (replaces ProblemSection)
- "The SellSig Intelligence Loop" header
- 3-phase tab system (Pre-Call, During Call, Post-Call)
- Each tab click reveals a two-column panel:
  - **Panel 0 (Pre-Call):** SWOT script builder mockup with company/target inputs, SWOT grid (strength/weakness/opportunity/threat), generate button, script output
  - **Panel 1 (Live Coaching):** Emotion meters with progress bars, objection card (amber), buying signal card (blue)
  - **Panel 2 (Post-Call):** Score circle (87), score bars (Discovery 92, Objection Handling 79, etc.), insight row
- React state manages active tab/panel

### 6. FeaturesSection.tsx — Rewrite
- "Platform Capabilities" label
- "Everything your team needs to win more" headline
- 3x2 grid of feature cards with emoji icons:
  - SWOT Script Builder, Live Emotion Detection, Real-Time Objection Handling
  - 40-Dimension Call Scoring, Dedicated Business Phone Line, Personalized Growth Roadmaps
- Hover: border turns blue, translateY(-4px), shadow

### 7. PhoneLineSection.tsx — New Component
- Navy background section
- Left: headline "Your team's own business phone line. Included."
- Spec grid (5,000 min, 3 seats, 1 number, 99.9% uptime)
- Two CTAs (white solid + ghost outline)
- Right: Phone dashboard mockup card with:
  - Dark header with phone number
  - 3-column stats
  - Rep rows with avatars, scores, live/scored status
  - Usage bar (minutes used/remaining)

### 8. TestimonialsSection.tsx — Rewrite (replaces SocialProofSection)
- "Customer Stories" header
- 3-column testimonial cards with star ratings, quotes, author avatars
- Hover: translateY(-4px), blue border, shadow

### 9. PricingSection.tsx — Rewrite
- Monthly/Annual toggle pill with "Save 20%" badge
- Two pricing cards side by side:
  - **Starter** ($79/mo): white card, limited features, crossed-out items
  - **Pro** ($200/mo): navy featured card, "Most Popular" badge, phone line highlight, full features
- Enterprise row below with call-to-action
- Toggle switches prices (79->63, 200->160 for annual)

### 10. FAQSection.tsx — New Component
- Accordion-style FAQ with 5 questions
- Click to expand/collapse, only one open at a time

### 11. FinalCTASection.tsx — Rewrite
- Navy gradient background
- "Your AI sales coach is ready to go" headline
- Two CTAs: Start free trial + Call Enterprise Sales
- Fine print: "14-day free trial, no credit card, cancel anytime"

### 12. LandingFooter.tsx — Rewrite
- Navy background footer
- 5-column grid: Brand description + Platform/Solutions/Company/Support link columns
- Bottom bar: copyright + legal links

---

## Files to Create
- `src/components/landing/LogoBarSection.tsx`
- `src/components/landing/StatsSection.tsx`
- `src/components/landing/PlatformSection.tsx`
- `src/components/landing/PhoneLineSection.tsx`
- `src/components/landing/FAQSection.tsx`

## Files to Rewrite
- `src/components/landing/LandingHeader.tsx`
- `src/components/landing/HeroSection.tsx`
- `src/components/landing/FeaturesSection.tsx`
- `src/components/landing/CTASection.tsx` (renamed to FinalCTASection logic)
- `src/components/landing/SocialProofSection.tsx` (becomes TestimonialsSection content)
- `src/components/landing/LandingFooter.tsx`
- `src/pages/Landing.tsx` (new section ordering)
- `src/components/landing/PricingSection.tsx`

## Files to Remove/Empty
- `src/components/landing/ProblemSection.tsx` (replaced by PlatformSection)
- `src/components/landing/ComparisonSection.tsx` (merged into pricing)
- `src/components/landing/TestimonialsSection.tsx` (already empty, stays)

## CSS/Font Changes
- Add Plus Jakarta Sans + Bricolage Grotesque to `index.html` Google Fonts link
- Add landing-specific utility classes to `src/index.css` for the grid background, waveform animation, reveal animations, and section styles

## What Stays the Same
- Brand name: "SellSig" (not Velox AI)
- Stripe checkout link for trial CTA
- Route structure (/ -> Landing for unauthenticated)
- SellSigLogo component (used in nav)
- All dashboard/app pages remain unchanged
- Auth flow unchanged

---

## Implementation Order
1. Add Google Fonts (Plus Jakarta Sans + Bricolage Grotesque) to index.html
2. Add new CSS utility classes to index.css
3. Create new section components (LogoBar, Stats, Platform, PhoneLine, FAQ)
4. Rewrite existing components (Header, Hero, Features, Pricing, Testimonials, CTA, Footer)
5. Update Landing.tsx to compose all sections in the correct order
6. Clean up removed/unused components

