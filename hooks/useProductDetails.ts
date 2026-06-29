import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { apiClient } from "@/lib/apiClient"

export interface Review {
  id: number
  product_id: number
  rating: number
  comment: string | null
  created_at: string
  /** Reviewer's display name (already a string from the backend). */
  user: string
}

export interface ProductDetail {
  id: number
  title: string
  description: string | null
  image_url: string | null
  /** Newest first (pre-sorted by the backend). */
  reviews: Review[]
}

export interface CreateReviewInput {
  product_id: number
  rating: number
  comment: string
}

export async function fetchProductDetail(id: number): Promise<ProductDetail> {
  const { data } = await apiClient.get<ProductDetail>(`/api/products/${id}`)
  return data
}

export async function createReview(input: CreateReviewInput): Promise<Review> {
  const { data } = await apiClient.post<Review>("/api/reviews", input)
  return data
}

export function useProductDetail(id: number) {
  return useQuery({
    queryKey: ["products", id],
    queryFn: () => fetchProductDetail(id),
    enabled: Boolean(id),
  })
}

/**
 * Create a review, then invalidate the product detail + list caches so the
 * review timeline and rating averages refetch reactively in the background —
 * no page reload.
 */
export function useCreateReview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateReviewInput) => createReview(input),
    onSuccess: (_review, variables) => {
      queryClient.invalidateQueries({ queryKey: ["products", variables.product_id] })
      queryClient.invalidateQueries({ queryKey: ["products"] })
    },
  })
}
