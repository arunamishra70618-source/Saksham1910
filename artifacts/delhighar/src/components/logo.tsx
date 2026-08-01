import { cn } from "@/lib/utils";

interface LogoProps {
  size?: number;
  className?: string;
}

export function MeraPGLogo({ size = 32, className }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="lb" x1="0" y1="0" x2="200" y2="200" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4338CA" />
          <stop offset="1" stopColor="#7C3AED" />
        </linearGradient>
        <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#F59E0B" />
          <stop offset="1" stopColor="#D97706" />
        </linearGradient>
      </defs>
      <rect width="200" height="200" rx="48" fill="url(#lb)" />
      <path d="M100 36L166 92H34L100 36Z" fill="white" opacity="0.96" />
      <rect x="120" y="50" width="13" height="42" rx="3" fill="white" opacity="0.75" />
      <rect x="44" y="92" width="112" height="76" rx="4" fill="white" opacity="0.96" />
      <rect x="79" y="114" width="42" height="54" rx="8" fill="url(#lb)" />
      <circle cx="113" cy="143" r="3" fill="url(#lg)" />
      <rect x="54" y="104" width="19" height="15" rx="4" fill="url(#lb)" opacity="0.55" />
      <rect x="127" y="104" width="19" height="15" rx="4" fill="url(#lb)" opacity="0.55" />
      <rect x="72" y="162" width="56" height="5" rx="2.5" fill="url(#lg)" />
    </svg>
  );
}

export function MeraPGWordmark({ className, size = "md" }: { className?: string; size?: "sm" | "md" | "lg" }) {
  const logoSize = size === "sm" ? 24 : size === "lg" ? 36 : 28;
  const textClass = size === "sm" ? "text-base" : size === "lg" ? "text-2xl" : "text-lg";
  return (
    <div className={cn("flex items-center gap-2 select-none", className)}>
      <MeraPGLogo size={logoSize} />
      <span className={cn("font-extrabold tracking-tight leading-none", textClass)}>
        Mera<span className="text-primary">PG</span>
      </span>
    </div>
  );
}
