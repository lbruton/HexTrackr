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

// Initialize connections
const redisClient = redis.createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379"
});

const pgPool = new Pool({
  connectionString: process.env.POSTGRES_URL || 
    "postgresql://stacktrackr:dev_password_change_in_prod@localhost:5432/stacktrackr_prices"
});

// Provider modules
const metalsDevProvider = require("../providers/metals-dev");

class PriceFetcher {
  constructor() {
    this.providers = [metalsDevProvider];
    this.metals = ["gold", "silver", "platinum", "palladium"];
    this.currencies = ["USD", "EUR", "GBP"];
    this.isRunning = false;
  }

  async fetchAndStore() {
    if (this.isRunning) {
      logger.warn("Price fetch already in progress, skipping");
      return;
    }

    this.isRunning = true;
    logger.info("Starting price fetch cycle");

    try {
      for (const provider of this.providers) {
        for (const metal of this.metals) {
          for (const currency of this.currencies) {
            try {
              const priceData = await provider.fetchPrice(metal, currency);
              await this.storePriceData(priceData);
              
              // Add small delay to respect rate limits
              await new Promise(resolve => setTimeout(resolve, 100));
            } catch (error) {
              logger.error(`Error fetching ${metal}/${currency} from ${provider.name}:`, error.message);
            }
          }
        }
      }

      // Clear relevant cache keys
      await this.clearCache();
      
      logger.info("Price fetch cycle completed successfully");
    } catch (error) {
      logger.error("Price fetch cycle error:", error);
    } finally {
      this.isRunning = false;
    }
  }

  async storePriceData(data) {
    const query = `
      INSERT INTO price_snapshots (
        ts, metal, currency, unit, price, ask, bid, 
        high24h, low24h, change_amount, change_percent, 
        provider, source, raw_data
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14
      )
      ON CONFLICT (ts, metal, currency, unit, provider) 
      DO UPDATE SET
        price = EXCLUDED.price,
        ask = EXCLUDED.ask,
        bid = EXCLUDED.bid,
        high24h = EXCLUDED.high24h,
        low24h = EXCLUDED.low24h,
        change_amount = EXCLUDED.change_amount,
        change_percent = EXCLUDED.change_percent,
        raw_data = EXCLUDED.raw_data
    `;

    const values = [
      data.ts,
      data.metal,
      data.currency,
      data.unit,
      data.price,
      data.ask,
      data.bid,
      data.high24h,
      data.low24h,
      data.change,
      data.changePct,
      data.provider,
      data.source,
      JSON.stringify(data.raw)
    ];

    await pgPool.query(query, values);
    logger.info(`Stored price data: ${data.metal}/${data.currency} = ${data.price} (${data.provider})`);
  }

  async clearCache() {
    try {
      const keys = await redisClient.keys("prices:*");
      if (keys.length > 0) {
        await redisClient.del(keys);
        logger.info(`Cleared ${keys.length} cache keys`);
      }
    } catch (error) {
      logger.error("Error clearing cache:", error);
    }
  }

  async start() {
    try {
      // Connect to services
      await redisClient.connect();
      logger.info("Connected to Redis");

      await pgPool.query("SELECT NOW()");
      logger.info("Connected to PostgreSQL");

      // Initial fetch
      await this.fetchAndStore();

      // Schedule regular fetches
      const interval = parseInt(process.env.FETCH_INTERVAL) || 300000; // 5 minutes default
      setInterval(() => {
        this.fetchAndStore().catch(error => {
          logger.error("Scheduled fetch error:", error);
        });
      }, interval);

      logger.info(`Price fetcher started with ${interval}ms interval`);
    } catch (error) {
      logger.error("Failed to start price fetcher:", error);
      process.exit(1);
    }
  }

  async stop() {
    logger.info("Stopping price fetcher");
    await redisClient.quit();
    await pgPool.end();
  }
}

// Graceful shutdown
const fetcher = new PriceFetcher();

process.on("SIGTERM", async () => {
  logger.info("SIGTERM received, shutting down");
  await fetcher.stop();
  process.exit(0);
});

process.on("SIGINT", async () => {
  logger.info("SIGINT received, shutting down");
  await fetcher.stop();
  process.exit(0);
});

// Start the fetcher
if (require.main === module) {
  fetcher.start().catch(error => {
    logger.error("Failed to start fetcher:", error);
    process.exit(1);
  });
}
