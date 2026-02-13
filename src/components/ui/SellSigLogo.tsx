import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

// Custom SellSig Logo Icon - Signal wave with AI spark
const SellSigIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn("h-7 w-7", className)}>
    {/* Signal bars representing call analysis */}
    <rect x="4" y="18" width="4" height="10" rx="2" fill="url(#sellsig-gradient1)" />
    <rect x="10" y="12" width="4" height="16" rx="2" fill="url(#sellsig-gradient1)" />
    <rect x="16" y="6" width="4" height="22" rx="2" fill="url(#sellsig-gradient1)" />
    {/* AI spark/lightning accent */}
    <path d="M24 4L22 12H26L22 20L24 12H20L24 4Z" fill="url(#sellsig-gradient2)" />
    <defs>
      <linearGradient id="sellsig-gradient1" x1="12" y1="4" x2="12" y2="28" gradientUnits="userSpaceOnUse">
        <stop stopColor="#60A5FA" />
        <stop offset="1" stopColor="#3B82F6" />
      </linearGradient>
      <linearGradient id="sellsig-gradient2" x1="23" y1="4" x2="23" y2="20" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FBBF24" />
        <stop offset="1" stopColor="#F59E0B" />
      </linearGradient>
    </defs>
  </svg>
);

interface SellSigLogoProps {
  size?: "sm" | "md" | "lg";
  variant?: "default" | "light";
  showTagline?: boolean;
  linkTo?: string;
  className?: string;
}

export function SellSigLogo({
  size = "md",
  variant = "default",
  showTagline = true,
  linkTo = "/",
  className,
}: SellSigLogoProps) {
  const sizeClasses = {
    sm: {
      container: "h-8 w-8",
      icon: "h-5 w-5",
      text: "text-base",
      tagline: "text-[9px]",
    },
    md: {
      container: "h-10 w-10",
      icon: "h-7 w-7",
      text: "text-xl",
      tagline: "text-[10px]",
    },
    lg: {
      container: "h-12 w-12",
      icon: "h-8 w-8",
      text: "text-2xl",
      tagline: "text-xs",
    },
  };

  const variantClasses = {
    default: {
      containerBg: "bg-primary/10",
      containerBorder: "border-primary/20",
      text: "text-white",
      highlight: "text-blue-500",
      tagline: "text-muted-foreground",
    },
    light: {
      containerBg: "bg-white/15",
      containerBorder: "border-white/10",
      text: "text-white",
      highlight: "text-blue-400",
      tagline: "text-white/50",
    },
  };

  const sizes = sizeClasses[size];
  const colors = variantClasses[variant];

  const logoContent = (
    <div className={cn("flex items-center gap-2.5 hover:opacity-90 transition-opacity group", className)}>
      <div
        className={cn(
          "rounded-xl flex items-center justify-center backdrop-blur-sm border group-hover:border-opacity-60 transition-colors",
          sizes.container,
          colors.containerBg,
          colors.containerBorder,
        )}
      >
        <SellSigIcon className={sizes.icon} />
      </div>
      <div className="flex flex-col">
        <span className={cn("font-bold tracking-tight leading-none", sizes.text, colors.text)}>
          Sell<span className={colors.highlight}>Sig</span>
        </span>
        {showTagline && (
          <span
            className={cn("font-medium tracking-widest uppercase leading-none mt-4.5", sizes.tagline, colors.tagline)}
          >
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
}

export { SellSigIcon };
