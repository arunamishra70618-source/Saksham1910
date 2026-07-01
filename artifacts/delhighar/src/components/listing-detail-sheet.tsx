import { X, ShieldCheck, MapPin, Phone, AlertTriangle, Calendar, CreditCard, ShieldAlert } from "lucide-react";
import { useGetListing, getGetListingQueryKey, useRevealPhone } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, lazy, Suspense } from "react";
import { useToast } from "@/hooks/use-toast";
import { ScheduleVisitSheet } from "@/components/schedule-visit-sheet";
import { ReviewsSection } from "@/components/reviews-section";

const PropertyMap = lazy(() =>
  import("@/components/property-map").then((m) => ({ default: m.PropertyMap }))
);

export function ListingDetailSheet({ id, onClose }: { id: string; onClose: () => void }) {
  const { data: listing, isLoading } = useGetListing(id, {
    query: { enabled: !!id, queryKey: getGetListingQueryKey(id) },
  });
  const revealMutation = useRevealPhone();
  const { toast } = useToast();

  const [phoneRevealed, setPhoneRevealed] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showVisitSheet, setShowVisitSheet] = useState(false);

  if (isLoading || !listing) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground text-sm">Loading details...</p>
        </div>
      </div>
    );
  }

  const handleRevealPhone = () => {
    revealMutation.mutate(
      { id, data: { userId: "user123" } },
      {
        onSuccess: (res) => {
          setPhoneNumber(res.phone);
          setPhoneRevealed(true);
        },
      }
    );
  };

  const isAadhaarVerified = listing.verificationStatus === "aadhaar_verified";
  const isPhoneVerified = listing.verificationStatus === "phone_verified" || isAadhaarVerified;

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col animate-in slide-in-from-bottom-full duration-300">
      <div className="sticky top-0 bg-background/90 backdrop-blur z-10 p-4 border-b flex items-center gap-3">
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-xl bg-muted text-muted-foreground hover:text-foreground transition shrink-0 active:scale-90"
        >
          <X size={18} />
        </button>
        <h2 className="font-bold text-base truncate">{listing.name}</h2>
      </div>

      <div className="flex-1 overflow-y-auto pb-[120px]">
        {/* Photos placeholder */}
        <div className="w-full h-52 bg-gradient-to-br from-muted to-muted/60 flex items-center justify-center text-muted-foreground">
          {listing.photos?.length > 0 ? (
            <img src={listing.photos[0]} className="w-full h-full object-cover" alt={listing.name} />
          ) : (
            <div className="flex flex-col items-center gap-2 opacity-50">
              <MapPin size={32} />
              <span className="text-sm">No photos available</span>
            </div>
          )}
        </div>

        <div className="p-4 space-y-5">
          {/* Header */}
          <div>
            <div className="flex justify-between items-start gap-3">
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-bold text-foreground leading-tight">{listing.name}</h1>
                <p className="text-muted-foreground flex items-center gap-1 mt-1 text-sm">
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  {listing.area}, {listing.landmark}
                </p>
              </div>
              <div className="text-right shrink-0">
                <div className="text-xl font-bold text-primary">
                  ₹{listing.rent.toLocaleString()}
                  <span className="text-sm font-normal text-muted-foreground">/mo</span>
                </div>
                <div className="text-xs text-muted-foreground">Dep: ₹{listing.deposit.toLocaleString()}</div>
              </div>
            </div>
            <div className="flex gap-2 mt-2 flex-wrap">
              <Badge variant="secondary" className="text-xs">{listing.type} · {listing.roomType}</Badge>
              <Badge variant="secondary" className="text-xs">{listing.gender}</Badge>
            </div>
          </div>

          {/* Trust Panel */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="bg-muted/60 px-4 py-2.5 font-semibold text-sm border-b border-border flex items-center gap-2">
              <ShieldCheck size={14} className="text-primary" />
              Trust & Verification
            </div>
            <div className="divide-y divide-border text-sm">
              <div className="px-4 py-3 flex justify-between items-center">
                <span className="text-muted-foreground">📱 Phone OTP</span>
                {isPhoneVerified ? (
                  <span className="text-success font-semibold flex items-center gap-1"><ShieldCheck size={14} /> Verified</span>
                ) : (
                  <span className="text-muted-foreground">Not verified</span>
                )}
              </div>
              <div className="px-4 py-3 flex justify-between items-center">
                <span className="text-muted-foreground">🪪 Aadhaar</span>
                {isAadhaarVerified ? (
                  <span className="text-success font-semibold flex items-center gap-1"><ShieldCheck size={14} /> Verified</span>
                ) : (
                  <span className="text-muted-foreground">Not verified</span>
                )}
              </div>
              <div className="px-4 py-3 flex justify-between items-center">
                <span className="text-muted-foreground">🏠 Visits Done</span>
                <span className="font-semibold">{listing.visitCount}</span>
              </div>
              <div className="px-4 py-3 flex justify-between items-center">
                <span className="text-muted-foreground">🛡️ Escrow Pay</span>
                {listing.escrowEnabled ? (
                  <span className="text-success font-semibold">Available</span>
                ) : (
                  <span className="text-muted-foreground">Not available</span>
                )}
              </div>
              {listing.fraudReportCount > 0 && (
                <div className="px-4 py-3 flex justify-between items-center bg-destructive/5">
                  <span className="text-destructive font-medium">🚨 Fraud Reports</span>
                  <span className="text-destructive font-bold flex items-center gap-1">
                    <AlertTriangle size={14} /> {listing.fraudReportCount}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Map */}
          <Suspense
            fallback={
              <div className="h-52 bg-muted rounded-2xl flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            }
          >
            <PropertyMap
              lat={listing.lat ?? null}
              lng={listing.lng ?? null}
              name={listing.name}
              area={listing.area}
            />
          </Suspense>

          {/* Amenities */}
          <div>
            <h3 className="font-bold mb-2.5 text-sm">Amenities</h3>
            <div className="flex flex-wrap gap-2">
              {listing.amenities.map((a) => (
                <Badge key={a} variant="secondary" className="bg-muted text-foreground text-xs">
                  {a}
                </Badge>
              ))}
            </div>
          </div>

          {/* Rules */}
          <div>
            <h3 className="font-bold mb-2.5 text-sm">House Rules</h3>
            <div className="grid grid-cols-2 gap-3 text-sm bg-muted/40 p-4 rounded-2xl">
              <div>
                <span className="text-muted-foreground block text-xs mb-0.5">Curfew</span>
                <span className="font-medium">{listing.curfewTime}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs mb-0.5">Guests</span>
                <span className="font-medium">{listing.guestPolicy}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs mb-0.5">Smoking</span>
                <span className="font-medium">{listing.smokingAllowed ? "✅ Allowed" : "❌ No"}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs mb-0.5">Non-Veg</span>
                <span className="font-medium">{listing.nonVegAllowed ? "✅ Allowed" : "❌ No"}</span>
              </div>
            </div>
          </div>

          {/* Reviews */}
          <ReviewsSection listingId={id} hasVisited={true} />

          {/* Safety Tips */}
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 text-sm">
            <h4 className="font-bold text-amber-800 dark:text-amber-400 mb-2 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" /> Safety Tips
            </h4>
            <ul className="list-disc pl-5 space-y-1 text-amber-700 dark:text-amber-500 text-xs">
              <li>Never pay advance without visiting the property first.</li>
              <li>Always check for Aadhaar Verified badge before contacting.</li>
              <li>Use Escrow Pay for token money — full refund if property is fake.</li>
              <li>Meet the owner in a public place for first contact.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Actions */}
      <div className="fixed bottom-0 w-full max-w-[480px] bg-background/95 backdrop-blur border-t p-4 space-y-2 z-20">
        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={() => setShowVisitSheet(true)}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
          >
            <Calendar className="w-4 h-4" />
            Schedule Visit
          </Button>
          <Button
            variant={phoneRevealed ? "outline" : "secondary"}
            onClick={handleRevealPhone}
            disabled={phoneRevealed || revealMutation.isPending}
            className="gap-2"
          >
            <Phone className="w-4 h-4" />
            {phoneRevealed ? phoneNumber : "Show Number"}
          </Button>
        </div>
        {listing.escrowEnabled && (
          <Button variant="outline" className="w-full border-primary text-primary gap-2">
            <CreditCard className="w-4 h-4" /> Pay Securely via Escrow
          </Button>
        )}
      </div>

      {showVisitSheet && (
        <ScheduleVisitSheet
          listingId={id}
          listingName={listing.name}
          onClose={() => setShowVisitSheet(false)}
        />
      )}
    </div>
  );
}
