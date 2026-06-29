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
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
            <Star className="size-5 fill-current" />
          </span>
          <span className="font-semibold tracking-tight text-slate-900 dark:text-slate-50">
            ReviewDibo
          </span>
        </Link>

        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <span className="hidden items-center gap-2 text-sm text-slate-500 sm:inline-flex dark:text-slate-400">
                Hi, {user?.name?.trim() || "there"}
                {user?.is_admin && (
                  <span className="inline-flex items-center rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:ring-indigo-900/50">
                    Admin
                  </span>
                )}
              </span>
              <button
                type="button"
                onClick={() => logout()}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <LogOut className="size-4" />
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth"
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400"
              >
                Log in
              </Link>
              <Link
                href="/auth?mode=register"
                className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-1.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-500"
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
