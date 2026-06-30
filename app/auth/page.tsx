"use client"

import * as React from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { ArrowLeft, ArrowRight, Eye, EyeOff, Loader2, Star } from "lucide-react"

import { getApiErrorDetail } from "@/lib/apiClient"
import { useLogin, useRegister } from "@/hooks/useAuth"
import { cn } from "@/lib/utils"

type Mode = "login" | "register"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function AuthCard() {
  const searchParams = useSearchParams()
  const [mode, setMode] = React.useState<Mode>(
    searchParams.get("mode") === "register" ? "register" : "login"
  )
  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [showPw, setShowPw] = React.useState(false)
  const [touched, setTouched] = React.useState<Record<string, boolean>>({})

  const login = useLogin()
  const register = useRegister()
  const pending = login.isPending || register.isPending
  const isLogin = mode === "login"

  const authError = login.isError
    ? getApiErrorDetail(login.error)
    : register.isError
      ? getApiErrorDetail(register.error)
      : null

  const errors = {
    name: isLogin ? null : name.trim().length < 2 ? "Enter your name" : null,
    email: !email
      ? "Email is required"
      : !EMAIL_RE.test(email)
        ? "Enter a valid email"
        : null,
    password: !password ? "Password is required" : null,
  }

  function fieldError(key: keyof typeof errors): string | null {
    return touched[key] ? errors[key] : null
  }

  function switchMode(next: Mode) {
    if (next === mode) return
    setMode(next)
    setTouched({})
    login.reset()
    register.reset()
  }

  function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    setTouched({ name: true, email: true, password: true })
    if (errors.name || errors.email || errors.password) return

    if (isLogin) {
      login.mutate({ email, password })
    } else {
      register.mutate({ name: name.trim(), email, password })
    }
  }

  return (
    <main className="relative flex min-h-svh items-center justify-center overflow-hidden bg-stone-50 p-6 dark:bg-stone-950">
      <Link
        href="/"
        className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-stone-500 transition-colors hover:text-stone-900 sm:top-6 sm:left-6 dark:text-stone-400 dark:hover:text-stone-50"
      >
        <ArrowLeft className="size-4" />
        Back to home
      </Link>
      <div className="pointer-events-none absolute -top-40 left-1/2 size-160 -translate-x-1/2 rounded-full bg-amber-200/20 blur-3xl dark:bg-amber-500/10" />

      <div className="animate-fade-up relative w-full max-w-md">
        <div className="rounded-2xl border border-stone-200 bg-white p-8 shadow-xl shadow-stone-900/5 sm:p-10 dark:border-stone-800 dark:bg-stone-900">
          <div className="mb-8 flex flex-col items-center text-center">
            <Link
              href="/"
              className="flex flex-col items-center transition-opacity hover:opacity-80"
            >
              <div className="mb-4 flex size-11 items-center justify-center rounded-2xl bg-stone-900 shadow-lg shadow-stone-900/20 dark:bg-white">
                <Star className="size-6 fill-amber-400 text-amber-400" />
              </div>
              <span className="font-heading text-lg font-medium tracking-tight text-stone-900 dark:text-stone-50">
                ReviewDibo
              </span>
            </Link>
            <h1 className="mt-4 text-2xl font-medium tracking-tight text-stone-900 dark:text-stone-50">
              {isLogin ? "Welcome back" : "Create your account"}
            </h1>
            <p className="mt-1.5 text-sm text-stone-500 dark:text-stone-400">
              {isLogin
                ? "Sign in to share and read honest product reviews."
                : "Join ReviewDibo to review products you love."}
            </p>
          </div>

          <div className="relative mb-6 flex rounded-xl bg-stone-100 p-1 dark:bg-stone-800">
            <span
              className={cn(
                "absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-lg bg-stone-900 shadow-sm transition-transform duration-300 ease-out dark:bg-white",
                isLogin ? "translate-x-0" : "translate-x-full"
              )}
            />
            <button
              type="button"
              onClick={() => switchMode("login")}
              className={cn(
                "relative z-10 flex-1 rounded-lg py-2 text-sm font-medium transition-colors duration-300",
                isLogin
                  ? "text-white dark:text-stone-900"
                  : "text-stone-600 dark:text-stone-300"
              )}
            >
              Log in
            </button>
            <button
              type="button"
              onClick={() => switchMode("register")}
              className={cn(
                "relative z-10 flex-1 rounded-lg py-2 text-sm font-medium transition-colors duration-300",
                !isLogin
                  ? "text-white dark:text-stone-900"
                  : "text-stone-600 dark:text-stone-300"
              )}
            >
              Sign up
            </button>
          </div>

          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            {!isLogin && (
              <Field
                id="name"
                label="Name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={setName}
                onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                error={fieldError("name")}
                disabled={pending}
              />
            )}

            <Field
              id="email"
              label="Email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={setEmail}
              onBlur={() => setTouched((t) => ({ ...t, email: true }))}
              error={fieldError("email")}
              disabled={pending}
            />

            <Field
              id="password"
              label="Password"
              type={showPw ? "text" : "password"}
              autoComplete={isLogin ? "current-password" : "new-password"}
              value={password}
              onChange={setPassword}
              onBlur={() => setTouched((t) => ({ ...t, password: true }))}
              error={fieldError("password")}
              disabled={pending}
              trailing={
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  tabIndex={-1}
                  aria-label={showPw ? "Hide password" : "Show password"}
                  className="flex size-8 items-center justify-center rounded-md text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600 dark:hover:bg-stone-800"
                >
                  {showPw ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              }
            />

            {authError && (
              <div
                role="alert"
                className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300"
              >
                <span className="mt-1 size-1.5 shrink-0 rounded-full bg-red-500" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={pending}
              className={cn(
                "group flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-stone-900 px-4 text-sm font-semibold text-white shadow-sm transition-all",
                "hover:bg-stone-800",
                "focus-visible:ring-2 focus-visible:ring-stone-900/20 focus-visible:ring-offset-2 focus-visible:outline-none",
                "active:translate-y-px disabled:cursor-not-allowed disabled:opacity-70",
                "dark:bg-white dark:text-stone-900 dark:hover:bg-stone-200"
              )}
            >
              {pending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  {isLogin ? "Signing in…" : "Creating account…"}
                </>
              ) : (
                <>
                  {isLogin ? "Sign in" : "Create account"}
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-stone-500 dark:text-stone-400">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() => switchMode(isLogin ? "register" : "login")}
              className="font-semibold text-amber-600 transition-colors hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300"
            >
              {isLogin ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </main>
  )
}

interface FieldProps {
  id: string
  label: string
  type?: string
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  error?: string | null
  disabled?: boolean
  autoComplete?: string
  trailing?: React.ReactNode
}

function Field({
  id,
  label,
  type = "text",
  value,
  onChange,
  onBlur,
  error = null,
  disabled = false,
  autoComplete,
  trailing,
}: FieldProps) {
  const errorId = `${id}-error`
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-sm font-medium text-stone-700 dark:text-stone-300"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={type}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={label}
          autoComplete={autoComplete}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={cn(
            "h-11 w-full rounded-lg border bg-white px-3 text-sm text-stone-900 transition outline-none",
            "placeholder:text-stone-400 disabled:opacity-60",
            "dark:bg-stone-800 dark:text-stone-100",
            trailing && "pr-10",
            error
              ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/15"
              : "border-stone-200 focus:border-stone-900 focus:ring-4 focus:ring-stone-900/10 dark:border-stone-700 dark:focus:border-white dark:focus:ring-white/10"
          )}
        />
        {trailing && (
          <div className="absolute top-1/2 right-1.5 -translate-y-1/2">
            {trailing}
          </div>
        )}
      </div>
      {error && (
        <p
          id={errorId}
          className="mt-1.5 pl-1 text-xs font-medium text-red-600 dark:text-red-400"
        >
          {error}
        </p>
      )}
    </div>
  )
}

export default function AuthPage() {
  return (
    <React.Suspense fallback={null}>
      <AuthCard />
    </React.Suspense>
  )
}
