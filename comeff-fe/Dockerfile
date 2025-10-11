# Dockerfile for comeff-fe (Next.js Frontend)

# 1. Base Stage
FROM node:20-slim AS base
WORKDIR /app

# 2. Dependencies Stage
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm install

# 3. Builder Stage
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# 4. Runner Stage
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
# You can add more environment variables here as needed
# For example:
# ENV NEXT_PUBLIC_API_URL=http://localhost:8080

COPY --from=builder /app/public ./public
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static

USER node

EXPOSE 3000

ENV PORT=3000

CMD ["node", "server.js"]