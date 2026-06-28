import { useGetSavedListings } from "@workspace/api-client-react";
import { ListingCard } from "@/components/listing-card";
import { Heart } from "lucide-react";

export function Saved() {
  const { data: listings, isLoading } = useGetSavedListings({ userId: "user123" });

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur py-4 px-4 border-b">
        <h1 className="text-2xl font-bold text-foreground">Saved Listings</h1>
      </div>

      <div className="flex-1 p-4 space-y-4">
        {isLoading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="h-32 bg-card rounded-xl animate-pulse"></div>
          ))
        ) : !listings || listings.length === 0 ? (
          <div className="text-center py-20">
            <Heart className="w-12 h-12 text-muted mx-auto mb-4" />
            <h2 className="text-lg font-bold text-foreground mb-2">Koi saved listing nahi hai abhi ❤️</h2>
            <p className="text-sm text-muted-foreground">Go to Browse to find properties.</p>
          </div>
        ) : (
          listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} isSaved={true} />
          ))
        )}
      </div>
    </div>
  );
}
