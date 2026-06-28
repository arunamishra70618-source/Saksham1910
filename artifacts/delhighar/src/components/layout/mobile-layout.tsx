import { Link, useLocation } from "wouter";
import { Home, Heart, PlusCircle, ShieldAlert, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileLayoutProps {
  children: React.ReactNode;
}

export function MobileLayout({ children }: MobileLayoutProps) {
  const [location] = useLocation();

  const tabs = [
    { name: "Browse", href: "/", icon: Home },
    { name: "Saved", href: "/saved", icon: Heart },
    { name: "List Karo", href: "/list", icon: PlusCircle },
    { name: "Safety", href: "/safety", icon: ShieldAlert },
  ];

  const hideNav = location === "/admin" || location.startsWith("/list"); // Optionally hide nav on form or admin

  return (
    <div className="mx-auto max-w-[480px] bg-background min-h-[100dvh] shadow-xl relative flex flex-col overflow-hidden">
      <main className={cn("flex-1 overflow-y-auto w-full", !hideNav && "pb-[70px]")}>
        {children}
      </main>

      {!hideNav && (
        <nav className="absolute bottom-0 w-full bg-card border-t border-border flex justify-around items-center h-[70px] z-40 pb-safe">
          {tabs.map((tab) => {
            const isActive = location === tab.href;
            const Icon = tab.icon;
            return (
              <Link 
                key={tab.href} 
                href={tab.href}
                className={cn(
                  "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
                data-testid={`nav-${tab.name.toLowerCase()}`}
              >
                <Icon size={24} className={cn(isActive && "fill-primary/20")} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-medium">{tab.name}</span>
              </Link>
            );
          })}
        </nav>
      )}
    </div>
  );
}
