# Dockerfile for HexTrackr Documentation Portal
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including dev dependencies for development server)
RUN npm ci

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Start the development server (hot reload for development)
CMD ["npm", "run", "start", "--", "--host", "0.0.0.0", "--port", "3000"]