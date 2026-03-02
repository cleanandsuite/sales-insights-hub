

# Landing Page Competitive Gap Analysis -- Implementation Plan

## What's Missing from the Cinematic Landing Page

After comparing your cinematic page against sellsig.com (live), Gong, Chorus/ZoomInfo, and Salesloft, here are the sections to add. The cinematic page currently has: Navbar, Hero, Features, Philosophy, Protocol, Pricing, Footer. It's missing 6 key sections that competitors use to convert.

## Sections to Add (in order of page flow)

### 1. Logo Trust Bar (after Hero)
A scrolling/static row of company logos with "Trusted by 2,000+ sales teams" -- matching your live site. Competitors all have this immediately after the hero. Even with placeholder logos, it signals credibility.

- Add new component: `CinematicLogoBanner.tsx`
- Place between `CinematicHero` and `CinematicFeatures` in `Landing.tsx`
- Dark background, white/muted logo text, subtle fade-in animation

### 2. Phone Line Section (after Protocol)
Your live site has a dedicated section showing the phone dashboard mockup. This is a major differentiator vs Gong/Chorus (they don't include a dialer). Bring it into the cinematic design.

- Add new component: `CinematicPhoneLine.tsx`
- Show the 5,000 min / 3 seats / dedicated number / 99.9% uptime stats
- Include a mini phone dashboard mockup styled in the cinematic dark theme

### 3. Testimonials / Social Proof Section (before Pricing)
Your live site has three strong testimonials with specific revenue numbers ($340K extra per rep, 38% win rate increase). Competitors like Gong use named customers with titles and logos.

- Add new component: `CinematicTestimonials.tsx`
- Three cards with star ratings, quotes, names, and roles
- Styled in the cinematic palette with subtle glow effects

### 4. FAQ Section (after Pricing)
Your live site has 5 well-written FAQs. The cinematic page has none. Every competitor includes FAQs to handle last-mile objections before conversion.

- Add new component: `CinematicFAQ.tsx`
- Accordion-style with the 5 FAQs from the live site
- Covers: phone line details, script builder, live coaching visibility, CRM integrations, Enterprise vs Pro

### 5. "Built by Sales" Emotional Closer (after FAQ)
Your live site has this powerful section: "We've lived the 8 AM dials that ended in silence." It's a differentiator because Gong/Salesloft feel corporate. This feels human.

- Add new component: `CinematicBuiltBySales.tsx`
- Short, punchy copy with the three bullet points from the live site
- Dark cinematic styling with a subtle teal accent

### 6. Final CTA Section (before Footer)
A strong closing call-to-action with "Start closing more deals today" + social proof reminder + phone number for sales.

- Add new component: `CinematicFinalCTA.tsx`
- Primary button (Stripe checkout) + secondary "Talk to Sales" (tel: link)
- "No credit card required. Setup in 15 minutes. Cancel anytime."

## Updated Page Flow

```text
CinematicNavbar
CinematicHero
CinematicLogoBanner      <-- NEW
CinematicFeatures
CinematicPhilosophy
CinematicProtocol
CinematicPhoneLine       <-- NEW
CinematicTestimonials    <-- NEW
CinematicPricing
CinematicFAQ             <-- NEW
CinematicBuiltBySales    <-- NEW
CinematicFinalCTA        <-- NEW
CinematicFooter
```

## Technical Details

### Files to create (6 new components):
- `src/components/landing/CinematicLogoBanner.tsx`
- `src/components/landing/CinematicPhoneLine.tsx`
- `src/components/landing/CinematicTestimonials.tsx`
- `src/components/landing/CinematicFAQ.tsx`
- `src/components/landing/CinematicBuiltBySales.tsx`
- `src/components/landing/CinematicFinalCTA.tsx`

### File to modify:
- `src/pages/Landing.tsx` -- import and render the 6 new components in the correct order

### Design System
All new components will follow the established cinematic design tokens:
- Background: `hsl(var(--cin-bg))` (#0A1428)
- Accent: `hsl(var(--cin-teal))` (teal)
- Text: white with `/40`, `/50`, `/60` opacity variants
- Borders: `white/[0.08]`
- Font: mono uppercase tracking for labels, bold for headings
- GSAP ScrollTrigger for reveal animations (fade + slide up)
- Rounded cards with subtle glow effects

### Content Sources
All copy, testimonials, FAQs, and stats will be pulled from the existing live sellsig.com content -- no new copy needed.

