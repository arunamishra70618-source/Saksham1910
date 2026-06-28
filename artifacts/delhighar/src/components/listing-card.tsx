import { useState } from "react";
import { Heart, ShieldCheck, BadgeCheck, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Listing, useSaveListing } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";

export function ListingCard({
  listing,
  isSaved = false,
  onClick,
  index = 0,
}: {
  listing: Listing;
  isSaved?: boolean;
  onClick?: () => void;
  index?: number;
}) {
  const { toast } = useToast();
  const saveMutation = useSaveListing();
  const [saved, setSaved] = useState(isSaved);
  const [heartAnim, setHeartAnim] = useState(false);

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newSaved = !saved;
    setSaved(newSaved);
    setHeartAnim(true);
    setTimeout(() => setHeartAnim(false), 300);
    saveMutation.mutate(
      { id: listing.id, data: { userId: "user123", action: newSaved ? "save" : "unsave" } },
      {
        onSuccess: () => toast({ title: newSaved ? "Saved ❤️" : "Removed from saved" }),
        onError: () => setSaved(!newSaved),
      }
    );
  };

  const isAadhaarVerified = listing.verificationStatus === "aadhaar_verified";
  const isPhoneVerified = listing.verificationStatus === "phone_verified" || isAadhaarVerified;
  const hasFraud = listing.fraudReportCount > 0;

  let accentClass = "border-l-4 border-l-border";
  if (isAadhaarVerified) accentClass = "border-l-4 border-l-success";
  else if (isPhoneVerified) accentClass = "border-l-4 border-l-amber-400";
  if (hasFraud) accentClass = "border-l-4 border-l-destructive";

  return (
    <div
      className={`bg-card rounded-2xl p-4 shadow-sm cursor-pointer relative overflow-hidden
        ${accentClass}
        transition-all duration-200 ease-out
        hover:shadow-md active:scale-[0.985]
        animate-in fade-in slide-in-from-bottom-3`}
      style={{ animationDelay: `${index * 70}ms`, animationFillMode: "both" }}
      onClick={onClick}
      data-testid={`card-listing-${listing.id}`}
    >
      <button
        className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
        onClick={handleSave}
        aria-label={saved ? "Remove from saved" : "Save listing"}
      >
        <Heart
          size={20}
          className={`transition-all duration-200 ${
            heartAnim ? "scale-125" : "scale-100"
          } ${saved ? "fill-destructive text-destructive" : "text-muted-foreground"}`}
        />
      </button>

      <div className="pr-10">
        <h3 className="font-bold text-lg text-foreground line-clamp-1 leading-tight">{listing.name}</h3>
        <p className="text-sm text-muted-foreground mt-0.5">{listing.area} • {listing.landmark}</p>

        <div className="flex items-center gap-2 mt-2.5 flex-wrap">
          {isAadhaarVerified ? (
            <Badge className="bg-success/10 text-success border-success/30 text-xs font-semibold">
              <ShieldCheck className="w-3 h-3 mr-1" /> Aadhaar Verified
            </Badge>
          ) : isPhoneVerified ? (
            <Badge className="bg-amber-100 text-amber-800 border-amber-300 text-xs font-semibold">
              <BadgeCheck className="w-3 h-3 mr-1" /> Phone Verified
            </Badge>
          ) : (
            <Badge variant="outline" className="text-muted-foreground text-xs">⬜ Unverified</Badge>
          )}

          {listing.escrowEnabled && (
            <Badge variant="outline" className="border-primary/40 text-primary text-xs font-semibold">
              <ShieldCheck className="w-3 h-3 mr-1" /> Escrow Pay
            </Badge>
          )}
        </div>

        <div className="flex justify-between items-end mt-4">
          <div>
            <div className="text-xl font-bold text-foreground">
              ₹{listing.rent.toLocaleString()}
              <span className="text-sm font-normal text-muted-foreground">/mo</span>
            </div>
            <div className="text-xs text-muted-foreground">Deposit: ₹{listing.deposit.toLocaleString()}</div>
          </div>

          <div className="flex gap-1 flex-wrap justify-end max-w-[52%]">
            {listing.amenities.slice(0, 2).map((a) => (
              <span key={a} className="text-[10px] bg-muted text-muted-foreground px-2 py-1 rounded-md font-medium">
                {a}
              </span>
            ))}
            {listing.amenities.length > 2 && (
              <span className="text-[10px] bg-muted text-muted-foreground px-2 py-1 rounded-md font-medium">
                +{listing.amenities.length - 2} more
              </span>
            )}
          </div>
        </div>

        {hasFraud && (
          <div className="mt-3 text-xs text-destructive flex items-center gap-1.5 bg-destructive/10 px-3 py-2 rounded-lg font-medium">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            ⚠️ {listing.fraudReportCount} fraud report{listing.fraudReportCount > 1 ? "s" : ""} — proceed with caution
          </div>
        )}
      </div>
    </div>
  );
}
