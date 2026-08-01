import { useState } from "react";
import { ArrowLeft, Home, Eye, Calendar, Star, AlertTriangle, CheckCircle2, Clock, ChevronRight, BarChart3, ShieldCheck, EyeOff } from "lucide-react";
import { Link } from "wouter";
import { useGetOwnerDashboard, getGetOwnerDashboardQueryKey } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";

function StatCard({ label, value, sub, icon, color }: { label: string; value: string | number; sub?: string; icon: React.ReactNode; color: string }) {
  return (
    <div className={`rounded-2xl border p-4 flex gap-3 items-start ${color}`}>
      <div className="mt-0.5 shrink-0">{icon}</div>
      <div>
        <p className="text-2xl font-bold text-foreground leading-tight">{value}</p>
        <p className="text-xs text-muted-foreground font-medium">{label}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={11}
          className={s <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "fill-muted text-muted"}
        />
      ))}
    </div>
  );
}

export function OwnerDashboard() {
  const { user } = useAuth();
  const [phone, setPhone] = useState("");
  const [submittedPhone, setSubmittedPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");

  const { data: dashboard, isLoading, error } = useGetOwnerDashboard(submittedPhone, {
    query: { enabled: submittedPhone.length === 10, queryKey: getGetOwnerDashboardQueryKey(submittedPhone) },
  });

  function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    if (phone.length !== 10) { setPhoneError("Enter a valid 10-digit number"); return; }
    setPhoneError("");
    setSubmittedPhone(phone);
  }

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background pb-10">
      <div className="bg-gradient-to-br from-indigo-700 via-primary to-violet-600 px-5 pt-12 pb-8 text-white">
        <Link href="/" data-testid="button-back" className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm mb-6">
          <ArrowLeft size={18} />
          Back
        </Link>
        <div className="flex items-center gap-3 mb-1">
          <BarChart3 size={22} className="text-white/90" />
          <h1 className="text-2xl font-bold">Owner Dashboard</h1>
        </div>
        <p className="text-white/75 text-sm">Track your listings, visits and ratings</p>
      </div>

      <div className="px-5 pt-5">
        {/* Phone lookup */}
        {!submittedPhone && (
          <form onSubmit={handleLookup} className="space-y-3 mb-6">
            <p className="text-sm text-muted-foreground">Enter the phone number you used when listing your property.</p>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">+91</span>
              <input
                type="tel"
                maxLength={10}
                placeholder="10-digit phone"
                value={phone}
                onChange={(e) => { setPhone(e.target.value.replace(/\D/g, "")); setPhoneError(""); }}
                className={`w-full pl-12 pr-4 py-3 rounded-xl bg-card border text-sm outline-none focus:ring-2 focus:ring-primary/40 transition ${phoneError ? "border-destructive" : "border-border"}`}
              />
            </div>
            {phoneError && <p className="text-destructive text-xs">{phoneError}</p>}
            <button type="submit" className="w-full bg-primary text-white font-semibold py-3 rounded-xl text-sm active:scale-[0.98] transition">
              View My Dashboard
            </button>
          </form>
        )}

        {submittedPhone && (
          <button
            onClick={() => { setSubmittedPhone(""); setPhone(""); }}
            className="mb-4 text-xs text-primary font-medium flex items-center gap-1"
          >
            ← Switch Phone Number
          </button>
        )}

        {isLoading && (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 text-center">
            <p className="text-sm text-destructive">Could not load dashboard. Check the phone number.</p>
          </div>
        )}

        {dashboard && (
          <div className="space-y-5">
            {/* Summary Stats */}
            <div className="grid grid-cols-2 gap-3">
              <StatCard
                label="Active Listings"
                value={dashboard.activeListings}
                sub={`of ${dashboard.totalListings} total`}
                icon={<Home size={18} className="text-primary" />}
                color="bg-primary/5 border-primary/15"
              />
              <StatCard
                label="Total Views"
                value={dashboard.totalViews}
                sub="across all listings"
                icon={<Eye size={18} className="text-blue-500" />}
                color="bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-900"
              />
              <StatCard
                label="Visit Requests"
                value={dashboard.totalVisits}
                sub={`${dashboard.pendingVisits} pending`}
                icon={<Calendar size={18} className="text-amber-500" />}
                color="bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-900"
              />
              <StatCard
                label="Avg Rating"
                value={dashboard.avgRating > 0 ? dashboard.avgRating.toFixed(1) : "—"}
                sub={dashboard.avgRating > 0 ? "out of 5" : "No reviews yet"}
                icon={<Star size={18} className="text-amber-400" />}
                color="bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-900"
              />
            </div>

            {/* Visit Status Bar */}
            {dashboard.totalVisits > 0 && (
              <div className="bg-card border border-border rounded-2xl p-4">
                <h3 className="text-sm font-bold mb-3">Visit Breakdown</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-amber-500" />
                      <span className="text-sm text-muted-foreground">Pending</span>
                    </div>
                    <span className="font-semibold text-sm">{dashboard.pendingVisits}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-success" />
                      <span className="text-sm text-muted-foreground">Confirmed</span>
                    </div>
                    <span className="font-semibold text-sm">{dashboard.confirmedVisits}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden mt-1">
                    <div
                      className="h-full bg-success rounded-full transition-all"
                      style={{ width: `${(dashboard.confirmedVisits / dashboard.totalVisits) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground text-right">
                    {Math.round((dashboard.confirmedVisits / dashboard.totalVisits) * 100)}% confirmed
                  </p>
                </div>
              </div>
            )}

            {/* Per-listing breakdown */}
            <div>
              <h3 className="text-sm font-bold mb-3">Your Listings</h3>
              {dashboard.listings.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No listings found for this phone number.
                </div>
              ) : (
                <div className="space-y-3">
                  {dashboard.listings.map((listing) => (
                    <div key={listing.id} className="bg-card border border-border rounded-2xl p-4 space-y-3">
                      {/* Listing header */}
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate">{listing.name}</p>
                          <p className="text-xs text-muted-foreground">{listing.area} · {listing.type} · ₹{listing.rent.toLocaleString()}/mo</p>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          {listing.isHidden ? (
                            <span className="inline-flex items-center gap-1 text-[10px] bg-muted text-muted-foreground rounded-full px-2 py-0.5">
                              <EyeOff size={9} /> Hidden
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] bg-success/10 text-success rounded-full px-2 py-0.5">
                              <CheckCircle2 size={9} /> Active
                            </span>
                          )}
                          {listing.verificationStatus === "aadhaar_verified" && (
                            <span className="inline-flex items-center gap-1 text-[10px] bg-primary/10 text-primary rounded-full px-2 py-0.5">
                              <ShieldCheck size={9} /> Verified
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Stats row */}
                      <div className="grid grid-cols-4 gap-2 text-center">
                        <div className="bg-muted/50 rounded-xl py-2">
                          <p className="text-sm font-bold">{listing.visitCount}</p>
                          <p className="text-[10px] text-muted-foreground">Views</p>
                        </div>
                        <div className="bg-muted/50 rounded-xl py-2">
                          <p className="text-sm font-bold text-amber-500">{listing.pendingVisits}</p>
                          <p className="text-[10px] text-muted-foreground">Pending</p>
                        </div>
                        <div className="bg-muted/50 rounded-xl py-2">
                          <p className="text-sm font-bold text-success">{listing.confirmedVisits}</p>
                          <p className="text-[10px] text-muted-foreground">Confirmed</p>
                        </div>
                        <div className="bg-muted/50 rounded-xl py-2">
                          {listing.rating > 0 ? (
                            <>
                              <p className="text-sm font-bold">{listing.rating.toFixed(1)}</p>
                              <div className="flex justify-center mt-0.5">
                                <RatingStars rating={listing.rating} />
                              </div>
                            </>
                          ) : (
                            <>
                              <p className="text-sm font-bold text-muted-foreground">—</p>
                              <p className="text-[10px] text-muted-foreground">Rating</p>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Fraud warning */}
                      {listing.fraudReportCount > 0 && (
                        <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/20 rounded-xl px-3 py-2">
                          <AlertTriangle size={13} className="text-destructive shrink-0" />
                          <p className="text-xs text-destructive font-medium">
                            {listing.fraudReportCount} fraud report{listing.fraudReportCount > 1 ? "s" : ""} filed
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tips */}
            <div className="bg-primary/5 border border-primary/15 rounded-2xl p-4">
              <h4 className="text-sm font-bold text-primary mb-2">Tips to Get More Visits</h4>
              <ul className="space-y-1.5 text-xs text-muted-foreground">
                <li className="flex items-start gap-2"><span className="text-primary shrink-0">•</span>Complete Aadhaar verification to get the green verified badge</li>
                <li className="flex items-start gap-2"><span className="text-primary shrink-0">•</span>Add high-quality photos — listings with 3+ photos get 3× more visits</li>
                <li className="flex items-start gap-2"><span className="text-primary shrink-0">•</span>Enable Escrow Pay to build trust with buyers</li>
                <li className="flex items-start gap-2"><span className="text-primary shrink-0">•</span>Reply to reviews to show you are an active and responsive owner</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
