# Multi-stage build for smaller, cross-platform compatible image
FROM node:22-alpine AS builder

WORKDIR /app

# Install build dependencies for native modules
# Works on both Linux and macOS Docker environments
# py3-setuptools provides distutils for node-gyp (required for Node 24 + Python 3.12)
RUN apk add --no-cache python3 py3-setuptools make g++ sqlite

# Copy package files for better Docker layer caching
COPY package*.json ./

# Install dependencies and rebuild native modules
RUN npm install --production --legacy-peer-deps && \
    npm rebuild

# Production stage
FROM node:22-alpine

WORKDIR /app

# Install runtime dependencies AND build tools for native module rebuild
RUN apk add --no-cache sqlite python3 py3-setuptools make g++

# Copy built node_modules from builder stage
COPY --from=builder /app/node_modules ./node_modules

# Copy package files
COPY package*.json ./

# Rebuild native modules in production environment to ensure V8 ABI compatibility
RUN npm rebuild better-sqlite3 argon2

# Copy entire application structure (excluding data files)
COPY app/ ./app/
COPY config/ ./config/
COPY eslint.config.mjs ./

# Create necessary directories with proper permissions
# Note: Database files will be mounted via volumes, not copied
RUN mkdir -p ./app/public/data ./app/data ./app/roadmaps ./app/uploads ./app/public/docs ./app/audit && \
    chmod 777 ./app/public/data ./app/data ./app/uploads

# Note: Running as root in container for development
# In production, use proper user/group mapping

# Expose port for the application
EXPOSE 8080

# Health check to ensure container is running properly (protocol-aware)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "const protocol = process.env.USE_HTTPS === 'true' ? 'https' : 'http'; \
    const https = require(protocol); \
    const options = protocol === 'https' ? {rejectUnauthorized: false} : {}; \
    https.get(\`\${protocol}://localhost:\${process.env.PORT || 8080}/health\`, options, (res) => \
    process.exit(res.statusCode === 200 ? 0 : 1))" || exit 1

# Start the application
CMD ["node", "app/public/server.js"]
