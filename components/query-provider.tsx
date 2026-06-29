"use client"

import * as React from "react"
import { QueryClient, QueryClientProvider, isServer } from "@tanstack/react-query"

function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  })
}

let browserQueryClient: QueryClient | undefined

export function getQueryClient(): QueryClient {
  if (isServer) {
    return makeQueryClient()
  }
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient()
  }
  return browserQueryClient
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient()
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
