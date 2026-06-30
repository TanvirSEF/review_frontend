"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LogOut, Star } from "lucide-react"

import { logout, useAuth } from "@/hooks/useAuth"

export function Navbar() {
  const pathname = usePathname()
  const { isAuthenticated, user } = useAuth()

  // Full-screen auth view renders its own layout — no navbar there.
  if (pathname === "/auth") return null

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200/80 bg-white/80 backdrop-blur-md dark:border-stone-800/80 dark:bg-stone-950/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-lg bg-stone-900 dark:bg-white">
            <Star className="size-4 fill-amber-400 text-amber-400" />
          </span>
          <span className="font-heading text-lg font-medium tracking-tight text-stone-900 dark:text-stone-50">
            ReviewDibo
          </span>
        </Link>

        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <span className="hidden items-center gap-2 text-sm text-stone-500 sm:inline-flex dark:text-stone-400">
                Hi, {user?.name?.trim() || "there"}
                {user?.is_admin && (
                  <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 ring-1 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-900/50">
                    Admin
                  </span>
                )}
              </span>
              <button
                type="button"
                onClick={() => logout()}
                className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200 dark:hover:bg-stone-800"
              >
                <LogOut className="size-4" />
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth"
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-stone-600 transition-colors hover:text-stone-900 dark:text-stone-300 dark:hover:text-stone-50"
              >
                Log in
              </Link>
              <Link
                href="/auth?mode=register"
                className="inline-flex items-center rounded-lg bg-stone-900 px-4 py-1.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-stone-800 dark:bg-white dark:text-stone-900 dark:hover:bg-stone-200"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
