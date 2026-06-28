import { useState } from "react";
import { useGetAdminListings, useVerifyAadhaar } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
      <div className="flex flex-col h-screen bg-background items-center justify-center p-6">
        <div className="w-full max-w-sm bg-card p-6 rounded-xl border shadow-lg">
          <h1 className="text-xl font-bold mb-4 text-center">Admin Access</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password" />
            <Button type="submit" className="w-full">Login</Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background min-h-[100dvh]">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b p-4">
        <h1 className="text-xl font-bold mb-3">Admin Dashboard</h1>
        <div className="flex gap-2">
          <Button variant={activeTab === "pending" ? "default" : "outline"} size="sm" onClick={() => setActiveTab("pending")}>
            Pending Aadhaar
          </Button>
          <Button variant={activeTab === "all" ? "default" : "outline"} size="sm" onClick={() => setActiveTab("all")}>
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

function AdminListings({ password, tab }: { password: string, tab: string }) {
  const statusFilter = tab === "pending" ? "aadhaar_pending" : undefined;
  const { data: listings, isLoading, refetch } = useGetAdminListings({ password, status: statusFilter });
  const verifyMutation = useVerifyAadhaar();
  const { toast } = useToast();

  const handleVerify = (id: string, action: "approve" | "reject") => {
    verifyMutation.mutate({
      id,
      data: { password, action }
    }, {
      onSuccess: () => {
        toast({ title: `Listing ${action}d` });
        refetch();
      }
    });
  };

  if (isLoading) return <div className="p-4 text-center text-muted-foreground">Loading...</div>;
  if (!listings?.length) return <div className="p-4 text-center text-muted-foreground">No listings found.</div>;

  return (
    <div className="space-y-4 pb-20">
      {listings.map(listing => (
        <div key={listing.id} className="bg-card p-4 rounded-xl border flex flex-col gap-3">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold">{listing.name}</h3>
              <p className="text-sm text-muted-foreground">{listing.area}</p>
            </div>
            <Badge variant={listing.verificationStatus === 'aadhaar_verified' ? 'default' : 'secondary'}>
              {listing.verificationStatus}
            </Badge>
          </div>
          
          <div className="text-sm grid grid-cols-2 gap-2 bg-muted p-2 rounded">
            <div><span className="text-muted-foreground">Owner:</span> {listing.ownerName}</div>
            <div><span className="text-muted-foreground">Phone:</span> {listing.ownerPhone}</div>
            <div><span className="text-muted-foreground">Reports:</span> <span className={listing.fraudReportCount > 0 ? "text-destructive font-bold" : ""}>{listing.fraudReportCount}</span></div>
          </div>

          {listing.verificationStatus === "aadhaar_pending" && (
            <div className="flex gap-2 mt-2">
              <Button size="sm" className="flex-1 bg-success hover:bg-success/90" onClick={() => handleVerify(listing.id, "approve")}>Approve ✅</Button>
              <Button size="sm" variant="destructive" className="flex-1" onClick={() => handleVerify(listing.id, "reject")}>Reject ❌</Button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
