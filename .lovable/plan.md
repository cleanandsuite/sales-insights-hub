

## Fix React forwardRef Warnings and HeroConfession Issues

### Problem
The browser console shows "Function components cannot be given refs" warnings for `CloseSequence`, `ConfessionFooter`, and `SellSigLogo`. The `HeroConfession` component may have similar issues. These warnings don't crash the app but indicate improper ref handling.

### Changes

**1. `src/components/ui/SellSigLogo.tsx`**
- Wrap the `SellSigLogo` component with `React.forwardRef` so it can accept a ref from parent components (e.g., when used inside navigation or tooltip triggers).

**2. `src/components/landing/confession/ConfessionFooter.tsx`**
- Wrap with `React.forwardRef` and forward the ref to the outer `<footer>` element.

**3. `src/components/landing/confession/CloseSequence.tsx`**
- Wrap with `React.forwardRef` and forward the ref to the outer `<section>` element.

**4. `src/components/landing/confession/HeroConfession.tsx`**
- Wrap with `React.forwardRef` and forward the ref to the outer `<section>` element.
- This ensures compatibility if a parent (or GSAP ScrollTrigger) attempts to attach a ref.

### Technical Notes
- All four components will use `React.forwardRef` with proper TypeScript typing (`React.forwardRef<HTMLElement, Props>`).
- Named exports will be preserved; `displayName` will be set for better DevTools debugging.
- No behavioral or visual changes -- purely fixes the console warnings.

