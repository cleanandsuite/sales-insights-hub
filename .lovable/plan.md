

## Fix: Hero Background Image Not Visible

### Problem
The dashboard image is invisible due to three compounding factors:
1. **Mask gradient** starts at `transparent` (0% visible) and peaks at only `rgba(0,0,0,0.4)` (40% visible) in a narrow band (20%-35%), then goes back to transparent by 50%
2. **Dark overlay** (`bg-[#020617]/60`) at `z-[1]` covers the image with 60% opacity dark fill
3. **Base opacity** set to `0.5` on the image itself

Combined effect: `0.4 (mask peak) x 0.5 (opacity) x 0.4 (overlay lets 40% through)` = ~8% visible. Essentially invisible against a near-black background.

### Solution
Adjust the values so the image is actually visible while still maintaining text readability:

**In `src/components/landing/HeroSection.tsx`:**

1. **Increase mask peak opacity** from `0.4` to `1.0` -- let the mask fully reveal the image in the visible band
2. **Widen the visible band** -- start revealing at 10%, peak at 30%, fade out by 60%
3. **Increase base opacity** from `0.5` to `0.7`
4. **Reduce dark overlay** from `60%` to `30%` so it darkens for readability without hiding the image

Updated mask gradient:
```
linear-gradient(to bottom, transparent 10%, rgba(0,0,0,1) 30%, rgba(0,0,0,0.6) 50%, transparent 60%)
```

This gives the image a clear visible area in the middle/lower portion of the hero while keeping text readable and the fade-in/fade-out effect the user requested.
