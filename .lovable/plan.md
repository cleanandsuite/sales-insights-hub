

# Redesign SellSig Logo as a Hand-Crafted SVG Mark

## Problem
The current logo icon is generic blue signal bars with a yellow lightning bolt — exactly the corporate SaaS cliche the brand should avoid. The AI-generated PNG was low quality and not usable.

## Solution
Build a new logo entirely as an inline SVG component in code. This gives us:
- Pixel-perfect at every size (16x16 favicon to billboard)
- True vector — no raster artifacts
- Full control over geometry, colors, negative space
- Matches the cinematic dark theme natively

## New Logo Design: The "Sig" Mark

A bold geometric "S" that doubles as a **signal spike / rising signature line**:

```text
    ╱╲
   ╱  ╲
  ╱    ╲
 ╱      ╲______
╱
         ╱╲
        ╱  ╲
 ______╱    ╲
              ╲
```

Concept: Two sharp zigzag strokes forming an "S" shape that also reads as a signal waveform spike — like a stock chart breakout or an EKG spike. The negative space between the strokes creates a hidden upward arrow.

### Design Specs
- **Shape**: Angular "S" built from two connected chevron/zigzag paths with sharp 45-degree cuts
- **Color**: Electric chartreuse (#CCFF00) on dark backgrounds, deep near-black (#0A0F1C) on light backgrounds
- **No gradients** — flat, brutal, single-color fill
- **No rounded corners** on the mark itself — sharp terminals only
- **Aspect ratio**: Square (fits in favicon, app icon, social avatar)

### Wordmark Update
- "Sell" in white/foreground, "Sig" in chartreuse (#CCFF00) accent
- Tighter letter-spacing, bolder weight
- Drop the "AI Coach" tagline from the logo (move it elsewhere if needed)

## Color Palette Change
- **Primary accent**: `#CCFF00` (electric chartreuse) — replaces the generic blue
- **Dark background**: stays `#0A1428` (cinematic)
- **This is logo-only** — we won't change the full site theme in this task, just the logo mark and wordmark colors

## Files to Modify

### `src/components/ui/SellSigLogo.tsx`
- Replace the `SellSigIcon` SVG with the new angular "S" / signal spike mark
- Update color variants: chartreuse accent instead of blue
- Remove "AI Coach" tagline default (keep as opt-in prop)
- Update the container styling — remove the rounded background box, let the mark stand alone

### `src/components/landing/CinematicNavbar.tsx`
- Replace the plain text "SellSig" with the `SellSigLogo` component (light variant, no tagline, small size)

## What This Does NOT Change
- No raster images involved — pure SVG in code
- No changes to the cinematic page theme or other components
- The `SellSigLogo` component API stays the same (size, variant, linkTo props)
- Other pages using `SellSigLogo` will automatically get the new mark

## Technical Details

The new SVG mark will be approximately:
```tsx
<svg viewBox="0 0 32 32" fill="none">
  {/* Upper zigzag stroke */}
  <path d="M4 20 L12 8 L20 20" stroke="currentColor" strokeWidth="4" strokeLinecap="square" fill="none" />
  {/* Lower zigzag stroke */}  
  <path d="M12 12 L20 24 L28 12" stroke="currentColor" strokeWidth="4" strokeLinecap="square" fill="none" />
</svg>
```
(Exact coordinates will be refined during implementation for visual balance)

The mark uses `currentColor` so it inherits from the parent — chartreuse on dark, near-black on light.
