import { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, Mail, CheckCircle } from "lucide-react";

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }
    setError("");
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 1200);
  }

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      <div className="bg-secondary px-5 pt-12 pb-8 text-white">
        <Link href="/login" data-testid="button-back" className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm mb-6">
          <ArrowLeft size={18} />
          Back to Login
        </Link>
        <h1 className="text-2xl font-bold">Forgot Password?</h1>
        <p className="text-white/70 text-sm mt-1">No worries, we'll send you reset instructions.</p>
      </div>

      <div className="flex-1 px-5 pt-8 pb-8">
        {!sent ? (
          <>
            <div className="bg-card border border-border rounded-2xl p-5 mb-6">
              <div className="flex items-start gap-3">
                <Mail size={20} className="text-primary mt-0.5 shrink-0" />
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Enter the email address associated with your PG.com account. We'll send you a link to reset your password.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5" htmlFor="reset-email">
                  Email Address
                </label>
                <input
                  id="reset-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  data-testid="input-reset-email"
                  className={`w-full px-4 py-3 rounded-xl bg-card border text-sm outline-none focus:ring-2 focus:ring-primary/40 transition ${error ? "border-destructive" : "border-border"}`}
                />
                {error && <p className="text-destructive text-xs mt-1">{error}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                data-testid="button-send-reset"
                className="w-full bg-primary text-white font-semibold py-3.5 rounded-xl transition active:scale-[0.98] disabled:opacity-60 text-sm"
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Remember your password?{" "}
                <Link href="/login" className="text-primary font-semibold" data-testid="link-back-login">
                  Log In
                </Link>
              </p>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center pt-10 text-center px-4">
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mb-4">
              <CheckCircle size={36} className="text-success" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">Check your inbox!</h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-1">
              We've sent a password reset link to
            </p>
            <p className="text-sm font-semibold text-primary mb-6">{email}</p>
            <p className="text-xs text-muted-foreground leading-relaxed mb-8">
              Didn't receive the email? Check your spam folder or try again with a different email address.
            </p>
            <button
              type="button"
              onClick={() => { setSent(false); setEmail(""); }}
              data-testid="button-try-again"
              className="w-full border border-border bg-card text-foreground font-semibold py-3 rounded-xl text-sm mb-3 active:scale-[0.98] transition"
            >
              Try a Different Email
            </button>
            <Link
              href="/login"
              data-testid="link-back-to-login"
              className="w-full block text-center bg-primary text-white font-semibold py-3 rounded-xl text-sm active:scale-[0.98] transition"
            >
              Back to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
