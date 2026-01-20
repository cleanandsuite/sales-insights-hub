import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

// Custom SellSig Logo Icon - Signal wave with AI spark
const SellSigIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={cn("h-7 w-7", className)}
  >
    {/* Signal bars representing call analysis */}
    <rect x="4" y="18" width="4" height="10" rx="2" fill="url(#sellsig-gradient1)" />
    <rect x="10" y="12" width="4" height="16" rx="2" fill="url(#sellsig-gradient1)" />
    <rect x="16" y="6" width="4" height="22" rx="2" fill="url(#sellsig-gradient1)" />
    {/* AI spark/lightning accent */}
    <path
      d="M24 4L22 12H26L22 20L24 12H20L24 4Z"
      fill="url(#sellsig-gradient2)"
    />
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
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'light';
  showTagline?: boolean;
  linkTo?: string;
  className?: string;
}

export function SellSigLogo({ 
  size = 'md', 
  variant = 'default',
  showTagline = true,
  linkTo = '/',
  className 
}: SellSigLogoProps) {
  const sizeClasses = {
    sm: {
      container: 'h-7 w-7',
      icon: 'h-4 w-4',
      text: 'text-sm',
      tagline: 'text-[8px]',
      gap: 'gap-1.5',
    },
    md: {
      container: 'h-8 w-8',
      icon: 'h-5 w-5',
      text: 'text-base',
      tagline: 'text-[9px]',
      gap: 'gap-1.5',
    },
    lg: {
      container: 'h-10 w-10',
      icon: 'h-6 w-6',
      text: 'text-lg',
      tagline: 'text-[10px]',
      gap: 'gap-2',
    },
  };

  const variantClasses = {
    default: {
      containerBg: 'bg-[#1e3a5f]',
      containerBorder: 'border-transparent',
      text: 'text-foreground',
      highlight: 'text-foreground',
      tagline: 'text-muted-foreground',
    },
    light: {
      containerBg: 'bg-[#1e3a5f]',
      containerBorder: 'border-transparent',
      text: 'text-white',
      highlight: 'text-white',
      tagline: 'text-white/60',
    },
  };

  const sizes = sizeClasses[size];
  const colors = variantClasses[variant];

  const logoContent = (
    <div className={cn("flex items-center hover:opacity-90 transition-opacity group", sizes.gap, className)}>
      <div className={cn(
        "rounded-md flex items-center justify-center",
        sizes.container,
        colors.containerBg
      )}>
        <SellSigIcon className={sizes.icon} />
      </div>
    <div className="flex flex-col">
              <span className="font-bold text-xl tracking-tight text-white leading-none">
                Sell<span className="text-blue-400">Sig</span>
              </span>
              <span className="text-[10px] text-white/50 font-medium tracking-widest uppercase leading-none mt-0.5">
                AI Coach
              </span>
            </div>
  );

  if (linkTo) {
    return <Link to={linkTo}>{logoContent}</Link>;
  }

  return logoContent;
}

export { SellSigIcon };
