/**
 * SSR-safe localStorage session layer.
 *
 * Every access is guarded by `isBrowser()` so these functions are safe to call
 * from server components / module scope / render. They must never be read
 * *during render* if the result drives UI that differs between server and
 * client — that is the hydration-mismatch trap. Use them in event handlers,
 * mutation callbacks, effects, or the `useSession()` hook (which resolves
 * post-mount). See hooks/useAuth.ts.
 */

import type { User } from "@/lib/api"

export const TOKEN_KEY = "token"
export const USER_KEY = "rd_user"

export function isBrowser(): boolean {
  return typeof window !== "undefined"
}

/** Persist the JWT (as "token") + the user payload. No-op on the server. */
export function saveSession(token: string, user: User): void {
  if (!isBrowser()) return
  window.localStorage.setItem(TOKEN_KEY, token)
  window.localStorage.setItem(USER_KEY, JSON.stringify(user))
}

/** Remove all auth entries from localStorage. No-op on the server. */
export function clearSession(): void {
  if (!isBrowser()) return
  window.localStorage.removeItem(TOKEN_KEY)
  window.localStorage.removeItem(USER_KEY)
}

/** Read the stored JWT, or null (server returns null). */
export function getToken(): string | null {
  if (!isBrowser()) return null
  return window.localStorage.getItem(TOKEN_KEY)
}

/** Read the stored user payload, or null (server returns null). */
export function getUser(): User | null {
  if (!isBrowser()) return null
  const raw = window.localStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as User
  } catch {
    return null
  }
}
