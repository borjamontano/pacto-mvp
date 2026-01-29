FROM node:20-alpine

WORKDIR /app

COPY package.json pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/tsconfig.json apps/api/tsconfig.build.json apps/api/nest-cli.json apps/api/.eslintrc.js apps/api/.prettierrc apps/api/.env.example ./apps/api/
COPY packages/shared/package.json packages/shared/tsconfig.json ./packages/shared/

RUN corepack enable && corepack prepare pnpm@9.1.0 --activate
RUN pnpm install --no-frozen-lockfile

COPY packages/shared ./packages/shared
COPY apps/api ./apps/api

WORKDIR /app/apps/api
RUN pnpm prisma:generate
RUN pnpm build

EXPOSE 3001

CMD ["node", "dist/main.js"]
