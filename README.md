# PACTO

Tasks that get confirmed, not assumed.

PACTO helps couples, families, and roommates coordinate shared responsibilities with clear assignments and confirmations.

## Overview

PACTO is a pnpm monorepo with:

- **NestJS API** for auth, households, pacts, activity, devices, and notifications.
- **Expo mobile app** for daily pact management.
- **Shared package** with common types and constants.

## Tech Stack

- **Backend:** Node.js LTS, NestJS, Prisma, PostgreSQL, JWT, class-validator, Swagger, pino, @nestjs/schedule
- **Mobile:** Expo, React Native, React Navigation, React Query, Zustand, AsyncStorage, Expo Notifications
- **Shared:** TypeScript types/DTOs
- **Tooling:** pnpm workspaces, ESLint, Prettier, Jest

## Repo Structure

```
apps/
  confirmation.md
  api/
  mobile/
packages/
  shared/
docker-compose.yml
package.json
pnpm-workspace.yaml
README.md
```

## Running the Backend (Docker Compose)

1. Copy env file:

```bash
cp apps/api/.env.example apps/api/.env
```

2. Start Postgres + API:

```bash
docker compose up --build
```

The API runs at `http://localhost:3001/api/v1` and Swagger docs are at `http://localhost:3001/api`.

## Running the Mobile App (Expo)

1. Install dependencies:

```bash
pnpm install
```

2. Configure mobile environment:

```bash
cp apps/mobile/.env.example apps/mobile/.env
```

3. Start Expo:

```bash
pnpm --filter @pacto/mobile start
```

## Demo Credentials

- Email: `demo@pacto.app`
- Password: `demo1234`

## Linting & Tests

Run lint across the monorepo:

```bash
pnpm lint
```

Run API unit tests:

```bash
pnpm --filter @pacto/api test
```

Run API e2e tests:

```bash
pnpm --filter @pacto/api test:e2e
```

## Troubleshooting

- **Expo cannot reach API:** ensure `EXPO_PUBLIC_API_URL` points to your machine. For mobile devices on a LAN, use your machine IP instead of `localhost`.
- **Docker compose fails to migrate:** confirm `DATABASE_URL` matches the Postgres service in `docker-compose.yml`.
- **Auth refresh issues:** clear stored tokens by reinstalling the app or clearing AsyncStorage.
