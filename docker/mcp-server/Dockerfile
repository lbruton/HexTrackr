FROM node:20-slim

# Install git and other dependencies
RUN apt-get update && apt-get install -y \
    git \
    && rm -rf /var/lib/apt/lists/*

# Create app directory for MCP servers
WORKDIR /mcp-servers

# Create directories for each MCP server
RUN mkdir -p /mcp-servers/filescope-mcp \
    /mcp-servers/codacy-mcp \
    /mcp-servers/other-mcps

# Install global dependencies that can be shared
RUN npm install -g typescript ts-node

# Copy startup script
COPY start-mcp-servers.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/start-mcp-servers.sh

# Default command
CMD ["/usr/local/bin/start-mcp-servers.sh"]
