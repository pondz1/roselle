# Roselle

Private, local-first menstrual cycle and daily health tracker built as a mobile-first Progressive Web App (PWA).

All personal records stay on your device using IndexedDB with zero account required, while the repository layer is designed to support optional cloud synchronization later.

## Features

- **Cycle Dashboard (Today)**: Circular cycle progress ring showing active period day, next period countdown, late-period alerts, ovulation and fertile window status, daily conception chance, and one-tap period logging.
- **Cycle Calendar**: Color and shape dual-coded monthly calendar (logged period, predicted period, fertile window, ovulation day, and logged symptom dots) with an inline Selected Day Panel for Period Start / Period End controls, automatic period ending based on user defaults, and a multi-day bulk edit mode.
- **Quick Daily Logging**: Mobile bottom sheet with tap-to-select chips for flow intensity, 8 physical symptoms, 7 moods, 3 activities, and daily notes.
- **Insights & Trends**: Average cycle length, average period length, cycle variation, recent cycle trend SVG bar chart, chronological cycle history, and top symptom/mood frequency patterns.
- **Bilingual (TH / EN)**: Thai default with instant switch to English.
- **Backup & Restore**: Export and import local data as validated JSON snapshots.
- **Offline PWA**: Installable on iOS and Android home screens with offline precaching via `vite-plugin-pwa`.

## Tech Stack

- Vite 8, React 19, TypeScript, Tailwind CSS v4
- Dexie.js (IndexedDB) behind a decoupled `CycleRepository` interface
- `vite-plugin-pwa` (Workbox service worker + Web App Manifest)
- Vitest + React Testing Library + `fake-indexeddb`

## Local Development

```bash
npm install
npm run dev
```

### Scripts

- `npm run dev`: Start local development server
- `npm run typecheck`: Run TypeScript strict type checking
- `npm run test -- --run`: Run unit, repository, and component test suites
- `npm run build`: Typecheck and build production static PWA into `dist/`
- `npm run preview`: Preview the built `dist/` bundle locally

## Deploying on Coolify

This repository includes both a Coolify-ready `docker-compose.yaml` and a multi-stage `Dockerfile` with `nginx.conf` tailored for PWA hosting:

### Option A: Docker Compose (Recommended)

1. Create a new Application in Coolify connected to this GitHub repository.
2. Select **Build Pack: Docker Compose** (`docker-compose.yaml` at the repo root is detected automatically).
3. In the **roselle** service settings, enter your HTTPS domain (auto-mapped to port `80` via `SERVICE_FQDN_ROSELLE_80`).
4. Deploy.

### Option B: Dockerfile

1. Create a new Application in Coolify connected to this GitHub repository.
2. Select **Build Pack: Dockerfile**.
3. Set **Ports Exposes** to `80` and **Healthcheck Path** to `/health`.
4. Enable HTTPS with your domain (required for Service Worker registration and PWA installation on mobile) and deploy.

## Privacy & Medical Disclaimer

All cycle logs and settings are stored strictly in your browser's local IndexedDB storage (`RoselleCycleDB`) and are never transmitted to external servers. Cycle and ovulation predictions are estimates based on your logged history and should not be used as medical advice or contraception.

## License

MIT License. See [LICENSE](./LICENSE).
