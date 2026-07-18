# Century Score

A fast, mobile-friendly score tracker and bill splitter for Century — the local Pakistani snooker game. Built with a liquid-glass UI: translucent cards, blur, soft gradients, and large touch-friendly controls made for use tableside.

## Features

- Configure players (1–4), names, Century target score, and price per minute
- Live timer that survives page refresh (calculated from a saved start timestamp)
- Snooker-ball-styled quick score buttons (+2 to +10), custom scoring, undo
- Automatic ranking, running score activity log
- Manual "Close Century" with confirmation, billing by rounded-up minutes
- Configurable payout-percentage tables per player count, with tie resolution (manual order or equal split)
- Persistent game history with search, date filter, delete, and share
- Derived player statistics (wins, win %, total paid, etc.)
- LocalStorage persistence today, structured so a backend (Supabase/Firebase/Turso/Postgres) can be swapped in later

## Tech stack

- React + TypeScript + Vite
- Tailwind CSS v4 (liquid-glass theme)
- LocalStorage persistence layer (`src/lib/storage.ts`)

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```
