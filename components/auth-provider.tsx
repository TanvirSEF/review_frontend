"use client"

import * as React from "react"

import type { User } from "@/lib/apiClient"
import { getToken, getUser } from "@/lib/session"

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isReady: boolean
}

/**
 * Server / first-client-paint snapshot. Always unauthenticated and not ready —
 * identical on server and client, which is what keeps hydration stable. The
 * real value resolves from localStorage after mount via `getSnapshot`.
 */
const SERVER_STATE: AuthState = {
  user: null,
  isAuthenticated: false,
  isReady: false,
}

type AuthListener = () => void
const listeners = new Set<AuthListener>()

// Cached snapshot so `getSnapshot` returns a stable reference until the store
// changes (required by useSyncExternalStore to avoid render loops).
let snapshotCache: AuthState | null = null

function computeSnapshot(): AuthState {
  return {
    user: getUser(),
    isAuthenticated: !!getToken(),
    isReady: true,
  }
}

function getSnapshot(): AuthState {
  if (snapshotCache === null) snapshotCache = computeSnapshot()
  return snapshotCache
}

function getServerSnapshot(): AuthState {
  return SERVER_STATE
}

function subscribe(listener: AuthListener): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/**
 * Invalidate the cached snapshot and notify subscribers. Called by the login /
 * register mutations and by `logout()` (in hooks/useAuth.ts) after they write
 * or clear storage, so the global auth state updates immediately.
 */
export function notifyAuth(): void {
  snapshotCache = null
  listeners.forEach((listener) => listener())
}

const AuthContext = React.createContext<AuthState>(SERVER_STATE)

/**
 * Global auth state provider. Uses `useSyncExternalStore` so that:
 *  - SSR and the first client render both see `SERVER_STATE` (no hydration
 *    mismatch), then
 *  - it switches to the real localStorage-backed state after mount.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const state = React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const value = React.useMemo(() => state, [state])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuthContext(): AuthState {
  return React.useContext(AuthContext)
}
