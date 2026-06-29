"use client"

/**
 * Auth presentation component: a single card that toggles between Login and
 * Register. Network + persistence state is driven entirely by the TanStack
 * Query mutations from hooks/useAuth — `isPending` gates the submit button and
 * spinner, `error` drives the inline error surface.
 */

import * as React from "react"
import { ArrowRight, Eye, EyeOff, Loader2, Star } from "lucide-react"

import { useLogin, useRegister } from "@/hooks/useAuth"
import type { ApiError } from "@/lib/api"
import { cn } from "@/lib/utils"

type Mode = "login" | "register"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function AuthCard() {
  const [mode, setMode] = React.useState<Mode>("login")

  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")

  const [showPw, setShowPw] = React.useState(false)
  const [touched, setTouched] = React.useState<Record<string, boolean>>({})
  const [formError, setFormError] = React.useState<string | null>(null)

  const login = useLogin()
  const register = useRegister()
  const pending = login.isPending || register.isPending

  function switchMode(next: Mode) {
    if (next === mode) return
    setMode(next)
    setTouched({})
    setFormError(null)
    login.reset()
    register.reset()
  }

  // Per-field validation, only surfaced after a field is touched or submitted.
  const errors = {
    name: mode === "register" && name.trim().length < 2 ? "Enter your name" : null,
    email: !email ? "Email is required" : !EMAIL_RE.test(email) ? "Enter a valid email" : null,
    password:
      !password
        ? "Password is required"
        : password.length < 8
          ? "Use at least 8 characters"
          : null,
  }

  function fieldError(key: keyof typeof errors): string | null {
    return touched[key] ? errors[key] : null
  }

  function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    setFormError(null)
    setTouched({ name: true, email: true, password: true })
    if (errors.name || errors.email || errors.password) return

    const onError = (err: ApiError | Error) => {
      setFormError(err instanceof Error ? err.message : "Something went wrong. Try again.")
    }

    if (mode === "login") {
      login.mutate({ email, password }, { onError })
    } else {
      register.mutate({ name: name.trim(), email, password }, { onError })
    }
  }

  const isLogin = mode === "login"

  return (
    <div className="w-full max-w-md">
      {/* Brand mark */}
      <div className="mb-8 flex items-center gap-2.5">
        <div className="flex size-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30">
          <Star className="size-5 fill-current" />
        </div>
        <span className="text-lg font-semibold tracking-tight">ReviewDibo</span>
      </div>

      {/* Heading */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          {isLogin ? "Welcome back" : "Create your account"}
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {isLogin
            ? "Sign in to share and read honest product reviews."
            : "Join ReviewDibo to review products you love."}
        </p>
      </div>

      {/* Mode toggle */}
      <div className="mb-6 grid grid-cols-2 gap-1 rounded-xl bg-muted p-1 text-sm font-medium">
        <ToggleButton active={isLogin} onClick={() => switchMode("login")}>
          Log in
        </ToggleButton>
        <ToggleButton active={!isLogin} onClick={() => switchMode("register")}>
          Sign up
        </ToggleButton>
      </div>

      {/* Form */}
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
            invalid={!!fieldError("name")}
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
          invalid={!!fieldError("email")}
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
          invalid={!!fieldError("password")}
          error={fieldError("password")}
          disabled={pending}
          trailing={
            <button
              type="button"
              onClick={() => setShowPw((s) => !s)}
              tabIndex={-1}
              aria-label={showPw ? "Hide password" : "Show password"}
              className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          }
        />

        {/* Inline error surface (network / server) */}
        {formError && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-destructive"
          >
            <span className="mt-0.5 size-1.5 shrink-0 rounded-full bg-destructive" />
            <span>{formError}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={pending}
          className={cn(
            "group relative flex h-11 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition-all",
            "hover:bg-indigo-500 hover:shadow-indigo-500/30",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
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

      {/* Footer switch */}
      <p className="mt-6 text-center text-sm text-muted-foreground">
        {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
        <button
          type="button"
          onClick={() => switchMode(isLogin ? "register" : "login")}
          className="font-medium text-indigo-600 transition-colors hover:text-indigo-500 hover:underline"
        >
          {isLogin ? "Sign up" : "Sign in"}
        </button>
      </p>
    </div>
  )
}

// ---- Small subcomponents --------------------------------------------------

function ToggleButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-lg py-2 transition-all",
        active
          ? "bg-background text-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  )
}

interface FieldProps {
  id: string
  label: string
  type?: string
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  invalid?: boolean
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
  invalid = false,
  error = null,
  disabled = false,
  autoComplete,
  trailing,
}: FieldProps) {
  const errorId = `${id}-error`
  return (
    <div>
      <div className="relative">
        <input
          id={id}
          type={type}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder=" "
          autoComplete={autoComplete}
          aria-invalid={invalid || undefined}
          aria-describedby={error ? errorId : undefined}
          className={cn(
            "peer h-12 w-full rounded-xl border bg-background px-3.5 pb-1.5 pt-4 text-sm text-foreground",
            "outline-none transition-colors duration-200 placeholder:text-transparent disabled:opacity-60",
            trailing && "pr-11",
            invalid
              ? "border-destructive focus:border-destructive focus:ring-2 focus:ring-destructive/20"
              : "border-input focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20",
          )}
        />
        <label
          htmlFor={id}
          className={cn(
            "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 origin-left bg-background px-1 text-sm transition-all duration-200",
            "peer-focus:top-2.5 peer-focus:-translate-y-1/2 peer-focus:scale-[0.8] peer-focus:text-indigo-600",
            "peer-not-placeholder-shown:top-2.5 peer-not-placeholder-shown:-translate-y-1/2 peer-not-placeholder-shown:scale-[0.8]",
            invalid ? "text-destructive" : "text-muted-foreground",
          )}
        >
          {label}
        </label>
        {trailing && (
          <div className="absolute right-1.5 top-1/2 -translate-y-1/2">{trailing}</div>
        )}
      </div>
      {error && (
        <p id={errorId} className="mt-1.5 pl-1 text-xs font-medium text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
