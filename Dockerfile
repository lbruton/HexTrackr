# Use Node.js with Alpine for smaller image size
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install PostgreSQL client and other necessary packages (removed SQLite)
RUN apk add --no-cache postgresql-client python3 make g++ curl

# Copy package files
COPY package*.json ./

# Install dependencies and rebuild native modules for the container architecture
RUN npm ci --only=production && npm rebuild

# Install ESLint globally for linting support
RUN npm install -g eslint

# Copy application files (excluding node_modules from host)
COPY . .

# Copy ESLint configuration file to /app directory
COPY eslint.config.js /app/

# Create data directory for file uploads
RUN mkdir -p /app/data

# Expose correct port for HexTrackr
EXPOSE 3040

# Health check for correct port
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3040/health || exit 1

# Start the application
CMD ["npm", "start"]
