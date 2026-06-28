import { useState } from "react";
import { useCreateListing } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Camera, CheckCircle2 } from "lucide-react";
import { useLocation } from "wouter";

const AMENITIES = ["WiFi", "AC", "Meals", "Laundry", "Parking", "Gym", "CCTV", "RO Water", "Wardrobe", "Study Table", "Lift", "Power Backup"];
const SECURITY_FEATURES = ["CCTV", "Guard", "Main Gate Lock", "Biometric Entry", "Police Verification", "Fire Safety", "Lady Guard", "Smart Lock", "Intercom", "Society Guard"];

export function ListProperty() {
  const [step, setStep] = useState(1);
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const createMutation = useCreateListing();

  const [formData, setFormData] = useState({
    name: "", type: "PG", gender: "Any", area: "", gali: "", landmark: "", mapsLink: "",
    rent: "", deposit: "", roomType: "Private", amenities: [] as string[], photos: [] as string[],
    securityFeatures: [] as string[], curfewTime: "", guestPolicy: "Open",
    smokingAllowed: false, alcoholAllowed: false, nonVegAllowed: false,
    ownerName: "", ownerPhone: "", alternatePhone: "", aadhaarConsent: false, escrowEnabled: false
  });

  const [isSuccess, setIsSuccess] = useState(false);

  const updateForm = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const toggleArrayItem = (key: "amenities" | "securityFeatures", item: string) => {
    setFormData(prev => {
      const arr = prev[key];
      if (arr.includes(item)) return { ...prev, [key]: arr.filter(i => i !== item) };
      return { ...prev, [key]: [...arr, item] };
    });
  };

  const handleSubmit = () => {
    createMutation.mutate({
      data: {
        name: formData.name,
        type: formData.type,
        gender: formData.gender,
        area: formData.area,
        gali: formData.gali,
        landmark: formData.landmark,
        mapsLink: formData.mapsLink,
        rent: Number(formData.rent) || 0,
        deposit: Number(formData.deposit) || 0,
        roomType: formData.roomType,
        amenities: formData.amenities,
        photos: ["https://placehold.co/600x400"], // placeholder
        securityFeatures: formData.securityFeatures,
        curfewTime: formData.curfewTime || "No Curfew",
        guestPolicy: formData.guestPolicy,
        smokingAllowed: formData.smokingAllowed,
        alcoholAllowed: formData.alcoholAllowed,
        nonVegAllowed: formData.nonVegAllowed,
        ownerName: formData.ownerName,
        ownerPhone: formData.ownerPhone,
        alternatePhone: formData.alternatePhone,
        aadhaarConsent: formData.aadhaarConsent,
        escrowEnabled: formData.escrowEnabled
      }
    }, {
      onSuccess: () => {
        setIsSuccess(true);
      },
      onError: (err) => {
        toast({ title: "Failed to create listing", variant: "destructive" });
      }
    });
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col h-full bg-background items-center justify-center p-6 text-center">
        <CheckCircle2 className="w-20 h-20 text-success mb-4" />
        <h1 className="text-2xl font-bold mb-2">Listing Posted! 🎉</h1>
        <p className="text-muted-foreground mb-8">Your property is now live on DelhiGhar.</p>
        <Button onClick={() => setLocation("/")} className="w-full">Browse Listings</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="sticky top-0 z-10 bg-background py-4 px-4 border-b">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-xl font-bold">List Karo (Step {step}/4)</h1>
        </div>
        <div className="flex gap-1 h-1.5 w-full bg-muted rounded-full overflow-hidden">
          {[1, 2, 3, 4].map(s => (
            <div key={s} className={`flex-1 ${s <= step ? "bg-primary" : "bg-transparent"}`}></div>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-24">
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
            <h2 className="font-bold text-lg">Basic Info</h2>
            <div>
              <label className="text-sm font-medium mb-1 block">PG/Flat Name</label>
              <Input value={formData.name} onChange={e => updateForm("name", e.target.value)} placeholder="e.g. Sharma PG" />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Type</label>
              <div className="flex gap-2">
                {["PG", "Flat", "Hostel"].map(t => (
                  <Button key={t} type="button" variant={formData.type === t ? "default" : "outline"} onClick={() => updateForm("type", t)} className="flex-1">
                    {t}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Gender</label>
              <div className="flex gap-2 flex-wrap">
                {["Boys", "Girls", "Co-ed", "Family"].map(g => (
                  <Button key={g} type="button" variant={formData.gender === g ? "default" : "outline"} onClick={() => updateForm("gender", g)} className="flex-1 min-w-[70px]">
                    {g}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Area / Locality</label>
              <Input value={formData.area} onChange={e => updateForm("area", e.target.value)} placeholder="e.g. Laxmi Nagar" />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Gali / Street</label>
              <Input value={formData.gali} onChange={e => updateForm("gali", e.target.value)} placeholder="e.g. Gali No. 4" />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Landmark</label>
              <Input value={formData.landmark} onChange={e => updateForm("landmark", e.target.value)} placeholder="e.g. Near Metro Pillar 32" />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Google Maps Link (Optional)</label>
              <Input value={formData.mapsLink} onChange={e => updateForm("mapsLink", e.target.value)} placeholder="https://maps.app.goo.gl/..." />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
            <h2 className="font-bold text-lg">Rent & Room</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Monthly Rent (₹)</label>
                <Input type="number" value={formData.rent} onChange={e => updateForm("rent", e.target.value)} placeholder="8000" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Security Deposit (₹)</label>
                <Input type="number" value={formData.deposit} onChange={e => updateForm("deposit", e.target.value)} placeholder="8000" />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Room Type</label>
              <div className="flex gap-2 flex-wrap">
                {["Private", "Sharing(2)", "Sharing(3)", "1BHK", "2BHK", "3BHK"].map(r => (
                  <Button key={r} type="button" variant={formData.roomType === r ? "default" : "outline"} onClick={() => updateForm("roomType", r)} className="flex-1 min-w-[30%]">
                    {r}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Amenities</label>
              <div className="flex flex-wrap gap-2">
                {AMENITIES.map(a => {
                  const selected = formData.amenities.includes(a);
                  return (
                    <button key={a} type="button" onClick={() => toggleArrayItem("amenities", a)} 
                      className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${selected ? "bg-primary text-primary-foreground border-primary" : "bg-card hover:bg-muted"}`}>
                      {a}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Photos</label>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="aspect-square bg-muted rounded-lg flex items-center justify-center border border-dashed">
                    <Camera className="text-muted-foreground w-6 h-6" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
            <h2 className="font-bold text-lg">Security & Rules</h2>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Security Features</label>
              <div className="flex flex-wrap gap-2">
                {SECURITY_FEATURES.map(s => {
                  const selected = formData.securityFeatures.includes(s);
                  return (
                    <button key={s} type="button" onClick={() => toggleArrayItem("securityFeatures", s)} 
                      className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${selected ? "bg-primary text-primary-foreground border-primary" : "bg-card hover:bg-muted"}`}>
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Curfew Time</label>
              <Input value={formData.curfewTime} onChange={e => updateForm("curfewTime", e.target.value)} placeholder="e.g. 10:30 PM or No Curfew" />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Guest Policy</label>
              <div className="flex gap-2 flex-wrap">
                {["Open", "Female only", "Till 8 PM", "Not Allowed"].map(g => (
                  <Button key={g} type="button" variant={formData.guestPolicy === g ? "default" : "outline"} onClick={() => updateForm("guestPolicy", g)} className="flex-1 min-w-[40%]">
                    {g}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Smoking Allowed</label>
                <Switch checked={formData.smokingAllowed} onCheckedChange={c => updateForm("smokingAllowed", c)} />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Alcohol Allowed</label>
                <Switch checked={formData.alcoholAllowed} onCheckedChange={c => updateForm("alcoholAllowed", c)} />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Non-Veg Allowed</label>
                <Switch checked={formData.nonVegAllowed} onCheckedChange={c => updateForm("nonVegAllowed", c)} />
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
            <h2 className="font-bold text-lg">Owner Details</h2>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Full Name</label>
              <Input value={formData.ownerName} onChange={e => updateForm("ownerName", e.target.value)} placeholder="e.g. Rajesh Kumar" />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Primary Phone</label>
              <Input type="tel" value={formData.ownerPhone} onChange={e => updateForm("ownerPhone", e.target.value)} placeholder="9876543210" />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Alternate Phone (Optional)</label>
              <Input type="tel" value={formData.alternatePhone} onChange={e => updateForm("alternatePhone", e.target.value)} placeholder="9876543210" />
            </div>

            <div className="bg-success/10 border border-success/20 rounded-lg p-3 flex items-start gap-3 mt-4">
              <Checkbox id="aadhaar" checked={formData.aadhaarConsent} onCheckedChange={c => updateForm("aadhaarConsent", !!c)} className="mt-1 border-success" />
              <div>
                <label htmlFor="aadhaar" className="text-sm font-bold text-success-foreground cursor-pointer">Meri Aadhaar verify karo (+✅ badge milega)</label>
                <p className="text-xs text-muted-foreground mt-1">Increases trust by 3x. Our team will contact you.</p>
              </div>
            </div>

            <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 flex items-start gap-3 mt-2">
              <Checkbox id="escrow" checked={formData.escrowEnabled} onCheckedChange={c => updateForm("escrowEnabled", !!c)} className="mt-1 border-primary" />
              <div>
                <label htmlFor="escrow" className="text-sm font-bold text-primary cursor-pointer">Escrow payment allow karo (safe token money ke liye)</label>
                <p className="text-xs text-muted-foreground mt-1">Token money is safe with us until the buyer visits.</p>
              </div>
            </div>

            <p className="text-xs text-center text-muted-foreground pt-4">
              📱 Owner ka number tabhi dikhega jab buyer request kare
            </p>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 w-full max-w-[480px] bg-background border-t p-4 flex gap-3 pb-safe z-20">
        {step > 1 && (
          <Button variant="outline" className="flex-1" onClick={() => setStep(s => s - 1)}>Back</Button>
        )}
        {step < 4 ? (
          <Button className="flex-1" onClick={() => setStep(s => s + 1)}>Next</Button>
        ) : (
          <Button className="flex-1 bg-success hover:bg-success/90 text-success-foreground" onClick={handleSubmit} disabled={createMutation.isPending}>
            {createMutation.isPending ? "Submitting..." : "Submit Listing"}
          </Button>
        )}
      </div>
    </div>
  );
}
