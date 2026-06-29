import axios, { AxiosError, type AxiosInstance } from "axios"

import { getToken } from "@/lib/session"

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? ""

export interface User {
  id: number
  name: string
  email: string
  is_admin?: boolean
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

export async function registerUser(input: RegisterInput): Promise<User> {
  const { data } = await apiClient.post<User>("/api/users", input)
  return data
}

export async function loginUser(input: LoginInput): Promise<TokenResponse> {
  const form = new URLSearchParams()
  form.set("username", input.email)
  form.set("password", input.password)
  const { data } = await apiClient.post<TokenResponse>("/api/auth/login", form.toString(), {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  })
  return data
}

export interface CreateProductInput {
  title: string
  description?: string
  image_url?: string
}

export async function createProduct(input: CreateProductInput): Promise<void> {
  await apiClient.post("/api/products", input)
}

interface JwtPayload {
  sub?: string
  exp?: number
  is_admin?: boolean
}

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
