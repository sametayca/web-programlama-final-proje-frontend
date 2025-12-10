FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (vite is needed for preview)
RUN npm ci

# Copy built files from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/vite.config.js ./vite.config.js
COPY --from=builder /app/index.html ./index.html

EXPOSE 3001

# Use npm start (vite preview) for production
CMD ["npm", "start"]

