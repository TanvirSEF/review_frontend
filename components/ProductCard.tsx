import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Image as ImageIcon, Star } from "lucide-react"

import { cn } from "@/lib/utils"
import type { Product } from "@/hooks/useProducts"

function RatingStars({
  rating,
  className,
}: {
  rating: number
  className?: string
}) {
  const filled = Math.min(5, Math.max(0, Math.round(rating)))
  return (
    <div
      className={cn("flex items-center gap-0.5", className)}
      aria-label={`Rated ${rating.toFixed(1)} out of 5`}
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "size-3.5",
            i < filled
              ? "fill-amber-400 text-amber-400"
              : "fill-stone-200 text-stone-200 dark:fill-stone-700 dark:text-stone-700"
          )}
        />
      ))}
    </div>
  )
}

export function ProductCard({
  product,
  index = 0,
}: {
  product: Product
  index?: number
}) {
  const { id, title, description, image_url, average_rating, review_count } =
    product
  const [imgError, setImgError] = React.useState(false)
  const showImage = Boolean(image_url) && !imgError

  return (
    <Link
      href={`/products/${id}`}
      style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
      className="group animate-fade-up flex flex-col overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-stone-300 hover:shadow-xl hover:shadow-stone-900/5 focus-visible:ring-2 focus-visible:ring-stone-900/15 focus-visible:ring-offset-2 focus-visible:outline-none dark:border-stone-800 dark:bg-stone-900 dark:hover:border-stone-700 dark:focus-visible:ring-white/20"
    >
      <div className="relative aspect-4/3 w-full overflow-hidden bg-stone-100 dark:bg-stone-800">
        {showImage ? (
          <Image
            src={image_url as string}
            alt={title}
            fill
            unoptimized
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-stone-100 to-stone-200 dark:from-stone-800 dark:to-stone-700">
            <ImageIcon className="size-12 text-stone-300 dark:text-stone-600" />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-2">
          <RatingStars rating={average_rating} />
          <span className="text-sm font-semibold text-stone-900 dark:text-stone-50">
            {average_rating.toFixed(1)}
          </span>
        </div>

        <h3 className="mt-2.5 line-clamp-1 text-base font-semibold text-stone-900 dark:text-stone-50">
          {title}
        </h3>

        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-stone-500 dark:text-stone-400">
          {description?.trim() || "No description available."}
        </p>

        <div className="mt-5 flex items-center justify-between border-t border-stone-100 pt-4 dark:border-stone-800">
          <span className="text-xs font-medium text-stone-400 dark:text-stone-500">
            {review_count} {review_count === 1 ? "review" : "reviews"}
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-stone-900 transition-colors group-hover:text-amber-600 dark:text-stone-100 dark:group-hover:text-amber-400">
            View details
            <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  )
}

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-stone-200/80 bg-white dark:border-stone-800 dark:bg-stone-900">
      <div className="aspect-4/3 w-full animate-pulse bg-stone-200 dark:bg-stone-800" />
      <div className="flex flex-col gap-3 p-5">
        <div className="flex gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="size-3.5 animate-pulse rounded-full bg-stone-200 dark:bg-stone-800"
            />
          ))}
        </div>
        <div className="h-4 w-3/4 animate-pulse rounded bg-stone-200 dark:bg-stone-800" />
        <div className="h-3 w-full animate-pulse rounded bg-stone-200 dark:bg-stone-800" />
        <div className="h-3 w-2/3 animate-pulse rounded bg-stone-200 dark:bg-stone-800" />
        <div className="mt-2 h-px w-full bg-stone-100 dark:bg-stone-800" />
        <div className="mt-3 h-3 w-1/3 animate-pulse rounded bg-stone-200 dark:bg-stone-800" />
      </div>
    </div>
  )
}
