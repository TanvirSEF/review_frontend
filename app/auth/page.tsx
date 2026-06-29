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
    searchParams.get("mode") === "register" ? "register" : "login",
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
    email: !email ? "Email is required" : !EMAIL_RE.test(email) ? "Enter a valid email" : null,
    password: !password
      ? "Password is required"
      : password.length < 8
        ? "Use at least 8 characters"
        : null,
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
    <main className="relative flex min-h-svh items-center justify-center overflow-hidden bg-slate-50 p-6 dark:bg-slate-950">
      <Link
        href="/"
        className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition-colors hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 sm:left-6 sm:top-6"
      >
        <ArrowLeft className="size-4" />
        Back to home
      </Link>
      <div className="pointer-events-none absolute -top-40 left-1/2 size-160 -translate-x-1/2 rounded-full bg-indigo-500/10 blur-3xl" />

      <div className="relative w-full max-w-md">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-900/5 dark:border-slate-800 dark:bg-slate-900 sm:p-10">
          <div className="mb-8 flex flex-col items-center text-center">
            <Link href="/" className="flex flex-col items-center transition-opacity hover:opacity-80">
              <div className="mb-4 flex size-11 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30">
                <Star className="size-6 fill-current" />
              </div>
              <span className="text-lg font-semibold tracking-tight">ReviewDibo</span>
            </Link>
            <h1 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
              {isLogin ? "Welcome back" : "Create your account"}
            </h1>
            <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
              {isLogin
                ? "Sign in to share and read honest product reviews."
                : "Join ReviewDibo to review products you love."}
            </p>
          </div>

          <div className="relative mb-6 flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
            <span
              className={cn(
                "absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-lg bg-indigo-600 shadow-sm transition-transform duration-300 ease-out",
                isLogin ? "translate-x-0" : "translate-x-full",
              )}
            />
            <button
              type="button"
              onClick={() => switchMode("login")}
              className={cn(
                "relative z-10 flex-1 rounded-lg py-2 text-sm font-medium transition-colors duration-300",
                isLogin ? "text-white" : "text-slate-600 dark:text-slate-300",
              )}
            >
              Log in
            </button>
            <button
              type="button"
              onClick={() => switchMode("register")}
              className={cn(
                "relative z-10 flex-1 rounded-lg py-2 text-sm font-medium transition-colors duration-300",
                !isLogin ? "text-white" : "text-slate-600 dark:text-slate-300",
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
                  className="flex size-8 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
                >
                  {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
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
                "group flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition-all",
                "hover:bg-indigo-500 hover:shadow-indigo-500/30",
                "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-600/30",
                "active:translate-y-px disabled:cursor-not-allowed disabled:opacity-70 disabled:shadow-none",
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

          <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() => switchMode(isLogin ? "register" : "login")}
              className="font-semibold text-indigo-600 transition-colors hover:text-indigo-500"
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
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
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
            "h-11 w-full rounded-lg border bg-white px-3 text-sm text-slate-900 outline-none transition",
            "placeholder:text-slate-400 disabled:opacity-60",
            "dark:bg-slate-900 dark:text-slate-100",
            trailing && "pr-10",
            error
              ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/15"
              : "border-slate-200 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/15 dark:border-slate-700",
          )}
        />
        {trailing && (
          <div className="absolute right-1.5 top-1/2 -translate-y-1/2">{trailing}</div>
        )}
      </div>
      {error && (
        <p id={errorId} className="mt-1.5 pl-1 text-xs font-medium text-red-600 dark:text-red-400">
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
