# ReviewDibo — Frontend

The web client for **ReviewDibo**, a community product-review platform. Users can
browse products, read honest ratings, and write their own reviews — all behind a
JWT-authenticated experience. Built with the Next.js App Router.

## Project overview

| Area | What's here |
| --- | --- |
| **Dashboard** (`/`) | Responsive product grid with ratings, review counts, and skeleton loading. |
| **Auth** (`/auth`) | Sleek card-centered Login / Register flow with a sliding toggle. |
| **Product detail** (`/products/[id]`) | Cover, computed average rating, review timeline, and an auth-gated review form. |
| **Auth engine** | JWT persisted to `localStorage`, global auth state via React Context, Axios client with an automatic `Bearer` interceptor. |

### Tech stack

- **Next.js 16** (App Router, Turbopack) · **React 19** · **TypeScript 5**
- **Tailwind CSS v4** + **shadcn/ui** (radix-nova) · **lucide-react** icons
- **TanStack Query v5** for server-state caching & mutations
- **Axios** HTTP client · **next-themes** for dark mode

## Local development

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy the template and point it at your backend:

```bash
cp .env.example .env
```

Then edit `.env` (see [Environment variables](#environment-variables)).

### 3. Start the dev server

```bash
npm run dev
```

The app runs at **http://localhost:3000**.

> **Package manager note:** this repo ships a `pnpm-lock.yaml` (and
> `pnpm-workspace.yaml`), so it is pinned to **pnpm**. The `npm` commands above
> work, but `npm install` will generate a `package-lock.json`. To avoid dual
> lockfiles, pick one manager and delete the other's lockfile. On Vercel the
> package manager is auto-detected from whichever lockfile is committed.

## Environment variables

Only **one** variable is required. It is a `NEXT_PUBLIC_` var, so it is inlined
into the client bundle at build time — it must be present at **build** time, not
just runtime.

| Variable | Required | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | **Yes** | Base URL of the ReviewDibo FastAPI backend, e.g. `https://api.reviewdibo.com` (no trailing slash). |

`frontend/.env`:

```env
NEXT_PUBLIC_API_URL=https://api.reviewdibo.com
```

> The app will not compile-fetch correctly without it — every request is sent to
> `apiClient`, whose `baseURL` is `process.env.NEXT_PUBLIC_API_URL`. An empty
> value means requests hit a relative/empty origin and fail.

## How TanStack Query powers the UI

Server state (products, reviews, auth) is managed entirely by TanStack Query —
no global Redux/Zustand store.

**Local query caching.** A single `QueryClient` is created once per browser
session in `components/query-provider.tsx` and provided app-wide via
`<QueryProvider>` in the root layout. Reads use `useQuery` keyed by stable
arrays:

- `["products"]` → dashboard product list
- `["products", id]` → a single product's detail + reviews

React Query caches each response, serves the cached data instantly on
re-mount or client-side navigation, and refetches in the background once data
goes stale (`staleTime` 60s).

**Reactive mutations.** Writes use `useMutation` (login, register, create
review). On success the mutation invalidates the keys that depend on the change
so the UI updates **without a page reload**. For example, `useCreateReview`
calls:

```ts
queryClient.invalidateQueries({ queryKey: ["products", variables.product_id] })
queryClient.invalidateQueries({ queryKey: ["products"] })
```

…which reactively refetches the review timeline, the recomputed average rating,
and the dashboard cards.

**Auth state.** The JWT and user live in `localStorage` (via `lib/session.ts`)
and are surfaced globally through `AuthProvider`, which is backed by
`useSyncExternalStore` — this keeps SSR and the first client render identical
(no hydration mismatch) and resolves to the real session after mount. After
login/register the mutations call `notifyAuth()` to flip the global
`isAuthenticated` / `user` flags; `logout()` purges storage and invalidates
every query so user-scoped data refetches as anonymous.

## Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server (Turbopack) on :3000. |
| `npm run build` | Production build — compiles + type-checks + prerenders routes. |
| `npm run start` | Serve the production build (run after `build`). |
| `npm run lint` | ESLint. |
| `npm run typecheck` | `tsc --noEmit` type-check only. |
| `npm run format` | Prettier write over `**/*.{ts,tsx}`. |

## Pre-deployment compilation check

Before going live, always confirm the app compiles cleanly:

```bash
npm run build
```

`next build` runs the TypeScript compiler and prerenders every route. A green
build guarantees there are no type errors and no App Router / server-client
boundary issues. Expect a route table like:

```
Route (app)
┌ ○ /                 (Static)
├ ○ /auth             (Static)
└ ƒ /products/[id]    (Dynamic)
```

If `build` fails, fix the reported errors before deploying — Vercel runs the
same `build` command, so a passing local build means a passing deploy.

## Deploying to Vercel

1. Push the repo to GitHub and import it into Vercel.
2. Set the **Root Directory** to `frontend` (if monorepo).
3. Add the environment variable in **Project → Settings → Environment Variables**:
   - `NEXT_PUBLIC_API_URL` = your production backend URL (for the **Production**,
     **Preview**, and **Development** environments).
4. Framework preset: **Next.js**. Build command `next build`, output handled
   automatically.
5. Deploy. Vercel auto-detects the package manager from the committed lockfile.

## Project structure

```
frontend/
├─ app/
│  ├─ layout.tsx            Root layout: QueryProvider → AuthProvider → ThemeProvider
│  ├─ page.tsx              Dashboard (product grid)
│  ├─ auth/page.tsx         Login / Register
│  └─ products/[id]/page.tsx  Product detail + reviews
├─ components/              UI (ProductCard, ReviewForm, ReviewList, providers…)
├─ hooks/                   useAuth, useProducts, useProductDetails
├─ lib/                     apiClient (Axios), session (localStorage), utils
└─ .env.example             Environment template
```
