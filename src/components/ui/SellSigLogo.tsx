import React from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

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
    sm: { text: "text-[2.7rem]", tagline: "text-[10px]" },
    md: { text: "text-[3.4rem]", tagline: "text-xs" },
    lg: { text: "text-[4.5rem]", tagline: "text-sm" },
  };

  const variantClasses = {
    default: {
      text: "text-foreground",
      highlight: "text-[hsl(var(--cin-teal,174_60%_51%))]",
      tagline: "text-muted-foreground",
    },
    light: {
      text: "text-white",
      highlight: "text-[hsl(var(--cin-teal,174_60%_51%))]",
      tagline: "text-white/50",
    },
  };

  const sizes = sizeClasses[size];
  const colors = variantClasses[variant];

  const logoContent = (
    <div ref={ref} className={cn("flex items-center hover:opacity-90 transition-opacity group", className)}>
      <div className="flex flex-col">
        <span className={cn("font-extrabold tracking-tighter leading-none uppercase", sizes.text, colors.text)}>
          SELL<span className={colors.highlight}>SIG</span>
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

// Compact text-only icon for collapsed sidebar
export const SellSigIcon = ({ className }: { className?: string }) => (
  <span className={cn("font-extrabold text-xs tracking-tighter uppercase text-foreground", className)}>
    S<span className="text-[hsl(var(--cin-teal,174_60%_51%))]">S</span>
  </span>
);
