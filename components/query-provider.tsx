"use client"

/**
 * TanStack Query provider using the recommended singleton-per-browser pattern
 * for the Next.js App Router. The QueryClient is created once on the client
 * (stable across renders / HMR) and fresh per request on the server.
 *
 * `getQueryClient` is exported so non-hook code (e.g. the synchronous
 * `logout()` in hooks/useAuth.ts) can access the same client instance.
 */

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
    // Always make a new client on the server — never share across requests.
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
