import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  apiClient,
  createProduct,
  type CreateProductInput,
} from "@/lib/apiClient"

export interface Product {
  id: number
  title: string
  description: string | null
  image_url: string | null
  average_rating: number
  review_count: number
}

export async function fetchProducts(): Promise<Product[]> {
  const { data } = await apiClient.get<Product[]>("/api/products")
  return data
}

export function useProducts() {
  return useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  })
}

export function useCreateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateProductInput) => createProduct(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] })
    },
  })
}
