import { useState } from "react";
import { useLocation } from "wouter";
import { Eye, EyeOff, ShieldCheck, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export function Login() {
  const [, setLocation] = useLocation();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  function validate() {
    const e: Record<string, string> = {};
    if (mode === "signup" && !form.name.trim()) e.name = "Full name is required";
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email address";
    if (mode === "signup" && (!form.phone.trim() || form.phone.length < 10)) e.phone = "Enter a valid 10-digit phone number";
    if (!form.password || form.password.length < 6) e.password = "Password must be at least 6 characters";
    return e;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setLocation("/");
    }, 1200);
  }

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      <div className="relative flex-1 flex flex-col">
        <div className="bg-secondary px-5 pt-14 pb-10 text-white text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <ShieldCheck size={32} className="text-primary" />
            <span className="text-2xl font-bold tracking-tight">DelhiGhar</span>
          </div>
          <p className="text-white/70 text-sm">Zero broker. Real homes. Safe deals.</p>
        </div>

        <div className="flex-1 px-5 pt-6 pb-8">
          <div className="flex rounded-xl bg-muted p-1 mb-6">
            <button
              type="button"
              onClick={() => { setMode("login"); setErrors({}); }}
              data-testid="tab-login"
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${mode === "login" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}
            >
              Log In
            </button>
            <button
              type="button"
              onClick={() => { setMode("signup"); setErrors({}); }}
              data-testid="tab-signup"
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${mode === "signup" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {mode === "signup" && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5" htmlFor="name">Full Name</label>
                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  placeholder="Enter your full name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  data-testid="input-name"
                  className={`w-full px-4 py-3 rounded-xl bg-card border text-sm outline-none focus:ring-2 focus:ring-primary/40 transition ${errors.name ? "border-destructive" : "border-border"}`}
                />
                {errors.name && <p className="text-destructive text-xs mt-1">{errors.name}</p>}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5" htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                data-testid="input-email"
                className={`w-full px-4 py-3 rounded-xl bg-card border text-sm outline-none focus:ring-2 focus:ring-primary/40 transition ${errors.email ? "border-destructive" : "border-border"}`}
              />
              {errors.email && <p className="text-destructive text-xs mt-1">{errors.email}</p>}
            </div>

            {mode === "signup" && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5" htmlFor="phone">Phone Number</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">+91</span>
                  <input
                    id="phone"
                    type="tel"
                    autoComplete="tel"
                    placeholder="9876543210"
                    maxLength={10}
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, "") })}
                    data-testid="input-phone"
                    className={`w-full pl-12 pr-4 py-3 rounded-xl bg-card border text-sm outline-none focus:ring-2 focus:ring-primary/40 transition ${errors.phone ? "border-destructive" : "border-border"}`}
                  />
                </div>
                {errors.phone && <p className="text-destructive text-xs mt-1">{errors.phone}</p>}
              </div>
            )}

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-sm font-medium text-foreground" htmlFor="password">Password</label>
                {mode === "login" && (
                  <Link href="/forgot-password" className="text-xs text-primary font-medium hover:underline" data-testid="link-forgot-password">
                    Forgot password?
                  </Link>
                )}
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  placeholder={mode === "login" ? "Enter your password" : "Create a password (min 6 chars)"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  data-testid="input-password"
                  className={`w-full px-4 py-3 pr-12 rounded-xl bg-card border text-sm outline-none focus:ring-2 focus:ring-primary/40 transition ${errors.password ? "border-destructive" : "border-border"}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  data-testid="button-toggle-password"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground p-1"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="text-destructive text-xs mt-1">{errors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              data-testid="button-submit"
              className="w-full bg-primary text-white font-semibold py-3.5 rounded-xl mt-2 transition active:scale-[0.98] disabled:opacity-60 text-sm"
            >
              {loading ? "Please wait..." : mode === "login" ? "Log In" : "Create Account"}
            </button>
          </form>

          {mode === "signup" && (
            <p className="text-xs text-muted-foreground text-center mt-4 leading-relaxed">
              By signing up, you agree to our{" "}
              <Link href="/privacy" className="text-primary underline">Privacy Policy</Link>
              {" "}and Terms of Service.
            </p>
          )}

          <div className="mt-6 pt-6 border-t border-border text-center">
            <p className="text-sm text-muted-foreground">
              {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                type="button"
                onClick={() => { setMode(mode === "login" ? "signup" : "login"); setErrors({}); }}
                className="text-primary font-semibold"
                data-testid="button-switch-mode"
              >
                {mode === "login" ? "Sign Up" : "Log In"}
              </button>
            </p>
          </div>

          <div className="mt-6 flex justify-center gap-4 text-xs text-muted-foreground">
            <Link href="/privacy" className="hover:text-foreground" data-testid="link-privacy">Privacy Policy</Link>
            <span>·</span>
            <Link href="/contact" className="hover:text-foreground" data-testid="link-contact">Contact Us</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
