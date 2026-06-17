FROM node:22-alpine AS deps

WORKDIR /app
RUN apk add --no-cache openssl

COPY package*.json ./
RUN npm ci

FROM deps AS build

WORKDIR /app
COPY prisma ./prisma
RUN npx prisma generate

COPY tsconfig.json ./
COPY src ./src
RUN npm run build
RUN npm prune --omit=dev

FROM node:22-alpine AS runner

WORKDIR /app
RUN apk add --no-cache openssl

ENV NODE_ENV=production
ENV PORT=8080

COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma

EXPOSE 8080

CMD ["node", "dist/index.js"]
