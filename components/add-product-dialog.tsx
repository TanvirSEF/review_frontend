"use client"

import * as React from "react"
import { Loader2, X } from "lucide-react"

import { getApiErrorDetail } from "@/lib/apiClient"
import { useCreateProduct } from "@/hooks/useProducts"
import { cn } from "@/lib/utils"

export function AddProductDialog({ onClose }: { onClose: () => void }) {
  const createProduct = useCreateProduct()
  const [title, setTitle] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [imageUrl, setImageUrl] = React.useState("")
  const [touched, setTouched] = React.useState(false)

  React.useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])

  const titleError = touched && !title.trim() ? "Title is required" : null
  const apiError = createProduct.isError ? getApiErrorDetail(createProduct.error) : null
  const pending = createProduct.isPending

  function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    setTouched(true)
    if (!title.trim()) return
    createProduct.mutate(
      {
        title: title.trim(),
        description: description.trim() || undefined,
        image_url: imageUrl.trim() || undefined,
      },
      { onSuccess: () => onClose() },
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Add a product</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
          >
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="product-title"
              className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Title
            </label>
            <input
              id="product-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Wireless Mouse"
              className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/15 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
            {titleError && (
              <p className="mt-1.5 pl-1 text-xs font-medium text-red-600">{titleError}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="product-description"
              className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Description <span className="font-normal text-slate-400">(optional)</span>
            </label>
            <textarea
              id="product-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Short description…"
              className="w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/15 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>

          <div>
            <label
              htmlFor="product-image"
              className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Image URL <span className="font-normal text-slate-400">(optional)</span>
            </label>
            <input
              id="product-image"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://…"
              className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/15 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>

          {apiError && (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300"
            >
              {apiError}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={pending}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-500",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600/40 focus-visible:ring-offset-2",
                "disabled:cursor-not-allowed disabled:opacity-70",
              )}
            >
              {pending && <Loader2 className="size-4 animate-spin" />}
              {pending ? "Adding…" : "Add product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
