### Stage 1: build
FROM node:20-bullseye-slim AS builder
WORKDIR /app

# Install build deps
COPY package*.json ./
# Install all deps (including dev) in the builder so we can run build steps
RUN if [ -f package-lock.json ]; then \
			npm ci --ignore-scripts --no-audit --no-fund; \
		else \
			npm install --ignore-scripts --no-audit --no-fund; \
		fi

# Copy sources
COPY tsconfig.json ./
COPY prisma ./prisma
COPY src ./src

# Generate prisma client and build
RUN npm run db:generate || true
RUN npm run build

### Stage 2: runtime
FROM node:20-bullseye-slim
WORKDIR /app


# Copy build artifacts and node_modules from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "dist/index.js"]
