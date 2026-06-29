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
  const filled = Math.min(5, Math.max(0, Math.round(average)))

  return (
    <main className="min-h-svh bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 pt-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
        >
          <ArrowLeft className="size-4" />
          Back to products
        </Link>
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-8 lg:grid-cols-3">
        {/* Left column — product info + review form */}
        <div className="space-y-6 lg:col-span-1">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <div className="relative aspect-square w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
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
                <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700">
                  <ImageIcon className="size-16 text-slate-300 dark:text-slate-600" />
                </div>
              )}
            </div>

            <div className="p-6">
              <h1 className="text-balance text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                {product.title}
              </h1>
              <p className="mt-3 text-pretty text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {product.description?.trim() || "No description available."}
              </p>

              {/* Average rating summary banner */}
              <div className="mt-5 flex items-center gap-4 rounded-xl border border-indigo-100 bg-linear-to-br from-indigo-50 to-slate-50 p-4 dark:border-indigo-900/40 dark:from-indigo-950/40 dark:to-slate-900">
                <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                  {average.toFixed(1)}
                </div>
                <div>
                  <div className="flex gap-0.5">
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
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
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
          <div className="mb-5 flex items-baseline justify-between">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
              Reviews
              <span className="ml-2 text-base font-normal text-slate-400">
                ({product.reviews.length})
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
    <main className="flex min-h-svh flex-col items-center justify-center gap-3 bg-slate-50 px-4 text-center dark:bg-slate-950">
      <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">Product not found</p>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        The product you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link
        href="/"
        className="mt-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
      >
        Back to products
      </Link>
    </main>
  )
}

function ErrorState({ message }: { message: string }) {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 bg-slate-50 px-4 text-center dark:bg-slate-950">
      <div className="flex size-12 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400">
        <RefreshCw className="size-6" />
      </div>
      <div>
        <p className="text-lg font-semibold text-slate-900 dark:text-slate-50">
          Couldn&apos;t load this product
        </p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{message}</p>
      </div>
      <Link
        href="/"
        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
      >
        Back to products
      </Link>
    </main>
  )
}

function DetailSkeleton() {
  return (
    <main className="min-h-svh bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-1">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <div className="aspect-square w-full animate-pulse bg-slate-200 dark:bg-slate-800" />
            <div className="p-6">
              <div className="h-7 w-3/4 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
              <div className="mt-4 h-4 w-full animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
              <div className="mt-2 h-4 w-5/6 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
              <div className="mt-5 h-20 w-full animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
            </div>
          </div>
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
        </div>

        <div className="space-y-4 lg:col-span-2">
          <div className="h-7 w-40 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-28 w-full animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800"
            />
          ))}
        </div>
      </div>
    </main>
  )
}
