import axios, { AxiosError, type AxiosInstance } from "axios"

import { getToken } from "@/lib/session"

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? ""

export interface User {
  id: number
  name: string
  email: string
  created_at?: string
}

export interface RegisterInput {
  name: string
  email: string
  password: string
}

export interface LoginInput {
  email: string
  password: string
}

export interface TokenResponse {
  access_token: string
  token_type: string
}

export interface AuthSession {
  token: string
  user: User
}

/**
 * Shared Axios instance for the whole app. A request interceptor attaches the
 * stored JWT as `Authorization: Bearer <token>` on every call (client-only),
 * so protected endpoints just work once a session is persisted.
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15_000,
  headers: { "Content-Type": "application/json" },
})

apiClient.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`)
  }
  return config
})

/** Register a new user. `POST /api/users` accepts JSON and returns the User. */
export async function registerUser(input: RegisterInput): Promise<User> {
  const { data } = await apiClient.post<User>("/api/users", input)
  return data
}

/**
 * Log in. `POST /api/auth/login` parses OAuth2PasswordRequestForm, so the body
 * is form-encoded with `username` (= email) + `password`. Returns only the
 * token pair — no user payload.
 */
export async function loginUser(input: LoginInput): Promise<TokenResponse> {
  const form = new URLSearchParams()
  form.set("username", input.email)
  form.set("password", input.password)
  const { data } = await apiClient.post<TokenResponse>("/api/auth/login", form.toString(), {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  })
  return data
}

interface JwtPayload {
  sub?: string
  exp?: number
}

/** Decode (not verify) a JWT payload. Client-only — uses atob. */
export function decodeJwt(token: string): JwtPayload | null {
  try {
    const part = token.split(".")[1]
    if (!part) return null
    const base64 = part.replace(/-/g, "+").replace(/_/g, "/")
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join(""),
    )
    return JSON.parse(json) as JwtPayload
  } catch {
    return null
  }
}

/**
 * Pull a human-readable message out of any error, preferring the backend's
 * `error.response.data.detail` (FastAPI returns this for 400/401/422 etc.).
 */
export function getApiErrorDetail(error: unknown): string {
  if (error instanceof AxiosError) {
    const detail = (error.response?.data as { detail?: unknown } | undefined)?.detail
    if (typeof detail === "string") return detail
    if (Array.isArray(detail)) {
      const msgs = detail.map((d) => (d as { msg?: string })?.msg).filter(Boolean)
      if (msgs.length) return msgs.join(", ")
    }
    if (error.code === "ERR_NETWORK") {
      return "Could not reach the server. Check your connection."
    }
    return error.message || `Request failed (${error.response?.status ?? "?"})`
  }
  if (error instanceof Error) return error.message
  return "Something went wrong. Try again."
}
