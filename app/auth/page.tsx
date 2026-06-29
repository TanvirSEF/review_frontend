import { AuthCard } from "@/components/auth/auth-card"

/**
 * Auth page — side-by-side split screen.
 *
 * This page is a Server Component: the brand panel is static markup and the
 * only client island is <AuthCard />. Because neither half reads auth state
 * during render, server and client output match exactly → no hydration mismatch.
 */
export default function AuthPage() {
  return (
    <main className="grid min-h-svh lg:grid-cols-2">
      {/* Brand / marketing panel — indigo signature, desktop only */}
      <aside className="relative hidden overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-900 lg:flex lg:flex-col lg:justify-between lg:p-12">
        {/* decorative glows */}
        <div className="pointer-events-none absolute -left-24 -top-24 size-96 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -right-16 size-[28rem] rounded-full bg-indigo-400/20 blur-3xl" />

        <div className="relative flex items-center gap-2.5 text-white">
          <div className="flex size-9 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/25 backdrop-blur">
            <StarMark />
          </div>
          <span className="text-lg font-semibold tracking-tight">ReviewDibo</span>
        </div>

        <div className="relative max-w-md text-white">
          <h2 className="text-balance text-3xl font-semibold leading-tight tracking-tight">
            Honest reviews for the products you actually use.
          </h2>
          <p className="mt-4 text-pretty text-indigo-100">
            Rate, read, and share experiences. Your voice helps everyone buy better.
          </p>

          <ul className="mt-8 space-y-3 text-sm text-indigo-50">
            {["Browse real product ratings", "Write and manage your own reviews", "Track average scores at a glance"].map(
              (item) => (
                <li key={item} className="flex items-center gap-3">
                  <span className="flex size-5 items-center justify-center rounded-full bg-white/20">
                    <CheckMark />
                  </span>
                  {item}
                </li>
              ),
            )}
          </ul>
        </div>

        <p className="relative text-xs text-indigo-200">
          &ldquo;The best product decisions start with honest feedback.&rdquo;
        </p>
      </aside>

      {/* Form side */}
      <section className="flex items-center justify-center bg-background p-6 sm:p-10">
        <AuthCard />
      </section>
    </main>
  )
}

function StarMark() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="size-5 text-white" aria-hidden="true">
      <path d="M12 2.5l2.9 5.9 6.5.95-4.7 4.58 1.11 6.47L12 17.9l-5.81 3.06 1.11-6.47L2.6 9.9l6.5-.95L12 2.5z" />
    </svg>
  )
}

function CheckMark() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-3 text-white" aria-hidden="true">
      <path
        d="M5 13l4 4L19 7"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
