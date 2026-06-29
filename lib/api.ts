/**
 * Backend API contract — single source of truth for endpoints and shapes.
 *
 * NOTE: this is wired to the *real* ReviewDibo backend, not the idealised
 * `/api/auth/register` + `/api/auth/token` contract. To migrate, change only
 * the paths/bodies in `registerUser` / `loginUser` below — the rest of the app
 * (hooks, session, UI) consumes the typed functions and never touches fetch.
 */

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? ""

// ---- Shared types ---------------------------------------------------------

/** User entity as returned by the backend `UserResponse`. */
export interface User {
  id: number
  name: string
  email: string
  created_at?: string
}

/** What we persist + expose to the app as the active session. */
export interface AuthSession {
  token: string
  user: User
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

/** Raw token response from the backend OAuth2 login endpoint. */
interface TokenResponse {
  access_token: string
  token_type: string
}

// ---- Errors ---------------------------------------------------------------

/** Typed API error so callers can branch on status (e.g. 401 vs 422). */
export class ApiError extends Error {
  status: number
  constructor(status: number, detail: string) {
    super(detail)
    this.name = "ApiError"
    this.status = status
    this.detail = detail
  }
  detail: string
}

/** Normalise a failed response body into a single human-readable string. */
async function extractApiError(res: Response): Promise<string> {
  try {
    const data = await res.json()
    if (typeof data?.detail === "string") return data.detail
    // FastAPI 422 validation errors come back as an array of {msg, ...}.
    if (Array.isArray(data?.detail)) {
      const msgs = data.detail
        .map((d: { msg?: string }) => d?.msg)
        .filter(Boolean)
      return msgs.length ? msgs.join(", ") : "Invalid input"
    }
    return data?.message ?? `Request failed (${res.status})`
  } catch {
    return `Request failed (${res.status})`
  }
}

// ---- Core fetch -----------------------------------------------------------

async function apiFetch<T>(path: string, init: RequestInit): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${API_BASE_URL}${path}`, init)
  } catch {
    throw new ApiError(0, "Could not reach the server. Check your connection.")
  }
  if (!res.ok) throw new ApiError(res.status, await extractApiError(res))
  return (await res.json()) as T
}

// ---- Endpoints ------------------------------------------------------------

/**
 * Register a new user. The backend (`POST /api/users`) returns the created
 * User but NO token — callers chain `loginUser` to obtain a JWT.
 */
export async function registerUser(input: RegisterInput): Promise<User> {
  return apiFetch<User>("/api/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })
}

/**
 * Log in. The backend (`POST /api/auth/login`) uses OAuth2PasswordRequestForm,
 * so the body is form-encoded with `username` (= email) + `password`.
 * Returns only `{access_token, token_type}` — no user payload.
 */
export async function loginUser(input: LoginInput): Promise<TokenResponse> {
  const form = new URLSearchParams()
  form.set("username", input.email)
  form.set("password", input.password)
  return apiFetch<TokenResponse>("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form.toString(),
  })
}

// ---- JWT ------------------------------------------------------------------

interface JwtPayload {
  sub?: string
  exp?: number
}

/**
 * Decode (NOT verify) the JWT payload. The signature is not checked here —
 * that is the backend's job on every protected request via the Bearer header.
 * We only read the `sub` (user id) to hydrate session metadata client-side.
 * Client-only: uses `atob`.
 */
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
