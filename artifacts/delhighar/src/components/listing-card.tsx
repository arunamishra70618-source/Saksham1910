import { Heart, ShieldCheck, ShieldAlert, BadgeCheck, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Listing } from "@workspace/api-client-react";
import { useSaveListing } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";

export function ListingCard({ listing, isSaved = false, onClick }: { listing: Listing; isSaved?: boolean; onClick?: () => void }) {
  const { toast } = useToast();
  const saveMutation = useSaveListing();

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    saveMutation.mutate({
      id: listing.id,
      data: { userId: "user123", action: isSaved ? "unsave" : "save" }
    }, {
      onSuccess: () => {
        toast({ title: isSaved ? "Listing removed from saved" : "Listing saved! ❤️" });
      }
    });
  };

  const isAadhaarVerified = listing.verificationStatus === "aadhaar_verified";
  const isPhoneVerified = listing.verificationStatus === "phone_verified" || isAadhaarVerified;
  const hasFraud = listing.fraudReportCount > 0;

  let borderClass = "border-l-4 border-l-border";
  if (isAadhaarVerified) borderClass = "border-l-4 border-l-success";
  if (hasFraud) borderClass = "border-l-4 border-l-destructive";

  return (
    <div 
      className={`bg-card rounded-xl p-4 shadow-sm cursor-pointer relative ${borderClass}`}
      onClick={onClick}
      data-testid={`card-listing-${listing.id}`}
    >
      <Button 
        variant="ghost" 
        size="icon" 
        className="absolute top-2 right-2 text-muted-foreground hover:text-destructive z-10"
        onClick={handleSave}
      >
        <Heart className={isSaved ? "fill-destructive text-destructive" : ""} />
      </Button>

      <div className="pr-10">
        <h3 className="font-bold text-lg text-foreground line-clamp-1">{listing.name}</h3>
        <p className="text-sm text-muted-foreground">{listing.area} • {listing.landmark}</p>
        
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          {isAadhaarVerified ? (
            <Badge className="bg-success text-success-foreground border-transparent"><ShieldCheck className="w-3 h-3 mr-1" /> Aadhaar Verified</Badge>
          ) : isPhoneVerified ? (
            <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-transparent"><BadgeCheck className="w-3 h-3 mr-1" /> Phone Verified</Badge>
          ) : (
            <Badge variant="outline" className="text-muted-foreground">⬜ Unverified</Badge>
          )}

          {listing.escrowEnabled && (
            <Badge variant="outline" className="border-primary text-primary"><ShieldCheck className="w-3 h-3 mr-1" /> Escrow Pay</Badge>
          )}
        </div>

        <div className="flex justify-between items-end mt-4">
          <div>
            <div className="text-xl font-bold text-foreground">₹{listing.rent.toLocaleString()}<span className="text-sm font-normal text-muted-foreground">/mo</span></div>
            <div className="text-xs text-muted-foreground">Dep: ₹{listing.deposit.toLocaleString()}</div>
          </div>
          
          <div className="flex gap-1 flex-wrap justify-end max-w-[50%]">
            {listing.amenities.slice(0, 2).map(a => (
              <span key={a} className="text-[10px] bg-muted text-muted-foreground px-2 py-1 rounded-md">{a}</span>
            ))}
            {listing.amenities.length > 2 && (
              <span className="text-[10px] bg-muted text-muted-foreground px-2 py-1 rounded-md">+{listing.amenities.length - 2} more</span>
            )}
          </div>
        </div>

        {hasFraud && (
          <div className="mt-3 text-xs text-destructive flex items-center bg-destructive/10 p-2 rounded">
            <AlertTriangle className="w-4 h-4 mr-1" />
            ⚠️ {listing.fraudReportCount} Fraud Reports
          </div>
        )}
      </div>
    </div>
  );
}