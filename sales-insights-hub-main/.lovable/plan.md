

## Update Hero Section Copy

### Changes to `src/components/landing/confession/HeroConfession.tsx`

**1. Headline (lines 118-135)**
Replace the current "Your Sales Calls Are Bleeding Money / AI Coaching Stops The Bleeding" with:
- **"Close More Deals with AI That Coaches You"**
- Clean, benefit-driven headline without the shame/confession framing

**2. Subheadline (lines 137-144)**
Replace the current multi-line shame copy with:
- **"34% more closes -- guaranteed"**
- Short, punchy, proof-driven

**3. Primary CTA button (lines 148-160)**
Replace "Claim Your Redemption -- $97/mo" with:
- **"Start Free -- No Credit Card Required"**
- Lower friction, removes price from the hero

### What stays the same
- The `forwardRef` wrapper and all ref handling (recently fixed)
- GSAP word animations, floating orbs, background styling
- Phone number / call-for-demo button
- Trust signals and social proof stats below the CTA

### Technical Details
- The headline word-animation uses `.hero-word` spans -- these will be restructured for the new copy
- The pre-headline badge (red "WARNING" pill) will be replaced with something matching the new tone
- No new dependencies or files needed

