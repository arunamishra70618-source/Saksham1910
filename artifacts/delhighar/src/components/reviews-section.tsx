import { useState } from "react";
import { Star, MessageSquare, ChevronDown, ChevronUp, Send, CheckCircle2, Lock } from "lucide-react";
import { useGetReviews, useSubmitReview } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

interface ReviewsSectionProps {
  listingId: string;
  hasVisited?: boolean;
}

function StarRow({ value, onChange, readonly }: { value: number; onChange?: (v: number) => void; readonly?: boolean }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(s)}
          onMouseEnter={() => !readonly && setHovered(s)}
          onMouseLeave={() => !readonly && setHovered(0)}
          className={`p-0.5 transition ${readonly ? "cursor-default" : "active:scale-110"}`}
        >
          <Star
            size={readonly ? 14 : 22}
            className={`transition ${
              s <= (hovered || value)
                ? "fill-amber-400 text-amber-400"
                : "fill-muted text-muted-foreground"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days} days ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return `${Math.floor(days / 365)} years ago`;
}

export function ReviewsSection({ listingId, hasVisited = true }: ReviewsSectionProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: reviews = [], refetch } = useGetReviews(listingId);
  const submitMutation = useSubmitReview();

  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());
  const [errors, setErrors] = useState<Record<string, string>>({});

  const avgRating = reviews.length
    ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10
    : 0;

  const alreadyReviewed = reviews.some((r) => r.reviewerId === (user?.email || ""));

  function validate() {
    const e: Record<string, string> = {};
    if (!rating) e.rating = "Please select a star rating";
    if (!comment.trim() || comment.length < 10) e.comment = "Write at least 10 characters";
    return e;
  }

  function handleSubmit() {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    submitMutation.mutate(
      {
        data: {
          listingId,
          reviewerId: user?.email || "guest",
          reviewerName: user?.name || "Anonymous",
          rating,
          comment,
        },
      },
      {
        onSuccess: () => {
          toast({ title: "Review submitted!" });
          setShowForm(false);
          setRating(0);
          setComment("");
          setErrors({});
          refetch();
        },
        onError: (err: unknown) => {
          const msg = (err as { message?: string })?.message;
          if (msg?.includes("409") || msg?.includes("already")) {
            toast({ title: "You've already reviewed this property.", variant: "destructive" });
          } else {
            toast({ title: "Could not submit review. Try again.", variant: "destructive" });
          }
        },
      }
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-sm">Reviews</h3>
          {reviews.length > 0 && (
            <div className="flex items-center gap-1">
              <Star size={12} className="fill-amber-400 text-amber-400" />
              <span className="text-xs font-semibold">{avgRating}</span>
              <span className="text-xs text-muted-foreground">({reviews.length})</span>
            </div>
          )}
        </div>
        {!alreadyReviewed && hasVisited && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="text-xs text-primary font-semibold flex items-center gap-1 active:scale-95 transition"
          >
            <Star size={12} /> Write a Review
          </button>
        )}
      </div>

      {/* Write review form */}
      {showForm && (
        <div className="bg-card border border-border rounded-2xl p-4 mb-4 space-y-3">
          <div>
            <p className="text-xs font-medium text-foreground mb-2">Your Rating</p>
            <StarRow value={rating} onChange={(v) => { setRating(v); setErrors((e) => ({ ...e, rating: "" })); }} />
            {errors.rating && <p className="text-destructive text-xs mt-1">{errors.rating}</p>}
          </div>
          <div>
            <textarea
              rows={3}
              maxLength={200}
              placeholder="Share your experience (min 10 characters)..."
              value={comment}
              onChange={(e) => { setComment(e.target.value); setErrors((er) => ({ ...er, comment: "" })); }}
              className={`w-full px-3 py-2.5 rounded-xl bg-background border text-sm outline-none focus:ring-2 focus:ring-primary/40 transition resize-none ${errors.comment ? "border-destructive" : "border-border"}`}
            />
            <div className="flex justify-between mt-0.5">
              {errors.comment ? <p className="text-destructive text-xs">{errors.comment}</p> : <span />}
              <span className="text-xs text-muted-foreground">{comment.length}/200</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => { setShowForm(false); setErrors({}); }}
              className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground active:scale-95 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitMutation.isPending}
              className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold flex items-center justify-center gap-1.5 active:scale-95 transition disabled:opacity-60"
            >
              <Send size={13} />
              {submitMutation.isPending ? "Posting..." : "Post Review"}
            </button>
          </div>
        </div>
      )}

      {/* Gate: no visit */}
      {!hasVisited && !alreadyReviewed && (
        <div className="bg-muted/60 border border-border rounded-xl p-3 flex items-center gap-3 mb-3">
          <Lock size={16} className="text-muted-foreground shrink-0" />
          <p className="text-xs text-muted-foreground">Schedule and complete a visit before leaving a review.</p>
        </div>
      )}

      {/* Already reviewed */}
      {alreadyReviewed && (
        <div className="bg-success/10 border border-success/20 rounded-xl p-3 flex items-center gap-2 mb-3">
          <CheckCircle2 size={15} className="text-success shrink-0" />
          <p className="text-xs text-success font-medium">You've reviewed this property.</p>
        </div>
      )}

      {/* Reviews list */}
      {reviews.length === 0 ? (
        <div className="text-center py-6">
          <MessageSquare size={28} className="text-muted-foreground/40 mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">No reviews yet. Be the first!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => {
            const isExpanded = expandedReplies.has(review.id);
            return (
              <div key={review.id} className="bg-card border border-border rounded-2xl p-3.5 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                      {review.reviewerName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-foreground leading-tight">{review.reviewerName}</p>
                      <p className="text-[10px] text-muted-foreground">{timeAgo(review.createdAt)}</p>
                    </div>
                  </div>
                  <StarRow value={review.rating} readonly />
                </div>
                <p className="text-sm text-foreground leading-relaxed">{review.comment}</p>

                {review.ownerReply && (
                  <div>
                    <button
                      onClick={() => setExpandedReplies((prev) => {
                        const next = new Set(prev);
                        isExpanded ? next.delete(review.id) : next.add(review.id);
                        return next;
                      })}
                      className="flex items-center gap-1 text-xs text-primary font-medium"
                    >
                      {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                      Owner's reply
                    </button>
                    {isExpanded && (
                      <div className="mt-2 bg-primary/5 border border-primary/15 rounded-xl p-3">
                        <p className="text-xs text-foreground leading-relaxed">{review.ownerReply}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
