import { useState } from "react";
import { X, Calendar, Clock, User, Phone, CheckCircle2, ChevronLeft, ChevronRight, Bell } from "lucide-react";
import { useScheduleVisit } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useNotifications } from "@/lib/use-notifications";

const TIME_SLOTS = [
  { label: "9–11 AM", value: "09:00", period: "Morning" },
  { label: "11–1 PM", value: "11:00", period: "Late Morning" },
  { label: "1–3 PM", value: "13:00", period: "Afternoon" },
  { label: "3–5 PM", value: "15:00", period: "Evening" },
  { label: "5–7 PM", value: "17:00", period: "Late Evening" },
];

function getDates(count = 14) {
  const today = new Date();
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return d;
  });
}

function formatDay(d: Date) {
  return d.toLocaleDateString("en-IN", { weekday: "short" });
}
function formatDate(d: Date) {
  return d.getDate();
}
function formatMonthYear(d: Date) {
  return d.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
}
function toISODate(d: Date) {
  return d.toISOString().split("T")[0];
}

interface Props {
  listingId: string;
  listingName: string;
  onClose: () => void;
}

export function ScheduleVisitSheet({ listingId, listingName, onClose }: Props) {
  const { user } = useAuth();
  const { toast } = useToast();
  const visitMutation = useScheduleVisit();
  const { status: notifStatus, request: requestNotif, notify } = useNotifications();

  const dates = getDates(14);
  const [selectedDate, setSelectedDate] = useState<Date>(dates[0]);
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);
  const [scrollIndex, setScrollIndex] = useState(0);

  const visibleDates = dates.slice(scrollIndex, scrollIndex + 7);

  function validate() {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Name is required";
    if (!phone.trim() || phone.length < 10) e.phone = "Enter a valid 10-digit number";
    if (!selectedSlot) e.slot = "Please pick a time slot";
    return e;
  }

  async function handleSubmit() {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    const visitDate = new Date(selectedDate);
    const [h, m] = selectedSlot.split(":").map(Number);
    visitDate.setHours(h, m, 0, 0);

    visitMutation.mutate(
      {
        data: {
          listingId,
          buyerName: name,
          buyerPhone: phone,
          visitDate: visitDate.toISOString(),
          userId: user?.email || "guest",
        },
      },
      {
        onSuccess: async () => {
          setSuccess(true);
          const slot = TIME_SLOTS.find((s) => s.value === selectedSlot);
          const dateStr = selectedDate.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });
          const notifBody = `${dateStr} · ${slot?.label} — ${listingName}`;

          if (notifStatus === "default") {
            const result = await requestNotif();
            if (result === "granted") {
              notify("✅ Visit Booked!", { body: notifBody, tag: `visit-${listingId}` });
            }
          } else if (notifStatus === "granted") {
            notify("✅ Visit Booked!", { body: notifBody, tag: `visit-${listingId}` });
          }
        },
        onError: () => toast({ title: "Could not book visit. Please try again.", variant: "destructive" }),
      }
    );
  }

  if (success) {
    const slot = TIME_SLOTS.find((s) => s.value === selectedSlot);
    return (
      <div className="fixed inset-0 z-[60] bg-background/80 backdrop-blur-sm flex items-end justify-center" onClick={onClose}>
        <div
          className="w-full max-w-[480px] bg-background rounded-t-3xl p-6 text-center animate-in slide-in-from-bottom-8 duration-300 pb-10"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={36} className="text-success" />
          </div>
          <h2 className="text-xl font-bold mb-1">Visit Booked!</h2>
          <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
            Your visit to <strong className="text-foreground">{listingName}</strong> is confirmed for
          </p>
          <div className="bg-primary/8 border border-primary/20 rounded-2xl p-4 mb-6 space-y-1">
            <p className="font-bold text-primary text-base">
              {selectedDate.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
            </p>
            <p className="text-sm text-foreground font-medium">{slot?.period} · {slot?.label}</p>
          </div>

          {notifStatus === "granted" && (
            <div className="flex items-center justify-center gap-2 bg-success/8 border border-success/20 rounded-xl px-4 py-2.5 mb-4">
              <Bell size={14} className="text-success" />
              <p className="text-xs text-success font-medium">Reminder notification sent!</p>
            </div>
          )}

          <p className="text-xs text-muted-foreground mb-6">
            The owner will call you on <strong className="text-foreground">+91 {phone}</strong> to confirm.
          </p>
          <button
            onClick={onClose}
            className="w-full bg-primary text-white font-semibold py-3.5 rounded-xl text-sm"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] bg-background/80 backdrop-blur-sm flex items-end justify-center" onClick={onClose}>
      <div
        className="w-full max-w-[480px] bg-background rounded-t-3xl animate-in slide-in-from-bottom-8 duration-300 max-h-[92dvh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b shrink-0">
          <div>
            <h2 className="font-bold text-base">Schedule a Visit</h2>
            <p className="text-xs text-muted-foreground truncate max-w-[260px]">{listingName}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center text-muted-foreground active:scale-90 transition"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pb-4">
          <div className="px-5 pt-4 pb-2">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Calendar size={15} className="text-primary" />
                <span className="text-sm font-semibold">{formatMonthYear(selectedDate)}</span>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => setScrollIndex(Math.max(0, scrollIndex - 7))}
                  disabled={scrollIndex === 0}
                  className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center disabled:opacity-30 active:scale-90 transition"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  onClick={() => setScrollIndex(Math.min(7, scrollIndex + 7))}
                  disabled={scrollIndex >= 7}
                  className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center disabled:opacity-30 active:scale-90 transition"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1">
              {visibleDates.map((d) => {
                const isSel = toISODate(d) === toISODate(selectedDate);
                const isToday = toISODate(d) === toISODate(new Date());
                return (
                  <button
                    key={toISODate(d)}
                    onClick={() => setSelectedDate(d)}
                    className={`flex flex-col items-center py-2 rounded-xl transition active:scale-95 ${
                      isSel
                        ? "bg-primary text-white"
                        : "bg-muted/50 hover:bg-muted text-foreground"
                    }`}
                  >
                    <span className={`text-[10px] font-medium ${isSel ? "text-white/80" : "text-muted-foreground"}`}>
                      {formatDay(d)}
                    </span>
                    <span className="text-sm font-bold leading-tight">{formatDate(d)}</span>
                    {isToday && !isSel && (
                      <span className="w-1 h-1 rounded-full bg-primary mt-0.5" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="px-5 pt-3">
            <div className="flex items-center gap-2 mb-3">
              <Clock size={15} className="text-primary" />
              <span className="text-sm font-semibold">Pick a Time Slot</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {TIME_SLOTS.map((slot) => {
                const isSel = selectedSlot === slot.value;
                return (
                  <button
                    key={slot.value}
                    onClick={() => { setSelectedSlot(slot.value); setErrors((e) => ({ ...e, slot: "" })); }}
                    className={`py-2.5 px-2 rounded-xl text-center transition active:scale-95 border ${
                      isSel
                        ? "bg-primary text-white border-primary"
                        : "bg-muted/50 border-transparent hover:border-primary/30 text-foreground"
                    }`}
                  >
                    <p className="text-[10px] font-medium opacity-70">{slot.period}</p>
                    <p className="text-xs font-bold">{slot.label}</p>
                  </button>
                );
              })}
            </div>
            {errors.slot && <p className="text-destructive text-xs mt-1.5">{errors.slot}</p>}
          </div>

          <div className="px-5 pt-4 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <User size={15} className="text-primary" />
              <span className="text-sm font-semibold">Your Details</span>
            </div>
            <div>
              <input
                type="text"
                placeholder="Your full name"
                value={name}
                onChange={(e) => { setName(e.target.value); setErrors((er) => ({ ...er, name: "" })); }}
                className={`w-full px-4 py-3 rounded-xl bg-card border text-sm outline-none focus:ring-2 focus:ring-primary/40 transition ${errors.name ? "border-destructive" : "border-border"}`}
              />
              {errors.name && <p className="text-destructive text-xs mt-1">{errors.name}</p>}
            </div>
            <div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">+91</span>
                <input
                  type="tel"
                  placeholder="10-digit phone"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => { setPhone(e.target.value.replace(/\D/g, "")); setErrors((er) => ({ ...er, phone: "" })); }}
                  className={`w-full pl-12 pr-4 py-3 rounded-xl bg-card border text-sm outline-none focus:ring-2 focus:ring-primary/40 transition ${errors.phone ? "border-destructive" : "border-border"}`}
                />
              </div>
              {errors.phone && <p className="text-destructive text-xs mt-1">{errors.phone}</p>}
            </div>
            <div>
              <textarea
                rows={2}
                placeholder="Any note for the owner? (optional)"
                value={note}
                onChange={(e) => setNote(e.target.value.slice(0, 200))}
                className="w-full px-4 py-3 rounded-xl bg-card border border-border text-sm outline-none focus:ring-2 focus:ring-primary/40 transition resize-none"
              />
            </div>
          </div>
        </div>

        <div className="px-5 pt-3 pb-6 border-t shrink-0">
          <button
            onClick={handleSubmit}
            disabled={visitMutation.isPending}
            className="w-full bg-primary text-white font-semibold py-3.5 rounded-xl text-sm transition active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2"
          >
            <Calendar size={16} />
            {visitMutation.isPending ? "Booking..." : "Confirm Visit"}
          </button>
          <p className="text-center text-xs text-muted-foreground mt-2">Free visit — no payment needed</p>
        </div>
      </div>
    </div>
  );
}
