import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    screens: {
      'xs': '480px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "count-up": {
          from: { opacity: "0", transform: "translateY(5px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "progress-fill": {
          from: { width: "0%" },
          to: { width: "var(--progress-width)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 8px 2px hsl(var(--destructive) / 0.4)" },
          "50%": { boxShadow: "0 0 16px 4px hsl(var(--destructive) / 0.6)" },
        },
        "bar-grow": {
          from: { transform: "scaleY(0)" },
          to: { transform: "scaleY(1)" },
        },
        "breathe": {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.02)" },
        },
        "walk": {
          "0%, 100%": { transform: "translateX(0)" },
          "25%": { transform: "translateX(-2px)" },
          "75%": { transform: "translateX(2px)" },
        },
        "victory": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "excited": {
          "0%, 100%": { transform: "rotate(0deg)" },
          "25%": { transform: "rotate(-5deg)" },
          "75%": { transform: "rotate(5deg)" },
        },
        "float-particle": {
          "0%, 100%": { transform: "translate(-50%, -50%) translateY(0px)", opacity: "0.6" },
          "50%": { transform: "translate(-50%, -50%) translateY(-10px)", opacity: "0.9" },
        },
        "electric-pulse": {
          "0%, 100%": { opacity: "0", transform: "translate(-50%, -50%) scale(0.5)" },
          "50%": { opacity: "0.8", transform: "translate(-50%, -50%) scale(1.2)" },
        },
        "rainbow-aura": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        "fire-flicker": {
          "0%, 100%": { opacity: "0.7", transform: "scaleY(1)" },
          "50%": { opacity: "1", transform: "scaleY(1.1)" },
        },
        "electric-crack": {
          "0%, 100%": { opacity: "0.3" },
          "10%, 90%": { opacity: "1" },
        },
        "spark-pop": {
          "0%": { transform: "scale(0)", opacity: "1" },
          "50%": { transform: "scale(1.5)", opacity: "0.8" },
          "100%": { transform: "scale(0)", opacity: "0" },
        },
        "electric-body": {
          "0%, 100%": { opacity: "0.3", transform: "scale(1)" },
          "50%": { opacity: "0.6", transform: "scale(1.02)" },
        },
        "walk-bounce": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" },
        },
        "victory-bounce": {
          "0%, 100%": { transform: "translateY(0) rotate(0deg)" },
          "25%": { transform: "translateY(-20px) rotate(-10deg)" },
          "50%": { transform: "translateY(0) rotate(0deg)" },
          "75%": { transform: "translateY(-15px) rotate(5deg)" },
        },
        "excited-shake": {
          "0%, 100%": { transform: "translateX(0) rotate(0deg)" },
          "25%": { transform: "translateX(-3px) rotate(-3deg)" },
          "75%": { transform: "translateX(3px) rotate(3deg)" },
        },
        "evolution-glow": {
          "0%, 100%": { transform: "scale(1)", opacity: "0.6" },
          "50%": { transform: "scale(1.3)", opacity: "1" },
        },
        "evolution-fade-out": {
          "0%": { opacity: "1", transform: "scale(1)" },
          "100%": { opacity: "0", transform: "scale(0.8)" },
        },
        "evolution-fade-in": {
          "0%": { opacity: "0", transform: "scale(1.5)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "fire-rise": {
          "0%": { transform: "rotate(0deg) scale(1)" },
          "100%": { transform: "rotate(360deg) scale(1.2)" },
        },
        "thunder-flash": {
          "0%, 100%": { opacity: "0", transform: "scale(0.5)" },
          "10%, 30%, 50%": { opacity: "1", transform: "scale(1.2)" },
          "20%, 40%": { opacity: "0.5", transform: "scale(1)" },
          "60%": { opacity: "0", transform: "scale(0.5)" },
        },
        "shockwave": {
          "0%": { transform: "scale(0)", opacity: "1" },
          "100%": { transform: "scale(3)", opacity: "0" },
        },
        "explosion-core": {
          "0%": { transform: "scale(0)", opacity: "1" },
          "50%": { transform: "scale(1.5)", opacity: "0.8" },
          "100%": { transform: "scale(2)", opacity: "0" },
        },
        "ground-blast": {
          "0%": { transform: "translate(-50%, 0) scaleX(0)", opacity: "1" },
          "100%": { transform: "translate(-50%, -50%) scaleX(3)", opacity: "0" },
        },
        "debris": {
          "0%": { opacity: "1", transform: "translate(-50%, -50%) rotate(0deg) translateY(0)" },
          "100%": { opacity: "0", transform: `translate(-50%, -50%) rotate(${Math.random() > 0.5 ? '' : '-'}180deg) translateY(50px)` },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "slide-up": "slide-up 0.4s ease-out",
        "count-up": "count-up 0.5s ease-out",
        "progress-fill": "progress-fill 1s ease-out forwards",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "bar-grow": "bar-grow 0.6s ease-out",
        "breathe": "breathe 2s ease-in-out infinite",
        "walk": "walk 0.5s ease-in-out infinite",
        "victory": "victory 0.5s ease-in-out infinite",
        "excited": "excited 0.3s ease-in-out infinite",
        "float-particle": "float-particle 3s ease-in-out infinite",
        "electric-pulse": "electric-pulse 1s ease-in-out infinite",
        "rainbow-aura": "rainbow-aura 3s linear infinite",
        "fire-flicker": "fire-flicker 0.3s ease-in-out infinite",
        "electric-crack": "electric-crack 0.5s ease-in-out infinite",
        "spark-pop": "spark-pop 1s ease-out forwards",
        "electric-body": "electric-body 2s ease-in-out infinite",
        "walk-bounce": "walk-bounce 0.4s ease-in-out infinite",
        "victory-bounce": "victory-bounce 1s ease-in-out infinite",
        "excited-shake": "excited-shake 0.2s ease-in-out infinite",
        "evolution-glow": "evolution-glow 1s ease-in-out infinite",
        "evolution-fade-out": "evolution-fade-out 0.5s ease-out forwards",
        "evolution-fade-in": "evolution-fade-in 0.5s ease-out forwards",
        "fire-rise": "fire-rise 0.5s linear infinite",
        "thunder-flash": "thunder-flash 0.5s ease-in-out",
        "shockwave": "shockwave 0.8s ease-out forwards",
        "explosion-core": "explosion-core 0.6s ease-out forwards",
        "ground-blast": "ground-blast 0.8s ease-out forwards",
        "debris": "debris 0.6s ease-out forwards",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
