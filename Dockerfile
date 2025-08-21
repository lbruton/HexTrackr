# Use Node.js with Alpine for smaller image size
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install SQLite and other necessary packages
RUN apk add --no-cache sqlite sqlite-dev python3 make g++ curl

# Copy package files
COPY package*.json ./

# Install dependencies and rebuild native modules for the container architecture
RUN npm ci --only=production && npm rebuild

# Copy application files (excluding node_modules from host)
COPY . .

# Create SQLite database directory
RUN mkdir -p /app/data

# Initialize SQLite database
COPY scripts/init-db.sql /app/scripts/
RUN sqlite3 /app/data/hextrackr.db < /app/scripts/init-db.sql

# Expose port
EXPOSE 3232

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3232/health || exit 1

# Start the application
CMD ["npm", "start"]
