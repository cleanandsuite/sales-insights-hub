import React from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

// The "S" Mark — sharp, predatory, chartreuse. Recreated from the uploaded logo.
const SellSigIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn("h-7 w-7", className)}>
    {/* Upper-left curved shape */}
    <path
      d="M50 0
         C20 0, 0 20, 0 50
         C0 65, 8 78, 22 85
         L50 60
         L50 0Z"
      fill="currentColor"
    />
    {/* Lower-right curved shape */}
    <path
      d="M50 120
         C80 120, 100 100, 100 70
         C100 55, 92 42, 78 35
         L50 60
         L50 120Z"
      fill="currentColor"
    />
    {/* Diagonal slash through center — creates the "S" negative space */}
    <path
      d="M38 0 L62 120 L58 120 L34 0Z"
      fill="currentColor"
      style={{ mixBlendMode: 'difference' as React.CSSProperties['mixBlendMode'] }}
    />
  </svg>
);

// Standalone version using masking for proper transparency
const SellSigIconMasked = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn("h-7 w-7", className)}>
    <defs>
      <mask id="sellsig-slash-mask">
        <rect width="100" height="120" fill="white" />
        {/* Diagonal cut-through */}
        <path d="M35 -5 L65 125 L55 125 L25 -5Z" fill="black" />
        {/* Inner eye cutout top-left */}
        <ellipse cx="36" cy="42" rx="12" ry="14" transform="rotate(-25 36 42)" fill="black" />
        {/* Inner eye cutout bottom-right */}
        <ellipse cx="64" cy="78" rx="12" ry="14" transform="rotate(-25 64 78)" fill="black" />
      </mask>
    </defs>
    {/* Combined S shape with mask cutting the slash and eyes */}
    <g mask="url(#sellsig-slash-mask)">
      {/* Upper leaf/blade */}
      <path
        d="M48 0 C15 0, -2 25, 2 52 C5 70, 18 82, 30 88 L50 60 C50 60, 50 30, 48 0Z"
        fill="currentColor"
      />
      {/* Lower leaf/blade */}
      <path
        d="M52 120 C85 120, 102 95, 98 68 C95 50, 82 38, 70 32 L50 60 C50 60, 50 90, 52 120Z"
        fill="currentColor"
      />
    </g>
  </svg>
);

interface SellSigLogoProps {
  size?: "sm" | "md" | "lg";
  variant?: "default" | "light";
  showTagline?: boolean;
  linkTo?: string;
  className?: string;
}

export const SellSigLogo = React.forwardRef<HTMLDivElement, SellSigLogoProps>(({
  size = "md",
  variant = "default",
  showTagline = false,
  linkTo = "/",
  className,
}, ref) => {
  const sizeClasses = {
    sm: { icon: "h-6 w-5", text: "text-base", tagline: "text-[9px]" },
    md: { icon: "h-8 w-7", text: "text-xl", tagline: "text-[10px]" },
    lg: { icon: "h-10 w-9", text: "text-2xl", tagline: "text-xs" },
  };

  const variantClasses = {
    default: {
      icon: "text-[#CCFF00]",
      text: "text-foreground",
      highlight: "text-[#CCFF00]",
      tagline: "text-muted-foreground",
    },
    light: {
      icon: "text-[#CCFF00]",
      text: "text-white",
      highlight: "text-[#CCFF00]",
      tagline: "text-white/50",
    },
  };

  const sizes = sizeClasses[size];
  const colors = variantClasses[variant];

  const logoContent = (
    <div ref={ref} className={cn("flex items-center gap-2 hover:opacity-90 transition-opacity group", className)}>
      <SellSigIconMasked className={cn(sizes.icon, colors.icon)} />
      <div className="flex flex-col">
        <span className={cn("font-extrabold tracking-tighter leading-none", sizes.text, colors.text)}>
          Sell<span className={colors.highlight}>Sig</span>
        </span>
        {showTagline && (
          <span className={cn("font-medium tracking-widest uppercase leading-none mt-0.5", sizes.tagline, colors.tagline)}>
            AI Coach
          </span>
        )}
      </div>
    </div>
  );

  if (linkTo) {
    return <Link to={linkTo}>{logoContent}</Link>;
  }

  return logoContent;
});

SellSigLogo.displayName = "SellSigLogo";

export { SellSigIcon, SellSigIconMasked };
