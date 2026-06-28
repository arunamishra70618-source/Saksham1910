import { X, ShieldCheck, BadgeCheck, MapPin, Phone, AlertTriangle, Calendar, CreditCard, ShieldAlert } from "lucide-react";
import { useGetListing, getGetListingQueryKey, useRevealPhone, useScheduleVisit } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export function ListingDetailSheet({ id, onClose }: { id: string; onClose: () => void }) {
  const { data: listing, isLoading } = useGetListing(id, { query: { enabled: !!id, queryKey: getGetListingQueryKey(id) } });
  const revealMutation = useRevealPhone();
  const visitMutation = useScheduleVisit();
  const { toast } = useToast();

  const [phoneRevealed, setPhoneRevealed] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");

  if (isLoading || !listing) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-muted-foreground">Loading details...</p>
        </div>
      </div>
    );
  }

  const handleRevealPhone = () => {
    revealMutation.mutate({
      id,
      data: { userId: "user123" }
    }, {
      onSuccess: (res) => {
        setPhoneNumber(res.phone);
        setPhoneRevealed(true);
      }
    });
  };

  const handleScheduleVisit = () => {
    // Mock simple schedule
    visitMutation.mutate({
      data: {
        listingId: id,
        buyerName: "User",
        buyerPhone: "9876543210",
        visitDate: new Date().toISOString(),
        userId: "user123"
      }
    }, {
      onSuccess: () => toast({ title: "Visit Scheduled!" })
    });
  };

  const isAadhaarVerified = listing.verificationStatus === "aadhaar_verified";
  const isPhoneVerified = listing.verificationStatus === "phone_verified" || isAadhaarVerified;

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col animate-in slide-in-from-bottom-full duration-300">
      <div className="sticky top-0 bg-background/80 backdrop-blur z-10 p-4 border-b flex items-center justify-between">
        <h2 className="font-bold text-lg truncate pr-4">{listing.name}</h2>
        <Button variant="ghost" size="icon" onClick={onClose} className="shrink-0"><X /></Button>
      </div>

      <div className="flex-1 overflow-y-auto pb-[100px]">
        {/* Photos Placeholder */}
        <div className="w-full h-64 bg-muted flex items-center justify-center text-muted-foreground">
          {listing.photos?.length > 0 ? "Photos Carousel" : "No Photos"}
        </div>

        <div className="p-4 space-y-6">
          {/* Header */}
          <div>
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold">{listing.name}</h1>
                <p className="text-muted-foreground flex items-center mt-1"><MapPin className="w-4 h-4 mr-1"/> {listing.area}, {listing.landmark}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">₹{listing.rent}</div>
                <div className="text-sm text-muted-foreground">Deposit: ₹{listing.deposit}</div>
              </div>
            </div>
            <div className="mt-2">
              <Badge variant="secondary">{listing.type} • {listing.roomType}</Badge>
              <Badge variant="secondary" className="ml-2">{listing.gender}</Badge>
            </div>
          </div>

          {/* Trust Panel */}
          <div className="bg-card border rounded-xl overflow-hidden">
            <div className="bg-secondary/5 p-3 font-semibold text-sm border-b">Trust & Verification Panel</div>
            <div className="divide-y text-sm">
              <div className="p-3 flex justify-between items-center">
                <span>📱 Phone OTP Verified</span>
                {isPhoneVerified ? <span className="text-success flex items-center"><ShieldCheck className="w-4 h-4 mr-1"/> Yes</span> : <span className="text-destructive">❌ No</span>}
              </div>
              <div className="p-3 flex justify-between items-center">
                <span>🪪 Aadhaar Verified</span>
                {isAadhaarVerified ? <span className="text-success flex items-center"><ShieldCheck className="w-4 h-4 mr-1"/> Yes</span> : <span className="text-muted-foreground">⬜ No</span>}
              </div>
              <div className="p-3 flex justify-between items-center">
                <span>🏠 Visits Confirmed</span>
                <span className="font-medium">{listing.visitCount} visits</span>
              </div>
              <div className="p-3 flex justify-between items-center">
                <span>🛡️ Escrow Available</span>
                {listing.escrowEnabled ? <span className="text-success font-medium">Yes</span> : <span>No</span>}
              </div>
              <div className="p-3 flex justify-between items-center">
                <span>🚨 Fraud Reports</span>
                <span className={listing.fraudReportCount > 0 ? "text-destructive font-bold flex items-center" : "text-muted-foreground"}>
                  {listing.fraudReportCount > 0 && <AlertTriangle className="w-4 h-4 mr-1"/>}
                  {listing.fraudReportCount}
                </span>
              </div>
            </div>
          </div>

          {/* Details */}
          <div>
            <h3 className="font-bold mb-3">Amenities</h3>
            <div className="flex flex-wrap gap-2">
              {listing.amenities.map(a => (
                <Badge key={a} variant="secondary" className="bg-muted text-foreground">{a}</Badge>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-bold mb-3">Rules</h3>
            <div className="grid grid-cols-2 gap-4 text-sm bg-muted/50 p-4 rounded-xl">
              <div><span className="text-muted-foreground block text-xs">Curfew</span>{listing.curfewTime}</div>
              <div><span className="text-muted-foreground block text-xs">Guest Policy</span>{listing.guestPolicy}</div>
              <div><span className="text-muted-foreground block text-xs">Smoking</span>{listing.smokingAllowed ? 'Allowed' : 'No'}</div>
              <div><span className="text-muted-foreground block text-xs">Non-Veg</span>{listing.nonVegAllowed ? 'Allowed' : 'No'}</div>
            </div>
          </div>

          {/* Safety Tips */}
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-xl p-4 text-sm">
            <h4 className="font-bold text-amber-800 dark:text-amber-500 mb-2 flex items-center">
              <ShieldAlert className="w-4 h-4 mr-2" /> Safety Tips
            </h4>
            <ul className="list-disc pl-5 space-y-1 text-amber-700 dark:text-amber-400/80">
              <li>Never pay advance money without visiting the property.</li>
              <li>Check Aadhaar verified badge.</li>
              <li>Use Escrow payment for token money.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Action Buttons - Fixed Bottom */}
      <div className="fixed bottom-0 w-full max-w-[480px] bg-background border-t p-4 grid grid-cols-2 gap-3 pb-safe z-20">
        <Button onClick={handleScheduleVisit} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
          <Calendar className="w-4 h-4 mr-2" /> Visit
        </Button>
        <Button 
          variant={phoneRevealed ? "outline" : "secondary"} 
          onClick={handleRevealPhone} 
          disabled={phoneRevealed || revealMutation.isPending}
        >
          <Phone className="w-4 h-4 mr-2" />
          {phoneRevealed ? phoneNumber : "Show Number"}
        </Button>
        {listing.escrowEnabled && (
          <Button variant="outline" className="w-full border-primary text-primary col-span-2">
            <CreditCard className="w-4 h-4 mr-2" /> Safe Token Pay
          </Button>
        )}
      </div>
    </div>
  );
}
