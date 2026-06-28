import { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, Mail, Phone, MapPin, MessageSquare, Clock, CheckCircle } from "lucide-react";

export function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const subjects = [
    "Report a Fraud Listing",
    "Listing Verification Issue",
    "Escrow / Payment Issue",
    "Account & Login Help",
    "Account Deletion Request",
    "Feedback & Suggestions",
    "Other",
  ];

  function validate() {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = "Valid email is required";
    if (!form.subject) e.subject = "Please select a subject";
    if (!form.message.trim() || form.message.length < 20) e.message = "Message must be at least 20 characters";
    return e;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setLoading(true);
    setTimeout(() => { setLoading(false); setSent(true); }, 1200);
  }

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background pb-10">
      <div className="bg-secondary px-5 pt-12 pb-8 text-white">
        <Link href="/" data-testid="button-back" className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm mb-6">
          <ArrowLeft size={18} />
          Back
        </Link>
        <div className="flex items-center gap-3 mb-2">
          <MessageSquare size={24} className="text-primary" />
          <h1 className="text-2xl font-bold">Contact Us</h1>
        </div>
        <p className="text-white/70 text-sm">We're here to help. Reach out any time.</p>
      </div>

      <div className="px-5 pt-6 space-y-3">
        <a
          href="tel:+919696149694"
          data-testid="link-phone"
          className="flex items-center gap-4 bg-card border border-border rounded-2xl p-4 active:scale-[0.98] transition"
        >
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Phone size={20} className="text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Call / WhatsApp</p>
            <p className="text-sm font-semibold text-foreground">+91 96961 49694</p>
          </div>
        </a>

        <a
          href="mailto:mishra250zxclp@gmail.com"
          data-testid="link-email"
          className="flex items-center gap-4 bg-card border border-border rounded-2xl p-4 active:scale-[0.98] transition"
        >
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Mail size={20} className="text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Email Support</p>
            <p className="text-sm font-semibold text-foreground">mishra250zxclp@gmail.com</p>
          </div>
        </a>

        <div className="flex items-center gap-4 bg-card border border-border rounded-2xl p-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Clock size={20} className="text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Support Hours</p>
            <p className="text-sm font-semibold text-foreground">Mon – Sat, 9 AM – 7 PM</p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-card border border-border rounded-2xl p-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <MapPin size={20} className="text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Based In</p>
            <p className="text-sm font-semibold text-foreground">New Delhi, India</p>
          </div>
        </div>
      </div>

      <div className="px-5 mt-5">
        <div className="border-t border-border pt-5">
          <h2 className="font-bold text-foreground text-base mb-4">Send Us a Message</h2>

          {!sent ? (
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5" htmlFor="contact-name">Your Name</label>
                <input
                  id="contact-name"
                  type="text"
                  placeholder="Full name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  data-testid="input-contact-name"
                  className={`w-full px-4 py-3 rounded-xl bg-card border text-sm outline-none focus:ring-2 focus:ring-primary/40 transition ${errors.name ? "border-destructive" : "border-border"}`}
                />
                {errors.name && <p className="text-destructive text-xs mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5" htmlFor="contact-email">Email Address</label>
                <input
                  id="contact-email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  data-testid="input-contact-email"
                  className={`w-full px-4 py-3 rounded-xl bg-card border text-sm outline-none focus:ring-2 focus:ring-primary/40 transition ${errors.email ? "border-destructive" : "border-border"}`}
                />
                {errors.email && <p className="text-destructive text-xs mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5" htmlFor="contact-subject">Subject</label>
                <select
                  id="contact-subject"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  data-testid="select-subject"
                  className={`w-full px-4 py-3 rounded-xl bg-card border text-sm outline-none focus:ring-2 focus:ring-primary/40 transition appearance-none ${errors.subject ? "border-destructive" : "border-border"}`}
                >
                  <option value="">Select a subject...</option>
                  {subjects.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                {errors.subject && <p className="text-destructive text-xs mt-1">{errors.subject}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5" htmlFor="contact-message">Message</label>
                <textarea
                  id="contact-message"
                  rows={4}
                  placeholder="Describe your issue or question in detail..."
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value.slice(0, 500) })}
                  data-testid="textarea-message"
                  className={`w-full px-4 py-3 rounded-xl bg-card border text-sm outline-none focus:ring-2 focus:ring-primary/40 transition resize-none ${errors.message ? "border-destructive" : "border-border"}`}
                />
                <div className="flex justify-between mt-1">
                  {errors.message ? <p className="text-destructive text-xs">{errors.message}</p> : <span />}
                  <p className="text-xs text-muted-foreground">{form.message.length} / 500</p>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                data-testid="button-send-message"
                className="w-full bg-primary text-white font-semibold py-3.5 rounded-xl transition active:scale-[0.98] disabled:opacity-60 text-sm"
              >
                {loading ? "Sending..." : "Send Message"}
              </button>
            </form>
          ) : (
            <div className="flex flex-col items-center justify-center pt-6 text-center">
              <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mb-4">
                <CheckCircle size={36} className="text-success" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">Message Sent!</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                Thank you for reaching out. We will get back to you within 1–2 business days at{" "}
                <strong className="text-foreground">{form.email}</strong>.
              </p>
              <button
                type="button"
                onClick={() => { setSent(false); setForm({ name: "", email: "", subject: "", message: "" }); }}
                data-testid="button-send-another"
                className="w-full border border-border bg-card text-foreground font-semibold py-3 rounded-xl text-sm active:scale-[0.98] transition"
              >
                Send Another Message
              </button>
            </div>
          )}
        </div>

        <div className="mt-6 text-center pb-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} DelhiGhar. All rights reserved.
          </p>
          <Link href="/privacy" className="text-xs text-primary mt-1 block" data-testid="link-privacy">
            Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  );
}
