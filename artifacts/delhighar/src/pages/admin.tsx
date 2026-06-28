import { useState } from "react";
import { useGetAdminListings, useVerifyAadhaar, useDeleteListing } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, ShieldCheck, ShieldX, AlertTriangle, X, CheckCircle2 } from "lucide-react";

export function AdminPanel() {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<"pending" | "all">("pending");
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "admin123") {
      setIsAuthenticated(true);
    } else {
      toast({ title: "Invalid password", variant: "destructive" });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col h-screen bg-background items-center justify-center p-6 animate-in fade-in duration-300">
        <div className="w-full max-w-sm bg-card p-6 rounded-2xl border shadow-lg">
          <div className="flex items-center justify-center gap-2 mb-6">
            <ShieldCheck size={28} className="text-primary" />
            <h1 className="text-xl font-bold">Admin Access</h1>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter admin password" className="text-center tracking-widest" />
            <Button type="submit" className="w-full">Login</Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background min-h-[100dvh] animate-in fade-in duration-300">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b p-4">
        <h1 className="text-xl font-bold mb-3">Admin Dashboard</h1>
        <div className="flex gap-2">
          <Button
            variant={activeTab === "pending" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("pending")}
            className="transition-all duration-200"
          >
            Pending Aadhaar
          </Button>
          <Button
            variant={activeTab === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("all")}
            className="transition-all duration-200"
          >
            All Listings
          </Button>
        </div>
      </div>

      <div className="flex-1 p-4 overflow-y-auto">
        <AdminListings password={password} tab={activeTab} />
      </div>
    </div>
  );
}

function AdminListings({ password, tab }: { password: string; tab: string }) {
  const statusFilter = tab === "pending" ? "aadhaar_pending" : undefined;
  const { data: listings, isLoading, refetch } = useGetAdminListings({ password, status: statusFilter });
  const verifyMutation = useVerifyAadhaar();
  const deleteMutation = useDeleteListing();
  const { toast } = useToast();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());

  const handleVerify = (id: string, action: "approve" | "reject") => {
    verifyMutation.mutate({ id, data: { password, action } }, {
      onSuccess: () => {
        toast({ title: action === "approve" ? "✅ Listing approved" : "❌ Listing rejected" });
        refetch();
      }
    });
  };

  const handleDeleteConfirm = (id: string) => {
    deleteMutation.mutate({ id }, {
      onSuccess: () => {
        setDeletedIds(prev => new Set([...prev, id]));
        setDeletingId(null);
        toast({ title: "🗑️ Listing deleted successfully" });
        setTimeout(() => refetch(), 500);
      },
      onError: () => {
        toast({ title: "Failed to delete listing", variant: "destructive" });
        setDeletingId(null);
      }
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array(3).fill(0).map((_, i) => (
          <div key={i} className="h-36 bg-card rounded-2xl animate-pulse border border-border" />
        ))}
      </div>
    );
  }

  if (!listings?.length) {
    return (
      <div className="text-center py-20 animate-in fade-in duration-300">
        <CheckCircle2 className="w-12 h-12 text-success mx-auto mb-3 opacity-60" />
        <p className="text-muted-foreground font-medium">No listings found</p>
      </div>
    );
  }

  const visibleListings = listings.filter(l => !deletedIds.has(l.id));

  return (
    <div className="space-y-4 pb-20">
      {visibleListings.map((listing, i) => (
        <div
          key={listing.id}
          className="bg-card rounded-2xl border border-border overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-bottom-2"
          style={{ animationDelay: `${i * 60}ms` }}
        >
          {deletingId === listing.id ? (
            <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-2xl animate-in fade-in duration-200">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={18} className="text-destructive" />
                <p className="font-semibold text-sm text-destructive">Delete this listing?</p>
              </div>
              <p className="text-xs text-muted-foreground mb-1">
                <strong className="text-foreground">{listing.name}</strong> — {listing.area}
              </p>
              <p className="text-xs text-muted-foreground mb-4">This action cannot be undone. The listing will be permanently removed.</p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleDeleteConfirm(listing.id)}
                  disabled={deleteMutation.isPending}
                  className="flex-1 bg-destructive text-white font-semibold py-2.5 rounded-xl text-sm transition active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  <Trash2 size={14} />
                  {deleteMutation.isPending ? "Deleting..." : "Yes, Delete"}
                </button>
                <button
                  onClick={() => setDeletingId(null)}
                  className="flex-1 bg-muted text-foreground font-semibold py-2.5 rounded-xl text-sm transition active:scale-95"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4">
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-foreground truncate">{listing.name}</h3>
                  <p className="text-sm text-muted-foreground">{listing.area}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge
                    className={`text-xs ${
                      listing.verificationStatus === "aadhaar_verified"
                        ? "bg-success/10 text-success border-success/20"
                        : listing.verificationStatus === "phone_verified"
                        ? "bg-amber-100 text-amber-700 border-amber-200"
                        : "bg-muted text-muted-foreground"
                    }`}
                    variant="outline"
                  >
                    {listing.verificationStatus === "aadhaar_verified"
                      ? "✅ Verified"
                      : listing.verificationStatus === "phone_verified"
                      ? "📱 Phone"
                      : "⬜ Pending"}
                  </Badge>
                  <button
                    onClick={() => setDeletingId(listing.id)}
                    className="w-8 h-8 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center hover:bg-destructive/20 transition-colors active:scale-90"
                    title="Delete listing"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              <div className="mt-3 text-xs grid grid-cols-2 gap-2 bg-muted/60 p-3 rounded-xl">
                <div><span className="text-muted-foreground">Owner:</span> <span className="font-medium">{listing.ownerName || "—"}</span></div>
                <div><span className="text-muted-foreground">Phone:</span> <span className="font-medium">{listing.ownerPhone || "—"}</span></div>
                <div><span className="text-muted-foreground">Rent:</span> <span className="font-medium">₹{listing.rent?.toLocaleString()}/mo</span></div>
                <div>
                  <span className="text-muted-foreground">Reports:</span>{" "}
                  <span className={`font-bold ${listing.fraudReportCount > 0 ? "text-destructive" : "text-success"}`}>
                    {listing.fraudReportCount > 0 ? `⚠️ ${listing.fraudReportCount}` : "0"}
                  </span>
                </div>
              </div>

              {listing.fraudReportCount > 0 && (
                <div className="mt-2 flex items-center gap-2 text-xs text-destructive bg-destructive/10 px-3 py-2 rounded-lg">
                  <AlertTriangle size={13} />
                  {listing.fraudReportCount} fraud report{listing.fraudReportCount > 1 ? "s" : ""} — review immediately
                </div>
              )}

              {listing.verificationStatus === "aadhaar_pending" && (
                <div className="flex gap-2 mt-3">
                  <Button
                    size="sm"
                    className="flex-1 bg-success hover:bg-success/90 text-white gap-1.5"
                    onClick={() => handleVerify(listing.id, "approve")}
                    disabled={verifyMutation.isPending}
                  >
                    <ShieldCheck size={14} />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="flex-1 gap-1.5"
                    onClick={() => handleVerify(listing.id, "reject")}
                    disabled={verifyMutation.isPending}
                  >
                    <ShieldX size={14} />
                    Reject
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
