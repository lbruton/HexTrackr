const axios = require("axios");

class MetalsDevProvider {
  constructor() {
    this.name = "metals.dev";
    this.baseUrl = "https://api.metals.dev/v1";
    this.apiKey = process.env.METALS_DEV_API_KEY;
  }

  async fetchPrice(metal, currency = "USD") {
    if (!this.apiKey) {
      throw new Error("Metals.dev API key not configured");
    }

    try {
      const response = await axios.get(`${this.baseUrl}/spot`, {
        params: {
          metal: metal.toLowerCase(),
          currency: currency.toUpperCase()
        },
        headers: {
          "Authorization": `Bearer ${this.apiKey}`
        },
        timeout: 5000
      });

      const data = response.data;
      
      // Normalize to our schema
      return {
        ts: new Date().toISOString(),
        metal: metal.toLowerCase(),
        currency: currency.toUpperCase(),
        unit: "toz",
        price: data.price,
        ask: data.ask,
        bid: data.bid,
        high24h: data.high,
        low24h: data.low,
        change: data.change,
        changePct: data.change_percent,
        provider: this.name,
        source: "spot",
        raw: data
      };
    } catch (error) {
      throw new Error(`Metals.dev API error: ${error.message}`);
    }
  }

  async isHealthy() {
    try {
      await this.fetchPrice("gold", "USD");
      return true;
    } catch (error) {
      return false;
    }
  }
}

module.exports = new MetalsDevProvider();
