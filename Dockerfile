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
RUN npm run build && rm -rf .next/cache

# ---------- runner ----------
# Production dependencies only (tsx is a prod dependency so `npm run
# db:migrate` / `db:seed` work inside the container for deployment tooling).
FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
# yt-dlp powers the YouTube STT fallback (transcript-less videos → whisper)
RUN apk add --no-cache yt-dlp
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build /app/tsconfig.json /app/next.config.ts /app/drizzle.config.ts ./
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/src ./src
COPY --from=build /app/drizzle ./drizzle
# Next.js image-optimizer cache + generated assets must be writable by the runtime user
RUN mkdir -p .next/cache/images assets && chown -R nextjs:nodejs .next/cache assets
USER nextjs
EXPOSE 3000
CMD ["npm", "run", "start"]
