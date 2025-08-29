# Development Environment Setup

## Quick Start for Developers

### 🚀 Start Development Environment

```bash
./scripts/start-dev-env.sh
```

This will:

- Start Neo4j database for memento-mcp
- Initialize memento database
- Provide connection details

### 🛑 Stop Development Environment

```bash
./scripts/stop-dev-env.sh
```

### 🔧 Manual Control

```bash

# Start services

docker-compose -f docker-compose.dev.yml up -d

# Stop services

docker-compose -f docker-compose.dev.yml down

# View logs

docker-compose -f docker-compose.dev.yml logs -f
```

## Services

### Neo4j Database

- **URL**: <http://localhost:7474>
- **Username**: neo4j
- **Password**: qwerty1234
- **Database**: memento (auto-created)

### Memento-MCP

- Configured in VS Code MCP settings
- Connects to Neo4j automatically
- Environment variables set in mcp.json

## Important Notes

⚠️ **Development Only**: These files are excluded from version control via .gitignore

⚠️ **Not for Production**: This setup is for local development only

⚠️ **Data Persistence**: Data is stored in Docker volumes and persists between restarts

## Troubleshooting

### Neo4j Connection Issues

1. Ensure Docker is running
2. Check port 7687 is not in use: `lsof -i :7687`
3. Restart services: `./scripts/stop-dev-env.sh && ./scripts/start-dev-env.sh`

### MCP Server Issues

1. Restart VS Code after starting Neo4j
2. Check VS Code MCP extension status
3. Verify environment variables in mcp.json

### Reset Everything

```bash

# Stop and remove all data

docker-compose -f docker-compose.dev.yml down -v

# Start fresh

./scripts/start-dev-env.sh
```
