"use client"

import * as React from "react"
import { PackageSearch, Plus, RefreshCw } from "lucide-react"

import { AddProductDialog } from "@/components/add-product-dialog"
import { ProductCard, ProductCardSkeleton } from "@/components/ProductCard"
import { getApiErrorDetail } from "@/lib/apiClient"
import { useAuth } from "@/hooks/useAuth"
import { useProducts } from "@/hooks/useProducts"

const SKELETON_COUNT = 6

export default function HomePage() {
  const { data: products, isLoading, isError, error, refetch } = useProducts()
  const { user, isReady } = useAuth()
  const [dialogOpen, setDialogOpen] = React.useState(false)

  const isAdmin = isReady && !!user?.is_admin

  return (
    <main className="min-h-svh bg-stone-50 dark:bg-stone-950">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 left-1/2 size-160 -translate-x-1/2 rounded-full bg-amber-200/20 blur-3xl dark:bg-amber-500/10"
        />
        <div className="relative mx-auto max-w-3xl px-4 py-20 text-center sm:py-28">
          <p className="animate-fade-up text-xs font-semibold tracking-[0.22em] text-stone-500 uppercase dark:text-stone-400">
            Trusted by the community
          </p>
          <h1 className="animate-fade-up mt-5 text-4xl font-medium text-balance text-stone-900 sm:text-5xl md:text-6xl dark:text-stone-50">
            Explore trusted product{" "}
            <span className="text-amber-600 dark:text-amber-400">reviews</span>.
          </h1>
          <p className="animate-fade-up mx-auto mt-5 max-w-xl text-base leading-relaxed text-pretty text-stone-500 sm:text-lg dark:text-stone-400">
            Browse honest, community-driven ratings before you buy. Real
            opinions, honest scores, and detailed breakdowns for every product.
          </p>

          {isAdmin && (
            <button
              type="button"
              onClick={() => setDialogOpen(true)}
              style={{ animationDelay: "120ms" }}
              className="animate-fade-up mt-9 inline-flex items-center gap-1.5 rounded-xl bg-stone-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-stone-800 focus-visible:ring-2 focus-visible:ring-stone-900/20 focus-visible:ring-offset-2 focus-visible:outline-none active:translate-y-px dark:bg-white dark:text-stone-900 dark:hover:bg-stone-200 dark:focus-visible:ring-white/30"
            >
              <Plus className="size-4" />
              Add product
            </button>
          )}
        </div>
      </section>

      {/* Product grid */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:py-16">
        <div className="mb-8 flex items-end justify-between border-b border-stone-200 pb-4 dark:border-stone-800">
          <div>
            <h2 className="text-2xl font-medium text-stone-900 dark:text-stone-50">
              All products
            </h2>
            <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
              {products?.length
                ? `${products.length} ${products.length === 1 ? "product" : "products"} to explore`
                : "Rated and reviewed by real users"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading &&
            Array.from({ length: SKELETON_COUNT }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}

          {!isLoading && isError && (
            <div className="col-span-full flex flex-col items-center justify-center gap-4 py-20 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-stone-100 text-stone-500 dark:bg-stone-800 dark:text-stone-400">
                <RefreshCw className="size-6" />
              </div>
              <div>
                <p className="text-base font-semibold text-stone-900 dark:text-stone-50">
                  Couldn&apos;t load products
                </p>
                <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
                  {getApiErrorDetail(error)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => refetch()}
                className="inline-flex items-center gap-1.5 rounded-lg bg-stone-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-stone-800 dark:bg-white dark:text-stone-900 dark:hover:bg-stone-200"
              >
                <RefreshCw className="size-4" />
                Try again
              </button>
            </div>
          )}

          {!isLoading && !isError && products?.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center gap-3 py-20 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-stone-100 text-stone-400 dark:bg-stone-800">
                <PackageSearch className="size-6" />
              </div>
              <p className="text-base font-semibold text-stone-900 dark:text-stone-50">
                No products yet
              </p>
              <p className="text-sm text-stone-500 dark:text-stone-400">
                {isAdmin
                  ? "Add the first product to get started."
                  : "Check back soon — new reviews are on the way."}
              </p>
            </div>
          )}

          {!isLoading &&
            !isError &&
            products?.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
        </div>
      </section>

      {dialogOpen && <AddProductDialog onClose={() => setDialogOpen(false)} />}
    </main>
  )
}
