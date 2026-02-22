
## Landing Page Redesign — CompleteSEO Inspired

### Visual Direction (from the reference screenshot)
The CompleteSEO site uses:
- **White / very light gray background** — no dark themes
- **Bold, heavy black sans-serif headings** — large, tight tracking
- **Single blue accent color** — used for CTAs, links, and highlighted text
- **Announcement bar** — thin top banner with a message and link
- **Clean white nav** — logo left, links center, phone + CTA button right
- **Star rating badge** above the hero headline (Google 5.0 stars)
- **Large centered headline** with a big blue rounded CTA button below
- **3 trust stats** displayed in a horizontal row below the CTA (icon + bold stat + description)
- **Blue wave/curve divider** separating the hero from the next section
- **"How it works" section** — left: large bold heading + body copy + 3 checkmark bullet points; right: screenshot/image
- **No heavy gradients, no dark backgrounds, no glow effects**

---

### Section-by-Section Plan

#### 1. `LandingHeader.tsx` — Full redesign
- **White background** (`bg-white`), `border-b border-gray-200`
- Logo left-aligned
- Nav links center: Features, Pricing, Support
- Right side: phone number text + blue "Get started" button (rounded, filled blue)
- Mobile: hamburger with white dropdown

#### 2. `HeroSection.tsx` — Full redesign
Remove the dark dashboard mock entirely. Replace with:
- **Top announcement bar**: `bg-[#1e40af]` (dark blue) full-width banner — "Now with Real-Time Buyer Signal Detection →"
- **Star rating row**: Google ⭐ 5.0 badge (like the reference's "Voted 5.0 ★★★★★")
- **Large centered heading**: `text-5xl sm:text-6xl lg:text-7xl font-black text-gray-900 leading-tight`
  - "Close 30% More Deals with Real-Time AI Coaching"
- **Subheadline**: short paragraph, centered, `text-gray-600`
- **Big blue CTA button**: "Book a demo" — `bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-10 py-4 text-lg font-bold`
- **3 Trust stats row** below (horizontal, with icons):
  - 📈 "2,500+ calls analyzed daily"
  - ✅ "Trusted by 100+ sales teams since 2022"
  - 🎯 "Month-to-month. No lock-in."
- **Blue wave SVG divider** at the bottom of the hero (inline SVG, matching the CompleteSEO wave shape — a gentle upward curve in blue)

#### 3. `ProblemSection.tsx` → Renamed to "How it works" style section
Replace the dark card grid with a two-column layout:
- **Left**: Large bold heading ("How real-time coaching produces real pipeline growth") + short paragraph + 3 checkmark bullet items with blue checkmarks
  - ✅ Find the signals that drive revenue
  - ✅ Coach reps live, not after the fact
  - ✅ Turn insights into closed deals
- **Right**: The `dashboard-preview.jpg` image in a rounded card with a subtle shadow
- Background: `bg-white`

#### 4. `FeaturesSection.tsx` — Redesign
Replace vertical card list with a clean 3-column grid:
- Section badge: small blue pill label "Our Features"
- Heading: "Everything your sales team needs to win"
- 3 cards: white background, light gray border, icon top, title, description
- Cards use `rounded-2xl border border-gray-100 p-6 hover:shadow-md transition`

#### 5. `ComparisonSection.tsx` — Keep but style update
- White background, clean table
- Blue header row instead of gray
- "SellSig" column highlighted with blue left border and blue text

#### 6. `SocialProofSection.tsx` — Redesign
- **Stats band**: Full-width light blue (`bg-blue-50`) section with 4 large bold stats
- **Testimonials**: 3 white cards in a grid, clean border, author info at bottom
- Remove the logo placeholder text row (or replace with "Trusted by teams at" text)

#### 7. `TestimonialsSection.tsx` — Merge into SocialProofSection (remove as standalone)
The SocialProofSection already has testimonials — remove the standalone single-quote TestimonialsSection.

#### 8. `CTASection.tsx` — Redesign
- White background with a blue rounded rectangle card inside (not full-bleed gradient)
- OR: dark blue (`#1e3a8a`) full-width section with white text
- Centered heading: "Ready to close more deals?"
- Blue/white CTA button
- Trust line beneath: "No credit card required · Cancel anytime"

#### 9. `LandingFooter.tsx` — Light redesign
- White background with gray border top
- Logo left, links center, copyright right
- Clean and minimal (keep existing structure, just fix styling)

---

### Color Palette
```
Background:     #FFFFFF / #F9FAFB
Text:           #111827 (near black)
Accent blue:    #2563EB (Tailwind blue-600)
Light blue:     #EFF6FF (blue-50)
Border:         #E5E7EB (gray-200)
Announcement:   #1D4ED8 (blue-700)
Wave:           #2563EB fill
```

### Typography
- Headings: `font-black` or `font-extrabold`, `tracking-tight`
- Body: `font-normal`, `text-gray-600`, `leading-relaxed`
- All Inter (existing font)

### Mobile Strategy
- Hero stacks to single column
- "How it works" section: image hides on mobile, text only
- Features: 1-column stack on mobile, 3-col on desktop
- All touch targets 48px+
- Announcement bar wraps text on small screens

### Files to Edit
1. `src/components/landing/LandingHeader.tsx`
2. `src/components/landing/HeroSection.tsx`
3. `src/components/landing/ProblemSection.tsx`
4. `src/components/landing/FeaturesSection.tsx`
5. `src/components/landing/ComparisonSection.tsx`
6. `src/components/landing/SocialProofSection.tsx`
7. `src/components/landing/TestimonialsSection.tsx`
8. `src/components/landing/CTASection.tsx`
9. `src/components/landing/LandingFooter.tsx`
10. `src/pages/Landing.tsx` (update background from `bg-background` to `bg-white`)

### Assets Used
- `src/assets/dashboard-preview.jpg` — used in the "How it works" right-side image
- `src/assets/hero-sales-team.jpg` — used in CTA section background or hero visual
- `src/assets/sales-call.jpg` — used in a feature card
- `src/assets/sellsig-logo.png` — footer logo
- The uploaded `image-26.png` is reference only (screenshot of CompleteSEO), NOT embedded

### What stays the same
- All copy/messaging
- Stripe checkout link
- SellSigLogo component in header
- Route structure
