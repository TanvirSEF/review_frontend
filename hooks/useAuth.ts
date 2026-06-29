"use client"

/**
 * Auth State Engine — TanStack Query mutations + session persistence.
 *
 * - `useRegister()` / `useLogin()` run the network calls, then persist the
 *   returned JWT (localStorage "token") + user payload, and warm the query
 *   cache so any subscribed UI updates without a refetch.
 * - `logout()` is a synchronous, hook-free helper that purges storage and
 *   resets query state (the backend has no revoke endpoint; JWTs are stateless
 *   and live until expiry — see the security note in lib/session.ts / README).
 * - `useSession()` reads the session SSR-safely: it returns `pending` on the
 *   server/first paint and resolves from localStorage after mount, so it never
 *   drives divergent server/client markup (no hydration mismatch).
 *
 * Persistence only ever runs in mutation callbacks (client-side) — never during
 * render — which is what keeps Next.js hydration stable.
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"

import {
  ApiError,
  decodeJwt,
  loginUser,
  registerUser,
  type AuthSession,
  type LoginInput,
  type RegisterInput,
  type User,
} from "@/lib/api"
import { clearSession, getUser, saveSession } from "@/lib/session"
import { getQueryClient } from "@/components/query-provider"

export const authKeys = {
  session: ["auth", "session"] as const,
}

// ---- helpers --------------------------------------------------------------

/**
 * Build an `AuthSession` from a raw JWT. The token only carries the user id
 * (`sub`), so name/email are optional and filled in when the caller has them
 * (e.g. from the register response). Returns null if the token is malformed.
 */
function sessionFromToken(
  token: string,
  fallback?: Pick<User, "name" | "email" | "created_at">,
): AuthSession | null {
  const payload = decodeJwt(token)
  const id = payload?.sub !== undefined ? Number(payload.sub) : Number.NaN
  if (!payload || Number.isNaN(id)) return null
  return {
    token,
    user: {
      id,
      name: fallback?.name ?? "",
      email: fallback?.email ?? "",
      created_at: fallback?.created_at,
    },
  }
}

// ---- mutations ------------------------------------------------------------

export function useRegister() {
  const qc = useQueryClient()
  const router = useRouter()

  return useMutation<AuthSession, ApiError, RegisterInput>({
    mutationKey: ["auth", "register"],
    mutationFn: async (input) => {
      // Backend POST /api/users returns the User but no token -> auto-login
      // to obtain a JWT, then enrich the session with the register payload.
      const created = await registerUser(input)
      const { access_token } = await loginUser({
        email: input.email,
        password: input.password,
      })
      const session = sessionFromToken(access_token, created)
      if (!session) {
        throw new ApiError(401, "Account created, but the login token was invalid.")
      }
      return session
    },
    onSuccess: (session) => {
      saveSession(session.token, session.user)
      qc.setQueryData(authKeys.session, session.user)
      router.push("/")
    },
  })
}

export function useLogin() {
  const qc = useQueryClient()
  const router = useRouter()

  return useMutation<AuthSession, ApiError, LoginInput>({
    mutationKey: ["auth", "login"],
    mutationFn: async (input) => {
      const { access_token } = await loginUser(input)
      const session = sessionFromToken(access_token)
      if (!session) {
        throw new ApiError(401, "Login succeeded, but the token was invalid.")
      }
      return session
    },
    onSuccess: (session) => {
      saveSession(session.token, session.user)
      qc.setQueryData(authKeys.session, session.user)
      router.push("/")
    },
  })
}

// ---- logout ---------------------------------------------------------------

/**
 * Synchronous logout: purge localStorage auth entries and reset all query
 * state. Safe to call from anywhere (client). The JWT itself cannot be revoked
 * server-side (stateless) — it simply stops being stored or sent.
 */
export function logout(): void {
  clearSession()
  const qc = getQueryClient()
  qc.setQueryData(authKeys.session, null)
  qc.removeQueries({ queryKey: ["auth"] })
  // Invalidate everything else so any user-scoped data refetches as anonymous.
  qc.invalidateQueries()
}

// ---- session read (SSR-safe) ----------------------------------------------

export interface SessionState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

/**
 * Read the active session without causing hydration mismatches. The query
 * starts `pending` on both server and first client paint (same markup), then
 * resolves from localStorage post-mount. Components can render a neutral shell
 * while `isLoading`, then branch once mounted.
 */
export function useSession(): SessionState {
  const query = useQuery({
    queryKey: authKeys.session,
    queryFn: () => getUser(),
    // No network call; cache is seeded by the mutations via setQueryData.
  })

  return {
    user: query.data ?? null,
    isAuthenticated: !!query.data,
    isLoading: query.isLoading,
  }
}
