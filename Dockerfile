FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG NEXT_PUBLIC_API_URL=http://localhost:3001
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN npm run build

FROM node:20-alpine

WORKDIR /app

RUN addgroup -g 1001 zentrion && \
    adduser -u 1001 -G zentrion -s /bin/sh -D zentrion

COPY --from=builder --chown=zentrion:zentrion /app/.next/standalone ./
COPY --from=builder --chown=zentrion:zentrion /app/.next/static ./.next/static
COPY --from=builder --chown=zentrion:zentrion /app/public ./public

USER zentrion

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME=0.0.0.0

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/', (r) => process.exit(r.statusCode < 500 ? 0 : 1))" || exit 1

CMD ["node", "server.js"]
