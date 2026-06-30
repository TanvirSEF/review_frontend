"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, Image as ImageIcon, RefreshCw, Star } from "lucide-react"

import { ReviewForm } from "@/components/ReviewForm"
import { ReviewList } from "@/components/ReviewList"
import { getApiErrorDetail } from "@/lib/apiClient"
import { useProductDetail } from "@/hooks/useProductDetails"
import type { ProductDetail } from "@/hooks/useProductDetails"
import { cn } from "@/lib/utils"

function computeAverage(reviews: { rating: number }[]): number {
  if (reviews.length === 0) return 0
  const total = reviews.reduce((sum, r) => sum + r.rating, 0)
  return total / reviews.length
}

function Stars({ rating, className }: { rating: number; className?: string }) {
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

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>()
  const id = Number(params?.id)
  const { data: product, isLoading, isError, error } = useProductDetail(id)

  if (!id) return <NotFound />
  if (isLoading) return <DetailSkeleton />
  if (isError) return <ErrorState message={getApiErrorDetail(error)} />
  if (!product) return <NotFound />

  return <ProductView product={product} />
}

function ProductView({ product }: { product: ProductDetail }) {
  const [imgError, setImgError] = React.useState(false)
  const showImage = Boolean(product.image_url) && !imgError
  const average = computeAverage(product.reviews)

  return (
    <main className="min-h-svh bg-stone-50 dark:bg-stone-950">
      <div className="mx-auto max-w-7xl px-4 pt-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-500 transition-colors hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-50"
        >
          <ArrowLeft className="size-4" />
          Back to products
        </Link>
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-8 lg:grid-cols-3 lg:py-12">
        {/* Left column — product info + review form */}
        <div className="space-y-8 lg:col-span-1">
          <div className="overflow-hidden rounded-2xl border border-stone-200/80 bg-white dark:border-stone-800 dark:bg-stone-900">
            <div className="relative aspect-square w-full overflow-hidden bg-stone-100 dark:bg-stone-800">
              {showImage ? (
                <Image
                  src={product.image_url as string}
                  alt={product.title}
                  fill
                  unoptimized
                  sizes="(max-width: 1024px) 100vw, 33vw"
                  className="object-cover"
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-stone-100 to-stone-200 dark:from-stone-800 dark:to-stone-700">
                  <ImageIcon className="size-16 text-stone-300 dark:text-stone-600" />
                </div>
              )}
            </div>

            <div className="p-6 sm:p-8">
              <h1 className="text-3xl font-medium text-balance text-stone-900 dark:text-stone-50">
                {product.title}
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-pretty text-stone-600 dark:text-stone-300">
                {product.description?.trim() || "No description available."}
              </p>

              {/* Average rating summary */}
              <div className="mt-6 flex items-center gap-5 border-t border-stone-100 pt-6 dark:border-stone-800">
                <div className="font-heading text-5xl font-medium text-stone-900 dark:text-stone-50">
                  {average.toFixed(1)}
                </div>
                <div>
                  <Stars rating={average} />
                  <p className="mt-1.5 text-xs text-stone-500 dark:text-stone-400">
                    Based on {product.reviews.length}{" "}
                    {product.reviews.length === 1 ? "review" : "reviews"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <ReviewForm product_id={product.id} />
        </div>

        {/* Right column — review timeline */}
        <div className="lg:col-span-2">
          <div className="mb-6 flex items-baseline justify-between border-b border-stone-200 pb-4 dark:border-stone-800">
            <h2 className="text-2xl font-medium text-stone-900 dark:text-stone-50">
              Reviews
              <span className="ml-2 align-middle text-base font-normal text-stone-400">
                {product.reviews.length}
              </span>
            </h2>
          </div>

          <ReviewList reviews={product.reviews} />
        </div>
      </div>
    </main>
  )
}

function NotFound() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-3 bg-stone-50 px-4 text-center dark:bg-stone-950">
      <p className="font-heading text-3xl font-medium text-stone-900 dark:text-stone-50">
        Product not found
      </p>
      <p className="text-sm text-stone-500 dark:text-stone-400">
        The product you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link
        href="/"
        className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-stone-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-stone-800 dark:bg-white dark:text-stone-900 dark:hover:bg-stone-200"
      >
        <ArrowLeft className="size-4" />
        Back to products
      </Link>
    </main>
  )
}

function ErrorState({ message }: { message: string }) {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 bg-stone-50 px-4 text-center dark:bg-stone-950">
      <div className="flex size-12 items-center justify-center rounded-full bg-stone-100 text-stone-500 dark:bg-stone-800 dark:text-stone-400">
        <RefreshCw className="size-6" />
      </div>
      <div>
        <p className="font-heading text-2xl font-medium text-stone-900 dark:text-stone-50">
          Couldn&apos;t load this product
        </p>
        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
          {message}
        </p>
      </div>
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 rounded-lg bg-stone-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-stone-800 dark:bg-white dark:text-stone-900 dark:hover:bg-stone-200"
      >
        Back to products
      </Link>
    </main>
  )
}

function DetailSkeleton() {
  return (
    <main className="min-h-svh bg-stone-50 dark:bg-stone-950">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-1">
          <div className="overflow-hidden rounded-2xl border border-stone-200/80 bg-white dark:border-stone-800 dark:bg-stone-900">
            <div className="aspect-square w-full animate-pulse bg-stone-200 dark:bg-stone-800" />
            <div className="p-8">
              <div className="h-8 w-3/4 animate-pulse rounded bg-stone-200 dark:bg-stone-800" />
              <div className="mt-4 h-4 w-full animate-pulse rounded bg-stone-200 dark:bg-stone-800" />
              <div className="mt-2 h-4 w-5/6 animate-pulse rounded bg-stone-200 dark:bg-stone-800" />
              <div className="mt-6 h-px w-full bg-stone-100 dark:bg-stone-800" />
              <div className="mt-6 flex gap-4">
                <div className="size-12 animate-pulse rounded bg-stone-200 dark:bg-stone-800" />
                <div className="flex-1 space-y-2 pt-1">
                  <div className="h-4 w-24 animate-pulse rounded bg-stone-200 dark:bg-stone-800" />
                  <div className="h-3 w-16 animate-pulse rounded bg-stone-200 dark:bg-stone-800" />
                </div>
              </div>
            </div>
          </div>
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
        </div>

        <div className="space-y-4 lg:col-span-2">
          <div className="h-8 w-40 animate-pulse rounded bg-stone-200 dark:bg-stone-800" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-28 w-full animate-pulse rounded-2xl bg-stone-200 dark:bg-stone-800"
            />
          ))}
        </div>
      </div>
    </main>
  )
}
