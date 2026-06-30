"use client"

import * as React from "react"
import { Loader2, X } from "lucide-react"

import { getApiErrorDetail } from "@/lib/apiClient"
import { useUpdateProduct } from "@/hooks/useProducts"
import type { ProductDetail } from "@/hooks/useProductDetails"
import { cn } from "@/lib/utils"

type EditableProduct = Pick<
  ProductDetail,
  "id" | "title" | "description" | "image_url"
>

export function EditProductDialog({
  product,
  onClose,
}: {
  product: EditableProduct
  onClose: () => void
}) {
  const updateProduct = useUpdateProduct()
  const [title, setTitle] = React.useState(product.title)
  const [description, setDescription] = React.useState(
    product.description ?? ""
  )
  const [imageUrl, setImageUrl] = React.useState(product.image_url ?? "")
  const [touched, setTouched] = React.useState(false)

  React.useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])

  const titleError = touched && !title.trim() ? "Title is required" : null
  const apiError = updateProduct.isError
    ? getApiErrorDetail(updateProduct.error)
    : null
  const pending = updateProduct.isPending

  function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    setTouched(true)
    if (!title.trim()) return
    updateProduct.mutate(
      {
        id: product.id,
        title: title.trim(),
        description: description.trim() || undefined,
        image_url: imageUrl.trim() || undefined,
      },
      { onSuccess: () => onClose() }
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-stone-900/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="animate-fade-up relative z-10 w-full max-w-md rounded-2xl border border-stone-200 bg-white p-6 shadow-2xl dark:border-stone-800 dark:bg-stone-900">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-heading text-lg font-medium text-stone-900 dark:text-stone-50">
            Edit product
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600 dark:hover:bg-stone-800"
          >
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="edit-product-title"
              className="mb-1.5 block text-sm font-medium text-stone-700 dark:text-stone-300"
            >
              Title
            </label>
            <input
              id="edit-product-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Wireless Mouse"
              className="h-11 w-full rounded-lg border border-stone-200 bg-white px-3 text-sm text-stone-900 transition outline-none placeholder:text-stone-400 focus:border-stone-900 focus:ring-4 focus:ring-stone-900/10 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100 dark:focus:border-white dark:focus:ring-white/10"
            />
            {titleError && (
              <p className="mt-1.5 pl-1 text-xs font-medium text-red-600">
                {titleError}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="edit-product-description"
              className="mb-1.5 block text-sm font-medium text-stone-700 dark:text-stone-300"
            >
              Description{" "}
              <span className="font-normal text-stone-400">(optional)</span>
            </label>
            <textarea
              id="edit-product-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Short description…"
              className="w-full resize-y rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 transition outline-none placeholder:text-stone-400 focus:border-stone-900 focus:ring-4 focus:ring-stone-900/10 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100 dark:focus:border-white dark:focus:ring-white/10"
            />
          </div>

          <div>
            <label
              htmlFor="edit-product-image"
              className="mb-1.5 block text-sm font-medium text-stone-700 dark:text-stone-300"
            >
              Image URL{" "}
              <span className="font-normal text-stone-400">(optional)</span>
            </label>
            <input
              id="edit-product-image"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://…"
              className="h-11 w-full rounded-lg border border-stone-200 bg-white px-3 text-sm text-stone-900 transition outline-none placeholder:text-stone-400 focus:border-stone-900 focus:ring-4 focus:ring-stone-900/10 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100 dark:focus:border-white dark:focus:ring-white/10"
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
              disabled={pending}
              className="rounded-lg px-4 py-2 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-100 disabled:opacity-70 dark:text-stone-300 dark:hover:bg-stone-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={pending}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg bg-stone-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-stone-800",
                "focus-visible:ring-2 focus-visible:ring-stone-900/20 focus-visible:ring-offset-2 focus-visible:outline-none",
                "disabled:cursor-not-allowed disabled:opacity-70 dark:bg-white dark:text-stone-900 dark:hover:bg-stone-200"
              )}
            >
              {pending && <Loader2 className="size-4 animate-spin" />}
              Save changes
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
