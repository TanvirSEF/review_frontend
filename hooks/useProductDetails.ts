import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { apiClient } from "@/lib/apiClient"

export interface Review {
  id: number
  product_id: number
  user_id: number
  rating: number
  comment: string | null
  created_at: string
  user: string
}

export interface ProductDetail {
  id: number
  title: string
  description: string | null
  image_url: string | null
  reviews: Review[]
}

export interface CreateReviewInput {
  product_id: number
  rating: number
  comment: string
}

export interface UpdateReviewInput {
  id: number
  product_id: number
  rating: number
  comment: string
}

export interface DeleteReviewInput {
  id: number
  product_id: number
}

export async function fetchProductDetail(id: number): Promise<ProductDetail> {
  const { data } = await apiClient.get<ProductDetail>(`/api/products/${id}`)
  return data
}

export async function createReview(input: CreateReviewInput): Promise<Review> {
  const { data } = await apiClient.post<Review>("/api/reviews", input)
  return data
}

export async function updateReview(input: UpdateReviewInput): Promise<Review> {
  const { data } = await apiClient.put<Review>(`/api/reviews/${input.id}`, {
    rating: input.rating,
    comment: input.comment,
  })
  return data
}

export async function deleteReview(input: DeleteReviewInput): Promise<void> {
  await apiClient.delete(`/api/reviews/${input.id}`)
}

export function useProductDetail(id: number) {
  return useQuery({
    queryKey: ["products", id],
    queryFn: () => fetchProductDetail(id),
    enabled: Boolean(id),
  })
}

export function useCreateReview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateReviewInput) => createReview(input),
    onSuccess: (_review, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["products", variables.product_id],
      })
      queryClient.invalidateQueries({ queryKey: ["products"] })
    },
  })
}

export function useUpdateReview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateReviewInput) => updateReview(input),
    onSuccess: (_review, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["products", variables.product_id],
      })
      queryClient.invalidateQueries({ queryKey: ["products"] })
    },
  })
}

export function useDeleteReview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: DeleteReviewInput) => deleteReview(input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["products", variables.product_id],
      })
      queryClient.invalidateQueries({ queryKey: ["products"] })
    },
  })
}
