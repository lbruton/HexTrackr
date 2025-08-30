const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { body, query, validationResult } = require("express-validator");
const redis = require("redis");
const { Pool } = require("pg");
const winston = require("winston");
require("dotenv").config();

// Setup logging
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Redis client
const redisClient = redis.createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379"
});

// PostgreSQL pool
const pgPool = new Pool({
  connectionString: process.env.POSTGRES_URL || 
    "postgresql://stacktrackr:dev_password_change_in_prod@localhost:5432/stacktrackr_prices"
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || ["http://localhost:3000", "file://"],
  credentials: true
}));
app.use(express.json({ limit: "10mb" }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: process.env.RATE_LIMIT || 60, // 60 requests per minute
  message: { error: "Too many requests, please try again later." }
});
app.use("/api/", limiter);

// Health check
app.get("/health", (req, res) => {
  res.json({ 
    status: "healthy", 
    timestamp: new Date().toISOString(),
    service: "stacktrackr-api"
  });
});

// Get latest prices
app.get("/api/prices", [
  query("metal").optional().isIn(["gold", "silver", "platinum", "palladium"]),
  query("currency").optional().isLength({ min: 3, max: 3 }),
  query("unit").optional().isIn(["toz", "g"]),
  query("window").optional().matches(/^(1h|6h|12h|24h|7d)$/)
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { metal = "gold", currency = "USD", unit = "toz", window = "24h" } = req.query;
    const cacheKey = `prices:${metal}:${currency}:${unit}:${window}`;

    // Try cache first
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      logger.info(`Cache hit for ${cacheKey}`);
      return res.json(JSON.parse(cached));
    }

    // Query database
    const query = `
      SELECT ts, metal, currency, unit, price, ask, bid, high24h, low24h, 
             change_amount, change_percent, provider, source
      FROM price_snapshots 
      WHERE metal = $1 AND currency = $2 AND unit = $3
        AND ts >= NOW() - INTERVAL '${window === "24h" ? "24 hours" : window}'
      ORDER BY ts DESC
      LIMIT 100
    `;

    const result = await pgPool.query(query, [metal, currency, unit]);
    
    const response = {
      metal,
      currency,
      unit,
      window,
      latest: result.rows[0] || null,
      series: result.rows,
      cached_at: new Date().toISOString(),
      count: result.rows.length
    };

    // Cache for 5 minutes
    await redisClient.setEx(cacheKey, 300, JSON.stringify(response));
    logger.info(`Database query executed for ${cacheKey}, cached result`);

    res.json(response);
  } catch (error) {
    logger.error("Error fetching prices:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Provider proxy endpoint
app.get("/api/proxy/:provider", [
  query("metal").isIn(["gold", "silver", "platinum", "palladium"]),
  query("currency").isLength({ min: 3, max: 3 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { provider } = req.params;
    const { metal, currency } = req.query;

    // Import provider modules
    const providerModule = require(`./providers/${provider}`);
    const result = await providerModule.fetchPrice(metal, currency);

    res.json(result);
  } catch (error) {
    logger.error(`Error proxying ${req.params.provider}:`, error);
    res.status(500).json({ error: "Provider error" });
  }
});

// Configuration endpoint (for admin)
app.post("/api/config", [
  body("providers").isObject(),
  body("cache.ttlSeconds").optional().isInt({ min: 60, max: 3600 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Store config in Redis
    await redisClient.setEx("config", 3600, JSON.stringify(req.body));
    logger.info("Configuration updated");

    res.json({ message: "Configuration updated successfully" });
  } catch (error) {
    logger.error("Error updating config:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  logger.error("Unhandled error:", error);
  res.status(500).json({ error: "Internal server error" });
});

// Initialize connections and start server
async function startServer() {
  try {
    // Connect to Redis
    await redisClient.connect();
    logger.info("Connected to Redis");

    // Test PostgreSQL connection
    await pgPool.query("SELECT NOW()");
    logger.info("Connected to PostgreSQL");

    // Start server
    app.listen(PORT, () => {
      logger.info(`StackTrackr API server running on port ${PORT}`);
    });
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on("SIGTERM", async () => {
  logger.info("SIGTERM received, shutting down gracefully");
  await redisClient.quit();
  await pgPool.end();
  process.exit(0);
});

if (require.main === module) {
  startServer();
}

module.exports = app;
