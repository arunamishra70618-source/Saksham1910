import { Link, useLocation } from "wouter";
import { Home, Heart, PlusCircle, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { MeraPGWordmark } from "@/components/logo";

interface MobileLayoutProps {
  children: React.ReactNode;
  noNavRoutes?: string[];
}

export function MobileLayout({ children, noNavRoutes = [] }: MobileLayoutProps) {
  const [location] = useLocation();

  const tabs = [
    { name: "Browse", href: "/", icon: Home },
    { name: "Saved", href: "/saved", icon: Heart },
    { name: "List PG", href: "/list", icon: PlusCircle },
    { name: "Safety", href: "/safety", icon: ShieldAlert },
  ];

  const hideNav = noNavRoutes.some((r) => location === r || location.startsWith(r + "/"));

  return (
    <div className="mx-auto max-w-[480px] bg-background min-h-[100dvh] shadow-2xl relative flex flex-col overflow-hidden">
      <main className={cn("flex-1 overflow-y-auto w-full", !hideNav && "pb-[72px]")}>
        {children}
      </main>

      {!hideNav && (
        <nav className="absolute bottom-0 w-full bg-card/95 backdrop-blur border-t border-border flex justify-around items-center h-[72px] z-40 pb-safe shadow-[0_-4px_20px_-4px_rgba(79,70,229,0.10)]">
          {tabs.map((tab) => {
            const isActive = location === tab.href;
            const Icon = tab.icon;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "nav-icon-group relative flex flex-col items-center justify-center w-full h-full gap-1",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
                data-testid={`nav-${tab.name.toLowerCase().replace(/\s+/g, "-")}`}
              >
                {/* Active indicator pill */}
                <span
                  className={cn(
                    "absolute top-2 h-[3px] rounded-full bg-primary transition-all duration-300",
                    isActive ? "w-8 opacity-100" : "w-0 opacity-0"
                  )}
                />

                <Icon
                  size={22}
                  className={cn("nav-icon", isActive && "fill-primary/15")}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span className={cn(
                  "text-[10px] font-semibold tracking-wide transition-all duration-200",
                  isActive ? "text-primary" : ""
                )}>
                  {tab.name}
                </span>
              </Link>
            );
          })}
        </nav>
      )}
    </div>
  );
}

export { MeraPGWordmark };
