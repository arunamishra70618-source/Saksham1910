import { ShieldCheck, UserCheck, Calendar, CreditCard, AlertTriangle, BellRing } from "lucide-react";

export function Safety() {
  const safetyFeatures = [
    {
      title: "Aadhaar Verification",
      icon: <UserCheck className="w-6 h-6 text-success" />,
      desc: "Owner's ID is verified by our admin team before they get the green badge. Always trust green ticks.",
      color: "bg-success/10 border-success/20"
    },
    {
      title: "Phone OTP Verification",
      icon: <ShieldCheck className="w-6 h-6 text-amber-500" />,
      desc: "Owner has verified their active phone number. Look for the amber badge.",
      color: "bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-900"
    },
    {
      title: "Property Visit Scheduling",
      icon: <Calendar className="w-6 h-6 text-primary" />,
      desc: "Book a free visit directly from the app before paying anything to anyone.",
      color: "bg-primary/10 border-primary/20"
    },
    {
      title: "Escrow Safe Pay",
      icon: <CreditCard className="w-6 h-6 text-blue-500" />,
      desc: "Token money is held safely by us. It is released to the owner only after you visit and confirm.",
      color: "bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-900"
    },
    {
      title: "Fraud Report System",
      icon: <AlertTriangle className="w-6 h-6 text-destructive" />,
      desc: "Community flags fake listings. We show warnings immediately if a property is reported.",
      color: "bg-destructive/10 border-destructive/20"
    },
    {
      title: "Auto Warning System",
      icon: <BellRing className="w-6 h-6 text-purple-500" />,
      desc: "Suspicious listings with low trust scores are highlighted automatically to keep you safe.",
      color: "bg-purple-50 border-purple-200 dark:bg-purple-950/30 dark:border-purple-900"
    }
  ];

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur py-4 px-4 border-b">
        <h1 className="text-2xl font-bold text-foreground">Safety Guide</h1>
        <p className="text-sm text-muted-foreground mt-1">Mera PG keeps you safe from brokers and frauds.</p>
      </div>

      <div className="flex-1 p-4 space-y-4">
        {safetyFeatures.map((f, i) => (
          <div key={i} className={`p-4 rounded-xl border ${f.color} flex gap-4`}>
            <div className="shrink-0 mt-1">{f.icon}</div>
            <div>
              <h3 className="font-bold text-foreground mb-1">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
