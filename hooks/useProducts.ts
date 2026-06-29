import { useQuery } from "@tanstack/react-query"

import { apiClient } from "@/lib/apiClient"

export interface Product {
  id: number
  title: string
  description: string | null
  image_url: string | null
  average_rating: number
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
