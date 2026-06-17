FROM node:20-alpine

WORKDIR /app

RUN npm install -g pnpm@10

# Backend dependencies and build
COPY backend/package*.json ./backend/
COPY backend/prisma ./backend/prisma
WORKDIR /app/backend
RUN npm ci
COPY backend ./
ENV DATABASE_URL=postgresql://user:password@localhost:5432/splitlink
RUN npx prisma generate
RUN npm run build

# Web dependencies and build
WORKDIR /app
COPY web/package.json web/pnpm-lock.yaml web/pnpm-workspace.yaml ./web/
WORKDIR /app/web
RUN pnpm install --frozen-lockfile
COPY web ./
ARG NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=${NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
ENV NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=${NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm build

WORKDIR /app
ENV PORT=3000
ENV BACKEND_PORT=3001

EXPOSE 3000

CMD ["sh", "-c", "cd /app/backend && PORT=${BACKEND_PORT:-3001} node dist/index.js & cd /app/web && PORT=${PORT:-3000} pnpm start"]
