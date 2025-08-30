# rEngine Platform - Docker Infrastructure

# Main application (StackTrackr web app)
FROM node:18-alpine AS stacktrackr-app

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm install

# Copy application files
COPY . .

# Expose port for web app
EXPOSE 3000

# Start command will be overridden by docker-compose
CMD ["npm", "start"]


# rEngine Services (Multi-agent platform)
FROM node:18-alpine AS rengine-services

WORKDIR /rengine

# Copy rEngine package files
COPY rEngine/package*.json ./
RUN npm install

# Copy rEngine source code
COPY rEngine/ ./

# Copy rAgents directory
COPY rAgents/ /rengine/rAgents/

# Copy rMemory directory  
COPY rMemory/ /rengine/rMemory/

# Install global dependencies that might be needed
RUN npm install -g nodemon

# Expose ports for rEngine services
EXPOSE 8080 8081

# Default command - can be overridden
CMD ["node", "index.js"]


# MCP Server (Memory/Knowledge Graph)
FROM node:18-alpine AS mcp-server

WORKDIR /mcp

# Install curl for healthchecks and scripting
RUN apk add --no-cache curl

# Copy MCP package files
COPY rEngineMCP/package*.json ./
RUN npm install

# Copy MCP source code
COPY rEngineMCP/ ./

# Create data directory for persistence
RUN mkdir -p /data

# Expose MCP port
EXPOSE 8082

CMD ["node", "index.js"]


# Development Tools (VS Code Server + Tools)
FROM mcr.microsoft.com/vscode/devcontainers/javascript-node:18 AS development

# Install additional development tools
RUN apt-get update && apt-get install -y \
    git \
    curl \
    wget \
    vim \
    htop \
    tree \
    && rm -rf /var/lib/apt/lists/*

# Install global npm packages for development
RUN npm install -g \
    nodemon \
    pm2 \
    @vscode/vsce

# Create workspace directory
WORKDIR /workspace

# Keep container running for development
CMD ["sleep", "infinity"]
