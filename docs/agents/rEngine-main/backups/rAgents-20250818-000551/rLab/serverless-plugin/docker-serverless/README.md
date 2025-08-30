# StackTrackr Serverless - Phase 1 Docker Setup

## 🚀 Quick Start

This local Docker implementation simulates the serverless architecture for development and testing before cloud deployment.

### Prerequisites

- Docker Desktop for Mac
- Node.js 18+ (for development)
- Your API keys from spot price providers

### 1. Initial Setup

```bash

# Navigate to Docker serverless directory

cd /Volumes/DATA/GitHub/rEngine/docker-serverless

# Copy environment template

cp .env.example .env

# Edit .env with your API keys

nano .env
```

### 2. Add Your API Keys

Edit `.env` file and add your provider API keys:

```bash

# Required: Get from https://metals.dev

METALS_DEV_API_KEY=your_actual_api_key_here

# Optional: Additional providers

METALS_API_KEY=your_metals_api_key_here
```

### 3. Start the Stack

```bash

# Build and start all services

docker-compose up --build

# Or run in background

docker-compose up -d --build
```

### 4. Access StackTrackr

- **Web App**: <http://localhost:3000>
- **API**: <http://localhost:3001/api/prices>
- **Health Check**: <http://localhost:3001/health>

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   StackTrackr   │    │   Nginx Proxy   │    │   Node.js API   │
│   Web App       │───▶│   (Port 3000)   │───▶│   (Port 3001)   │
│   (Static)      │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                       │
                       ┌─────────────────┐    ┌─────────────────┐
                       │     Redis       │    │   PostgreSQL    │
                       │   (Caching)     │◀───┤   (History)     │
                       │                 │    │                 │
                       └─────────────────┘    └─────────────────┘
                                                       ▲
                       ┌─────────────────┐             │
                       │ Price Fetcher   │─────────────┘
                       │   (Scheduler)   │
                       │                 │
                       └─────────────────┘
```

## 📊 Services Breakdown

### 1. **stacktrackr-web** (Port 3000)

- Serves your existing StackTrackr app
- Nginx proxy handles API routing
- Auto-detects serverless API availability

### 2. **stacktrackr-api** (Port 3001)

- RESTful API mimicking AWS Lambda functions
- Endpoints: `/api/prices`, `/api/proxy/:provider`, `/api/config`
- Express.js with Redis caching and PostgreSQL storage

### 3. **price-fetcher**

- Background service simulating CloudWatch scheduled functions
- Fetches prices every 5 minutes (configurable)
- Stores normalized data in PostgreSQL

### 4. **redis** (Port 6379)

- Caches API responses for 5 minutes
- Simulates AWS ElastiCache

### 5. **postgres** (Port 5432)

- Stores price history and metadata
- Simulates AWS RDS or Turso

## 🔧 API Endpoints

### Get Latest Prices

```bash
GET /api/prices?metal=gold&currency=USD&unit=toz&window=24h

Response:
{
  "metal": "gold",
  "currency": "USD", 
  "unit": "toz",
  "window": "24h",
  "latest": {
    "ts": "2025-08-16T20:15:00Z",
    "price": 2485.67,
    "ask": 2486.12,
    "bid": 2485.22,
    "provider": "metals.dev"
  },
  "series": [...],
  "count": 24
}
```

### Provider Proxy

```bash
GET /api/proxy/metals-dev?metal=silver&currency=EUR
```

### Health Check

```bash
GET /health

Response:
{
  "status": "healthy",
  "timestamp": "2025-08-16T20:15:00Z",
  "service": "stacktrackr-api"
}
```

## 🎯 StackTrackr Integration

The web app automatically detects the serverless API:

1. **Auto-Discovery**: Checks for API at <http://localhost:3001>
2. **Fallback**: Uses direct providers if API unavailable  
3. **Enhanced Features**: Shows "Enhanced API Active" when connected
4. **Caching**: 5-minute client-side cache for better performance

## 🛠️ Development Workflow

### View Logs

```bash

# All services

docker-compose logs -f

# Specific service

docker-compose logs -f stacktrackr-api
docker-compose logs -f price-fetcher
```

### Database Access

```bash

# Connect to PostgreSQL

docker-compose exec postgres psql -U stacktrackr -d stacktrackr_prices

# View price data

SELECT * FROM latest_prices LIMIT 10;
```

### Redis Cache

```bash

# Connect to Redis

docker-compose exec redis redis-cli

# View cached keys

KEYS prices:*
```

### Restart Services

```bash

# Restart API only

docker-compose restart stacktrackr-api

# Rebuild after code changes

docker-compose up --build stacktrackr-api
```

## 📈 Testing the Integration

1. **Start the stack**: `docker-compose up -d --build`
2. **Open StackTrackr**: <http://localhost:3000>
3. **Check for indicator**: Look for "Enhanced API Active" status
4. **Monitor logs**: `docker-compose logs -f price-fetcher`
5. **Verify data**: Check PostgreSQL for stored prices

## 🐛 Troubleshooting

### API Not Connecting

- Check `.env` file has valid API keys
- Verify services are running: `docker-compose ps`
- Check API logs: `docker-compose logs stacktrackr-api`

### No Price Data

- Ensure `METALS_DEV_API_KEY` is set correctly
- Check price-fetcher logs: `docker-compose logs price-fetcher`
- Verify database connection: `docker-compose exec postgres psql -U stacktrackr -d stacktrackr_prices -c "SELECT COUNT(*) FROM price_snapshots;"`

### Cache Issues

- Clear Redis: `docker-compose exec redis redis-cli FLUSHALL`
- Restart API: `docker-compose restart stacktrackr-api`

## 🚀 Next Steps

Once this local setup is working:

1. **Validate Architecture**: Confirm API patterns work with your workflow
2. **Test Provider Integration**: Add more providers to `/api/providers/`
3. **Cloud Migration**: Deploy to AWS Lambda or Cloudflare Workers
4. **Production Config**: Update endpoints and security settings

## 💰 Cost Benefits

**Local Development**: $0
**AWS Lambda (estimated)**: ~$5-15/month for Phase 1
**Cloudflare Workers**: ~$5/month

This Docker setup lets you validate everything works before paying for cloud resources!
