# syntax=docker/dockerfile:1

# ---------- deps ----------
FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---------- build ----------
FROM node:24-alpine AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
# Placeholder so module evaluation during `next build` never sees an empty
# secret. The real BETTER_AUTH_SECRET is injected at runtime via env_file.
ENV BETTER_AUTH_SECRET=build-time-placeholder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ---------- runner ----------
# Full node_modules are kept so `npm run db:migrate` / `db:seed` (tsx +
# drizzle) work inside the container for deployment tooling.
FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs
COPY --from=build /app/package.json /app/package-lock.json /app/tsconfig.json /app/next.config.ts /app/drizzle.config.ts ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/src ./src
COPY --from=build /app/drizzle ./drizzle
# Next.js image-optimizer cache + generated assets must be writable by the runtime user
RUN mkdir -p .next/cache/images assets && chown -R nextjs:nodejs .next/cache assets
USER nextjs
EXPOSE 3000
CMD ["npm", "run", "start"]
