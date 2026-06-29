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
    <main className="min-h-svh bg-slate-50 dark:bg-slate-950">
      {/* Hero */}
      <section className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 py-12 text-center sm:py-16">
          <span className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:ring-indigo-900/50">
            Trusted by the community
          </span>
          <h1 className="mx-auto mt-5 max-w-3xl text-balance text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-4xl md:text-5xl">
            Explore Trusted Product Reviews
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-base text-slate-500 dark:text-slate-400">
            Browse honest, community-driven ratings before you buy. Real opinions,
            honest scores, and detailed breakdowns for every product.
          </p>

          {isAdmin && (
            <button
              type="button"
              onClick={() => setDialogOpen(true)}
              className="mt-6 inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition-colors hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600/40 focus-visible:ring-offset-2"
            >
              <Plus className="size-4" />
              Add product
            </button>
          )}
        </div>
      </section>

      {/* Product grid */}
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-8 md:grid-cols-3">
        {isLoading &&
          Array.from({ length: SKELETON_COUNT }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}

        {!isLoading && isError && (
          <div className="col-span-full flex flex-col items-center justify-center gap-4 py-20 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400">
              <RefreshCw className="size-6" />
            </div>
            <div>
              <p className="text-base font-semibold text-slate-900 dark:text-slate-50">
                Couldn&apos;t load products
              </p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {getApiErrorDetail(error)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => refetch()}
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
            >
              <RefreshCw className="size-4" />
              Try again
            </button>
          </div>
        )}

        {!isLoading && !isError && products?.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center gap-3 py-20 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800">
              <PackageSearch className="size-6" />
            </div>
            <p className="text-base font-semibold text-slate-900 dark:text-slate-50">
              No products yet
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {isAdmin
                ? "Add the first product to get started."
                : "Check back soon — new reviews are on the way."}
            </p>
          </div>
        )}

        {!isLoading &&
          !isError &&
          products?.map((product) => <ProductCard key={product.id} product={product} />)}
      </div>

      {dialogOpen && <AddProductDialog onClose={() => setDialogOpen(false)} />}
    </main>
  )
}
