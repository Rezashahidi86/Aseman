FROM node:24.12.0-alpine3.22 AS dependencies

WORKDIR /app/backend

COPY backend/package.json backend/package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

FROM node:24.12.0-alpine3.22 AS runtime

ENV NODE_ENV=production
ENV PORT=3000

WORKDIR /app

COPY --from=dependencies /app/backend/node_modules ./backend/node_modules
COPY backend ./backend

RUN mkdir -p /app/uploads/manual-documents \
    && chown -R node:node /app

USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/health/ready').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["node", "backend/server.js"]
