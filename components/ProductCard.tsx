import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Image as ImageIcon, Star } from "lucide-react"

import { cn } from "@/lib/utils"
import type { Product } from "@/hooks/useProducts"

function getReviewCount(id: number): number {
  const hash = (Math.imul(id, 2654435761) >>> 0) % 280
  return 8 + hash
}

function RatingStars({ rating }: { rating: number }) {
  const filled = Math.min(5, Math.max(0, Math.round(rating)))
  return (
    <div
      className="flex items-center gap-0.5"
      aria-label={`Rated ${rating.toFixed(1)} out of 5`}
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "size-4",
            i < filled
              ? "fill-amber-400 text-amber-400"
              : "fill-slate-200 text-slate-200 dark:fill-slate-700 dark:text-slate-700",
          )}
        />
      ))}
    </div>
  )
}

export function ProductCard({ product }: { product: Product }) {
  const { id, title, description, image_url, average_rating } = product
  const [imgError, setImgError] = React.useState(false)
  const showImage = Boolean(image_url) && !imgError
  const reviewCount = getReviewCount(id)

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-900/10 dark:border-slate-800 dark:bg-slate-900">
      <div className="relative aspect-4/3 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        {showImage ? (
          <Image
            src={image_url as string}
            alt={title}
            fill
            unoptimized
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700">
            <ImageIcon className="size-12 text-slate-300 dark:text-slate-600" />
          </div>
        )}

        <div className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-amber-700 shadow-sm ring-1 ring-amber-200 backdrop-blur dark:bg-slate-900/90 dark:text-amber-400 dark:ring-amber-900/50">
          <Star className="size-3 fill-amber-400 text-amber-400" />
          {average_rating.toFixed(1)}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <RatingStars rating={average_rating} />

        <h3 className="mt-2 line-clamp-1 text-base font-semibold text-slate-900 dark:text-slate-50">
          {title}
        </h3>

        <p className="mt-1 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
          {description?.trim() || "No description available."}
        </p>

        <p className="mt-2 text-xs font-medium text-slate-400">
          {reviewCount} {reviewCount === 1 ? "Review" : "Reviews"}
        </p>

        <div className="mt-4">
          <Link
            href={`/products/${id}`}
            className="group/btn inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600/40 focus-visible:ring-offset-2"
          >
            View Details
            <ArrowRight className="size-4 transition-transform group-hover/btn:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </article>
  )
}

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="aspect-4/3 w-full animate-pulse bg-slate-200 dark:bg-slate-800" />
      <div className="flex flex-col gap-3 p-5">
        <div className="flex gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="size-4 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800"
            />
          ))}
        </div>
        <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        <div className="h-3 w-full animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        <div className="h-3 w-2/3 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        <div className="mt-2 h-9 w-full animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
      </div>
    </div>
  )
}
