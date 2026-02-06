# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Global Marathon Hub (RUN HUB) is a mobile-optimized web platform for discovering and tracking Korean marathon events. Built with Next.js 14 (App Router), React 18, TypeScript (strict mode), and Tailwind CSS. Deployed on Vercel free tier.

All UI text and documentation is in Korean.

## Commands

```bash
npm run dev          # Dev server at localhost:3000
npm run build        # Production build
npm run start        # Production server
npm run lint         # ESLint via next lint
```

### Data Pipeline (scrapers)

```bash
npx playwright install chromium          # Required before first scraper run
npx tsx scripts/scrape_ranking.ts        # Primary scraper (rankingmarathon.com)
npx tsx scripts/scrape_marathons.ts      # marathon.pe.kr scraper
npx tsx scripts/deep_scrape_roadrun.ts   # roadrun.co.kr deep scraper
```

Scrapers run daily via GitHub Actions (`update-marathons.yml`, 00:00 KST) and commit changes to `src/data/marathons.json` automatically.

## Architecture

### Data Flow

```
Playwright scrapers → src/data/marathons.json → Next.js pages → Client Components
                                                                      ↓
                                                              localStorage (bookmarks)
                                                              Kakao Maps API (geocoding)
```

`marathons.json` is the single source of truth for all race data. It is a static JSON file imported directly by pages — there is no backend API or database.

### Routing (App Router)

- `/` — Home feed with region/distance filters, search, bookmarks (Client Component)
- `/map` — Kakao Maps with geocoded race markers (Client Component)
- `/marathon/[id]` — Race detail page with SSG + dynamic metadata generation, renders `DetailClient.tsx`

### Server vs Client Components

Server Components handle metadata generation and SSG (`marathon/[id]/page.tsx`). All interactive pages use `"use client"` — the homepage, map page, and `DetailClient.tsx`.

### State Management

Client-side only via React hooks (`useState`, `useMemo`, `useEffect`). Bookmarks persist to `localStorage` under key `run-hub-bookmarks`.

### Kakao Maps Integration

The map page loads the Kakao Maps SDK via script injection with `autoload=false`, then calls `window.kakao.maps.load()` explicitly. Geocoding converts race addresses to coordinates for marker placement. Requires `NEXT_PUBLIC_KAKAO_MAP_API_KEY` in `.env.local`.

### Path Alias

`@/*` maps to `./src/*` (configured in `tsconfig.json`).

## Project Conventions

- **Zero-cost infrastructure** — all services must use free tiers (Vercel Hobby, GitHub Actions)
- **Session logging** — conversation logs go in `docs/99_Logs/`
- **i18n readiness** — data structures should support internationalization and UTC time
- Styling uses Tailwind utility classes with a mobile-first responsive approach
- Icons from `lucide-react`, class merging via `clsx` + `tailwind-merge`
