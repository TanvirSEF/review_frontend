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

  const ratingError =
    ratingTouched && rating === 0 ? "Please select a rating" : null
  const apiError = createReview.isError
    ? getApiErrorDetail(createReview.error)
    : null
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
      }
    )
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl border border-stone-200/80 bg-white p-6 dark:border-stone-800 dark:bg-stone-900"
    >
      <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-50">
        Write a review
      </h2>

      <div className="mt-4">
        <label className="mb-2 block text-sm font-medium text-stone-700 dark:text-stone-300">
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
              className="rounded-md p-0.5 transition-transform hover:scale-110 focus-visible:ring-2 focus-visible:ring-stone-900/20 focus-visible:outline-none dark:focus-visible:ring-white/30"
            >
              <Star
                className={cn(
                  "size-7 transition-colors",
                  value <= display
                    ? "fill-amber-400 text-amber-400"
                    : "fill-stone-200 text-stone-300 dark:fill-stone-700 dark:text-stone-600"
                )}
              />
            </button>
          ))}
          {rating > 0 && (
            <span className="ml-2 text-sm font-medium text-stone-500 dark:text-stone-400">
              {rating}/5
            </span>
          )}
        </div>
        {ratingError && (
          <p className="mt-1.5 text-xs font-medium text-red-600">
            {ratingError}
          </p>
        )}
      </div>

      <div className="mt-4">
        <label
          htmlFor="comment"
          className="mb-2 block text-sm font-medium text-stone-700 dark:text-stone-300"
        >
          Your review{" "}
          <span className="font-normal text-stone-400">(optional)</span>
        </label>
        <textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          maxLength={1000}
          placeholder="Share your honest experience with this product…"
          className="w-full resize-y rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 transition outline-none placeholder:text-stone-400 focus:border-stone-900 focus:ring-4 focus:ring-stone-900/10 disabled:opacity-60 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100 dark:focus:border-white dark:focus:ring-white/10"
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
          "mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-stone-900 px-4 text-sm font-semibold text-white shadow-sm transition-all",
          "hover:bg-stone-800 focus-visible:ring-2 focus-visible:ring-stone-900/20 focus-visible:ring-offset-2 focus-visible:outline-none active:translate-y-px",
          "disabled:cursor-not-allowed disabled:opacity-70 dark:bg-white dark:text-stone-900 dark:hover:bg-stone-200 dark:focus-visible:ring-white/30"
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
    <div className="relative overflow-hidden rounded-2xl border border-stone-200/80 bg-white p-6 dark:border-stone-800 dark:bg-stone-900">
      <div className="pointer-events-none opacity-60 blur-sm select-none">
        <div className="flex gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className="size-7 fill-stone-200 text-stone-200 dark:fill-stone-700"
            />
          ))}
        </div>
        <div className="mt-4 space-y-2">
          <div className="h-4 w-full rounded bg-stone-200 dark:bg-stone-700" />
          <div className="h-4 w-3/4 rounded bg-stone-200 dark:bg-stone-700" />
        </div>
        <div className="mt-4 h-10 w-full rounded-lg bg-stone-200 dark:bg-stone-700" />
      </div>

      <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/75 px-6 text-center backdrop-blur-sm dark:bg-stone-900/75">
        <div className="flex size-12 items-center justify-center rounded-full bg-stone-900 text-white shadow-lg dark:bg-white dark:text-stone-900">
          <Lock className="size-5" />
        </div>
        <h3 className="mt-4 text-base font-semibold text-stone-900 dark:text-stone-50">
          Please sign in to write a review
        </h3>
        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
          Join the community to share your honest feedback.
        </p>
        <Link
          href="/auth"
          className="mt-4 inline-flex items-center justify-center rounded-lg bg-stone-900 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-stone-800 focus-visible:ring-2 focus-visible:ring-stone-900/20 focus-visible:ring-offset-2 focus-visible:outline-none dark:bg-white dark:text-stone-900 dark:hover:bg-stone-200"
        >
          Sign in
        </Link>
      </div>
    </div>
  )
}

function ReviewFormSkeleton() {
  return (
    <div className="rounded-2xl border border-stone-200/80 bg-white p-6 dark:border-stone-800 dark:bg-stone-900">
      <div className="h-5 w-32 animate-pulse rounded bg-stone-200 dark:bg-stone-800" />
      <div className="mt-4 flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="size-7 animate-pulse rounded bg-stone-200 dark:bg-stone-800"
          />
        ))}
      </div>
      <div className="mt-4 h-24 w-full animate-pulse rounded-lg bg-stone-200 dark:bg-stone-800" />
      <div className="mt-4 h-11 w-full animate-pulse rounded-lg bg-stone-200 dark:bg-stone-800" />
    </div>
  )
}
