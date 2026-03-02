import React from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

// The "Sig" Mark — angular S / signal spike
const SellSigIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn("h-7 w-7", className)}>
    {/* Upper zigzag — descends left to right then flattens */}
    <path
      d="M2 22 L10 6 L18 22"
      stroke="currentColor"
      strokeWidth="3.5"
      strokeLinecap="square"
      strokeLinejoin="miter"
      fill="none"
    />
    {/* Lower zigzag — flattens then ascends */}
    <path
      d="M14 10 L22 26 L30 10"
      stroke="currentColor"
      strokeWidth="3.5"
      strokeLinecap="square"
      strokeLinejoin="miter"
      fill="none"
    />
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
    sm: { icon: "h-5 w-5", text: "text-base", tagline: "text-[9px]" },
    md: { icon: "h-7 w-7", text: "text-xl", tagline: "text-[10px]" },
    lg: { icon: "h-9 w-9", text: "text-2xl", tagline: "text-xs" },
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
      <SellSigIcon className={cn(sizes.icon, colors.icon)} />
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

export { SellSigIcon };
