# ── Stage 1: build the React frontend ────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Install all deps (including devDependencies needed by Vite)
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build
# Output: /app/dist


# ── Stage 2: production runtime ───────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

# Install production dependencies only
COPY package*.json ./
RUN npm ci --omit=dev

# Copy server code
COPY server/ ./server/
COPY data/ ./data/

# Copy static assets served by Express
COPY public/ ./public/
COPY hiking_markers/ ./hiking_markers/

# Copy the Vite build output
COPY --from=builder /app/dist ./dist

# Express serves dist/ in production (NODE_ENV=production)
ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

CMD ["node", "server/index.js"]
