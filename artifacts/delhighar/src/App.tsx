import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { MobileLayout } from "@/components/layout/mobile-layout";
import { Home } from "@/pages/home";
import { Saved } from "@/pages/saved";
import { Safety } from "@/pages/safety";
import { ListProperty } from "@/pages/list";
import { AdminPanel } from "@/pages/admin";
import { Login } from "@/pages/login";
import { ForgotPassword } from "@/pages/forgot-password";
import { PrivacyPolicy } from "@/pages/privacy";
import { Contact } from "@/pages/contact";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

const NO_NAV_ROUTES = ["/login", "/forgot-password", "/privacy", "/contact", "/admin"];

function Router() {
  return (
    <MobileLayout noNavRoutes={NO_NAV_ROUTES}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/saved" component={Saved} />
        <Route path="/safety" component={Safety} />
        <Route path="/list" component={ListProperty} />
        <Route path="/admin" component={AdminPanel} />
        <Route path="/login" component={Login} />
        <Route path="/forgot-password" component={ForgotPassword} />
        <Route path="/privacy" component={PrivacyPolicy} />
        <Route path="/contact" component={Contact} />
        <Route component={NotFound} />
      </Switch>
    </MobileLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL?.replace(/\/$/, "") || ""}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
