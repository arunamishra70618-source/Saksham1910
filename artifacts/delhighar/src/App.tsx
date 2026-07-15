import { useEffect } from "react";
import { Switch, Route, Router as WouterRouter, useLocation, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { MobileLayout } from "@/components/layout/mobile-layout";
import { AuthProvider, useAuth } from "@/lib/auth";
import { Home } from "@/pages/home";
import { Saved } from "@/pages/saved";
import { Safety } from "@/pages/safety";
import { ListProperty } from "@/pages/list";
import { AdminPanel } from "@/pages/admin";
import { Login } from "@/pages/login";
import { ForgotPassword } from "@/pages/forgot-password";
import { PrivacyPolicy } from "@/pages/privacy";
import { Contact } from "@/pages/contact";
import { OwnerDashboard } from "@/pages/owner-dashboard";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

const PUBLIC_ROUTES = ["/login", "/forgot-password", "/privacy", "/contact"];
const NO_NAV_ROUTES = ["/login", "/forgot-password", "/privacy", "/contact", "/admin", "/owner"];

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isLoggedIn } = useAuth();
  const [location] = useLocation();
  const isPublic = PUBLIC_ROUTES.some(r => location === r || location.startsWith(r + "/"));
  if (!isLoggedIn && !isPublic) {
    return <Redirect to="/login" />;
  }
  return <>{children}</>;
}

function Router() {
  return (
    <MobileLayout noNavRoutes={NO_NAV_ROUTES}>
      <AuthGuard>
        <Switch>
          <Route path="/login" component={Login} />
          <Route path="/forgot-password" component={ForgotPassword} />
          <Route path="/privacy" component={PrivacyPolicy} />
          <Route path="/contact" component={Contact} />
          <Route path="/" component={Home} />
          <Route path="/saved" component={Saved} />
          <Route path="/safety" component={Safety} />
          <Route path="/list" component={ListProperty} />
          <Route path="/admin" component={AdminPanel} />
          <Route path="/owner" component={OwnerDashboard} />
          <Route component={NotFound} />
        </Switch>
      </AuthGuard>
    </MobileLayout>
  );
}

function ServiceWorkerInit() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .catch(() => {});
    }
  }, []);
  return null;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <ServiceWorkerInit />
          <WouterRouter base={import.meta.env.BASE_URL?.replace(/\/$/, "") || ""}>
            <Router />
          </WouterRouter>
        </AuthProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
