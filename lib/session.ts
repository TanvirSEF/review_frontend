import type { User } from "@/lib/apiClient"

export const TOKEN_KEY = "token"
export const USER_KEY = "rd_user"

export function isBrowser(): boolean {
  return typeof window !== "undefined"
}

export function saveSession(token: string, user: User): void {
  if (!isBrowser()) return
  window.localStorage.setItem(TOKEN_KEY, token)
  window.localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearSession(): void {
  if (!isBrowser()) return
  window.localStorage.removeItem(TOKEN_KEY)
  window.localStorage.removeItem(USER_KEY)
}

export function getToken(): string | null {
  if (!isBrowser()) return null
  return window.localStorage.getItem(TOKEN_KEY)
}

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
