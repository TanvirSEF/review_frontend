"use client"

import { useMutation } from "@tanstack/react-query"
import { useRouter } from "next/navigation"

import {
  decodeJwt,
  loginUser,
  registerUser,
  type AuthSession,
  type LoginInput,
  type RegisterInput,
  type User,
} from "@/lib/apiClient"
import { clearSession, saveSession } from "@/lib/session"
import { getQueryClient } from "@/components/query-provider"
import { notifyAuth, useAuthContext } from "@/components/auth-provider"

function userFromToken(token: string): User {
  const payload = decodeJwt(token)
  const id = payload?.sub !== undefined ? Number(payload.sub) : Number.NaN
  return {
    id: Number.isNaN(id) ? 0 : id,
    name: "",
    email: "",
  }
}

export function useLogin() {
  const router = useRouter()

  return useMutation<AuthSession, Error, LoginInput>({
    mutationKey: ["auth", "login"],
    mutationFn: async (input) => {
      const { access_token } = await loginUser(input)
      return { token: access_token, user: userFromToken(access_token) }
    },
    onSuccess: ({ token, user }) => {
      saveSession(token, user)
      notifyAuth()
      router.push("/")
    },
  })
}

export function useRegister() {
  const router = useRouter()

  return useMutation<AuthSession, Error, RegisterInput>({
    mutationKey: ["auth", "register"],
    mutationFn: async (input) => {
      const created = await registerUser(input)
      const { access_token } = await loginUser({
        email: input.email,
        password: input.password,
      })
      return { token: access_token, user: created }
    },
    onSuccess: ({ token, user }) => {
      saveSession(token, user)
      notifyAuth()
      router.push("/")
    },
  })
}

export function logout(): void {
  clearSession()
  getQueryClient().invalidateQueries()
  notifyAuth()
}

export function useAuth() {
  return useAuthContext()
}
