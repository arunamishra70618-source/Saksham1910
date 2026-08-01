import { cn } from "@/lib/utils";

interface LogoProps {
  size?: number;
  className?: string;
}

/**
 * MeraPGLogo — a location-pin containing a minimal roofline.
 * The pin shape = "find / discover". The roof inside = "home / PG".
 * Together: find your home.
 */
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
        <linearGradient id="mp-bg" x1="0" y1="0" x2="200" y2="200" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4338CA" />
          <stop offset="1" stopColor="#6D28D9" />
        </linearGradient>
        <linearGradient id="mp-gold" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#FBBF24" />
          <stop offset="1" stopColor="#F59E0B" />
        </linearGradient>
      </defs>

      {/* Rounded square container */}
      <rect width="200" height="200" rx="52" fill="url(#mp-bg)" />

      {/* ── Location pin body (teardrop) ── */}
      {/* Circle top */}
      <ellipse cx="100" cy="85" rx="44" ry="44" fill="white" opacity="0.97" />
      {/* Pin tail */}
      <path
        d="M 100 129 L 75 100 Q 56 79 56 85 Q 56 129 100 162 Q 144 129 144 85 Q 144 79 125 100 Z"
        fill="white"
        opacity="0.97"
      />
      {/* Cleaner teardrop — drawn as one path */}
      <path
        d="M100 26C76.8 26 58 44.8 58 68C58 90.5 88.2 128.4 97.1 139.2C98.7 141.2 101.3 141.2 102.9 139.2C111.8 128.4 142 90.5 142 68C142 44.8 123.2 26 100 26Z"
        fill="white"
        opacity="0.97"
      />

      {/* ── Roof / chevron inside the pin ── */}
      <path
        d="M100 46 L126 68 L120 68 L120 90 L80 90 L80 68 L74 68 Z"
        fill="url(#mp-bg)"
      />
      {/* Door notch inside roof */}
      <rect x="91" y="74" width="18" height="16" rx="9" fill="white" opacity="0.9" />

      {/* Gold dot at pin tip */}
      <circle cx="100" cy="162" r="6" fill="url(#mp-gold)" />
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
