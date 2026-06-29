"use client"

import * as React from "react"
import Link from "next/link"
import { Loader2, Lock, Star } from "lucide-react"

import { useAuth } from "@/hooks/useAuth"
import { useCreateReview } from "@/hooks/useProductDetails"
import { getApiErrorDetail } from "@/lib/apiClient"
import { cn } from "@/lib/utils"

export function ReviewForm({ product_id }: { product_id: number }) {
  const { isAuthenticated, isReady } = useAuth()

  if (!isReady) return <ReviewFormSkeleton />

  if (!isAuthenticated) return <SignInPrompt />

  return <ReviewFormBody product_id={product_id} />
}

function ReviewFormBody({ product_id }: { product_id: number }) {
  const [rating, setRating] = React.useState(0)
  const [hover, setHover] = React.useState(0)
  const [comment, setComment] = React.useState("")
  const [ratingTouched, setRatingTouched] = React.useState(false)
  const createReview = useCreateReview()

  const ratingError = ratingTouched && rating === 0 ? "Please select a rating" : null
  const apiError = createReview.isError ? getApiErrorDetail(createReview.error) : null
  const display = hover || rating

  function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    setRatingTouched(true)
    if (rating === 0) return

    createReview.mutate(
      { product_id, rating, comment: comment.trim() },
      {
        onSuccess: () => {
          setRating(0)
          setHover(0)
          setComment("")
          setRatingTouched(false)
        },
      },
    )
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
    >
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Write a review</h2>

      <div className="mt-4">
        <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
          Your rating
        </label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                setRating(value)
                setRatingTouched(true)
              }}
              onMouseEnter={() => setHover(value)}
              onMouseLeave={() => setHover(0)}
              aria-label={`${value} ${value === 1 ? "star" : "stars"}`}
              className="rounded-md p-0.5 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600/40"
            >
              <Star
                className={cn(
                  "size-7 transition-colors",
                  value <= display
                    ? "fill-amber-400 text-amber-400"
                    : "fill-slate-200 text-slate-300 dark:fill-slate-700 dark:text-slate-600",
                )}
              />
            </button>
          ))}
          {rating > 0 && (
            <span className="ml-2 text-sm font-medium text-slate-500 dark:text-slate-400">
              {rating}/5
            </span>
          )}
        </div>
        {ratingError && <p className="mt-1.5 text-xs font-medium text-red-600">{ratingError}</p>}
      </div>

      <div className="mt-4">
        <label
          htmlFor="comment"
          className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          Your review <span className="font-normal text-slate-400">(optional)</span>
        </label>
        <textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          maxLength={1000}
          placeholder="Share your honest experience with this product…"
          className="w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/15 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        />
      </div>

      {apiError && (
        <div
          role="alert"
          className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300"
        >
          {apiError}
        </div>
      )}

      <button
        type="submit"
        disabled={createReview.isPending}
        className={cn(
          "mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm transition-all",
          "hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600/40 focus-visible:ring-offset-2",
          "active:translate-y-px disabled:cursor-not-allowed disabled:opacity-70",
        )}
      >
        {createReview.isPending ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Submitting…
          </>
        ) : (
          "Submit review"
        )}
      </button>
    </form>
  )
}

function SignInPrompt() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
      <div className="pointer-events-none select-none blur-sm opacity-60">
        <div className="flex gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className="size-7 fill-slate-200 text-slate-200 dark:fill-slate-700" />
          ))}
        </div>
        <div className="mt-4 space-y-2">
          <div className="h-4 w-full rounded bg-slate-200 dark:bg-slate-700" />
          <div className="h-4 w-3/4 rounded bg-slate-200 dark:bg-slate-700" />
        </div>
        <div className="mt-4 h-10 w-full rounded-lg bg-slate-200 dark:bg-slate-700" />
      </div>

      <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/75 px-6 text-center backdrop-blur-sm dark:bg-slate-900/75">
        <div className="flex size-12 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg shadow-indigo-600/30">
          <Lock className="size-5" />
        </div>
        <h3 className="mt-4 text-base font-semibold text-slate-900 dark:text-slate-50">
          Please Sign In to write a review
        </h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Join the community to share your honest feedback.
        </p>
        <Link
          href="/auth"
          className="mt-4 inline-flex items-center justify-center rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600/40 focus-visible:ring-offset-2"
        >
          Sign In
        </Link>
      </div>
    </div>
  )
}

function ReviewFormSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
      <div className="h-5 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
      <div className="mt-4 flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="size-7 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        ))}
      </div>
      <div className="mt-4 h-24 w-full animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
      <div className="mt-4 h-11 w-full animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
    </div>
  )
}
