import { useState, useEffect, useRef } from "react";
import { useLocation, Link } from "wouter";
import { ShieldCheck, ArrowLeft, RefreshCw, Phone, Mail } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useSendOtp, useVerifyOtp } from "@workspace/api-client-react";

type Step = "details" | "otp";
type Mode = "login" | "signup";

export function Login() {
  const { login, isLoggedIn } = useAuth();
  const [, setLocation] = useLocation();
  const sendOtpMutation = useSendOtp();
  const verifyOtpMutation = useVerifyOtp();

  const [mode, setMode] = useState<Mode>("login");
  const [step, setStep] = useState<Step>("details");
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [otp, setOtp] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [sentMessage, setSentMessage] = useState("");

  const [resendTimer, setResendTimer] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isLoggedIn) setLocation("/");
  }, [isLoggedIn]);

  useEffect(() => {
    if (resendTimer > 0) {
      timerRef.current = setInterval(() => setResendTimer((t) => t - 1), 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [resendTimer]);

  function validateDetails() {
    const e: Record<string, string> = {};
    if (mode === "signup" && !form.name.trim()) e.name = "Full name is required";
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email address";
    if (!form.phone || form.phone.length !== 10) e.phone = "Enter a valid 10-digit phone number";
    return e;
  }

  function handleSendOtp() {
    const errs = validateDetails();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});

    sendOtpMutation.mutate(
      { data: { phone: form.phone, email: form.email, name: form.name || undefined } },
      {
        onSuccess: (data) => {
          setStep("otp");
          setSentMessage(data.message || "OTP sent");
          setDevOtp(data.devOtp ?? null);
          setResendTimer(60);
        },
        onError: (err: unknown) => {
          const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
            || "Could not send OTP. Please try again.";
          setErrors({ submit: msg });
        },
      }
    );
  }

  function handleVerifyOtp() {
    if (!otp || otp.length !== 6) { setErrors({ otp: "Enter the 6-digit OTP" }); return; }
    setErrors({});

    verifyOtpMutation.mutate(
      { data: { phone: form.phone, email: form.email, otp, name: form.name || undefined } },
      {
        onSuccess: (data) => {
          login({ name: data.user.name, email: data.user.email, phone: data.user.phone });
          setLocation("/");
        },
        onError: (err: unknown) => {
          const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
            || "Wrong OTP. Please try again.";
          setErrors({ otp: msg });
        },
      }
    );
  }

  function handleResend() {
    if (resendTimer > 0) return;
    setOtp("");
    setDevOtp(null);
    setErrors({});
    sendOtpMutation.mutate(
      { data: { phone: form.phone, email: form.email, name: form.name || undefined } },
      {
        onSuccess: (data) => {
          setDevOtp(data.devOtp ?? null);
          setResendTimer(60);
          setSentMessage(data.message || "OTP resent");
        },
        onError: () => setErrors({ otp: "Could not resend OTP. Please wait a moment." }),
      }
    );
  }

  function switchMode(m: Mode) {
    setMode(m);
    setErrors({});
    setStep("details");
    setOtp("");
    setDevOtp(null);
  }

  if (step === "otp") {
    return (
      <div className="min-h-[100dvh] flex flex-col bg-background">
        <div className="bg-secondary px-5 pt-14 pb-10 text-white text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <ShieldCheck size={32} className="text-primary" />
            <span className="text-2xl font-bold tracking-tight">Mera PG</span>
          </div>
          <p className="text-white/70 text-sm">Zero broker. Real homes. Safe deals.</p>
        </div>

        <div className="flex-1 px-5 pt-6 pb-8">
          <button
            onClick={() => { setStep("details"); setOtp(""); setDevOtp(null); setErrors({}); }}
            className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6 hover:text-foreground transition-colors"
          >
            <ArrowLeft size={15} /> Back
          </button>

          <h2 className="text-xl font-bold text-foreground mb-1">Verify your number</h2>
          <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{sentMessage}</p>

          <div className="flex items-center gap-3 bg-primary/8 border border-primary/20 rounded-xl px-4 py-3 mb-2">
            <Phone size={15} className="text-primary shrink-0" />
            <span className="text-sm text-foreground font-medium">+91 {form.phone}</span>
          </div>
          <div className="flex items-center gap-3 bg-primary/8 border border-primary/20 rounded-xl px-4 py-3 mb-6">
            <Mail size={15} className="text-primary shrink-0" />
            <span className="text-sm text-foreground font-medium truncate">{form.email}</span>
          </div>

          {devOtp && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-4 flex items-start gap-2">
              <span className="text-amber-600 text-xs font-bold mt-0.5">DEV</span>
              <div>
                <p className="text-amber-800 text-xs font-semibold">Email/SMS not configured</p>
                <p className="text-amber-700 text-xs mt-0.5">Your OTP: <strong className="text-lg tracking-widest font-mono">{devOtp}</strong></p>
              </div>
            </div>
          )}

          <label className="block text-sm font-semibold text-foreground mb-3">
            Enter 6-digit OTP
          </label>

          <div className="flex gap-2 justify-center mb-2">
            {[0,1,2,3,4,5].map((i) => (
              <input
                key={i}
                type="tel"
                inputMode="numeric"
                maxLength={1}
                value={otp[i] || ""}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "");
                  const arr = otp.split("");
                  arr[i] = val;
                  const next = arr.join("").slice(0, 6);
                  setOtp(next);
                  setErrors({});
                  if (val && i < 5) {
                    const nextInput = document.getElementById(`otp-${i + 1}`);
                    nextInput?.focus();
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Backspace" && !otp[i] && i > 0) {
                    document.getElementById(`otp-${i - 1}`)?.focus();
                  }
                }}
                onPaste={(e) => {
                  const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
                  if (pasted) { setOtp(pasted); e.preventDefault(); }
                }}
                id={`otp-${i}`}
                className={`w-11 h-14 text-center text-2xl font-bold rounded-xl border bg-card outline-none transition focus:ring-2 focus:ring-primary/40 focus:border-primary ${
                  errors.otp ? "border-destructive" : "border-border"
                }`}
              />
            ))}
          </div>

          {errors.otp && (
            <p className="text-destructive text-xs text-center mt-1 mb-3">{errors.otp}</p>
          )}

          <button
            onClick={handleVerifyOtp}
            disabled={verifyOtpMutation.isPending || otp.length < 6}
            className="w-full bg-primary text-white font-semibold py-3.5 rounded-xl mt-4 transition active:scale-[0.98] disabled:opacity-60 text-sm"
          >
            {verifyOtpMutation.isPending ? "Verifying..." : "Verify & Login"}
          </button>

          <div className="flex items-center justify-center gap-2 mt-5">
            <span className="text-sm text-muted-foreground">Didn't get it?</span>
            {resendTimer > 0 ? (
              <span className="text-sm text-muted-foreground font-medium">Resend in {resendTimer}s</span>
            ) : (
              <button
                onClick={handleResend}
                disabled={sendOtpMutation.isPending}
                className="flex items-center gap-1.5 text-sm text-primary font-semibold hover:underline disabled:opacity-50"
              >
                <RefreshCw size={13} />
                {sendOtpMutation.isPending ? "Sending..." : "Resend OTP"}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      <div className="bg-secondary px-5 pt-14 pb-10 text-white text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <ShieldCheck size={32} className="text-primary" />
          <span className="text-2xl font-bold tracking-tight">Mera PG</span>
        </div>
        <p className="text-white/70 text-sm">Zero broker. Real homes. Safe deals.</p>
      </div>

      <div className="flex-1 px-5 pt-6 pb-8">
        <div className="flex rounded-xl bg-muted p-1 mb-6">
          <button
            type="button"
            onClick={() => switchMode("login")}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${mode === "login" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => switchMode("signup")}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${mode === "signup" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}
          >
            Sign Up
          </button>
        </div>

        <div className="space-y-4">
          {mode === "signup" && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Full Name</label>
              <input
                type="text"
                autoComplete="name"
                placeholder="Enter your full name"
                value={form.name}
                onChange={(e) => { setForm({ ...form, name: e.target.value }); setErrors({}); }}
                className={`w-full px-4 py-3 rounded-xl bg-card border text-sm outline-none focus:ring-2 focus:ring-primary/40 transition ${errors.name ? "border-destructive" : "border-border"}`}
              />
              {errors.name && <p className="text-destructive text-xs mt-1">{errors.name}</p>}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Email Address</label>
            <input
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => { setForm({ ...form, email: e.target.value }); setErrors({}); }}
              className={`w-full px-4 py-3 rounded-xl bg-card border text-sm outline-none focus:ring-2 focus:ring-primary/40 transition ${errors.email ? "border-destructive" : "border-border"}`}
            />
            {errors.email && <p className="text-destructive text-xs mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Phone Number</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">+91</span>
              <input
                type="tel"
                autoComplete="tel"
                placeholder="9876543210"
                maxLength={10}
                value={form.phone}
                onChange={(e) => { setForm({ ...form, phone: e.target.value.replace(/\D/g, "") }); setErrors({}); }}
                onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
                className={`w-full pl-12 pr-4 py-3 rounded-xl bg-card border text-sm outline-none focus:ring-2 focus:ring-primary/40 transition ${errors.phone ? "border-destructive" : "border-border"}`}
              />
            </div>
            {errors.phone && <p className="text-destructive text-xs mt-1">{errors.phone}</p>}
          </div>

          {errors.submit && (
            <p className="text-destructive text-xs bg-destructive/8 border border-destructive/20 rounded-xl px-3 py-2">
              {errors.submit}
            </p>
          )}

          <button
            onClick={handleSendOtp}
            disabled={sendOtpMutation.isPending}
            className="w-full bg-primary text-white font-semibold py-3.5 rounded-xl mt-2 transition active:scale-[0.98] disabled:opacity-60 text-sm"
          >
            {sendOtpMutation.isPending ? "Sending OTP..." : "Send OTP"}
          </button>

          <p className="text-xs text-muted-foreground text-center pt-1 leading-relaxed">
            OTP will be sent to your phone &amp; email for verification
          </p>
        </div>

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
              onClick={() => switchMode(mode === "login" ? "signup" : "login")}
              className="text-primary font-semibold"
            >
              {mode === "login" ? "Sign Up" : "Log In"}
            </button>
          </p>
        </div>

        <div className="mt-6 flex justify-center gap-4 text-xs text-muted-foreground">
          <Link href="/privacy" className="hover:text-foreground">Privacy Policy</Link>
          <span>·</span>
          <Link href="/contact" className="hover:text-foreground">Contact Us</Link>
        </div>
      </div>
    </div>
  );
}
