import React from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import sellsigIcon from "@/assets/sellsig-icon.png";

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
    sm: { icon: "h-12 w-12", text: "text-xl", tagline: "text-[9px]" },
    md: { icon: "h-[60px] w-[60px]", text: "text-2xl", tagline: "text-[10px]" },
    lg: { icon: "h-20 w-20", text: "text-3xl", tagline: "text-xs" },
  };

  const variantClasses = {
    default: {
      text: "text-foreground",
      highlight: "text-[#CCFF00]",
      tagline: "text-muted-foreground",
    },
    light: {
      text: "text-white",
      highlight: "text-[#CCFF00]",
      tagline: "text-white/50",
    },
  };

  const sizes = sizeClasses[size];
  const colors = variantClasses[variant];

  const logoContent = (
    <div ref={ref} className={cn("flex items-center gap-1.5 hover:opacity-90 transition-opacity group", className)}>
      <img src={sellsigIcon} alt="SellSig" className={cn(sizes.icon, "object-contain")} loading="lazy" />
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

// Keep named export for backward compat
export const SellSigIcon = ({ className }: { className?: string }) => (
  <img src={sellsigIcon} alt="SellSig" className={cn("h-7 w-7 object-contain", className)} loading="lazy" />
);
