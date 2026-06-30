"use client"

import * as React from "react"
import { Loader2, Pencil, Star, Trash2 } from "lucide-react"

import { useAuth } from "@/hooks/useAuth"
import { useDeleteReview, useUpdateReview } from "@/hooks/useProductDetails"
import type { Review } from "@/hooks/useProductDetails"
import { getApiErrorDetail } from "@/lib/apiClient"
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
  const { user } = useAuth()
  const [editingId, setEditingId] = React.useState<number | null>(null)

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
      {reviews.map((review) => {
        const isEditing = editingId === review.id

        if (isEditing) {
          return (
            <ReviewEditForm
              key={review.id}
              review={review}
              onCancel={() => setEditingId(null)}
            />
          )
        }

        return (
          <ReviewItem
            key={review.id}
            review={review}
            isOwn={!!user && review.user_id === user.id}
            onEdit={() => setEditingId(review.id)}
          />
        )
      })}
    </ul>
  )
}

function ReviewEditForm({
  review,
  onCancel,
}: {
  review: Review
  onCancel: () => void
}) {
  const updateReview = useUpdateReview()
  const [rating, setRating] = React.useState(review.rating)
  const [hover, setHover] = React.useState(0)
  const [comment, setComment] = React.useState(review.comment ?? "")

  const display = hover || rating
  const apiError = updateReview.isError
    ? getApiErrorDetail(updateReview.error)
    : null

  function save(event: React.FormEvent) {
    event.preventDefault()
    updateReview.mutate(
      {
        id: review.id,
        product_id: review.product_id,
        rating,
        comment: comment.trim(),
      },
      { onSuccess: onCancel }
    )
  }

  return (
    <li className="rounded-2xl border border-stone-200/80 bg-white p-5 dark:border-stone-800 dark:bg-stone-900">
      <form onSubmit={save} className="space-y-4">
        <div>
          <span className="mb-2 block text-sm font-medium text-stone-700 dark:text-stone-300">
            Rating
          </span>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setRating(value)}
                onMouseEnter={() => setHover(value)}
                onMouseLeave={() => setHover(0)}
                aria-label={`${value} ${value === 1 ? "star" : "stars"}`}
                className="rounded-md p-0.5 transition-transform hover:scale-110 focus-visible:ring-2 focus-visible:ring-stone-900/20 focus-visible:outline-none dark:focus-visible:ring-white/30"
              >
                <Star
                  className={cn(
                    "size-6 transition-colors",
                    value <= display
                      ? "fill-amber-400 text-amber-400"
                      : "fill-stone-200 text-stone-300 dark:fill-stone-700 dark:text-stone-600"
                  )}
                />
              </button>
            ))}
            <span className="ml-2 text-sm font-medium text-stone-500 dark:text-stone-400">
              {rating}/5
            </span>
          </div>
        </div>

        <div>
          <span className="mb-2 block text-sm font-medium text-stone-700 dark:text-stone-300">
            Review
          </span>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            maxLength={1000}
            className="w-full resize-y rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 transition outline-none placeholder:text-stone-400 focus:border-stone-900 focus:ring-4 focus:ring-stone-900/10 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100 dark:focus:border-white dark:focus:ring-white/10"
          />
        </div>

        {apiError && (
          <p className="text-sm font-medium text-red-600">{apiError}</p>
        )}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={updateReview.isPending}
            className="rounded-lg px-4 py-2 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-100 disabled:opacity-70 dark:text-stone-300 dark:hover:bg-stone-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={updateReview.isPending}
            className="inline-flex items-center gap-1.5 rounded-lg bg-stone-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-stone-800 disabled:opacity-70 dark:bg-white dark:text-stone-900 dark:hover:bg-stone-200"
          >
            {updateReview.isPending && (
              <Loader2 className="size-4 animate-spin" />
            )}
            Save changes
          </button>
        </div>
      </form>
    </li>
  )
}

function ReviewItem({
  review,
  isOwn,
  onEdit,
}: {
  review: Review
  isOwn: boolean
  onEdit: () => void
}) {
  const deleteReview = useDeleteReview()
  const [confirmDelete, setConfirmDelete] = React.useState(false)

  const apiError = deleteReview.isError
    ? getApiErrorDetail(deleteReview.error)
    : null

  function handleDelete() {
    deleteReview.mutate(
      { id: review.id, product_id: review.product_id },
      { onSuccess: () => setConfirmDelete(false) }
    )
  }

  return (
    <li className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-stone-800 dark:bg-stone-900">
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

      {apiError && (
        <p className="mt-3 text-sm font-medium text-red-600">{apiError}</p>
      )}

      {isOwn && (
        <div className="mt-4 flex items-center justify-end gap-2 border-t border-stone-100 pt-3 dark:border-stone-800">
          {confirmDelete ? (
            <>
              <span className="mr-auto text-sm text-stone-500 dark:text-stone-400">
                Delete this review?
              </span>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                disabled={deleteReview.isPending}
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-100 disabled:opacity-70 dark:text-stone-300 dark:hover:bg-stone-800"
              >
                No, keep it
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleteReview.isPending}
                className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-red-500 disabled:opacity-70"
              >
                {deleteReview.isPending && (
                  <Loader2 className="size-4 animate-spin" />
                )}
                Yes, delete
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={onEdit}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-100 hover:text-stone-900 dark:text-stone-300 dark:hover:bg-stone-800 dark:hover:text-stone-50"
              >
                <Pencil className="size-3.5" />
                Edit
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-stone-600 transition-colors hover:bg-red-50 hover:text-red-600 dark:text-stone-300 dark:hover:bg-red-950/40 dark:hover:text-red-400"
              >
                <Trash2 className="size-3.5" />
                Delete
              </button>
            </>
          )}
        </div>
      )}
    </li>
  )
}
