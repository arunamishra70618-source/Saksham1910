import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useGetListings, useDeleteListing } from "@workspace/api-client-react";
import { ListingCard } from "@/components/listing-card";
import { Input } from "@/components/ui/input";
import { Search, UserCircle, LogOut, Shield, Phone, Trash2, X, BarChart3, MapPin, Navigation } from "lucide-react";
import { ListingDetailSheet } from "@/components/listing-detail-sheet";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useUserLocation, formatDistance } from "@/lib/use-location";
import { useSavedFilters } from "@/lib/use-storage";
import { MeraPGWordmark } from "@/components/logo";

export function Home() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const { savedFilters, saveFilters } = useSavedFilters();

  const [search, setSearch] = useState(savedFilters.search || "");
  const [type, setType] = useState<string>(savedFilters.type || "");
  const [gender, setGender] = useState<string>(savedFilters.gender || "");
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(savedFilters.verifiedOnly || false);
  const [selectedListingId, setSelectedListingId] = useState<string | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [sortByDistance, setSortByDistance] = useState(false);

  const [manageMode, setManageMode] = useState(false);
  const [showAdminPrompt, setShowAdminPrompt] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [adminError, setAdminError] = useState(false);
  const [adminVerifying, setAdminVerifying] = useState(false);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());

  const { coords, status: locStatus, request: requestLocation, getDistance } = useUserLocation();

  const deleteMutation = useDeleteListing();

  const { data: listings, isLoading, refetch } = useGetListings({
    search: search || undefined,
    type: type || undefined,
    gender: gender || undefined,
    verifiedOnly: verifiedOnly ? "true" : undefined,
  });

  useEffect(() => {
    saveFilters({ type, gender, verifiedOnly, search });
  }, [type, gender, verifiedOnly, search]);

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

  const handleNearMe = () => {
    if (locStatus === "granted" && sortByDistance) {
      setSortByDistance(false);
      return;
    }
    if (locStatus === "granted") {
      setSortByDistance(true);
      toast({ title: "📍 Sorted by distance from you" });
      return;
    }
    requestLocation();
    toast({ title: "📍 Getting your location..." });
  };

  useEffect(() => {
    if (locStatus === "granted" && !sortByDistance) {
      setSortByDistance(true);
      toast({ title: "📍 Sorted by nearest PGs" });
    }
    if (locStatus === "denied") {
      toast({ title: "Location permission denied", variant: "destructive" });
    }
  }, [locStatus]);

  const handleAdminUnlock = async () => {
    if (!adminPassword.trim()) return;
    setAdminVerifying(true);
    setAdminError(false);
    try {
      const res = await fetch("/api/admin/listings", {
        headers: { "X-Admin-Token": adminPassword },
      });
      if (res.ok) {
        setManageMode(true);
        setShowAdminPrompt(false);
        setAdminPassword("");
        setAdminError(false);
        setShowUserMenu(false);
        toast({ title: "🗑️ Manage mode ON — tap trash to delete any listing" });
      } else {
        setAdminError(true);
      }
    } catch {
      setAdminError(true);
    } finally {
      setAdminVerifying(false);
    }
  };

  const handleDeleteConfirm = (id: string) => {
    setDeletingId(id);
    deleteMutation.mutate(
      { id },
      {
        onSuccess: () => {
          setDeletedIds((prev) => new Set([...prev, id]));
          setConfirmId(null);
          setDeletingId(null);
          toast({ title: "🗑️ Listing deleted" });
          setTimeout(() => refetch(), 400);
        },
        onError: () => {
          setDeletingId(null);
          toast({ title: "Failed to delete", variant: "destructive" });
        },
      }
    );
  };

  const withDistance = listings?.map((l) => ({
    ...l,
    _distance: getDistance(l.lat ?? null, l.lng ?? null),
  }));

  const visibleListings = withDistance
    ?.filter((l) => !deletedIds.has(l.id))
    .sort((a, b) => {
      if (!sortByDistance) return 0;
      const da = a._distance ?? Infinity;
      const db = b._distance ?? Infinity;
      return da - db;
    });

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur pt-3 pb-2 px-4 border-b border-border/60">
        {/* Logo + user row */}
        <div className="flex items-center justify-between mb-3">
          <MeraPGWordmark size="md" />
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className={`w-10 h-10 flex items-center justify-center rounded-xl shadow-sm border transition-all duration-200 active:scale-90 shrink-0 ${
                manageMode
                  ? "bg-destructive border-destructive text-white"
                  : "bg-card border-border text-primary"
              }`}
            >
              {manageMode ? <Trash2 size={18} /> : <UserCircle size={22} />}
            </button>

            {showUserMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)} />
                <div className="absolute right-0 top-12 z-20 bg-card border border-border rounded-2xl shadow-xl p-4 min-w-[230px] animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="mb-3 pb-3 border-b border-border">
                    <p className="text-xs text-muted-foreground">Logged in as</p>
                    <p className="text-sm font-semibold text-foreground truncate mt-0.5">{user?.email}</p>
                  </div>

                  <div className="space-y-0.5">
                    {!manageMode ? (
                      <button
                        onClick={() => { setShowAdminPrompt(true); setShowUserMenu(false); }}
                        className="flex items-center gap-2.5 text-sm text-destructive font-semibold py-2 px-2 rounded-lg hover:bg-destructive/10 transition-colors w-full"
                      >
                        <Trash2 size={15} />
                        Delete Listings (Admin)
                      </button>
                    ) : (
                      <button
                        onClick={() => { setManageMode(false); setConfirmId(null); setShowUserMenu(false); }}
                        className="flex items-center gap-2.5 text-sm text-muted-foreground font-semibold py-2 px-2 rounded-lg hover:bg-muted transition-colors w-full"
                      >
                        <X size={15} />
                        Exit Manage Mode
                      </button>
                    )}

                    <Link
                      href="/owner"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2.5 text-sm text-foreground py-2 px-2 rounded-lg hover:bg-muted transition-colors w-full"
                    >
                      <BarChart3 size={15} className="text-primary" />
                      Owner Dashboard
                    </Link>
                    <Link
                      href="/privacy"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2.5 text-sm text-foreground py-2 px-2 rounded-lg hover:bg-muted transition-colors w-full"
                    >
                      <Shield size={15} className="text-muted-foreground" />
                      Privacy Policy
                    </Link>
                    <Link
                      href="/contact"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2.5 text-sm text-foreground py-2 px-2 rounded-lg hover:bg-muted transition-colors w-full"
                    >
                      <Phone size={15} className="text-muted-foreground" />
                      Contact Us
                    </Link>
                  </div>

                  <div className="mt-3 pt-3 border-t border-border">
                    <button
                      onClick={() => { logout(); setShowUserMenu(false); }}
                      className="flex items-center gap-2.5 text-destructive text-sm font-medium w-full py-2 px-2 rounded-lg hover:bg-destructive/10 transition-colors"
                    >
                      <LogOut size={15} />
                      Log Out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Search bar */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search area or property name..."
            className="pl-9 bg-card border-none shadow-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {manageMode && (
          <div className="flex items-center justify-between bg-destructive/10 border border-destructive/20 rounded-xl px-3 py-2 mb-2 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 text-destructive text-xs font-semibold">
              <Trash2 size={13} />
              Manage Mode — tap 🗑️ on any listing to delete
            </div>
            <button
              onClick={() => { setManageMode(false); setConfirmId(null); }}
              className="text-destructive hover:text-destructive/70 transition-colors"
            >
              <X size={15} />
            </button>
          </div>
        )}

        <div className="overflow-x-auto no-scrollbar pb-2 flex gap-2">
          <button
            onClick={handleNearMe}
            className={`whitespace-nowrap px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 active:scale-95 flex items-center gap-1.5 shrink-0 ${
              sortByDistance
                ? "bg-primary text-primary-foreground shadow-sm"
                : locStatus === "loading"
                ? "bg-card text-muted-foreground animate-pulse"
                : "bg-card text-foreground hover:bg-muted"
            }`}
          >
            {sortByDistance ? <Navigation size={13} /> : <MapPin size={13} />}
            {locStatus === "loading" ? "Locating..." : sortByDistance ? "Near Me ✓" : "Near Me"}
          </button>

          <div className="w-px h-6 bg-border self-center" />

          {filterChips.map((chip) => (
            <button
              key={chip.label}
              onClick={() => setType(chip.value)}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 active:scale-95 ${
                type === chip.value
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-card text-foreground hover:bg-muted"
              }`}
            >
              {chip.label}
            </button>
          ))}
          <div className="w-px h-6 bg-border self-center mx-1" />
          {genderChips.map((chip) => (
            <button
              key={`g-${chip.label}`}
              onClick={() => setGender(chip.value)}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 active:scale-95 ${
                gender === chip.value
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-card text-foreground hover:bg-muted"
              }`}
            >
              {chip.label}
            </button>
          ))}
          <div className="w-px h-6 bg-border self-center mx-1" />
          <button
            onClick={() => setVerifiedOnly(!verifiedOnly)}
            className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 active:scale-95 flex items-center gap-1 ${
              verifiedOnly
                ? "bg-success text-success-foreground shadow-sm"
                : "bg-card text-foreground hover:bg-muted"
            }`}
          >
            ✅ Verified Only
          </button>
        </div>
      </div>

      {sortByDistance && coords && (
        <div className="mx-4 mt-3 flex items-center gap-2 bg-primary/8 border border-primary/20 rounded-xl px-3 py-2 animate-in fade-in duration-200">
          <Navigation size={13} className="text-primary shrink-0" />
          <p className="text-xs text-primary font-medium">Sorted by distance from your location</p>
          <button
            onClick={() => setSortByDistance(false)}
            className="ml-auto text-primary/60 hover:text-primary transition-colors"
          >
            <X size={13} />
          </button>
        </div>
      )}

      <div className="flex-1 p-4 space-y-3">
        {isLoading ? (
          Array(4).fill(0).map((_, i) => (
            <div
              key={i}
              className="h-36 bg-card rounded-2xl animate-pulse border border-border"
              style={{ animationDelay: `${i * 100}ms` }}
            />
          ))
        ) : visibleListings?.length === 0 ? (
          <div className="text-center py-16 animate-in fade-in duration-300">
            <p className="text-4xl mb-3">🏠</p>
            <p className="font-semibold text-foreground">No listings found</p>
            <p className="text-sm text-muted-foreground mt-1">Try a different search or filter</p>
          </div>
        ) : (
          visibleListings?.map((listing, i) => (
            <div key={listing.id}>
              {confirmId === listing.id ? (
                <div className="bg-destructive/5 border border-destructive/30 rounded-2xl p-4 animate-in fade-in duration-200">
                  <p className="font-semibold text-destructive text-sm mb-1 flex items-center gap-2">
                    <Trash2 size={14} /> Delete this listing?
                  </p>
                  <p className="text-xs text-muted-foreground mb-1">
                    <span className="font-semibold text-foreground">{listing.name}</span> — {listing.area}
                  </p>
                  <p className="text-xs text-muted-foreground mb-4">This cannot be undone.</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDeleteConfirm(listing.id)}
                      disabled={deletingId === listing.id}
                      className="flex-1 bg-destructive text-white font-semibold py-2.5 rounded-xl text-sm active:scale-95 transition disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                      <Trash2 size={13} />
                      {deletingId === listing.id ? "Deleting..." : "Yes, Delete"}
                    </button>
                    <button
                      onClick={() => setConfirmId(null)}
                      className="flex-1 bg-muted text-foreground font-semibold py-2.5 rounded-xl text-sm active:scale-95 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <ListingCard
                  listing={listing}
                  index={i}
                  manageMode={manageMode}
                  distance={listing._distance ?? undefined}
                  onDeletePress={() => setConfirmId(listing.id)}
                  onClick={manageMode ? undefined : () => setSelectedListingId(listing.id)}
                />
              )}
            </div>
          ))
        )}
      </div>

      {selectedListingId && !manageMode && (
        <ListingDetailSheet
          id={selectedListingId}
          onClose={() => setSelectedListingId(null)}
        />
      )}

      {showAdminPrompt && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-[480px] rounded-t-3xl p-6 animate-in slide-in-from-bottom-4 duration-250">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-destructive/10 flex items-center justify-center">
                  <Trash2 size={16} className="text-destructive" />
                </div>
                <div>
                  <h2 className="font-bold text-foreground text-sm">Enter Admin Password</h2>
                  <p className="text-xs text-muted-foreground">To enable delete mode on all listings</p>
                </div>
              </div>
              <button
                onClick={() => { setShowAdminPrompt(false); setAdminPassword(""); setAdminError(false); }}
                className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground"
              >
                <X size={16} />
              </button>
            </div>

            <input
              type="password"
              value={adminPassword}
              onChange={(e) => { setAdminPassword(e.target.value); setAdminError(false); }}
              onKeyDown={(e) => e.key === "Enter" && handleAdminUnlock()}
              placeholder="Admin password"
              autoFocus
              className={`w-full border rounded-xl px-4 py-3 text-sm bg-background outline-none transition mb-2 ${
                adminError ? "border-destructive" : "border-border focus:border-primary"
              }`}
            />
            {adminError && (
              <p className="text-xs text-destructive mb-3">❌ Wrong password. Try again.</p>
            )}

            <button
              onClick={handleAdminUnlock}
              disabled={adminVerifying}
              className="w-full bg-destructive text-white font-semibold py-3 rounded-xl text-sm mt-2 active:scale-95 transition disabled:opacity-60"
            >
              {adminVerifying ? "Verifying..." : "Unlock Delete Mode"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
