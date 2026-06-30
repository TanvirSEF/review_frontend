# ReviewDibo — Frontend

The web client for ReviewDibo, a product-review platform. Users can browse
products, read ratings, and write their own reviews. Built with Next.js, React,
TypeScript, and Tailwind CSS.

## Tech stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS v4 + shadcn/ui
- TanStack Query for data fetching
- Axios for API calls
- next-themes for dark mode

## Prerequisites

You need **Node.js** (latest LTS) and **pnpm**. This repo is pinned to pnpm via
`pnpm-lock.yaml`. Install pnpm if you don't have it:

```bash
npm install -g pnpm
```

## Setup

1. Install dependencies:

```bash
pnpm install
```

2. Copy the env file and set your backend URL:

```bash
cp .env.example .env
```

Open `.env` and point it at your backend. Only one variable is needed:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

This is a `NEXT_PUBLIC_` variable, so it is read at **build time**. Set it
before building or running the dev server.

3. Start the dev server:

```bash
pnpm dev
```

The app runs at **http://localhost:3000**.

## Scripts

| Command | What it does |
| --- | --- |
| `pnpm dev` | Run the dev server |
| `pnpm build` | Production build (also type-checks) |
| `pnpm start` | Serve the production build |
| `pnpm lint` | Run ESLint |
| `pnpm typecheck` | Type-check only |
| `pnpm format` | Format files with Prettier |

## Project structure

```
app/          Routes (dashboard, auth, product detail)
components/   UI components
hooks/        Data-fetching hooks (products, reviews, auth)
lib/          API client, session helpers, utils
```
