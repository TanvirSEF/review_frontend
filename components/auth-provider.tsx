"use client"

import * as React from "react"

import type { User } from "@/lib/apiClient"
import { getToken, getUser } from "@/lib/session"

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isReady: boolean
}

const SERVER_STATE: AuthState = {
  user: null,
  isAuthenticated: false,
  isReady: false,
}

type AuthListener = () => void
const listeners = new Set<AuthListener>()

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

export function notifyAuth(): void {
  snapshotCache = null
  listeners.forEach((listener) => listener())
}

const AuthContext = React.createContext<AuthState>(SERVER_STATE)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const state = React.useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  )
  const value = React.useMemo(() => state, [state])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuthContext(): AuthState {
  return React.useContext(AuthContext)
}
