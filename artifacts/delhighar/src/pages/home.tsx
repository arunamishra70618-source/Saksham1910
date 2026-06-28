import { useState } from "react";
import { Link } from "wouter";
import { useGetListings } from "@workspace/api-client-react";
import { ListingCard } from "@/components/listing-card";
import { Input } from "@/components/ui/input";
import { Search, UserCircle, LogOut } from "lucide-react";
import { ListingDetailSheet } from "@/components/listing-detail-sheet";
import { useAuth } from "@/lib/auth";

export function Home() {
  const { user, logout } = useAuth();
  const [search, setSearch] = useState("");
  const [type, setType] = useState<string>("");
  const [gender, setGender] = useState<string>("");
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(false);
  const [selectedListingId, setSelectedListingId] = useState<string | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const { data: listings, isLoading } = useGetListings({
    search: search || undefined,
    type: type || undefined,
    gender: gender || undefined,
    verifiedOnly: verifiedOnly ? "true" : undefined
  });

  const filterChips = [
    { label: "All", value: "" },
    { label: "Flat", value: "Flat" },
    { label: "PG", value: "PG" },
    { label: "Hostel", value: "Hostel" },
  ];

  const genderChips = [
    { label: "Any", value: "" },
    { label: "Boys", value: "Boys" },
    { label: "Girls", value: "Girls" },
    { label: "Co-ed", value: "Co-ed" },
  ];

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur pt-4 pb-2 px-4 border-b">
        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search area or property name..."
              className="pl-9 bg-card border-none shadow-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              data-testid="nav-user"
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-card shadow-sm border border-border text-primary transition-colors shrink-0"
            >
              <UserCircle size={22} />
            </button>
            {showUserMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)} />
                <div className="absolute right-0 top-12 z-20 bg-card border border-border rounded-xl shadow-lg p-3 min-w-[180px]">
                  <p className="text-xs text-muted-foreground mb-1">Logged in as</p>
                  <p className="text-sm font-semibold text-foreground truncate mb-3">{user?.email}</p>
                  <button
                    onClick={() => { logout(); setShowUserMenu(false); }}
                    data-testid="button-logout"
                    className="flex items-center gap-2 text-destructive text-sm font-medium w-full"
                  >
                    <LogOut size={15} />
                    Log Out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="overflow-x-auto no-scrollbar pb-2 flex gap-2">
          {filterChips.map((chip) => (
            <button
              key={chip.label}
              onClick={() => setType(chip.value)}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                type === chip.value ? "bg-primary text-primary-foreground" : "bg-card text-foreground hover:bg-muted"
              }`}
            >
              {chip.label}
            </button>
          ))}
          <div className="w-px h-6 bg-border self-center mx-1"></div>
          {genderChips.map((chip) => (
            <button
              key={`g-${chip.label}`}
              onClick={() => setGender(chip.value)}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                gender === chip.value ? "bg-primary text-primary-foreground" : "bg-card text-foreground hover:bg-muted"
              }`}
            >
              {chip.label}
            </button>
          ))}
          <div className="w-px h-6 bg-border self-center mx-1"></div>
          <button
            onClick={() => setVerifiedOnly(!verifiedOnly)}
            className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1 ${
              verifiedOnly ? "bg-success text-success-foreground" : "bg-card text-foreground hover:bg-muted"
            }`}
          >
            ✅ Verified Only
          </button>
        </div>
      </div>

      <div className="flex-1 p-4 space-y-4">
        {isLoading ? (
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="h-32 bg-card rounded-xl animate-pulse"></div>
          ))
        ) : listings?.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            No listings found.
          </div>
        ) : (
          listings?.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              onClick={() => setSelectedListingId(listing.id)}
            />
          ))
        )}
      </div>

      {selectedListingId && (
        <ListingDetailSheet
          id={selectedListingId}
          onClose={() => setSelectedListingId(null)}
        />
      )}
    </div>
  );
}
