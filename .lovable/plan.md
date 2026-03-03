

# Make the Logo Bigger and Soften the Accent Color

## What's Changing

### 1. Bigger Logo Sizes
The current sizes are small compared to industry standards. Most SaaS navbars have logos around 36-44px tall, and the current "sm" icon is 48px but the text is only `text-xl` (20px). We'll scale everything up so the logo has real visual weight:

| Variant | Current Icon | New Icon | Current Text | New Text |
|---------|-------------|----------|-------------|----------|
| sm (navbar) | 48px | 48px | text-xl (20px) | text-2xl (24px) |
| md (auth/headers) | 60px | 72px | text-2xl (24px) | text-3xl (30px) |
| lg (hero) | 80px | 96px | text-3xl (30px) | text-4xl (36px) |

The icon already got a 70% bump, so the main fix is scaling the text to match and bumping md/lg icons further.

### 2. Softer Accent Color
Replace the harsh lime green `#CCFF00` with the site's existing teal accent `hsl(168, 76%, 40%)` which is approximately `#18B8A6`. This matches the "Book a Demo" button, the cinematic theme accents, and feels more premium and cohesive.

The color will change in both the `default` and `light` variants of the logo.

## Files to Modify

### `src/components/ui/SellSigLogo.tsx`
- Update `sizeClasses` to increase text and icon dimensions
- Change highlight color from `#CCFF00` to `#14B8A6` (the cin-teal) in both variant color maps
- Update the standalone `SellSigIcon` component size accordingly

## Technical Details

```tsx
const sizeClasses = {
  sm: { icon: "h-12 w-12", text: "text-2xl", tagline: "text-[10px]" },
  md: { icon: "h-[72px] w-[72px]", text: "text-3xl", tagline: "text-xs" },
  lg: { icon: "h-24 w-24", text: "text-4xl", tagline: "text-sm" },
};

const variantClasses = {
  default: {
    text: "text-foreground",
    highlight: "text-[#14B8A6]",   // teal instead of lime
    tagline: "text-muted-foreground",
  },
  light: {
    text: "text-white",
    highlight: "text-[#14B8A6]",   // teal instead of lime
    tagline: "text-white/50",
  },
};
```

No other files need changes -- all pages importing `SellSigLogo` will automatically pick up the new sizes and color.
