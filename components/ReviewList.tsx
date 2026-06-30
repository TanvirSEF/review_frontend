import { Star } from "lucide-react"

import type { Review } from "@/hooks/useProductDetails"
import { cn } from "@/lib/utils"

function formatDate(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return "Recently"
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function Stars({ rating }: { rating: number }) {
  const filled = Math.min(5, Math.max(0, Math.round(rating)))
  return (
    <div
      className="flex items-center gap-0.5"
      aria-label={`Rated ${rating} out of 5`}
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "size-4",
            i < filled
              ? "fill-amber-400 text-amber-400"
              : "fill-stone-200 text-stone-200 dark:fill-stone-700 dark:text-stone-700"
          )}
        />
      ))}
    </div>
  )
}

export function ReviewList({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-stone-300 bg-white/50 py-16 text-center dark:border-stone-700 dark:bg-stone-900/40">
        <Star className="size-8 fill-stone-200 text-stone-200 dark:fill-stone-700 dark:text-stone-700" />
        <p className="mt-3 text-base font-semibold text-stone-700 dark:text-stone-200">
          No reviews yet
        </p>
        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
          Be the first to share your thoughts.
        </p>
      </div>
    )
  }

  return (
    <ul className="space-y-4">
      {reviews.map((review) => (
        <li
          key={review.id}
          className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-stone-800 dark:bg-stone-900"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-stone-100 text-sm font-semibold text-stone-600 dark:bg-stone-800 dark:text-stone-300">
                {getInitials(review.user)}
              </div>
              <div>
                <p className="font-semibold text-stone-900 dark:text-stone-50">
                  {review.user}
                </p>
                <p className="text-xs text-stone-400">
                  {formatDate(review.created_at)}
                </p>
              </div>
            </div>
            <Stars rating={review.rating} />
          </div>

          <p className="mt-3 text-sm leading-relaxed whitespace-pre-line text-stone-600 dark:text-stone-300">
            {review.comment?.trim() || (
              <span className="text-stone-400 italic">No written comment.</span>
            )}
          </p>
        </li>
      ))}
    </ul>
  )
}
